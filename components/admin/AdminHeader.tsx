import AdminNavItems from "@/components/admin/AdminNavItems"

interface AdminHeaderProps {
  user: User
}

/**
 * Admin-specific header component
 * Used exclusively in /app/(admin)/ routes
 */
const AdminHeader = ({ user }: AdminHeaderProps) => {
  return (
    <header className="border-b border-slate-800 bg-slate-950">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center">
          <h1 className="text-xl font-bold text-white">XBLADE ADMIN</h1>
        </div>
        <nav className="flex items-center">
          <AdminNavItems user={user} />
        </nav>
      </div>
    </header>
  )
}

export default AdminHeader

