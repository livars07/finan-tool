
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
  const processedToastIds = useRef(new Set<string>())

  useEffect(() => {
    // Play sound for every new toast immediately
    toasts.forEach((t) => {
      if (!processedToastIds.current.has(t.id)) {
        processedToastIds.current.add(t.id)
        
        // Determinar el sonido basado en la variante (error vs normal)
        const soundUrl = t.variant === 'destructive' 
          ? "https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3" // Sonido de alerta/error
          : "https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3"; // Sonido de éxito/info
          
        const audio = new Audio(soundUrl)
        audio.volume = t.variant === 'destructive' ? 0.5 : 0.3
        audio.play().catch(() => {
          // Ignore browser auto-play prevention errors
        })
      }
    })

    // Housekeeping: remove IDs of toasts that are no longer in the array
    const currentIds = new Set(toasts.map(t => t.id))
    processedToastIds.current.forEach(id => {
      if (!currentIds.has(id)) {
        processedToastIds.current.delete(id)
      }
    })
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
