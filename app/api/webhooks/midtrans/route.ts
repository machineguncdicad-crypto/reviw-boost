import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createHash } from "crypto"; // Built-in Node.js, gak perlu install

// Setup Admin Client
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Verifikasi bahwa notifikasi beneran dari Midtrans, bukan dari hacker.
 * Rumus: SHA512(order_id + status_code + gross_amount + server_key)
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

        // === STEP 1: VERIFIKASI SIGNATURE (GATEKEEPER UTAMA) ===
        const isValid = verifyMidtransSignature(
            json.order_id,
            json.status_code,
            json.gross_amount,
            json.signature_key
        );

        if (!isValid) {
            // Tolak request kalau signature gak cocok
            console.warn("🚨 WEBHOOK DITOLAK: Signature tidak valid!", json.order_id);
            return NextResponse.json({ message: "Invalid signature" }, { status: 403 });
        }

        // === STEP 2: TENTUKAN STATUS TRANSAKSI ===
        const status = json.transaction_status;
        const fraud = json.fraud_status;
        const orderId = json.order_id;

        console.log(`🔔 Webhook Verified: Order ${orderId} | Status: ${status}`);

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

        // === STEP 3: PROSES KALAU PAID ===
        if (paymentStatus === 'paid') {

            // Ambil data transaksi dari DB
            const { data: trx, error: trxError } = await supabaseAdmin
                .from('transactions')
                .select('*')
                .eq('order_id', orderId)
                .single();

            if (trxError || !trx) {
                console.error("❌ Transaksi tidak ditemukan:", orderId);
                return NextResponse.json({ message: "Transaction not found" }, { status: 404 });
            }

            // Cegah double processing
            if (trx.status === 'paid') {
                console.log("⚠️ Transaksi sudah diproses sebelumnya:", orderId);
                return NextResponse.json({ message: "Already paid" });
            }

            // Update status transaksi
            await supabaseAdmin
                .from('transactions')
                .update({
                    status: 'paid',
                    payment_type: json.payment_type,
                    updated_at: new Date().toISOString()
                })
                .eq('id', trx.id);

            // Hitung tanggal kadaluarsa
            const duration = trx.duration_months || 1;
            const endDate = new Date();
            if (duration > 100) {
                endDate.setFullYear(endDate.getFullYear() + 100); // Lifetime
            } else {
                endDate.setMonth(endDate.getMonth() + duration);
            }

            // Upgrade profil user
            const { error: profileError } = await supabaseAdmin
                .from('profiles')
                .update({
                    tier_name: trx.plan_type,
                    subscription_status: 'active',
                    subscription_end_date: endDate.toISOString(),
                    updated_at: new Date().toISOString()
                })
                .eq('id', trx.user_id);

            if (profileError) {
                console.error("❌ Gagal upgrade profil:", profileError);
                return NextResponse.json({ message: "Profile update failed" }, { status: 500 });
            }

            console.log(`✅ SUKSES! User ${trx.user_id} → ${trx.plan_type} s/d ${endDate.toISOString()}`);

        } else if (paymentStatus === 'failed') {
            await supabaseAdmin
                .from('transactions')
                .update({ status: 'failed', updated_at: new Date().toISOString() })
                .eq('order_id', orderId);

            console.log("❌ Pembayaran Gagal:", orderId);
        }

        return NextResponse.json({ message: "OK" });

    } catch (error: any) {
        console.error("🔥 Webhook Error:", error.message);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}