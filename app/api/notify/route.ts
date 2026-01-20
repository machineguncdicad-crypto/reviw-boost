import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { rating, comment, brand_name, customer_name, phone, owner_id } = body;

    // 👇 INI KUNCI SAKTI (DARI SCRIPT TEST TADI)
    const API_KEY = "os_v2_app_asr75erztbeo3gbmkdluvuxielkngps2un7ek2f2hyy3vm2wvka74u22ixxguulv7beijnupnqnliegy3xu4bt3dldzjrytqhvz6xwq"; 
    
    const APP_ID = "04a3fe92-3998-48ed-982c-50d74ad2e822";

    console.log("🔔 [V2] KIRIM NOTIF KE:", owner_id);

    // Siapkan Konten
    const isHappy = rating >= 4;
    const title = isHappy 
        ? `⭐ Review Bintang ${rating} di ${brand_name}!` 
        : `⚠️ Komplain Bintang ${rating} di ${brand_name}`;
    
    const messageContent = `👤 ${customer_name || 'Anonim'} (${phone || '-'})
💬 "${comment || 'Tidak ada komentar'}"`;

    const options = {
      method: 'POST',
      headers: {
        accept: 'application/json',
        // ✅ HEADER WAJIB BUAT KUNCI V2 (Sama kayak script test)
        Authorization: `Key ${API_KEY}`, 
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        app_id: APP_ID,
        
        // ✅ TARGETING CARA BARU (Sama kayak script test)
        include_aliases: {
            external_id: [owner_id]
        },
        target_channel: "push",
        
        headings: { en: title },
        contents: { en: messageContent }
      })
    };

    // ✅ URL WAJIB BUAT KUNCI V2
    const response = await fetch('https://api.onesignal.com/notifications', options);
    const responseData = await response.json();

    console.log("✅ STATUS RESPON:", response.status); // Harusnya 200
    console.log("📄 DATA RESPON:", JSON.stringify(responseData));
    
    // Kita anggap sukses kalau status 200, meskipun ada error targeting (biar gak 500 di frontend)
    if (response.status !== 200) {
        return NextResponse.json({ success: false, error: responseData.errors }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: responseData });

  } catch (error: any) {
    console.error("❌ SERVER ERROR:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}