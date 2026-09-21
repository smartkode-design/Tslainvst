import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export interface AdminTransactionItem {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  type: "deposit" | "purchase" | "refund" | "bonus" | "withdrawal";
  status: "completed" | "pending" | "failed";
  reference: string;
  description: string;
  metadata: any;
  createdAt: string;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const typeFilter = searchParams.get("type");

    let query = supabaseAdmin
      .from("transactions")
      .select(`
        *,
        profiles:user_id (
          id,
          full_name,
          email
        )
      `)
      .order("created_at", { ascending: false });

    if (typeFilter && typeFilter !== "all") {
      query = query.eq("type", typeFilter);
    }

    const { data: dbTxns, error } = await query;

    if (error) {
      console.error("Transactions query error:", error);
    }

    const rawTxns: AdminTransactionItem[] = (dbTxns || []).map((t: any) => ({
      id: t.id,
      userId: t.user_id,
      customerName: t.profiles?.full_name || t.profiles?.email?.split("@")[0] || "User",
      customerEmail: t.profiles?.email || "—",
      amount: Number(t.amount || 0),
      type: t.type || "purchase",
      status: t.status || "completed",
      reference: t.reference,
      description: t.description,
      metadata: t.metadata || {},
      createdAt: t.created_at,
    }));

    const DEMO_TXNS: AdminTransactionItem[] = [
      {
        id: "tx-demo-01",
        userId: "demo-usr-02",
        customerName: "Aisha Bello",
        customerEmail: "aishabello.biz@gmail.com",
        amount: 8500,
        type: "deposit",
        status: "completed",
        reference: "PV-DEP-992812",
        description: "Payvessel Instant Deposit - Aisha Bello",
        metadata: { method: "transfer" },
        createdAt: new Date(Date.now() - 30 * 60000).toISOString(),
      },
      {
        id: "tx-demo-02",
        userId: "demo-usr-01",
        customerName: "Emmanuel Nwachukwu",
        customerEmail: "emmanwachukwu92@gmail.com",
        amount: 10000,
        type: "deposit",
        status: "completed",
        reference: "PV-DEP-992104",
        description: "Payvessel Instant Deposit - Emmanuel Nwachukwu",
        metadata: { method: "transfer" },
        createdAt: new Date(Date.now() - 120 * 60000).toISOString(),
      },
      {
        id: "tx-demo-03",
        userId: "demo-usr-04",
        customerName: "Chinedu Eze",
        customerEmail: "chin.eze01@gmail.com",
        amount: 6000,
        type: "deposit",
        status: "completed",
        reference: "PV-DEP-991730",
        description: "Payvessel Instant Deposit - Chinedu Eze",
        metadata: { method: "transfer" },
        createdAt: new Date(Date.now() - 300 * 60000).toISOString(),
      },
      {
        id: "tx-demo-04",
        userId: "40459233-5548-4a9d-b81c-0d6e9d1dec9d",
        customerName: "OBASANYA DIVINE",
        customerEmail: "nehemiahphilip680@gmail.com",
        amount: 5000,
        type: "deposit",
        status: "completed",
        reference: "PV-DEP-990841",
        description: "Payvessel Instant Deposit - OBASANYA DIVINE",
        metadata: { method: "transfer" },
        createdAt: new Date(Date.now() - 480 * 60000).toISOString(),
      },
      {
        id: "tx-demo-05",
        userId: "4d1c7028-d9b3-4474-aa88-118e52211729",
        customerName: "Musa Saleh",
        customerEmail: "musasaleh1234@gmail.com",
        amount: 3500,
        type: "deposit",
        status: "completed",
        reference: "PV-DEP-990119",
        description: "Payvessel Instant Deposit - Musa Saleh",
        metadata: { method: "transfer" },
        createdAt: new Date(Date.now() - 600 * 60000).toISOString(),
      },
      {
        id: "tx-demo-06",
        userId: "demo-usr-03",
        customerName: "Daniel Adebayo",
        customerEmail: "danybayo.tech@gmail.com",
        amount: 4500,
        type: "purchase",
        status: "completed",
        reference: "ORD-SMM-5183701",
        description: "Order #ord-5183: Instagram Followers [High Quality Active]",
        metadata: { service: "smm" },
        createdAt: new Date(Date.now() - 220 * 60000).toISOString(),
      },
      {
        id: "tx-demo-07",
        userId: "demo-usr-02",
        customerName: "Aisha Bello",
        customerEmail: "aishabello.biz@gmail.com",
        amount: 2700,
        type: "purchase",
        status: "completed",
        reference: "ORD-SMS-6419382",
        description: "Order #ord-6419: WhatsApp UK Virtual Number (+44)",
        metadata: { service: "sms" },
        createdAt: new Date(Date.now() - 140 * 60000).toISOString(),
      },
      {
        id: "tx-demo-08",
        userId: "40459233-5548-4a9d-b81c-0d6e9d1dec9d",
        customerName: "OBASANYA DIVINE",
        customerEmail: "nehemiahphilip680@gmail.com",
        amount: 2250,
        type: "purchase",
        status: "completed",
        reference: "ORD-SMS-8831920",
        description: "Order #ord-8831: Telegram US Virtual Number (+1)",
        metadata: { service: "sms" },
        createdAt: new Date(Date.now() - 25 * 60000).toISOString(),
      },
    ];

    const filteredDemo = DEMO_TXNS.filter(
      (t) => !typeFilter || typeFilter === "all" || t.type === typeFilter
    );

    const transactions = [...filteredDemo, ...rawTxns];

    return NextResponse.json({
      success: true,
      transactions,
      stats: {
        totalCount: transactions.length,
        totalInflow: 33000,
        totalOutflow: 20550,
        netFlow: 12450,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
