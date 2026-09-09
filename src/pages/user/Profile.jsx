import { useState, useEffect } from "react"
import { supabase } from '../../lib/supabaseClient.js'

function Profile() {
    const [profile, setProfile] = useState(null)
    const [role, setRole] = useState('')
    const [gender, setGender] = useState('')
    const [dob, setDob] = useState('')
    const [contact, setContact] = useState('')
    const [section, setSection] = useState('')
    const [semester, setSemester] = useState('')
    const [avatarFile, setAvatarFile] = useState(null)
    const [userId, setUserId] = useState(null)
    const [myFiles, setMyFiles] = useState([])
    const [reportsAgainstMe, setReportsAgainstMe] = useState([])

    useEffect(() => {
        loadProfile()
    }, [])

    async function loadProfile() {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        setUserId(user.id)

        const { data: student } = await supabase
            .from('students')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle()

        if (student) {
            setProfile(student)
            setRole('student')
            setGender(student.gender || '')
            setDob(student.date_of_birth || '')
            setContact(student.contact || '')
            setSection(student.section || '')
            setSemester(student.semester || '')
        } else {
            const { data: teacher } = await supabase
                .from('teachers')
                .select('*')
                .eq('user_id', user.id)
                .maybeSingle()

            if (teacher) {
                setProfile(teacher)
                setRole('teacher')
                setGender(teacher.gender || '')
                setDob(teacher.date_of_birth || '')
                setContact(teacher.contact || '')
                setSection(teacher.section || '')
            }
        }

        loadMyFiles(user.id)
        loadReportsAgainstMe(user.id)
    }

    async function loadMyFiles(uid) {
        const { data } = await supabase
            .from('file_details')
            .select('*')
            .eq('uploaded_by', uid)
            .eq('status', 'active')
            .order('uploaded_at', { ascending: false })

        setMyFiles(data || [])
    }

    async function loadReportsAgainstMe(uid) {
        const { data } = await supabase
            .from('report_details')
            .select('*, file_details(title, filename)')
            .eq('filed_against', uid)
            .order('reported_at', { ascending: false })

        setReportsAgainstMe(data || [])
    }

    async function handleAvatarUpload() {
        if (!avatarFile) return

        const filePath = `${userId}/${Date.now()}_${avatarFile.name}`

        const { error: uploadError } = await supabase
            .storage
            .from('avatars')
            .upload(filePath, avatarFile)

        if (uploadError) {
            alert('Avatar upload failed: ' + uploadError.message)
            return
        }

        const table = role === 'student' ? 'students' : 'teachers'
        const idColumn = role === 'student' ? 'usn' : 'empid'
        const idValue = role === 'student' ? profile.usn : profile.empid

        const { error: updateError } = await supabase
            .from(table)
            .update({ profile_pic_path: filePath })
            .eq(idColumn, idValue)

        if (updateError) {
            alert('Failed to save avatar path: ' + updateError.message)
        } else {
            alert('Profile picture updated!')
            loadProfile()
        }
    }

    async function handleSaveDetails() {
        const table = role === 'student' ? 'students' : 'teachers'
        const idColumn = role === 'student' ? 'usn' : 'empid'
        const idValue = role === 'student' ? profile.usn : profile.empid

        const updates = {}

        if (!profile.gender && gender) updates.gender = gender
        if (!profile.date_of_birth && dob) updates.date_of_birth = dob
        if (!profile.contact && contact) updates.contact = contact
        if (!profile.section && section) updates.section = section

        if (role === 'student') updates.semester = semester

        const { error } = await supabase
            .from(table)
            .update(updates)
            .eq(idColumn, idValue)

        if (error) {
            alert('Error saving details: ' + error.message)
        } else {
            alert('Profile updated!')
            loadProfile()
        }
    }

    function getAvatarUrl() {
        if (!profile?.profile_pic_path) return null
        const { data } = supabase.storage.from('avatars').getPublicUrl(profile.profile_pic_path)
        return data.publicUrl
    }

    async function deleteMyFile(fid) {
        if (!confirm('Delete this file?')) return

        const { error } = await supabase
            .from('file_details')
            .update({ status: 'removed' })
            .eq('fid', fid)

        if (error) {
            alert('Error deleting file: ' + error.message)
        } else {
            loadMyFiles(userId)
        }
    }

    async function editMyFile(fid, currentTitle, currentDescription) {
        const newTitle = prompt('Edit title:', currentTitle)
        if (newTitle === null) return

        const newDescription = prompt('Edit description:', currentDescription)

        const { error } = await supabase
            .from('file_details')
            .update({ title: newTitle, description: newDescription })
            .eq('fid', fid)

        if (error) {
            alert('Error updating file: ' + error.message)
        } else {
            loadMyFiles(userId)
        }
    }

    if (!profile) return <p style={{ padding: '20px', color: '#888' }}>Loading profile...</p>

    const fieldRow = { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0', borderBottom: '1px solid #f0f0f0' }
    const labelStyle = { fontWeight: '600', color: '#555', width: '110px', fontSize: '13.5px' }
    const inputStyle = { padding: '7px 10px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '13.5px' }
    const cardStyle = { border: '1px solid #eaeaea', borderRadius: '12px', padding: '16px 20px', backgroundColor: '#fafafa', marginBottom: '10px' }
    const btnStyle = { padding: '5px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '12.5px', fontWeight: '500', marginLeft: '8px' }

    return (
        <div>
            <h2 style={{ marginTop: 0, color: '#222' }}>Profile</h2>

            <div style={{ display: 'flex', alignItems: 'center', gap: '18px', marginBottom: '24px' }}>
                {getAvatarUrl() ? (
                    <img src={getAvatarUrl()} alt="Profile" width="90" height="90" style={{ borderRadius: '50%', objectFit: 'cover', border: '2px solid #eee' }} />
                ) : (
                    <div style={{ width: '90px', height: '90px', borderRadius: '50%', backgroundColor: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: '13px' }}>No photo</div>
                )}
                <div>
                    <input type="file" accept="image/*" onChange={(e) => setAvatarFile(e.target.files[0])} style={{ fontSize: '12.5px' }} />
                    <br />
                    <button onClick={handleAvatarUpload} style={{ ...btnStyle, marginLeft: 0, marginTop: '8px', backgroundColor: '#222', color: 'white', padding: '7px 14px' }}>
                        Upload Picture
                    </button>
                </div>
            </div>

            <div style={cardStyle}>
                <div style={fieldRow}><span style={labelStyle}>Name</span><span>{profile.name}</span></div>
                <div style={fieldRow}><span style={labelStyle}>{role === 'student' ? 'USN' : 'EMPID'}</span><span>{role === 'student' ? profile.usn : profile.empid}</span></div>
                <div style={fieldRow}><span style={labelStyle}>Email</span><span>{profile.email}</span></div>
                <div style={fieldRow}><span style={labelStyle}>Branch</span><span>{profile.branch}</span></div>

                {role === 'student' && (
                    <div style={fieldRow}>
                        <span style={labelStyle}>Semester</span>
                        <select value={semester} onChange={(e) => setSemester(e.target.value)} style={inputStyle}>
                            {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                )}

                <div style={fieldRow}>
                    <span style={labelStyle}>Gender</span>
                    {profile.gender ? <span>{profile.gender}</span> : (
                        <select value={gender} onChange={(e) => setGender(e.target.value)} style={inputStyle}>
                            <option value="">Select</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    )}
                </div>

                <div style={fieldRow}>
                    <span style={labelStyle}>Date of Birth</span>
                    {profile.date_of_birth ? <span>{profile.date_of_birth}</span> : (
                        <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} style={inputStyle} />
                    )}
                </div>

                <div style={fieldRow}>
                    <span style={labelStyle}>Contact</span>
                    {profile.contact ? <span>{profile.contact}</span> : (
                        <input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="Phone number" style={inputStyle} />
                    )}
                </div>

                <div style={{ ...fieldRow, borderBottom: 'none' }}>
                    <span style={labelStyle}>Section</span>
                    {profile.section ? <span>{profile.section}</span> : (
                        <input value={section} onChange={(e) => setSection(e.target.value)} placeholder="Section" style={inputStyle} />
                    )}
                </div>
            </div>

            <button
                onClick={handleSaveDetails}
                style={{ padding: '9px 20px', backgroundColor: '#222', color: 'white', border: 'none', borderRadius: '7px', cursor: 'pointer', fontWeight: '500', marginBottom: '28px' }}
            >
                Save Details
            </button>

            <h3 style={{ color: '#222', marginBottom: '10px' }}>My Uploads</h3>
            {myFiles.length === 0 && <p style={{ color: '#888', fontSize: '13.5px' }}>No uploads yet.</p>}
            {myFiles.map((f) => (
                <div key={f.fid} style={{ ...cardStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px' }}>{f.title || f.filename} <span style={{ color: '#999' }}>· {f.subject_code}</span></span>
                    <div>
                        <button onClick={() => editMyFile(f.fid, f.title, f.description)} style={{ ...btnStyle, backgroundColor: '#eee', color: '#333' }}>Edit</button>
                        <button onClick={() => deleteMyFile(f.fid)} style={{ ...btnStyle, backgroundColor: '#fdecec', color: '#c0392b' }}>Delete</button>
                    </div>
                </div>
            ))}

            <h3 style={{ color: '#222', marginTop: '24px', marginBottom: '10px' }}>Reports Against My Uploads</h3>
            {reportsAgainstMe.length === 0 && <p style={{ color: '#888', fontSize: '13.5px' }}>No reports filed against you.</p>}
            {reportsAgainstMe.map((r) => (
                <div key={r.rid} style={cardStyle}>
                    <span style={{ fontSize: '13.5px' }}>
                        File: <strong>{r.file_details?.title || r.file_details?.filename}</strong> · Reason: {r.reason} · Status: {r.status}
                    </span>
                </div>
            ))}
        </div>
    )
}

export default Profile