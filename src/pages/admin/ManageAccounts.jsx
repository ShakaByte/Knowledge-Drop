import { useState, useEffect } from "react"
import { supabase } from '../../lib/supabaseClient.js'

const RETENTION_DAYS = 1

function ManageAccounts() {
    const [students, setStudents] = useState([])
    const [teachers, setTeachers] = useState([])
    const [openMenu, setOpenMenu] = useState(null)
    const [confirmAction, setConfirmAction] = useState(null)
    const [toast, setToast] = useState(null)

    useEffect(() => {
        fetchUsers()
    }, [])

    function showToast(message, type, actionLabel, onAction) {
        setToast({ message, type, actionLabel, onAction })
        setTimeout(() => setToast(null), 5000)
    }

    async function fetchUsers() {
        const { data: studentData } = await supabase
            .from('students')
            .select('usn, name, email, status, deleted_at, user_id')

        const { data: teacherData } = await supabase
            .from('teachers')
            .select('empid, name, email, status, deleted_at, user_id')

        setStudents(studentData || [])
        setTeachers(teacherData || [])
    }

    async function performAction(table, idColumn, idValue, newStatus, userId) {
        const updates = { status: newStatus }
        if (newStatus === 'deleted') updates.deleted_at = new Date().toISOString()

        const { error } = await supabase.from(table).update(updates).eq(idColumn, idValue)

        if (error) {
            showToast('Error: ' + error.message, 'error')
            return
        }

        if (newStatus === 'deleted') {
            await supabase.functions.invoke('delete-user', { body: { userId } })
            showToast('User deleted.', 'error', 'Undo', () => undoDelete(table, idColumn, idValue))
        } else {
            showToast(`User ${newStatus}.`, 'success')
        }

        fetchUsers()
    }

    async function undoDelete(table, idColumn, idValue) {
        await supabase.from(table).update({ status: 'active', deleted_at: null }).eq(idColumn, idValue)
        showToast('Deletion undone (auth login still removed).', 'success')
        fetchUsers()
    }

    function requestAction(table, idColumn, idValue, newStatus, userId, label) {
        setOpenMenu(null)
        if (newStatus === 'deleted') {
            setConfirmAction({ table, idColumn, idValue, newStatus, userId, label })
        } else {
            performAction(table, idColumn, idValue, newStatus, userId)
        }
    }

    function isHidden(record) {
        if (record.status !== 'deleted' || !record.deleted_at) return false
        const daysPassed = (new Date() - new Date(record.deleted_at)) / (1000 * 60 * 60 * 24)
        return daysPassed < RETENTION_DAYS
    }

    const rowStyle = { display: 'flex', alignItems: 'center', padding: '10px', borderBottom: '1px solid #eee', position: 'relative' }
    const cellStyle = { flex: 1 }

    function renderRow(u, table, idColumn, idValue) {
        const displayName = isHidden(u) ? 'Deleted User' : u.name
        return (
            <div key={idValue} style={rowStyle}>
                <div style={cellStyle}>{displayName} ({idValue})</div>
                <div style={cellStyle}>{u.email}</div>
                <div style={{ ...cellStyle, textTransform: 'capitalize', fontWeight: 'bold', color: u.status === 'active' ? 'green' : u.status === 'suspended' ? 'orange' : 'red' }}>
                    {u.status}
                </div>
                <div style={{ position: 'relative' }}>
                    {u.status !== 'deleted' && (
                        <button
                            onClick={() => setOpenMenu(openMenu === idValue ? null : idValue)}
                            style={{ border: 'none', background: 'none', fontSize: '20px', cursor: 'pointer' }}
                        >
                            &#8942;
                        </button>
                    )}
                    {openMenu === idValue && (
                        <div style={{
                            position: 'absolute', right: 0, top: '30px', backgroundColor: 'white',
                            border: '1px solid #ccc', borderRadius: '6px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', zIndex: 10
                        }}>
                            {u.status === 'suspended' ? (
                                <div style={menuItemStyle} onClick={() => requestAction(table, idColumn, idValue, 'active', u.user_id)}>Unsuspend</div>
                            ) : (
                                <div style={menuItemStyle} onClick={() => requestAction(table, idColumn, idValue, 'suspended', u.user_id)}>Suspend</div>
                            )}
                            {u.status === 'banned' ? (
                                <div style={menuItemStyle} onClick={() => requestAction(table, idColumn, idValue, 'active', u.user_id)}>Unban</div>
                            ) : (
                                <div style={menuItemStyle} onClick={() => requestAction(table, idColumn, idValue, 'banned', u.user_id)}>Ban</div>
                            )}
                            <div style={{ ...menuItemStyle, color: 'red' }} onClick={() => requestAction(table, idColumn, idValue, 'deleted', u.user_id)}>Delete</div>
                        </div>
                    )}
                </div>
            </div>
        )
    }

    const menuItemStyle = { padding: '10px 20px', cursor: 'pointer', whiteSpace: 'nowrap' }

    const panelStyle = { backgroundColor: 'white', padding: '20px', borderRadius: '10px', border: '1px solid #e0e0e0', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', marginBottom: '20px' }

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '20px' }}>Manage Accounts</h2>

            <div style={panelStyle}>
                <h4>Students</h4>
                {students.map(s => renderRow(s, 'students', 'usn', s.usn))}
            </div>

            <div style={panelStyle}>
                <h4>Teachers</h4>
                {teachers.map(t => renderRow(t, 'teachers', 'empid', t.empid))}
            </div>

            {confirmAction && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000
                }}>
                    <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', minWidth: '320px', textAlign: 'center' }}>
                        <p>Are you sure you want to delete this account?</p>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '16px' }}>
                            <button
                                style={{ padding: '10px 20px', backgroundColor: '#333', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                                onClick={() => {
                                    performAction(confirmAction.table, confirmAction.idColumn, confirmAction.idValue, confirmAction.newStatus, confirmAction.userId)
                                    setConfirmAction(null)
                                }}
                            >
                                OK
                            </button>
                            <button
                                style={{ padding: '10px 20px', backgroundColor: '#eee', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                                onClick={() => setConfirmAction(null)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {toast && (
                <div style={{
                    position: 'fixed', bottom: '20px', right: '20px',
                    backgroundColor: toast.type === 'error' ? '#f8d7da' : '#d4edda',
                    color: toast.type === 'error' ? '#721c24' : '#155724',
                    padding: '12px 20px', borderRadius: '6px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    display: 'flex', alignItems: 'center', gap: '12px'
                }}>
                    <span>{toast.message}</span>
                    {toast.actionLabel && (
                        <button onClick={toast.onAction} style={{ textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold', color: 'inherit' }}>
                            {toast.actionLabel}
                        </button>
                    )}
                </div>
            )}
        </div>
    )
}

export default ManageAccounts