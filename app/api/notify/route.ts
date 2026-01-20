import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { rating, comment, brand_name, customer_name, phone, owner_id } = body;
    const APP_ID = "04a3fe92-3998-48ed-982c-50d74ad2e822";

    // 🔍 KITA BUAT HEADER SECARA MANUAL
    const headers = {
      'accept': 'application/json',
      'content-type': 'application/json',
      // 👇 HARDCODE LANGSUNG (JANGAN PAKE VARIABEL)
      'Authorization': 'Key os_v2_app_asr75erztbeo3gbmkdluvuxielkngps2un7ek2f2hyy3vm2wvka74u22ixxguulv7beijnupnqnliegy3xu4bt3dldzjrytqhvz6xwq'
    };

    // 🕵️‍♂️ CCTV: KITA LIAT APA YANG SEBENARNYA DIKIRIM VERCEL
    console.log("=================================");
    console.log("🚀 MAU KIRIM REQUEST KE ONESIGNAL");
    console.log("📨 URL: https://api.onesignal.com/notifications");
    console.log("📨 HEADERS YANG DIKIRIM:", JSON.stringify(headers)); // <--- INI PENTING
    console.log("=================================");

    const isHappy = rating >= 4;
    const title = isHappy 
        ? `⭐ Review Bintang ${rating} di ${brand_name}!` 
        : `⚠️ Komplain Bintang ${rating} di ${brand_name}`;
    
    const messageContent = `👤 ${customer_name || 'Anonim'} (${phone || '-'})
💬 "${comment || 'Tidak ada komentar'}"`;

    const options = {
      method: 'POST',
      headers: headers, // Pake object headers yang udah kita log
      body: JSON.stringify({
        app_id: APP_ID,
        include_aliases: { external_id: [owner_id] },
        target_channel: "push",
        headings: { en: title },
        contents: { en: messageContent }
      })
    };

    const response = await fetch('https://api.onesignal.com/notifications', options);
    const responseData = await response.json();

    console.log("✅ STATUS RESPON:", response.status); 
    console.log("📄 DATA RESPON:", JSON.stringify(responseData));
    
    if (response.status !== 200) {
        return NextResponse.json({ success: false, error: responseData.errors }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: responseData });

  } catch (error: any) {
    console.error("❌ SERVER ERROR:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}