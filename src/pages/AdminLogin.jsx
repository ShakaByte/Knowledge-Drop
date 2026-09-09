import { useState } from "react";
import { supabase } from '../lib/supabaseClient.js'
import { useNavigate } from "react-router-dom"

function AdminLogin() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const navigate = useNavigate()

    async function handleLogin() {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })

        if (error) {
            alert('Invalid email or password')
            return
        }

        const { data: adminRow } = await supabase
            .from('admin')
            .select('user_id')
            .eq('user_id', data.user.id)
            .maybeSingle()

        if (!adminRow) {
            alert('Not authorized as admin')
            await supabase.auth.signOut()
            return
        }

        navigate('/AdminDashboard', { replace: true })
    }

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            backgroundColor: '#f4f4f4'
        }}>
            <div style={{
                backgroundColor: 'white',
                padding: '32px',
                borderRadius: '10px',
                boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
                width: '340px'
            }}>
                <h2 style={{ textAlign: 'center', marginBottom: '24px' }}>Admin Login</h2>

                <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    style={{ width: '100%', padding: '10px', marginBottom: '12px', boxSizing: 'border-box', borderRadius: '6px', border: '1px solid #ccc' }}
                />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    style={{ width: '100%', padding: '10px', marginBottom: '20px', boxSizing: 'border-box', borderRadius: '6px', border: '1px solid #ccc' }}
                />
                <button
                    onClick={handleLogin}
                    style={{ width: '100%', padding: '10px', backgroundColor: '#333', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '15px' }}
                >
                    Sign In
                </button>
            </div>
        </div>
    )
}

export default AdminLogin