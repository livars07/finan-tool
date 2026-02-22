"use client"

import { useEffect, useRef } from "react"
import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

export function Toaster() {
  const { toasts } = useToast()
  const lastToastCount = useRef(toasts.length)

  useEffect(() => {
    // Play sound when a new toast is added
    if (toasts.length > lastToastCount.current) {
      // Usando un sonido tipo "pop" suave y menos agudo
      const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3")
      audio.volume = 0.3
      audio.play().catch(() => {
        // Ignore browser auto-play prevention errors
      })
    }
    lastToastCount.current = toasts.length
  }, [toasts])

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
