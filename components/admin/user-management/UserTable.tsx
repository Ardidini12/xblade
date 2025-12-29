"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { UserData } from "@/lib/actions/user.actions"
import UserActions from "./UserActions"
import { ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { format } from "date-fns"

interface UserTableProps {
  users: UserData[]
  currentPage: number
  totalPages: number
  total: number
  onPageChange: (page: number) => void
  onEdit: (user: UserData) => void
  onDelete: (user: UserData) => void
  onRoleChange: (user: UserData, newRole: "admin" | "user") => void
  sortBy: "name" | "email" | "role" | "createdAt"
  sortOrder: "asc" | "desc"
  onSort: (field: "name" | "email" | "role" | "createdAt") => void
  currentUserId?: string
}

export default function UserTable({
  users,
  currentPage,
  totalPages,
  total,
  onPageChange,
  onEdit,
  onDelete,
  onRoleChange,
  sortBy,
  sortOrder,
  onSort,
  currentUserId,
}: UserTableProps) {
  const getInitials = (name?: string | null) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const SortButton = ({
    field,
    children,
  }: {
    field: "name" | "email" | "role" | "createdAt"
    children: React.ReactNode
  }) => {
    const isActive = sortBy === field
    return (
      <Button
        variant="ghost"
        size="sm"
        className="h-8 gap-1 px-2"
        onClick={() => onSort(field)}
      >
        {children}
        {isActive ? (
          sortOrder === "asc" ? (
            <ArrowUp className="h-3 w-3" />
          ) : (
            <ArrowDown className="h-3 w-3" />
          )
        ) : (
          <ArrowUpDown className="h-3 w-3 opacity-50" />
        )}
      </Button>
    )
  }

  if (users.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground">No users found</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Users</CardTitle>
        <CardDescription>
          Showing {users.length} of {total} users
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="h-12 px-4 text-left align-middle font-medium">
                  <SortButton field="name">User</SortButton>
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium">
                  <SortButton field="email">Email</SortButton>
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium">
                  <SortButton field="role">Role</SortButton>
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium">
                  Gamertag
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium">
                  <SortButton field="createdAt">Joined</SortButton>
                </th>
                <th className="h-12 px-4 text-right align-middle font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id ?? user.email}
                  className="border-b transition-colors hover:bg-muted/50"
                >
                  <td className="p-4 align-middle">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={user.image ?? undefined}
                          alt={user.name ?? "User"}
                        />
                        <AvatarFallback>
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.name || "N/A"}</div>
                        {user.id === currentUserId && (
                          <div className="text-xs text-muted-foreground">
                            (You)
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 align-middle">
                    <div className="text-sm">{user.email}</div>
                  </td>
                  <td className="p-4 align-middle">
                    <Badge
                      variant={user.role === "admin" ? "default" : "secondary"}
                    >
                      {user.role === "admin" ? "Admin" : "User"}
                    </Badge>
                  </td>
                  <td className="p-4 align-middle">
                    <div className="text-sm">
                      {user.gamertag || (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 align-middle">
                    <div className="text-sm text-muted-foreground">
                      {user.createdAt
                        ? format(new Date(user.createdAt), "MMM d, yyyy")
                        : "—"}
                    </div>
                  </td>
                  <td className="p-4 align-middle text-right">
                    <UserActions
                      user={user}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onRoleChange={onRoleChange}
                      currentUserId={currentUserId}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t pt-4 mt-4">
            <div className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

