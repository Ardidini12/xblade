"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import AdminDropdown from "@/components/admin/AdminDropdown"

interface AdminNavItemsProps {
  user: User
}

/**
 * Admin-specific navigation items component
 * Displays admin avatar and dropdown menu
 */
const AdminNavItems = ({ user }: AdminNavItemsProps) => {
  const getInitials = (name?: string | null) => {
    if (!name) return "A"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <AdminDropdown>
      <button
        aria-label="Admin menu"
        className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 focus:ring-white"
      >
        <Avatar>
          <AvatarImage src={user.image ?? undefined} alt={user.name ?? "Admin"} />
          <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
        </Avatar>
      </button>
    </AdminDropdown>
  )
}

export default AdminNavItems

