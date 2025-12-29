"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import UserTable from "./UserTable"
import UserForm from "./UserForm"
import UserSearch from "./UserSearch"
import {
  createUser,
  updateUser,
  deleteUser,
  updateUsersRole,
  UserData,
  getUsers,
} from "@/lib/actions/user.actions"

interface UsersManagementClientProps {
  initialUsers: UserData[]
  initialTotal: number
  initialPage: number
  initialTotalPages: number
  initialSearch: string
  initialRoleFilter: "all" | "admin" | "user"
  initialSortBy: "name" | "email" | "role" | "createdAt"
  initialSortOrder: "asc" | "desc"
  currentUserId?: string
}

// Simple toast implementation if sonner is not available
const showToast = (message: string, type: "success" | "error" = "success") => {
  // You can replace this with your preferred toast library
  if (typeof window !== "undefined") {
    const toastEl = document.createElement("div")
    toastEl.className = `fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg ${
      type === "success" ? "bg-green-600" : "bg-red-600"
    } text-white`
    toastEl.textContent = message
    document.body.appendChild(toastEl)
    setTimeout(() => {
      toastEl.remove()
    }, 3000)
  }
}

export default function UsersManagementClient({
  initialUsers,
  initialTotal,
  initialPage,
  initialTotalPages,
  initialSearch,
  initialRoleFilter,
  initialSortBy,
  initialSortOrder,
  currentUserId,
}: UsersManagementClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const [users, setUsers] = useState(initialUsers)
  const [total, setTotal] = useState(initialTotal)
  const [page, setPage] = useState(initialPage)
  const [totalPages, setTotalPages] = useState(initialTotalPages)
  const [search, setSearch] = useState(initialSearch)
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "user">(
    initialRoleFilter
  )
  const [sortBy, setSortBy] = useState<
    "name" | "email" | "role" | "createdAt"
  >(initialSortBy)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(initialSortOrder)

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null)
  const [isFormLoading, setIsFormLoading] = useState(false)

  const updateURL = (
    updates: {
      page?: number
      search?: string
      role?: "all" | "admin" | "user"
      sortBy?: "name" | "email" | "role" | "createdAt"
      sortOrder?: "asc" | "desc"
    }
  ) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (updates.page !== undefined) {
      if (updates.page === 1) {
        params.delete("page")
      } else {
        params.set("page", updates.page.toString())
      }
    }
    
    if (updates.search !== undefined) {
      if (updates.search === "") {
        params.delete("search")
      } else {
        params.set("search", updates.search)
      }
    }
    
    if (updates.role !== undefined) {
      if (updates.role === "all") {
        params.delete("role")
      } else {
        params.set("role", updates.role)
      }
    }
    
    if (updates.sortBy !== undefined) {
      params.set("sortBy", updates.sortBy)
    }
    
    if (updates.sortOrder !== undefined) {
      params.set("sortOrder", updates.sortOrder)
    }

    router.push(`/admin/users?${params.toString()}`)
  }

  const refreshUsers = async () => {
    const result = await getUsers({
      page,
      limit: 10,
      search,
      role: roleFilter === "all" ? "all" : roleFilter,
      sortBy,
      sortOrder,
    })

    if (result.success) {
      setUsers(result.users || [])
      setTotal(result.total || 0)
      setTotalPages(result.totalPages || 1)
    }
  }

  // Trigger refresh when filters/sort/page change (debounced for search only)
  useEffect(() => {
    // Clear any pending search timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    // For search, debounce; for others, update immediately
    if (search) {
      searchTimeoutRef.current = setTimeout(async () => {
        const result = await getUsers({
          page,
          limit: 10,
          search,
          role: roleFilter === "all" ? "all" : roleFilter,
          sortBy,
          sortOrder,
        })

        if (result.success) {
          setUsers(result.users || [])
          setTotal(result.total || 0)
          setTotalPages(result.totalPages || 1)
        }
      }, 300)
    } else {
      // Immediate update for non-search changes or when clearing search
      getUsers({
        page,
        limit: 10,
        search,
        role: roleFilter === "all" ? "all" : roleFilter,
        sortBy,
        sortOrder,
      }).then((result) => {
        if (result.success) {
          setUsers(result.users || [])
          setTotal(result.total || 0)
          setTotalPages(result.totalPages || 1)
        }
      })
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [search, roleFilter, sortBy, sortOrder, page])

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setPage(1)
    updateURL({ search: value, page: 1 })
  }

  const handleRoleFilterChange = (value: "all" | "admin" | "user") => {
    setRoleFilter(value)
    setPage(1)
    updateURL({ role: value, page: 1 })
  }

  const handleSort = (field: "name" | "email" | "role" | "createdAt") => {
    const newOrder =
      sortBy === field && sortOrder === "asc" ? "desc" : "asc"
    setSortBy(field)
    setSortOrder(newOrder)
    updateURL({ sortBy: field, sortOrder: newOrder })
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    updateURL({ page: newPage })
  }

  const handleCreateUser = () => {
    setSelectedUser(null)
    setIsFormOpen(true)
  }

  const handleEditUser = (user: UserData) => {
    setSelectedUser(user)
    setIsFormOpen(true)
  }

  const handleDeleteUser = (user: UserData) => {
    setSelectedUser(user)
    setIsDeleteDialogOpen(true)
  }

  const handleFormSubmit = async (data: {
    name: string
    email: string
    password?: string
    role: "admin" | "user"
    gamertag: string
  }): Promise<{ success: boolean; error?: string }> => {
    setIsFormLoading(true)
    try {
      let result
      if (selectedUser) {
        // Update existing user (no password changes allowed)
        result = await updateUser(selectedUser.id!, {
          name: data.name,
          email: data.email,
          role: data.role,
          gamertag: data.gamertag, 
        })
      } else {
        // Create new user
        if (!data.password) {
          setIsFormLoading(false)
          return { success: false, error: "Password is required for new users" }
        }
        if (!data.gamertag || !data.gamertag.trim()) {
          setIsFormLoading(false)
          return { success: false, error: "Gamertag is required for new users" }
        }
        result = await createUser({
          name: data.name,
          email: data.email,
          password: data.password,
          role: data.role,
          gamertag: data.gamertag.trim(),
        })
      }

      if (result.success) {
        setIsFormOpen(false)
        setSelectedUser(null)
        await refreshUsers()
        return { success: true }
      } else {
        // Return error so form can display it below the field
        return { success: false, error: result.error || "Operation failed" }
      }
    } catch (error) {
      return { success: false, error: "An unexpected error occurred" }
    } finally {
      setIsFormLoading(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!selectedUser) return

    setIsFormLoading(true)
    try {
      const result = await deleteUser(selectedUser.id!)

      if (result.success) {
        showToast("User deleted successfully", "success")
        setIsDeleteDialogOpen(false)
        setSelectedUser(null)
        await refreshUsers()
      } else {
        showToast(result.error || "Failed to delete user", "error")
      }
    } catch (error) {
      showToast("An unexpected error occurred", "error")
    } finally {
      setIsFormLoading(false)
    }
  }

  const handleRoleChange = async (
    user: UserData,
    newRole: "admin" | "user"
  ) => {
    try {
      const result = await updateUsersRole([user.id!], newRole)

      if (result.success) {
        showToast(
          `User role changed to ${newRole === "admin" ? "Admin" : "User"}`,
          "success"
        )
        await refreshUsers()
      } else {
        showToast(result.error || "Failed to update role", "error")
      }
    } catch (error) {
      showToast("An unexpected error occurred", "error")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Manage users, roles, and permissions
          </p>
        </div>
        <Button onClick={handleCreateUser}>
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      <UserSearch
        search={search}
        roleFilter={roleFilter}
        onSearchChange={handleSearchChange}
        onRoleFilterChange={handleRoleFilterChange}
      />

      <UserTable
        users={users}
        currentPage={page}
        totalPages={totalPages}
        total={total}
        onPageChange={handlePageChange}
        onEdit={handleEditUser}
        onDelete={handleDeleteUser}
        onRoleChange={handleRoleChange}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        currentUserId={currentUserId}
      />

      <UserForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        user={selectedUser}
        onSubmit={handleFormSubmit}
        isLoading={isFormLoading}
      />

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <strong>{selectedUser?.name || selectedUser?.email}</strong>? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isFormLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isFormLoading}
            >
              {isFormLoading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

