import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Mengambil kunci rahasia dari .env
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(req: Request) {
  try {
    // Gunakan Service Key biar bisa edit database user lain (Admin Mode)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const notification = await req.json();

    // 1. AMBIL DATA DARI LAPORAN MIDTRANS
    const orderId = notification.order_id;
    const transactionStatus = notification.transaction_status;
    const fraudStatus = notification.fraud_status;

    console.log(`💰 Payment Webhook Masuk: ${orderId} | Status: ${transactionStatus}`);

    // 2. TERJEMAHKAN STATUS MIDTRANS KE BAHASA KITA
    let paymentStatus = "pending";
    if (transactionStatus == "capture") {
      if (fraudStatus == "challenge") paymentStatus = "challenge";
      else if (fraudStatus == "accept") paymentStatus = "paid";
    } else if (transactionStatus == "settlement") {
      paymentStatus = "paid"; // <--- INI ARTINYA DUIT UDAH MASUK (LUNAS)
    } else if (
      transactionStatus == "cancel" ||
      transactionStatus == "deny" ||
      transactionStatus == "expire"
    ) {
      paymentStatus = "failed";
    }

    // 3. UPDATE STATUS DI TABEL TRANSAKSI
    // Kita cari transaksi berdasarkan order_id, lalu update statusnya.
    // Sekalian kita ambil info: Siapa usernya? Paket apa yang dia beli?
    const { data: trxData, error: fetchError } = await supabaseAdmin
      .from("transactions")
      .update({ 
        status: paymentStatus, 
        updated_at: new Date().toISOString(),
        payment_type: notification.payment_type
      })
      .eq("order_id", orderId)
      .select("user_id, plan_type, duration_months") // Penting: Ambil info paket
      .single();

    if (fetchError || !trxData) {
      console.log("❌ Transaksi tidak ditemukan di Database:", orderId);
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    // 🔥 4. AUTO UPGRADE USER (HANYA JIKA LUNAS) 🔥
    if (paymentStatus === "paid") {
      
      const currentDate = new Date();
      const expiryDate = new Date();

      // Cek durasi paket (Default 1 bulan kalau error)
      const duration = trxData.duration_months || 1; 
      
      if (duration === 999) {
          // Kalau kode 999 berarti LIFETIME -> Set tanggal sampe tahun 2099
          expiryDate.setFullYear(2099);
      } else {
          // Kalau bulanan -> Tambah bulan sesuai durasi
          expiryDate.setMonth(currentDate.getMonth() + duration);
      }

      // Update Profil User Jadi PRO
      const { error: upgradeError } = await supabaseAdmin
        .from("profiles")
        .update({
          subscription_status: trxData.plan_type || "pro", // jadi 'pro' atau 'basic'
          subscription_end_date: expiryDate.toISOString()
        })
        .eq("id", trxData.user_id);
        
      if (upgradeError) {
        console.error("❌ Gagal Upgrade Profil User:", upgradeError);
      } else {
        console.log(`✅ SUKSES! User ${trxData.user_id} jadi ${trxData.plan_type} sampai ${expiryDate.toISOString()}`);
      }
    }

    return NextResponse.json({ status: "OK" });

  } catch (err) {
    console.error("❌ Webhook Error:", err);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}