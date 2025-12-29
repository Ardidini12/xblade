"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash2, Shield, User } from "lucide-react"
import { UserData } from "@/lib/actions/user.actions"

interface UserActionsProps {
  user: UserData
  onEdit: (user: UserData) => void
  onDelete: (user: UserData) => void
  onRoleChange: (user: UserData, newRole: "admin" | "user") => void
  currentUserId?: string
}

export default function UserActions({
  user,
  onEdit,
  onDelete,
  onRoleChange,
  currentUserId,
}: UserActionsProps) {
  const isCurrentUser = user.id === currentUserId
  const isAdmin = user.role === "admin"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onEdit(user)}>
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => onRoleChange(user, isAdmin ? "user" : "admin")}
          disabled={isCurrentUser}
        >
          {isAdmin ? (
            <>
              <User className="mr-2 h-4 w-4" />
              Make User
            </>
          ) : (
            <>
              <Shield className="mr-2 h-4 w-4" />
              Make Admin
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => onDelete(user)}
          variant="destructive"
          disabled={isCurrentUser}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

