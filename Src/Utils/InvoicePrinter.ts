import { toast } from "sonner";

export interface AcademicInvoiceData {
  invoice_number: string;
  order_id: string;
  payment_id: string;
  date: string;
  status: string;
  billing_cycle: string;
  plan_tier: string;
  plan_name: string;
  plan_description?: string;
  customer: {
    name: string;
    email: string;
    phone?: string;
    roll_number?: string;
    university?: string;
    department?: string;
    semester?: string | number;
    section?: string;
  };
  financials: {
    subtotal_inr: number;
    discount_code?: string | null;
    discount_inr: number;
    total_paid_inr: number;
    currency: string;
    payment_gateway?: string;
  };
  company?: {
    name?: string;
    parent?: string;
    tagline?: string;
    support_email?: string;
    portal_domain?: string;
  };
}

export function generateInvoiceHtml(inv: AcademicInvoiceData): string {
  return `<!DOCTYPE html>
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
      font-size: 76px;
      font-weight: 900;
      color: rgba(15, 23, 42, 0.035);
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
    <button onclick="window.print()" style="background:#005F15; color:#ffffff; border:1px solid #00450f; padding:9px 22px; font-weight:800; cursor:pointer; font-size:12px; text-transform:uppercase; letter-spacing:0.5px; border-radius:4px;">
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
        <p class="company-meta">Support: ${inv.company?.support_email || "support@saastascholar.in"}</p>
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
        <p class="info-line"><strong>Payment Channel:</strong> ${inv.financials?.payment_gateway || "Razorpay Payments (India)"}</p>
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
}

export function printAcademicInvoice(inv: AcademicInvoiceData): boolean {
  if (!inv) {
    toast.error("No Invoice Record Data Available To Print.");
    return false;
  }

  const printWindow = window.open("", "_blank", "width=900,height=1000");
  if (!printWindow) {
    toast.error("Popup Window Blocked By Browser. Please Allow Popups To Save Or Print Your Official Invoice.");
    return false;
  }

  try {
    const html = generateInvoiceHtml(inv);
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    toast.success(`Preparing Tax Invoice ${inv.invoice_number} For Printing...`);
    return true;
  } catch (err: any) {
    toast.error("Failed To Render Printable Invoice.");
    return false;
  }
}
