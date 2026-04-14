import { useState } from "react";
import LoginApp from "./LoginAndPartners.jsx";
import PortalsApp from "./Portals.jsx";
import CrmPortal from "./CrmPortal.jsx";

// ─── USERS (same as LoginAndPartners but centralized) ───
const USERS = [
  { email: "admin@muhasebji.com",    password: "admin123",   role: "admin",      name: "أبو عمر",             id: null },
  { email: "nour@muhasebji.com",     password: "nour123",    role: "accountant", name: "نور الدين حسن",       id: 1 },
  { email: "reem@muhasebji.com",     password: "reem123",    role: "accountant", name: "ريم السالم",           id: 2 },
  { email: "alnoor@client.com",      password: "alnoor123",  role: "client",     name: "شركة النور للتجارة",  id: 1 },
  { email: "almustaqbal@client.com", password: "must123",    role: "client",     name: "مكتب المستقبل",        id: 5 },
  { email: "albait@client.com",      password: "bait123",    role: "client",     name: "مطعم البيت الشامي",   id: 3 },
  { email: "ahmad@partner.com",      password: "ahmad123",   role: "partner",    name: "أحمد الخالد",          id: 1 },
  { email: "sara@partner.com",       password: "sara123",    role: "partner",    name: "سارة المحمد",          id: 2 },
  { email: "khaled@partner.com",     password: "khaled123",  role: "partner",    name: "خالد العمر",           id: 3 },
];

export default function App() {
  const [user, setUser] = useState(null);

  const handleLogin = (u) => setUser(u);
  const handleLogout = () => setUser(null);

  // Not logged in → Login page
  if (!user) {
    return <LoginApp onLogin={handleLogin} />;
  }

  // Admin → CRM portal (full CRM)
  if (user.role === "admin") {
    return <CrmPortal />;
  }

  // Accountant or Client → Portals (with role switcher removed, direct entry)
  if (user.role === "accountant" || user.role === "client") {
    return <PortalsApp initialRole={user.role === "accountant" ? `acc${user.id}` : `cl${user.id}`} onLogout={handleLogout} />;
  }

  // Partner → Partner portal (inside LoginAndPartners)
  if (user.role === "partner") {
    return <LoginApp onLogin={handleLogin} initialUser={user} />;
  }

  return null;
}
