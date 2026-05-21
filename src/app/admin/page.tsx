"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import NotificationCenter from "@/components/NotificationCenter";
import {
  FaBoxOpen,
  FaChartLine,
  FaComments,
  FaPaperPlane,
  FaPlus,
  FaShieldAlt,
  FaSignOutAlt,
  FaTrash,
  FaTruck,
} from "react-icons/fa";

const STAGES = [
  "Shipment Created",
  "Package Received",
  "In Transit",
  "Out for Delivery",
  "Delivered",
];

const TICKET_STATUSES = [
  "Open",
  "Pending",
  "Resolved",
  "Closed",
];

type Shipment = {
  id: string;
  trackingNumber: string;
  origin: string;
  destination: string;
  status: string;
  currentLocation?: string | null;
  createdAt: string;
  user?: {
    email?: string | null;
  } | null;
  stages?: Array<{
    id: string;
    stage: string;
    sequence: number;
    achievedAt: string;
    location?: string | null;
    notes?: string | null;
  }>;
};

type Ticket = {
  id: string;
  subject: string;
  message: string;
  status: string;
  userName?: string | null;
  userEmail?: string | null;
  createdAt: string;
  updatedAt: string;
  messages: Array<{
    id: string;
    senderName: string;
    senderRole: string;
    message: string;
    createdAt: string;
  }>;
};

