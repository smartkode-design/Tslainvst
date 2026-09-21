import { NextResponse } from "next/server";
import { resolveReferrer } from "@/lib/referrals";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.json({ success: false, error: "Referral code required" }, { status: 400 });
    }

    const referrer = await resolveReferrer(code);
    if (!referrer) {
      return NextResponse.json({ success: false, error: "Invalid referral code" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      referrer: {
        id: referrer.id,
        name: referrer.name,
        code: referrer.code,
      },
      bonusMessage: "5% referral reward activated for your inviter on every wallet deposit!",
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
