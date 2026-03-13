"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Video,
  Users,
  Film,
  BarChart3,
  ClipboardList,
  Menu,
  X,
} from "lucide-react";

const nav = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/games", label: "Games", icon: Video },
  { href: "/players", label: "Players", icon: Users },
  { href: "/roster", label: "Roster", icon: ClipboardList },
  { href: "/highlights", label: "Highlights", icon: Film },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
];

export function Sidebar() {
  const path = usePathname();
  const [open, setOpen] = useState(false);

  const closeSidebar = () => setOpen(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 p-2 rounded-lg bg-turf-800 border border-turf-600 text-slate-300 hover:bg-turf-700 hover:text-white transition-colors"
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      <div
        className={`fixed inset-0 z-50 lg:hidden bg-black/50 transition-opacity ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeSidebar}
        aria-hidden={!open}
      />

      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-turf-900 border-r border-turf-600 flex flex-col z-50 transform transition-transform duration-200 ease-out lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 sm:p-6 border-b border-turf-600 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2" onClick={closeSidebar}>
            <ClipboardList className="w-8 h-8 text-accent shrink-0" />
            <span className="text-xl font-bold tracking-tight text-white">
              Playbook
            </span>
          </Link>
          <button
            type="button"
            onClick={closeSidebar}
            className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-turf-700 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {nav.map(({ href, label, icon: Icon }) => {
            const active = path === href || (href !== "/" && path.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                onClick={closeSidebar}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  active
                    ? "bg-accent/20 text-accent"
                    : "text-slate-400 hover:bg-turf-700 hover:text-slate-200"
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span className="font-medium">{label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
