"use client"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface UserSearchProps {
  search: string
  roleFilter: "all" | "admin" | "user"
  onSearchChange: (value: string) => void
  onRoleFilterChange: (value: "all" | "admin" | "user") => void
}

export default function UserSearch({
  search,
  roleFilter,
  onSearchChange,
  onRoleFilterChange,
}: UserSearchProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search by name, email, or gamertag..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 pr-9"
        />
        {search && (
          <Button
            variant="ghost"
            size="icon-sm"
            className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
            onClick={() => onSearchChange("")}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Select value={roleFilter} onValueChange={onRoleFilterChange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="user">User</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

