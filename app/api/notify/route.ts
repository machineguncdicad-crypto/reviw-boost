import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { rating, comment, brand_name, customer_name, phone, owner_id } = body;

    // --- CONFIGURATION ---
    const API_KEY = "os_v2_app_asr75erztbeo3gbmkdluvuxiejcygzs7e2qu5veq3dinnympqb2g3u46kzchgxg5do5wwj727iggvktscgnqfbmlpextdoixayulf5a"; 
    const APP_ID = "04a3fe92-3998-48ed-982c-50d74ad2e822";

    // 1. CEK DULU: ID NYA ADA GAK?
    if (!owner_id) {
        console.error("❌ ERROR: Owner ID Kosong! Gak bisa kirim notif.");
        return NextResponse.json({ success: false, error: "Owner ID missing" }, { status: 400 });
    }

    console.log("🔔 NOTIF OTW KE (External ID):", owner_id);

    // 2. SIAPKAN KONTEN
    const isHappy = rating >= 4;
    const title = isHappy 
        ? `⭐ Review Bintang ${rating} di ${brand_name}!` 
        : `⚠️ Komplain Bintang ${rating} di ${brand_name}`;
    
    const messageContent = `👤 ${customer_name || 'Anonim'} (${phone || '-'})
💬 "${comment || 'Tidak ada komentar'}"`;

    // 3. SIAPKAN PAKET (PAKE METODE 'ALIASES' YANG BARU)
    const options = {
      method: 'POST',
      headers: {
        accept: 'application/json',
        Authorization: `Basic ${API_KEY}`, 
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        app_id: APP_ID,
        
        // 👇 PERUBAHAN DISINI (Cara Baru OneSignal):
        // Kita bungkus external_id di dalam object "include_aliases"
        include_aliases: {
            external_id: [owner_id]
        },
        target_channel: "push", // Fokus ke push notif
        
        headings: { en: title },
        contents: { en: messageContent }
      })
    };

    // 4. KIRIM KE ONESIGNAL
    const response = await fetch('https://onesignal.com/api/v1/notifications', options);
    const responseData = await response.json();

    console.log("✅ RESPON ONESIGNAL:", JSON.stringify(responseData, null, 2));
    
    if (responseData.errors) {
        // Kalau errornya array (kadang OneSignal balikin array), kita stringify
        const errorMsg = Array.isArray(responseData.errors) ? responseData.errors.join(", ") : responseData.errors;
        console.error("❌ GAGAL KIRIM:", errorMsg);
        return NextResponse.json({ success: false, error: responseData.errors }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: responseData });

  } catch (error: any) {
    console.error("❌ SERVER ERROR:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}