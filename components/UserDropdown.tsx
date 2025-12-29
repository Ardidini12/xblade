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
import { useRouter } from "next/navigation"
import { LogOut, User, Home } from "lucide-react"
import { useState } from "react"
import Link from "next/link"

interface UserDropdownProps {
  children: React.ReactNode
}

/**
 * User-specific dropdown menu component
 * Includes user-specific options like Profile and Home
 * Used exclusively in user routes
 */
const UserDropdown = ({ children }: UserDropdownProps) => {
  const router = useRouter()
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
      
      // Redirect to home page after sign out
      router.push("/")
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
            <p className="text-sm font-medium leading-none">My Account</p>
            <p className="text-xs leading-none text-muted-foreground">
              User
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem asChild className="cursor-pointer">
          <Link href="/welcome-user">
            <Home className="mr-2 h-4 w-4" />
            <span>Home</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild className="cursor-pointer">
          <Link href="/profile">
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
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

export default UserDropdown

