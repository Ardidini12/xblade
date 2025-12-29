"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { UserData, checkEmailAvailability, checkGamertagAvailability } from "@/lib/actions/user.actions"

interface UserFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user?: UserData | null
  onSubmit: (data: {
    name: string
    email: string
    password?: string 
    role: "admin" | "user"
    gamertag: string
  }) => Promise<{ success: boolean; error?: string } | void>
  isLoading?: boolean
}

export default function UserForm({
  open,
  onOpenChange,
  user,
  onSubmit,
  isLoading = false,
}: UserFormProps) {
  const isEditMode = !!user
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user" as "admin" | "user",
    gamertag: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isValidatingEmail, setIsValidatingEmail] = useState(false)
  const [isValidatingGamertag, setIsValidatingGamertag] = useState(false)
  const emailTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const gamertagTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        password: "",
        role: user.role || "user",
        gamertag: user.gamertag || "",
      })
    } else {
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "user",
        gamertag: "",
      })
    }
    setErrors({})
    setIsValidatingEmail(false)
    setIsValidatingGamertag(false)
    // Clear any pending timeouts
    if (emailTimeoutRef.current) {
      clearTimeout(emailTimeoutRef.current)
      emailTimeoutRef.current = null
    }
    if (gamertagTimeoutRef.current) {
      clearTimeout(gamertagTimeoutRef.current)
      gamertagTimeoutRef.current = null
    }
  }, [user, open])

  // Debounced email validation
  const validateEmail = useCallback(async (email: string) => {
    // Clear previous timeout
    if (emailTimeoutRef.current) {
      clearTimeout(emailTimeoutRef.current)
    }

    // Clear error if email is empty
    if (!email.trim()) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors.email
        return newErrors
      })
      return
    }

    // Skip validation if email hasn't changed (in edit mode)
    if (isEditMode && email.trim() === user?.email) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors.email
        return newErrors
      })
      return
    }

    // Debounce: wait 500ms after user stops typing
    emailTimeoutRef.current = setTimeout(async () => {
      setIsValidatingEmail(true)
      try {
        const result = await checkEmailAvailability(email, user?.id)
        setErrors((prev) => {
          const newErrors = { ...prev }
          if (result.available) {
            delete newErrors.email
          } else {
            newErrors.email = result.error || "Email already in use"
          }
          return newErrors
        })
      } catch (error) {
        // Silently fail - don't show error on validation failure
      } finally {
        setIsValidatingEmail(false)
      }
    }, 500)
  }, [user, isEditMode])

  // Debounced gamertag validation
  const validateGamertag = useCallback(async (gamertag: string) => {
    // Clear previous timeout
    if (gamertagTimeoutRef.current) {
      clearTimeout(gamertagTimeoutRef.current)
    }

    // Clear error if gamertag is empty
    if (!gamertag.trim()) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors.gamertag
        return newErrors
      })
      return
    }

    // Skip validation if gamertag hasn't changed (in edit mode)
    if (isEditMode && gamertag.trim() === user?.gamertag) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors.gamertag
        return newErrors
      })
      return
    }

    // Debounce: wait 500ms after user stops typing
    gamertagTimeoutRef.current = setTimeout(async () => {
      setIsValidatingGamertag(true)
      try {
        const result = await checkGamertagAvailability(gamertag, user?.id)
        setErrors((prev) => {
          const newErrors = { ...prev }
          if (result.available) {
            delete newErrors.gamertag
          } else {
            newErrors.gamertag = result.error || "Gamertag already taken"
          }
          return newErrors
        })
      } catch (error) {
        // Silently fail - don't show error on validation failure
      } finally {
        setIsValidatingGamertag(false)
      }
    }, 500)
  }, [user, isEditMode])

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Name is required"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format"
    }

    if (!isEditMode && !formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    if (!formData.gamertag.trim()) {
      newErrors.gamertag = "Gamertag is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    try {
      const result = await onSubmit({
        name: formData.name.trim(),
        email: formData.email.trim(),
        ...(isEditMode ? {} : { password: formData.password }),
        role: formData.role,
        gamertag: formData.gamertag.trim(),
      })
      
      // If onSubmit returns an error object, handle it
      if (result && typeof result === 'object' && 'error' in result && result.error) {
        const errorMessage = result.error
        const lowerError = errorMessage.toLowerCase()
        // Check if it's an email-related error
        if (lowerError.includes('email') || lowerError.includes('already in use')) {
          setErrors({ ...errors, email: errorMessage })
        } else if (lowerError.includes('gamertag')) {
          setErrors({ ...errors, gamertag: errorMessage })
        } else {
          // Generic error - show as email error for now
          setErrors({ ...errors, email: errorMessage })
        }
        return
      }
      
      onOpenChange(false)
    } catch (error) {
      // Error handling is done in parent component
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit User" : "Create New User"}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update user information. Email and gamertag must be unique."
              : "Add a new user to the system. They will be able to sign in with the provided credentials."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="John Doe"
                aria-invalid={!!errors.name}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => {
                  const newEmail = e.target.value
                  setFormData({ ...formData, email: newEmail })
                  // Clear immediate error and trigger validation
                  setErrors((prev) => {
                    const newErrors = { ...prev }
                    delete newErrors.email
                    return newErrors
                  })
                  validateEmail(newEmail)
                }}
                placeholder="john@example.com"
                aria-invalid={!!errors.email}
              />
              {isValidatingEmail && (
                <p className="text-sm text-muted-foreground">Checking availability...</p>
              )}
              {errors.email && !isValidatingEmail && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            {!isEditMode && (
              <div className="grid gap-2">
                <Label htmlFor="password">
                  Password <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="••••••"
                  aria-invalid={!!errors.password}
                />
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="gamertag">
                Gamertag {!isEditMode && <span className="text-destructive">*</span>}
              </Label>
              <Input
                id="gamertag"
                value={formData.gamertag}
                onChange={(e) => {
                  const newGamertag = e.target.value
                  setFormData({ ...formData, gamertag: newGamertag })
                  // Clear immediate error and trigger validation
                  setErrors((prev) => {
                    const newErrors = { ...prev }
                    delete newErrors.gamertag
                    return newErrors
                  })
                  validateGamertag(newGamertag)
                }}
                placeholder="Required"
                aria-invalid={!!errors.gamertag}
              />
              {isValidatingGamertag && (
                <p className="text-sm text-muted-foreground">Checking availability...</p>
              )}
              {errors.gamertag && !isValidatingGamertag && (
                <p className="text-sm text-destructive">{errors.gamertag}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="role">
                Role <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.role}
                onValueChange={(value: "admin" | "user") =>
                  setFormData({ ...formData, role: value })
                }
              >
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? isEditMode
                  ? "Updating..."
                  : "Creating..."
                : isEditMode
                  ? "Update User"
                  : "Create User"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

