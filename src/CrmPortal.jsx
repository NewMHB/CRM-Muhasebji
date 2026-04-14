import { useState, useMemo, useRef, useEffect } from "react";

// ═══════════════════════════════════════════════════════════
//  SEED DATA
// ═══════════════════════════════════════════════════════════
const TODAY_STR = new Date().toLocaleDateString("ar-SY", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
const NOW_STR = () => new Date().toLocaleTimeString("ar-SY", { hour: "2-digit", minute: "2-digit" });
const TODAY_DATE = new Date().toISOString().slice(0, 10);

const INIT = {
  clients: [
    { id: 1, name: "شركة النور للتجارة",   phone: "0991234567", city: "دمشق",   stage: "نشط",    source: "شريك نمو", partnerId: 1, accountantId: 1, plan: "أساسي",  subDate: "2025-01-15", subEnd: "2025-07-15", paid: true,  notes: "عميل قديم، راضي جداً",        activity: [{ date: "2025-01-15", text: "تم تفعيل الاشتراك", type: "success" }, { date: "2025-01-10", text: "تم توقيع العقد", type: "info" }] },
    { id: 2, name: "مؤسسة الفجر",          phone: "0567891234", city: "الرياض", stage: "عرض",    source: "واتساب",   partnerId: 2, accountantId: null, plan: "متقدم", subDate: null, subEnd: null, paid: false, notes: "بانتظار موافقة المدير",         activity: [{ date: "2025-04-01", text: "تم إرسال العرض", type: "info" }] },
    { id: 3, name: "مطعم البيت الشامي",   phone: "0551234567", city: "جدة",    stage: "مشترك",  source: "إحالة",    partnerId: 1, accountantId: 2, plan: "متقدم",  subDate: "2025-01-01", subEnd: "2026-01-01", paid: true,  notes: "",                             activity: [{ date: "2025-01-01", text: "بدأ الاشتراك", type: "success" }] },
    { id: 4, name: "صيدلية الصحة",         phone: "0912345678", city: "حلب",    stage: "ليد",    source: "سوشيال",   partnerId: 3, accountantId: null, plan: null,    subDate: null, subEnd: null, paid: false, notes: "تواصل عبر إنستغرام",           activity: [{ date: "2025-04-08", text: "دخل كليد", type: "info" }] },
    { id: 5, name: "مكتب المستقبل",        phone: "0501234567", city: "الرياض", stage: "نشط",    source: "شريك نمو", partnerId: 2, accountantId: 1, plan: "متقدم",  subDate: "2025-03-01", subEnd: "2026-03-01", paid: true,  notes: "",                             activity: [{ date: "2025-03-01", text: "تم الاشتراك", type: "success" }] },
    { id: 6, name: "شركة البناء الذهبي",  phone: "0561234567", city: "دمشق",   stage: "متوقف",  source: "شريك نمو", partnerId: 1, accountantId: 1, plan: "أساسي",  subDate: "2024-06-01", subEnd: "2025-06-01", paid: false, notes: "انتهى اشتراكه",               activity: [{ date: "2025-06-01", text: "انتهى الاشتراك", type: "warning" }] },
  ],
  accountants: [
    { id: 1, name: "نور الدين حسن", phone: "0993334444", city: "دمشق",   specialty: "محاسبة عامة",  rating: 4.8, status: "نشط" },
    { id: 2, name: "ريم السالم",    phone: "0556789012", city: "الرياض", specialty: "ضريبة وزكاة", rating: 4.6, status: "نشط" },
  ],
  partners: [
    { id: 1, name: "أحمد الخالد",  phone: "0991112222", city: "دمشق",   commission: 15, totalEarned: 450000, totalPaid: 300000, status: "نشط",  joinDate: "2024-10-01" },
    { id: 2, name: "سارة المحمد",  phone: "0551234321", city: "الرياض", commission: 12, totalEarned: 280000, totalPaid: 280000, status: "نشط",  joinDate: "2024-11-15" },
    { id: 3, name: "خالد العمر",   phone: "0507654321", city: "جدة",    commission: 10, totalEarned: 90000,  totalPaid: 0,      status: "جديد", joinDate: "2025-02-01" },
  ],
  tasks: [
    { id: 1, title: "متابعة عرض مؤسسة الفجر",      clientId: 2, accountantId: null, assignedTo: "فريق داخلي",      dueDate: "2025-04-20", status: "معلقة",        priority: "عالية" },
    { id: 2, title: "تجديد اشتراك البناء الذهبي",  clientId: 6, accountantId: 1,    assignedTo: "نور الدين حسن",   dueDate: "2025-04-15", status: "معلقة",        priority: "عاجلة" },
    { id: 3, title: "إعداد تقرير أولي",             clientId: 3, accountantId: 2,    assignedTo: "ريم السالم",      dueDate: "2025-04-25", status: "قيد التنفيذ",  priority: "متوسطة" },
    { id: 4, title: "تفعيل اشتراك شركة النور",      clientId: 1, accountantId: 1,    assignedTo: "نور الدين حسن",   dueDate: "2025-04-10", status: "منتهية",       priority: "عالية" },
  ],
  chats: {
    "1-1": [
      { id: 1, from: "accountant", name: "نور الدين حسن", text: "مرحباً، تمت مراجعة القيود لشهر مارس. هل تريد التقرير الكامل؟", time: "09:15", date: "أمس" },
      { id: 2, from: "client",     name: "شركة النور",    text: "نعم من فضلك، وأضف ملاحظة على إجمالي المشتريات", time: "09:32", date: "أمس" },
      { id: 3, from: "accountant", name: "نور الدين حسن", text: "تم. لاحظت فرقاً في فاتورة المورد رقم 7، هل تأكدت منها؟", time: "10:01", date: "أمس" },
      { id: 4, from: "client",     name: "شركة النور",    text: "صحيح، كانت خطأ وتم التصحيح. شكراً للمتابعة", time: "10:15", date: "أمس" },
    ],
    "1-5": [
      { id: 1, from: "accountant", name: "نور الدين حسن", text: "جاهز لبدء التقرير الضريبي للربع الأول", time: "11:00", date: TODAY_DATE },
      { id: 2, from: "client",     name: "مكتب المستقبل", text: "تفضل. هل تحتاج مستندات إضافية؟", time: "11:05", date: TODAY_DATE },
    ],
    "2-3": [
      { id: 1, from: "accountant", name: "ريم السالم",    text: "بدأت بمراجعة ملف التسوية. سأرسل ملاحظات قريباً", time: "08:30", date: TODAY_DATE },
    ],
  },
  assignments: { 1: [1, 5], 2: [3] },
};

// ═══════════════════════════════════════════════════════════
//  CONSTANTS
// ═══════════════════════════════════════════════════════════
const STAGES    = ["ليد", "تواصل", "عرض", "مشترك", "نشط", "متوقف"];
const SC = { "ليد": "#6366f1", "تواصل": "#f59e0b", "عرض": "#3b82f6", "مشترك": "#8b5cf6", "نشط": "#10b981", "متوقف": "#6b7280" };
const PC = { "عاجلة": "#ef4444", "عالية": "#f97316", "متوسطة": "#3b82f6", "منخفضة": "#6b7280" };
const TC = { "معلقة": "#f59e0b", "قيد التنفيذ": "#3b82f6", "منتهية": "#10b981" };
const AC = { success: "#10b981", info: "#3b82f6", warning: "#f59e0b", note: "#d4af37" };
const PLANS     = ["أساسي", "متقدم", "احترافي"];
const PLAN_P    = { "أساسي": 120000, "متقدم": 220000, "احترافي": 380000 };
const ACCENT    = "#d4af37";

// ═══════════════════════════════════════════════════════════
//  ICONS
// ═══════════════════════════════════════════════════════════
const IP = {
  dash:    "M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z",
  clients: "M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z",
  tasks:   "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z",
  assign:  "M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z",
  acct:    "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z",
  partner: "M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z",
  money:   "M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z",
  reports: "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z",
  chat:    "M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z",
  add:     "M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z",
  close:   "M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z",
  edit:    "M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z",
  back:    "M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z",
  search:  "M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z",
  check:   "M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z",
  eye:     "M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z",
  send:    "M2.01 21L23 12 2.01 3 2 10l15 2-15 2z",
  note:    "M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z",
  star:    "M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z",
  wa:      "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.985-1.406A9.953 9.953 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z",
  logout:  "M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z",
};
const Ic = ({ n, s = 18 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
    <path d={IP[n] || IP.dash} />
  </svg>
);

// ═══════════════════════════════════════════════════════════
//  MINI COMPONENTS
// ═══════════════════════════════════════════════════════════
const Badge = ({ t, c, sm }) => (
  <span style={{ background: c + "1e", color: c, border: `1px solid ${c}33`, borderRadius: 20, padding: sm ? "2px 8px" : "4px 12px", fontSize: sm ? 11 : 12, fontWeight: 600, whiteSpace: "nowrap" }}>{t}</span>
);
const Divider = () => <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "14px 0" }} />;

