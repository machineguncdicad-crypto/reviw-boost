import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { rating, comment, brand_name, customer_name, phone, owner_id } = body;

    // 👇 INI KUNCI V2 KAMU (JANGAN UBAH)
    const API_KEY = "os_v2_app_asr75erztbeo3gbmkdluvuxiei2z745745oum4ns7lcnyc5v6bhwy2aukphty5mgnb2pgap36625ioggdvfppxgmrcdcje2jqdxw2by"; 
    
    // APP ID KAMU
    const APP_ID = "04a3fe92-3998-48ed-982c-50d74ad2e822";

    console.log("🔔 [V2] KIRIM NOTIF KE:", owner_id);

    // Konten Notif
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
        // ⚠️ PERHATIKAN: Pake 'Key', BUKAN 'Basic'
        Authorization: `Key ${API_KEY}`, 
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        app_id: APP_ID,
        
        // 👇 CARA V2 NEMBAK ID SUPABASE:
        include_aliases: {
            external_id: [owner_id]
        },
        target_channel: "push",
        
        headings: { en: title },
        contents: { en: messageContent }
      })
    };

    // 👇 URL BARU (API.ONESIGNAL.COM)
    const response = await fetch('https://api.onesignal.com/notifications', options);
    const responseData = await response.json();

    console.log("✅ RESPON SERVER V2:", responseData);
    
    if (responseData.errors) {
        return NextResponse.json({ success: false, error: responseData.errors }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: responseData });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}