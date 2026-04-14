import { useState, useRef, useEffect, useMemo } from "react";

// ═══════════════════════════════════════════════════════════
//  SEED DATA
// ═══════════════════════════════════════════════════════════
const NOW = () => new Date().toLocaleTimeString("ar-SY", { hour: "2-digit", minute: "2-digit" });
const TODAY = new Date().toLocaleDateString("ar-SY", { weekday: "long", day: "numeric", month: "long" });

const SEED_STATE = {
  // accountant → client assignments: { accountantId: [clientId, ...] }
  assignments: { 1: [1, 5], 2: [3] },

  clients: [
    { id: 1, name: "شركة النور للتجارة", phone: "0991234567", city: "دمشق", plan: "أساسي", stage: "نشط", paid: true, subEnd: "2025-07-15", marketerId: 1 },
    { id: 3, name: "مطعم البيت الشامي", phone: "0551234567", city: "جدة", plan: "متقدم", stage: "مشترك", paid: true, subEnd: "2026-01-01", marketerId: 1 },
    { id: 5, name: "مكتب المستقبل", phone: "0501234567", city: "الرياض", plan: "متقدم", stage: "نشط", paid: true, subEnd: "2026-03-01", marketerId: 2 },
  ],

  accountants: [
    { id: 1, name: "نور الدين حسن", specialty: "محاسبة عامة", city: "دمشق", phone: "0993334444", rating: 4.8, status: "نشط" },
    { id: 2, name: "ريم السالم", specialty: "ضريبة وزكاة", city: "الرياض", phone: "0556789012", rating: 4.6, status: "نشط" },
  ],

  tasks: [
    { id: 1, title: "مراجعة القيود الشهرية", clientId: 1, accountantId: 1, dueDate: "2025-04-20", status: "قيد التنفيذ", priority: "عالية" },
    { id: 2, title: "إعداد التقرير الضريبي", clientId: 5, accountantId: 1, dueDate: "2025-04-25", status: "معلقة", priority: "عاجلة" },
    { id: 3, title: "تسوية الحسابات", clientId: 3, accountantId: 2, dueDate: "2025-04-30", status: "معلقة", priority: "متوسطة" },
  ],

  invoices: [
    { id: 1, clientId: 1, amount: 120000, date: "2025-01-15", status: "مدفوعة", desc: "اشتراك سنوي - باقة أساسي" },
    { id: 2, clientId: 5, amount: 220000, date: "2025-03-01", status: "مدفوعة", desc: "اشتراك سنوي - باقة متقدم" },
    { id: 3, clientId: 1, amount: 35000, date: "2025-04-01", status: "معلقة", desc: "خدمات إضافية - ربع أول" },
    { id: 4, clientId: 3, amount: 220000, date: "2025-01-01", status: "مدفوعة", desc: "اشتراك سنوي - باقة متقدم" },
  ],

  // chats: { roomId: [{ id, from, text, time, date }] }
  // roomId = `${accountantId}-${clientId}`
  chats: {
    "1-1": [
      { id: 1, from: "accountant", text: "مرحباً، تمت مراجعة القيود لشهر مارس. هل تريد التقرير الكامل؟", time: "09:15", date: "أمس" },
      { id: 2, from: "client", text: "نعم من فضلك، وأضف ملاحظة على إجمالي المشتريات", time: "09:32", date: "أمس" },
      { id: 3, from: "accountant", text: "تم. لاحظت فرقاً في فاتورة المورد رقم 7، هل تأكدت منها؟", time: "10:01", date: "أمس" },
      { id: 4, from: "client", text: "صحيح، كانت خطأ وتم التصحيح. شكراً للمتابعة", time: "10:15", date: "أمس" },
    ],
    "1-5": [
      { id: 1, from: "accountant", text: "السلام عليكم، جاهز لبدء التقرير الضريبي للربع الأول", time: "11:00", date: TODAY },
      { id: 2, from: "client", text: "وعليكم السلام، تفضل. هل تحتاج مستندات إضافية؟", time: "11:05", date: TODAY },
    ],
    "2-3": [
      { id: 1, from: "accountant", text: "مرحباً، بدأت بمراجعة ملف التسوية. سأرسل لك الملاحظات قريباً", time: "08:30", date: TODAY },
    ],
  },
};

