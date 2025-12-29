import NavItems from "@/components/NavItems"

/**
 * User-specific header component
 * Used exclusively in /app/(root)/ routes
 */
const Header = ({ user }: { user: User }) => {
  return (
    <header className="border-b border-slate-800 bg-slate-950">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center">
          <h1 className="text-xl font-bold text-white">XBLADE</h1>
        </div>
        <nav className="flex items-center">
          <NavItems user={user} />
        </nav>
      </div>
    </header>
  )
}

export default Header