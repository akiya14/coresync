"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import styles from "./page.module.css";

type View = "dashboard" | "materials" | "transfers" | "reports" | "audit" | "settings";
type Role = "Administrator" | "Inventory Staff" | "Production Staff" | "Management";
type AuditEvent = { id: number; timestamp: string; action: string; record: string; user: string; role: Role };
type AttachmentCategory = "Photo" | "Scanned Form" | "Receipt" | "Quality Control Result";
type Attachment = { id: number; name: string; type: string; size: number; category: AttachmentCategory; dataUrl: string; uploadedAt: string };

type Material = {
  id: number;
  date: string;
  type: string;
  supplier: string;
  quantity: number;
  unit: string;
  movement: "Received" | "Used";
  encodedBy: string;
};

type Transfer = {
  id: number;
  date: string;
  documentNo: string;
  seriesNo: string;
  source: string;
  destination: string;
  bagNo: string;
  analysisNo: string;
  tagNo: string;
  quantity: number;
  weight: number;
  moisture: number;
  mesh: string;
  location: string;
  status: "Pending" | "Verified";
  attachments?: Attachment[];
};

const starterMaterials: Material[] = [
  { id: 1, date: "2026-06-06", type: "Coconut Shell Charcoal", supplier: "Toril Coco Supply", quantity: 180, unit: "bags", movement: "Received", encodedBy: "Akiya Murai" },
  { id: 2, date: "2026-06-05", type: "Coconut Shell Charcoal", supplier: "Davao Carbon Traders", quantity: 120, unit: "bags", movement: "Received", encodedBy: "Lynnard Panares" },
  { id: 3, date: "2026-06-05", type: "Coconut Shell Charcoal", supplier: "Rotary Dryer Line", quantity: 60, unit: "bags", movement: "Used", encodedBy: "Akiya Murai" },
  { id: 4, date: "2026-06-04", type: "Raw Charcoal", supplier: "Mindanao Coco Hub", quantity: 95, unit: "bags", movement: "Received", encodedBy: "Lynnard Panares" },
  { id: 5, date: "2026-06-06", type: "Raw Charcoal", supplier: "Activation Line A", quantity: 77, unit: "bags", movement: "Used", encodedBy: "Akiya Murai" },
  { id: 6, date: "2026-06-03", type: "Activated Carbon 4x8", supplier: "Production Output", quantity: 70, unit: "bags", movement: "Received", encodedBy: "Lynnard Panares" },
  { id: 7, date: "2026-06-06", type: "Activated Carbon 4x8", supplier: "Finished Goods Transfer", quantity: 58, unit: "bags", movement: "Used", encodedBy: "Akiya Murai" },
  { id: 8, date: "2026-06-02", type: "Activated Carbon 8x16", supplier: "Production Output", quantity: 110, unit: "bags", movement: "Received", encodedBy: "Lynnard Panares" },
  { id: 9, date: "2026-06-05", type: "Activated Carbon 8x16", supplier: "Export Order Allocation", quantity: 35, unit: "bags", movement: "Used", encodedBy: "Akiya Murai" },
  { id: 10, date: "2026-06-01", type: "Washed Activated Carbon", supplier: "Washing Section", quantity: 85, unit: "bags", movement: "Received", encodedBy: "Lynnard Panares" },
  { id: 11, date: "2026-06-06", type: "Washed Activated Carbon", supplier: "Quality Control Release", quantity: 20, unit: "bags", movement: "Used", encodedBy: "Akiya Murai" },
  { id: 12, date: "2026-06-03", type: "Powdered Activated Carbon", supplier: "Pulverizing Section", quantity: 55, unit: "bags", movement: "Received", encodedBy: "Lynnard Panares" },
  { id: 13, date: "2026-06-06", type: "Powdered Activated Carbon", supplier: "Customer Order Allocation", quantity: 31, unit: "bags", movement: "Used", encodedBy: "Akiya Murai" },
  { id: 14, date: "2026-06-02", type: "Off-Spec Carbon for Reprocessing", supplier: "Quality Control", quantity: 28, unit: "bags", movement: "Received", encodedBy: "Lynnard Panares" },
  { id: 15, date: "2026-06-05", type: "Off-Spec Carbon for Reprocessing", supplier: "Reactivation Line", quantity: 20, unit: "bags", movement: "Used", encodedBy: "Akiya Murai" },
];

