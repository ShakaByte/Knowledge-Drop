import { useState, useEffect } from "react"
import { supabase } from '../../lib/supabaseClient.js'

function ShareFile() {
    const [subjects, setSubjects] = useState([])
    const [selectedSubject, setSelectedSubject] = useState('')
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [file, setFile] = useState(null)
    const [uploading, setUploading] = useState(false)
    const [userInfo, setUserInfo] = useState(null)

    useEffect(() => {
        loadOwnSubjects()
    }, [])

    async function loadOwnSubjects() {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data: student } = await supabase
            .from('students')
            .select('branch, semester')
            .eq('user_id', user.id)
            .maybeSingle()

        let branch = null
        let semester = null

        if (student) {
            branch = student.branch
            semester = student.semester
        } else {
            const { data: teacher } = await supabase
                .from('teachers')
                .select('branch')
                .eq('user_id', user.id)
                .maybeSingle()

            if (teacher) branch = teacher.branch
        }

        setUserInfo({ userId: user.id, branch, semester, role: student ? 'student' : 'teacher' })

        if (branch) {
            let query = supabase.from('subjects').select('*').eq('branch', branch)
            if (semester) query = query.eq('semester', semester)

            const { data: subjectData } = await query
            setSubjects(subjectData || [])
        }
    }

    function handleFileChange(e) {
        const selected = e.target.files[0]
        if (!selected) return

        if (selected.type !== 'application/pdf') {
            alert('Only PDF files are allowed.')
            return
        }

        if (selected.size > 25 * 1024 * 1024) {
            alert('File size must be under 25MB.')
            return
        }

        setFile(selected)
    }

    async function handleUpload() {
        if (!selectedSubject || !file || !title) {
            alert('Please select a subject, provide a title, and choose a file.')
            return
        }
        setUploading(true)

        const filePath = `${userInfo.branch}/${selectedSubject}/${Date.now()}_${file.name}`

        const { error: uploadError } = await supabase
            .storage
            .from('files')
            .upload(filePath, file)

        if (uploadError) {
            alert('Upload failed: ' + uploadError.message)
            setUploading(false)
            return
        }

        const { error: dbError } = await supabase
            .from('file_details')
            .insert({
                filename: file.name,
                title: title,
                description: description,
                uploaded_by: userInfo.userId,
                branch: userInfo.branch,
                semester: userInfo.semester,
                subject_code: selectedSubject,
                filepath: filePath,
                filesize: file.size
            })

        setUploading(false)

        if (dbError) {
            alert('File uploaded but failed to save details: ' + dbError.message)
        } else {
            const subject = subjects.find(s => s.subject_code === selectedSubject)
            await createNotifications(userInfo.userId, userInfo.role, userInfo.branch, userInfo.semester, subject?.subject_name || selectedSubject)
            alert('File uploaded successfully!')
            setFile(null)
            setTitle('')
            setDescription('')
            setSelectedSubject('')
        }
    }

    async function createNotifications(uploaderId, uploaderRole, branch, semester, subjectName) {
        await supabase.from('notifications').insert({
            user_id: uploaderId,
            message: `Your file for ${subjectName} was uploaded successfully.`
        })

        if (uploaderRole === 'teacher') {
            const { data: students } = await supabase
                .from('students')
                .select('user_id')
                .eq('branch', branch)
                .eq('semester', semester)

            if (students && students.length > 0) {
                const notifRows = students.map(s => ({
                    user_id: s.user_id,
                    message: `New official material uploaded for ${subjectName}.`
                }))

                await supabase.from('notifications').insert(notifRows)
            }
        }
    }

    const fieldStyle = {
        width: '100%',
        padding: '10px 12px',
        marginBottom: '14px',
        boxSizing: 'border-box',
        borderRadius: '8px',
        border: '1px solid #ddd',
        fontSize: '14px',
        fontFamily: 'inherit'
    }

    return (
        <div style={{ maxWidth: '480px' }}>
            <h2 style={{ marginTop: 0, color: '#222' }}>Share File</h2>

            <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} style={fieldStyle}>
                <option value="">Select Subject</option>
                {subjects.map(s => (
                    <option key={s.subject_code} value={s.subject_code}>
                        {s.subject_name} ({s.subject_code})
                    </option>
                ))}
            </select>

            <input
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={fieldStyle}
            />

            <textarea
                placeholder="Description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                style={{ ...fieldStyle, resize: 'vertical' }}
            />

            <div style={{
                border: '1.5px dashed #ccc',
                borderRadius: '8px',
                padding: '16px',
                textAlign: 'center',
                marginBottom: '16px',
                backgroundColor: '#fafafa'
            }}>
                <input type="file" accept="application/pdf" onChange={handleFileChange} style={{ fontSize: '13px' }} />
                {file && <p style={{ fontSize: '12.5px', color: '#666', marginTop: '8px', marginBottom: 0 }}>Selected: {file.name}</p>}
            </div>

            <button
                onClick={handleUpload}
                disabled={uploading}
                style={{
                    width: '100%',
                    padding: '11px',
                    backgroundColor: uploading ? '#999' : '#222',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: uploading ? 'not-allowed' : 'pointer',
                    fontSize: '14.5px',
                    fontWeight: '600'
                }}
            >
                {uploading ? 'Uploading...' : 'Upload'}
            </button>
        </div>
    )
}

export default ShareFile