import { House, Library, Target, User, type LucideIcon } from "lucide-react";

export type NavItem = {
  key: string;
  href: string;
  label: string;
  icon: LucideIcon;
};

/** The four destinations, shared by the tab bar and the desktop rail. */
export const NAV_ITEMS: NavItem[] = [
  { key: "home", href: "/app", label: "Home", icon: House },
  { key: "library", href: "/app/library", label: "Library", icon: Library },
  { key: "goals", href: "/app/goals", label: "Goals", icon: Target },
  { key: "me", href: "/app/me", label: "Me", icon: User },
];
