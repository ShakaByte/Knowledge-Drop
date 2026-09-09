import { useState, useEffect } from "react"
import { supabase } from '../../lib/supabaseClient.js'

function ReportDetails() {
    const [reports, setReports] = useState([])
    const [openMenu, setOpenMenu] = useState(null)
    const [toast, setToast] = useState(null)

    useEffect(() => {
        fetchReports()
    }, [])

    function showToast(message, type) {
        setToast({ message, type })
        setTimeout(() => setToast(null), 5000)
    }

    async function fetchReports() {
        const { data } = await supabase
            .from('report_details')
            .select('*')
            .order('reported_at', { ascending: false })

        setReports(data || [])
    }

    async function updateStatus(rid, newStatus) {
        const { error } = await supabase.from('report_details').update({ status: newStatus }).eq('rid', rid)
        if (error) {
            showToast('Error: ' + error.message, 'error')
        } else {
            showToast(`Marked as ${newStatus.replace('_', ' ')}.`, 'success')
            fetchReports()
        }
        setOpenMenu(null)
    }

    const rowStyle = { display: 'flex', alignItems: 'center', padding: '10px', borderBottom: '1px solid #eee', position: 'relative' }
    const cellStyle = { flex: 1 }
    const menuItemStyle = { padding: '10px 20px', cursor: 'pointer', whiteSpace: 'nowrap' }
    const panelStyle = { backgroundColor: 'white', padding: '20px', borderRadius: '10px', border: '1px solid #e0e0e0', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }

    const statusColor = { pending: 'orange', action_taken: 'green', not_required: 'gray' }

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '20px' }}>Report Details</h2>

            <div style={panelStyle}>
                {reports.length === 0 && <p>No reports filed yet.</p>}

                {reports.map((r) => (
                    <div key={r.rid} style={rowStyle}>
                        <div style={cellStyle}>{r.reason}</div>
                        <div style={{ ...cellStyle, textTransform: 'capitalize', fontWeight: 'bold', color: statusColor[r.status] || '#333' }}>
                            {r.status.replace('_', ' ')}
                        </div>
                        <div style={{ position: 'relative' }}>
                            <button
                                onClick={() => setOpenMenu(openMenu === r.rid ? null : r.rid)}
                                style={{ border: 'none', background: 'none', fontSize: '20px', cursor: 'pointer' }}
                            >
                                &#8942;
                            </button>
                            {openMenu === r.rid && (
                                <div style={{
                                    position: 'absolute', right: 0, top: '30px', backgroundColor: 'white',
                                    border: '1px solid #ccc', borderRadius: '6px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', zIndex: 10
                                }}>
                                    <div style={menuItemStyle} onClick={() => updateStatus(r.rid, 'pending')}>Mark Pending</div>
                                    <div style={menuItemStyle} onClick={() => updateStatus(r.rid, 'action_taken')}>Mark Action Taken</div>
                                    <div style={menuItemStyle} onClick={() => updateStatus(r.rid, 'not_required')}>Mark Not Required</div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {toast && (
                <div style={{
                    position: 'fixed', bottom: '20px', right: '20px',
                    backgroundColor: toast.type === 'error' ? '#f8d7da' : '#d4edda',
                    color: toast.type === 'error' ? '#721c24' : '#155724',
                    padding: '12px 20px', borderRadius: '6px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                }}>
                    {toast.message}
                </div>
            )}
        </div>
    )
}

export default ReportDetails