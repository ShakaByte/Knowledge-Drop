import { useEffect } from "react"
import { Outlet, Link, useLocation } from "react-router-dom"
import { supabase } from '../lib/supabaseClient.js'
import { useNavigate } from "react-router-dom"
import Notifications from '../components/Notifications.jsx'
import RecentUploads from '../components/RecentUploads.jsx'

function UserDashboard() {
    const navigate = useNavigate()
    const location = useLocation()
    const isProfilePage = location.pathname.includes('/Profile')

    async function handleLogout() {
        await supabase.auth.signOut()
        navigate('/login', { replace: true })
    }

    const linkStyle = {
        color: '#444',
        textDecoration: 'none',
        fontWeight: '500',
        fontSize: '14.5px',
        padding: '6px 10px',
        borderRadius: '6px',
        transition: 'background 0.15s ease'
    }

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f7f7f8', fontFamily: 'system-ui, sans-serif' }}>
            <nav style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '14px 28px',
                borderBottom: '1px solid #e2e2e2',
                backgroundColor: '#fff',
                position: 'sticky',
                top: 0,
                zIndex: 10,
                boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
                    <span style={{ fontWeight: '700', fontSize: '17px', color: '#222' }}>📚 Portal</span>
                    <div style={{ display: 'flex', gap: '6px' }}>
                        <Link to="/UserDashboard" style={linkStyle}>Home</Link>
                        <Link to="/UserDashboard/library" style={linkStyle}>Library</Link>
                        <Link to="/UserDashboard/share" style={linkStyle}>Share Files</Link>
                        <Link to="/UserDashboard/profile" style={linkStyle}>Profile</Link>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    style={{
                        padding: '8px 18px',
                        backgroundColor: '#222',
                        color: 'white',
                        border: 'none',
                        borderRadius: '7px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500'
                    }}
                >
                    Logout
                </button>
            </nav>

            <div style={{ display: 'flex', maxWidth: '1400px', margin: '0 auto', gap: '20px', padding: '20px' }}>
                {!isProfilePage && <Notifications />}

                <div style={{
                    padding: '24px',
                    flex: 1,
                    backgroundColor: '#fff',
                    borderRadius: '12px',
                    border: '1px solid #eaeaea',
                    boxShadow: '0 1px 6px rgba(0,0,0,0.03)'
                }}>
                    <Outlet />
                </div>

                {!isProfilePage && <RecentUploads />}
            </div>
        </div>
    )
}

export default UserDashboard