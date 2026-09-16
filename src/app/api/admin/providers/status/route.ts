import { NextResponse } from "next/server";
import { FiveSimService } from "@/lib/providers/fivesim";
import { JapService } from "@/lib/providers/jap";

export async function GET() {
  try {
    const [fiveSimProfile, japBalance] = await Promise.allSettled([
      FiveSimService.getProfile(),
      JapService.getBalance(),
    ]);

    return NextResponse.json({
      success: true,
      providers: {
        fivesim: {
          connected: fiveSimProfile.status === "fulfilled",
          data: fiveSimProfile.status === "fulfilled" ? fiveSimProfile.value : null,
          error: fiveSimProfile.status === "rejected" ? fiveSimProfile.reason?.message : null,
        },
        jap: {
          connected: japBalance.status === "fulfilled",
          data: japBalance.status === "fulfilled" ? japBalance.value : null,
          error: japBalance.status === "rejected" ? japBalance.reason?.message : null,
        },
        database: {
          connected: true,
          provider: "Supabase PostgreSQL",
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch provider status" }, { status: 500 });
  }
}
