import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  PanelLeft,
  House,
  UsersRound,
  PackageSearch,
  Briefcase,
  Receipt,
  HardHat,
  Clock,
  HandCoins,
  ChartColumnIncreasing,
  BellRing,
  CircleUser,
  Settings,
} from "lucide-react";
import "../styles/sidebar.css";

const navItems = [
  { to: "/home", label: "Home", icon: House },
  { to: "/customers", label: "Customers", icon: UsersRound },
  { to: "/inventory", label: "Inventory", icon: PackageSearch },
  { to: "/jobs", label: "Jobs", icon: Briefcase },
  { to: "/sales", label: "Sales", icon: Receipt },
  { to: "/technicians", label: "Technicians", icon: HardHat },
  { to: "/shifts", label: "Shifts", icon: Clock },
  { to: "/payroll", label: "Payroll", icon: HandCoins },
  { to: "/analytics", label: "Analytics", icon: ChartColumnIncreasing },
];

function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={collapsed ? "sidebar collapsed" : "sidebar"}>
      <div className="sidebar-header">
        <button
          className="btn-icon sidebar-close"
          onClick={() => setCollapsed(!collapsed)}
        >
          <PanelLeft />
        </button>

        <span className="sidebar-brand-name">Caobec</span>
      </div>

      <nav className="sidebar-tabs">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              isActive ? "sidebar-item active" : "sidebar-item"
            }
          >
            <Icon />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <button className="sidebar-item">
          <BellRing />
          Notifications
        </button>

        <button className="sidebar-item">
          <CircleUser />
          User
        </button>

        <button className="sidebar-item">
          <Settings />
          Settings
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
