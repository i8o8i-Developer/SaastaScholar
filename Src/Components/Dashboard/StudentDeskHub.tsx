import React, { useState, useEffect, useMemo } from "react";
import {
  MessageSquare,
  Plus,
  Loader2,
  CheckCircle2,
  Clock,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  Send,
  User,
  ChevronDown,
  ChevronUp,
  Tag,
  Filter,
  RefreshCw,
  Search,
  Check,
  ArrowRight,
  LifeBuoy,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/Hooks/UseAuth";
import { cn } from "@/Lib/Utils";
import { communityApi, SupportTicket } from "@/Lib/Api";

const CATEGORIES = [
  { id: "ALL", label: "All Categories" },
  { id: "ACADEMIC", label: "Academic & Notes" },
  { id: "EXAMS", label: "Exams & PYQs" },
  { id: "LABS", label: "Lab Manuals & Practical" },
  { id: "TIMETABLE", label: "Timetable & Slots" },
  { id: "FEE", label: "Fee & Subscription" },
  { id: "TECHNICAL", label: "Technical & Portal" },
  { id: "GENERAL", label: "General Inquiries" },
];

export function StudentDeskHub() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [expandedTicketId, setExpandedTicketId] = useState<string | null>(null);
  const [messageInputs, setMessageInputs] = useState<Record<string, string>>({});
  const [isSendingMessage, setIsSendingMessage] = useState<Record<string, boolean>>({});

  // Form State
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("GENERAL");
  const [priority, setPriority] = useState("MEDIUM");

  const fetchTickets = async (quiet = false) => {
    if (!quiet) setIsLoading(true);
    try {
      const data = await communityApi.getTickets();
      const list = Array.isArray(data) ? data : (data as any)?.results || [];
      setTickets(list);
      // If expanded ticket exists, refresh it in place
    } catch (error: any) {
      if (!quiet) {
        toast.error(error.message || "Failed To Load Support Tickets.");
      }
    } finally {
      if (!quiet) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      toast.error("Please Fill In Both The Subject And Description.");
      return;
    }

    setIsSubmitting(true);
    try {
      const newTicket = await communityApi.createTicket({
        subject: subject.trim(),
        description: description.trim(),
        category,
        priority,
      });
      toast.success("Support Ticket Submitted Successfully!");
      setSubject("");
      setDescription("");
      setShowForm(false);
      await fetchTickets(true);
      if (newTicket?.id) {
        setExpandedTicketId(newTicket.id);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed To Submit Ticket.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendMessage = async (ticketId: string) => {
    const text = (messageInputs[ticketId] || "").trim();
    if (!text) return;

    setIsSendingMessage((prev) => ({ ...prev, [ticketId]: true }));
    try {
      await communityApi.sendTicketMessage(ticketId, text);
      toast.success("Follow-Up Sent To Administration.");
      setMessageInputs((prev) => ({ ...prev, [ticketId]: "" }));
      await fetchTickets(true);
    } catch (error: any) {
      toast.error(error.message || "Failed To Send Message.");
    } finally {
      setIsSendingMessage((prev) => ({ ...prev, [ticketId]: false }));
    }
  };

  const handleUpdateStatus = async (ticketId: string, newStatus: string) => {
    try {
      await communityApi.updateTicketStatus(ticketId, newStatus);
      toast.success(newStatus === "RESOLVED" ? "Ticket Marked As Resolved!" : "Ticket Reopened.");
      fetchTickets(true);
    } catch (error: any) {
      toast.error(error.message || "Failed To Update Status.");
    }
  };

  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      if (selectedCategory !== "ALL" && t.category !== selectedCategory) return false;
      if (statusFilter !== "ALL" && t.status !== statusFilter) return false;
      return true;
    });
  }, [tickets, selectedCategory, statusFilter]);

  const stats = useMemo(() => {
    const total = tickets.length;
    const open = tickets.filter((t) => t.status === "OPEN" || t.status === "IN_PROGRESS").length;
    const resolved = tickets.filter((t) => t.status === "RESOLVED" || t.status === "CLOSED").length;
    return { total, open, resolved };
  }, [tickets]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card to-primary/5 p-6 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-primary/10 text-primary shadow-xs">
              <LifeBuoy className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">
                Student Support & Query Resolution Desk
              </h2>
              <p className="text-xs text-muted-foreground">
                Direct Official Communication Channel With University Department Administration
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/25 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>{showForm ? "Cancel Ticket" : "Raise Support Ticket"}</span>
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <div className="rounded-2xl border border-border/80 bg-card p-2.5 sm:p-4 shadow-2xs flex items-center justify-between gap-2 min-w-0">
          <div className="min-w-0">
            <span className="text-[0.58rem] sm:text-[0.68rem] font-bold text-muted-foreground uppercase tracking-wider block truncate">Total Raised</span>
            <span className="text-base sm:text-xl font-extrabold text-foreground">{stats.total}</span>
          </div>
          <div className="grid h-7 w-7 sm:h-8 sm:w-8 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
            <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </div>
        </div>

        <div className="rounded-2xl border border-border/80 bg-card p-2.5 sm:p-4 shadow-2xs flex items-center justify-between gap-2 min-w-0">
          <div className="min-w-0">
            <span className="text-[0.58rem] sm:text-[0.68rem] font-bold text-muted-foreground uppercase tracking-wider block truncate">In Progress</span>
            <span className="text-base sm:text-xl font-extrabold text-amber-600 dark:text-amber-400">{stats.open}</span>
          </div>
          <div className="grid h-7 w-7 sm:h-8 sm:w-8 shrink-0 place-items-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </div>
        </div>

        <div className="rounded-2xl border border-border/80 bg-card p-2.5 sm:p-4 shadow-2xs flex items-center justify-between gap-2 min-w-0">
          <div className="min-w-0">
            <span className="text-[0.58rem] sm:text-[0.68rem] font-bold text-muted-foreground uppercase tracking-wider block truncate">Resolved</span>
            <span className="text-base sm:text-xl font-extrabold text-emerald-600 dark:text-emerald-400">{stats.resolved}</span>
          </div>
          <div className="grid h-7 w-7 sm:h-8 sm:w-8 shrink-0 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </div>
        </div>
      </div>

      {/* New Ticket Form */}
      {showForm && (
        <div className="rounded-3xl border border-primary/30 bg-card p-6 shadow-lg space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <h3 className="font-display text-sm font-bold text-foreground flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-primary" />
              Submit A Query Or Grievance To Administration
            </h3>
            <span className="text-[0.65rem] text-muted-foreground uppercase font-bold tracking-wider">
              Student: {user?.full_name || user?.email} ({user?.roll_number || "Enrolled"})
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="sm:col-span-1 space-y-1">
                <label className="block font-bold text-muted-foreground">Department Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="h-10 w-full rounded-2xl border border-border bg-background px-3 font-semibold text-foreground focus:border-primary focus:outline-none"
                >
                  <option value="GENERAL">General Inquiries</option>
                  <option value="ACADEMIC">Academic & Notes</option>
                  <option value="EXAMS">Exams & PYQs</option>
                  <option value="LABS">Lab Manuals & Practical</option>
                  <option value="TIMETABLE">Timetable & Slots</option>
                  <option value="FEE">Fee & Subscription</option>
                  <option value="TECHNICAL">Technical & Portal</option>
                </select>
              </div>

              <div className="sm:col-span-1 space-y-1">
                <label className="block font-bold text-muted-foreground">Priority Level *</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="h-10 w-full rounded-2xl border border-border bg-background px-3 font-semibold text-foreground focus:border-primary focus:outline-none"
                >
                  <option value="LOW">Low Priority (General)</option>
                  <option value="MEDIUM">Medium Priority (Standard)</option>
                  <option value="HIGH">High Priority (Exam / Class Related)</option>
                  <option value="URGENT">Critical / Urgent (Immediate Action)</option>
                </select>
              </div>

              <div className="sm:col-span-1 space-y-1">
                <label className="block font-bold text-muted-foreground">Subject Headline *</label>
                <input
                  type="text"
                  placeholder="Summary Of The Query"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  className="h-10 w-full rounded-2xl border border-border bg-background px-3.5 font-semibold text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-muted-foreground">Detailed Description *</label>
              <textarea
                placeholder="Explain The Full Details, Subject Code, Or Issue You Are Experiencing..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                required
                className="w-full rounded-2xl border border-border bg-background p-3.5 font-normal text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none resize-y"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="h-9 px-4 rounded-xl border border-border bg-surface text-muted-foreground hover:text-foreground font-bold cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="h-9 px-5 rounded-xl bg-primary text-primary-foreground font-bold shadow-sm hover:bg-primary-deep cursor-pointer transition-all active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit Support Ticket"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 scrollbar-none min-w-0">
          {["ALL", "OPEN", "IN_PROGRESS", "RESOLVED"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                "rounded-2xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0",
                statusFilter === status
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "border border-border/80 bg-card text-muted-foreground hover:bg-surface hover:text-foreground"
              )}
            >
              {status === "ALL" && "All Statuses"}
              {status === "OPEN" && "Open Queries"}
              {status === "IN_PROGRESS" && "In Progress"}
              {status === "RESOLVED" && "Resolved"}
            </button>
          ))}
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="h-9 rounded-2xl border border-border/80 bg-card px-3 text-xs font-bold text-foreground focus:border-primary focus:outline-none"
        >
          {CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {/* Tickets List with Interactive Follow-up Conversations */}
      {isLoading ? (
        <div className="flex h-48 flex-col items-center justify-center gap-2 rounded-3xl border border-border/80 bg-card/50">
          <Loader2 className="h-8 w-8 animate-spin text-primary/70" />
          <span className="text-xs font-bold text-muted-foreground">Loading Support Queries...</span>
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border/80 bg-card/30 p-12 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary mb-3">
            <LifeBuoy className="h-6 w-6 opacity-60" />
          </div>
          <h3 className="font-display text-base font-bold text-foreground">No Support Tickets Found</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            {statusFilter !== "ALL" || selectedCategory !== "ALL"
              ? "Try Adjusting Your Status Or Category Filters."
              : "Need Help With Exams, Timetable, Or Notes? Submit A Query To The Desk!"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTickets.map((ticket) => {
            const isExpanded = expandedTicketId === ticket.id;

            return (
              <div
                key={ticket.id}
                className={cn(
                  "rounded-3xl border bg-card transition-all duration-200 shadow-2xs overflow-hidden",
                  isExpanded ? "border-primary/50 shadow-md" : "border-border/80 hover:border-primary/30"
                )}
              >
                {/* Header Summary Row */}
                <div
                  onClick={() => setExpandedTicketId(isExpanded ? null : ticket.id)}
                  className="p-5 sm:p-6 cursor-pointer select-none space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-primary">{ticket.ticket_number || "NW-TKT"}</span>
                      <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-[0.65rem] font-bold text-foreground/80">
                        {ticket.category || "GENERAL"}
                      </span>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[0.65rem] font-extrabold",
                          ticket.priority === "URGENT" ? "bg-rose-500/15 text-rose-600 dark:text-rose-400" :
                          ticket.priority === "HIGH" ? "bg-amber-500/15 text-amber-600 dark:text-amber-400" :
                          "bg-surface text-muted-foreground"
                        )}
                      >
                        {ticket.priority} Priority
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[0.65rem] font-extrabold",
                          ticket.status === "RESOLVED" ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" :
                          ticket.status === "IN_PROGRESS" ? "bg-blue-500/15 text-blue-600 dark:text-blue-400" :
                          "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                        )}
                      >
                        {ticket.status === "RESOLVED" && <CheckCircle2 className="h-3 w-3" />}
                        {ticket.status === "IN_PROGRESS" && <Clock className="h-3 w-3" />}
                        {ticket.status === "OPEN" && <AlertCircle className="h-3 w-3" />}
                        <span>{ticket.status}</span>
                      </span>

                      <div className="text-muted-foreground">
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-display text-base sm:text-lg font-bold text-foreground">{ticket.subject}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{ticket.description}</p>
                  </div>

                  <div className="flex items-center justify-between text-[0.7rem] text-muted-foreground pt-1">
                    <span>
                      Created: {new Date(ticket.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </span>
                    <span className="font-semibold text-primary">
                      {isExpanded ? "Hide Conversation Thread ▲" : "Click To View Full Follow-Up Thread ▼"}
                    </span>
                  </div>
                </div>

                {/* Expanded Interactive Thread */}
                {isExpanded && (
                  <div className="border-t border-border/80 bg-surface/30 p-5 sm:p-6 space-y-4">
                    {/* Original Ticket Description Card */}
                    <div className="rounded-2xl border border-border/80 bg-card p-4 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-foreground">Original Query Details:</span>
                        <span className="text-[0.65rem] text-muted-foreground font-mono">
                          {new Date(ticket.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-foreground/90 whitespace-pre-wrap leading-relaxed">{ticket.description}</p>
                    </div>

                    {/* Official Response Banner (if available) */}
                    {ticket.admin_response && (
                      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 space-y-1">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                            Official Administration Resolution
                          </span>
                        </div>
                        <p className="text-xs text-emerald-950 dark:text-emerald-100 whitespace-pre-wrap pl-6 leading-relaxed">
                          {ticket.admin_response}
                        </p>
                      </div>
                    )}

                    {/* Threaded Follow-Up Conversation */}
                    <div className="space-y-3 pt-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <MessageSquare className="h-3.5 w-3.5 text-primary" />
                        Follow-Up Messages ({(ticket.messages || []).length})
                      </h4>

                      {(ticket.messages || []).length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground italic">
                          No follow-up messages yet. You can send updates to the admin team below.
                        </div>
                      ) : (
                        ticket.messages.map((msg) => (
                          <div
                            key={msg.id}
                            className={cn(
                              "rounded-2xl p-3.5 text-xs shadow-2xs space-y-1 max-w-xl",
                              msg.is_staff_reply
                                ? "bg-emerald-500/10 border border-emerald-500/20 mr-auto"
                                : "bg-card border border-border ml-auto"
                            )}
                          >
                            <div className="flex items-center justify-between gap-2 border-b border-border/40 pb-1">
                              <span className="font-bold text-foreground flex items-center gap-1">
                                {msg.is_staff_reply ? (
                                  <span className="text-emerald-600 dark:text-emerald-400 font-extrabold flex items-center gap-1">
                                    <ShieldCheck className="h-3 w-3" /> Admin Support
                                  </span>
                                ) : (
                                  <span>{msg.sender_name || "You (Scholar)"}</span>
                                )}
                              </span>
                              <span className="text-[0.65rem] text-muted-foreground font-mono">
                                {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            </div>
                            <p className="text-foreground/90 whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Follow-Up Input & Status Controls */}
                    <div className="pt-2 space-y-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Type Follow-Up Details Or Extra Info For Admin..."
                          value={messageInputs[ticket.id] || ""}
                          onChange={(e) =>
                            setMessageInputs((prev) => ({
                              ...prev,
                              [ticket.id]: e.target.value,
                            }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage(ticket.id);
                            }
                          }}
                          className="h-10 flex-1 rounded-2xl border border-border bg-card px-3.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none shadow-xs"
                        />
                        <button
                          onClick={() => handleSendMessage(ticket.id)}
                          disabled={isSendingMessage[ticket.id] || !messageInputs[ticket.id]?.trim()}
                          className="h-10 px-4 rounded-2xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary-deep transition-all active:scale-95 disabled:opacity-40 cursor-pointer shadow-xs inline-flex items-center gap-1.5"
                        >
                          {isSendingMessage[ticket.id] ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <>
                              <Send className="h-3.5 w-3.5" />
                              <span>Send</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Student Status Action Buttons */}
                      <div className="flex items-center justify-between text-xs pt-1 border-t border-border/50">
                        <span className="text-[0.7rem] text-muted-foreground">
                          Status: <strong className="text-foreground">{ticket.status}</strong>
                        </span>

                        <div className="flex items-center gap-2">
                          {ticket.status !== "RESOLVED" ? (
                            <button
                              onClick={() => handleUpdateStatus(ticket.id, "RESOLVED")}
                              className="inline-flex items-center gap-1 rounded-xl bg-emerald-500/15 border border-emerald-500/30 px-3 py-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25 transition-colors cursor-pointer"
                            >
                              <Check className="h-3 w-3" />
                              <span>Mark As Satisfied / Resolved</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUpdateStatus(ticket.id, "OPEN")}
                              className="inline-flex items-center gap-1 rounded-xl border border-border bg-surface px-3 py-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                            >
                              <RefreshCw className="h-3 w-3" />
                              <span>Reopen Query</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
