"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import NotificationCenter from "@/components/NotificationCenter";
import { FaComments, FaPaperPlane, FaPlus } from "react-icons/fa";

type Ticket = {
  id: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
  messages: Array<{
    id: string;
    senderName: string;
    senderRole: string;
    message: string;
    createdAt: string;
  }>;
};

export default function SupportPage() {
  const { data: session, status } = useSession();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [activeTicketId, setActiveTicketId] = useState("");
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");

  const activeTicket = useMemo(
    () =>
      tickets.find((ticket) => ticket.id === activeTicketId) ||
      tickets[0],
    [activeTicketId, tickets]
  );

  const loadTickets = useCallback(async () => {
    if (!session?.user) {
      return;
    }

    const res = await fetch("/api/support/tickets");
    const data = await res.json();

    if (data.tickets) {
      setTickets(data.tickets);
      setActiveTicketId((current) => current || data.tickets[0]?.id || "");
    }
  }, [session?.user]);

  useEffect(() => {
    loadTickets();

    const timer = window.setInterval(loadTickets, 15000);

    return () => window.clearInterval(timer);
  }, [loadTickets]);

  const submitTicket = async () => {
    if (!subject || !message) {
      setNotice("Please complete all fields.");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/support/create-ticket", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subject,
        message,
      }),
    });

    const data = await res.json();
    setNotice(data.message || data.error || "Support ticket submitted.");
    setLoading(false);

    if (res.ok) {
      setSubject("");
      setMessage("");
      await loadTickets();
    }
  };

  const sendReply = async () => {
    if (!activeTicket || !reply.trim()) {
      setNotice("Select a ticket and enter a message.");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/support/message", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ticketId: activeTicket.id,
        message: reply,
      }),
    });

    const data = await res.json();
    setNotice(data.message || data.error || "Message sent.");
    setReply("");
    setLoading(false);

    if (res.ok) {
      await loadTickets();
    }
  };

  if (status === "loading") {
    return (
      <main className="min-h-screen bg-slate-100 p-6 text-slate-900">
        <div className="mx-auto max-w-5xl rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
          Loading support workspace...
        </div>
      </main>
    );
  }

  if (!session?.user) {
    return (
      <main className="min-h-screen bg-slate-100 p-6 text-slate-900">
        <div className="mx-auto max-w-3xl rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-extrabold text-slate-950">
            Support access requires login
          </h1>
          <p className="mt-3 text-slate-700">
            Sign in to create tickets, view replies, and continue support
            conversations with the operations team.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-flex rounded-lg bg-blue-700 px-5 py-3 font-bold text-white transition hover:bg-blue-800"
          >
            Login
          </Link>
        </div>
      </main>
    );
  }

  if (session.user.role === "admin") {
    return (
      <main className="min-h-screen bg-slate-100 p-6 text-slate-900">
        <div className="mx-auto max-w-3xl rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-extrabold text-slate-950">
            Admin support access lives in the dashboard
          </h1>
          <p className="mt-3 text-slate-700">
            Admins respond to customer-created tickets from the protected
            operations queue.
          </p>
          <Link
            href="/admin#support"
            className="mt-6 inline-flex rounded-lg bg-blue-700 px-5 py-3 font-bold text-white transition hover:bg-blue-800"
          >
            Open support queue
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 p-5 text-slate-950 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-extrabold uppercase text-blue-700">
              Customer support center
            </p>
            <h1 className="mt-2 text-3xl font-extrabold md:text-5xl">
              Shipment Support Workspace
            </h1>
            <p className="mt-3 max-w-3xl text-lg text-slate-700">
              Create shipment support tickets and continue threaded
              conversations with the logistics operations team.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <NotificationCenter />
            <div className="rounded-lg border border-blue-200 bg-blue-50 px-5 py-4 font-bold text-blue-800">
              {session.user.email}
            </div>
          </div>
        </div>

        {notice && (
          <div className="mb-6 rounded-lg border border-blue-200 bg-white px-5 py-4 font-semibold text-slate-800 shadow-sm">
            {notice}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[420px_1fr]">
          <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                <FaPlus />
              </div>
              <h2 className="text-2xl font-extrabold">New Support Ticket</h2>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-bold text-slate-700">
                Ticket Subject
                <input
                  type="text"
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
                  placeholder="Shipment delay, delivery issue, billing question"
                  className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-base font-semibold text-slate-950 outline-none transition focus:border-blue-600"
                />
              </label>

              <label className="block text-sm font-bold text-slate-700">
                Support Message
                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Describe the issue and include any tracking number."
                  rows={7}
                  className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-base font-semibold text-slate-950 outline-none transition focus:border-blue-600"
                />
              </label>

              <button
                onClick={submitTicket}
                disabled={loading}
                className="w-full rounded-lg bg-blue-700 px-5 py-3 font-extrabold text-white transition hover:bg-blue-800 disabled:opacity-60"
              >
                Submit Support Ticket
              </button>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
            <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 p-5">
                <h2 className="text-2xl font-extrabold">My Tickets</h2>
              </div>
              <div className="max-h-[620px] overflow-y-auto p-3">
                {tickets.map((ticket) => (
                  <button
                    key={ticket.id}
                    onClick={() => setActiveTicketId(ticket.id)}
                    className={`mb-3 w-full rounded-lg border p-4 text-left transition ${
                      activeTicket?.id === ticket.id
                        ? "border-blue-400 bg-blue-50"
                        : "border-slate-200 bg-white hover:bg-slate-50"
                    }`}
                  >
                    <p className="font-extrabold text-slate-950">
                      {ticket.subject}
                    </p>
                    <p className="mt-2 text-sm font-bold text-slate-600">
                      {ticket.status}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 p-6">
                <div className="flex items-center gap-3">
                  <FaComments className="text-blue-700" />
                  <h2 className="text-2xl font-extrabold">
                    Live Support Thread
                  </h2>
                </div>
                <p className="mt-2 text-slate-700">
                  {activeTicket?.subject ||
                    "Select or create a ticket to begin."}
                </p>
              </div>

              {activeTicket && (
                <div className="p-6">
                  <div className="mb-5 max-h-96 space-y-4 overflow-y-auto rounded-lg bg-slate-50 p-4">
                    {activeTicket.messages.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-lg border border-slate-200 bg-white p-4"
                      >
                        <div className="mb-2 flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                          <p className="font-extrabold text-slate-950">
                            {item.senderName}
                            <span className="ml-2 rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-700">
                              {item.senderRole}
                            </span>
                          </p>
                          <p className="text-xs font-semibold text-slate-500">
                            {new Date(item.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <p className="text-slate-700">{item.message}</p>
                      </div>
                    ))}
                  </div>

                  <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                    <textarea
                      value={reply}
                      onChange={(event) => setReply(event.target.value)}
                      rows={3}
                      placeholder="Write a reply..."
                      className="rounded-lg border border-slate-300 px-4 py-3 text-slate-950 outline-none focus:border-blue-600"
                    />
                    <button
                      onClick={sendReply}
                      disabled={loading}
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-700 px-5 py-3 font-extrabold text-white transition hover:bg-blue-800 disabled:opacity-60"
                    >
                      <FaPaperPlane />
                      Send
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
