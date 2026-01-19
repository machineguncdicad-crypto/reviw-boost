import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { rating, comment, brand_name, customer_name, phone, owner_id } = body;

    // 👇 KUNCI BARU LU (DARI DASHBOARD APP)
    const API_KEY = "os_v2_app_asr75erztbeo3gbmkdluvuxieiisz5apukpe7r4kgrvd4yspgk2tiqax4hibfme35kbu4oh5oymgj4k7qv6yswc2scfnaoauefjkfei"; 
    
    // APP ID (ReviewBoost Live)
    const APP_ID = "04a3fe92-3998-48ed-982c-50d74ad2e822";

    console.log("🔔 NOTIF OTW KE:", owner_id);

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
        // 👇 PERHATIKAN: PAKE 'Bearer' KARENA KUNCI 'os_v2...'
        Authorization: `Bearer ${API_KEY}`, 
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