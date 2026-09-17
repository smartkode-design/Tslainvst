import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export interface AuditLogItem {
  id: string;
  actor: string;
  action: string;
  category: "auth" | "pricing" | "wallet" | "order" | "seller" | "system";
  details: string;
  ipAddress: string;
  status: "success" | "warning" | "error";
  createdAt: string;
}

let runtimeAuditLogs: AuditLogItem[] = [
  {
    id: "log-1",
    actor: "hassanhuss1027@gmail.com",
    action: "ADMIN_PROMOTION",
    category: "auth",
    details: "Promoted user account to Administrator (Platform Owner role).",
    ipAddress: "102.89.44.12",
    status: "success",
    createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
  },
  {
    id: "log-2",
    actor: "hassanhuss1027@gmail.com",
    action: "SYSTEM_ACCESS",
    category: "auth",
    details: "Admin portal session established.",
    ipAddress: "102.89.44.12",
    status: "success",
    createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
  },
  {
    id: "log-3",
    actor: "system",
    action: "PAYVESSEL_WEBHOOK_INIT",
    category: "system",
    details: "Payvessel webhook listener active and synchronized.",
    ipAddress: "127.0.0.1",
    status: "success",
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  },
  {
    id: "log-4",
    actor: "system",
    action: "DATABASE_CONNECTION",
    category: "system",
    details: "Supabase PostgreSQL service role connection verified.",
    ipAddress: "supabase.co",
    status: "success",
    createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
  },
];

export async function GET() {
  return NextResponse.json({
    success: true,
    logs: runtimeAuditLogs,
    total: runtimeAuditLogs.length,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { actor, action, category, details, status } = body;

    const newLog: AuditLogItem = {
      id: `log-${Date.now()}`,
      actor: actor || "admin",
      action: action || "GENERIC_ACTION",
      category: category || "system",
      details: details || "",
      ipAddress: "Internal",
      status: status || "success",
      createdAt: new Date().toISOString(),
    };

    runtimeAuditLogs = [newLog, ...runtimeAuditLogs];
    return NextResponse.json({ success: true, log: newLog });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