const starterTransfers: Transfer[] = [
  { id: 1, date: "2026-06-06", documentNo: "MTF-2026-0142", seriesNo: "S-142", source: "Raw Mats", destination: "Rotary Dryer", bagNo: "B-2201", analysisNo: "AN-641", tagNo: "TAG-331", quantity: 20, weight: 820, moisture: 8.2, mesh: "4x8", location: "Bay 2", status: "Verified", attachments: [{ id: 1001, name: "Material Transfer Form 0041.jpg", type: "image/jpeg", size: 112725, category: "Scanned Form", dataUrl: "/demo-attachments/material-transfer-form-0041.jpg", uploadedAt: "2026-06-06T08:00:00.000Z" }] },
  { id: 2, date: "2026-06-06", documentNo: "MTF-2026-0143", seriesNo: "S-143", source: "Rotary Dryer", destination: "Activation", bagNo: "B-2202", analysisNo: "AN-642", tagNo: "TAG-332", quantity: 18, weight: 738, moisture: 5.6, mesh: "6x12", location: "Line A", status: "Pending", attachments: [{ id: 1002, name: "Raw Material Transfer Form 0291.jpg", type: "image/jpeg", size: 135004, category: "Scanned Form", dataUrl: "/demo-attachments/raw-material-transfer-form-0291.jpg", uploadedAt: "2026-06-06T08:05:00.000Z" }] },
  { id: 3, date: "2026-06-05", documentNo: "MTF-2026-0141", seriesNo: "S-141", source: "Activation", destination: "Finished Goods", bagNo: "B-2198", analysisNo: "AN-637", tagNo: "TAG-328", quantity: 25, weight: 1025, moisture: 3.1, mesh: "8x16", location: "Warehouse 1", status: "Verified", attachments: [{ id: 1003, name: "Material Transfer Form 0031.jpg", type: "image/jpeg", size: 190869, category: "Scanned Form", dataUrl: "/demo-attachments/material-transfer-form-0031.jpg", uploadedAt: "2026-06-05T08:00:00.000Z" }] },
  { id: 4, date: "2026-06-05", documentNo: "MTF-2026-0140", seriesNo: "S-140", source: "Washing Section", destination: "Drying Area", bagNo: "B-2195", analysisNo: "AN-635", tagNo: "TAG-325", quantity: 20, weight: 810, moisture: 12.4, mesh: "8x16", location: "Drying Bay 1", status: "Verified" },
  { id: 5, date: "2026-06-04", documentNo: "MTF-2026-0139", seriesNo: "S-139", source: "Pulverizing", destination: "Packing", bagNo: "B-2190", analysisNo: "AN-631", tagNo: "TAG-321", quantity: 31, weight: 775, moisture: 4.2, mesh: "PAC", location: "Packing Line 2", status: "Pending" },
  { id: 6, date: "2026-06-04", documentNo: "MTF-2026-0138", seriesNo: "S-138", source: "Quality Control", destination: "Reactivation", bagNo: "B-2187", analysisNo: "AN-628", tagNo: "TAG-318", quantity: 20, weight: 805, moisture: 6.8, mesh: "Mixed", location: "Hold Area", status: "Verified" },
  { id: 7, date: "2026-06-03", documentNo: "MTF-2026-0137", seriesNo: "S-137", source: "Finished Goods", destination: "Dispatch", bagNo: "B-2180", analysisNo: "AN-620", tagNo: "TAG-310", quantity: 35, weight: 1435, moisture: 3.4, mesh: "8x16", location: "Loading Bay", status: "Pending" },
];

const icons: Record<string, React.ReactNode> = {
  dashboard: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
  materials: <><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5M12 22V12"/></>,
  transfers: <><path d="M17 3h4v4M21 3l-7 7M7 21H3v-4M3 21l7-7"/><path d="M14 3H6a3 3 0 0 0-3 3v7M10 21h8a3 3 0 0 0 3-3v-7"/></>,
  reports: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M8 13h8M8 17h5"/></>,
  search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
  plus: <><path d="M12 5v14M5 12h14"/></>,
  download: <><path d="M12 3v12M7 10l5 5 5-5"/><path d="M5 21h14"/></>,
  bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></>,
  logout: <><path d="M10 17l5-5-5-5M15 12H3"/><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/></>,
  check: <path d="m5 12 4 4L19 6"/>,
  settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6 1.7 1.7 0 0 0 10 3V2.8h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z"/></>,
  edit: <><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z"/></>,
  trash: <><path d="M3 6h18M8 6V4h8v2M19 6l-1 15H6L5 6M10 11v6M14 11v6"/></>,
  audit: <><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></>,
  print: <><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 14h12v8H6z"/></>,
  attachment: <><path d="m21.4 11.6-8.9 8.9a6 6 0 0 1-8.5-8.5l9.6-9.6a4 4 0 0 1 5.7 5.7l-9.6 9.6a2 2 0 1 1-2.8-2.8l8.9-8.9"/></>,
};

