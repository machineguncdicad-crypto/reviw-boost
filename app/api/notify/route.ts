import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { rating, comment, brand_name, customer_name, phone, owner_id } = body;

    // 👇 INI KUNCI SAKTI YANG UDAH TERBUKTI SUKSES DI TERMINAL TADI
    const API_KEY = "os_v2_app_asr75erztbeo3gbmkdluvuxielkngps2un7ek2f2hyy3vm2wvka74u22ixxguulv7beijnupnqnliegy3xu4bt3dldzjrytqhvz6xwq"; 
    
    // 👇 KITA PASANG CCTV DISINI (LIAT LOG NANTI)
    console.log("========================================");
    console.log("🕵️‍♂️ CEK KUNCI YANG DIPAKE VERCEL:");
    console.log("🔑 KUNCI: " + API_KEY.substring(0, 15) + "..."); // Kita intip 15 huruf awal
    console.log("========================================");

    const APP_ID = "04a3fe92-3998-48ed-982c-50d74ad2e822";
    
    // LOGIKA TITLE & MESSAGE
    const isHappy = rating >= 4;
    const title = isHappy 
        ? `⭐ Review Bintang ${rating} di ${brand_name}!` 
        : `⚠️ Komplain Bintang ${rating} di ${brand_name}`;
    
    const messageContent = `👤 ${customer_name || 'Anonim'} (${phone || '-'})
💬 "${comment || 'Tidak ada komentar'}"`;

    // PAKET PENGIRIMAN (LOGIKA V2)
    const options = {
      method: 'POST',
      headers: {
        accept: 'application/json',
        // ⚠️ WAJIB PAKE 'Key' (BUKAN Basic)
        Authorization: `Key ${API_KEY}`, 
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        app_id: APP_ID,
        include_aliases: { external_id: [owner_id] },
        target_channel: "push",
        headings: { en: title },
        contents: { en: messageContent }
      })
    };

    // TEMBAK KE URL BARU
    const response = await fetch('https://api.onesignal.com/notifications', options);
    const responseData = await response.json();

    console.log("✅ STATUS RESPON:", response.status); 
    console.log("📄 DATA RESPON:", JSON.stringify(responseData));
    
    if (response.status !== 200) {
        // Kalau error, kita balikin errornya biar kebaca di frontend juga
        return NextResponse.json({ success: false, error: responseData.errors }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: responseData });

  } catch (error: any) {
    console.error("❌ SERVER ERROR:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}