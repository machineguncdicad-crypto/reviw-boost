import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// ⚠️ PENTING: Pake SERVICE_ROLE_KEY biar bisa edit data user siapapun
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! 
);

export async function POST(req: Request) {
  try {
    const notification = await req.json();

    // 1. AMBIL DATA DARI MIDTRANS
    const orderId = notification.order_id;
    const transactionStatus = notification.transaction_status;
    const fraudStatus = notification.fraud_status;

    console.log(`🔔 Notif Masuk: ${orderId} | Status: ${transactionStatus}`);

    // 2. TENTUKAN STATUS PEMBAYARAN (Lunas/Gagal)
    let paymentStatus = "pending";
    if (transactionStatus == "capture") {
      if (fraudStatus == "challenge") paymentStatus = "challenge";
      else if (fraudStatus == "accept") paymentStatus = "paid";
    } else if (transactionStatus == "settlement") {
      paymentStatus = "paid"; // <--- INI STATUS YANG KITA CARI (LUNAS)
    } else if (
      transactionStatus == "cancel" ||
      transactionStatus == "deny" ||
      transactionStatus == "expire"
    ) {
      paymentStatus = "failed";
    }

    // 3. CARI TRANSAKSI INI PUNYA SIAPA? (Cek tabel transactions)
    // Kita update dulu status di tabel transactions jadi 'paid'
    const { data: trxData, error } = await supabaseAdmin
      .from("transactions")
      .update({ status: paymentStatus })
      .eq("order_id", orderId)
      .select("user_id") // Kita butuh User ID nya
      .single();

    // Kalau transaksi gak ketemu, stop disini.
    if (error || !trxData) {
        console.log("❌ Transaksi tidak ditemukan:", orderId);
        return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    // 🔥 4. BAGIAN UTAMA: AUTO UPGRADE & SET TANGGAL 🔥
    // Kalau statusnya 'paid' (Lunas), jalankan logika ini:
    if (paymentStatus === "paid") {
        
        // A. HITUNG TANGGAL BERAKHIR (DURASI)
        const currentDate = new Date();
        const expiryDate = new Date();
        
        // Tambah 30 Hari dari hari ini (Sesuaikan: mau 30, 365, dll)
        expiryDate.setDate(currentDate.getDate() + 30); 

        // B. UPDATE PROFIL USER (Ubah Pangkat & Tanggal)
        const { error: upgradeError } = await supabaseAdmin
            .from("profiles")
            .update({
                subscription_plan: "pro", // <--- UBAH JADI PRO/BASIC
                subscription_end_date: expiryDate.toISOString() // <--- SET TANGGAL HABIS
            })
            .eq("id", trxData.user_id); // Target user yang bayar tadi
            
        if (upgradeError) {
            console.error("❌ Gagal Upgrade User:", upgradeError);
        } else {
            console.log(`✅ User ${trxData.user_id} BERHASIL DI-UPGRADE SAMPAI ${expiryDate.toISOString()}`);
        }
    }

    return NextResponse.json({ status: "OK" });

  } catch (err) {
    console.error("❌ Error System:", err);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}