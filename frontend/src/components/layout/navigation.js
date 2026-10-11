import {
  LayoutDashboard,
  FileText,
  FilePlus2,
  BarChart3,
  Bell,
  Settings,
  LifeBuoy,
  Building2,
  Users,
} from "lucide-react";

// Sidebar items per role
export const getMenu = (role) => {
  const items = [{ title: "Dashboard", icon: LayoutDashboard, path: "/dashboard", end: true }];

  if (role === "Customer") {
    items.push(
      { title: "My Disputes", icon: FileText, path: "/dashboard/disputes" },
      { title: "Raise Dispute", icon: FilePlus2, path: "/dashboard/raise-dispute" }
    );
  } else if (role === "Admin") {
    items.push(
      { title: "All Disputes", icon: FileText, path: "/dashboard/disputes" },
      { title: "Organizations", icon: Building2, path: "/dashboard/organizations" }
    );
  } else if (role === "OrganizationAdmin") {
    items.push(
      { title: "Cases", icon: FileText, path: "/dashboard/disputes" },
      { title: "Team", icon: Users, path: "/dashboard/team" }
    );
  } else {
    items.push({ title: "My Cases", icon: FileText, path: "/dashboard/disputes" });
  }

  items.push(
    { title: "Reports", icon: BarChart3, path: "/dashboard/reports" },
    { title: "Notifications", icon: Bell, path: "/dashboard/notifications" },
    { title: "Settings", icon: Settings, path: "/dashboard/settings" },
    { title: "Help & Support", icon: LifeBuoy, path: "/dashboard/support" }
  );

  return items;
};

// Page title shown in the top bar
export const getPageTitle = (pathname, role) => {
  if (/^\/dashboard\/disputes\/[^/]+/.test(pathname)) return "Dispute Details";

  const match = getMenu(role)
    .filter((item) => pathname === item.path || pathname.startsWith(item.path + "/"))
    .sort((a, b) => b.path.length - a.path.length)[0];

  return match?.title || "Dashboard";
};
