import { NextResponse } from "next/server";
// @ts-ignore
import Midtrans from "midtrans-client";
import { v4 as uuidv4 } from 'uuid';
import { createClient } from "@supabase/supabase-js";

// 1. Setup Supabase (Admin Mode biar bisa tulis ke tabel transactions)
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const snap = new Midtrans.Snap({
    isProduction: false,
    serverKey: process.env.MIDTRANS_SERVER_KEY,
    clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY
});

export async function POST(request: Request) {
    try {
        const { plan, price } = await request.json();

        // 2. CEK USERNYA SIAPA? (Wajib Login)
        // Kita ambil user dari token Auth yang dikirim browser
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        
        // Ambil header otorisasi dari request
        const authHeader = request.headers.get('Authorization');
        if (authHeader) {
            // Set session manual biar supabase tau ini user siapa
            await supabase.auth.setSession({
                access_token: authHeader.replace('Bearer ', ''),
                refresh_token: '',
            });
        }
        
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Wajib Login!" }, { status: 401 });
        }

        // 3. Bikin Order ID unik
        const orderId = `ORDER-${uuidv4()}`;

        // 4. TENTUKAN DURASI (Penting buat Auto-Upgrade)
        // Kalau paket Lifetime (999), kalau bulanan (1)
        let duration = 1;
        if (plan.toLowerCase().includes('lifetime')) duration = 999;
        if (plan.toLowerCase().includes('year')) duration = 12;

        console.log(`📝 Mencatat Transaksi: ${orderId} untuk User: ${user.id}`);

        // 🔥 5. CATAT KE SUPABASE DULU! (INI YANG KEMAREN HILANG) 🔥
        const { error: insertError } = await supabaseAdmin
            .from('transactions')
            .insert({
                user_id: user.id,          // PENTING: ID User yang beli
                order_id: orderId,         // PENTING: Kunci buat dicocokin sama Webhook
                amount: price,
                status: 'pending',         // Status awal
                plan_type: plan,           // Paket apa? (pro/basic)
                duration_months: duration, // Berapa lama?
                payment_type: 'midtrans'
            });

        if (insertError) {
            console.error("❌ Gagal simpan ke DB:", insertError);
            return NextResponse.json({ error: "Database Error" }, { status: 500 });
        }

        // 6. Siapkan Parameter Midtrans
        const parameter = {
            transaction_details: {
                order_id: orderId, // HARUS SAMA DENGAN YANG DI DB
                gross_amount: price
            },
            credit_card: { secure: true },
            customer_details: {
                email: user.email, // Opsional: Biar di Midtrans ada emailnya
            },
            item_details: [{
                id: plan,
                price: price,
                quantity: 1,
                name: `Upgrade Paket ${plan}`
            }]
        };

        // 7. Minta Token Transaksi
        const token = await snap.createTransaction(parameter);
        
        console.log("✅ Token Midtrans Berhasil:", token);
        return NextResponse.json(token);

    } catch (error: any) {
        console.error("🔥 Error Payment API:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}