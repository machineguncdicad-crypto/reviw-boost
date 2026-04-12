import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

// Setup client
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Fungsi bikin template email reminder yang rapi
 * @param businessName - Nama bisnis user
 * @param daysLeft - Sisa hari langganan
 * @param planType - Nama paket (PRO, BASIC, dll)
 */
function buildEmailTemplate(businessName: string, daysLeft: number, planType: string): string {
    const urgencyColor = daysLeft <= 3 ? "#ef4444" : "#f59e0b";
    const urgencyText = daysLeft === 1 ? "BESOK EXPIRED!" : `${daysLeft} hari lagi`;

    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #09090b; color: #ffffff; border-radius: 16px; overflow: hidden;">
        
        <!-- HEADER -->
        <div style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 32px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px; font-weight: 900; color: #000;">⭐ ReviewBoost</h1>
            <p style="margin: 8px 0 0; color: #000; opacity: 0.7; font-size: 14px;">Langganan hampir habis</p>
        </div>

        <!-- BODY -->
        <div style="padding: 32px;">
            <p style="color: #a1a1aa; font-size: 16px; margin: 0 0 16px;">Halo, <strong style="color: #fff;">${businessName}</strong> 👋</p>
            
            <div style="background: ${urgencyColor}15; border: 1px solid ${urgencyColor}40; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
                <p style="margin: 0; font-size: 14px; color: #a1a1aa;">Langganan <strong style="color: #fff;">${planType}</strong> kamu</p>
                <p style="margin: 8px 0 0; font-size: 32px; font-weight: 900; color: ${urgencyColor};">${urgencyText}</p>
            </div>

            <p style="color: #a1a1aa; font-size: 14px; line-height: 1.6;">
                Jangan sampai toko kamu berhenti ngumpulin review bintang 5! Perpanjang sekarang sebelum kehabisan dan kehilangan momentum.
            </p>

            <!-- CTA BUTTON -->
            <div style="text-align: center; margin: 32px 0;">
                <a href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/settings" 
                   style="background: #f59e0b; color: #000; font-weight: 900; padding: 16px 40px; border-radius: 12px; text-decoration: none; font-size: 16px; display: inline-block;">
                    Perpanjang Sekarang 🚀
                </a>
            </div>

            <p style="color: #52525b; font-size: 12px; text-align: center; margin: 0;">
                Email ini dikirim otomatis oleh ReviewBoost. Abaikan jika sudah memperpanjang.
            </p>
        </div>

    </div>
    `;
}

/**
 * CRON JOB — Dijalanin otomatis setiap hari jam 08.00 pagi
 * Cek semua user yang langganannya mau expired (H-7, H-3, H-1)
 * Lalu kirim email reminder ke masing-masing
 */
export async function GET(request: Request) {

    // Keamanan: Pastikan yang manggil adalah Vercel Cron, bukan orang random
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Target hari yang mau dikirim reminder (H-7, H-3, H-1)
        const reminderDays = [7, 3, 1];
        let totalSent = 0;

        for (const days of reminderDays) {
            // Hitung tanggal target expired
            const targetDate = new Date(today);
            targetDate.setDate(today.getDate() + days);
            const nextDay = new Date(targetDate);
            nextDay.setDate(targetDate.getDate() + 1);

            // Ambil semua user yang expirednya pas di hari target
            const { data: users, error } = await supabaseAdmin
                .from("profiles")
                .select("id, email, business_name, tier_name, subscription_end_date")
                .eq("subscription_status", "active")
                .gte("subscription_end_date", targetDate.toISOString())
                .lt("subscription_end_date", nextDay.toISOString());

            if (error) {
                console.error(`❌ Error ambil user H-${days}:`, error);
                continue;
            }

            if (!users || users.length === 0) {
                console.log(`ℹ️ Tidak ada user expired H-${days}`);
                continue;
            }

            // Kirim email ke setiap user
            for (const user of users) {
                try {
                    await resend.emails.send({
                        from: "ReviewBoost <onboarding@resend.dev>",
                        to: user.email,
                        subject: `⚠️ Langganan ReviewBoost kamu ${days === 1 ? "BESOK expired!" : `${days} hari lagi expired`}`,
                        html: buildEmailTemplate(
                            user.business_name || "Pengguna",
                            days,
                            user.tier_name || "PRO"
                        )
                    });

                    totalSent++;
                    console.log(`✅ Email terkirim ke ${user.email} (H-${days})`);

                } catch (emailError) {
                    console.error(`❌ Gagal kirim email ke ${user.email}:`, emailError);
                }
            }
        }

        return NextResponse.json({ 
            success: true, 
            message: `${totalSent} email reminder berhasil dikirim` 
        });

    } catch (error: any) {
        console.error("🔥 Cron Error:", error.message);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}