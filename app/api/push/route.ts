import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { rating, comment, brand_name, customer_name } = body;

    const APP_ID = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;
    const API_KEY = process.env.ONESIGNAL_REST_API_KEY;

    // Logic Warna: Merah kalo rating jelek, Hijau kalo bagus
    const isDanger = rating <= 3;
    const heading = isDanger ? `🚨 BAHAYA: Review Buruk!` : `🌟 Review Bagus Masuk!`;
    const message = `Rating: ${rating} ⭐\nDari: ${customer_name}\n"${comment}"`;

    const payload = {
      app_id: APP_ID,
      included_segments: ["Total Subscriptions"],
      headings: { en: heading },
      contents: { en: message },
      android_accent_color: isDanger ? "FF0000" : "00FF00",
      url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/dashboard`
    };

    await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    return NextResponse.json({ success: true });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}