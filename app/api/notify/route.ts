import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { rating, comment, brand_name, customer_name, phone, owner_id } = body;

    const API_KEY = process.env.ONESIGNAL_REST_API_KEY!; 
    const APP_ID = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID!;

    const isHappy = rating >= 4;
    const title = isHappy
      ? `⭐ Review Bintang ${rating} di ${brand_name}!`
      : `⚠️ Komplain Bintang ${rating} di ${brand_name}`;

    const messageContent = `👤 ${customer_name || "Anonim"} (${phone || "-"})
💬 "${comment || "Tidak ada komentar"}"`;

    const response = await fetch("https://api.onesignal.com/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${API_KEY}`,
      },
      body: JSON.stringify({
        app_id: APP_ID,
        included_segments: ["Subscribed Users"], // ⬅️ TEST AMAN
        headings: { en: title },
        contents: { en: messageContent },
      }),
    });

    const data = await response.json();

    if (data.errors) {
      console.error("❌ ONESIGNAL ERROR:", data.errors);
      return NextResponse.json({ success: false, error: data.errors }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