export default function AdminPage() {
  const { data: session, status } = useSession();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [activeTicketId, setActiveTicketId] = useState("");
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const [form, setForm] = useState({
    trackingNumber: "",
    origin: "",
    destination: "",
    status: "Shipment Created",
    customerEmail: "",
  });
  const [stageForm, setStageForm] = useState({
    trackingNumber: "",
    status: "Package Received",
    location: "",
    notes: "",
  });
  const [supportReply, setSupportReply] = useState("");
  const [supportStatus, setSupportStatus] = useState("Pending");

  const isAdmin = session?.user?.role === "admin";

  const activeTicket = useMemo(
    () =>
      tickets.find((ticket) => ticket.id === activeTicketId) ||
      tickets[0],
    [activeTicketId, tickets]
  );

  const stats = useMemo(() => {
    const delivered = shipments.filter(
      (shipment) => shipment.status === "Delivered"
    ).length;
    const openTickets = tickets.filter(
      (ticket) => ticket.status !== "Closed" && ticket.status !== "Resolved"
    ).length;

    return {
      shipments: shipments.length,
      delivered,
      openTickets,
      activeRoutes: shipments.filter(
        (shipment) => shipment.status !== "Delivered"
      ).length,
    };
  }, [shipments, tickets]);

  const loadDashboard = useCallback(async () => {
    if (!isAdmin) {
      return;
    }

    const [shipmentRes, ticketRes] = await Promise.all([
      fetch("/api/admin/shipments"),
      fetch("/api/support/tickets"),
    ]);

    const shipmentData = await shipmentRes.json();
    const ticketData = await ticketRes.json();

    if (shipmentData.shipments) {
      setShipments(shipmentData.shipments);
    }

    if (ticketData.tickets) {
      setTickets(ticketData.tickets);
      setActiveTicketId((current) => current || ticketData.tickets[0]?.id || "");
    }
  }, [isAdmin]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const createShipment = async () => {
    if (!form.trackingNumber || !form.origin || !form.destination) {
      setNotice("Tracking number, origin, and destination are required.");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/admin/create-shipment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });
    const data = await res.json();

    setNotice(data.message || data.error || "Shipment action completed.");
    setLoading(false);

    if (res.ok) {
      await loadDashboard();
    }
  };

  const addStage = async () => {
    if (!stageForm.trackingNumber || !stageForm.location) {
      setNotice("Tracking number and stage location are required.");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/admin/add-event", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(stageForm),
    });
    const data = await res.json();

    setNotice(data.message || data.error || "Stage update completed.");
    setLoading(false);

    if (res.ok) {
      await loadDashboard();
    }
  };

  const deleteShipment = async (trackingNumber: string) => {
    if (!confirm(`Delete shipment ${trackingNumber}?`)) {
      return;
    }

    setLoading(true);
    const res = await fetch("/api/admin/delete-shipment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        trackingNumber,
      }),
    });
    const data = await res.json();

    setNotice(data.message || data.error || "Shipment delete completed.");
    setLoading(false);

    if (res.ok) {
      await loadDashboard();
    }
  };

  const sendSupportReply = async () => {
    if (!activeTicket || !supportReply.trim()) {
      setNotice("Select a ticket and enter a reply.");
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
        message: supportReply,
        status: supportStatus,
      }),
    });
    const data = await res.json();

    setNotice(data.message || data.error || "Support reply completed.");
    setSupportReply("");
    setLoading(false);

    if (res.ok) {
      await loadDashboard();
    }
  };

  if (status === "loading") {
    return (
      <main className="min-h-screen bg-slate-100 p-6 text-slate-900">
        <div className="mx-auto max-w-6xl rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
          Loading admin control center...
        </div>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="min-h-screen bg-slate-100 p-6 text-slate-900">
        <div className="mx-auto max-w-3xl rounded-lg border border-red-200 bg-white p-8 shadow-sm">
          <div className="mb-4 flex items-center gap-3 text-red-700">
            <FaShieldAlt />
            <h1 className="text-2xl font-extrabold">Admin access required</h1>
          </div>
          <p className="text-slate-700">
            Your account is authenticated, but it is not authorized for
            logistics operations administration.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex rounded-lg bg-blue-700 px-5 py-3 font-bold text-white transition hover:bg-blue-800"
          >
            Return home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-950">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <aside className="border-r border-slate-800 bg-slate-950 p-6 text-white">
          <Link
            href="/"
            className="inline-flex rounded-xl border border-blue-400/60 bg-slate-900 px-4 py-3 text-lg font-extrabold uppercase text-white"
          >
            SSC Tracking
          </Link>
          <nav className="mt-10 space-y-2">
            {["Operations", "Shipments", "Stages", "Support"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="block rounded-lg px-4 py-3 font-bold text-slate-200 transition hover:bg-blue-600 hover:text-white"
              >
                {item}
              </a>
            ))}
          </nav>
        </aside>

        <section className="p-5 md:p-8">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-extrabold uppercase text-blue-700">
                Logistics control center
              </p>
              <h1 className="mt-2 text-3xl font-extrabold text-slate-950 md:text-5xl">
                Admin Operations Dashboard
              </h1>
              <p className="mt-3 max-w-3xl text-base text-slate-700 md:text-lg">
                Manage shipment creation, real stage progression, and support
                conversations from one protected enterprise workspace.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <NotificationCenter />
              <div className="rounded-lg border border-blue-200 bg-blue-50 px-5 py-4 font-bold text-blue-800">
                Signed in as {session?.user?.name || "Admin"}
              </div>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-5 py-4 font-extrabold text-red-700 shadow-sm transition hover:bg-red-50"
              >
                <FaSignOutAlt />
                Logout
              </button>
            </div>
          </div>

          {notice && (
            <div className="mb-6 rounded-lg border border-blue-200 bg-white px-5 py-4 font-semibold text-slate-800 shadow-sm">
              {notice}
            </div>
          )}

          <section
            id="operations"
            className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4"
          >
            {[
              ["Total Shipments", stats.shipments, <FaBoxOpen key="icon" />],
              ["Active Routes", stats.activeRoutes, <FaTruck key="icon" />],
              ["Delivered", stats.delivered, <FaChartLine key="icon" />],
              ["Open Support", stats.openTickets, <FaComments key="icon" />],
            ].map(([label, value, icon]) => (
              <div
                key={String(label)}
                className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                  {icon}
                </div>
                <p className="text-sm font-bold uppercase text-slate-500">
                  {label}
                </p>
                <p className="mt-2 text-3xl font-extrabold text-slate-950">
                  {value}
                </p>
              </div>
            ))}
          </section>

          <section
            id="shipments"
            className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-[420px_1fr]"
          >
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-extrabold text-slate-950">
                Shipment Management
              </h2>
              <div className="mt-6 space-y-4">
                {[
                  ["Tracking Number", "trackingNumber"],
                  ["Origin", "origin"],
                  ["Destination", "destination"],
                  ["Customer Email", "customerEmail"],
                ].map(([label, key]) => (
                  <label
                    key={key}
                    className="block text-sm font-bold text-slate-700"
                  >
                    {label}
                    <input
                      value={form[key as keyof typeof form]}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          [key]: event.target.value,
                        }))
                      }
                      className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-base font-semibold text-slate-950 outline-none transition focus:border-blue-600"
                    />
                  </label>
                ))}
                <label className="block text-sm font-bold text-slate-700">
                  Status
                  <select
                    value={form.status}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        status: event.target.value,
                      }))
                    }
                    className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-base font-semibold text-slate-950 outline-none transition focus:border-blue-600"
                  >
                    {STAGES.map((stage) => (
                      <option key={stage}>{stage}</option>
                    ))}
                  </select>
                </label>
                <button
                  onClick={createShipment}
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-3 rounded-lg bg-blue-700 px-5 py-3 font-extrabold text-white transition hover:bg-blue-800 disabled:opacity-60"
                >
                  <FaPlus />
                  Create or Update Shipment
                </button>
              </div>
            </div>

            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 p-6">
                <h2 className="text-2xl font-extrabold text-slate-950">
                  Shipment Board
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left">
                  <thead className="bg-slate-50 text-sm uppercase text-slate-600">
                    <tr>
                      <th className="px-5 py-4">Tracking</th>
                      <th className="px-5 py-4">Route</th>
                      <th className="px-5 py-4">Status</th>
                      <th className="px-5 py-4">Customer</th>
                      <th className="px-5 py-4">Location</th>
                      <th className="px-5 py-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {shipments.map((shipment) => (
                      <tr key={shipment.id}>
                        <td className="px-5 py-4 font-extrabold text-slate-950">
                          {shipment.trackingNumber}
                        </td>
                        <td className="px-5 py-4 text-slate-700">
                          {shipment.origin} to {shipment.destination}
                        </td>
                        <td className="px-5 py-4">
                          <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-bold text-blue-700">
                            {shipment.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-slate-700">
                          {shipment.user?.email || "Unassigned"}
                        </td>
                        <td className="px-5 py-4 text-slate-700">
                          {shipment.currentLocation || "Not set"}
                        </td>
                        <td className="px-5 py-4">
                          <button
                            onClick={() =>
                              deleteShipment(shipment.trackingNumber)
                            }
                            className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 font-bold text-red-700 transition hover:bg-red-50"
                          >
                            <FaTrash />
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section
            id="stages"
            className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-[420px_1fr]"
          >
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-extrabold text-slate-950">
                Stage Update
              </h2>
              <div className="mt-6 space-y-4">
                <label className="block text-sm font-bold text-slate-700">
                  Tracking Number
                  <input
                    value={stageForm.trackingNumber}
                    onChange={(event) =>
                      setStageForm((current) => ({
                        ...current,
                        trackingNumber: event.target.value,
                      }))
                    }
                    className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-950 outline-none focus:border-blue-600"
                  />
                </label>
                <label className="block text-sm font-bold text-slate-700">
                  Stage
                  <select
                    value={stageForm.status}
                    onChange={(event) =>
                      setStageForm((current) => ({
                        ...current,
                        status: event.target.value,
                      }))
                    }
                    className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-950 outline-none focus:border-blue-600"
                  >
                    {STAGES.map((stage) => (
                      <option key={stage}>{stage}</option>
                    ))}
                  </select>
                </label>
                <label className="block text-sm font-bold text-slate-700">
                  Location
                  <input
                    value={stageForm.location}
                    onChange={(event) =>
                      setStageForm((current) => ({
                        ...current,
                        location: event.target.value,
                      }))
                    }
                    className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-950 outline-none focus:border-blue-600"
                  />
                </label>
                <label className="block text-sm font-bold text-slate-700">
                  Notes
                  <textarea
                    value={stageForm.notes}
                    onChange={(event) =>
                      setStageForm((current) => ({
                        ...current,
                        notes: event.target.value,
                      }))
                    }
                    rows={4}
                    className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-950 outline-none focus:border-blue-600"
                  />
                </label>
                <button
                  onClick={addStage}
                  disabled={loading}
                  className="w-full rounded-lg bg-slate-950 px-5 py-3 font-extrabold text-white transition hover:bg-slate-800 disabled:opacity-60"
                >
                  Mark Stage Completed
                </button>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-extrabold text-slate-950">
                Recent Stage Activity
              </h2>
              <div className="mt-6 space-y-4">
                {shipments.slice(0, 6).map((shipment) => (
                  <div
                    key={shipment.id}
                    className="rounded-lg border border-slate-200 p-4"
                  >
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <p className="font-extrabold text-slate-950">
                        {shipment.trackingNumber}
                      </p>
                      <span className="text-sm font-bold text-slate-600">
                        {shipment.stages?.length || 0} completed stages
                      </span>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {STAGES.map((stage) => {
                        const completed = shipment.stages?.some(
                          (item) => item.stage === stage
                        );
                        return (
                          <span
                            key={stage}
                            className={`rounded-full px-3 py-1 text-xs font-bold ${
                              completed
                                ? "bg-blue-50 text-blue-700"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {stage}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section
            id="support"
            className="grid grid-cols-1 gap-6 xl:grid-cols-[360px_1fr]"
          >
            <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 p-5">
                <h2 className="text-2xl font-extrabold text-slate-950">
                  Support Queue
                </h2>
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
                    <p className="mt-1 text-sm text-slate-600">
                      {ticket.userEmail || "No customer email"}
                    </p>
                    <span className="mt-3 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                      {ticket.status}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 p-6">
                <h2 className="text-2xl font-extrabold text-slate-950">
                  Ticket Conversation
                </h2>
                <p className="mt-2 text-slate-700">
                  {activeTicket?.subject || "Select a ticket from the queue."}
                </p>
              </div>

              {activeTicket && (
                <div className="p-6">
                  <div className="mb-6 max-h-80 space-y-4 overflow-y-auto rounded-lg bg-slate-50 p-4">
                    {activeTicket.messages.map((message) => (
                      <div
                        key={message.id}
                        className="rounded-lg border border-slate-200 bg-white p-4"
                      >
                        <div className="mb-2 flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                          <p className="font-extrabold text-slate-950">
                            {message.senderName}
                            <span className="ml-2 rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-700">
                              {message.senderRole}
                            </span>
                          </p>
                          <p className="text-xs font-semibold text-slate-500">
                            {new Date(message.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <p className="text-slate-700">{message.message}</p>
                      </div>
                    ))}
                  </div>

                  <div className="grid gap-4 md:grid-cols-[1fr_180px]">
                    <textarea
                      value={supportReply}
                      onChange={(event) => setSupportReply(event.target.value)}
                      rows={4}
                      placeholder="Write a professional support response..."
                      className="rounded-lg border border-slate-300 px-4 py-3 text-slate-950 outline-none focus:border-blue-600"
                    />
                    <div className="space-y-3">
                      <select
                        value={supportStatus}
                        onChange={(event) =>
                          setSupportStatus(event.target.value)
                        }
                        className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-950 outline-none focus:border-blue-600"
                      >
                        {TICKET_STATUSES.map((item) => (
                          <option key={item}>{item}</option>
                        ))}
                      </select>
                      <button
                        onClick={sendSupportReply}
                        disabled={loading}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-3 font-extrabold text-white transition hover:bg-blue-800 disabled:opacity-60"
                      >
                        <FaPaperPlane />
                        Reply
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
