import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    console.log("⏰ [DYNAMIC] REQUEST MASUK: " + new Date().toISOString());

    const body = await request.json();
    const { rating, comment, brand_name, customer_name, phone, owner_id } = body; // <--- INI YG PENTING
    const APP_ID = "04a3fe92-3998-48ed-982c-50d74ad2e822";

    // 🕵️‍♂️ CCTV DATA: KITA CEK APAKAH ID PEMILIK ADA?
    console.log("=================================");
    console.log("👤 Customer:", customer_name);
    console.log("🏢 Brand:", brand_name);
    console.log("🆔 OWNER ID (TARGET):", owner_id); // <--- Liat ini di log nanti!
    console.log("=================================");

    // 🛑 VALIDASI: KALAU OWNER ID KOSONG, JANGAN KIRIM KE ONESIGNAL
    if (!owner_id) {
        console.error("❌ GAGAL: Owner ID tidak dikirim oleh Frontend!");
        // Kita return sukses palsu biar user gak liat error, tapi kita catat di log
        return NextResponse.json({ success: false, message: "Owner ID missing" }, { status: 200 });
    }

    // 🛠️ HEADER KHUSUS KUNCI V2 (YANG UDAH TERBUKTI SUKSES)
    const headers = {
      'accept': 'application/json',
      'content-type': 'application/json',
      'Authorization': 'Key os_v2_app_asr75erztbeo3gbmkdluvuxielkngps2un7ek2f2hyy3vm2wvka74u22ixxguulv7beijnupnqnliegy3xu4bt3dldzjrytqhvz6xwq'
    };

    const isHappy = rating >= 4;
    const title = isHappy 
        ? `⭐ Review Bintang ${rating} di ${brand_name}!` 
        : `⚠️ Komplain Bintang ${rating} di ${brand_name}`;
    
    const messageContent = `👤 ${customer_name || 'Anonim'} (${phone || '-'})
💬 "${comment || 'Tidak ada komentar'}"`;

    const options = {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        app_id: APP_ID,
        // 👇 KITA KIRIM KE ID DINAMIS (SESUAI PEMILIK TOKO)
        include_aliases: { 
            external_id: [owner_id] 
        },
        target_channel: "push",
        headings: { en: title },
        contents: { en: messageContent }
      })
    };

    const response = await fetch('https://api.onesignal.com/notifications', options);
    const responseData = await response.json();

    console.log("✅ STATUS ONE SIGNAL:", response.status);
    
    // Kalau error, kita log detailnya
    if (response.status !== 200) {
        console.error("📄 ERROR DETAIL:", JSON.stringify(responseData));
        return NextResponse.json({ success: false, error: responseData }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: responseData });

  } catch (error: any) {
    console.error("❌ CRASH:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}