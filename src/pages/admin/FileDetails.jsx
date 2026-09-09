import { useState, useEffect } from "react"
import { supabase } from '../../lib/supabaseClient.js'

function FileDetails() {
    const [files, setFiles] = useState([])
    const [openMenu, setOpenMenu] = useState(null)
    const [confirmAction, setConfirmAction] = useState(null)
    const [toast, setToast] = useState(null)

    useEffect(() => {
        fetchFiles()
    }, [])

    function showToast(message, type) {
        setToast({ message, type })
        setTimeout(() => setToast(null), 5000)
    }

    async function fetchFiles() {
        const { data } = await supabase
            .from('file_details')
            .select('*')
            .order('uploaded_at', { ascending: false })

        setFiles(data || [])
    }

    async function openFile(filepath) {
        const { data, error } = await supabase.storage.from('files').createSignedUrl(filepath, 60)
        if (error) {
            showToast('Error opening file: ' + error.message, 'error')
        } else {
            window.open(data.signedUrl, '_blank')
        }
    }

    async function performDelete(fid) {
        const { error } = await supabase.from('file_details').update({ status: 'removed' }).eq('fid', fid)
        if (error) {
            showToast('Error: ' + error.message, 'error')
        } else {
            showToast('File removed.', 'error')
            fetchFiles()
        }
    }

    const rowStyle = { display: 'flex', alignItems: 'center', padding: '10px', borderBottom: '1px solid #eee', position: 'relative' }
    const cellStyle = { flex: 1 }
    const menuItemStyle = { padding: '10px 20px', cursor: 'pointer', whiteSpace: 'nowrap' }
    const panelStyle = { backgroundColor: 'white', padding: '20px', borderRadius: '10px', border: '1px solid #e0e0e0', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '20px' }}>File Details</h2>

            <div style={panelStyle}>
                {files.length === 0 && <p>No files uploaded yet.</p>}
                {files.map((f) => (
                    <div key={f.fid} style={rowStyle}>
                        <div style={cellStyle}>{f.title || f.filename}</div>
                        <div style={cellStyle}>{f.branch} - Sem {f.semester} ({f.subject_code})</div>
                        <div style={{ ...cellStyle, textTransform: 'capitalize', fontWeight: 'bold', color: f.status === 'active' ? 'green' : 'red' }}>
                            {f.status}
                        </div>
                        <div style={{ position: 'relative' }}>
                            {f.status !== 'removed' && (
                                <button
                                    onClick={() => setOpenMenu(openMenu === f.fid ? null : f.fid)}
                                    style={{ border: 'none', background: 'none', fontSize: '20px', cursor: 'pointer' }}>&#8942;</button>
                            )}
                            {openMenu === f.fid && (
                                <div style={{
                                    position: 'absolute', right: 0, top: '30px', backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '6px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', zIndex: 10
                                }}>
                                    <div style={menuItemStyle} onClick={() => { setOpenMenu(null); openFile(f.filepath) }}>Open</div>
                                    <div style={{ ...menuItemStyle, color: 'red' }} onClick={() => { setOpenMenu(null); setConfirmAction(f.fid) }}>Delete</div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {confirmAction && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000
                }}>
                    <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', minWidth: '320px', textAlign: 'center' }}>
                        <p>Remove this file? It will no longer be visible to users.</p>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '16px' }}>
                            <button
                                style={{ padding: '10px 20px', backgroundColor: '#333', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                                onClick={() => { performDelete(confirmAction); setConfirmAction(null) }}
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
                    padding: '12px 20px', borderRadius: '6px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                }}>
                    {toast.message}
                </div>
            )}
        </div>
    )
}

export default FileDetails