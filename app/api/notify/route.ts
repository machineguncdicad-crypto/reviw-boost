import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // 1. Tangkap Data dari Frontend
    const body = await request.json();
    const { rating, comment, brand_name, customer_name, phone, owner_id } = body;

    console.log("🔔 REQUEST NOTIF MASUK:", body);

    // ⛔ CEK KEAMANAN: Pastikan ada owner_id & API Key
    if (!owner_id) {
        return NextResponse.json({ success: false, error: "Owner ID tidak ditemukan!" }, { status: 400 });
    }
    if (!process.env.ONESIGNAL_REST_API_KEY) {
        return NextResponse.json({ success: false, error: "API Key Server belum disetting!" }, { status: 500 });
    }

    // 2. Tentukan Isi Pesan (Logika Emoji)
    const isHappy = rating >= 4;
    const title = isHappy 
        ? `⭐ Review Bintang ${rating} di ${brand_name}!` 
        : `⚠️ Komplain Bintang ${rating} di ${brand_name}`;
    
    // Format pesan biar rapi di HP
    const messageContent = `👤 ${customer_name || 'Anonim'} (${phone || '-'})
💬 "${comment || 'Tidak ada komentar'}"`;

    // 3. KIRIM KE ONESIGNAL (Target Spesifik Owner)
    const options = {
      method: 'POST',
      headers: {
        accept: 'application/json',
        Authorization: `Basic ${process.env.ONESIGNAL_REST_API_KEY}`, // Pake REST API KEY
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        app_id: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID, // Pake App ID
        
        // 🔥 KUNCI RAHASIA: Kirim HANYA ke ID Owner ini
        include_external_user_ids: [owner_id], 
        
        headings: { en: title },
        contents: { en: messageContent },
        
        // Channel ID (Opsional, buat Android biar ada suaranya)
        android_channel_id: "e34b978d-672c-4266-932f-435555555555", 
        priority: 10
      })
    };

    // Tembak Server OneSignal
    const response = await fetch('https://onesignal.com/api/v1/notifications', options);
    const responseData = await response.json();

    console.log("✅ STATUS PENGIRIMAN:", responseData);

    return NextResponse.json({ success: true, data: responseData });

  } catch (error: any) {
    console.error("🔥 GAGAL NOTIF:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}