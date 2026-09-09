import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { supabase } from '../../lib/supabaseClient.js'

function SubjectFiles() {
    const { subjectCode } = useParams()
    const [files, setFiles] = useState([])
    const [subjectName, setSubjectName] = useState('')
    const [currentUserId, setCurrentUserId] = useState(null)

    useEffect(() => {
        loadSubjectAndFiles()
    }, [subjectCode])

    async function loadSubjectAndFiles() {
        const { data: { user } } = await supabase.auth.getUser()
        setCurrentUserId(user?.id)

        const { data: subject } = await supabase
            .from('subjects')
            .select('subject_name')
            .eq('subject_code', subjectCode)
            .maybeSingle()

        if (subject) setSubjectName(subject.subject_name)

        const { data: fileData } = await supabase
            .from('file_details')
            .select('*')
            .eq('subject_code', subjectCode)
            .eq('status', 'active')
            .order('uploaded_at', { ascending: false })

        setFiles(fileData || [])
    }

    async function viewFile(filepath) {
        const { data, error } = await supabase
            .storage
            .from('files')
            .createSignedUrl(filepath, 60)

        if (error) {
            alert('Error opening file: ' + error.message)
        } else {
            window.open(data.signedUrl, '_blank')
        }
    }

    async function downloadFile(filepath, filename) {
        const { data, error } = await supabase
            .storage
            .from('files')
            .createSignedUrl(filepath, 60, { download: filename })

        if (error) {
            alert('Error downloading file: ' + error.message)
        } else {
            window.open(data.signedUrl, '_blank')
        }
    }

    async function reportFile(fid, uploadedBy) {
        const reason = prompt('Reason for reporting this file:')
        if (!reason) return

        const { error } = await supabase
            .from('report_details')
            .insert({
                filed_by: currentUserId,
                filed_against: uploadedBy,
                reported_file_id: fid,
                reason: reason
            })

        if (error) {
            alert('Error filing report: ' + error.message)
        } else {
            alert('Report filed successfully.')
        }
    }

    const btnStyle = {
        padding: '6px 14px',
        borderRadius: '6px',
        border: 'none',
        cursor: 'pointer',
        fontSize: '12.5px',
        fontWeight: '500',
        marginLeft: '8px'
    }

    return (
        <div>
            <h2 style={{ marginTop: 0, color: '#222' }}>{subjectName} <span style={{ color: '#999', fontWeight: '400' }}>({subjectCode})</span></h2>

            {files.length === 0 && <p style={{ color: '#888', fontSize: '13.5px' }}>No files uploaded yet for this subject.</p>}

            {files.map((f) => (
                <div key={f.fid} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    border: '1px solid #eaeaea',
                    borderRadius: '10px',
                    padding: '12px 16px',
                    marginBottom: '8px',
                    backgroundColor: '#fafafa'
                }}>
                    <span style={{ fontSize: '14px', color: '#222' }}>{f.title || f.filename}</span>
                    <div>
                        <button onClick={() => viewFile(f.filepath)} style={{ ...btnStyle, backgroundColor: '#eee', color: '#333' }}>Preview</button>
                        <button onClick={() => downloadFile(f.filepath, f.filename)} style={{ ...btnStyle, backgroundColor: '#222', color: 'white' }}>Download</button>
                        {f.uploaded_by !== currentUserId && (
                            <button onClick={() => reportFile(f.fid, f.uploaded_by)} style={{ ...btnStyle, backgroundColor: '#fdecec', color: '#c0392b' }}>Report</button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    )
}

export default SubjectFiles