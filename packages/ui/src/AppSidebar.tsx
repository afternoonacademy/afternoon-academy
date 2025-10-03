"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu } from "@headlessui/react";
import useAuthStore from "@repo/store/auth.store";
import { supabase } from "@repo/lib/supabase.client";
import {
  HomeIcon,
  CalendarIcon,
  UserGroupIcon,
  BellIcon,
  ClipboardDocumentListIcon,
  BuildingOfficeIcon,
  BookOpenIcon,
  BriefcaseIcon,
} from "@heroicons/react/24/outline";

// Menu items by role
const menuItems: Record<
  string,
  { href: string; label: string; Icon: any; bubble?: boolean }[]
> = {
  teacher: [
    { href: "/teacher", label: "Home", Icon: HomeIcon },
    { href: "/teacher/sessions", label: "My Sessions", Icon: CalendarIcon },
    { href: "/teacher/students", label: "My Students", Icon: UserGroupIcon },
    { href: "/teacher/alerts", label: "Alerts", Icon: BellIcon, bubble: true },
    { href: "/teacher/jobs", label: "Jobs", Icon: BriefcaseIcon, bubble: true },
  ],
  admin: [
    { href: "/admin", label: "Home", Icon: HomeIcon },
    { href: "/admin/users", label: "Users", Icon: UserGroupIcon },
    { href: "/admin/subjects", label: "Subjects", Icon: BookOpenIcon },
    { href: "/admin/sessions", label: "Sessions", Icon: CalendarIcon },
    { href: "/admin/venues", label: "Venues", Icon: BuildingOfficeIcon },
    {
      href: "/admin/applications",
      label: "Applications",
      Icon: ClipboardDocumentListIcon,
      bubble: true,
    },
    { href: "/admin/alerts", label: "Alerts", Icon: BellIcon, bubble: true },
  ],
};

export const AppSidebar = () => {
  const router = useRouter();
  const { user, logout, isLoading } = useAuthStore();
  const [unreadCount, setUnreadCount] = useState(0);
  const [jobsCount, setJobsCount] = useState(0);

  // 🛑 Show nothing while user still loading
  if (isLoading) {
    return (
      <aside className="w-64 h-screen flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">Loading menu...</p>
      </aside>
    );
  }

  // ✅ Use only the role from user
  const role = user?.role;
  const roleItems = role ? menuItems[role] : [];

  // Split priority vs regular
  const priorityItems = roleItems.filter((i) => i.bubble);
  const regularItems = roleItems.filter((i) => !i.bubble);

  // Load alert + job counts
  useEffect(() => {
    if (!user?.id) return;

    // Alerts
    supabase
      .from("alerts")
      .select("id")
      .eq("target_user", user.id)
      .eq("status", "unread")
      .then(({ data, error }) => {
        if (!error) setUnreadCount(data?.length || 0);
      });

    // Jobs (sessions unassigned)
    supabase
      .from("sessions")
      .select("id")
      .is("teacher_id", null)
      .eq("status", "unassigned")
      .then(({ data, error }) => {
        if (!error) setJobsCount(data?.length || 0);
      });
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    logout();
    router.replace("/sign-in");
  };

  return (
    <aside
      className="flex flex-col w-64 h-screen border-r
                 border-gray-200 dark:border-gray-700
                 bg-gray-50 dark:bg-[#111827]
                 text-gray-800 dark:text-gray-200"
    >
      {/* Title */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
          Afternoon Academy
        </h2>
      </div>

      {/* Priority nav */}
      <nav className="px-2 py-4 space-y-1">
        {priorityItems.map(({ href, label, Icon }) => (
          <button
            key={href}
            onClick={() => router.push(href)}
            className="flex items-center justify-between w-full px-3 py-2 rounded-md
                       text-sm font-medium
                       text-gray-700 dark:text-gray-300
                       hover:bg-primary/10 hover:text-primary
                       dark:hover:bg-primary/20 dark:hover:text-primary
                       transition-colors duration-200 ease-in-out"
          >
            <div className="flex items-center gap-3">
              <Icon className="h-5 w-5" />
              {label}
            </div>
            {label === "Alerts" && unreadCount > 0 && (
              <span className="ml-2 rounded-full bg-red-500 text-white text-xs px-2 py-0.5">
                {unreadCount}
              </span>
            )}
            {label === "Jobs" && jobsCount > 0 && (
              <span className="ml-2 rounded-full bg-blue-500 text-white text-xs px-2 py-0.5">
                {jobsCount}
              </span>
            )}
            {label === "Applications" && (
              <span className="ml-2 rounded-full bg-blue-500 text-white text-xs px-2 py-0.5">
                New
              </span>
            )}
          </button>
        ))}
      </nav>

      {priorityItems.length > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-700 mx-2" />
      )}

      {/* Regular nav */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {regularItems.map(({ href, label, Icon }) => (
          <button
            key={href}
            onClick={() => router.push(href)}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-md
                       text-sm font-medium
                       text-gray-700 dark:text-gray-300
                       hover:bg-primary/10 hover:text-primary
                       dark:hover:bg-primary/20 dark:hover:text-primary
                       transition-colors duration-200 ease-in-out"
          >
            <Icon className="h-5 w-5" />
            {label}
          </button>
        ))}
      </nav>

      {/* Profile & dropdown */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <Menu as="div" className="relative w-full">
          <Menu.Button
            className="flex items-center gap-3 w-full rounded-md px-3 py-2 text-sm
                       font-medium text-gray-700 dark:text-gray-300
                       hover:bg-gray-200 hover:text-gray-900
                       dark:hover:bg-gray-700 dark:hover:text-white
                       transition-colors"
          >
            <img
              src={
                user?.avatar_url ||
                "https://ui-avatars.com/api/?name=" +
                  encodeURIComponent(user?.name || "User")
              }
              alt={user?.name || "User"}
              className="h-8 w-8 rounded-full object-cover"
            />
            <span className="truncate text-left">
              {user?.name || "User"}
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {user?.email}
              </p>
            </span>
          </Menu.Button>

          <Menu.Items
            className="absolute bottom-full left-0 mb-2 w-56 origin-bottom-left rounded-md
                       shadow-lg ring-1 ring-black/10
                       bg-white dark:bg-zinc-800
                       text-gray-800 dark:text-gray-200 focus:outline-none"
          >
            <div className="py-1">
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={() => router.push(`/${role}/profile`)}
                    className={`block w-full px-4 py-2 text-left text-sm ${
                      active
                        ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
                        : ""
                    }`}
                  >
                    My Profile
                  </button>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={() => router.push(`/${role}/settings`)}
                    className={`block w-full px-4 py-2 text-left text-sm ${
                      active
                        ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
                        : ""
                    }`}
                  >
                    Settings
                  </button>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={handleLogout}
                    className={`block w-full px-4 py-2 text-left text-sm ${
                      active
                        ? "text-red-600 dark:text-red-400"
                        : "text-red-500 dark:text-red-400"
                    }`}
                  >
                    Sign out
                  </button>
                )}
              </Menu.Item>
            </div>
          </Menu.Items>
        </Menu>
      </div>
    </aside>
  );
};
