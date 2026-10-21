import React, { useState, useEffect } from "react";
import {
  Award,
  CheckCircle2,
  Download,
  Eye,
  FileText,
  Filter,
  Printer,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldCheck,
  TrendingUp,
  User,
  X,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { adminSubscriptionApi, RazorpayOrderRecord } from "@/Lib/Api";
import { cn } from "@/Lib/Utils";

export function AdminOrdersTab() {
  const [orders, setOrders] = useState<RazorpayOrderRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [tierFilter, setTierFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [invoiceLoading, setInvoiceLoading] = useState<boolean>(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params: { status?: string; tier?: string; search?: string } = {};
      if (statusFilter !== "ALL") params.status = statusFilter;
      if (tierFilter !== "ALL") params.tier = tierFilter;
      if (searchQuery.trim()) params.search = searchQuery.trim();
      const data = await adminSubscriptionApi.getOrders(params);
      setOrders(data);
    } catch (err: any) {
      toast.error(err.message || "Failed To Load Payment Transactions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, tierFilter]);

  const handleAction = async (id: string, action: "MARK_PAID" | "REFUND" | "REGENERATE_INVOICE") => {
    const actionName =
      action === "MARK_PAID"
        ? "Mark This Order As Paid And Upgrade The Student's Account"
        : action === "REFUND"
        ? "Mark This Transaction As Refunded And Downgrade The Student Back To Free"
        : "Regenerate New Invoice Number";

    if (!confirm(`Are You Sure You Want To ${actionName}?`)) return;

    try {
      const res = await adminSubscriptionApi.orderAction(id, action);
      toast.success(res.message || "Order Updated Successfully.");
      fetchOrders();
    } catch (err: any) {
      toast.error(err.message || "Failed To Execute Order Action.");
    }
  };

  const handleViewInvoice = async (orderId: string) => {
    setInvoiceLoading(true);
    try {
      const data = await adminSubscriptionApi.getInvoice(orderId);
      setSelectedInvoice(data);
    } catch (err: any) {
      toast.error(err.message || "Failed To Generate Invoice Preview.");
    } finally {
      setInvoiceLoading(false);
    }
  };

  const handlePrintInvoice = (inv: any) => {
    if (!inv) return;
    const printWindow = window.open("", "_blank", "width=900,height=1000");
    if (!printWindow) {
      toast.error("Popup Window Blocked By Browser. Please Allow Popups To Save/Print The Official PDF.");
      return;
    }

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Tax Invoice - ${inv.invoice_number}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 12mm 14mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      border-radius: 0 !important;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      margin: 0;
      padding: 24px;
      color: #0f172a;
      background: #ffffff;
      line-height: 1.4;
      font-size: 12px;
    }
    .invoice-card {
      max-width: 800px;
      margin: 0 auto;
      border: 1px solid #0f172a;
      padding: 32px;
      position: relative;
      background: #ffffff;
    }
    .watermark-bg {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-30deg);
      font-size: 78px;
      font-weight: 900;
      color: rgba(15, 23, 42, 0.03);
      white-space: nowrap;
      pointer-events: none;
      z-index: 0;
      user-select: none;
      letter-spacing: 6px;
      font-family: monospace;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #005F15;
      padding-bottom: 16px;
      margin-bottom: 20px;
      position: relative;
      z-index: 1;
    }
    .brand-title {
      font-size: 22px;
      font-weight: 900;
      color: #005F15;
      margin: 0 0 2px 0;
      letter-spacing: -0.5px;
      text-transform: uppercase;
    }
    .brand-subtitle {
      font-size: 10px;
      color: #047857;
      margin: 0 0 5px 0;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.8px;
    }
    .company-meta {
      font-size: 10.5px;
      color: #475569;
      margin: 2px 0;
      line-height: 1.35;
    }
    .status-badge {
      display: inline-block;
      background: #ecfdf5;
      color: #065f46;
      border: 1px solid #059669;
      padding: 4px 12px;
      font-weight: 800;
      font-size: 11px;
      letter-spacing: 1.2px;
      text-transform: uppercase;
      margin-bottom: 6px;
    }
    .invoice-num {
      font-family: monospace;
      font-weight: 800;
      font-size: 13px;
      color: #0f172a;
      margin: 0 0 2px 0;
    }
    .invoice-date {
      font-size: 10.5px;
      color: #475569;
      margin: 0;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 20px;
      position: relative;
      z-index: 1;
    }
    .info-box {
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      padding: 14px 16px;
    }
    .info-label {
      font-size: 9.5px;
      font-weight: 800;
      text-transform: uppercase;
      color: #005F15;
      letter-spacing: 1px;
      margin-bottom: 6px;
      display: block;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 4px;
    }
    .scholar-name {
      font-size: 14px;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 4px 0;
    }
    .info-line {
      font-size: 11px;
      color: #334155;
      margin: 3px 0;
    }
    .table-container {
      margin-bottom: 18px;
      position: relative;
      z-index: 1;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid #cbd5e1;
    }
    th {
      background: #005F15;
      color: #ffffff;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      padding: 9px 12px;
      text-align: left;
      border: 1px solid #005F15;
    }
    th.text-right, td.text-right {
      text-align: right;
    }
    th.text-center, td.text-center {
      text-align: center;
    }
    td {
      padding: 10px 12px;
      border: 1px solid #cbd5e1;
      font-size: 11.5px;
      background: #ffffff;
    }
    .plan-name {
      font-weight: 800;
      color: #0f172a;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    .plan-desc {
      font-size: 10.5px;
      color: #64748b;
      margin-top: 2px;
    }
    .coupon-row {
      background: #f0fdf4 !important;
      color: #065f46;
      font-weight: 700;
    }
    .totals-block {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 18px;
      position: relative;
      z-index: 1;
    }
    .totals-box {
      width: 320px;
      background: #ffffff;
      border: 1px solid #0f172a;
      padding: 14px 16px;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 5px;
      font-size: 11.5px;
      color: #334155;
    }
    .grand-total {
      display: flex;
      justify-content: space-between;
      border-top: 2px solid #005F15;
      padding-top: 8px;
      margin-top: 6px;
      font-size: 15px;
      font-weight: 900;
      color: #005F15;
    }
    .transaction-card {
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      padding: 12px 16px;
      font-family: monospace;
      font-size: 11px;
      color: #334155;
      margin-bottom: 18px;
      position: relative;
      z-index: 1;
    }
    .transaction-card-title {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-weight: 800;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      margin-bottom: 6px;
      color: #005F15;
    }
    .footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid #0f172a;
      padding-top: 12px;
      font-size: 9.5px;
      color: #475569;
      position: relative;
      z-index: 1;
    }
    .seal-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      border: 1px solid #005F15;
      background: #f0fdf4;
      padding: 5px 12px;
      color: #005F15;
      font-weight: 800;
      font-size: 9.5px;
      text-transform: uppercase;
      letter-spacing: 0.8px;
    }
    @media print {
      body {
        padding: 0;
      }
      .invoice-card {
        border: 1px solid #0f172a;
        box-shadow: none;
        padding: 24px;
      }
      .no-print {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  <div class="no-print" style="max-width: 800px; margin: 0 auto 14px auto; display: flex; justify-content: flex-end; gap: 8px;">
    <button onclick="window.print()" style="background:#005F15; color:#ffffff; border:1px solid #00450f; padding:9px 22px; font-weight:800; cursor:pointer; font-size:12px; text-transform:uppercase; letter-spacing:0.5px;">
      Print / Save As PDF
    </button>
  </div>

  <div class="invoice-card">
    <div class="watermark-bg">SAASTASCHOLAR</div>

    <div class="header">
      <div>
        <h1 class="brand-title">${inv.company?.name || "SaastaScholar™"}</h1>
        <p class="brand-subtitle">${inv.company?.tagline || "Quality Education, Without The Heavy Price"}</p>
        <p class="company-meta">A DurgaAI Solutions Academic Enterprise · Official Academic Tax Receipt</p>
        <p class="company-meta">Support: ${inv.company?.support_email || "support@saastascholar.in"} </p>
      </div>
      <div style="text-align: right;">
        <div class="status-badge">PAYMENT STATUS: ${inv.status || "PAID"}</div>
        <p class="invoice-num">INVOICE NO: ${inv.invoice_number}</p>
        <p class="invoice-date">DATE: ${inv.date}</p>
        <p class="invoice-date">PLACE OF SUPPLY: Rajasthan (08)</p>
      </div>
    </div>

    <div class="info-grid">
      <div class="info-box">
        <span class="info-label">Billed To (Student Scholar)</span>
        <h2 class="scholar-name">${inv.customer?.name || "Enrolled Scholar"}</h2>
        <p class="info-line"><strong>Email:</strong> ${inv.customer?.email || "—"}</p>
        <p class="info-line"><strong>Roll No:</strong> ${inv.customer?.roll_number || "—"}</p>
        <p class="info-line"><strong>University:</strong> ${inv.customer?.university || "NIMS University, Rajasthan"}</p>
        <p class="info-line"><strong>Course:</strong> ${inv.customer?.department || "Engineering & Technology"} · Sem ${inv.customer?.semester || 1} (${inv.customer?.section || "A"})</p>
      </div>

      <div class="info-box">
        <span class="info-label">Order &amp; Billing Specifications</span>
        <p class="info-line"><strong>Invoice No:</strong> ${inv.invoice_number}</p>
        <p class="info-line"><strong>Payment ID:</strong> ${inv.payment_id || "Confirmed"}</p>
        <p class="info-line"><strong>Order ID:</strong> ${inv.order_id}</p>
        <p class="info-line"><strong>Billing Term:</strong> ${inv.billing_cycle || "Monthly"}</p>
        <p class="info-line"><strong>Payment Channel:</strong> Razorpay Payments (India)</p>
      </div>
    </div>

    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th style="width: 45%;">Description of Service</th>
            <th class="text-center" style="width: 15%;">SAC Code</th>
            <th class="text-center" style="width: 15%;">Term</th>
            <th class="text-right" style="width: 12%;">Rate</th>
            <th class="text-right" style="width: 13%;">Amount (INR)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <div class="plan-name">${inv.plan_name} Membership</div>
              <div class="plan-desc">${inv.plan_description || "Curated Lecture Notes, Verified Solutions & Question Banks"}</div>
            </td>
            <td class="text-center" style="font-family: monospace;">999293</td>
            <td class="text-center">${inv.billing_cycle}</td>
            <td class="text-right">₹${inv.financials?.subtotal_inr}</td>
            <td class="text-right">₹${inv.financials?.subtotal_inr}</td>
          </tr>
          ${inv.financials?.discount_inr > 0 ? `
          <tr class="coupon-row">
            <td colspan="4">
              PROMOTIONAL DISCOUNT APPLIED (COUPON: ${inv.financials?.discount_code || "DISCOUNT"})
            </td>
            <td class="text-right">- ₹${inv.financials?.discount_inr}</td>
          </tr>
          ` : ""}
        </tbody>
      </table>
    </div>

    <div class="totals-block">
      <div class="totals-box">
        <div class="total-row">
          <span>Gross Subtotal:</span>
          <span>₹${inv.financials?.subtotal_inr}</span>
        </div>
        ${inv.financials?.discount_inr > 0 ? `
        <div class="total-row" style="color:#065f46; font-weight:700;">
          <span>Promotional Discount:</span>
          <span>- ₹${inv.financials?.discount_inr}</span>
        </div>
        ` : ""}
        <div class="total-row">
          <span>Integrated GST (IGST @ 0%):</span>
          <span>₹0.00</span>
        </div>
        <div class="total-row">
          <span>Central &amp; State GST (CGST/SGST @ 0%):</span>
          <span>₹0.00</span>
        </div>
        <div class="grand-total">
          <span>Total Settled (INR):</span>
          <span>₹${inv.financials?.total_paid_inr}</span>
        </div>
      </div>
    </div>

    <div class="transaction-card">
      <div class="transaction-card-title">Bank Gateway Transaction Audit Trail</div>
      <div>ORDER IDENTIFIER: ${inv.order_id}</div>
      <div>GATEWAY TRANSACTION ID: ${inv.payment_id}</div>
      <div>SETTLEMENT CHANNEL: ${inv.financials?.payment_gateway || "Razorpay Payments (India)"}</div>
      <div>TRANSACTION STATUS: CAPTURED &amp; VERIFIED</div>
    </div>

    <div class="footer">
      <div>
        <p style="margin:0 0 2px 0;">This Is A Digitally Verified Official Proof Of Payment Generated By SaastaScholar™.</p>
        <p style="margin:0;">Protected Under The Digital Personal Data Protection Act, 2023 (DPDP Act). Electronic Receipt, No Physical Signature Required.</p>
      </div>
      <div class="seal-badge">
        <span>DIGITALLY SIGNED &amp; VERIFIED</span>
      </div>
    </div>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 350);
    };
  </script>
</body>
</html>`;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  // Summary Metrics
  const totalPaidRevenue = orders
    .filter((o) => o.status === "paid")
    .reduce((sum, o) => sum + (o.amount_inr || o.amount / 100), 0);
  const paidCount = orders.filter((o) => o.status === "paid").length;
  const pendingCount = orders.filter((o) => o.status === "created").length;
  const refundedCount = orders.filter((o) => o.status === "refunded").length;

  return (
    <div className="space-y-6">
      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <span>Total Collected Revenue</span>
            <TrendingUp className="h-4 w-4" />
          </div>
          <span className="font-display text-2xl font-black text-foreground block font-mono">
            ₹{totalPaidRevenue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[0.68rem] text-muted-foreground block">Verified Razorpay Payments</span>
        </div>

        <div className="rounded-2xl border border-primary/20 bg-primary/10 p-4 space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-primary">
            <span>Active Subscriptions</span>
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <span className="font-display text-2xl font-black text-foreground block font-mono">{paidCount}</span>
          <span className="text-[0.68rem] text-muted-foreground block">Scholars With Active Paid Tier</span>
        </div>

        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-amber-600 dark:text-amber-400">
            <span>Pending Checkouts</span>
            <RefreshCw className="h-4 w-4" />
          </div>
          <span className="font-display text-2xl font-black text-foreground block font-mono">{pendingCount}</span>
          <span className="text-[0.68rem] text-muted-foreground block">Created Orders Awaiting Completion</span>
        </div>

        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-rose-600 dark:text-rose-400">
            <span>Refunded Orders</span>
            <RotateCcw className="h-4 w-4" />
          </div>
          <span className="font-display text-2xl font-black text-foreground block font-mono">{refundedCount}</span>
          <span className="text-[0.68rem] text-muted-foreground block">Reversed Or Cancelled Transactions</span>
        </div>
      </div>

      {/* Filter and Action Bar */}
      <div className="rounded-2xl border border-border/80 bg-surface/60 p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 rounded-xl bg-background border border-border p-1 text-xs">
            {["ALL", "PAID", "CREATED", "REFUNDED"].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={cn(
                  "px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer",
                  statusFilter === st
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Tier Dropdown */}
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="h-9 rounded-xl border border-border bg-background px-3 text-xs font-semibold focus:border-primary focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Plan Tiers</option>
            <option value="FREE">Free</option>
            <option value="BASIC">Basic</option>
            <option value="PREMIUM">Premium</option>
            <option value="ELITE">Elite</option>
          </select>
        </div>

        {/* Search Input & Refresh */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchOrders();
            }}
            className="relative flex-1 sm:w-64"
          >
            <Search className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Scholar Or Order ID..."
              className="h-9 w-full rounded-xl border border-border bg-background pr-3 pl-9 text-xs focus:border-primary focus:outline-none"
            />
          </form>
          <button
            type="button"
            onClick={fetchOrders}
            className="h-9 px-3.5 rounded-xl border border-border bg-card text-foreground hover:bg-surface text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto rounded-2xl border border-border/80 bg-card shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-surface/90 border-b border-border text-[0.65rem] uppercase font-bold text-muted-foreground tracking-wider">
            <tr>
              <th className="p-4">Scholar / Student</th>
              <th className="p-4">Plan Tier</th>
              <th className="p-4">Cycle</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Status</th>
              <th className="p-4">Invoice No.</th>
              <th className="p-4">Date &amp; Time</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-muted-foreground">
                  No Payment Orders Found Matching This Filter.
                </td>
              </tr>
            ) : (
              orders.map((ord) => {
                const isPaid = ord.status === "paid";
                const isRefunded = ord.status === "refunded";
                return (
                  <tr key={ord.id} className="hover:bg-surface/40 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-2.5">
                        <div className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold text-xs shrink-0">
                          {ord.user_name?.charAt(0) || "S"}
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-foreground block truncate">{ord.user_name || "Scholar"}</span>
                          <span className="text-[0.65rem] text-muted-foreground block truncate">{ord.user_email}</span>
                          <span className="text-[0.62rem] font-mono text-primary">{ord.user_roll || "—"}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-0.5 text-[0.62rem] font-bold uppercase tracking-wider",
                          ord.plan_tier === "ELITE" || ord.plan_tier === "ELITE_PLUS"
                            ? "bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30"
                            : ord.plan_tier === "PREMIUM" || ord.plan_tier === "ACHIEVER"
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                            : ord.plan_tier === "BASIC" || ord.plan_tier === "SCHOLAR"
                            ? "bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30"
                            : "bg-muted text-muted-foreground border border-border"
                        )}
                      >
                        {ord.plan_tier}
                      </span>
                    </td>
                    <td className="p-4 font-mono capitalize">{ord.cycle}</td>
                    <td className="p-4 font-mono font-bold text-foreground">
                      ₹{ord.amount_inr || ord.amount / 100}
                      {ord.discount_inr > 0 && (
                        <span className="text-[0.62rem] text-emerald-600 block">Saved ₹{ord.discount_inr}</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-0.5 text-[0.62rem] font-bold uppercase",
                          isPaid
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                            : isRefunded
                            ? "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                            : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                        )}
                      >
                        {ord.status}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-[0.7rem] text-muted-foreground">
                      {ord.invoice_number || "—"}
                    </td>
                    <td className="p-4 text-[0.7rem] text-muted-foreground whitespace-nowrap">
                      {new Date(ord.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleViewInvoice(ord.id)}
                          className="h-7 px-2.5 rounded-lg border border-border bg-card hover:bg-surface text-foreground font-semibold text-[0.68rem] flex items-center gap-1 cursor-pointer"
                          title="View Official Receipt"
                        >
                          <FileText className="h-3 w-3 text-primary" />
                          <span>Receipt</span>
                        </button>
                        {!isPaid && !isRefunded && (
                          <button
                            type="button"
                            onClick={() => handleAction(ord.id, "MARK_PAID")}
                            className="h-7 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[0.68rem] flex items-center gap-1 cursor-pointer"
                            title="Manually Mark Paid & Upgrade Account"
                          >
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Mark Paid</span>
                          </button>
                        )}
                        {isPaid && (
                          <button
                            type="button"
                            onClick={() => handleAction(ord.id, "REFUND")}
                            className="h-7 px-2 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 font-bold text-[0.68rem] flex items-center gap-1 cursor-pointer"
                            title="Refund & Downgrade to Free"
                          >
                            <RotateCcw className="h-3 w-3" />
                            <span>Refund</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Invoice Viewer Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl rounded-none border border-border bg-card shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-surface/60">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-none bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                  <FileText className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-foreground uppercase tracking-wide">Official Academic Invoice</h3>
                  <p className="text-[0.68rem] font-mono text-muted-foreground">{selectedInvoice.invoice_number}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedInvoice(null)}
                className="h-8 w-8 rounded-none border border-border/80 flex items-center justify-center hover:bg-surface text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-xs flex-1">
              {/* Institution Header */}
              <div className="flex items-center justify-between border-b border-border/80 pb-4">
                <div>
                  <h4 className="font-display font-black text-base text-foreground tracking-tight uppercase">
                    {selectedInvoice.company?.name}
                  </h4>
                  <p className="text-[0.7rem] text-muted-foreground">{selectedInvoice.company?.tagline}</p>
                  <p className="text-[0.65rem] text-muted-foreground mt-0.5">
                    Parent: {selectedInvoice.company?.parent} · Support: {selectedInvoice.company?.support_email}
                  </p>
                </div>
                <div className="text-right">
                  <span className="rounded-none border border-emerald-600/60 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold px-3 py-1 text-[0.65rem] font-mono uppercase tracking-wider">
                    STATUS: {selectedInvoice.status}
                  </span>
                  <p className="text-[0.68rem] text-muted-foreground mt-1.5 font-mono">Date: {selectedInvoice.date}</p>
                </div>
              </div>

              {/* Billed Scholar Section */}
              <div className="rounded-none border border-border bg-surface/40 p-4 space-y-1">
                <span className="text-[0.62rem] uppercase font-bold text-primary tracking-wider block border-b border-border/60 pb-1 mb-2">Billed Scholar</span>
                <h5 className="font-bold text-sm text-foreground">{selectedInvoice.customer?.name}</h5>
                <p className="text-[0.7rem] text-muted-foreground">{selectedInvoice.customer?.email}</p>
                <div className="grid grid-cols-2 gap-2 text-[0.7rem] pt-1.5 text-muted-foreground border-t border-border/60 mt-2 font-mono">
                  <span>Roll: {selectedInvoice.customer?.roll_number}</span>
                  <span>Semester {selectedInvoice.customer?.semester} ({selectedInvoice.customer?.section})</span>
                </div>
              </div>

              {/* Line Items */}
              <div className="rounded-none border border-border overflow-hidden">
                <div className="bg-surface/80 p-3 font-bold text-[0.68rem] uppercase tracking-wider text-muted-foreground flex justify-between border-b border-border">
                  <span>Description</span>
                  <span>Amount</span>
                </div>
                <div className="p-4 space-y-2 text-xs">
                  <div className="flex justify-between font-bold text-foreground">
                    <div>
                      <span className="uppercase">{selectedInvoice.plan_name}</span>
                      <p className="text-[0.68rem] text-muted-foreground font-normal">
                        {selectedInvoice.plan_description} ({selectedInvoice.billing_cycle})
                      </p>
                    </div>
                    <span className="font-mono">₹{selectedInvoice.financials?.subtotal_inr}</span>
                  </div>

                  {selectedInvoice.financials?.discount_inr > 0 && (
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold text-[0.72rem]">
                      <span>Voucher Discount ({selectedInvoice.financials?.discount_code})</span>
                      <span className="font-mono">- ₹{selectedInvoice.financials?.discount_inr}</span>
                    </div>
                  )}

                  <div className="flex justify-between border-t border-border/80 pt-2 font-black text-sm text-foreground">
                    <span>Total Settled (INR)</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400">
                      ₹{selectedInvoice.financials?.total_paid_inr}
                    </span>
                  </div>
                </div>
              </div>

              {/* Transaction ID */}
              <div className="rounded-none border border-border/80 bg-surface/30 p-3 text-[0.68rem] font-mono text-muted-foreground space-y-0.5">
                <div className="text-[0.62rem] font-sans font-bold text-primary uppercase tracking-wider mb-1">Transaction Audit Trail</div>
                <p>Order ID: {selectedInvoice.order_id}</p>
                <p>Payment Transaction ID: {selectedInvoice.payment_id}</p>
                <p>Channel: {selectedInvoice.financials?.payment_gateway}</p>
              </div>
            </div>

            <div className="px-6 py-3.5 border-t border-border bg-surface/60 flex items-center justify-between">
              <span className="text-[0.68rem] text-muted-foreground">
                Digitally Generated Academic Proof Of Payment
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedInvoice(null)}
                  className="px-4 py-2 rounded-none border border-border bg-card hover:bg-surface text-foreground font-semibold text-xs cursor-pointer uppercase tracking-wider"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => handlePrintInvoice(selectedInvoice)}
                  className="px-5 py-2 rounded-none bg-primary hover:bg-primary-deep text-primary-foreground font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md uppercase tracking-wider"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Print / Save PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