// ═══════════════════════════════════════════════════════════
//  HELPERS & ICONS
// ═══════════════════════════════════════════════════════════
const IC = {
  dash: "M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z",
  chat: "M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z",
  task: "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z",
  bill: "M20 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v4z",
  user: "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z",
  send: "M2.01 21L23 12 2.01 3 2 10l15 2-15 2z",
  back: "M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z",
  star: "M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z",
  check: "M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z",
  eye: "M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z",
  link: "M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z",
  admin: "M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z",
  acct: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z",
  biz: "M20 6h-2.18c.07-.44.18-.88.18-1.34C18 2.54 15.95.5 13.5.5c-1.54 0-2.91.78-3.73 1.96l-.77 1.02-.77-1.02C7.41 1.28 6.04.5 4.5.5 2.05.5 0 2.54 0 4.66c0 .46.11.9.18 1.34H0c-1.1 0-1.99.9-1.99 2v12c0 1.1.89 2 1.99 2h20c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7.5-3.5c1.1 0 2 .9 2 2S13.6 7 12.5 7 10.5 6.1 10.5 5s.9-1.5 2-1.5z",
  logout: "M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z",
};
const Ic = ({ n, s = 18 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}><path d={IC[n] || IC.dash} /></svg>;
const Badge = ({ t, c, sm }) => <span style={{ background: c + "20", color: c, border: `1px solid ${c}33`, borderRadius: 20, padding: sm ? "2px 8px" : "4px 12px", fontSize: sm ? 11 : 12, fontWeight: 600, whiteSpace: "nowrap" }}>{t}</span>;

const PRIO_C = { "عاجلة": "#ef4444", "عالية": "#f97316", "متوسطة": "#3b82f6", "منخفضة": "#6b7280" };
const TASK_C = { "معلقة": "#f59e0b", "قيد التنفيذ": "#3b82f6", "منتهية": "#10b981" };
const INV_C = { "مدفوعة": "#10b981", "معلقة": "#f59e0b", "متأخرة": "#ef4444" };

// ═══════════════════════════════════════════════════════════
//  SHARED STYLES
// ═══════════════════════════════════════════════════════════
const BG = {
  admin: "#06080f",
  accountant: "#070d10",
  client: "#080a0f",
};
const ACCENT = {
  admin: "#d4af37",
  accountant: "#06b6d4",
  client: "#8b5cf6",
};

const baseStyles = (role) => ({
  app: { display: "flex", height: "100vh", background: BG[role], fontFamily: "'Cairo','Segoe UI',sans-serif", direction: "rtl", color: "#e2e8f0", overflow: "hidden" },
  sidebar: { width: 210, background: "rgba(255,255,255,0.02)", borderLeft: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", flexShrink: 0 },
  main: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" },
  hdr: { padding: "14px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,0.01)", flexShrink: 0 },
  body: { flex: 1, overflow: "auto", padding: "20px 24px" },
  card: { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, overflow: "hidden" },
  th: { padding: "10px 14px", fontSize: 10, color: "#374151", fontWeight: 700, textAlign: "right", background: "rgba(255,255,255,0.04)", letterSpacing: 0.5, textTransform: "uppercase" },
  td: { padding: "11px 14px", fontSize: 13, borderTop: "1px solid rgba(255,255,255,0.04)", verticalAlign: "middle" },
  inp: { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "8px 12px", color: "#e2e8f0", fontSize: 13, fontFamily: "inherit", outline: "none" },
  nav: (a, accent) => ({ display: "flex", alignItems: "center", gap: 9, padding: "10px 14px", margin: "2px 8px", borderRadius: 9, cursor: "pointer", fontSize: 13, fontWeight: a ? 700 : 500, background: a ? accent + "15" : "transparent", color: a ? accent : "#64748b", border: a ? `1px solid ${accent}25` : "1px solid transparent", transition: "all 0.15s" }),
  btn: (c) => ({ background: c + "18", color: c, border: `1px solid ${c}30`, borderRadius: 8, padding: "7px 13px", cursor: "pointer", fontSize: 12, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 5 }),
  sol: (c) => ({ background: c, color: ["#d4af37", "#f59e0b"].includes(c) ? "#06080f" : "#fff", border: "none", borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontSize: 13, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 6 }),
});

// ═══════════════════════════════════════════════════════════
//  CHAT COMPONENT (shared)
// ═══════════════════════════════════════════════════════════
function ChatRoom({ roomId, myRole, myName, otherName, accent, messages, onSend }) {
  const [text, setText] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = () => {
    const t = text.trim();
    if (!t) return;
    onSend(roomId, { id: Date.now(), from: myRole, text: t, time: NOW(), date: TODAY });
    setText("");
  };

  const grouped = useMemo(() => {
    const g = [];
    let lastDate = null;
    (messages || []).forEach(m => {
      if (m.date !== lastDate) { g.push({ type: "date", date: m.date }); lastDate = m.date; }
      g.push({ type: "msg", ...m });
    });
    return g;
  }, [messages]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "rgba(255,255,255,0.01)" }}>
      {/* Header */}
      <div style={{ padding: "14px 18px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 12, background: "rgba(255,255,255,0.02)", flexShrink: 0 }}>
        <div style={{ width: 38, height: 38, borderRadius: "50%", background: accent + "20", color: accent, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 15 }}>{otherName?.[0]}</div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700 }}>{otherName}</div>
          <div style={{ fontSize: 11, color: "#10b981", display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", display: "inline-block" }} />
            متصل الآن
          </div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflow: "auto", padding: "16px 18px", display: "flex", flexDirection: "column", gap: 4 }}>
        {grouped.map((item, i) => {
          if (item.type === "date") return (
            <div key={i} style={{ textAlign: "center", margin: "10px 0" }}>
              <span style={{ background: "rgba(255,255,255,0.06)", borderRadius: 20, padding: "3px 12px", fontSize: 11, color: "#64748b" }}>{item.date}</span>
            </div>
          );
          const isMe = item.from === myRole;
          return (
            <div key={item.id} style={{ display: "flex", justifyContent: isMe ? "flex-start" : "flex-end", marginBottom: 2 }}>
              <div style={{ maxWidth: "72%", display: "flex", flexDirection: "column", alignItems: isMe ? "flex-start" : "flex-end" }}>
                <div style={{
                  background: isMe ? accent + "20" : "rgba(255,255,255,0.07)",
                  border: `1px solid ${isMe ? accent + "30" : "rgba(255,255,255,0.08)"}`,
                  borderRadius: isMe ? "4px 16px 16px 16px" : "16px 4px 16px 16px",
                  padding: "10px 14px",
                  fontSize: 13,
                  color: "#e2e8f0",
                  lineHeight: 1.5,
                }}>
                  {item.text}
                </div>
                <div style={{ fontSize: 10, color: "#374151", marginTop: 3, padding: "0 4px" }}>{item.time}</div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: "12px 16px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", gap: 10, background: "rgba(255,255,255,0.02)", flexShrink: 0 }}>
        <input
          style={{ flex: 1, background: "rgba(255,255,255,0.06)", border: `1px solid rgba(255,255,255,0.1)`, borderRadius: 24, padding: "10px 16px", color: "#e2e8f0", fontSize: 13, fontFamily: "inherit", outline: "none" }}
          placeholder="اكتب رسالة..."
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
        />
        <button onClick={send} style={{ width: 42, height: 42, borderRadius: "50%", background: accent, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: ["#d4af37", "#f59e0b"].includes(accent) ? "#06080f" : "#fff", flexShrink: 0 }}>
          <Ic n="send" s={18} />
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  STAT CARD
// ═══════════════════════════════════════════════════════════
const StatCard = ({ label, value, sub, color, icon }) => (
  <div style={{ background: "rgba(255,255,255,0.03)", border: `1px solid rgba(255,255,255,0.06)`, borderRadius: 13, padding: "16px 18px", display: "flex", gap: 13, alignItems: "center", transition: "border-color 0.2s", cursor: "default" }}
    onMouseEnter={e => e.currentTarget.style.borderColor = color + "44"}
    onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"}>
    <div style={{ background: color + "18", borderRadius: 10, padding: 10, color }}><Ic n={icon} s={20} /></div>
    <div>
      <div style={{ fontSize: 24, fontWeight: 800, color: "#f1f5f9", lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 3 }}>{label}</div>
      {sub && <div style={{ fontSize: 10, color, marginTop: 2 }}>{sub}</div>}
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════
//  ADMIN PORTAL
// ═══════════════════════════════════════════════════════════
function AdminPortal({ state, dispatch, accent }) {
  const [page, setPage] = useState("dashboard");
  const [selectedRoom, setSelectedRoom] = useState(null);
  const S = baseStyles("admin");

  const NAV = [
    { id: "dashboard", label: "لوحة التحكم", icon: "dash" },
    { id: "assignments", label: "التوكيلات", icon: "link" },
    { id: "chats", label: "مراقبة المحادثات", icon: "chat" },
  ];

  const allRooms = useMemo(() => {
    const rooms = [];
    Object.entries(state.assignments).forEach(([accId, clientIds]) => {
      const acc = state.accountants.find(a => a.id === Number(accId));
      clientIds.forEach(cId => {
        const cl = state.clients.find(c => c.id === cId);
        const roomId = `${accId}-${cId}`;
        const msgs = state.chats[roomId] || [];
        rooms.push({ roomId, acc, cl, lastMsg: msgs[msgs.length - 1], count: msgs.length });
      });
    });
    return rooms;
  }, [state]);

  const Dashboard = () => {
    const totalClients = state.clients.length;
    const activeAssign = Object.values(state.assignments).flat().length;
    const totalMsgs = Object.values(state.chats).reduce((s, msgs) => s + msgs.length, 0);
    const pendTasks = state.tasks.filter(t => t.status !== "منتهية").length;

    return (
      <div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12, marginBottom: 22 }}>
          <StatCard label="العملاء الكلي" value={totalClients} color="#10b981" icon="user" sub="عملاء نشطين" />
          <StatCard label="توكيلات نشطة" value={activeAssign} color={accent} icon="link" sub="محاسب ↔ عميل" />
          <StatCard label="إجمالي الرسائل" value={totalMsgs} color="#06b6d4" icon="chat" sub="في كل الغرف" />
          <StatCard label="مهام معلقة" value={pendTasks} color="#f59e0b" icon="task" sub="تحتاج متابعة" />
        </div>

        {/* Recent chats overview */}
        <div style={{ fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>آخر نشاط في المحادثات</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {allRooms.map(r => (
            <div key={r.roomId} style={{ ...S.card, padding: "14px 18px", display: "flex", gap: 14, alignItems: "center", cursor: "pointer", transition: "border-color 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = accent + "44"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"}
              onClick={() => { setSelectedRoom(r.roomId); setPage("chats"); }}>
              <div style={{ display: "flex", gap: -6 }}>
                {[r.acc?.name?.[0], r.cl?.name?.[0]].map((ch, i) => (
                  <div key={i} style={{ width: 34, height: 34, borderRadius: "50%", background: [accent + "20", "#06b6d420"][i], color: [accent, "#06b6d4"][i], display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13, marginRight: i === 0 ? 4 : 0, border: "2px solid rgba(0,0,0,0.4)" }}>{ch}</div>
                ))}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{r.acc?.name} ↔ {r.cl?.name}</div>
                <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{r.lastMsg?.text?.slice(0, 50)}...</div>
              </div>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: 11, color: "#374151" }}>{r.lastMsg?.time}</div>
                <div style={{ background: accent + "20", color: accent, borderRadius: 10, padding: "1px 8px", fontSize: 10, fontWeight: 700, marginTop: 4 }}>{r.count} رسالة</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const AssignmentsPage = () => {
    const assign = (accId, clientId) => dispatch({ type: "ASSIGN", accId, clientId });
    const unassign = (accId, clientId) => dispatch({ type: "UNASSIGN", accId, clientId });

    return (
      <div>
        {state.accountants.map(acc => {
          const myClients = (state.assignments[acc.id] || []).map(cId => state.clients.find(c => c.id === cId)).filter(Boolean);
          const available = state.clients.filter(c => !(state.assignments[acc.id] || []).includes(c.id));
          return (
            <div key={acc.id} style={{ ...S.card, marginBottom: 16 }}>
              <div style={{ padding: "14px 18px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", gap: 13 }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: accent + "20", color: accent, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 16 }}>{acc.name[0]}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 800 }}>{acc.name}</div>
                  <div style={{ fontSize: 11, color: "#64748b" }}>{acc.specialty} · {acc.city}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4, color: accent }}>
                  <Ic n="star" s={14} />
                  <span style={{ fontSize: 13, fontWeight: 700 }}>{acc.rating}</span>
                </div>
              </div>
              <div style={{ padding: 16, display: "flex", gap: 16, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ fontSize: 11, color: "#374151", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>العملاء الموكَّلون ({myClients.length})</div>
                  {myClients.length === 0 && <div style={{ color: "#374151", fontSize: 12 }}>لا يوجد عملاء</div>}
                  {myClients.map(c => (
                    <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{c.name}</div>
                        <div style={{ fontSize: 10, color: "#374151" }}>{c.city} · {c.plan}</div>
                      </div>
                      <button style={{ ...S.btn("#ef4444"), padding: "4px 10px", fontSize: 11 }} onClick={() => unassign(acc.id, c.id)}>إلغاء</button>
                      <button style={{ ...S.btn("#06b6d4"), padding: "4px 10px", fontSize: 11 }}
                        onClick={() => { setSelectedRoom(`${acc.id}-${c.id}`); setPage("chats"); }}>
                        <Ic n="eye" s={12} />
                      </button>
                    </div>
                  ))}
                </div>
                {available.length > 0 && (
                  <div style={{ minWidth: 200 }}>
                    <div style={{ fontSize: 11, color: "#374151", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>إضافة عميل</div>
                    {available.map(c => (
                      <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0" }}>
                        <div style={{ flex: 1, fontSize: 12, color: "#94a3b8" }}>{c.name}</div>
                        <button style={{ ...S.sol(accent), padding: "5px 12px", fontSize: 12 }} onClick={() => assign(acc.id, c.id)}>توكيل</button>
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
  };

  const ChatsPage = () => {
    const room = allRooms.find(r => r.roomId === selectedRoom);
    return (
      <div style={{ display: "flex", gap: 16, height: "calc(100vh - 130px)" }}>
        {/* Room list */}
        <div style={{ width: 260, display: "flex", flexDirection: "column", gap: 6, overflowY: "auto" }}>
          {allRooms.map(r => (
            <div key={r.roomId} style={{ background: selectedRoom === r.roomId ? accent + "15" : "rgba(255,255,255,0.03)", border: `1px solid ${selectedRoom === r.roomId ? accent + "30" : "rgba(255,255,255,0.06)"}`, borderRadius: 11, padding: "12px 14px", cursor: "pointer", transition: "all 0.15s" }}
              onClick={() => setSelectedRoom(r.roomId)}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{r.acc?.name}</div>
              <div style={{ fontSize: 11, color: "#64748b", marginBottom: 6 }}>↔ {r.cl?.name}</div>
              <div style={{ fontSize: 11, color: "#4b5563", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.lastMsg?.text || "لا توجد رسائل"}</div>
            </div>
          ))}
        </div>

        {/* Chat view (read-only for admin) */}
        <div style={{ flex: 1, ...S.card, overflow: "hidden" }}>
          {selectedRoom && room ? (
            <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
              {/* Admin read-only notice */}
              <div style={{ padding: "8px 16px", background: accent + "10", borderBottom: `1px solid ${accent}20`, fontSize: 11, color: accent, display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                <Ic n="eye" s={13} /> وضع المراقبة — أنت تشاهد المحادثة فقط
              </div>
              <ChatRoom
                roomId={selectedRoom}
                myRole="admin"
                myName="أبو عمر"
                otherName={`${room.acc?.name} ↔ ${room.cl?.name}`}
                accent={accent}
                messages={state.chats[selectedRoom] || []}
                onSend={(rid, msg) => dispatch({ type: "SEND_MSG", roomId: rid, msg })}
              />
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#374151", fontSize: 14 }}>اختر محادثة للمراقبة</div>
          )}
        </div>
      </div>
    );
  };

  const titles = { dashboard: "لوحة التحكم", assignments: "إدارة التوكيلات", chats: "مراقبة المحادثات" };

  return (
    <div style={S.app}>
      <div style={S.sidebar}>
        <div style={{ padding: "18px 14px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ fontSize: 16, fontWeight: 900, color: accent }}>محاسبجي</div>
          <div style={{ fontSize: 9, color: "#1f2937", marginTop: 1, letterSpacing: 1 }}>ADMIN PORTAL</div>
        </div>
        <div style={{ flex: 1, padding: "8px 0" }}>
          {NAV.map(n => <div key={n.id} style={S.nav(page === n.id, accent)} onClick={() => setPage(n.id)}><Ic n={n.icon} s={15} />{n.label}</div>)}
        </div>
        <div style={{ padding: "0 8px 10px" }}>
          <div style={{ ...S.nav(false, accent), color: "#1f2937" }}><Ic n="logout" s={14} />خروج</div>
        </div>
      </div>
      <div style={S.main}>
        <div style={S.hdr}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#f1f5f9" }}>{titles[page]}</div>
            <div style={{ fontSize: 10, color: "#1f2937", marginTop: 1 }}>{TODAY}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.04)", borderRadius: 9, padding: "7px 11px" }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: `linear-gradient(135deg,${accent},#f59e0b)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#06080f" }}>أ</div>
            <div><div style={{ fontSize: 12, fontWeight: 700 }}>أبو عمر</div><div style={{ fontSize: 9, color: "#1f2937" }}>Super Admin</div></div>
          </div>
        </div>
        <div style={page === "chats" ? { flex: 1, overflow: "hidden", padding: "16px 24px" } : S.body}>
          {page === "dashboard" && <Dashboard />}
          {page === "assignments" && <AssignmentsPage />}
          {page === "chats" && <ChatsPage />}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  ACCOUNTANT PORTAL
// ═══════════════════════════════════════════════════════════
function AccountantPortal({ state, dispatch, accountantId, accent }) {
  const [page, setPage] = useState("dashboard");
  const [chatClientId, setChatClientId] = useState(null);
  const S = baseStyles("accountant");

  const acc = state.accountants.find(a => a.id === accountantId);
  const myClientIds = state.assignments[accountantId] || [];
  const myClients = myClientIds.map(cId => state.clients.find(c => c.id === cId)).filter(Boolean);
  const myTasks = state.tasks.filter(t => t.accountantId === accountantId);

  const NAV = [
    { id: "dashboard", label: "لوحة التحكم", icon: "dash" },
    { id: "clients", label: "عملائي", icon: "user" },
    { id: "tasks", label: "المهام", icon: "task" },
    { id: "chat", label: "المحادثات", icon: "chat" },
  ];

  const Dashboard = () => {
    const done = myTasks.filter(t => t.status === "منتهية").length;
    return (
      <div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: 12, marginBottom: 22 }}>
          <StatCard label="عملائي" value={myClients.length} color={accent} icon="user" sub="عملاء موكَّلون لي" />
          <StatCard label="مهام نشطة" value={myTasks.filter(t => t.status !== "منتهية").length} color="#f59e0b" icon="task" sub="تحتاج إنجاز" />
          <StatCard label="مهام منتهية" value={done} color="#10b981" icon="check" sub="هذا الشهر" />
          <StatCard label="تقييمي" value={acc?.rating} color={accent} icon="star" sub="من 5 نجوم" />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {/* Clients */}
          <div style={S.card}>
            <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)", fontSize: 12, fontWeight: 700, color: "#94a3b8" }}>عملائي</div>
            {myClients.map(c => (
              <div key={c.id} style={{ padding: "12px 16px", borderTop: "1px solid rgba(255,255,255,0.04)", display: "flex", gap: 10, alignItems: "center", cursor: "pointer" }}
                onClick={() => { setChatClientId(c.id); setPage("chat"); }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: accent + "20", color: accent, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13 }}>{c.name[0]}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{c.name}</div>
                  <div style={{ fontSize: 11, color: "#374151" }}>{c.city} · {c.plan}</div>
                </div>
                <div style={{ ...S.btn(accent), padding: "5px 9px" }}><Ic n="chat" s={13} /></div>
              </div>
            ))}
          </div>

          {/* Urgent tasks */}
          <div style={S.card}>
            <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)", fontSize: 12, fontWeight: 700, color: "#94a3b8" }}>المهام العاجلة</div>
            {myTasks.filter(t => t.status !== "منتهية").map(t => {
              const cl = state.clients.find(c => c.id === t.clientId);
              return (
                <div key={t.id} style={{ padding: "11px 16px", borderTop: "1px solid rgba(255,255,255,0.04)", display: "flex", gap: 10, alignItems: "center" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>{t.title}</div>
                    <div style={{ fontSize: 10, color: "#374151", marginTop: 2 }}>{cl?.name} · {t.dueDate}</div>
                  </div>
                  <Badge t={t.priority} c={PRIO_C[t.priority]} sm />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const ClientsPage = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {myClients.map(c => (
        <div key={c.id} style={{ ...S.card, padding: 18, borderRight: `3px solid ${accent}` }}>
          <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
            <div style={{ width: 44, height: 44, borderRadius: "50%", background: accent + "20", color: accent, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 18 }}>{c.name[0]}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 800 }}>{c.name}</div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{c.phone} · {c.city}</div>
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <Badge t={c.plan} c={accent} sm />
                <Badge t={c.stage} c="#10b981" sm />
                <Badge t={c.paid ? "مدفوع" : "غير مدفوع"} c={c.paid ? "#10b981" : "#ef4444"} sm />
              </div>
            </div>
            <button style={S.sol(accent)} onClick={() => { setChatClientId(c.id); setPage("chat"); }}>
              <Ic n="chat" s={14} /> فتح المحادثة
            </button>
          </div>
          {/* Client's tasks */}
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ fontSize: 11, color: "#374151", fontWeight: 700, marginBottom: 8, textTransform: "uppercase" }}>مهام هذا العميل</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {state.tasks.filter(t => t.clientId === c.id && t.accountantId === accountantId).map(t => (
                <div key={t.id} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <div style={{ flex: 1, fontSize: 12 }}>{t.title}</div>
                  <Badge t={t.priority} c={PRIO_C[t.priority]} sm />
                  <Badge t={t.status} c={TASK_C[t.status]} sm />
                  {t.status !== "منتهية" && (
                    <button style={{ ...S.btn("#10b981"), padding: "3px 8px", fontSize: 11 }}
                      onClick={() => dispatch({ type: "COMPLETE_TASK", id: t.id })}>
                      <Ic n="check" s={11} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const TasksPage = () => (
    <div style={S.card}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead><tr>{["المهمة", "العميل", "الأولوية", "الموعد", "الحالة", ""].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
        <tbody>
          {myTasks.map(t => {
            const cl = state.clients.find(c => c.id === t.clientId);
            return (
              <tr key={t.id} onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <td style={S.td}><div style={{ fontWeight: 600, color: t.status === "منتهية" ? "#374151" : "inherit", textDecoration: t.status === "منتهية" ? "line-through" : "none" }}>{t.title}</div></td>
                <td style={{ ...S.td, fontSize: 11, color: "#64748b" }}>{cl?.name}</td>
                <td style={S.td}><Badge t={t.priority} c={PRIO_C[t.priority]} sm /></td>
                <td style={{ ...S.td, fontSize: 11, color: "#374151" }}>{t.dueDate}</td>
                <td style={S.td}><Badge t={t.status} c={TASK_C[t.status]} sm /></td>
                <td style={S.td}>{t.status !== "منتهية" && <button style={{ ...S.sol(accent), padding: "6px 12px" }} onClick={() => dispatch({ type: "COMPLETE_TASK", id: t.id })}><Ic n="check" s={13} /></button>}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  const ChatPage = () => {
    const roomId = chatClientId ? `${accountantId}-${chatClientId}` : null;
    const chatClient = myClients.find(c => c.id === chatClientId);
    return (
      <div style={{ display: "flex", gap: 14, height: "calc(100vh - 130px)" }}>
        {/* Client list */}
        <div style={{ width: 220, display: "flex", flexDirection: "column", gap: 6, overflowY: "auto" }}>
          {myClients.map(c => {
            const rid = `${accountantId}-${c.id}`;
            const msgs = state.chats[rid] || [];
            const last = msgs[msgs.length - 1];
            const active = chatClientId === c.id;
            return (
              <div key={c.id} style={{ background: active ? accent + "15" : "rgba(255,255,255,0.03)", border: `1px solid ${active ? accent + "30" : "rgba(255,255,255,0.06)"}`, borderRadius: 10, padding: "12px 13px", cursor: "pointer" }}
                onClick={() => setChatClientId(c.id)}>
                <div style={{ display: "flex", gap: 9, alignItems: "center" }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: accent + "20", color: accent, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13 }}>{c.name[0]}</div>
                  <div style={{ flex: 1, overflow: "hidden" }}>
                    <div style={{ fontSize: 12, fontWeight: 700 }}>{c.name}</div>
                    <div style={{ fontSize: 10, color: "#374151", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginTop: 2 }}>{last?.text || "ابدأ المحادثة"}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ flex: 1, ...S.card, overflow: "hidden" }}>
          {roomId && chatClient ? (
            <ChatRoom roomId={roomId} myRole="accountant" myName={acc?.name} otherName={chatClient.name} accent={accent} messages={state.chats[roomId] || []} onSend={(rid, msg) => dispatch({ type: "SEND_MSG", roomId: rid, msg })} />
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#374151", fontSize: 13 }}>اختر عميلاً لبدء المحادثة</div>
          )}
        </div>
      </div>
    );
  };

  const titles = { dashboard: "لوحة التحكم", clients: "عملائي", tasks: "المهام", chat: "المحادثات" };
  const isChatPage = page === "chat";

  return (
    <div style={S.app}>
      <div style={S.sidebar}>
        <div style={{ padding: "18px 14px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ fontSize: 16, fontWeight: 900, color: accent }}>محاسبجي</div>
          <div style={{ fontSize: 9, color: "#1f2937", marginTop: 1, letterSpacing: 1 }}>بوابة المحاسب</div>
        </div>
        <div style={{ flex: 1, padding: "8px 0" }}>
          {NAV.map(n => <div key={n.id} style={S.nav(page === n.id, accent)} onClick={() => setPage(n.id)}><Ic n={n.icon} s={15} />{n.label}</div>)}
        </div>
        <div style={{ padding: "12px 14px 14px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div style={{ width: 34, height: 34, borderRadius: "50%", background: accent + "20", color: accent, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}>{acc?.name?.[0]}</div>
            <div><div style={{ fontSize: 12, fontWeight: 700 }}>{acc?.name}</div><div style={{ fontSize: 9, color: "#1f2937" }}>{acc?.specialty}</div></div>
          </div>
        </div>
      </div>
      <div style={S.main}>
        <div style={S.hdr}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#f1f5f9" }}>{titles[page]}</div>
            <div style={{ fontSize: 10, color: "#1f2937", marginTop: 1 }}>{TODAY}</div>
          </div>
        </div>
        <div style={isChatPage ? { flex: 1, overflow: "hidden", padding: "16px 24px" } : S.body}>
          {page === "dashboard" && <Dashboard />}
          {page === "clients" && <ClientsPage />}
          {page === "tasks" && <TasksPage />}
          {page === "chat" && <ChatPage />}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  BUSINESS OWNER (CLIENT) PORTAL
// ═══════════════════════════════════════════════════════════
function ClientPortal({ state, dispatch, clientId, accent }) {
  const [page, setPage] = useState("dashboard");
  const S = baseStyles("client");

  const client = state.clients.find(c => c.id === clientId);

  // Find my accountant
  const myAccountantId = Object.entries(state.assignments).find(([accId, clients]) => clients.includes(clientId))?.[0];
  const myAccountant = myAccountantId ? state.accountants.find(a => a.id === Number(myAccountantId)) : null;
  const roomId = myAccountantId ? `${myAccountantId}-${clientId}` : null;

  const myTasks = state.tasks.filter(t => t.clientId === clientId);
  const myInvoices = state.invoices.filter(i => i.clientId === clientId);
  const paidTotal = myInvoices.filter(i => i.status === "مدفوعة").reduce((s, i) => s + i.amount, 0);
  const pendingTotal = myInvoices.filter(i => i.status !== "مدفوعة").reduce((s, i) => s + i.amount, 0);

  const NAV = [
    { id: "dashboard", label: "لوحة التحكم", icon: "dash" },
    { id: "tasks", label: "مهامي", icon: "task" },
    { id: "invoices", label: "الفواتير", icon: "bill" },
    { id: "chat", label: "التواصل مع المحاسب", icon: "chat" },
  ];

  const Dashboard = () => (
    <div>
      {/* Accountant card */}
      {myAccountant ? (
        <div style={{ ...S.card, padding: 20, marginBottom: 18, borderRight: `3px solid ${accent}`, display: "flex", gap: 16, alignItems: "center" }}>
          <div style={{ width: 50, height: 50, borderRadius: "50%", background: accent + "20", color: accent, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 20 }}>{myAccountant.name[0]}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: "#374151", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>محاسبك المعتمد</div>
            <div style={{ fontSize: 17, fontWeight: 800 }}>{myAccountant.name}</div>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{myAccountant.specialty} · {myAccountant.city}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 6, color: "#f59e0b" }}>
              {[1,2,3,4,5].map(s => <Ic key={s} n="star" s={13} />)}
              <span style={{ fontSize: 12, fontWeight: 700, marginRight: 4, color: "#e2e8f0" }}>{myAccountant.rating}</span>
            </div>
          </div>
          <button style={S.sol(accent)} onClick={() => setPage("chat")}>
            <Ic n="chat" s={14} /> تواصل معه
          </button>
        </div>
      ) : (
        <div style={{ ...S.card, padding: 20, marginBottom: 18, textAlign: "center", color: "#374151", borderRight: `3px solid #374151` }}>
          لم يتم تعيين محاسب بعد — سيتم إشعارك عند التعيين
        </div>
      )}

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: 12, marginBottom: 20 }}>
        <StatCard label="المهام الجارية" value={myTasks.filter(t => t.status !== "منتهية").length} color={accent} icon="task" sub="مهام في الإنجاز" />
        <StatCard label="مدفوع" value={(paidTotal / 1000).toFixed(0) + "K ل.س"} color="#10b981" icon="bill" sub="إجمالي المدفوع" />
        <StatCard label="مستحق" value={(pendingTotal / 1000).toFixed(0) + "K ل.س"} color={pendingTotal > 0 ? "#ef4444" : "#10b981"} icon="bill" sub="فواتير معلقة" />
        <StatCard label="الباقة" value={client?.plan || "—"} color="#6366f1" icon="star" sub={`ينتهي ${client?.subEnd || "—"}`} />
      </div>

      {/* Recent activity */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div style={S.card}>
          <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)", fontSize: 12, fontWeight: 700, color: "#94a3b8" }}>آخر المهام</div>
          {myTasks.slice(-4).reverse().map(t => (
            <div key={t.id} style={{ padding: "10px 16px", borderTop: "1px solid rgba(255,255,255,0.04)", display: "flex", gap: 10, alignItems: "center" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 600 }}>{t.title}</div>
                <div style={{ fontSize: 10, color: "#374151", marginTop: 1 }}>{t.dueDate}</div>
              </div>
              <Badge t={t.status} c={TASK_C[t.status]} sm />
            </div>
          ))}
        </div>
        <div style={S.card}>
          <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)", fontSize: 12, fontWeight: 700, color: "#94a3b8" }}>آخر الفواتير</div>
          {myInvoices.slice(-4).reverse().map(i => (
            <div key={i.id} style={{ padding: "10px 16px", borderTop: "1px solid rgba(255,255,255,0.04)", display: "flex", gap: 10, alignItems: "center" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 600 }}>{i.desc}</div>
                <div style={{ fontSize: 10, color: "#374151", marginTop: 1 }}>{i.date}</div>
              </div>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#e2e8f0" }}>{i.amount.toLocaleString()}</div>
                <Badge t={i.status} c={INV_C[i.status]} sm />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const TasksPage = () => (
    <div style={S.card}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead><tr>{["المهمة", "الأولوية", "الموعد", "الحالة"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
        <tbody>
          {myTasks.map(t => (
            <tr key={t.id} onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <td style={S.td}><div style={{ fontWeight: 600, color: t.status === "منتهية" ? "#374151" : "inherit", textDecoration: t.status === "منتهية" ? "line-through" : "none" }}>{t.title}</div></td>
              <td style={S.td}><Badge t={t.priority} c={PRIO_C[t.priority]} sm /></td>
              <td style={{ ...S.td, fontSize: 11, color: "#374151" }}>{t.dueDate}</td>
              <td style={S.td}><Badge t={t.status} c={TASK_C[t.status]} sm /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const InvoicesPage = () => (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 18 }}>
        <StatCard label="إجمالي المدفوع" value={(paidTotal / 1000).toFixed(0) + "K"} color="#10b981" icon="bill" />
        <StatCard label="مستحق الدفع" value={(pendingTotal / 1000).toFixed(0) + "K"} color={pendingTotal > 0 ? "#ef4444" : "#10b981"} icon="bill" />
        <StatCard label="عدد الفواتير" value={myInvoices.length} color={accent} icon="bill" />
      </div>
      <div style={S.card}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr>{["الوصف", "التاريخ", "المبلغ", "الحالة"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
          <tbody>
            {myInvoices.map(i => (
              <tr key={i.id} onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <td style={S.td}><div style={{ fontWeight: 600 }}>{i.desc}</div></td>
                <td style={{ ...S.td, fontSize: 11, color: "#374151" }}>{i.date}</td>
                <td style={{ ...S.td, fontWeight: 700, color: "#e2e8f0" }}>{i.amount.toLocaleString()} ل.س</td>
                <td style={S.td}><Badge t={i.status} c={INV_C[i.status]} sm /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const ChatPage = () => (
    <div style={{ height: "calc(100vh - 130px)", display: "flex", flexDirection: "column" }}>
      {!myAccountant ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1, color: "#374151", fontSize: 13 }}>لم يتم تعيين محاسب بعد</div>
      ) : (
        <div style={{ flex: 1, ...S.card, overflow: "hidden" }}>
          <ChatRoom roomId={roomId} myRole="client" myName={client?.name} otherName={myAccountant.name} accent={accent} messages={state.chats[roomId] || []} onSend={(rid, msg) => dispatch({ type: "SEND_MSG", roomId: rid, msg })} />
        </div>
      )}
    </div>
  );

  const titles = { dashboard: "لوحة التحكم", tasks: "مهامي", invoices: "الفواتير", chat: "التواصل مع المحاسب" };
  const isChatPage = page === "chat";

  return (
    <div style={S.app}>
      <div style={S.sidebar}>
        <div style={{ padding: "18px 14px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ fontSize: 16, fontWeight: 900, color: accent }}>محاسبجي</div>
          <div style={{ fontSize: 9, color: "#1f2937", marginTop: 1, letterSpacing: 1 }}>بوابة الأعمال</div>
        </div>
        <div style={{ flex: 1, padding: "8px 0" }}>
          {NAV.map(n => <div key={n.id} style={S.nav(page === n.id, accent)} onClick={() => setPage(n.id)}><Ic n={n.icon} s={15} />{n.label}</div>)}
        </div>
        <div style={{ padding: "12px 14px 14px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div style={{ width: 34, height: 34, borderRadius: "50%", background: accent + "20", color: accent, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13 }}>{client?.name?.[0]}</div>
            <div><div style={{ fontSize: 12, fontWeight: 700, maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{client?.name}</div><div style={{ fontSize: 9, color: "#1f2937" }}>{client?.plan}</div></div>
          </div>
        </div>
      </div>
      <div style={S.main}>
        <div style={S.hdr}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#f1f5f9" }}>{titles[page]}</div>
            <div style={{ fontSize: 10, color: "#1f2937", marginTop: 1 }}>{TODAY}</div>
          </div>
        </div>
        <div style={isChatPage ? { flex: 1, overflow: "hidden", padding: "16px 24px" } : { flex: 1, overflow: "auto", padding: "20px 24px" }}>
          {page === "dashboard" && <Dashboard />}
          {page === "tasks" && <TasksPage />}
          {page === "invoices" && <InvoicesPage />}
          {page === "chat" && <ChatPage />}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  ROOT — ROLE SWITCHER
// ═══════════════════════════════════════════════════════════
function reducer(state, action) {
  switch (action.type) {
    case "SEND_MSG": {
      const existing = state.chats[action.roomId] || [];
      return { ...state, chats: { ...state.chats, [action.roomId]: [...existing, action.msg] } };
    }
    case "ASSIGN": {
      const cur = state.assignments[action.accId] || [];
      if (cur.includes(action.clientId)) return state;
      const roomId = `${action.accId}-${action.clientId}`;
      return {
        ...state,
        assignments: { ...state.assignments, [action.accId]: [...cur, action.clientId] },
        chats: state.chats[roomId] ? state.chats : { ...state.chats, [roomId]: [] },
      };
    }
    case "UNASSIGN": {
      const cur = state.assignments[action.accId] || [];
      return { ...state, assignments: { ...state.assignments, [action.accId]: cur.filter(c => c !== action.clientId) } };
    }
    case "COMPLETE_TASK":
      return { ...state, tasks: state.tasks.map(t => t.id === action.id ? { ...t, status: "منتهية" } : t) };
    default:
      return state;
  }
}

const ROLES = [
  { id: "admin", label: "أبو عمر", sub: "Super Admin", icon: "admin", accent: "#d4af37" },
  { id: "acc1", label: "نور الدين حسن", sub: "محاسب معتمد", icon: "acct", accent: "#06b6d4" },
  { id: "acc2", label: "ريم السالم", sub: "محاسب معتمد", icon: "acct", accent: "#06b6d4" },
  { id: "cl1", label: "شركة النور للتجارة", sub: "صاحب عمل", icon: "biz", accent: "#8b5cf6" },
  { id: "cl5", label: "مكتب المستقبل", sub: "صاحب عمل", icon: "biz", accent: "#8b5cf6" },
  { id: "cl3", label: "مطعم البيت الشامي", sub: "صاحب عمل", icon: "biz", accent: "#8b5cf6" },
];

export default function PortalsApp({ initialRole = null, onLogout }) {
  const [state, dispatch] = useState(SEED_STATE);
  const [role, setRole] = useState(initialRole);

  const wrappedDispatch = (action) => setRole(r => { dispatch(action); return r; });
  // actual reducer
  const [appState, appDispatch] = useState(SEED_STATE);
  const realDispatch = (action) => appDispatch(prev => reducer(prev, action));

  if (!role) {
    return (
      <div style={{ minHeight: "100vh", background: "#06080f", fontFamily: "'Cairo','Segoe UI',sans-serif", direction: "rtl", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ marginBottom: 36, textAlign: "center" }}>
          <div style={{ fontSize: 32, fontWeight: 900, color: "#d4af37", marginBottom: 6 }}>محاسبجي</div>
          <div style={{ fontSize: 14, color: "#64748b" }}>اختر دورك للدخول إلى البوابة المناسبة</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 14, width: "100%", maxWidth: 780 }}>
          {ROLES.map(r => (
            <div key={r.id} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid rgba(255,255,255,0.07)`, borderRadius: 16, padding: "22px 20px", cursor: "pointer", textAlign: "center", transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = r.accent + "55"; e.currentTarget.style.transform = "translateY(-3px)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.transform = "translateY(0)"; }}
              onClick={() => setRole(r.id)}>
              <div style={{ width: 52, height: 52, borderRadius: "50%", background: r.accent + "20", color: r.accent, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                <Ic n={r.icon} s={24} />
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#f1f5f9", marginBottom: 4 }}>{r.label}</div>
              <div style={{ fontSize: 11, color: "#64748b" }}>{r.sub}</div>
              <div style={{ marginTop: 14, background: r.accent + "15", color: r.accent, borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 700 }}>دخول →</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 28, fontSize: 11, color: "#374151" }}>النظام يعمل بشكل كامل — الرسائل تُحفظ وتظهر عند التبديل بين الأدوار</div>
      </div>
    );
  }

  const roleObj = ROLES.find(r => r.id === role);

  const backBtn = (
    <button onClick={() => onLogout ? onLogout() : setRole(null)} style={{ position: "fixed", bottom: 20, left: 20, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 24, padding: "10px 18px", color: "#94a3b8", cursor: "pointer", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 7, zIndex: 999, backdropFilter: "blur(8px)" }}>
      ← تسجيل خروج
    </button>
  );

  return (
    <>
      {role === "admin" && <AdminPortal state={appState} dispatch={realDispatch} accent="#d4af37" />}
      {role === "acc1" && <AccountantPortal state={appState} dispatch={realDispatch} accountantId={1} accent="#06b6d4" />}
      {role === "acc2" && <AccountantPortal state={appState} dispatch={realDispatch} accountantId={2} accent="#06b6d4" />}
      {role === "cl1" && <ClientPortal state={appState} dispatch={realDispatch} clientId={1} accent="#8b5cf6" />}
      {role === "cl5" && <ClientPortal state={appState} dispatch={realDispatch} clientId={5} accent="#8b5cf6" />}
      {role === "cl3" && <ClientPortal state={appState} dispatch={realDispatch} clientId={3} accent="#8b5cf6" />}
      {backBtn}
    </>
  );
}