// ═══════════════════════════════════════════════════════════
//  STYLES
// ═══════════════════════════════════════════════════════════
const S = {
  app:   { display: "flex", height: "100vh", background: "#07090f", fontFamily: "'Cairo','Segoe UI',sans-serif", direction: "rtl", color: "#e2e8f0", overflow: "hidden" },
  side:  { width: 220, background: "rgba(255,255,255,0.025)", borderLeft: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", flexShrink: 0 },
  main:  { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" },
  hdr:   { padding: "14px 26px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,0.01)", flexShrink: 0 },
  body:  { flex: 1, overflow: "auto", padding: "22px 26px" },
  card:  { background: "rgba(255,255,255,0.035)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, overflow: "hidden" },
  th:    { padding: "10px 14px", fontSize: 10, color: "#4b5563", fontWeight: 700, textAlign: "right", background: "rgba(255,255,255,0.04)", letterSpacing: 0.5, textTransform: "uppercase", whiteSpace: "nowrap" },
  td:    { padding: "11px 14px", fontSize: 13, borderTop: "1px solid rgba(255,255,255,0.04)", verticalAlign: "middle" },
  inp:   { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "8px 12px", color: "#e2e8f0", fontSize: 13, fontFamily: "inherit", outline: "none" },
  sel:   { background: "#0a0f1e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "8px 12px", color: "#e2e8f0", fontSize: 13, fontFamily: "inherit" },
  lbl:   { fontSize: 10, color: "#4b5563", marginBottom: 4, display: "block", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 },
  ov:    { position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, backdropFilter: "blur(6px)" },
  mbox:  { background: "#0d1526", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 18, padding: 26, width: 500, maxWidth: "96vw", maxHeight: "90vh", overflow: "auto", boxShadow: "0 30px 100px rgba(0,0,0,0.8)" },
  nav:   (a) => ({ display: "flex", alignItems: "center", gap: 9, padding: "10px 14px", margin: "2px 8px", borderRadius: 9, cursor: "pointer", fontSize: 13, fontWeight: a ? 700 : 500, background: a ? ACCENT + "15" : "transparent", color: a ? ACCENT : "#64748b", border: a ? `1px solid ${ACCENT}25` : "1px solid transparent", transition: "all 0.15s" }),
  btn:   (c = ACCENT) => ({ background: c + "18", color: c, border: `1px solid ${c}30`, borderRadius: 8, padding: "7px 13px", cursor: "pointer", fontSize: 12, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 5 }),
  sol:   (c = ACCENT) => ({ background: c, color: ["#d4af37","#f59e0b","#10b981"].includes(c) ? "#07090f" : "#fff", border: "none", borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontSize: 13, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "inherit" }),
};

// ═══════════════════════════════════════════════════════════
//  REDUCER
// ═══════════════════════════════════════════════════════════
function reducer(st, a) {
  switch (a.type) {
    case "SET_CLIENT":    return { ...st, clients: st.clients.map(c => c.id === a.id ? { ...c, ...a.data } : c) };
    case "ADD_CLIENT":    return { ...st, clients: [...st.clients, { ...a.data, id: Date.now(), activity: [{ date: TODAY_DATE, text: "تم إضافة العميل", type: "info" }] }] };
    case "CLIENT_ACT":    return { ...st, clients: st.clients.map(c => c.id === a.id ? { ...c, activity: [a.entry, ...(c.activity || [])] } : c) };
    case "SET_TASK":      return { ...st, tasks: st.tasks.map(t => t.id === a.id ? { ...t, ...a.data } : t) };
    case "ADD_TASK":      return { ...st, tasks: [...st.tasks, { ...a.data, id: Date.now() }] };
    case "DONE_TASK":     return { ...st, tasks: st.tasks.map(t => t.id === a.id ? { ...t, status: "منتهية" } : t) };
    case "ADD_PARTNER":   return { ...st, partners: [...st.partners, { ...a.data, id: Date.now(), totalEarned: 0, totalPaid: 0 }] };
    case "SET_PARTNER":   return { ...st, partners: st.partners.map(p => p.id === a.id ? { ...p, ...a.data } : p) };
    case "SETTLE":        return { ...st, partners: st.partners.map(p => p.id === a.id ? { ...p, totalPaid: p.totalEarned } : p) };
    case "ASSIGN_ACCT":   return { ...st, clients: st.clients.map(c => c.id === a.clientId ? { ...c, accountantId: a.accountantId } : c), assignments: { ...st.assignments, [a.accountantId]: [...new Set([...(st.assignments[a.accountantId] || []), a.clientId])] }, chats: st.chats[`${a.accountantId}-${a.clientId}`] ? st.chats : { ...st.chats, [`${a.accountantId}-${a.clientId}`]: [] } };
    case "UNASSIGN_ACCT": return { ...st, clients: st.clients.map(c => c.id === a.clientId ? { ...c, accountantId: null } : c), assignments: { ...st.assignments, [a.accountantId]: (st.assignments[a.accountantId] || []).filter(x => x !== a.clientId) } };
    case "SEND_MSG":      return { ...st, chats: { ...st.chats, [a.roomId]: [...(st.chats[a.roomId] || []), a.msg] } };
    default: return st;
  }
}

// ═══════════════════════════════════════════════════════════
//  CHAT COMPONENT
// ═══════════════════════════════════════════════════════════
function ChatRoom({ roomId, readOnly, messages, onSend, otherLabel, accent = ACCENT }) {
  const [txt, setTxt] = useState("");
  const ref = useRef(null);
  useEffect(() => { ref.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = () => {
    const t = txt.trim(); if (!t) return;
    onSend(roomId, { id: Date.now(), from: "admin", name: "أبو عمر (Admin)", text: t, time: NOW_STR(), date: TODAY_DATE });
    setTxt("");
  };

  const grouped = useMemo(() => {
    const g = []; let lastDate = null;
    (messages || []).forEach(m => { if (m.date !== lastDate) { g.push({ type: "date", date: m.date }); lastDate = m.date; } g.push({ type: "msg", ...m }); });
    return g;
  }, [messages]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {readOnly && (
        <div style={{ padding: "7px 16px", background: accent + "10", borderBottom: `1px solid ${accent}20`, fontSize: 11, color: accent, display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          <Ic n="eye" s={13} /> وضع المراقبة — تشاهد المحادثة فقط
        </div>
      )}
      <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        <div style={{ width: 34, height: 34, borderRadius: "50%", background: accent + "20", color: accent, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14 }}>{otherLabel?.[0]}</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700 }}>{otherLabel}</div>
          <div style={{ fontSize: 10, color: "#10b981", display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#10b981", display: "inline-block" }} /> متصل الآن
          </div>
        </div>
      </div>
      <div style={{ flex: 1, overflow: "auto", padding: "14px 16px", display: "flex", flexDirection: "column", gap: 3 }}>
        {grouped.map((item, i) => {
          if (item.type === "date") return (
            <div key={i} style={{ textAlign: "center", margin: "8px 0" }}>
              <span style={{ background: "rgba(255,255,255,0.06)", borderRadius: 20, padding: "2px 12px", fontSize: 10, color: "#64748b" }}>{item.date}</span>
            </div>
          );
          const isAcct = item.from === "accountant";
          const isClient = item.from === "client";
          const isMe = item.from === "admin";
          const bg = isAcct ? "#06b6d420" : isClient ? "#8b5cf620" : ACCENT + "20";
          const bc = isAcct ? "#06b6d430" : isClient ? "#8b5cf630" : ACCENT + "30";
          const br = isMe ? "4px 16px 16px 16px" : "16px 4px 16px 16px";
          return (
            <div key={item.id} style={{ display: "flex", justifyContent: isMe ? "flex-start" : "flex-end", marginBottom: 2 }}>
              <div style={{ maxWidth: "72%" }}>
                <div style={{ fontSize: 10, color: "#4b5563", marginBottom: 2, textAlign: isMe ? "right" : "left" }}>{item.name}</div>
                <div style={{ background: bg, border: `1px solid ${bc}`, borderRadius: br, padding: "9px 13px", fontSize: 13, color: "#e2e8f0", lineHeight: 1.5 }}>{item.text}</div>
                <div style={{ fontSize: 10, color: "#374151", marginTop: 2, textAlign: isMe ? "right" : "left" }}>{item.time}</div>
              </div>
            </div>
          );
        })}
        <div ref={ref} />
      </div>
      {!readOnly && (
        <div style={{ padding: "10px 14px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", gap: 9, flexShrink: 0 }}>
          <input style={{ ...S.inp, flex: 1, borderRadius: 20, padding: "9px 16px" }} placeholder="اكتب رسالة..." value={txt} onChange={e => setTxt(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} />
          <button onClick={send} style={{ width: 38, height: 38, borderRadius: "50%", background: ACCENT, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#07090f", flexShrink: 0 }}>
            <Ic n="send" s={16} />
          </button>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  MODAL
// ═══════════════════════════════════════════════════════════
function Modal({ title, onClose, children }) {
  return (
    <div style={S.ov} onClick={onClose}>
      <div style={S.mbox} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 800 }}>{title}</div>
          <button style={{ background: "none", border: "none", color: "#4b5563", cursor: "pointer" }} onClick={onClose}><Ic n="close" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  STAT CARD
// ═══════════════════════════════════════════════════════════
const StatCard = ({ label, value, sub, color, icon, onClick }) => (
  <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 13, padding: "16px 18px", display: "flex", gap: 13, alignItems: "center", cursor: onClick ? "pointer" : "default", transition: "border-color 0.2s" }}
    onMouseEnter={e => e.currentTarget.style.borderColor = color + "44"} onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"}
    onClick={onClick}>
    <div style={{ background: color + "1a", borderRadius: 10, padding: 10, color }}><Ic n={icon} s={19} /></div>
    <div>
      <div style={{ fontSize: 23, fontWeight: 800, color: "#f1f5f9", lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 3 }}>{label}</div>
      {sub && <div style={{ fontSize: 10, color, marginTop: 2 }}>{sub}</div>}
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════
//  MAIN APP
// ═══════════════════════════════════════════════════════════
export default function AdminPortal() {
  const [db, dispatch] = useState(INIT);
  const act = (a) => dispatch(prev => reducer(prev, a));

  const [page, setPage] = useState("dashboard");
  const [selClient, setSelClient] = useState(null);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [search, setSearch] = useState("");
  const [stageF, setStageF] = useState("الكل");
  const [taskF, setTaskF] = useState("الكل");
  const [chatRoom, setChatRoom] = useState(null);
  const [noteText, setNoteText] = useState("");
  const [assignModal, setAssignModal] = useState(null); // clientId

  const fv = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const closeM = () => { setModal(null); setForm({}); };

  // derived
  const totalRev = useMemo(() => db.clients.filter(c => c.plan && c.paid).reduce((s, c) => s + (PLAN_P[c.plan] || 0), 0), [db.clients]);
  const pendTasks = useMemo(() => db.tasks.filter(t => t.status !== "منتهية").length, [db.tasks]);
  const unpaidComm = useMemo(() => db.partners.reduce((s, p) => s + (p.totalEarned - p.totalPaid), 0), [db.partners]);
  const activeN = useMemo(() => db.clients.filter(c => c.stage === "نشط").length, [db.clients]);

  const filtClients = useMemo(() => db.clients.filter(c => {
    const q = search.toLowerCase();
    return (c.name.includes(q) || (c.phone || "").includes(q) || (c.city || "").includes(q)) && (stageF === "الكل" || c.stage === stageF);
  }), [db.clients, search, stageF]);

  const filtTasks = useMemo(() => db.tasks.filter(t => taskF === "الكل" || t.status === taskF), [db.tasks, taskF]);

  const allRooms = useMemo(() => {
    const rooms = [];
    Object.entries(db.assignments).forEach(([accId, cIds]) => {
      const acc = db.accountants.find(a => a.id === Number(accId));
      cIds.forEach(cId => {
        const cl = db.clients.find(c => c.id === cId);
        const rid = `${accId}-${cId}`;
        const msgs = db.chats[rid] || [];
        rooms.push({ roomId: rid, acc, cl, lastMsg: msgs[msgs.length - 1], count: msgs.length });
      });
    });
    return rooms;
  }, [db.assignments, db.chats, db.accountants, db.clients]);

  // ── NAV ──
  const NAV = [
    { id: "dashboard", label: "الرئيسية",       icon: "dash" },
    { id: "clients",   label: "العملاء",         icon: "clients" },
    { id: "tasks",     label: "المهام",           icon: "tasks",   badge: pendTasks },
    { id: "assign",    label: "التوكيلات",        icon: "assign" },
    { id: "accountants",label: "المحاسبون",       icon: "acct" },
    { id: "partners",  label: "شركاء النمو",      icon: "partner" },
    { id: "commissions",label: "العمولات",        icon: "money" },
    { id: "reports",   label: "التقارير",         icon: "reports" },
    { id: "chats",     label: "مراقبة المحادثات", icon: "chat" },
  ];

  // ══════════════════════════════════════════
  //  PAGES
  // ══════════════════════════════════════════

  // ── DASHBOARD ──
  const Dashboard = () => (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 13, marginBottom: 22 }}>
        <StatCard label="العملاء النشطين" value={activeN} sub={`من ${db.clients.length} إجمالي`} color="#10b981" icon="clients" onClick={() => setPage("clients")} />
        <StatCard label="الإيرادات السنوية" value={(totalRev/1000).toFixed(0)+"K ل.س"} sub="من المشتركين" color={ACCENT} icon="money" />
        <StatCard label="مهام معلقة" value={pendTasks} sub="تحتاج متابعة" color="#f59e0b" icon="tasks" onClick={() => setPage("tasks")} />
        <StatCard label="عمولات مستحقة" value={(unpaidComm/1000).toFixed(0)+"K ل.س"} sub="لشركاء النمو" color="#ef4444" icon="partner" onClick={() => setPage("commissions")} />
      </div>

      {/* Pipeline */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#374151", marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>Pipeline</div>
        <div style={{ display: "flex", gap: 8 }}>
          {STAGES.map(s => {
            const cnt = db.clients.filter(c => c.stage === s).length;
            const pct = db.clients.length ? Math.round(cnt/db.clients.length*100) : 0;
            return (
              <div key={s} style={{ flex: 1, background: "rgba(255,255,255,0.03)", border: `1px solid ${SC[s]}22`, borderTop: `2px solid ${SC[s]}`, borderRadius: "0 0 10px 10px", padding: "12px 10px", textAlign: "center", cursor: "pointer", transition: "background 0.15s" }}
                onClick={() => { setStageF(s); setPage("clients"); }}
                onMouseEnter={e => e.currentTarget.style.background = SC[s]+"0d"}
                onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}>
                <div style={{ fontSize: 20, fontWeight: 800, color: SC[s] }}>{cnt}</div>
                <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 3 }}>{s}</div>
                <div style={{ fontSize: 9, color: "#374151", marginTop: 1 }}>{pct}%</div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {/* Urgent tasks */}
        <div style={S.card}>
          <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8" }}>المهام العاجلة</span>
            <button style={S.btn()} onClick={() => setPage("tasks")}><Ic n="tasks" s={12} /> الكل</button>
          </div>
          {db.tasks.filter(t => t.status !== "منتهية").slice(0,4).map(t => {
            const cl = db.clients.find(c => c.id === t.clientId);
            return (
              <div key={t.id} style={{ padding: "10px 16px", borderTop: "1px solid rgba(255,255,255,0.04)", display: "flex", gap: 10, alignItems: "center" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{t.title}</div>
                  <div style={{ fontSize: 10, color: "#374151", marginTop: 1 }}>{cl?.name} · {t.dueDate}</div>
                </div>
                <Badge t={t.priority} c={PC[t.priority]} sm />
              </div>
            );
          })}
        </div>

        {/* Recent chats */}
        <div style={S.card}>
          <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8" }}>آخر المحادثات</span>
            <button style={S.btn()} onClick={() => setPage("chats")}><Ic n="chat" s={12} /> مراقبة</button>
          </div>
          {allRooms.slice(0,4).map(r => (
            <div key={r.roomId} style={{ padding: "10px 16px", borderTop: "1px solid rgba(255,255,255,0.04)", display: "flex", gap: 10, alignItems: "center", cursor: "pointer" }}
              onClick={() => { setChatRoom(r.roomId); setPage("chats"); }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 600 }}>{r.acc?.name} ↔ {r.cl?.name}</div>
                <div style={{ fontSize: 10, color: "#4b5563", marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.lastMsg?.text?.slice(0,45)}...</div>
              </div>
              <div style={{ fontSize: 10, color: "#374151" }}>{r.count} رسالة</div>
            </div>
          ))}
          {allRooms.length === 0 && <div style={{ padding: 20, textAlign: "center", color: "#374151", fontSize: 12 }}>لا توجد محادثات بعد</div>}
        </div>
      </div>
    </div>
  );

  // ── CLIENTS LIST ──
  const ClientsList = () => (
    <div>
      <div style={{ display: "flex", gap: 9, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 160 }}>
          <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "#374151" }}><Ic n="search" s={14} /></span>
          <input style={{ ...S.inp, paddingRight: 32, width: "100%", boxSizing: "border-box" }} placeholder="بحث..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select style={{ ...S.sel, width: 120 }} value={stageF} onChange={e => setStageF(e.target.value)}>
          <option>الكل</option>
          {STAGES.map(s => <option key={s}>{s}</option>)}
        </select>
        <button style={S.sol()} onClick={() => { setForm({ stage: "ليد", source: "شريك نمو" }); setModal("client"); }}>
          <Ic n="add" s={14} /> عميل جديد
        </button>
      </div>
      <div style={S.card}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr>{["الاسم","المرحلة","المدينة","المصدر","الباقة","المحاسب","شركاء",""].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
          <tbody>
            {filtClients.map(c => {
              const acc = db.accountants.find(a => a.id === c.accountantId);
              const par = db.partners.find(p => p.id === c.partnerId);
              return (
                <tr key={c.id} style={{ cursor: "pointer", transition: "background 0.1s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  onClick={() => { setSelClient(c); setPage("clientDetail"); }}>
                  <td style={S.td}>
                    <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                      <div style={{ width: 30, height: 30, borderRadius: "50%", background: SC[c.stage]+"20", color: SC[c.stage], display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 12, flexShrink: 0 }}>{c.name[0]}</div>
                      <div><div style={{ fontWeight: 700, fontSize: 13 }}>{c.name}</div><div style={{ fontSize: 10, color: "#374151" }}>{c.phone}</div></div>
                    </div>
                  </td>
                  <td style={S.td}><Badge t={c.stage} c={SC[c.stage]} sm /></td>
                  <td style={{ ...S.td, color: "#94a3b8", fontSize: 12 }}>{c.city}</td>
                  <td style={{ ...S.td, color: "#64748b", fontSize: 11 }}>{c.source}</td>
                  <td style={S.td}>{c.plan ? <Badge t={c.plan} c="#6366f1" sm /> : <span style={{ color: "#1f2937" }}>—</span>}</td>
                  <td style={{ ...S.td, fontSize: 11 }}>
                    {acc ? <span style={{ color: "#06b6d4" }}>{acc.name}</span> : (
                      <button style={{ ...S.btn("#f59e0b"), padding: "3px 8px", fontSize: 10 }} onClick={e => { e.stopPropagation(); setAssignModal(c.id); }}>
                        <Ic n="assign" s={11} /> توكيل
                      </button>
                    )}
                  </td>
                  <td style={{ ...S.td, fontSize: 11, color: "#64748b" }}>{par?.name || "—"}</td>
                  <td style={S.td} onClick={e => e.stopPropagation()}>
                    <button style={{ ...S.btn(), padding: "4px 8px" }} onClick={() => { setForm(c); setModal("client"); }}><Ic n="edit" s={12} /></button>
                  </td>
                </tr>
              );
            })}
            {filtClients.length === 0 && <tr><td colSpan={8} style={{ ...S.td, textAlign: "center", color: "#1f2937", padding: 36 }}>لا توجد نتائج</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );

  // ── CLIENT DETAIL ──
  const ClientDetail = () => {
    const c = db.clients.find(cl => cl.id === selClient?.id) || selClient;
    if (!c) return null;
    const acc = db.accountants.find(a => a.id === c.accountantId);
    const par = db.partners.find(p => p.id === c.partnerId);
    const myTasks = db.tasks.filter(t => t.clientId === c.id);
    const roomId = c.accountantId ? `${c.accountantId}-${c.id}` : null;

    const addNote = () => {
      if (!noteText.trim()) return;
      const entry = { date: TODAY_DATE, text: noteText.trim(), type: "note" };
      act({ type: "CLIENT_ACT", id: c.id, entry });
      setNoteText("");
    };

    const changeStage = (stage) => {
      act({ type: "SET_CLIENT", id: c.id, data: { stage } });
      act({ type: "CLIENT_ACT", id: c.id, entry: { date: TODAY_DATE, text: `تغيير المرحلة إلى: ${stage}`, type: "info" } });
    };

    return (
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
          <button style={S.btn()} onClick={() => setPage("clients")}><Ic n="back" s={14} /> العملاء</button>
          <div style={{ flex: 1 }} />
          <a href={`https://wa.me/${(c.phone||"").replace(/^0/,"963")}`} target="_blank" rel="noreferrer" style={{ ...S.sol("#25D366"), textDecoration: "none" }}><Ic n="wa" s={14} /> واتساب</a>
          {!acc && <button style={S.sol("#f59e0b")} onClick={() => setAssignModal(c.id)}><Ic n="assign" s={14} /> توكيل محاسب</button>}
          <button style={S.sol()} onClick={() => { setForm(c); setModal("client"); }}><Ic n="edit" s={14} /> تعديل</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 18 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Header */}
            <div style={{ ...S.card, padding: 20, borderTop: `3px solid ${SC[c.stage]}` }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: SC[c.stage]+"20", color: SC[c.stage], display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 20, flexShrink: 0 }}>{c.name[0]}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 18, fontWeight: 800 }}>{c.name}</div>
                  <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{c.phone} · {c.city}</div>
                </div>
                <Badge t={c.stage} c={SC[c.stage]} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
                {[
                  { l: "المصدر",   v: c.source || "—" },
                  { l: "الباقة",   v: c.plan || "غير محددة" },
                  { l: "الدفع",    v: c.paid ? "✓ مدفوع" : "✗ غير مدفوع" },
                  { l: "بداية الاشتراك", v: c.subDate || "—" },
                  { l: "نهاية الاشتراك", v: c.subEnd  || "—" },
                  { l: "شريك النمو", v: par?.name || "—" },
                ].map(i => (
                  <div key={i.l} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 9, padding: "9px 12px" }}>
                    <div style={{ fontSize: 9, color: "#374151", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>{i.l}</div>
                    <div style={{ fontSize: 12, fontWeight: 600, marginTop: 3 }}>{i.v}</div>
                  </div>
                ))}
              </div>
              {/* Accountant assignment */}
              <div style={{ marginTop: 12, padding: "11px 14px", background: acc ? "rgba(6,182,212,0.06)" : "rgba(245,158,11,0.06)", border: `1px solid ${acc ? "#06b6d430" : "#f59e0b30"}`, borderRadius: 9, display: "flex", alignItems: "center", gap: 10 }}>
                <Ic n="acct" s={16} />
                {acc ? (
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, color: "#374151" }}>المحاسب المعتمد</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#06b6d4", marginTop: 1 }}>{acc.name} · {acc.specialty}</div>
                  </div>
                ) : (
                  <div style={{ flex: 1, fontSize: 12, color: "#f59e0b" }}>لم يتم تعيين محاسب بعد</div>
                )}
                <button style={S.btn(acc ? "#ef4444" : "#f59e0b")} onClick={() => setAssignModal(c.id)}>
                  {acc ? "تغيير" : "توكيل"}
                </button>
              </div>
              {c.notes && <div style={{ marginTop: 10, padding: "9px 13px", background: "rgba(212,175,55,0.06)", border: "1px solid rgba(212,175,55,0.15)", borderRadius: 9, fontSize: 12, color: ACCENT }}>📝 {c.notes}</div>}
            </div>

            {/* Stage */}
            <div style={S.card}>
              <div style={{ padding: "11px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)", fontSize: 11, fontWeight: 700, color: "#374151", textTransform: "uppercase" }}>تغيير المرحلة</div>
              <div style={{ padding: 12, display: "flex", gap: 7, flexWrap: "wrap" }}>
                {STAGES.map(s => (
                  <button key={s} style={{ background: c.stage===s ? SC[s]+"28" : "rgba(255,255,255,0.03)", color: c.stage===s ? SC[s] : "#64748b", border: `1px solid ${c.stage===s ? SC[s]+"55" : "rgba(255,255,255,0.05)"}`, borderRadius: 7, padding: "6px 13px", cursor: c.stage===s ? "default" : "pointer", fontSize: 12, fontWeight: 600, transition: "all 0.15s" }}
                    onClick={() => c.stage !== s && changeStage(s)}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Tasks for this client */}
            <div style={S.card}>
              <div style={{ padding: "11px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#374151", textTransform: "uppercase" }}>المهام ({myTasks.length})</span>
                <button style={S.btn()} onClick={() => { setForm({ status: "معلقة", priority: "متوسطة", clientId: c.id, assignedTo: acc?.name || "فريق داخلي", accountantId: c.accountantId || null }); setModal("task"); }}>
                  <Ic n="add" s={13} /> مهمة جديدة
                </button>
              </div>
              {myTasks.length === 0 && <div style={{ padding: 18, textAlign: "center", color: "#1f2937", fontSize: 12 }}>لا توجد مهام</div>}
              {myTasks.map(t => (
                <div key={t.id} style={{ padding: "11px 16px", borderTop: "1px solid rgba(255,255,255,0.04)", display: "flex", gap: 9, alignItems: "center" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: t.status==="منتهية"?"#374151":"#e2e8f0", textDecoration: t.status==="منتهية"?"line-through":"none" }}>{t.title}</div>
                    <div style={{ fontSize: 10, color: "#374151", marginTop: 1 }}>
                      {t.dueDate} · {t.assignedTo}
                      {t.accountantId && <span style={{ color: "#06b6d4", marginRight: 6 }}>({db.accountants.find(a=>a.id===t.accountantId)?.name})</span>}
                    </div>
                  </div>
                  <Badge t={t.priority} c={PC[t.priority]} sm />
                  <Badge t={t.status} c={TC[t.status]} sm />
                  {t.status !== "منتهية" && (
                    <button style={{ ...S.btn("#10b981"), padding: "4px 7px" }} onClick={() => act({ type: "DONE_TASK", id: t.id })}><Ic n="check" s={12} /></button>
                  )}
                </div>
              ))}
            </div>

            {/* Chat room for this client */}
            {roomId && (
              <div style={{ ...S.card, height: 380, overflow: "hidden" }}>
                <div style={{ padding: "11px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)", fontSize: 11, fontWeight: 700, color: "#374151", textTransform: "uppercase" }}>
                  المحادثة مع المحاسب
                </div>
                <div style={{ height: "calc(100% - 40px)" }}>
                  <ChatRoom
                    roomId={roomId}
                    readOnly={false}
                    messages={db.chats[roomId] || []}
                    onSend={(rid, msg) => act({ type: "SEND_MSG", roomId: rid, msg })}
                    otherLabel={`${acc?.name} ↔ ${c.name}`}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Activity */}
          <div style={{ ...S.card, display: "flex", flexDirection: "column", maxHeight: 600 }}>
            <div style={{ padding: "11px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)", fontSize: 11, fontWeight: 700, color: "#374151", textTransform: "uppercase" }}>سجل الأنشطة</div>
            <div style={{ padding: "9px 12px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", gap: 7 }}>
              <input style={{ ...S.inp, flex: 1, fontSize: 12 }} placeholder="إضافة ملاحظة..." value={noteText} onChange={e => setNoteText(e.target.value)} onKeyDown={e => e.key === "Enter" && addNote()} />
              <button style={{ ...S.sol(), padding: "7px 11px", flexShrink: 0 }} onClick={addNote}><Ic n="note" s={13} /></button>
            </div>
            <div style={{ flex: 1, overflow: "auto" }}>
              {(db.clients.find(cl=>cl.id===c.id)?.activity || []).map((a, i) => (
                <div key={i} style={{ padding: "9px 14px", borderTop: "1px solid rgba(255,255,255,0.04)", display: "flex", gap: 9 }}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: AC[a.type]||"#6b7280", marginTop: 4, flexShrink: 0 }} />
                  <div><div style={{ fontSize: 12, color: "#cbd5e1" }}>{a.text}</div><div style={{ fontSize: 10, color: "#374151", marginTop: 2 }}>{a.date}</div></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ── TASKS ──
  const TasksPage = () => (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        {["الكل","معلقة","قيد التنفيذ","منتهية"].map(f => <button key={f} style={taskF===f ? S.sol() : S.btn()} onClick={() => setTaskF(f)}>{f}</button>)}
        <div style={{ flex: 1 }} />
        <button style={S.sol()} onClick={() => { setForm({ status: "معلقة", priority: "متوسطة", assignedTo: "فريق داخلي" }); setModal("task"); }}>
          <Ic n="add" s={14} /> مهمة جديدة
        </button>
      </div>
      <div style={S.card}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr>{["المهمة","العميل","المحاسب المسند","الأولوية","الموعد","الحالة",""].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
          <tbody>
            {filtTasks.map(t => {
              const cl = db.clients.find(c => c.id === t.clientId);
              const acc = db.accountants.find(a => a.id === t.accountantId);
              return (
                <tr key={t.id}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td style={S.td}><div style={{ fontWeight: 600, fontSize: 13, color: t.status==="منتهية"?"#374151":"inherit", textDecoration: t.status==="منتهية"?"line-through":"none" }}>{t.title}</div></td>
                  <td style={{ ...S.td, fontSize: 11, color: "#64748b" }}>{cl?.name||"—"}</td>
                  <td style={S.td}>
                    {acc
                      ? <span style={{ color: "#06b6d4", fontSize: 12, fontWeight: 600 }}>{acc.name}</span>
                      : <span style={{ color: "#f59e0b", fontSize: 11 }}>{t.assignedTo}</span>
                    }
                  </td>
                  <td style={S.td}><Badge t={t.priority} c={PC[t.priority]} sm /></td>
                  <td style={{ ...S.td, fontSize: 11, color: "#374151" }}>{t.dueDate}</td>
                  <td style={S.td}><Badge t={t.status} c={TC[t.status]} sm /></td>
                  <td style={S.td}>
                    <div style={{ display: "flex", gap: 5 }}>
                      <button style={{ ...S.btn(), padding: "4px 7px" }} onClick={() => { setForm(t); setModal("task"); }}><Ic n="edit" s={12} /></button>
                      {t.status !== "منتهية" && <button style={{ ...S.btn("#10b981"), padding: "4px 7px" }} onClick={() => act({ type: "DONE_TASK", id: t.id })}><Ic n="check" s={12} /></button>}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  // ── ASSIGNMENTS PAGE ──
  const AssignPage = () => (
    <div>
      <div style={{ fontSize: 12, color: "#64748b", marginBottom: 16, background: "rgba(6,182,212,0.06)", border: "1px solid rgba(6,182,212,0.15)", borderRadius: 10, padding: "10px 14px" }}>
        من هنا تعين محاسباً لكل عميل — العميل يظهر تلقائياً في بوابة المحاسب وتفتح غرفة دردشة بينهما
      </div>
      {db.accountants.map(acc => {
        const myClientIds = db.assignments[acc.id] || [];
        const myClients = myClientIds.map(cId => db.clients.find(c => c.id === cId)).filter(Boolean);
        const available = db.clients.filter(c => !myClientIds.includes(c.id) && !c.accountantId);
        return (
          <div key={acc.id} style={{ ...S.card, marginBottom: 14 }}>
            <div style={{ padding: "14px 18px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", gap: 13 }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#06b6d420", color: "#06b6d4", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 16 }}>{acc.name[0]}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 800 }}>{acc.name}</div>
                <div style={{ fontSize: 11, color: "#64748b" }}>{acc.specialty} · {acc.city}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4, color: ACCENT }}>
                <Ic n="star" s={13} /><span style={{ fontSize: 13, fontWeight: 700 }}>{acc.rating}</span>
              </div>
              <Badge t={`${myClients.length} عميل`} c="#06b6d4" sm />
            </div>
            <div style={{ padding: "14px 18px", display: "flex", gap: 20, flexWrap: "wrap" }}>
              {/* Assigned clients */}
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontSize: 10, color: "#374151", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>العملاء الموكَّلون</div>
                {myClients.length === 0 && <div style={{ color: "#374151", fontSize: 12 }}>لا يوجد عملاء</div>}
                {myClients.map(c => (
                  <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{c.name}</div>
                      <div style={{ fontSize: 10, color: "#374151" }}>{c.city} · {c.plan || "—"}</div>
                    </div>
                    <Badge t={c.stage} c={SC[c.stage]} sm />
                    <button style={{ ...S.btn("#06b6d4"), padding: "4px 8px", fontSize: 11 }}
                      onClick={() => { setChatRoom(`${acc.id}-${c.id}`); setPage("chats"); }}>
                      <Ic n="chat" s={11} />
                    </button>
                    <button style={{ ...S.btn("#ef4444"), padding: "4px 8px", fontSize: 11 }}
                      onClick={() => act({ type: "UNASSIGN_ACCT", accountantId: acc.id, clientId: c.id })}>
                      إلغاء
                    </button>
                  </div>
                ))}
              </div>
              {/* Available clients */}
              {available.length > 0 && (
                <div style={{ minWidth: 200 }}>
                  <div style={{ fontSize: 10, color: "#374151", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>إضافة عميل</div>
                  {available.map(c => (
                    <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, color: "#94a3b8" }}>{c.name}</div>
                        <div style={{ fontSize: 10, color: "#374151" }}>{c.city}</div>
                      </div>
                      <button style={{ ...S.sol(ACCENT), padding: "5px 12px", fontSize: 12 }}
                        onClick={() => act({ type: "ASSIGN_ACCT", accountantId: acc.id, clientId: c.id })}>
                        توكيل
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  // ── ACCOUNTANTS ──
  const AccountantsPage = () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 14 }}>
      {db.accountants.map(acc => {
        const myClients = (db.assignments[acc.id]||[]).map(cId => db.clients.find(c=>c.id===cId)).filter(Boolean);
        return (
          <div key={acc.id} style={{ ...S.card, padding: 20, borderTop: `3px solid #06b6d4` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800 }}>{acc.name}</div>
                <div style={{ fontSize: 11, color: "#374151", marginTop: 2 }}>{acc.specialty} · {acc.city}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <Badge t={acc.status} c="#10b981" sm />
                <div style={{ display: "flex", alignItems: "center", gap: 3, color: ACCENT, fontSize: 12, fontWeight: 700 }}>
                  <Ic n="star" s={13} />{acc.rating}
                </div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
              <div style={{ background: "rgba(255,255,255,0.035)", borderRadius: 8, padding: "9px 10px", textAlign: "center" }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#06b6d4" }}>{myClients.length}</div>
                <div style={{ fontSize: 9, color: "#374151", marginTop: 1 }}>عملاء حاليون</div>
              </div>
              <div style={{ background: "rgba(255,255,255,0.035)", borderRadius: 8, padding: "9px 10px", textAlign: "center" }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#10b981" }}>{db.tasks.filter(t=>t.accountantId===acc.id&&t.status!=="منتهية").length}</div>
                <div style={{ fontSize: 9, color: "#374151", marginTop: 1 }}>مهام نشطة</div>
              </div>
            </div>
            {myClients.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                {myClients.slice(0,2).map(c => (
                  <div key={c.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 11, padding: "4px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <span style={{ color: "#94a3b8" }}>{c.name}</span>
                    <Badge t={c.stage} c={SC[c.stage]} sm />
                  </div>
                ))}
              </div>
            )}
            <a href={`https://wa.me/${(acc.phone||"").replace(/^0/,"963")}`} target="_blank" rel="noreferrer"
              style={{ ...S.btn("#25D366"), width: "100%", justifyContent: "center", textDecoration: "none", boxSizing: "border-box" }}>
              <Ic n="wa" s={13} /> واتساب
            </a>
          </div>
        );
      })}
    </div>
  );

  // ── PARTNERS ──
  const PartnersPage = () => (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <button style={S.sol()} onClick={() => { setForm({ commission: 10, status: "جديد" }); setModal("partner"); }}>
          <Ic n="add" s={14} /> شريك جديد
        </button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(270px,1fr))", gap: 14 }}>
        {db.partners.map(p => {
          const myC = db.clients.filter(c => c.partnerId === p.id);
          const unpaid = p.totalEarned - p.totalPaid;
          const sc = p.status==="نشط" ? "#10b981" : p.status==="جديد" ? "#6366f1" : "#6b7280";
          return (
            <div key={p.id} style={{ ...S.card, padding: 18, borderTop: `3px solid ${sc}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800 }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: "#374151", marginTop: 2 }}>{p.city} · {p.phone}</div>
                </div>
                <div style={{ display: "flex", gap: 5 }}>
                  <Badge t={p.status} c={sc} sm />
                  <button style={{ ...S.btn(), padding: "3px 7px" }} onClick={() => { setForm(p); setModal("partner"); }}><Ic n="edit" s={11} /></button>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 7, marginBottom: 13 }}>
                {[{ l:"العملاء",v:myC.length,c:"#3b82f6"},{l:"العمولة",v:p.commission+"%",c:ACCENT},{l:"مستحق",v:(unpaid/1000).toFixed(0)+"K",c:unpaid>0?"#ef4444":"#10b981"}].map(s => (
                  <div key={s.l} style={{ background: "rgba(255,255,255,0.035)", borderRadius: 7, padding: "8px 9px", textAlign: "center" }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: s.c }}>{s.v}</div>
                    <div style={{ fontSize: 9, color: "#374151", marginTop: 1 }}>{s.l}</div>
                  </div>
                ))}
              </div>
              <a href={`https://wa.me/${(p.phone||"").replace(/^0/,"963")}`} target="_blank" rel="noreferrer"
                style={{ ...S.btn("#25D366"), width: "100%", justifyContent: "center", textDecoration: "none", boxSizing: "border-box" }}>
                <Ic n="wa" s={13} /> واتساب
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );

  // ── COMMISSIONS ──
  const CommissionsPage = () => (
    <div style={S.card}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead><tr>{["شريك النمو","النسبة","المكتسب","المدفوع","المستحق",""].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
        <tbody>
          {db.partners.map(p => {
            const unpaid = p.totalEarned - p.totalPaid;
            return (
              <tr key={p.id}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <td style={S.td}><div style={{ fontWeight: 700 }}>{p.name}</div><div style={{ fontSize: 10, color: "#374151" }}>{p.city}</div></td>
                <td style={{ ...S.td, color: ACCENT, fontWeight: 700 }}>{p.commission}%</td>
                <td style={{ ...S.td, color: "#10b981", fontWeight: 600 }}>{p.totalEarned.toLocaleString()} ل.س</td>
                <td style={{ ...S.td, color: "#3b82f6", fontWeight: 600 }}>{p.totalPaid.toLocaleString()} ل.س</td>
                <td style={S.td}><span style={{ color: unpaid>0?"#ef4444":"#10b981", fontWeight: 800, fontSize: 14 }}>{unpaid.toLocaleString()} ل.س</span></td>
                <td style={S.td}>{unpaid>0 && <button style={S.sol("#10b981")} onClick={() => act({ type: "SETTLE", id: p.id })}><Ic n="check" s={13} /> تسوية</button>}</td>
              </tr>
            );
          })}
          <tr style={{ background: "rgba(255,255,255,0.025)" }}>
            <td style={{ ...S.td, fontWeight: 700, color: "#64748b" }} colSpan={4}>الإجمالي المستحق</td>
            <td style={{ ...S.td, color: "#ef4444", fontWeight: 800, fontSize: 15 }}>{unpaidComm.toLocaleString()} ل.س</td>
            <td />
          </tr>
        </tbody>
      </table>
    </div>
  );

  // ── REPORTS ──
  const ReportsPage = () => {
    const byStage = STAGES.map(s => ({ s, n: db.clients.filter(c=>c.stage===s).length }));
    const bySrc = ["شريك نمو","واتساب","إحالة","سوشيال","أخرى"].map(s=>({s,n:db.clients.filter(c=>c.source===s).length})).filter(x=>x.n>0);
    const conv = db.clients.length ? Math.round(db.clients.filter(c=>["مشترك","نشط"].includes(c.stage)).length/db.clients.length*100) : 0;
    const srcC = ["#6366f1","#10b981","#f59e0b","#3b82f6","#8b5cf6"];
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12 }}>
          {[{l:"معدل التحويل",v:conv+"%",c:"#10b981"},{l:"إجمالي العملاء",v:db.clients.length,c:"#3b82f6"},{l:"الإيرادات السنوية",v:(totalRev/1000).toFixed(0)+"K ل.س",c:ACCENT},{l:"شركاء النمو",v:db.partners.filter(p=>p.status==="نشط").length,c:"#6366f1"}].map(k=>(
            <div key={k.l} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${k.c}20`, borderRadius: 12, padding: "16px 18px" }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: k.c }}>{k.v}</div>
              <div style={{ fontSize: 11, color: "#64748b", marginTop: 3 }}>{k.l}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div style={S.card}>
            <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)", fontSize: 12, fontWeight: 700, color: "#94a3b8" }}>توزيع المراحل</div>
            <div style={{ padding: "14px 18px", display: "flex", flexDirection: "column", gap: 9 }}>
              {byStage.map(s => (
                <div key={s.s}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3, fontSize: 11 }}>
                    <span style={{ color: "#94a3b8" }}>{s.s}</span>
                    <span style={{ color: SC[s.s], fontWeight: 700 }}>{s.n}</span>
                  </div>
                  <div style={{ height: 6, background: "rgba(255,255,255,0.05)", borderRadius: 10 }}>
                    <div style={{ width: `${db.clients.length?(s.n/db.clients.length)*100:0}%`, height: "100%", background: SC[s.s], borderRadius: 10, transition: "width 1s ease" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={S.card}>
            <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)", fontSize: 12, fontWeight: 700, color: "#94a3b8" }}>مصادر العملاء</div>
            <div style={{ padding: "14px 18px", display: "flex", flexDirection: "column", gap: 11 }}>
              {bySrc.map((s,i) => {
                const pct = db.clients.length ? Math.round(s.n/db.clients.length*100) : 0;
                return (
                  <div key={s.s} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: srcC[i%srcC.length], flexShrink: 0 }} />
                    <div style={{ flex: 1, fontSize: 12, color: "#94a3b8" }}>{s.s}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: srcC[i%srcC.length] }}>{s.n}</div>
                    <div style={{ fontSize: 10, color: "#374151", width: 28 }}>{pct}%</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ── CHATS MONITOR ──
  const ChatsPage = () => (
    <div style={{ display: "flex", gap: 14, height: "calc(100vh - 130px)" }}>
      <div style={{ width: 250, display: "flex", flexDirection: "column", gap: 6, overflowY: "auto" }}>
        {allRooms.length === 0 && (
          <div style={{ ...S.card, padding: 20, textAlign: "center", color: "#374151", fontSize: 12 }}>
            لا توجد محادثات بعد.<br/>قم بتوكيل محاسب لعميل أولاً.
          </div>
        )}
        {allRooms.map(r => (
          <div key={r.roomId} style={{ background: chatRoom===r.roomId ? ACCENT+"15" : "rgba(255,255,255,0.03)", border: `1px solid ${chatRoom===r.roomId ? ACCENT+"30" : "rgba(255,255,255,0.06)"}`, borderRadius: 10, padding: "12px 13px", cursor: "pointer" }}
            onClick={() => setChatRoom(r.roomId)}>
            <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 2 }}>{r.acc?.name}</div>
            <div style={{ fontSize: 11, color: "#64748b", marginBottom: 5 }}>↔ {r.cl?.name}</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 10, color: "#4b5563", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.lastMsg?.text || "لا رسائل"}</div>
              <div style={{ fontSize: 10, color: ACCENT, fontWeight: 700, marginRight: 6, flexShrink: 0 }}>{r.count}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ flex: 1, ...S.card, overflow: "hidden" }}>
        {chatRoom ? (() => {
          const room = allRooms.find(r => r.roomId === chatRoom);
          return (
            <ChatRoom
              roomId={chatRoom}
              readOnly={false}
              messages={db.chats[chatRoom] || []}
              onSend={(rid, msg) => act({ type: "SEND_MSG", roomId: rid, msg })}
              otherLabel={room ? `${room.acc?.name} ↔ ${room.cl?.name}` : chatRoom}
            />
          );
        })() : (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#374151", fontSize: 13 }}>اختر محادثة من القائمة</div>
        )}
      </div>
    </div>
  );

  // ══════════════════════════════════════════
  //  MODALS
  // ══════════════════════════════════════════
  const ClientModal = () => (
    <Modal title={form.id ? "تعديل عميل" : "عميل جديد"} onClose={closeM}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11 }}>
        {[["name","اسم الشركة"],["phone","رقم الهاتف"],["city","المدينة"]].map(([k,l]) => (
          <div key={k}><label style={S.lbl}>{l}</label><input style={{ ...S.inp, width: "100%", boxSizing: "border-box" }} value={form[k]||""} onChange={e => fv(k, e.target.value)} /></div>
        ))}
        <div><label style={S.lbl}>المرحلة</label>
          <select style={{ ...S.sel, width: "100%", boxSizing: "border-box" }} value={form.stage||"ليد"} onChange={e => fv("stage",e.target.value)}>
            {STAGES.map(s=><option key={s}>{s}</option>)}
          </select>
        </div>
        <div><label style={S.lbl}>المصدر</label>
          <select style={{ ...S.sel, width: "100%", boxSizing: "border-box" }} value={form.source||""} onChange={e => fv("source",e.target.value)}>
            {["شريك نمو","واتساب","إحالة","سوشيال","أخرى"].map(s=><option key={s}>{s}</option>)}
          </select>
        </div>
        <div><label style={S.lbl}>الباقة</label>
          <select style={{ ...S.sel, width: "100%", boxSizing: "border-box" }} value={form.plan||""} onChange={e => fv("plan",e.target.value)}>
            <option value="">غير محددة</option>
            {PLANS.map(p=><option key={p}>{p}</option>)}
          </select>
        </div>
        <div><label style={S.lbl}>الدفع</label>
          <select style={{ ...S.sel, width: "100%", boxSizing: "border-box" }} value={form.paid?"yes":"no"} onChange={e => fv("paid",e.target.value==="yes")}>
            <option value="no">غير مدفوع</option><option value="yes">مدفوع</option>
          </select>
        </div>
        <div><label style={S.lbl}>شريك النمو</label>
          <select style={{ ...S.sel, width: "100%", boxSizing: "border-box" }} value={form.partnerId||""} onChange={e => fv("partnerId",Number(e.target.value)||null)}>
            <option value="">بدون شريك</option>
            {db.partners.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div><label style={S.lbl}>بداية الاشتراك</label><input style={{ ...S.inp, width: "100%", boxSizing: "border-box" }} type="date" value={form.subDate||""} onChange={e => fv("subDate",e.target.value)} /></div>
        <div><label style={S.lbl}>نهاية الاشتراك</label><input style={{ ...S.inp, width: "100%", boxSizing: "border-box" }} type="date" value={form.subEnd||""} onChange={e => fv("subEnd",e.target.value)} /></div>
      </div>
      <div style={{ marginTop: 11 }}><label style={S.lbl}>ملاحظات</label><textarea style={{ ...S.inp, width: "100%", boxSizing: "border-box", height: 60, resize: "vertical" }} value={form.notes||""} onChange={e => fv("notes",e.target.value)} /></div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 9, marginTop: 18 }}>
        <button style={S.btn()} onClick={closeM}>إلغاء</button>
        <button style={S.sol()} onClick={() => { form.id ? act({ type:"SET_CLIENT", id:form.id, data:form }) : act({ type:"ADD_CLIENT", data:form }); closeM(); }}>حفظ</button>
      </div>
    </Modal>
  );

  const TaskModal = () => (
    <Modal title={form.id ? "تعديل مهمة" : "مهمة جديدة"} onClose={closeM}>
      <div style={{ display: "grid", gap: 11 }}>
        <div><label style={S.lbl}>عنوان المهمة</label><input style={{ ...S.inp, width: "100%", boxSizing: "border-box" }} value={form.title||""} onChange={e => fv("title",e.target.value)} /></div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11 }}>
          <div><label style={S.lbl}>العميل</label>
            <select style={{ ...S.sel, width: "100%", boxSizing: "border-box" }} value={form.clientId||""} onChange={e => fv("clientId",Number(e.target.value)||null)}>
              <option value="">اختر عميل</option>
              {db.clients.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div><label style={S.lbl}>إسناد لمحاسب</label>
            <select style={{ ...S.sel, width: "100%", boxSizing: "border-box" }} value={form.accountantId||""} onChange={e => { const id=Number(e.target.value)||null; fv("accountantId",id); fv("assignedTo", id ? db.accountants.find(a=>a.id===id)?.name : form.assignedTo); }}>
              <option value="">فريق داخلي</option>
              {db.accountants.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          <div><label style={S.lbl}>الأولوية</label>
            <select style={{ ...S.sel, width: "100%", boxSizing: "border-box" }} value={form.priority||"متوسطة"} onChange={e => fv("priority",e.target.value)}>
              {["عاجلة","عالية","متوسطة","منخفضة"].map(p=><option key={p}>{p}</option>)}
            </select>
          </div>
          <div><label style={S.lbl}>الحالة</label>
            <select style={{ ...S.sel, width: "100%", boxSizing: "border-box" }} value={form.status||"معلقة"} onChange={e => fv("status",e.target.value)}>
              {["معلقة","قيد التنفيذ","منتهية"].map(s=><option key={s}>{s}</option>)}
            </select>
          </div>
          <div><label style={S.lbl}>الموعد</label><input style={{ ...S.inp, width: "100%", boxSizing: "border-box" }} type="date" value={form.dueDate||""} onChange={e => fv("dueDate",e.target.value)} /></div>
          <div><label style={S.lbl}>المسؤول (نص)</label><input style={{ ...S.inp, width: "100%", boxSizing: "border-box" }} value={form.assignedTo||""} onChange={e => fv("assignedTo",e.target.value)} placeholder="فريق داخلي..." /></div>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 9, marginTop: 18 }}>
        <button style={S.btn()} onClick={closeM}>إلغاء</button>
        <button style={S.sol()} onClick={() => { form.id ? act({ type:"SET_TASK", id:form.id, data:form }) : act({ type:"ADD_TASK", data:form }); closeM(); }}>حفظ</button>
      </div>
    </Modal>
  );

  const PartnerModal = () => (
    <Modal title={form.id ? "تعديل شريك" : "شريك نمو جديد"} onClose={closeM}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11 }}>
        {[["name","الاسم"],["phone","الهاتف"],["city","المدينة"]].map(([k,l])=>(
          <div key={k}><label style={S.lbl}>{l}</label><input style={{ ...S.inp, width: "100%", boxSizing: "border-box" }} value={form[k]||""} onChange={e=>fv(k,e.target.value)} /></div>
        ))}
        <div><label style={S.lbl}>العمولة %</label><input style={{ ...S.inp, width: "100%", boxSizing: "border-box" }} type="number" min="1" max="50" value={form.commission||10} onChange={e=>fv("commission",Number(e.target.value))} /></div>
        <div><label style={S.lbl}>الحالة</label>
          <select style={{ ...S.sel, width: "100%", boxSizing: "border-box" }} value={form.status||"جديد"} onChange={e=>fv("status",e.target.value)}>
            {["نشط","جديد","متوقف"].map(s=><option key={s}>{s}</option>)}
          </select>
        </div>
        {form.id && <>
          <div><label style={S.lbl}>المكتسب</label><input style={{ ...S.inp, width: "100%", boxSizing: "border-box" }} type="number" value={form.totalEarned||0} onChange={e=>fv("totalEarned",Number(e.target.value))} /></div>
          <div><label style={S.lbl}>المدفوع</label><input style={{ ...S.inp, width: "100%", boxSizing: "border-box" }} type="number" value={form.totalPaid||0} onChange={e=>fv("totalPaid",Number(e.target.value))} /></div>
        </>}
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 9, marginTop: 18 }}>
        <button style={S.btn()} onClick={closeM}>إلغاء</button>
        <button style={S.sol()} onClick={() => { form.id ? act({ type:"SET_PARTNER",id:form.id,data:form }) : act({ type:"ADD_PARTNER",data:form }); closeM(); }}>حفظ</button>
      </div>
    </Modal>
  );

  // Quick assign modal
  const AssignAccountantModal = () => {
    const cl = db.clients.find(c => c.id === assignModal);
    if (!cl) return null;
    return (
      <Modal title={`توكيل محاسب — ${cl.name}`} onClose={() => setAssignModal(null)}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {db.accountants.map(acc => {
            const isAssigned = cl.accountantId === acc.id;
            const myLoad = (db.assignments[acc.id]||[]).length;
            return (
              <div key={acc.id} style={{ background: isAssigned ? "#06b6d415" : "rgba(255,255,255,0.04)", border: `1px solid ${isAssigned?"#06b6d430":"rgba(255,255,255,0.07)"}`, borderRadius: 11, padding: "14px 16px", display: "flex", gap: 12, alignItems: "center" }}>
                <div style={{ width: 38, height: 38, borderRadius: "50%", background: "#06b6d420", color: "#06b6d4", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 15 }}>{acc.name[0]}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{acc.name}</div>
                  <div style={{ fontSize: 11, color: "#64748b" }}>{acc.specialty} · {myLoad} عميل حالياً</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 3, marginTop: 3, color: ACCENT, fontSize: 11 }}>
                    <Ic n="star" s={12} /> {acc.rating}
                  </div>
                </div>
                {isAssigned ? (
                  <div style={{ display: "flex", gap: 7 }}>
                    <Badge t="محدد حالياً" c="#06b6d4" sm />
                    <button style={S.btn("#ef4444")} onClick={() => { act({ type:"UNASSIGN_ACCT", accountantId:acc.id, clientId:cl.id }); setAssignModal(null); }}>إلغاء</button>
                  </div>
                ) : (
                  <button style={S.sol()} onClick={() => { act({ type:"ASSIGN_ACCT", accountantId:acc.id, clientId:cl.id }); setAssignModal(null); }}>توكيل</button>
                )}
              </div>
            );
          })}
        </div>
      </Modal>
    );
  };

  // ══════════════════════════════════════════
  //  LAYOUT
  // ══════════════════════════════════════════
  const titles = { dashboard:"الرئيسية", clients:"إدارة العملاء", clientDetail: selClient?.name||"تفاصيل العميل", tasks:"المهام", assign:"التوكيلات", accountants:"المحاسبون", partners:"شركاء النمو", commissions:"العمولات", reports:"التقارير", chats:"مراقبة المحادثات" };
  const isFullH = page === "chats";
  const isClientSection = page === "clients" || page === "clientDetail";

  return (
    <div style={S.app}>
      {/* SIDEBAR */}
      <div style={S.side}>
        <div style={{ padding: "18px 14px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ fontSize: 18, fontWeight: 900, color: ACCENT }}>محاسبجي</div>
          <div style={{ fontSize: 9, color: "#1f2937", marginTop: 1, letterSpacing: 1, textTransform: "uppercase" }}>Admin · لوحة الإدارة</div>
        </div>
        <div style={{ flex: 1, padding: "8px 0", overflowY: "auto" }}>
          {NAV.map(n => (
            <div key={n.id} style={S.nav(page===n.id || (n.id==="clients"&&isClientSection))}
              onClick={() => { setPage(n.id); if (n.id !== "clients") setSelClient(null); }}>
              <Ic n={n.icon} s={15} />
              {n.label}
              {n.badge > 0 && <span style={{ marginRight: "auto", background: "#f59e0b", color: "#07090f", borderRadius: 10, fontSize: 10, fontWeight: 800, padding: "1px 6px" }}>{n.badge}</span>}
            </div>
          ))}
        </div>
        <div style={{ padding: "0 8px 12px" }}>
          <div style={{ ...S.nav(false), color: "#1f2937" }}><Ic n="logout" s={14} /> تسجيل خروج</div>
        </div>
      </div>

      {/* MAIN */}
      <div style={S.main}>
        <div style={S.hdr}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 800, color: "#f1f5f9" }}>{titles[page]}</div>
            <div style={{ fontSize: 10, color: "#1f2937", marginTop: 1 }}>{TODAY_STR}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.04)", borderRadius: 9, padding: "7px 11px" }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: `linear-gradient(135deg,${ACCENT},#f59e0b)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#07090f" }}>أ</div>
            <div><div style={{ fontSize: 12, fontWeight: 700 }}>أبو عمر</div><div style={{ fontSize: 9, color: "#1f2937" }}>Super Admin</div></div>
          </div>
        </div>
        <div style={isFullH ? { flex: 1, overflow: "hidden", padding: "16px 26px" } : S.body}>
          {page === "dashboard"   && <Dashboard />}
          {page === "clients"     && <ClientsList />}
          {page === "clientDetail"&& <ClientDetail />}
          {page === "tasks"       && <TasksPage />}
          {page === "assign"      && <AssignPage />}
          {page === "accountants" && <AccountantsPage />}
          {page === "partners"    && <PartnersPage />}
          {page === "commissions" && <CommissionsPage />}
          {page === "reports"     && <ReportsPage />}
          {page === "chats"       && <ChatsPage />}
        </div>
      </div>

      {/* MODALS */}
      {modal === "client"  && <ClientModal />}
      {modal === "task"    && <TaskModal />}
      {modal === "partner" && <PartnerModal />}
      {assignModal         && <AssignAccountantModal />}
    </div>
  );
}
