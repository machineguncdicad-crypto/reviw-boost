import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { rating, comment, brand_name, customer_name, phone, owner_id } = body;

    // 👇 INI KUNCI SAKTI YANG BARUSAN MUNCUL DI LAYAR LU
    const API_KEY = "os_v2_app_asr7serztbeo3gbmkdluvuixeje7t2e3m24ruuomhhzsorkwd4ynnxyfxh4srmci5itrcjoyczcmsv4xnodl7guy41qxe24633cqivty"; 
    
    // 👇 INI APP ID BARU (REVIEWBOOST LIVE)
    const APP_ID = "04a3fe92-3998-48ed-982c-50d74ad2e822";

    console.log("🔔 KIRIM NOTIF KE:", owner_id);

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
        // Kita coba pakai Basic dulu sesuai standar
        Authorization: `Basic ${API_KEY}`, 
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        app_id: APP_ID,
        include_external_user_ids: [owner_id], 
        headings: { en: title },
        contents: { en: messageContent }
      })
    };

    const response = await fetch('https://onesignal.com/api/v1/notifications', options);
    const responseData = await response.json();

    console.log("✅ STATUS:", responseData);
    return NextResponse.json({ success: true, data: responseData });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}