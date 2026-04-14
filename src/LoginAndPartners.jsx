import { useState, useEffect, useRef } from "react";

// ═══════════════════════════════════════════════════════════
//  MOCK USER DATABASE
// ═══════════════════════════════════════════════════════════
const USERS = [
  { email: "admin@muhasebji.com",   password: "admin123",   role: "admin",    name: "أبو عمر",               sub: "Super Admin" },
  { email: "nour@muhasebji.com",    password: "nour123",    role: "accountant", name: "نور الدين حسن",       sub: "محاسب معتمد", id: 1 },
  { email: "reem@muhasebji.com",    password: "reem123",    role: "accountant", name: "ريم السالم",           sub: "محاسب معتمد", id: 2 },
  { email: "alnoor@client.com",     password: "alnoor123",  role: "client",   name: "شركة النور للتجارة",    sub: "باقة أساسي", id: 1 },
  { email: "almustaqbal@client.com",password: "must123",    role: "client",   name: "مكتب المستقبل",         sub: "باقة متقدم", id: 5 },
  { email: "albait@client.com",     password: "bait123",    role: "client",   name: "مطعم البيت الشامي",    sub: "باقة متقدم", id: 3 },
  { email: "ahmad@partner.com",     password: "ahmad123",   role: "partner",  name: "أحمد الخالد",           sub: "شريك نمو", id: 1 },
  { email: "sara@partner.com",      password: "sara123",    role: "partner",  name: "سارة المحمد",           sub: "شريك نمو", id: 2 },
  { email: "khaled@partner.com",    password: "khaled123",  role: "partner",  name: "خالد العمر",            sub: "شريك نمو", id: 3 },
];

const ROLE_META = {
  admin:      { label: "Super Admin",     color: "#d4af37", icon: "M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" },
  accountant: { label: "محاسب معتمد",    color: "#06b6d4", icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" },
  client:     { label: "صاحب عمل",       color: "#8b5cf6", icon: "M20 6h-2.18c.07-.44.18-.88.18-1.34C18 2.54 15.95.5 13.5.5c-1.54 0-2.91.78-3.73 1.96l-.77 1.02-.77-1.02C7.41 1.28 6.04.5 4.5.5 2.05.5 0 2.54 0 4.66c0 .46.11.9.18 1.34H0c-1.1 0-1.99.9-1.99 2v12c0 1.1.89 2 1.99 2h20c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2z" },
  partner:    { label: "شريك نمو",       color: "#10b981", icon: "M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" },
};

// ═══════════════════════════════════════════════════════════
//  PARTNERS DATA
// ═══════════════════════════════════════════════════════════
const PARTNERS_DATA = [
  { id: 1, name: "أحمد الخالد",  phone: "0991112222", city: "دمشق",  commission: 15, totalEarned: 450000, totalPaid: 300000, status: "نشط",  joinDate: "2024-10-01", referralCode: "AHMAD-MCJ",
    clients: [
      { id: 1, name: "شركة النور للتجارة", stage: "نشط",    plan: "أساسي", date: "2025-01-15", commission: 18000 },
      { id: 6, name: "البناء الذهبي",      stage: "متوقف",  plan: "أساسي", date: "2024-06-01", commission: 18000 },
      { id: 3, name: "مطعم البيت الشامي", stage: "مشترك",  plan: "متقدم", date: "2025-01-01", commission: 26400 },
    ],
    payouts: [
      { id: 1, amount: 150000, date: "2025-01-01", status: "مدفوع",   note: "دفعة يناير" },
      { id: 2, amount: 150000, date: "2025-03-01", status: "مدفوع",   note: "دفعة مارس" },
      { id: 3, amount: 150000, date: "2025-05-01", status: "معلقة",   note: "دفعة مايو" },
    ],
  },
  { id: 2, name: "سارة المحمد", phone: "0551234321", city: "الرياض", commission: 12, totalEarned: 280000, totalPaid: 280000, status: "نشط",  joinDate: "2024-11-15", referralCode: "SARA-MCJ",
    clients: [
      { id: 2, name: "مؤسسة الفجر",   stage: "عرض",   plan: "متقدم", date: "2025-03-28", commission: 0 },
      { id: 5, name: "مكتب المستقبل", stage: "نشط",   plan: "متقدم", date: "2025-03-01", commission: 26400 },
    ],
    payouts: [
      { id: 1, amount: 280000, date: "2025-04-01", status: "مدفوع", note: "تسوية كاملة" },
    ],
  },
  { id: 3, name: "خالد العمر",  phone: "0507654321", city: "جدة",   commission: 10, totalEarned: 90000,  totalPaid: 0,      status: "جديد", joinDate: "2025-02-01", referralCode: "KHALED-MCJ",
    clients: [
      { id: 4, name: "صيدلية الصحة", stage: "ليد", plan: null, date: "2025-04-08", commission: 0 },
    ],
    payouts: [],
  },
];

const STAGE_C = { "ليد": "#6366f1", "تواصل": "#f59e0b", "عرض": "#3b82f6", "مشترك": "#8b5cf6", "نشط": "#10b981", "متوقف": "#6b7280" };

// ═══════════════════════════════════════════════════════════
//  ICON
// ═══════════════════════════════════════════════════════════
const Ic = ({ d, s = 18, style }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0, ...style }}>
    <path d={d} />
  </svg>
);
const PATHS = {
  eye:     "M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z",
  eyeoff:  "M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z",
  dash:    "M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z",
  clients: "M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z",
  money:   "M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z",
  link:    "M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z",
  copy:    "M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z",
  check:   "M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z",
  logout:  "M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z",
  star:    "M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z",
  trend:   "M23 6.99l-5 5.01-3.99-4.01L9 13.01 4.5 8.5 3 10l6 6 5-5.01 3.99 4.01L23 10V6.99z",
  info:    "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z",
};
const I = ({ n, s = 18 }) => <Ic d={PATHS[n] || PATHS.dash} s={s} />;

