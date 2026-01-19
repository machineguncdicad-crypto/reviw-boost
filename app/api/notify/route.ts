import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { rating, comment, brand_name, customer_name, phone, owner_id } = body;

    console.log("🔔 REQUEST NOTIF MASUK:", body);

    // 👇 KITA PAKE KUNCI "LEGACY" (YANG PALING ATAS DI LIST)
    // Biasanya cuma ini yang sakti buat kirim notif
    const API_KEY = "mfmucbohkulxfnxzsv44scbwa"; 
    
    // App ID tetep sama
    const APP_ID = "a9239662-b499-494e-9f98-fcb10b6e3034";

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
        Authorization: `Basic ${API_KEY}`, 
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        app_id: APP_ID,
        include_external_user_ids: [owner_id], 
        headings: { en: title },
        contents: { en: messageContent },
        android_channel_id: "e34b978d-672c-4266-932f-435555555555", 
        priority: 10
      })
    };

    const response = await fetch('https://onesignal.com/api/v1/notifications', options);
    const responseData = await response.json();

    console.log("✅ STATUS PENGIRIMAN:", responseData);

    return NextResponse.json({ success: true, data: responseData });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}