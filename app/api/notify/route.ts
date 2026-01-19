import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { rating, comment, brand_name, customer_name, phone, owner_id } = body;

    // 👇 1. API KEY (KUNCI): Pake Kunci Organisasi dari Popup (SAMA)
    const API_KEY = "os_v2_org_sndpmm7zbfghzitkbm53m4pdxbcoikbydxpespmohp4tklhi3q3nxlnlqlfddvzwi2uauneojzefvggbmdsas2vsjpua77x4d2fexwy"; 
    
    // 👇 2. APP ID (ALAMAT): Tetep Pake App ID ReviewBoost (JANGAN PAKE ORG ID)
    const APP_ID = "04a3fe92-3998-48ed-982c-50d74ad2e822";

    console.log("🔔 NOTIF OTW KE:", owner_id);

    const isHappy = rating >= 4;
    const title = isHappy 
        ? `⭐ Review Bintang ${rating} di ${brand_name}!` 
        : `⚠️ Komplain Bintang ${rating} di ${brand_name}`;
    
    const messageContent = `👤 ${customer_name || 'Anonim'} (${phone || '-'})
💬 "${comment || 'Tidak ada komentar'}"`;

    // Deteksi apakah ID-nya ID HP (Player ID) atau ID Database
    const isPlayerId = owner_id && owner_id.length > 30;

    const options = {
      method: 'POST',
      headers: {
        accept: 'application/json',
        // 👇 3. HEADER: Wajib Bearer karena kuncinya 'os_v2...'
        Authorization: `Bearer ${API_KEY}`, 
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        app_id: APP_ID,
        // Kirim ke jalur yang tepat sesuai jenis ID
        include_player_ids: isPlayerId ? [owner_id] : [],
        include_external_user_ids: !isPlayerId ? [owner_id] : [],
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