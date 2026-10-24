import React from "react";
import {
  Printer,
  FileText,
  X,
  ShieldCheck,
  Building2,
  Calendar,
  CreditCard,
  Hash,
  Copy,
  Check,
  Sparkles,
} from "lucide-react";
import { printAcademicInvoice, AcademicInvoiceData } from "@/Utils/InvoicePrinter";
import { toast } from "sonner";
import { cn } from "@/Lib/Utils";

interface StudentInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: AcademicInvoiceData | null;
  loading?: boolean;
}

export function StudentInvoiceModal({
  isOpen,
  onClose,
  invoice,
  loading = false,
}: StudentInvoiceModalProps) {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const handleCopyNumber = () => {
    if (!invoice?.invoice_number) return;
    navigator.clipboard.writeText(invoice.invoice_number);
    setCopied(true);
    toast.success(`Copied Invoice ${invoice.invoice_number} To Clipboard.`);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    if (!invoice) return;
    printAcademicInvoice(invoice);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-background/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl border border-border/80 bg-card text-card-foreground shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border/80 px-4 sm:px-6 py-4 bg-surface/80 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <FileText className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-sm sm:text-base text-foreground tracking-tight flex items-center gap-1.5 truncate">
                <span>Official Academic Tax Invoice</span>
                <span className="hidden sm:inline-flex items-center gap-0.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[0.62rem] font-bold text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="h-2.5 w-2.5" />
                  DPDP Compliant
                </span>
              </h3>
              <p className="text-[0.68rem] font-mono text-muted-foreground truncate">
                {invoice?.invoice_number || "Retrieving Academic Receipt..."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {invoice && (
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground shadow-xs hover:bg-primary/90 transition-all cursor-pointer active:scale-95"
              >
                <Printer className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Print / Save PDF</span>
                <span className="sm:hidden">Print</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-1.5 text-muted-foreground hover:bg-surface hover:text-foreground transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs">
          {loading ? (
            <div className="py-14 text-center space-y-3">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <p className="text-xs text-muted-foreground font-medium">
                Fetching Official Academic Tax Invoice...
              </p>
            </div>
          ) : !invoice ? (
            <div className="py-12 text-center space-y-2">
              <FileText className="mx-auto h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm font-semibold text-foreground">No Invoice Record Found</p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                No Billing Transactions Are Linked To This Scholar Account Yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Institution Header Strip */}
              <div className="rounded-2xl border border-border/80 bg-gradient-to-br from-primary/5 via-card to-background p-4 sm:p-5 flex flex-col sm:flex-row justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm sm:text-base font-black tracking-tight text-primary uppercase">
                      {invoice.company?.name || "SaastaScholar™"}
                    </span>
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[0.62rem] font-bold text-primary">
                      {invoice.plan_tier} PASS
                    </span>
                  </div>
                  <p className="text-[0.7rem] text-muted-foreground">
                    {invoice.company?.tagline || "Quality Education, Without The Heavy Price"}
                  </p>
                  <p className="text-[0.65rem] text-muted-foreground/80 font-mono">
                    A DurgaAI Solutions Academic Enterprise · GST Exemption SAC 999293
                  </p>
                </div>

                <div className="sm:text-right space-y-1 shrink-0">
                  <div className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-[0.65rem] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                    ● {invoice.status || "PAID"}
                  </div>
                  <div className="flex sm:justify-end items-center gap-1">
                    <span className="font-mono text-xs font-bold text-foreground">
                      {invoice.invoice_number}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyNumber}
                      title="Copy invoice number"
                      className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-surface cursor-pointer transition-colors"
                    >
                      {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                    </button>
                  </div>
                  <p className="text-[0.65rem] text-muted-foreground flex sm:justify-end items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {invoice.date}
                  </p>
                </div>
              </div>

              {/* Two Column Scholar & Order Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Scholar Details Box */}
                <div className="rounded-2xl border border-border/80 bg-surface/50 p-4 space-y-2">
                  <span className="text-[0.65rem] font-bold uppercase tracking-wider text-primary block border-b border-border/60 pb-1">
                    Billed To (Student Scholar)
                  </span>
                  <div className="space-y-1">
                    <p className="font-bold text-sm text-foreground">
                      {invoice.customer.name}
                    </p>
                    <p className="text-muted-foreground">
                      <strong className="text-foreground font-semibold">Email:</strong> {invoice.customer.email}
                    </p>
                    <p className="text-muted-foreground">
                      <strong className="text-foreground font-semibold">Roll Number:</strong> {invoice.customer.roll_number || "—"}
                    </p>
                    <p className="text-muted-foreground">
                      <strong className="text-foreground font-semibold">Institution:</strong> {invoice.customer.university || "NIMS University"}
                    </p>
                    <p className="text-muted-foreground">
                      <strong className="text-foreground font-semibold">Cohort:</strong> {invoice.customer.department || "Academic"} · Sem {invoice.customer.semester || 1} ({invoice.customer.section || "A"})
                    </p>
                  </div>
                </div>

                {/* Billing & Gateway Specifications Box */}
                <div className="rounded-2xl border border-border/80 bg-surface/50 p-4 space-y-2">
                  <span className="text-[0.65rem] font-bold uppercase tracking-wider text-primary block border-b border-border/60 pb-1">
                    Transaction Audit Trail
                  </span>
                  <div className="space-y-1">
                    <p className="text-muted-foreground truncate">
                      <strong className="text-foreground font-semibold">Order ID:</strong>{" "}
                      <span className="font-mono text-[0.68rem]">{invoice.order_id}</span>
                    </p>
                    <p className="text-muted-foreground truncate">
                      <strong className="text-foreground font-semibold">Payment ID:</strong>{" "}
                      <span className="font-mono text-[0.68rem]">{invoice.payment_id}</span>
                    </p>
                    <p className="text-muted-foreground">
                      <strong className="text-foreground font-semibold">Billing Term:</strong> {invoice.billing_cycle} Pass
                    </p>
                    <p className="text-muted-foreground">
                      <strong className="text-foreground font-semibold">Payment Gateway:</strong> {invoice.financials.payment_gateway || "Razorpay Payments (India)"}
                    </p>
                    <p className="text-muted-foreground">
                      <strong className="text-foreground font-semibold">Place of Supply:</strong> Rajasthan (08)
                    </p>
                  </div>
                </div>
              </div>

              {/* Service Itemization Table */}
              <div className="overflow-hidden rounded-2xl border border-border/80 bg-surface/30">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border/80 bg-surface text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">
                      <th className="p-3">Academic Service Description</th>
                      <th className="p-3 text-center hidden sm:table-cell">SAC Code</th>
                      <th className="p-3 text-center hidden sm:table-cell">Cycle</th>
                      <th className="p-3 text-right">Amount (INR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60 text-xs">
                    <tr>
                      <td className="p-3">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="font-bold text-foreground">
                            {invoice.plan_name} Membership
                          </p>
                          <span className="sm:hidden text-[0.6rem] font-mono px-1.5 py-0.5 rounded bg-primary/10 text-primary font-bold">
                            {invoice.billing_cycle}
                          </span>
                        </div>
                        <p className="text-[0.68rem] text-muted-foreground mt-0.5 leading-relaxed">
                          {invoice.plan_description || "Handwritten lecture notes, question banks, and solutions"}
                        </p>
                        <p className="sm:hidden text-[0.62rem] text-muted-foreground/80 font-mono mt-0.5">
                          SAC Code: 999293
                        </p>
                      </td>
                      <td className="p-3 text-center font-mono text-muted-foreground hidden sm:table-cell">
                        999293
                      </td>
                      <td className="p-3 text-center font-medium hidden sm:table-cell">
                        {invoice.billing_cycle}
                      </td>
                      <td className="p-3 text-right font-bold text-foreground whitespace-nowrap">
                        ₹{invoice.financials.subtotal_inr.toFixed(2)}
                      </td>
                    </tr>
                    {invoice.financials.discount_inr > 0 && (
                      <tr className="bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 font-medium">
                        <td colSpan={1} className="p-2.5 pl-3 sm:col-span-3">
                          <div className="flex items-center gap-1.5">
                            <Sparkles className="h-3 w-3 shrink-0" />
                            <span>Voucher Applied ({invoice.financials.discount_code || "DISCOUNT"})</span>
                          </div>
                        </td>
                        <td className="p-2.5 pr-3 text-right font-bold whitespace-nowrap">
                          - ₹{invoice.financials.discount_inr.toFixed(2)}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Summary / Total Settled */}
              <div className="flex justify-end">
                <div className="w-full sm:w-72 rounded-2xl border border-border/80 bg-surface/60 p-3.5 space-y-1.5 text-xs">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Gross Subtotal:</span>
                    <span>₹{invoice.financials.subtotal_inr.toFixed(2)}</span>
                  </div>
                  {invoice.financials.discount_inr > 0 && (
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                      <span>Voucher Discount:</span>
                      <span>- ₹{invoice.financials.discount_inr.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-muted-foreground text-[0.68rem]">
                    <span>GST (CGST 0% + SGST 0%):</span>
                    <span>₹0.00</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-border/80 pt-2 font-black text-sm text-primary">
                    <span>Total Settled:</span>
                    <span className="text-base">₹{invoice.financials.total_paid_inr.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Digital Verification Notice */}
              <div className="rounded-2xl border border-dashed border-border/80 bg-surface/30 p-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-[0.65rem] text-muted-foreground">
                <div className="flex items-center gap-2 text-left">
                  <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>
                    Digitally generated proof of academic enrollment &amp; fee payment under DPDP Act 2023. No physical signature required.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex items-center gap-1 font-bold text-primary hover:underline cursor-pointer shrink-0 whitespace-nowrap"
                >
                  <Printer className="h-3 w-3" />
                  Print Official A4 PDF
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 border-t border-border/80 px-4 sm:px-6 py-3 bg-surface/70 shrink-0">
          <p className="text-[0.68rem] text-muted-foreground text-center sm:text-left">
            Questions? Contact <a href="mailto:support@saastascholar.in" className="text-primary font-semibold hover:underline">support@saastascholar.in</a>
          </p>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none inline-flex items-center justify-center rounded-xl border border-border bg-card hover:bg-surface px-4 py-2 text-xs font-bold text-foreground cursor-pointer transition-colors whitespace-nowrap shrink-0"
            >
              Close
            </button>
            {invoice && (
              <button
                type="button"
                onClick={handlePrint}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-xs hover:bg-primary/90 transition-all cursor-pointer active:scale-95 whitespace-nowrap shrink-0"
              >
                <Printer className="h-3.5 w-3.5 shrink-0" />
                <span>Print / Save PDF</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
