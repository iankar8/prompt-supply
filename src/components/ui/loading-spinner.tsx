import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
  className?: string
}

export function LoadingSpinner({ className }: LoadingSpinnerProps) {
  return (
    <div className={cn("h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900", className)} />
  )
}
