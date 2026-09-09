import { useState, useEffect } from "react"
import { supabase } from '../lib/supabaseClient.js'

function RecentUploads() {
    const [files, setFiles] = useState([])

    useEffect(() => {
        loadRecentUploads()
    }, [])

    async function loadRecentUploads() {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data: student } = await supabase
            .from('students')
            .select('branch')
            .eq('user_id', user.id)
            .maybeSingle()

        let branch = student?.branch

        if (!branch) {
            const { data: teacher } = await supabase
                .from('teachers')
                .select('branch')
                .eq('user_id', user.id)
                .maybeSingle()

            branch = teacher?.branch
        }

        if (!branch) return

        const { data } = await supabase
            .from('file_details')
            .select('title, filename, subject_code, uploaded_at')
            .eq('branch', branch)
            .eq('status', 'active')
            .order('uploaded_at', { ascending: false })
            .limit(5)

        setFiles(data || [])
    }

    return (
        <div style={{ width: '200px', borderLeft: '1px solid gray', padding: '10px' }}>
            <h4>Recent Uploads</h4>

            {files.length === 0 && <p>No recent uploads.</p>}

            {files.map((f, i) => (
                <div key={i} style={{ marginBottom: '8px', fontSize: '14px' }}>
                    {f.title || f.filename} <br />
                    <span style={{ color: 'gray' }}>{f.subject_code}</span>
                </div>
            ))}
        </div>
    )
}

export default RecentUploads