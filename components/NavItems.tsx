"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import UserDropdown from "@/components/UserDropdown"


const NavItems = ({ user }: { user: User }) => {
  const getInitials = (name?: string | null) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <UserDropdown>
      <button
        aria-label="User menu"
        className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 focus:ring-white"
      >
        <Avatar>
          <AvatarImage src={user.image ?? undefined} alt={user.name ?? "User"} />
          <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
        </Avatar>
      </button>
    </UserDropdown>
  )
}

export default NavItems

