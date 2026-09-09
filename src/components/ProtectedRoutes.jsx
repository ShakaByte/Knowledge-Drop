import { useState, useEffect } from "react"
import { Navigate } from "react-router-dom"
import { supabase } from '../lib/supabaseClient.js'

function ProtectedRoute({ children, role }) {
    const [status, setStatus] = useState('checking')

    useEffect(() => {
        checkSession()

        const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
            checkSession()
        })

        return () => authListener.subscription.unsubscribe()
    }, [])

    async function checkSession() {
        const { data: { session } } = await supabase.auth.getSession()

        if (!session) {
            setStatus('unauthenticated')
            return
        }

        if (role === 'admin') {
            const { data: adminRow } = await supabase
                .from('admin')
                .select('user_id')
                .eq('user_id', session.user.id)
                .maybeSingle()

            setStatus(adminRow ? 'authenticated' : 'unauthorized')
            return
        }

        if (role === 'user') {
            const { data: adminRow } = await supabase
                .from('admin')
                .select('user_id')
                .eq('user_id', session.user.id)
                .maybeSingle()

            setStatus(adminRow ? 'unauthorized' : 'authenticated')
            return
        }

        setStatus('authenticated')
    }

    if (status === 'checking') return <p>Loading...</p>
    if (status === 'unauthenticated') return <Navigate to={role === 'admin' ? '/admin-login' : '/login'} replace />
    if (status === 'unauthorized') return <Navigate to={role === 'admin' ? '/admin-login' : '/login'} replace />

    return children
}

export default ProtectedRoute