import React, { useState, useEffect } from "react";
import {
  CheckCircle2,
  Copy,
  Percent,
  Plus,
  RefreshCw,
  Sparkles,
  Tag,
  Trash2,
  X,
  Zap,
  Gift,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Layers,
  FileText,
  BadgePercent,
  Coins,
} from "lucide-react";
import { toast } from "sonner";
import { adminSubscriptionApi, DiscountCoupon } from "@/Lib/Api";
import { cn } from "@/Lib/Utils";

export function AdminCouponsTab() {
  const [coupons, setCoupons] = useState<DiscountCoupon[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [newCoupon, setNewCoupon] = useState({
    code: "",
    discount_type: "flat" as "percent" | "flat" | "free",
    discount_percent: 20,
    discount_amount: 50,
    max_uses: 100,
    applicable_tier: "ALL",
    valid_days: 30,
    campaign_name: "",
    min_order_amount: 0,
    one_time_per_user: true,
  });

  // Fetch Existing Promo Discount Coupons From Database
  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const data = await adminSubscriptionApi.getCoupons();
      setCoupons(data);
    } catch (err: any) {
      toast.error(err.message || "Failed To Load Discount Coupons.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  // Generate Randomized Uppercase Promo Codes With Theme Prefixes
  const handleGenerateRandomCode = (prefixOverride?: string) => {
    const prefixes = ["SCHOLAR", "SAASTA", "EXAM", "TOPPER", "SEMESTER", "MERIT", "EARLYBIRD"];
    const prefix = prefixOverride || prefixes[Math.floor(Math.random() * prefixes.length)];
    const randSuffix = Math.floor(10 + Math.random() * 90);
    setNewCoupon((prev) => ({
      ...prev,
      code: `${prefix}${randSuffix}`,
    }));
  };

  // Create New Promotional Discount Coupon
  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let percentVal = 0;
      let flatVal = 0;

      if (newCoupon.discount_type === "percent") {
        percentVal = Number(newCoupon.discount_percent);
      } else if (newCoupon.discount_type === "flat") {
        flatVal = Number(newCoupon.discount_amount);
      } else if (newCoupon.discount_type === "free") {
        percentVal = 100;
      }

      const payload = {
        code: newCoupon.code.trim().toUpperCase(),
        discount_percent: percentVal,
        discount_amount: flatVal,
        max_uses: Number(newCoupon.max_uses) || 100,
        applicable_tier: newCoupon.applicable_tier,
        valid_days: Number(newCoupon.valid_days) || 30,
      };

      const res = await adminSubscriptionApi.createCoupon(payload);
      toast.success(res.message || "Discount Coupon Created Successfully!");
      setShowCreateModal(false);
      setNewCoupon({
        code: "",
        discount_type: "flat",
        discount_percent: 20,
        discount_amount: 50,
        max_uses: 100,
        applicable_tier: "ALL",
        valid_days: 30,
        campaign_name: "",
        min_order_amount: 0,
        one_time_per_user: true,
      });
      fetchCoupons();
    } catch (err: any) {
      toast.error(err.message || "Failed To Create Discount Coupon.");
    }
  };

  // Toggle Active Or Disabled State Of Coupon
  const handleToggleActive = async (coupon: DiscountCoupon) => {
    try {
      await adminSubscriptionApi.updateCoupon(coupon.id, { is_active: !coupon.is_active });
      toast.success(`Coupon '${coupon.code}' Is Now ${!coupon.is_active ? "Active" : "Disabled"}.`);
      fetchCoupons();
    } catch (err: any) {
      toast.error(err.message || "Failed To Update Coupon Status.");
    }
  };

  // Permanently Delete A Promo Coupon
  const handleDeleteCoupon = async (coupon: DiscountCoupon) => {
    if (!confirm(`Are You Sure You Want To Permanently Delete Promo Coupon '${coupon.code}'?`)) return;
    try {
      await adminSubscriptionApi.deleteCoupon(coupon.id);
      toast.success(`Coupon '${coupon.code}' Deleted Successfully.`);
      fetchCoupons();
    } catch (err: any) {
      toast.error(err.message || "Failed To Delete Coupon.");
    }
  };

  // Copy Coupon Code To Clipboard
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Copied Coupon '${code}' To Clipboard!`);
  };

  // Calculate Projected Student Savings For Live Voucher Preview
  const getSimulatedSavings = () => {
    const baseSamplePrice =
      newCoupon.applicable_tier === "BASIC"
        ? 99
        : newCoupon.applicable_tier === "PREMIUM"
        ? 129
        : newCoupon.applicable_tier === "ELITE"
        ? 159
        : 129; // Default To Premium ₹129 For Calculation

    if (newCoupon.discount_type === "free") {
      return { original: baseSamplePrice, discount: baseSamplePrice, final: 0 };
    }
    if (newCoupon.discount_type === "percent") {
      const disc = Math.round((baseSamplePrice * Number(newCoupon.discount_percent || 0)) / 100);
      return { original: baseSamplePrice, discount: disc, final: Math.max(0, baseSamplePrice - disc) };
    }
    const disc = Number(newCoupon.discount_amount || 0);
    return { original: baseSamplePrice, discount: disc, final: Math.max(0, baseSamplePrice - disc) };
  };

  const previewCalc = getSimulatedSavings();

  return (
    <div className="space-y-6">
      {/* Top Header & Action Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <h3 className="font-display font-bold text-base text-foreground">Discount Coupons &amp; Student Promo Codes</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Create Promotional Discount Codes For Students To Enter During Checkout For Plan Upgrades.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchCoupons}
            className="h-9 px-3.5 rounded-xl border border-border bg-card hover:bg-surface text-foreground font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            onClick={() => {
              handleGenerateRandomCode();
              setShowCreateModal(true);
            }}
            className="h-9 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <Plus className="h-4 w-4" />
            <span>Create Promo Code</span>
          </button>
        </div>
      </div>

      {/* Coupons Gallery Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {coupons.length === 0 ? (
          <div className="col-span-full rounded-3xl border border-dashed border-border bg-card/60 p-12 text-center space-y-3">
            <Tag className="h-10 w-10 mx-auto text-muted-foreground/40" />
            <h4 className="font-display font-bold text-base text-foreground">No Discount Codes Created Yet</h4>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Click &quot;Create Promo Code&quot; Above To Issue Percentage Or Flat Student Discounts.
            </p>
          </div>
        ) : (
          coupons.map((c) => {
            const isExpired = c.valid_until && new Date(c.valid_until) < new Date();
            const isExhausted = c.max_uses > 0 && c.times_used >= c.max_uses;
            const discountLabel =
              c.discount_percent === 100
                ? "100% FREE PASS"
                : c.discount_percent > 0
                ? `${c.discount_percent}% OFF`
                : `₹${c.discount_amount} FLAT OFF`;

            return (
              <div
                key={c.id}
                className={cn(
                  "rounded-2xl border p-4 shadow-xs flex flex-col justify-between space-y-3 transition-all",
                  c.is_active && !isExpired && !isExhausted
                    ? "border-emerald-500/30 bg-card hover:border-emerald-500/60"
                    : "border-border/80 bg-surface/50 opacity-75"
                )}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-black text-sm text-foreground bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-xl inline-flex items-center gap-1.5">
                      <span>{c.code}</span>
                      <button
                        type="button"
                        onClick={() => handleCopyCode(c.code)}
                        className="text-primary hover:text-primary-deep cursor-pointer"
                        title="Copy Code"
                      >
                        <Copy className="h-3 w-3" />
                      </button>
                    </span>

                    <span
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-[0.62rem] font-bold uppercase",
                        c.is_active && !isExpired && !isExhausted
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                          : isExpired
                          ? "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {isExpired ? "Expired" : isExhausted ? "Maxed Out" : c.is_active ? "Active" : "Disabled"}
                    </span>
                  </div>

                  <div className="mt-3">
                    <span className="font-display font-extrabold text-lg text-emerald-600 dark:text-emerald-400">
                      {discountLabel}
                    </span>
                    <p className="text-[0.68rem] text-muted-foreground mt-0.5">
                      Valid For: <span className="font-bold text-foreground">{c.applicable_tier}</span> Plan
                    </p>
                  </div>
                </div>

                <div className="border-t border-border/60 pt-3 space-y-2 text-[0.7rem] font-mono">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Redemptions:</span>
                    <span className="font-bold text-foreground">
                      {c.times_used} / {c.max_uses > 0 ? c.max_uses : "∞"}
                    </span>
                  </div>
                  {c.valid_until && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>Expires:</span>
                      <span className="font-bold text-foreground">
                        {new Date(c.valid_until).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(c)}
                      className="px-2.5 py-1 rounded-lg border border-border bg-card hover:bg-surface text-[0.68rem] font-semibold text-foreground cursor-pointer"
                    >
                      {c.is_active ? "Disable" : "Enable"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteCoupon(c)}
                      className="p-1 rounded-lg text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                      title="Delete Coupon"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Enhanced Create Promo Discount Code Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl border border-emerald-500/30 bg-[#06120b] shadow-[0_25px_70px_rgba(0,0,0,0.9),0_0_45px_rgba(5,150,105,0.25)] overflow-hidden flex flex-col text-slate-100 max-h-[92vh]">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-white/[0.08] flex items-center justify-between bg-[#081a0f]/90">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shadow-inner">
                  <Tag className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white tracking-tight">Create Promo Discount Code</h3>
                  <p className="text-xs text-slate-400">Issue New Discount Codes For Student Checkouts</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="h-8 w-8 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Form Scrollable Body */}
            <form onSubmit={handleCreateCoupon} className="p-6 space-y-4 overflow-y-auto text-xs">
              {/* Coupon Code Input & Random Generator */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-white text-xs flex items-center gap-1.5">
                    <span>Coupon Code</span>
                    <span className="text-[0.65rem] text-emerald-400 font-mono">(Uppercase Only)</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => handleGenerateRandomCode()}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Generate Random</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={newCoupon.code}
                  onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. SCHOLAR50"
                  required
                  className="h-11 w-full rounded-xl border border-emerald-500/30 bg-black/60 px-3.5 font-mono font-black text-sm tracking-widest uppercase text-white focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400 shadow-inner"
                />

                {/* Quick Prefix Switchers */}
                <div className="flex items-center gap-1.5 mt-2 overflow-x-auto pb-1 text-[0.68rem]">
                  <span className="text-slate-400 font-medium">Prefix Presets:</span>
                  {["SCHOLAR", "TOPPER", "FESTIVE", "MERIT", "VIP", "EARLYBIRD"].map((pfx) => (
                    <button
                      key={pfx}
                      type="button"
                      onClick={() => handleGenerateRandomCode(pfx)}
                      className="px-2 py-0.5 rounded-md bg-white/5 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-300 border border-white/10 font-mono transition-colors cursor-pointer"
                    >
                      {pfx}
                    </button>
                  ))}
                </div>
              </div>

              {/* Discount Model Type (3 Options) */}
              <div>
                <label className="block font-bold text-white text-xs mb-1.5">Discount Model &amp; Type</label>
                <div className="grid grid-cols-3 gap-2 p-1 rounded-2xl bg-black/50 border border-white/10">
                  <button
                    type="button"
                    onClick={() => setNewCoupon({ ...newCoupon, discount_type: "flat" })}
                    className={cn(
                      "py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5",
                      newCoupon.discount_type === "flat"
                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-950"
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <Coins className="h-3.5 w-3.5" />
                    <span>Flat Amount (₹)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewCoupon({ ...newCoupon, discount_type: "percent" })}
                    className={cn(
                      "py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5",
                      newCoupon.discount_type === "percent"
                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-950"
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <Percent className="h-3.5 w-3.5" />
                    <span>Percentage (%)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewCoupon({ ...newCoupon, discount_type: "free" })}
                    className={cn(
                      "py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5",
                      newCoupon.discount_type === "free"
                        ? "bg-gradient-to-r from-amber-500 to-amber-600 text-black font-extrabold shadow-md"
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <Gift className="h-3.5 w-3.5" />
                    <span>100% Free Pass</span>
                  </button>
                </div>
              </div>

              {/* Value Input & Quick Presets */}
              {newCoupon.discount_type === "flat" && (
                <div className="space-y-2">
                  <label className="block font-bold text-white text-xs">Flat Discount Amount In INR (₹)</label>
                  <input
                    type="number"
                    min={1}
                    max={1000}
                    value={newCoupon.discount_amount}
                    onChange={(e) => setNewCoupon({ ...newCoupon, discount_amount: Number(e.target.value) })}
                    className="h-10 w-full rounded-xl border border-white/15 bg-black/50 px-3 font-mono font-bold text-sm text-white focus:border-emerald-400 focus:outline-none"
                  />
                  <div className="flex items-center gap-1.5">
                    <span className="text-[0.68rem] text-slate-400 font-medium">Quick Presets:</span>
                    {[30, 50, 70, 100, 150].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setNewCoupon({ ...newCoupon, discount_amount: amt })}
                        className={cn(
                          "px-2.5 py-1 rounded-lg border text-[0.68rem] font-bold font-mono transition-colors cursor-pointer",
                          newCoupon.discount_amount === amt
                            ? "bg-emerald-500/20 border-emerald-400 text-emerald-300"
                            : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                        )}
                      >
                        ₹{amt} Off
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {newCoupon.discount_type === "percent" && (
                <div className="space-y-2">
                  <label className="block font-bold text-white text-xs">Discount Percentage (1% - 100%)</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={newCoupon.discount_percent}
                    onChange={(e) => setNewCoupon({ ...newCoupon, discount_percent: Number(e.target.value) })}
                    className="h-10 w-full rounded-xl border border-white/15 bg-black/50 px-3 font-mono font-bold text-sm text-white focus:border-emerald-400 focus:outline-none"
                  />
                  <div className="flex items-center gap-1.5">
                    <span className="text-[0.68rem] text-slate-400 font-medium">Quick Presets:</span>
                    {[10, 20, 25, 50, 75].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => setNewCoupon({ ...newCoupon, discount_percent: pct })}
                        className={cn(
                          "px-2.5 py-1 rounded-lg border text-[0.68rem] font-bold font-mono transition-colors cursor-pointer",
                          newCoupon.discount_percent === pct
                            ? "bg-emerald-500/20 border-emerald-400 text-emerald-300"
                            : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                        )}
                      >
                        {pct}% Off
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {newCoupon.discount_type === "free" && (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-300 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-amber-200">
                    <Gift className="h-4 w-4" />
                    <span>Full 100% Fee Waiver Pass</span>
                  </div>
                  <p className="text-[0.72rem] text-amber-300/80 leading-normal">
                    This Coupon Completely Waives The Order Amount To ₹0, Instantly Upgrading The Student Account To The Selected Plan Tier Without Requiring Payment Processing.
                  </p>
                </div>
              )}

              {/* Tier & Maximum Usages */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-white text-xs mb-1.5">Applicable Tier</label>
                  <select
                    value={newCoupon.applicable_tier}
                    onChange={(e) => setNewCoupon({ ...newCoupon, applicable_tier: e.target.value })}
                    className="h-10 w-full rounded-xl border border-white/15 bg-black/60 px-3 text-xs font-semibold text-white focus:border-emerald-400 focus:outline-none cursor-pointer"
                  >
                    <option value="ALL">All Paid Membership Plans</option>
                    <option value="BASIC">Basic Plan Only (₹99)</option>
                    <option value="PREMIUM">Premium Plan Only (₹129)</option>
                    <option value="ELITE">Elite Plan Only (₹159)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-white text-xs mb-1.5">Max Usages</label>
                  <input
                    type="number"
                    min={1}
                    max={10000}
                    value={newCoupon.max_uses}
                    onChange={(e) => setNewCoupon({ ...newCoupon, max_uses: Number(e.target.value) })}
                    className="h-10 w-full rounded-xl border border-white/15 bg-black/60 px-3 font-mono text-xs text-white focus:border-emerald-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Validity Days */}
              <div>
                <label className="block font-bold text-white text-xs mb-1.5">Validity (Days)</label>
                <input
                  type="number"
                  min={1}
                  max={365}
                  value={newCoupon.valid_days}
                  onChange={(e) => setNewCoupon({ ...newCoupon, valid_days: Number(e.target.value) })}
                  className="h-10 w-full rounded-xl border border-white/15 bg-black/60 px-3 font-mono text-xs text-white focus:border-emerald-400 focus:outline-none"
                />
              </div>

              {/* Live Student Checkout Voucher Preview */}
              <div className="rounded-2xl border border-emerald-500/25 bg-emerald-950/20 p-4 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
                  <span className="flex items-center gap-1.5">
                    <BadgePercent className="h-4 w-4" />
                    <span>Live Student Checkout Preview</span>
                  </span>
                  <span className="font-mono bg-emerald-500/15 px-2 py-0.5 rounded text-[0.65rem] border border-emerald-500/30">
                    {newCoupon.code || "SCHOLARXX"}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between font-mono text-xs">
                  <div>
                    <span className="text-slate-400 block text-[0.7rem]">Standard Premium Plan:</span>
                    <span className="line-through text-slate-500">₹{previewCalc.original}</span>
                    <span className="ml-2 font-bold text-emerald-400">→ ₹{previewCalc.final}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[0.68rem] text-slate-400 block">Student Saves:</span>
                    <span className="text-emerald-400 font-extrabold text-sm">₹{previewCalc.discount}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 font-bold text-xs text-slate-300 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 font-extrabold text-xs text-white shadow-lg shadow-emerald-900/40 transition-all cursor-pointer border border-emerald-400/30"
                >
                  Create Promo Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
