import { NextResponse } from "next/server";
// @ts-ignore
import Midtrans from "midtrans-client";
import { v4 as uuidv4 } from 'uuid';
import { createClient } from "@supabase/supabase-js";

// 1. Setup Admin Client (Buat Nulis ke Database - Pake Service Role)
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 🔥 UPDATE DISINI: GANTI JADI TRUE BIAR COCOK SAMA KUNCI PRODUCTION 🔥
const snap = new Midtrans.Snap({
    isProduction: true, // 👈 WAJIB TRUE!
    serverKey: process.env.MIDTRANS_SERVER_KEY,
    clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY
});

export async function POST(request: Request) {
    try {
        const { plan, price } = await request.json();

        // 🔍 CEK HEADER AUTHORIZATION
        const authHeader = request.headers.get('Authorization');
        
        if (!authHeader) {
            console.log("❌ Gagal: Header Authorization Kosong");
            return NextResponse.json({ error: "Wajib Login (Token Missing)!" }, { status: 401 });
        }

        // 🔥 JURUS BARU: BIKIN CLIENT KHUSUS BUAT USER INI 🔥
        const supabaseUser = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                global: {
                    headers: { Authorization: authHeader },
                },
            }
        );

        // Cek Usernya valid gak?
        const { data: { user }, error: userError } = await supabaseUser.auth.getUser();

        if (userError || !user) {
            console.log("❌ Gagal: Token Tidak Valid / Expired");
            return NextResponse.json({ error: "Wajib Login (Session Invalid)!" }, { status: 401 });
        }

        // 3. Bikin Order ID unik
        const orderId = `ORDER-${uuidv4()}`;

        // 4. TENTUKAN DURASI
        let duration = 1;
        if (plan.toLowerCase().includes('lifetime')) duration = 999;
        if (plan.toLowerCase().includes('year')) duration = 12;

        console.log(`📝 Mencatat Transaksi: ${orderId} untuk User: ${user.email}`);

        // 5. CATAT KE SUPABASE (Pake Admin Client biar tembus RLS)
        const { error: insertError } = await supabaseAdmin
            .from('transactions')
            .insert({
                user_id: user.id,
                order_id: orderId,
                amount: price,
                status: 'pending',
                plan_type: plan,
                duration_months: duration,
                payment_type: 'midtrans'
            });

        if (insertError) {
            console.error("❌ Gagal simpan ke DB:", insertError);
            return NextResponse.json({ error: "Database Error" }, { status: 500 });
        }

        // 6. Siapkan Parameter Midtrans
        const parameter = {
            transaction_details: {
                order_id: orderId,
                gross_amount: price
            },
            credit_card: { secure: true },
            customer_details: {
                email: user.email,
                first_name: user.user_metadata?.full_name || "Customer",
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
        
        console.log("✅ Token Midtrans Berhasil Dibuat");
        return NextResponse.json(token);

    } catch (error: any) {
        console.error("🔥 Error Payment API:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}