function Icon({ name, size = 20 }: { name: string; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{icons[name]}</svg>;
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-PH", { month: "short", day: "numeric", year: "numeric" }).format(new Date(`${date}T00:00:00`));
}

function downloadCsv(filename: string, rows: (string | number)[][]) {
  const csv = rows.map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export default function Home() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [view, setView] = useState<View>("dashboard");
  const [materials, setMaterials] = useState<Material[]>(starterMaterials);
  const [transfers, setTransfers] = useState<Transfer[]>(starterTransfers);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [role, setRole] = useState<Role>("Administrator");
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<"material" | "transfer" | "delete" | null>(null);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [editingTransfer, setEditingTransfer] = useState<Transfer | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ kind: "material" | "transfer"; id: number; label: string } | null>(null);
  const [notice, setNotice] = useState("");
  const [storageReady, setStorageReady] = useState(false);

  /* Load optional demo data without preventing the login screen from rendering. */
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      const savedMaterials = localStorage.getItem("coresync-materials");
      const savedTransfers = localStorage.getItem("coresync-transfers");
      const savedAudit = localStorage.getItem("coresync-audit");
      const savedRole = localStorage.getItem("coresync-role") as Role | null;
      const session = localStorage.getItem("coresync-session");
      if (savedMaterials) setMaterials(JSON.parse(savedMaterials));
      if (savedTransfers) setTransfers(JSON.parse(savedTransfers));
      if (savedAudit) setAuditEvents(JSON.parse(savedAudit));
      if (savedRole) setRole(savedRole);
      if (session) setLoggedIn(true);
    } catch {
      localStorage.removeItem("coresync-materials");
      localStorage.removeItem("coresync-transfers");
      localStorage.removeItem("coresync-session");
    } finally {
      setStorageReady(true);
    }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!storageReady) return;
    try {
      localStorage.setItem("coresync-materials", JSON.stringify(materials));
      localStorage.setItem("coresync-transfers", JSON.stringify(transfers));
      localStorage.setItem("coresync-audit", JSON.stringify(auditEvents));
      localStorage.setItem("coresync-role", role);
    } catch (error) {
      console.warn("CoreSync browser storage is full. Remove large attachments before reloading.", error);
    }
  }, [materials, transfers, auditEvents, role, storageReady]);

  const stock = useMemo(() => materials.reduce((total, item) => total + (item.movement === "Received" ? item.quantity : -item.quantity), 0), [materials]);
  const materialBalances = useMemo(() => {
    const balances = new Map<string, number>();
    materials.forEach((item) => balances.set(item.type, (balances.get(item.type) ?? 0) + (item.movement === "Received" ? item.quantity : -item.quantity)));
    return [...balances.entries()].map(([type, quantity]) => ({ type, quantity })).sort((a, b) => a.quantity - b.quantity);
  }, [materials]);
  const verified = transfers.filter((item) => item.status === "Verified").length;
  const pending = transfers.length - verified;
  const lowStockThreshold = 30;
  const lowStockItems = materialBalances.filter((item) => item.quantity <= lowStockThreshold);
  const canManageMaterials = role === "Administrator" || role === "Inventory Staff";
  const canManageTransfers = role === "Administrator" || role === "Production Staff";
  const canVerify = role === "Administrator" || role === "Management";
  const canDelete = role === "Administrator";

  function logAction(action: string, record: string) {
    setAuditEvents((current) => [{ id: Date.now(), timestamp: new Date().toISOString(), action, record, user: "Akiya Murai", role }, ...current].slice(0, 200));
  }

  function flash(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2600);
  }

  function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    localStorage.setItem("coresync-session", "demo");
    setLoggedIn(true);
  }

  function logout() {
    localStorage.removeItem("coresync-session");
    setLoggedIn(false);
  }

  function addMaterial(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const material: Material = {
      id: editingMaterial?.id ?? Date.now(),
      date: String(data.get("date")),
      type: String(data.get("type")),
      supplier: String(data.get("supplier")),
      quantity: Number(data.get("quantity")),
      unit: String(data.get("unit")),
      movement: String(data.get("movement")) as Material["movement"],
      encodedBy: "Akiya Murai",
    };
    setMaterials((current) => editingMaterial ? current.map((item) => item.id === material.id ? material : item) : [material, ...current]);
    const wasEditing = Boolean(editingMaterial);
    logAction(wasEditing ? "Updated material" : "Created material", `${material.type} (${material.quantity} ${material.unit})`);
    setEditingMaterial(null);
    setModal(null);
    flash(wasEditing ? "Material transaction updated." : "Material transaction saved.");
  }

  function addTransfer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const transfer: Transfer = {
      id: editingTransfer?.id ?? Date.now(),
      date: String(data.get("date")),
      documentNo: String(data.get("documentNo")),
      seriesNo: String(data.get("seriesNo")),
      source: String(data.get("source")),
      destination: String(data.get("destination")),
      bagNo: String(data.get("bagNo")),
      analysisNo: String(data.get("analysisNo")),
      tagNo: String(data.get("tagNo")),
      quantity: Number(data.get("quantity")),
      weight: Number(data.get("weight")),
      moisture: Number(data.get("moisture")),
      mesh: String(data.get("mesh")),
      location: String(data.get("location")),
      status: editingTransfer?.status ?? "Pending",
      attachments: JSON.parse(String(data.get("attachments") || "[]")) as Attachment[],
    };
    setTransfers((current) => editingTransfer ? current.map((item) => item.id === transfer.id ? transfer : item) : [transfer, ...current]);
    const wasEditing = Boolean(editingTransfer);
    logAction(wasEditing ? "Updated transfer" : "Created transfer", `${transfer.documentNo} (${transfer.attachments?.length ?? 0} attachments)`);
    setEditingTransfer(null);
    setModal(null);
    flash(wasEditing ? "Output transfer updated." : "Output transfer recorded.");
  }

  function verifyTransfer(id: number) {
    const transfer = transfers.find((item) => item.id === id);
    setTransfers((current) => current.map((item) => item.id === id ? { ...item, status: "Verified" } : item));
    logAction("Verified transfer", transfer?.documentNo ?? `Transfer ${id}`);
    flash("Transfer verified.");
  }

  function requestDelete(kind: "material" | "transfer", id: number, label: string) {
    setDeleteTarget({ kind, id, label });
    setModal("delete");
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    if (deleteTarget.kind === "material") setMaterials((current) => current.filter((item) => item.id !== deleteTarget.id));
    else setTransfers((current) => current.filter((item) => item.id !== deleteTarget.id));
    logAction(`Deleted ${deleteTarget.kind}`, deleteTarget.label);
    setDeleteTarget(null);
    setModal(null);
    flash("Record deleted.");
  }

  function resetDemoData() {
    setMaterials(starterMaterials);
    setTransfers(starterTransfers);
    setAuditEvents([]);
    setSearch("");
    flash("Starter data restored.");
  }

  function changeRole(nextRole: Role) {
    setRole(nextRole);
    setView("dashboard");
    setAuditEvents((current) => [{ id: Date.now(), timestamp: new Date().toISOString(), action: "Changed demo role", record: nextRole, user: "Akiya Murai", role: nextRole }, ...current].slice(0, 200));
    flash(`Role changed to ${nextRole}.`);
  }

  function printTransfer(item: Transfer) {
    const popup = window.open("", "_blank", "width=850,height=900");
    if (!popup) return flash("Allow pop-ups to print the transfer form.");
    popup.document.write(`<!doctype html><html><head><title>${item.documentNo}</title><style>body{font-family:Arial;color:#18384a;padding:40px}h1{color:#087db5}table{width:100%;border-collapse:collapse;margin-top:25px}td{border:1px solid #ccdce4;padding:12px}td:first-child{font-weight:bold;background:#eef8fc;width:35%}.signatures{display:grid;grid-template-columns:repeat(3,1fr);gap:30px;margin-top:80px}.signatures div{border-top:1px solid #333;padding-top:8px;text-align:center}@media print{button{display:none}}</style></head><body><h1>BF Industries, Inc.</h1><h2>Material Transfer Record</h2><p>CoreSync reference: ${item.documentNo}</p><table><tr><td>Date</td><td>${formatDate(item.date)}</td></tr><tr><td>Series / Control Number</td><td>${item.seriesNo}</td></tr><tr><td>Movement</td><td>${item.source} to ${item.destination}</td></tr><tr><td>Bag / Analysis / Tag</td><td>${item.bagNo} / ${item.analysisNo} / ${item.tagNo}</td></tr><tr><td>Quantity and Weight</td><td>${item.quantity} bags / ${item.weight} kg</td></tr><tr><td>Moisture Content / Mesh</td><td>${item.moisture}% / ${item.mesh}</td></tr><tr><td>Location</td><td>${item.location}</td></tr><tr><td>Status</td><td>${item.status}</td></tr></table><div class="signatures"><div>Prepared by</div><div>Transferred by</div><div>Received by</div></div><button onclick="window.print()">Print form</button></body></html>`);
    popup.document.close();
  }

  function closeModal() {
    setModal(null);
    setEditingMaterial(null);
    setEditingTransfer(null);
    setDeleteTarget(null);
  }

  if (!loggedIn) {
    return (
      <main className={styles.loginPage}>
        <section className={styles.loginBrand}>
          <div className={styles.brandMark}><span>BF</span></div>
          <p className={styles.eyebrow}>BF Industries, Inc.</p>
          <h1>One clear view of every material movement.</h1>
          <p>CoreSync connects raw material records, production transfers, and operational reporting in one reliable workspace.</p>
          <div className={styles.brandStats}>
            <div><strong>Real-time</strong><span>Monitoring</span></div>
            <div><strong>Centralized</strong><span>Records</span></div>
            <div><strong>Traceable</strong><span>Transfers</span></div>
          </div>
        </section>
        <section className={styles.loginPanel}>
          <form className={styles.loginCard} onSubmit={login}>
            <div className={styles.mobileLogo}><div className={styles.brandMark}><span>BF</span></div><b>CoreSync</b></div>
            <p className={styles.eyebrow}>Welcome back</p>
            <h2>Sign in to CoreSync</h2>
            <p className={styles.muted}>Use the demo account below to explore the system.</p>
            <label>Email address<input type="email" defaultValue="admin@coresync.ph" required /></label>
            <label>Password<input type="password" defaultValue="coresync123" required /></label>
            <div className={styles.loginMeta}><label className={styles.checkbox}><input type="checkbox" defaultChecked /> Remember me</label><span>Demo access</span></div>
            <button className={styles.primaryButton} type="submit">Sign in securely <span>→</span></button>
            <div className={styles.demoNote}><b>Demo credentials</b><span>admin@coresync.ph / coresync123</span></div>
          </form>
        </section>
      </main>
    );
  }

  const pageTitles: Record<View, [string, string]> = {
    dashboard: ["Operations Dashboard", "A live overview of raw materials and production transfers."],
    materials: ["Raw Materials", "Record incoming materials, usage, and current stock movement."],
    transfers: ["Output Transfers", "Track each transfer from its source through verification."],
    reports: ["Reports", "Generate downloadable operational records for management review."],
    audit: ["Audit Trail", "Review who changed, verified, or deleted each record."],
    settings: ["Settings", "Manage local demo data and system preferences."],
  };

  return (
    <main className={styles.app}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}><div className={styles.brandMark}><span>BF</span></div><div><b>CoreSync</b><small>Operations system</small></div></div>
        <nav>
          {(["dashboard", "materials", "transfers", "reports", "audit", "settings"] as View[]).map((item) => (
            <button key={item} className={view === item ? styles.activeNav : ""} onClick={() => setView(item)}>
              <Icon name={item} /><span>{item === "materials" ? "Raw Materials" : item === "transfers" ? "Output Transfers" : item[0].toUpperCase() + item.slice(1)}</span>
              {item === "transfers" && pending > 0 && <em>{pending}</em>}
            </button>
          ))}
        </nav>
        <div className={styles.sidebarFooter}>
          <p>System status</p><div className={styles.status}><i />All systems operational</div>
          <button onClick={logout}><Icon name="logout" /><span>Sign out</span></button>
        </div>
      </aside>

      <section className={styles.workspace}>
        <header className={styles.topbar}>
          <button className={styles.mobileNav} onClick={() => setView("dashboard")}>C</button>
          <div><h1>{pageTitles[view][0]}</h1><p>{pageTitles[view][1]}</p></div>
          <div className={styles.userArea}>
            <button className={styles.iconButton}><Icon name="bell" /><i /></button>
            <div className={styles.avatar}>AM</div><div className={styles.userName}><b>Akiya Murai</b><select className={styles.roleSelect} value={role} onChange={(event) => changeRole(event.target.value as Role)}><option>Administrator</option><option>Inventory Staff</option><option>Production Staff</option><option>Management</option></select></div>
          </div>
        </header>

        <div className={styles.content}>
          {view === "dashboard" && <Dashboard stock={stock} lowStockThreshold={lowStockThreshold} lowStockItems={lowStockItems} materialBalances={materialBalances} transfers={transfers} materials={materials} pending={pending} setView={setView} canCreateTransfer={canManageTransfers} openModal={(next) => { if (next === "material" && !canManageMaterials) return flash("This role cannot manage materials."); if (next === "transfer" && !canManageTransfers) return flash("This role cannot create transfers."); setEditingMaterial(null); setEditingTransfer(null); setModal(next); }} />}
          {view === "materials" && <Materials materials={materials} search={search} setSearch={setSearch} canManage={canManageMaterials} canDelete={canDelete} openModal={() => { setEditingMaterial(null); setModal("material"); }} edit={(item) => { setEditingMaterial(item); setModal("material"); }} remove={(item) => requestDelete("material", item.id, `${item.type} - ${item.quantity} ${item.unit}`)} />}
          {view === "transfers" && <Transfers transfers={transfers} search={search} setSearch={setSearch} canManage={canManageTransfers} canVerify={canVerify} canDelete={canDelete} openModal={() => { setEditingTransfer(null); setModal("transfer"); }} verify={verifyTransfer} print={printTransfer} edit={(item) => { setEditingTransfer(item); setModal("transfer"); }} remove={(item) => requestDelete("transfer", item.id, item.documentNo)} />}
          {view === "reports" && <Reports materials={materials} transfers={transfers} stock={stock} verified={verified} />}
          {view === "audit" && <AuditTrail events={auditEvents} />}
          {view === "settings" && <Settings materials={materials.length} transfers={transfers.length} reset={resetDemoData} />}
        </div>
      </section>

      {notice && <div className={styles.toast}><span><Icon name="check" size={16} /></span>{notice}</div>}
      {modal === "material" && <MaterialModal close={closeModal} submit={addMaterial} item={editingMaterial} />}
      {modal === "transfer" && <TransferModal close={closeModal} submit={addTransfer} item={editingTransfer} />}
      {modal === "delete" && deleteTarget && <ConfirmModal label={deleteTarget.label} close={closeModal} confirm={confirmDelete} />}
    </main>
  );
}

