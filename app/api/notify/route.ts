import { NextResponse } from "next/server";

export const runtime = "nodejs"; // penting, jangan edge

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      rating,
      comment,
      brand_name,
      customer_name,
      phone,
      owner_id
    } = body;

    if (!owner_id) {
      return NextResponse.json(
        { success: false, error: "owner_id wajib diisi" },
        { status: 400 }
      );
    }

    const API_KEY = process.env.ONESIGNAL_REST_API_KEY;
    const APP_ID = process.env.ONESIGNAL_APP_ID;

    if (!API_KEY || !APP_ID) {
      return NextResponse.json(
        { success: false, error: "OneSignal ENV belum kebaca" },
        { status: 500 }
      );
    }

    const isHappy = Number(rating) >= 4;

    const title = isHappy
      ? `⭐ Review Bintang ${rating} di ${brand_name}`
      : `⚠️ Komplain Bintang ${rating} di ${brand_name}`;

    const messageContent = `👤 ${customer_name || "Anonim"} (${phone || "-"})
💬 "${comment || "Tidak ada komentar"}"`;

    const response = await fetch(
      "https://api.onesignal.com/notifications",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Basic ${API_KEY}`,
          "Accept": "application/json",
        },
        body: JSON.stringify({
          app_id: APP_ID,
          include_aliases: {
            external_id: [owner_id],
          },
          target_channel: "push",
          headings: { en: title },
          contents: { en: messageContent },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok || data.errors) {
      console.error("❌ OneSignal Error:", data);
      return NextResponse.json(
        { success: false, error: data },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      notification_id: data.id,
    });
  } catch (error: any) {
    console.error("🔥 SERVER ERROR:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
