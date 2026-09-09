import { useState, useCallback } from "react"

export function useToast() {
    const [toast, setToast] = useState(null)

    const showToast = useCallback((message, type = 'info', actionLabel, onAction) => {
        setToast({ message, type, actionLabel, onAction })
    }, [])

    const hideToast = useCallback(() => setToast(null), [])

    return { toast, showToast, hideToast }
}