function Dashboard({ stock, lowStockThreshold, lowStockItems, materialBalances, transfers, materials, pending, setView, openModal, canCreateTransfer }: {
  stock: number; lowStockThreshold: number; lowStockItems: { type: string; quantity: number }[]; materialBalances: { type: string; quantity: number }[]; transfers: Transfer[]; materials: Material[]; pending: number; canCreateTransfer: boolean;
  setView: (view: View) => void; openModal: (modal: "material" | "transfer") => void;
}) {
  const received = materials.filter((item) => item.movement === "Received").reduce((sum, item) => sum + item.quantity, 0);
  return <>
    <div className={styles.hero}>
      <div><p className={styles.eyebrow}>Saturday, June 6</p><h2>Good afternoon, Akiya.</h2><p>Here is what is happening across BF Industries today.</p></div>
      {canCreateTransfer && <button className={styles.primaryButton} onClick={() => openModal("transfer")}><Icon name="plus" size={18} /> New transfer</button>}
    </div>
    {lowStockItems.length > 0 && <div className={styles.alertBanner}><span>!</span><div><b>{lowStockItems.length} materials need attention</b><p>{lowStockItems.map((item) => `${item.type}: ${item.quantity} bags`).join(" | ")}. Safety level: {lowStockThreshold} bags.</p></div><button onClick={() => setView("materials")}>Review materials</button></div>}
    <div className={styles.metrics}>
      <Metric label="Available stock" value={`${stock} bags`} change={`${materialBalances.length} material types`} tone="green" icon="materials" />
      <Metric label="Total received" value={`${received} bags`} change={`${materials.length} records`} tone="blue" icon="download" />
      <Metric label="Output transfers" value={String(transfers.length)} change={`${transfers.filter(t => t.status === "Verified").length} verified`} tone="amber" icon="transfers" />
      <Metric label="Awaiting verification" value={String(pending)} change={pending ? "Needs attention" : "All clear"} tone="red" icon="check" />
    </div>
    <section className={styles.card}>
      <div className={styles.cardHead}><div><p className={styles.eyebrow}>Inventory health</p><h3>Stock by material type</h3></div><span>Low at {lowStockThreshold} bags</span></div>
      <div className={styles.stockGrid}>{materialBalances.map((item) => <article key={item.type} className={item.quantity <= lowStockThreshold ? styles.stockLow : styles.stockHealthy}><div><b>{item.type}</b><span>{item.quantity <= 10 ? "Critical" : item.quantity <= lowStockThreshold ? "Low stock" : "Healthy"}</span></div><strong>{item.quantity}<small> bags</small></strong></article>)}</div>
    </section>
    <div className={styles.dashboardGrid}>
      <section className={styles.card}>
        <div className={styles.cardHead}><div><p className={styles.eyebrow}>Movement overview</p><h3>Material flow</h3></div><span>Last 7 days</span></div>
        <div className={styles.chart}>
          {[48, 72, 55, 84, 62, 91, 74].map((height, index) => <div key={index}><span style={{ height: `${height}%` }} /><small>{["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][index]}</small></div>)}
        </div>
      </section>
      <section className={styles.card}>
        <div className={styles.cardHead}><div><p className={styles.eyebrow}>Quick actions</p><h3>Common tasks</h3></div></div>
        <div className={styles.quickActions}>
          <button onClick={() => openModal("material")}><span><Icon name="materials" /></span><div><b>Record material</b><small>Add receiving or usage</small></div><em>→</em></button>
          <button onClick={() => openModal("transfer")}><span><Icon name="transfers" /></span><div><b>Create transfer</b><small>Log output movement</small></div><em>→</em></button>
          <button onClick={() => setView("reports")}><span><Icon name="reports" /></span><div><b>Generate report</b><small>Export operational data</small></div><em>→</em></button>
        </div>
      </section>
    </div>
    <section className={styles.card}>
      <div className={styles.cardHead}><div><p className={styles.eyebrow}>Latest activity</p><h3>Recent transfers</h3></div><button className={styles.textButton} onClick={() => setView("transfers")}>View all →</button></div>
      <TransferTable transfers={transfers.slice(0, 4)} compact />
    </section>
  </>;
}

function Metric({ label, value, change, tone, icon }: { label: string; value: string; change: string; tone: string; icon: string }) {
  return <article className={styles.metric}><div className={`${styles.metricIcon} ${styles[tone]}`}><Icon name={icon} /></div><p>{label}</p><h3>{value}</h3><span className={styles[tone]}>{change}</span></article>;
}

function Materials({ materials, search, setSearch, openModal, edit, remove, canManage, canDelete }: { materials: Material[]; search: string; setSearch: (value: string) => void; openModal: () => void; edit: (item: Material) => void; remove: (item: Material) => void; canManage: boolean; canDelete: boolean }) {
  const [movement, setMovement] = useState("All");
  const filtered = materials.filter((item) => (movement === "All" || item.movement === movement) && Object.values(item).join(" ").toLowerCase().includes(search.toLowerCase()));
  return <section className={styles.card}>
    <div className={styles.listHeader}><div className={styles.listTools}><div className={styles.search}><Icon name="search" size={18} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search material, supplier, or encoder..." /></div><select className={styles.filterSelect} value={movement} onChange={(event) => setMovement(event.target.value)}><option>All</option><option>Received</option><option>Used</option></select></div>{canManage && <button className={styles.primaryButton} onClick={openModal}><Icon name="plus" size={18} /> Record material</button>}</div>
    <div className={styles.tableWrap}><table><thead><tr><th>Date</th><th>Material</th><th>Supplier / Source</th><th>Movement</th><th>Quantity</th><th>Encoded by</th><th>Actions</th></tr></thead>
      <tbody>{filtered.map((item) => <tr key={item.id}><td>{formatDate(item.date)}</td><td><b>{item.type}</b><small>RM-{String(item.id).slice(-4)}</small></td><td>{item.supplier}</td><td><span className={`${styles.badge} ${item.movement === "Received" ? styles.verified : styles.pending}`}>{item.movement}</span></td><td><b>{item.quantity}</b> {item.unit}</td><td>{item.encodedBy}</td><td><div className={styles.rowActions}>{canManage && <button aria-label={`Edit ${item.type}`} onClick={() => edit(item)}><Icon name="edit" size={15} /></button>}{canDelete && <button className={styles.deleteAction} aria-label={`Delete ${item.type}`} onClick={() => remove(item)}><Icon name="trash" size={15} /></button>}{!canManage && !canDelete && <span className={styles.viewOnly}>View only</span>}</div></td></tr>)}</tbody>
    </table></div>
    {!filtered.length && <EmptyState message="No material records match your search and filter." />}
    <p className={styles.tableFooter}>Showing {filtered.length} of {materials.length} material records</p>
  </section>;
}

function Transfers({ transfers, search, setSearch, openModal, verify, edit, remove, print, canManage, canVerify, canDelete }: { transfers: Transfer[]; search: string; setSearch: (value: string) => void; openModal: () => void; verify: (id: number) => void; edit: (item: Transfer) => void; remove: (item: Transfer) => void; print: (item: Transfer) => void; canManage: boolean; canVerify: boolean; canDelete: boolean }) {
  const [status, setStatus] = useState("All");
  const filtered = transfers.filter((item) => (status === "All" || item.status === status) && Object.values(item).join(" ").toLowerCase().includes(search.toLowerCase()));
  return <section className={styles.card}>
    <div className={styles.listHeader}><div className={styles.listTools}><div className={styles.search}><Icon name="search" size={18} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search document, bag, analysis, tag, or location..." /></div><select className={styles.filterSelect} value={status} onChange={(event) => setStatus(event.target.value)}><option>All</option><option>Pending</option><option>Verified</option></select></div>{canManage && <button className={styles.primaryButton} onClick={openModal}><Icon name="plus" size={18} /> New transfer</button>}</div>
    <TransferTable transfers={filtered} verify={canVerify ? verify : undefined} edit={canManage ? edit : undefined} remove={canDelete ? remove : undefined} print={print} />
    {!filtered.length && <EmptyState message="No transfer records match your search and filter." />}
    <p className={styles.tableFooter}>Showing {filtered.length} of {transfers.length} transfer records</p>
  </section>;
}

function TransferTable({ transfers, compact = false, verify, edit, remove, print }: { transfers: Transfer[]; compact?: boolean; verify?: (id: number) => void; edit?: (item: Transfer) => void; remove?: (item: Transfer) => void; print?: (item: Transfer) => void }) {
  const hasActions = Boolean(verify || edit || remove || print);
  return <div className={styles.tableWrap}><table><thead><tr><th>Document</th><th>Date</th><th>Movement</th>{!compact && <th>Bag / Analysis</th>}<th>Weight</th><th>Status</th>{hasActions && <th>Actions</th>}</tr></thead>
    <tbody>{transfers.map((item) => <tr key={item.id}><td><b>{item.documentNo}</b><small>{item.seriesNo}{(item.attachments?.length ?? 0) > 0 && <span className={styles.attachmentCount}><Icon name="attachment" size={11} />{item.attachments?.length}</span>}</small></td><td>{formatDate(item.date)}</td><td><b>{item.source}</b><small>to {item.destination}</small></td>{!compact && <td><b>{item.bagNo}</b><small>{item.analysisNo} / {item.tagNo}</small></td>}<td>{item.weight.toLocaleString()} kg</td><td><span className={`${styles.badge} ${item.status === "Verified" ? styles.verified : styles.pending}`}>{item.status}</span></td>{hasActions && <td><div className={styles.rowActions}>{item.status === "Pending" && verify && <button className={styles.verifyAction} onClick={() => verify(item.id)} aria-label={`Verify ${item.documentNo}`}><Icon name="check" size={15} /></button>}{print && <button aria-label={`Print ${item.documentNo}`} onClick={() => print(item)}><Icon name="print" size={15} /></button>}{edit && <button aria-label={`Edit ${item.documentNo}`} onClick={() => edit(item)}><Icon name="edit" size={15} /></button>}{remove && <button className={styles.deleteAction} aria-label={`Delete ${item.documentNo}`} onClick={() => remove(item)}><Icon name="trash" size={15} /></button>}</div></td>}</tr>)}</tbody>
  </table></div>;
}

function EmptyState({ message }: { message: string }) {
  return <div className={styles.emptyState}><Icon name="search" /><b>No records found</b><span>{message}</span></div>;
}

function Reports({ materials, transfers, stock, verified }: { materials: Material[]; transfers: Transfer[]; stock: number; verified: number }) {
  const reports = [
    { title: "Raw Material Transactions", description: "Complete receiving and usage history", count: `${materials.length} records`, type: "materials" },
    { title: "Output Transfer Register", description: "Transfer details, identifiers, and status", count: `${transfers.length} records`, type: "transfers" },
    { title: "Inventory Summary", description: "Current calculated raw material balance", count: `${stock} bags available`, type: "inventory" },
  ];
  function exportReport(type: string) {
    if (type === "materials") downloadCsv("coresync-materials.csv", [["Date","Material","Supplier","Movement","Quantity","Unit","Encoded By"], ...materials.map(m => [m.date,m.type,m.supplier,m.movement,m.quantity,m.unit,m.encodedBy])]);
    else if (type === "transfers") downloadCsv("coresync-transfers.csv", [["Date","Document","Series","Source","Destination","Bag","Analysis","Tag","Quantity","Weight","MC","Mesh","Location","Status"], ...transfers.map(t => [t.date,t.documentNo,t.seriesNo,t.source,t.destination,t.bagNo,t.analysisNo,t.tagNo,t.quantity,t.weight,t.moisture,t.mesh,t.location,t.status])]);
    else downloadCsv("coresync-inventory-summary.csv", [["Metric","Value"],["Available stock",stock],["Material records",materials.length],["Transfers",transfers.length],["Verified transfers",verified]]);
  }
  return <>
    <div className={styles.reportSummary}><div><p className={styles.eyebrow}>Management snapshot</p><h2>{stock} bags currently available</h2><p>Based on all received and used material transactions.</p></div><div className={styles.ring}><strong>{transfers.length ? Math.round((verified / transfers.length) * 100) : 0}%</strong><span>verified</span></div></div>
    <div className={styles.reportGrid}>{reports.map(report => <article className={styles.reportCard} key={report.type}><span><Icon name="reports" /></span><h3>{report.title}</h3><p>{report.description}</p><small>{report.count}</small><button onClick={() => exportReport(report.type)}><Icon name="download" size={17} /> Download CSV</button></article>)}</div>
  </>;
}

function AuditTrail({ events }: { events: AuditEvent[] }) {
  return <section className={styles.card}><div className={styles.cardHead}><div><p className={styles.eyebrow}>Accountability</p><h3>Recent system activity</h3></div><span>{events.length} events</span></div>{events.length ? <div className={styles.auditList}>{events.map((event) => <article key={event.id}><span className={styles.auditIcon}><Icon name="audit" size={16} /></span><div><b>{event.action}</b><p>{event.record}</p></div><div className={styles.auditMeta}><b>{event.user}</b><span>{event.role}</span><time>{new Intl.DateTimeFormat("en-PH", { dateStyle: "medium", timeStyle: "short" }).format(new Date(event.timestamp))}</time></div></article>)}</div> : <EmptyState message="Actions such as creating, editing, verifying, and deleting records will appear here." />}</section>;
}

function ModalShell({ title, subtitle, close, children }: { title: string; subtitle: string; close: () => void; children: React.ReactNode }) {
  return <div className={styles.modalBackdrop} onMouseDown={close}><section className={styles.modal} onMouseDown={(event) => event.stopPropagation()}><header><div><p className={styles.eyebrow}>CoreSync record</p><h2>{title}</h2><p>{subtitle}</p></div><button aria-label="Close dialog" onClick={close}>x</button></header>{children}</section></div>;
}

function MaterialModal({ close, submit, item }: { close: () => void; submit: (event: FormEvent<HTMLFormElement>) => void; item: Material | null }) {
  return <ModalShell title={item ? "Edit raw material" : "Record raw material"} subtitle={item ? "Update this transaction's recorded information." : "Add a receiving or material usage transaction."} close={close}><form onSubmit={submit} className={styles.form}>
    <div className={styles.formGrid}><label>Date<input name="date" type="date" defaultValue={item?.date ?? "2026-06-06"} required /></label><label>Movement<select name="movement" defaultValue={item?.movement ?? "Received"}><option>Received</option><option>Used</option></select></label></div>
    <label>Material type<input name="type" defaultValue={item?.type ?? "Coconut Shell Charcoal"} required /></label>
    <label>Supplier or source<input name="supplier" defaultValue={item?.supplier ?? ""} placeholder="Enter supplier or internal source" required /></label>
    <div className={styles.formGrid}><label>Quantity<input name="quantity" type="number" min="1" defaultValue={item?.quantity} placeholder="0" required /></label><label>Unit<select name="unit" defaultValue={item?.unit ?? "bags"}><option>bags</option><option>kilograms</option><option>tons</option></select></label></div>
    <div className={styles.formActions}><button type="button" onClick={close}>Cancel</button><button className={styles.primaryButton} type="submit">{item ? "Save changes" : "Save transaction"}</button></div>
  </form></ModalShell>;
}

function TransferModal({ close, submit, item }: { close: () => void; submit: (event: FormEvent<HTMLFormElement>) => void; item: Transfer | null }) {
  const [attachments, setAttachments] = useState<Attachment[]>(item?.attachments ?? []);
  const [category, setCategory] = useState<AttachmentCategory>("Scanned Form");
  const [fileError, setFileError] = useState("");

  async function addFiles(files: FileList | null) {
    if (!files) return;
    setFileError("");
    const availableSlots = 5 - attachments.length;
    const selected = [...files].slice(0, availableSlots);
    if (files.length > availableSlots) setFileError("A transfer can contain up to five attachments.");
    let projectedSize = attachments.reduce((total, file) => total + file.size, 0);
    const valid = selected.filter((file) => {
      if (!["application/pdf", "image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        setFileError("Only PDF, JPG, PNG, and WebP files are supported.");
        return false;
      }
      if (file.size > 1024 * 1024) {
        setFileError(`${file.name} is larger than the 1 MB demo limit.`);
        return false;
      }
      if (projectedSize + file.size > 3 * 1024 * 1024) {
        setFileError("Attachments for one transfer cannot exceed 3 MB in this browser demo.");
        return false;
      }
      projectedSize += file.size;
      return true;
    });
    const uploaded = await Promise.all(valid.map((file) => new Promise<Attachment>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve({ id: Date.now() + Math.random(), name: file.name, type: file.type, size: file.size, category, dataUrl: String(reader.result), uploadedAt: new Date().toISOString() });
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    })));
    setAttachments((current) => [...current, ...uploaded]);
  }

  return <ModalShell title={item ? "Edit output transfer" : "Create output transfer"} subtitle={item ? "Update the identifiers or movement details." : "Record the identifiers and movement details from the transfer form."} close={close}><form onSubmit={submit} className={styles.form}>
    <div className={styles.formGrid}><label>Date<input name="date" type="date" defaultValue={item?.date ?? "2026-06-06"} required /></label><label>Document number<input name="documentNo" defaultValue={item?.documentNo ?? ""} placeholder="MTF-2026-0144" required /></label></div>
    <div className={styles.formGrid}><label>Series / control no.<input name="seriesNo" defaultValue={item?.seriesNo ?? ""} placeholder="S-144" required /></label><label>Location<input name="location" defaultValue={item?.location ?? ""} placeholder="Warehouse or line" required /></label></div>
    <div className={styles.formGrid}><label>Source area<input name="source" defaultValue={item?.source ?? ""} placeholder="Raw Mats" required /></label><label>Destination area<input name="destination" defaultValue={item?.destination ?? ""} placeholder="Activation" required /></label></div>
    <div className={styles.formGridThree}><label>Bag no.<input name="bagNo" defaultValue={item?.bagNo ?? ""} required /></label><label>Analysis no.<input name="analysisNo" defaultValue={item?.analysisNo ?? ""} required /></label><label>Tag no.<input name="tagNo" defaultValue={item?.tagNo ?? ""} required /></label></div>
    <div className={styles.formGridThree}><label>Quantity<input name="quantity" type="number" min="1" defaultValue={item?.quantity} required /></label><label>Weight (kg)<input name="weight" type="number" min="1" defaultValue={item?.weight} required /></label><label>MC (%)<input name="moisture" type="number" step="0.1" min="0" defaultValue={item?.moisture} required /></label></div>
    <label>Mesh classification<input name="mesh" defaultValue={item?.mesh ?? ""} placeholder="e.g. 4x8" required /></label>
    <input type="hidden" name="attachments" value={JSON.stringify(attachments)} />
    <section className={styles.attachmentSection}>
      <div className={styles.attachmentHeading}><div><b>Supporting attachments</b><span>Photos, scanned forms, receipts, or QC results</span></div><small>{attachments.length}/5 files</small></div>
      <div className={styles.uploadControls}><select value={category} onChange={(event) => setCategory(event.target.value as AttachmentCategory)}><option>Photo</option><option>Scanned Form</option><option>Receipt</option><option>Quality Control Result</option></select><label className={styles.uploadButton}><Icon name="attachment" size={16} />Choose files<input type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp" onChange={(event) => { void addFiles(event.target.files); event.target.value = ""; }} /></label></div>
      <p className={styles.storageNote}>Demo storage: maximum 1 MB per file. Attachments are saved only in this browser until Supabase Storage is connected.</p>
      {fileError && <p className={styles.fileError}>{fileError}</p>}
      {attachments.length > 0 && <div className={styles.attachmentList}>{attachments.map((attachment) => <article key={attachment.id}>{attachment.type.startsWith("image/") ? <Image className={styles.attachmentThumb} src={attachment.dataUrl} alt="" width={42} height={42} unoptimized /> : <span className={styles.fileIcon}>PDF</span>}<div><b>{attachment.name}</b><span>{attachment.category} / {(attachment.size / 1024).toFixed(0)} KB</span></div><a href={attachment.dataUrl} target="_blank" rel="noreferrer" download={attachment.name}>Open</a><button type="button" onClick={() => setAttachments((current) => current.filter((file) => file.id !== attachment.id))}>Remove</button></article>)}</div>}
    </section>
    <div className={styles.formActions}><button type="button" onClick={close}>Cancel</button><button className={styles.primaryButton} type="submit">{item ? "Save changes" : "Create transfer"}</button></div>
  </form></ModalShell>;
}

function ConfirmModal({ label, close, confirm }: { label: string; close: () => void; confirm: () => void }) {
  return <ModalShell title="Delete this record?" subtitle="This action cannot be undone." close={close}><div className={styles.confirmBody}><div className={styles.dangerIcon}><Icon name="trash" /></div><p>You are about to permanently delete <b>{label}</b>.</p><div className={styles.formActions}><button onClick={close}>Keep record</button><button className={styles.dangerButton} onClick={confirm}>Delete permanently</button></div></div></ModalShell>;
}

function Settings({ materials, transfers, reset }: { materials: number; transfers: number; reset: () => void }) {
  return <div className={styles.settingsGrid}><section className={styles.card}><p className={styles.eyebrow}>Local prototype</p><h2>Data management</h2><p className={styles.settingsText}>CoreSync currently saves this demonstration data and attachments in this browser. Use the restore action when you need a clean dataset for a presentation.</p><div className={styles.dataCounts}><div><b>{materials}</b><span>Material records</span></div><div><b>{transfers}</b><span>Transfer records</span></div></div><button className={styles.resetButton} onClick={() => { if (window.confirm("Restore the original starter records? Your current local changes will be replaced.")) reset(); }}>Restore starter data</button></section><section className={styles.card}><p className={styles.eyebrow}>Recommended next step</p><h2>Production readiness</h2><ul className={styles.readinessList}><li><Icon name="check" size={15} />Connect a managed PostgreSQL database</li><li><Icon name="check" size={15} />Move attachments to Supabase Storage</li><li><Icon name="check" size={15} />Replace demo roles with secure accounts</li><li><Icon name="check" size={15} />Schedule automated backups</li></ul></section></div>;
}
