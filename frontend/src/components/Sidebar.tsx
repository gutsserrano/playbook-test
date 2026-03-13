"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Video,
  Users,
  Film,
  BarChart3,
  ClipboardList,
} from "lucide-react";

const nav = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/games", label: "Games", icon: Video },
  { href: "/players", label: "Players", icon: Users },
  { href: "/highlights", label: "Highlights", icon: Film },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
];

export function Sidebar() {
  const path = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-turf-900 border-r border-turf-600 flex flex-col">
      <div className="p-6 border-b border-turf-600">
        <Link href="/" className="flex items-center gap-2">
          <ClipboardList className="w-8 h-8 text-accent" />
          <span className="text-xl font-bold tracking-tight text-white">
            Playbook
          </span>
        </Link>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = path === href || (href !== "/" && path.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                active
                  ? "bg-accent/20 text-accent"
                  : "text-slate-400 hover:bg-turf-700 hover:text-slate-200"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
