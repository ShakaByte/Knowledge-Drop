import { useState, useEffect } from "react"
import { supabase } from '../lib/supabaseClient.js'

function Notifications() {
    const [notifications, setNotifications] = useState([])

    useEffect(() => {
        loadNotifications()
    }, [])

    async function loadNotifications() {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

        setNotifications(data || [])
    }

    async function markAsRead(nid) {
        await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('nid', nid)

        setNotifications(prev =>
            prev.map(n => n.nid === nid ? { ...n, is_read: true } : n)
        )
    }

    return (
        <div style={{ width: '200px', borderRight: '1px solid gray', padding: '10px' }}>
            <h4>Notifications</h4>

            {notifications.length === 0 && <p>No notifications</p>}

            {notifications.map((n) => (
                <div
                    key={n.nid}
                    onClick={() => !n.is_read && markAsRead(n.nid)}
                    style={{
                        padding: '5px',
                        marginBottom: '5px',
                        backgroundColor: n.is_read ? 'transparent' : '#e0f0ff',
                        fontWeight: n.is_read ? 'normal' : 'bold',
                        cursor: n.is_read ? 'default' : 'pointer'
                    }}
                >
                    {n.message}
                </div>
            ))}
        </div>
    )
}

export default Notifications