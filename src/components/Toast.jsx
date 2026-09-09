import { useEffect } from "react"

function Toast({ message, type = 'info', onClose, actionLabel, onAction }) {
    useEffect(() => {
        const timer = setTimeout(onClose, 5000)
        return () => clearTimeout(timer)
    }, [onClose])

    const bgColor = type === 'error' ? '#f8d7da' : type === 'success' ? '#d4edda' : '#d1ecf1'
    const textColor = type === 'error' ? '#721c24' : type === 'success' ? '#155724' : '#0c5460'

    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            backgroundColor: bgColor,
            color: textColor,
            padding: '12px 20px',
            borderRadius: '6px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
        }}>
            <span>{message}</span>
            {actionLabel && (
                <button onClick={onAction} style={{ textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', color: textColor, fontWeight: 'bold' }}>
                    {actionLabel}
                </button>
            )}
        </div>
    )
}

export default Toast