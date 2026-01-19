import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { rating, comment, brand_name, customer_name, phone, owner_id } = body;

    // 👇 KUNCI MODEL BARU (Rich API Key)
    // Pastikan ini kunci panjang yang depannya 'os_v2_...'
    const API_KEY = "os_v2_app_asr75erztbeo3gbmkdluvuxiejcygzs7e2qu5veq3dinnympqb2g3u46kzchgxg5do5wwj727iggvktscgnqfbmlpextdoixayulf5a"; 
    
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
        // 👇 PERUBAHAN PENTING 1:
        // Pake 'Key' bukan 'Basic' karena ini kunci os_v2
        Authorization: `Key ${API_KEY}`, 
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        app_id: APP_ID,
        
        // 👇 PERUBAHAN PENTING 2:
        // Pake 'include_aliases' buat nembak External ID
        include_aliases: {
            external_id: [owner_id]
        },
        target_channel: "push",
        
        headings: { en: title },
        contents: { en: messageContent }
      })
    };

    // 👇 PERUBAHAN PENTING 3:
    // Pake URL Baru 'api.onesignal.com' (Bukan 'onesignal.com/api/v1')
    const response = await fetch('https://api.onesignal.com/notifications', options);
    
    const responseData = await response.json();

    console.log("✅ RESPON SERVER:", responseData);
    
    if (responseData.errors) {
        return NextResponse.json({ success: false, error: responseData.errors }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: responseData });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}