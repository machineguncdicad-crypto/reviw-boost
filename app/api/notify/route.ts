import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { rating, comment, brand_name, customer_name, phone, owner_id } = body;

    // 👇 KUNCI BARU LU (Fix Banget)
    const API_KEY = "os_v2_app_asr75erztbeo3gbmkdluvuxiei4kgxftevaekieuxhqabprbsaj5ws4lfwbumex43mpohxzrnpkd7c7xnmotif36xuaqbhftr6rhbzq"; 
    
    // APP ID REVIEWBOOST LIVE
    const APP_ID = "04a3fe92-3998-48ed-982c-50d74ad2e822";

    console.log("🔔 NOTIF OTW KE:", owner_id);

    const isHappy = rating >= 4;
    const title = isHappy 
        ? `⭐ Review Bintang ${rating} di ${brand_name}!` 
        : `⚠️ Komplain Bintang ${rating} di ${brand_name}`;
    
    const messageContent = `👤 ${customer_name || 'Anonim'} (${phone || '-'})
💬 "${comment || 'Tidak ada komentar'}"`;

    // DETEKSI: Kalau ID panjang (>30 char), itu pasti Player ID (HP)
    const isPlayerId = owner_id && owner_id.length > 30;

    const options = {
      method: 'POST',
      headers: {
        accept: 'application/json',
        // 👇 WAJIB 'Bearer' KARENA KUNCI 'os_v2...'
        Authorization: `Bearer ${API_KEY}`, 
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        app_id: APP_ID,
        // 👇 LOGIKA PINTAR:
        // Kirim ke 'player_ids' kalau itu ID HP, kirim ke 'external_user_ids' kalau ID database
        include_player_ids: isPlayerId ? [owner_id] : [],
        include_external_user_ids: !isPlayerId ? [owner_id] : [],
        
        headings: { en: title },
        contents: { en: messageContent }
      })
    };

    const response = await fetch('https://onesignal.com/api/v1/notifications', options);
    const responseData = await response.json();

    console.log("✅ STATUS:", responseData);
    
    if (responseData.errors) {
        return NextResponse.json({ success: false, error: responseData.errors }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: responseData });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}