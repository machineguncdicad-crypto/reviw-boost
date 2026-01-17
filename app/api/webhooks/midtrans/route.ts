import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Setup Admin Client (Wajib pake Service Role biar bisa edit data user lain)
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
    try {
        const json = await request.json();
        
        // Data dari Midtrans
        const status = json.transaction_status;
        const fraud = json.fraud_status;
        const orderId = json.order_id;

        console.log(`🔔 Webhook Masuk: Order ${orderId} | Status: ${status}`);

        // 1. Tentukan Status Transaksi
        let paymentStatus = "";
        if (status === 'capture') {
            if (fraud === 'challenge') {
                paymentStatus = 'challenge';
            } else if (fraud === 'accept') {
                paymentStatus = 'paid';
            }
        } else if (status === 'settlement') {
            paymentStatus = 'paid';
        } else if (status === 'cancel' || status === 'deny' || status === 'expire') {
            paymentStatus = 'failed';
        } else if (status === 'pending') {
            paymentStatus = 'pending';
        }

        // 2. Kalau statusnya PAID, kita eksekusi Logic Upgrade
        if (paymentStatus === 'paid') {
            
            // A. Ambil data transaksi dari database kita
            const { data: trx, error: trxError } = await supabaseAdmin
                .from('transactions')
                .select('*')
                .eq('order_id', orderId)
                .single();

            if (trxError || !trx) {
                console.error("❌ Transaksi tidak ditemukan di DB lokal!");
                return NextResponse.json({ message: "Transaction not found" }, { status: 404 });
            }

            // Cek apakah sudah diproses sebelumnya? (Biar gak double)
            if (trx.status === 'paid') {
                console.log("⚠️ Transaksi ini sudah lunas sebelumnya.");
                return NextResponse.json({ message: "Already paid" });
            }

            // B. UPDATE STATUS TRANSAKSI JADI PAID
            await supabaseAdmin
                .from('transactions')
                .update({ 
                    status: 'paid', 
                    payment_type: json.payment_type,
                    updated_at: new Date().toISOString()
                })
                .eq('id', trx.id);

            // C. HITUNG TANGGAL KADALUARSA (Durasi Langganan)
            const duration = trx.duration_months || 1;
            const endDate = new Date();
            
            if (duration > 100) {
                // Kalau Lifetime (misal 999 bulan), set 100 tahun
                endDate.setFullYear(endDate.getFullYear() + 100);
            } else {
                // Kalau bulanan/tahunan
                endDate.setMonth(endDate.getMonth() + duration);
            }

            // D. 🔥 UPDATE PROFIL USER JADI PRO! 🔥
            const { error: profileError } = await supabaseAdmin
                .from('profiles')
                .update({
                    tier_name: trx.plan_type, // 'PRO' atau 'ENTERPRISE'
                    subscription_status: 'active',
                    subscription_end_date: endDate.toISOString(),
                    updated_at: new Date().toISOString()
                })
                .eq('id', trx.user_id);

            if (profileError) {
                console.error("❌ Gagal update profil user:", profileError);
                return NextResponse.json({ message: "Profile update failed" }, { status: 500 });
            }

            console.log(`✅ SUKSES! User ${trx.user_id} di-upgrade ke ${trx.plan_type}`);
        } else if (paymentStatus === 'failed') {
            // Kalau gagal, cuma update status transaksi aja
            await supabaseAdmin
                .from('transactions')
                .update({ status: 'failed', updated_at: new Date().toISOString() })
                .eq('order_id', orderId);
            
            console.log("❌ Pembayaran Gagal/Expired");
        }

        return NextResponse.json({ message: "OK" });

    } catch (error: any) {
        console.error("🔥 Webhook Error:", error.message);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}