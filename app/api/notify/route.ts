import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // 1. Tangkap Data dari Form Review
    const body = await request.json();
    const { rating, comment, brand_name, customer_name, phone } = body;

    console.log("🔔 DATA REVIEW MASUK:", body);

    // 2. Tentukan Isi Pesan
    const isHappy = rating >= 4;
    const emoji = isHappy ? "🎉" : "⚠️";
    const title = isHappy 
        ? `Review Bintang ${rating}!` 
        : `Komplain: Bintang ${rating}`;
    
    const messageContent = `
👤 ${customer_name || 'Anonim'} (${phone || '-'})
💬 "${comment || 'Tanpa komentar'}"
    `.trim();

    // 3. KIRIM KE ONESIGNAL (The Magic Part 🪄)
    const options = {
      method: 'POST',
      headers: {
        accept: 'application/json',
        // Pastikan API Key ini benar (REST API KEY, bukan User Auth Key)
        Authorization: `Basic ${process.env.ONESIGNAL_REST_API_KEY}`, 
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        app_id: process.env.ONESIGNAL_APP_ID, // ID Aplikasi OneSignal Lu
        included_segments: ['Total Subscriptions'], // Kirim ke semua Admin yang subscribe
        headings: { en: title },
        contents: { en: messageContent },
        // (Opsional) Biar pas diklik langsung buka dashboard
        // url: "https://reviewboost.id/dashboard/reviews" 
      })
    };

    // Tembak API OneSignal
    const response = await fetch('https://onesignal.com/api/v1/notifications', options);
    const responseData = await response.json();

    console.log("✅ Status Kirim OneSignal:", responseData);

    return NextResponse.json({ success: true, data: responseData });

  } catch (error) {
    console.error("🔥 Gagal Kirim Notif:", error);
    // Kita return true aja biar user gak ngerasa error, padahal notifnya gagal (biar UX tetep mulus)
    return NextResponse.json({ success: false, error: "Gagal notif" }, { status: 500 });
  }
}