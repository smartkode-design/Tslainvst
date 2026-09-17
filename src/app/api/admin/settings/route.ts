import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export interface SystemSettings {
  siteName: string;
  supportWhatsApp: string;
  supportEmail: string;
  currency: string;
  minDepositNgn: number;
  maintenanceMode: boolean;
  allowSignups: boolean;
  allowSellerApplications: boolean;
  fiveSimApiKeyConfigured: boolean;
  japApiKeyConfigured: boolean;
  payvesselConfigured: boolean;
  supabaseConnected: boolean;
}

let runtimeSettings: SystemSettings = {
  siteName: "TSLA Platform",
  supportWhatsApp: "+234 800 000 0000",
  supportEmail: "support@tsla.com",
  currency: "NGN",
  minDepositNgn: 500,
  maintenanceMode: false,
  allowSignups: true,
  allowSellerApplications: true,
  fiveSimApiKeyConfigured: Boolean(process.env.FIVESIM_API_KEY),
  japApiKeyConfigured: Boolean(process.env.JAP_API_KEY),
  payvesselConfigured: Boolean(process.env.PAYVESSEL_API_KEY || process.env.PAYVESSEL_SECRET_KEY),
  supabaseConnected: true,
};

export async function GET() {
  return NextResponse.json({
    success: true,
    settings: {
      ...runtimeSettings,
      fiveSimApiKeyConfigured: Boolean(process.env.FIVESIM_API_KEY),
      japApiKeyConfigured: Boolean(process.env.JAP_API_KEY),
      payvesselConfigured: Boolean(process.env.PAYVESSEL_API_KEY || process.env.PAYVESSEL_SECRET_KEY),
    },
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    runtimeSettings = {
      ...runtimeSettings,
      ...body,
    };
    return NextResponse.json({
      success: true,
      settings: runtimeSettings,
      message: "Platform settings saved successfully",
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
