import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createHash } from "crypto";

// Setup Admin Client (Biar punya hak akses full nembus database)
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Gatekeeper 1: Verifikasi bahwa notifikasi beneran dari server Midtrans
 */
function verifyMidtransSignature(
    orderId: string,
    statusCode: string,
    grossAmount: string,
    signatureKey: string
): boolean {
    const serverKey = process.env.MIDTRANS_SERVER_KEY!;
    const rawString = `${orderId}${statusCode}${grossAmount}${serverKey}`;
    const expectedSignature = createHash("sha512").update(rawString).digest("hex");
    return expectedSignature === signatureKey;
}

export async function POST(request: Request) {
    try {
        const json = await request.json();

        // === STEP 1: VERIFIKASI SIGNATURE ===
        const isValid = verifyMidtransSignature(
            json.order_id,
            json.status_code,
            json.gross_amount,
            json.signature_key
        );

        if (!isValid) {
            console.warn("🚨 WEBHOOK DITOLAK: Signature Midtrans Palsu!", json.order_id);
            return NextResponse.json({ message: "Invalid signature" }, { status: 403 });
        }

        // === STEP 2: TENTUKAN STATUS TRANSAKSI ===
        const status = json.transaction_status;
        const fraud = json.fraud_status;
        const orderId = json.order_id;

        console.log(`🔔 Webhook Masuk: Order ${orderId} | Status: ${status}`);

        let paymentStatus = "";
        if (status === 'capture') {
            paymentStatus = fraud === 'accept' ? 'paid' : 'challenge';
        } else if (status === 'settlement') {
            paymentStatus = 'paid';
        } else if (['cancel', 'deny', 'expire'].includes(status)) {
            paymentStatus = 'failed';
        } else if (status === 'pending') {
            paymentStatus = 'pending';
        }

        // === STEP 3: PROSES JIKA LUNAS ===
        if (paymentStatus === 'paid') {

            // 1. Cari transaksi di Database kita
            const { data: trx, error: trxError } = await supabaseAdmin
                .from('transactions')
                .select('*')
                .eq('order_id', orderId)
                .single();

            if (trxError || !trx) {
                console.error("❌ Transaksi tidak ditemukan di DB:", orderId);
                return NextResponse.json({ message: "Transaction not found" }, { status: 404 });
            }

            // 2. Cegah Proses Ganda (Idempotency)
            if (trx.status === 'paid') {
                console.log("⚠️ Transaksi ini sudah pernah diproses lunas:", orderId);
                return NextResponse.json({ message: "Already paid" });
            }

            // 🔥 GATEKEEPER 2: VALIDASI HARGA (Anti Hacker Diskon) 🔥
            // Pastikan jumlah yang dibayar di Midtrans SAMA PERSIS dengan tagihan di DB kita.
            const amountPaid = parseFloat(json.gross_amount);
            if (amountPaid !== trx.amount) {
                console.error(`🚨 INDIKASI KECURANGAN! Order: ${orderId} | Bayar: Rp${amountPaid} | Seharusnya: Rp${trx.amount}`);
                
                // Tandai sebagai penipuan di DB kita, biar gak dikasih paket PRO
                await supabaseAdmin
                    .from('transactions')
                    .update({ status: 'fraud', updated_at: new Date().toISOString() })
                    .eq('id', trx.id);
                    
                return NextResponse.json({ message: "Amount mismatch / Fraud" }, { status: 400 });
            }

            // 3. Ambil data profil user untuk cek sisa masa aktif langganan saat ini
            const { data: profile } = await supabaseAdmin
                .from('profiles')
                .select('subscription_end_date')
                .eq('id', trx.user_id)
                .single();

            // 🔥 LOGIKA PERPANJANGAN AKUMULASI (Anti Bikin Rugi Pelanggan) 🔥
            const duration = trx.duration_months || 1;
            let currentEndDate = new Date(); // Hari ini
            
            // Kalau user masih punya sisa masa aktif, kita tambahin harinya dari sisa tersebut
            if (profile && profile.subscription_end_date) {
                const existingDate = new Date(profile.subscription_end_date);
                if (existingDate > currentEndDate) {
                    currentEndDate = existingDate; // Mulai hitung dari tanggal kedaluwarsa yang lama
                }
            }

            // Tambahkan durasi bulan/tahun
            if (duration > 100) {
                currentEndDate.setFullYear(currentEndDate.getFullYear() + 100); // Paket Lifetime/Enterprise Sultan
            } else {
                currentEndDate.setMonth(currentEndDate.getMonth() + duration);
            }

            // 4. Update status transaksi jadi Paid
            await supabaseAdmin
                .from('transactions')
                .update({
                    status: 'paid',
                    payment_type: json.payment_type,
                    updated_at: new Date().toISOString()
                })
                .eq('id', trx.id);

            // 5. Berikan Hak Akses (Upgrade Profil User)
            const { error: profileError } = await supabaseAdmin
                .from('profiles')
                .update({
                    tier_name: trx.plan_type,
                    subscription_status: 'active',
                    subscription_end_date: currentEndDate.toISOString(),
                    updated_at: new Date().toISOString()
                })
                .eq('id', trx.user_id);

            if (profileError) {
                console.error("❌ Gagal upgrade profil user:", profileError);
                return NextResponse.json({ message: "Profile update failed" }, { status: 500 });
            }

            console.log(`✅ SUKSES CAIR! Uang masuk dari User ${trx.user_id}. Paket ${trx.plan_type} aktif s/d ${currentEndDate.toISOString()}`);

        } 
        // === PROSES JIKA GAGAL/EXPIRED ===
        else if (paymentStatus === 'failed') {
            await supabaseAdmin
                .from('transactions')
                .update({ status: 'failed', updated_at: new Date().toISOString() })
                .eq('order_id', orderId);
            console.log("❌ Pembayaran Dibatalkan / Gagal:", orderId);
        }

        // Harus selalu balas OK ke Midtrans biar dia gak ngirim webhook berulang-ulang
        return NextResponse.json({ message: "OK" });

    } catch (error: any) {
        console.error("🔥 Webhook Server Error:", error.message);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}