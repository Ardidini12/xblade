import { redirect } from "next/navigation"
import AdminHeader from "@/components/admin/AdminHeader"
import { getSession } from "@/lib/actions/auth.actions"
import { getUsers } from "@/lib/actions/user.actions"
import UsersManagementClient from "@/components/admin/user-management/UsersManagementClient"

interface UsersPageProps {
  searchParams: {
    page?: string
    search?: string
    role?: "all" | "admin" | "user"
    sortBy?: "name" | "email" | "role" | "createdAt"
    sortOrder?: "asc" | "desc"
  }
}

export default async function UsersPage({ searchParams }: UsersPageProps) {
  const result = await getSession()

  if (!result.success || !result.session?.user) {
    redirect("/sign-in")
  }

  const session = result.session
  const userRole = (session.user as { role?: string })?.role

  if (userRole !== "admin") {
    redirect("/sign-in")
  }

  const user = {
    name: session.user.name,
    email: session.user.email,
    image: session.user.image,
  }

  // Get current user ID from database
  const { connectToDatabase } = await import("@/database/mongoose")
  const User = (await import("@/lib/models/user.model")).default
  await connectToDatabase()
  const dbUser = await User.findOne({ email: session.user.email?.toLowerCase().trim() })
  const currentUserId = dbUser?._id?.toString()

  // Parse search params
  const page = parseInt(searchParams.page || "1", 10)
  const search = searchParams.search || ""
  const role = searchParams.role || "all"
  const sortBy = searchParams.sortBy || "createdAt"
  const sortOrder = searchParams.sortOrder || "desc"

  // Fetch users
  const usersResult = await getUsers({
    page,
    limit: 10,
    search,
    role: role === "all" ? "all" : role,
    sortBy,
    sortOrder,
  })

  return (
    <>
      <AdminHeader user={user} />
      <main className="container mx-auto px-4 py-8">
        <UsersManagementClient
          initialUsers={usersResult.users || []}
          initialTotal={usersResult.total || 0}
          initialPage={page}
          initialTotalPages={usersResult.totalPages || 1}
          initialSearch={search}
          initialRoleFilter={role}
          initialSortBy={sortBy}
          initialSortOrder={sortOrder}
          currentUserId={currentUserId}
        />
      </main>
    </>
  )
}

