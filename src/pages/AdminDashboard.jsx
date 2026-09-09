import { useEffect } from "react"
import { Outlet, Link } from "react-router-dom"
import { supabase } from '../lib/supabaseClient.js'
import { useNavigate } from "react-router-dom"

function AdminDashboard() {
    const navigate = useNavigate()

    async function handleLogout() {
        await supabase.auth.signOut()
        navigate('/admin-login', { replace: true })
    }

    const linkStyle = { color: '#333', textDecoration: 'none', fontWeight: '500' }

    return (
        <div>
            <nav style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '14px 24px',
                borderBottom: '1px solid #ddd',
                backgroundColor: '#fff'
            }}>
                <div style={{ display: 'flex', gap: '20px' }}>
                    <Link to="/AdminDashboard">Home</Link>
                    <Link to="/AdminDashboard/create">Create User</Link>
                    <Link to="/AdminDashboard/manage">Manage Accounts</Link>
                    <Link to="/AdminDashboard/files">File Details</Link>
                    <Link to="/AdminDashboard/reports">Report Details</Link>
                </div>
                <button
                    onClick={handleLogout}
                    style={{ padding: '8px 16px', backgroundColor: '#333', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                >
                    Logout
                </button>
            </nav>

            <div style={{ padding: '24px' }}>
                <Outlet />
            </div>
        </div>
    )
}

export default AdminDashboard