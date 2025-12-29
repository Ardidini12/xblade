import React from "react"

interface BaseHeaderProps {
  children: React.ReactNode
  className?: string
}

/**
 * Base header component that provides consistent styling
 * Used by both user and admin headers
 */
const BaseHeader = ({ children, className = "" }: BaseHeaderProps) => {
  return (
    <header className={`border-b border-slate-800 bg-slate-950 ${className}`}>
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {children}
      </div>
    </header>
  )
}

export default BaseHeader