const Badge = ({ t, c, sm }) => (
  <span style={{ background: c + "20", color: c, border: `1px solid ${c}33`, borderRadius: 20, padding: sm ? "2px 8px" : "4px 12px", fontSize: sm ? 11 : 12, fontWeight: 600, whiteSpace: "nowrap" }}>{t}</span>
);

// ═══════════════════════════════════════════════════════════
//  LOGIN PAGE
// ═══════════════════════════════════════════════════════════
function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(null);
  const [copied, setCopied] = useState(null);

  const demoAccounts = [
    { label: "أبو عمر",      email: "admin@muhasebji.com",    pass: "admin123",   role: "admin" },
    { label: "المحاسب",      email: "nour@muhasebji.com",     pass: "nour123",    role: "accountant" },
    { label: "صاحب العمل",   email: "alnoor@client.com",      pass: "alnoor123",  role: "client" },
    { label: "شريك النمو",   email: "ahmad@partner.com",      pass: "ahmad123",   role: "partner" },
  ];

  const handleLogin = async () => {
    if (!email || !password) { setError("يرجى إدخال البريد وكلمة المرور"); return; }
    setLoading(true);
    setError("");
    await new Promise(r => setTimeout(r, 900));
    const user = USERS.find(u => u.email === email.trim().toLowerCase() && u.password === password);
    if (user) { onLogin(user); }
    else { setError("البريد الإلكتروني أو كلمة المرور غير صحيحة"); setLoading(false); }
  };

  const fillDemo = (acc) => {
    setEmail(acc.email);
    setPassword(acc.pass);
    setError("");
  };

  const roleColor = { admin: "#d4af37", accountant: "#06b6d4", client: "#8b5cf6", partner: "#10b981" };

  return (
    <div style={{ minHeight: "100vh", background: "#06080f", fontFamily: "'Cairo','Segoe UI',sans-serif", direction: "rtl", display: "flex", overflow: "hidden", position: "relative" }}>
      {/* Background decoration */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
        <div style={{ position: "absolute", top: -200, right: -200, width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(212,175,55,0.06) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", bottom: -150, left: -150, width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(6,182,212,0.04) 0%, transparent 70%)" }} />
        {/* Grid lines */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
      </div>

      {/* Left panel — branding */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "60px 80px", position: "relative" }}>
        <div style={{ marginBottom: 60 }}>
          <div style={{ fontSize: 42, fontWeight: 900, color: "#d4af37", letterSpacing: -1, marginBottom: 8 }}>محاسبجي</div>
          <div style={{ fontSize: 16, color: "#64748b", lineHeight: 1.7 }}>منصة إدارة الأعمال المالية<br />للشركات الصغيرة والمتوسطة</div>
        </div>

        {/* Feature pills */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            { color: "#d4af37", icon: "dash", text: "لوحة تحكم شاملة لإدارة حساباتك" },
            { color: "#06b6d4", icon: "clients", text: "محاسبون معتمدون في خدمتك مباشرة" },
            { color: "#10b981", icon: "money", text: "تتبع العمولات والمدفوعات بدقة" },
            { color: "#8b5cf6", icon: "link", text: "تواصل مباشر وآمن مع فريقك" },
          ].map((f, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: f.color + "15", color: f.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <I n={f.icon} s={16} />
              </div>
              <div style={{ fontSize: 13, color: "#94a3b8" }}>{f.text}</div>
            </div>
          ))}
        </div>

        {/* Role badges */}
        <div style={{ marginTop: 50, display: "flex", gap: 8, flexWrap: "wrap" }}>
          {Object.entries(ROLE_META).map(([role, meta]) => (
            <div key={role} style={{ background: meta.color + "12", border: `1px solid ${meta.color}25`, borderRadius: 20, padding: "5px 14px", fontSize: 11, color: meta.color, fontWeight: 600 }}>
              {meta.label}
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — login form */}
      <div style={{ width: 440, background: "rgba(255,255,255,0.025)", borderRight: "1px solid rgba(255,255,255,0.07)", display: "flex", flexDirection: "column", justifyContent: "center", padding: "48px 40px", position: "relative" }}>
        <div style={{ marginBottom: 36 }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#f1f5f9", marginBottom: 6 }}>تسجيل الدخول</div>
          <div style={{ fontSize: 13, color: "#64748b" }}>الوصول متاح للأعضاء المدعوين فقط</div>
        </div>

        {/* Email */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 11, color: "#64748b", fontWeight: 700, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>البريد الإلكتروني</label>
          <input
            type="email"
            value={email}
            onChange={e => { setEmail(e.target.value); setError(""); }}
            onFocus={() => setFocused("email")}
            onBlur={() => setFocused(null)}
            onKeyDown={e => e.key === "Enter" && handleLogin()}
            placeholder="name@domain.com"
            style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: `1px solid ${focused === "email" ? "#d4af37" : "rgba(255,255,255,0.1)"}`, borderRadius: 10, padding: "12px 14px", color: "#e2e8f0", fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s", direction: "ltr", textAlign: "right" }}
          />
        </div>

        {/* Password */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 11, color: "#64748b", fontWeight: 700, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>كلمة المرور</label>
          <div style={{ position: "relative" }}>
            <input
              type={showPass ? "text" : "password"}
              value={password}
              onChange={e => { setPassword(e.target.value); setError(""); }}
              onFocus={() => setFocused("pass")}
              onBlur={() => setFocused(null)}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              placeholder="••••••••"
              style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: `1px solid ${focused === "pass" ? "#d4af37" : "rgba(255,255,255,0.1)"}`, borderRadius: 10, padding: "12px 44px 12px 14px", color: "#e2e8f0", fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s" }}
            />
            <button onClick={() => setShowPass(p => !p)} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#4b5563", padding: 4 }}>
              <Ic d={showPass ? PATHS.eyeoff : PATHS.eye} s={16} />
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#ef4444", marginBottom: 18, display: "flex", alignItems: "center", gap: 8 }}>
            <I n="info" s={14} /> {error}
          </div>
        )}

        {/* Login button */}
        <button
          onClick={handleLogin}
          disabled={loading}
          style={{ width: "100%", background: loading ? "rgba(212,175,55,0.3)" : "#d4af37", color: "#06080f", border: "none", borderRadius: 10, padding: "13px", fontSize: 15, fontWeight: 800, cursor: loading ? "wait" : "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.2s" }}
        >
          {loading ? (
            <>
              <div style={{ width: 16, height: 16, border: "2px solid rgba(0,0,0,0.2)", borderTop: "2px solid #06080f", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
              جاري التحقق...
            </>
          ) : "دخول →"}
        </button>

        <div style={{ marginTop: 16, textAlign: "center", fontSize: 11, color: "#374151" }}>
          هذه المنصة مغلقة — التسجيل عبر دعوة من الإدارة فقط
        </div>

        {/* Demo accounts */}
        <div style={{ marginTop: 32, paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ fontSize: 11, color: "#374151", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 12, textAlign: "center" }}>حسابات تجريبية</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {demoAccounts.map(acc => (
              <button key={acc.role} onClick={() => fillDemo(acc)}
                style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${roleColor[acc.role]}25`, borderRadius: 8, padding: "9px 12px", cursor: "pointer", fontFamily: "inherit", textAlign: "right", transition: "all 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.background = roleColor[acc.role] + "12"}
                onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}>
                <div style={{ fontSize: 12, fontWeight: 700, color: roleColor[acc.role] }}>{acc.label}</div>
                <div style={{ fontSize: 10, color: "#374151", marginTop: 2, direction: "ltr", textAlign: "right" }}>{acc.email}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  PARTNER PORTAL
// ═══════════════════════════════════════════════════════════
function PartnerPortal({ user, onLogout }) {
  const [page, setPage] = useState("dashboard");
  const [copied, setCopied] = useState(false);
  const accent = "#10b981";
  const partner = PARTNERS_DATA.find(p => p.id === user.id);

  if (!partner) return <div style={{ color: "white", padding: 40 }}>لم يتم العثور على بياناتك</div>;

  const unpaid = partner.totalEarned - partner.totalPaid;
  const activeClients = partner.clients.filter(c => c.stage === "نشط" || c.stage === "مشترك").length;
  const convRate = partner.clients.length ? Math.round(partner.clients.filter(c => ["نشط", "مشترك"].includes(c.stage)).length / partner.clients.length * 100) : 0;

  const copyCode = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const NAV = [
    { id: "dashboard", label: "لوحة التحكم", icon: "dash" },
    { id: "clients",   label: "عملائي",       icon: "clients" },
    { id: "earnings",  label: "أرباحي",        icon: "money" },
    { id: "referral",  label: "رابط الإحالة",  icon: "link" },
  ];

  const navStyle = (a) => ({
    display: "flex", alignItems: "center", gap: 9, padding: "10px 14px", margin: "2px 8px",
    borderRadius: 9, cursor: "pointer", fontSize: 13, fontWeight: a ? 700 : 500,
    background: a ? accent + "15" : "transparent", color: a ? accent : "#64748b",
    border: a ? `1px solid ${accent}25` : "1px solid transparent", transition: "all 0.15s",
  });

  const card = { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, overflow: "hidden" };
  const th = { padding: "10px 14px", fontSize: 10, color: "#374151", fontWeight: 700, textAlign: "right", background: "rgba(255,255,255,0.04)", letterSpacing: 0.5, textTransform: "uppercase" };
  const td = { padding: "11px 14px", fontSize: 13, borderTop: "1px solid rgba(255,255,255,0.04)", verticalAlign: "middle" };

  const Dashboard = () => {
    // Progress bar for monthly goal
    const monthlyGoal = 500000;
    const progress = Math.min((partner.totalEarned / monthlyGoal) * 100, 100);

    return (
      <div>
        {/* Welcome */}
        <div style={{ ...card, padding: "20px 24px", marginBottom: 18, background: `linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(6,182,212,0.04) 100%)`, borderColor: accent + "25" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: accent + "20", color: accent, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 22 }}>{partner.name[0]}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 19, fontWeight: 800, color: "#f1f5f9" }}>أهلاً، {partner.name} 👋</div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>شريك نمو · {partner.city} · انضم {partner.joinDate}</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>نسبة عمولتك</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: accent }}>{partner.commission}%</div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12, marginBottom: 20 }}>
          {[
            { l: "العملاء النشطين", v: activeClients, sub: `من ${partner.clients.length} إجمالي`, c: accent, icon: "clients" },
            { l: "إجمالي الأرباح", v: (partner.totalEarned / 1000).toFixed(0) + "K", sub: "ل.س مكتسبة", c: "#d4af37", icon: "money" },
            { l: "مستحق الدفع", v: (unpaid / 1000).toFixed(0) + "K", sub: "ل.س", c: unpaid > 0 ? "#f59e0b" : accent, icon: "money" },
            { l: "معدل التحويل", v: convRate + "%", sub: "من الإحالات", c: "#6366f1", icon: "trend" },
          ].map(s => (
            <div key={s.l} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid rgba(255,255,255,0.06)`, borderRadius: 13, padding: "16px 18px", display: "flex", gap: 12, alignItems: "center", transition: "border-color 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = s.c + "44"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"}>
              <div style={{ background: s.c + "18", borderRadius: 10, padding: 9, color: s.c }}><I n={s.icon} s={18} /></div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 800, color: "#f1f5f9", lineHeight: 1 }}>{s.v}</div>
                <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 3 }}>{s.l}</div>
                <div style={{ fontSize: 9, color: s.c, marginTop: 2 }}>{s.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Progress toward goal */}
        <div style={{ ...card, padding: "18px 20px", marginBottom: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#cbd5e1" }}>التقدم نحو الهدف السنوي</div>
            <div style={{ fontSize: 12, color: "#64748b" }}>{partner.totalEarned.toLocaleString()} / {monthlyGoal.toLocaleString()} ل.س</div>
          </div>
          <div style={{ height: 10, background: "rgba(255,255,255,0.06)", borderRadius: 10, overflow: "hidden" }}>
            <div style={{ width: progress + "%", height: "100%", background: `linear-gradient(90deg, ${accent}, #06b6d4)`, borderRadius: 10, transition: "width 1s ease" }} />
          </div>
          <div style={{ fontSize: 11, color: accent, marginTop: 6 }}>{Math.round(progress)}% من الهدف</div>
        </div>

        {/* Recent clients */}
        <div style={card}>
          <div style={{ padding: "13px 18px", borderBottom: "1px solid rgba(255,255,255,0.05)", fontSize: 12, fontWeight: 700, color: "#94a3b8" }}>آخر عملائك</div>
          {partner.clients.slice(-3).reverse().map(c => (
            <div key={c.id} style={{ padding: "11px 18px", borderTop: "1px solid rgba(255,255,255,0.04)", display: "flex", gap: 12, alignItems: "center" }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: STAGE_C[c.stage] + "20", color: STAGE_C[c.stage], display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13 }}>{c.name[0]}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{c.name}</div>
                <div style={{ fontSize: 10, color: "#374151", marginTop: 1 }}>{c.date}</div>
              </div>
              <Badge t={c.stage} c={STAGE_C[c.stage]} sm />
              {c.commission > 0 && <div style={{ fontSize: 12, color: accent, fontWeight: 700 }}>{c.commission.toLocaleString()} ل.س</div>}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const ClientsPage = () => (
    <div>
      <div style={{ ...card, marginBottom: 16, padding: "14px 18px", background: "rgba(16,185,129,0.05)", borderColor: accent + "25", fontSize: 12, color: "#64748b" }}>
        <I n="info" s={13} style={{ display: "inline", marginLeft: 6, color: accent }} />
        تظهر هنا فقط العملاء الذين أحلتهم أنت — لا تظهر بيانات العملاء الآخرين
      </div>
      <div style={card}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr>{["العميل", "المرحلة", "الباقة", "تاريخ الإحالة", "العمولة المحتسبة"].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
          <tbody>
            {partner.clients.map(c => (
              <tr key={c.id}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <td style={td}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 30, height: 30, borderRadius: "50%", background: STAGE_C[c.stage] + "20", color: STAGE_C[c.stage], display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 12 }}>{c.name[0]}</div>
                    <div style={{ fontWeight: 700 }}>{c.name}</div>
                  </div>
                </td>
                <td style={td}><Badge t={c.stage} c={STAGE_C[c.stage]} sm /></td>
                <td style={td}>{c.plan ? <Badge t={c.plan} c="#6366f1" sm /> : <span style={{ color: "#374151", fontSize: 11 }}>—</span>}</td>
                <td style={{ ...td, fontSize: 11, color: "#374151" }}>{c.date}</td>
                <td style={td}>
                  {c.commission > 0
                    ? <span style={{ color: accent, fontWeight: 700 }}>{c.commission.toLocaleString()} ل.س</span>
                    : <span style={{ color: "#374151", fontSize: 11 }}>لم يشترك بعد</span>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const EarningsPage = () => (
    <div>
      {/* Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 18 }}>
        {[
          { l: "إجمالي المكتسب", v: partner.totalEarned.toLocaleString() + " ل.س", c: "#d4af37" },
          { l: "المدفوع", v: partner.totalPaid.toLocaleString() + " ل.س", c: accent },
          { l: "المستحق", v: unpaid.toLocaleString() + " ل.س", c: unpaid > 0 ? "#f59e0b" : accent },
        ].map(s => (
          <div key={s.l} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${s.c}20`, borderRadius: 13, padding: "18px 20px" }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.c }}>{s.v}</div>
            <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Payout history */}
      <div style={{ ...card, marginBottom: 18 }}>
        <div style={{ padding: "13px 18px", borderBottom: "1px solid rgba(255,255,255,0.05)", fontSize: 12, fontWeight: 700, color: "#94a3b8" }}>سجل المدفوعات</div>
        {partner.payouts.length === 0 && <div style={{ padding: 30, textAlign: "center", color: "#374151", fontSize: 13 }}>لا توجد مدفوعات بعد</div>}
        {partner.payouts.map(p => (
          <div key={p.id} style={{ padding: "12px 18px", borderTop: "1px solid rgba(255,255,255,0.04)", display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: p.status === "مدفوع" ? accent + "18" : "#f59e0b18", color: p.status === "مدفوع" ? accent : "#f59e0b", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <I n={p.status === "مدفوع" ? "check" : "money"} s={16} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{p.note}</div>
              <div style={{ fontSize: 10, color: "#374151", marginTop: 1 }}>{p.date}</div>
            </div>
            <div style={{ fontWeight: 700, fontSize: 14, color: "#e2e8f0" }}>{p.amount.toLocaleString()} ل.س</div>
            <Badge t={p.status} c={p.status === "مدفوع" ? accent : "#f59e0b"} sm />
          </div>
        ))}
      </div>

      {/* Commission per client */}
      <div style={card}>
        <div style={{ padding: "13px 18px", borderBottom: "1px solid rgba(255,255,255,0.05)", fontSize: 12, fontWeight: 700, color: "#94a3b8" }}>العمولة حسب العميل</div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr>{["العميل", "المرحلة", "الباقة", "العمولة المحتسبة"].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
          <tbody>
            {partner.clients.map(c => (
              <tr key={c.id}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <td style={{ ...td, fontWeight: 700 }}>{c.name}</td>
                <td style={td}><Badge t={c.stage} c={STAGE_C[c.stage]} sm /></td>
                <td style={td}>{c.plan ? <Badge t={c.plan} c="#6366f1" sm /> : <span style={{ color: "#374151" }}>—</span>}</td>
                <td style={td}><span style={{ color: c.commission > 0 ? accent : "#374151", fontWeight: 700 }}>{c.commission > 0 ? c.commission.toLocaleString() + " ل.س" : "—"}</span></td>
              </tr>
            ))}
            <tr style={{ background: "rgba(255,255,255,0.025)" }}>
              <td style={{ ...td, fontWeight: 700, color: "#64748b" }} colSpan={3}>الإجمالي</td>
              <td style={{ ...td, color: accent, fontWeight: 800, fontSize: 15 }}>{partner.clients.reduce((s, c) => s + c.commission, 0).toLocaleString()} ل.س</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  const ReferralPage = () => (
    <div>
      {/* Main referral card */}
      <div style={{ ...card, padding: "28px 30px", marginBottom: 18, background: "linear-gradient(135deg, rgba(16,185,129,0.08), rgba(6,182,212,0.04))", borderColor: accent + "30", textAlign: "center" }}>
        <div style={{ fontSize: 13, color: "#64748b", marginBottom: 12 }}>رابط الإحالة الخاص بك</div>
        <div style={{ fontSize: 22, fontWeight: 900, color: accent, marginBottom: 20, direction: "ltr" }}>
          muhasebji.com/join?ref={partner.referralCode}
        </div>
        <button onClick={copyCode} style={{ background: copied ? accent : accent + "18", color: copied ? "#06080f" : accent, border: `1px solid ${accent}40`, borderRadius: 10, padding: "12px 28px", cursor: "pointer", fontSize: 14, fontWeight: 700, fontFamily: "inherit", display: "inline-flex", alignItems: "center", gap: 8, transition: "all 0.2s" }}>
          {copied ? <><I n="check" s={15} /> تم النسخ!</> : <><I n="copy" s={15} /> نسخ الرابط</>}
        </button>
      </div>

      {/* Code card */}
      <div style={{ ...card, padding: "20px 24px", marginBottom: 18 }}>
        <div style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}>كود الإحالة</div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "12px 16px", fontSize: 18, fontWeight: 900, color: accent, direction: "ltr", letterSpacing: 2 }}>
            {partner.referralCode}
          </div>
          <button onClick={copyCode} style={{ background: accent + "15", color: accent, border: `1px solid ${accent}30`, borderRadius: 8, padding: "12px 16px", cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700 }}>
            <I n="copy" s={14} /> نسخ
          </button>
        </div>
      </div>

      {/* How it works */}
      <div style={card}>
        <div style={{ padding: "13px 18px", borderBottom: "1px solid rgba(255,255,255,0.05)", fontSize: 12, fontWeight: 700, color: "#94a3b8" }}>كيف يعمل نظام الإحالة؟</div>
        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 18 }}>
          {[
            { step: "١", title: "شارك رابطك", desc: "أرسل رابط الإحالة الخاص بك لأصحاب العمل والشركات", color: accent },
            { step: "٢", title: "يسجل العميل", desc: "يدخل العميل عبر رابطك ويبدأ بتجربة محاسبجي", color: "#06b6d4" },
            { step: "٣", title: "يشترك بباقة", desc: "عند اشتراك العميل بأي باقة يُحتسب لك عمولة " + partner.commission + "%", color: "#8b5cf6" },
            { step: "٤", title: "تستلم أرباحك", desc: "تُضاف العمولة لرصيدك وتصلك حسب جدول المدفوعات", color: "#d4af37" },
          ].map(s => (
            <div key={s.step} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: s.color + "18", color: s.color, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 16, flexShrink: 0 }}>{s.step}</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 3 }}>{s.title}</div>
                <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.5 }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const TODAY = new Date().toLocaleDateString("ar-SY", { weekday: "long", day: "numeric", month: "long" });
  const titles = { dashboard: "لوحة التحكم", clients: "عملائي", earnings: "أرباحي", referral: "رابط الإحالة" };

  return (
    <div style={{ display: "flex", height: "100vh", background: "#070d10", fontFamily: "'Cairo','Segoe UI',sans-serif", direction: "rtl", color: "#e2e8f0", overflow: "hidden" }}>
      {/* Sidebar */}
      <div style={{ width: 210, background: "rgba(255,255,255,0.02)", borderLeft: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <div style={{ padding: "18px 14px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ fontSize: 16, fontWeight: 900, color: accent }}>محاسبجي</div>
          <div style={{ fontSize: 9, color: "#1f2937", marginTop: 1, letterSpacing: 1, textTransform: "uppercase" }}>بوابة شركاء النمو</div>
        </div>
        <div style={{ flex: 1, padding: "8px 0" }}>
          {NAV.map(n => (
            <div key={n.id} style={navStyle(page === n.id)} onClick={() => setPage(n.id)}>
              <I n={n.icon} s={15} />{n.label}
            </div>
          ))}
        </div>

        {/* Status badge */}
        <div style={{ padding: "10px 14px", margin: "0 8px 8px", background: accent + "0f", border: `1px solid ${accent}20`, borderRadius: 9 }}>
          <div style={{ fontSize: 10, color: "#374151", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>حالة حسابك</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: accent }} />
            <span style={{ fontSize: 12, color: accent, fontWeight: 700 }}>{partner.status}</span>
          </div>
          <div style={{ fontSize: 11, color: "#64748b", marginTop: 3 }}>عمولة {partner.commission}%</div>
        </div>

        <div style={{ padding: "12px 14px 14px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: accent + "20", color: accent, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}>{partner.name[0]}</div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700 }}>{partner.name}</div>
              <div style={{ fontSize: 9, color: "#1f2937" }}>{partner.city}</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "7px 10px", borderRadius: 8, cursor: "pointer", color: "#374151", fontSize: 12, background: "rgba(255,255,255,0.02)" }}
            onClick={onLogout}>
            <I n="logout" s={14} /> تسجيل خروج
          </div>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "14px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,0.01)", flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#f1f5f9" }}>{titles[page]}</div>
            <div style={{ fontSize: 10, color: "#1f2937", marginTop: 1 }}>{TODAY}</div>
          </div>
          {unpaid > 0 && (
            <div style={{ background: "#f59e0b15", border: "1px solid #f59e0b30", borderRadius: 9, padding: "8px 14px", display: "flex", alignItems: "center", gap: 8 }}>
              <I n="money" s={14} />
              <span style={{ fontSize: 12, color: "#f59e0b", fontWeight: 700 }}>مستحق: {unpaid.toLocaleString()} ل.س</span>
            </div>
          )}
        </div>
        <div style={{ flex: 1, overflow: "auto", padding: "20px 24px" }}>
          {page === "dashboard" && <Dashboard />}
          {page === "clients"   && <ClientsPage />}
          {page === "earnings"  && <EarningsPage />}
          {page === "referral"  && <ReferralPage />}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  ROOT
// ═══════════════════════════════════════════════════════════
export default function LoginApp({ onLogin, initialUser }) {
  const [user, setUser] = useState(initialUser || null);

  const handleLogin = (u) => {
    setUser(u);
    if (onLogin && u.role !== "partner") onLogin(u);
  };

  if (!user) return <LoginPage onLogin={handleLogin} />;

  if (user.role === "partner") {
    return <PartnerPortal user={user} onLogout={() => { setUser(null); if (onLogin) onLogin(null); }} />;
  }

  // For other roles — show placeholder with logout
  const roleInfo = ROLE_META[user.role];
  return (
    <div style={{ minHeight: "100vh", background: "#06080f", fontFamily: "'Cairo','Segoe UI',sans-serif", direction: "rtl", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#e2e8f0" }}>
      <div style={{ textAlign: "center", padding: 40 }}>
        <div style={{ width: 70, height: 70, borderRadius: "50%", background: roleInfo.color + "18", color: roleInfo.color, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
          <svg width={32} height={32} viewBox="0 0 24 24" fill="currentColor"><path d={roleInfo.icon} /></svg>
        </div>
        <div style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>أهلاً، {user.name}</div>
        <div style={{ fontSize: 14, color: "#64748b", marginBottom: 4 }}>{roleInfo.label}</div>
        <div style={{ fontSize: 12, color: "#374151", marginBottom: 30, direction: "ltr" }}>{user.email}</div>
        <div style={{ background: roleInfo.color + "12", border: `1px solid ${roleInfo.color}25`, borderRadius: 12, padding: "16px 24px", fontSize: 13, color: "#94a3b8", marginBottom: 24, maxWidth: 360 }}>
          بوابة <strong style={{ color: roleInfo.color }}>{roleInfo.label}</strong> موجودة في ملف المشروع الرئيسي
          <br />(muhasebji-portals.jsx)
          <br /><br />هذا الملف يضم: صفحة Login + بوابة شركاء النمو
        </div>
        <button onClick={() => setUser(null)} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 9, padding: "10px 22px", color: "#94a3b8", cursor: "pointer", fontSize: 13, fontFamily: "inherit", display: "inline-flex", alignItems: "center", gap: 7 }}>
          <svg width={14} height={14} viewBox="0 0 24 24" fill="currentColor"><path d={PATHS.logout} /></svg>
          تسجيل خروج
        </button>
      </div>
    </div>
  );
}
