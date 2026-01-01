"use client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { signOut } from "@/lib/actions/auth.actions"
import { useRouter, usePathname } from "next/navigation"
import { LogOut, Users, Settings, Shield } from "lucide-react"
import { useState } from "react"
import Link from "next/link"

interface AdminDropdownProps {
  children: React.ReactNode
}

/**
 * Admin-specific dropdown menu component
 * Includes admin-specific options like User Management and Settings
 * Used exclusively in admin routes
 */
const AdminDropdown = ({ children }: AdminDropdownProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSignOut = async () => {
    setIsSigningOut(true)
    setError(null)
    
    try {
      const result = await signOut()
      
      if (result && !result.success) {
        setError(result.error || "Failed to sign out. Please try again.")
        return
      }
      
      // Redirect to admin sign-in page after sign out
      router.push("/admin")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred"
      setError(errorMessage)
    } finally {
      setIsSigningOut(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {children}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">Admin Panel</p>
            <p className="text-xs leading-none text-muted-foreground">
              <Shield className="inline h-3 w-3 mr-1" />
              Administrator
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem asChild className="cursor-pointer">
          <Link href="/welcome-admin">
            <Shield className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild className="cursor-pointer">
          <Link href="/admin/users">
            <Users className="mr-2 h-4 w-4" />
            <span>User Management</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild className="cursor-pointer">
          <Link href="/admin/schedulers">
            <Settings className="mr-2 h-4 w-4" />
            <span>Scheduler Management</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild className="cursor-pointer">
          <Link href="/admin/leagues">
            <Shield className="mr-2 h-4 w-4" />
            <span>League Management</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        {error && (
          <div className="px-2 py-1.5 text-sm text-red-400">
            {error}
          </div>
        )}
        
        <DropdownMenuItem
          onClick={handleSignOut}
          variant="destructive"
          className="cursor-pointer"
          disabled={isSigningOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>{isSigningOut ? "Signing out..." : "Sign out"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default AdminDropdown

