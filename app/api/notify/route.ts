import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { rating, comment, brand_name, customer_name, phone, owner_id } = body;

    // 👇 KUNCI DARI BARIS "VERCEL KEY" DI FOTO LU (UDAH GW SALIN LENGKAP)
    const API_KEY = "7t2e3m24ruuomhhzsorkwd4ynnxyfxh4srmci5itrcjoyczcmsv4xnodl7guy41qxe24633cqivty"; 
    
    // APP ID REVIEWBOOST LIVE
    const APP_ID = "04a3fe92-3998-48ed-982c-50d74ad2e822";

    console.log("🔔 NOTIF OTW KE:", owner_id);

    const isHappy = rating >= 4;
    const title = isHappy 
        ? `⭐ Review Bintang ${rating} di ${brand_name}!` 
        : `⚠️ Komplain Bintang ${rating} di ${brand_name}`;
    
    const messageContent = `👤 ${customer_name || 'Anonim'} (${phone || '-'})
💬 "${comment || 'Tidak ada komentar'}"`;

    // DETEKSI JENIS ID: Jika panjangnya > 30 karakter, itu pasti Player ID (HP)
    const isPlayerId = owner_id && owner_id.length > 30;

    const options = {
      method: 'POST',
      headers: {
        accept: 'application/json',
        // 👇 WAJIB 'Basic' UNTUK KUNCI TIPE INI
        Authorization: `Basic ${API_KEY}`, 
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        app_id: APP_ID,
        // 👇 LOGIKA PENGIRIMAN PINTAR:
        // Masukkan ke 'include_player_ids' kalau formatnya UUID (HP)
        // Masukkan ke 'include_external_user_ids' kalau formatnya ID Database
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