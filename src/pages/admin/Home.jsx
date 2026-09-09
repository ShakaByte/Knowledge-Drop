import { useState, useEffect } from "react"
import { supabase } from '../../lib/supabaseClient.js'
import { useNavigate } from "react-router-dom"

const BRANCHES = ['CS', 'EE', 'EC', 'CV', 'ME', 'IS', 'CI', 'SE', 'CD']

function Home() {
    const [studentCount, setStudentCount] = useState(0)
    const [teacherCount, setTeacherCount] = useState(0)
    const [pendingReports, setPendingReports] = useState(0)
    const [recentFiles, setRecentFiles] = useState([])
    const [recentReports, setRecentReports] = useState([])
    const [users, setUsers] = useState([])
    const [roleFilter, setRoleFilter] = useState('')
    const [branchFilter, setBranchFilter] = useState('')
    const [semesterFilter, setSemesterFilter] = useState('')
    const [branchCounts, setBranchCounts] = useState({})
    const navigate = useNavigate()

    useEffect(() => {
        fetchCounts()
        fetchRecentActivity()
        fetchUsers()
    }, [])

    async function fetchCounts() {
        const { count: students } = await supabase.from('students').select('*', { count: 'exact', head: true })
        const { count: teachers } = await supabase.from('teachers').select('*', { count: 'exact', head: true })
        const { count: reports } = await supabase.from('report_details').select('*', { count: 'exact', head: true }).eq('status', 'pending')

        setStudentCount(students || 0)
        setTeacherCount(teachers || 0)
        setPendingReports(reports || 0)
    }

    async function fetchRecentActivity() {
        const { data: files } = await supabase
            .from('file_details')
            .select('title, filename, uploaded_at')
            .order('uploaded_at', { ascending: false })
            .limit(5)

        const { data: reports } = await supabase
            .from('report_details')
            .select('reason, reported_at, status')
            .order('reported_at', { ascending: false })
            .limit(5)

        setRecentFiles(files || [])
        setRecentReports(reports || [])
    }

    async function fetchUsers() {
        const { data: students } = await supabase
            .from('students')
            .select('usn, name, email, branch, semester, status')

        const { data: teachers } = await supabase
            .from('teachers')
            .select('empid, name, email, branch, status')

        const combined = [
            ...(students || []).map(s => ({ ...s, id: s.usn, role: 'student' })),
            ...(teachers || []).map(t => ({ ...t, id: t.empid, role: 'teacher', semester: '-' }))
        ]

        setUsers(combined)

        const counts = {}
        combined.forEach(u => {
            counts[u.branch] = (counts[u.branch] || 0) + 1
        })
        setBranchCounts(counts)
    }

    const filteredUsers = users.filter(u => {
        if (roleFilter && u.role !== roleFilter) return false
        if (branchFilter && u.branch !== branchFilter) return false
        if (semesterFilter && String(u.semester) !== semesterFilter) return false
        return true
    })

    const cardStyle = {
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '10px',
        border: '1px solid #e0e0e0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        flex: 1,
        textAlign: 'center'
    }

    const panelStyle = {
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '10px',
        border: '1px solid #e0e0e0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        flex: 1
    }

    const buttonStyle = {
        flex: 1,
        padding: '16px',
        backgroundColor: '#333',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '15px'
    }

    const selectStyle = {
        padding: '8px 12px',
        borderRadius: '6px',
        border: '1px solid #ccc',
        marginRight: '10px'
    }

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
            <h2 style={{ marginBottom: '20px' }}>Dashboard Overview</h2>

            <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                <div style={cardStyle}>
                    <h3 style={{ margin: 0, fontSize: '28px' }}>{studentCount}</h3>
                    <p style={{ color: '#666' }}>Students</p>
                </div>
                <div style={cardStyle}>
                    <h3 style={{ margin: 0, fontSize: '28px' }}>{teacherCount}</h3>
                    <p style={{ color: '#666' }}>Teachers</p>
                </div>
                <div style={{ ...cardStyle, backgroundColor: pendingReports > 0 ? '#fff3cd' : 'white' }}>
                    <h3 style={{ margin: 0, fontSize: '28px' }}>{pendingReports}</h3>
                    <p style={{ color: '#666' }}>Pending Reports</p>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                <div style={panelStyle}>
                    <h4>Recent Uploads</h4>
                    {recentFiles.length === 0 && <p style={{ color: '#999' }}>No uploads yet.</p>}
                    {recentFiles.map((f, i) => (
                        <div key={i} style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>
                            {f.title || f.filename}
                            <div style={{ fontSize: '12px', color: '#999' }}>
                                {new Date(f.uploaded_at).toLocaleString()}
                            </div>
                        </div>
                    ))}
                </div>

                <div style={panelStyle}>
                    <h4>Recent Reports</h4>
                    {recentReports.length === 0 && <p style={{ color: '#999' }}>No reports filed.</p>}
                    {recentReports.map((r, i) => (
                        <div key={i} style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>
                            {r.reason} <span style={{ fontSize: '12px', color: '#999' }}>({r.status})</span>
                        </div>
                    ))}
                </div>

                <div style={panelStyle}>
                    <h4>Users by Branch</h4>
                    {Object.entries(branchCounts).map(([branch, count]) => (
                        <div key={branch} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #eee' }}>
                            <span>{branch}</span>
                            <span style={{ fontWeight: 'bold' }}>{count}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                <button style={buttonStyle} onClick={() => navigate('/AdminDashboard/create')}>+ Create User</button>
                <button style={buttonStyle} onClick={() => navigate('/AdminDashboard/reports')}>View Reports</button>
                <button style={buttonStyle} onClick={() => navigate('/AdminDashboard/files')}>Manage Files</button>
            </div>

            <div style={panelStyle}>
                <h4>All Users</h4>

                <div style={{ marginBottom: '15px' }}>
                    <select style={selectStyle} value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                        <option value="">All Roles</option>
                        <option value="student">Student</option>
                        <option value="teacher">Teacher</option>
                    </select>

                    <select style={selectStyle} value={branchFilter} onChange={(e) => setBranchFilter(e.target.value)}>
                        <option value="">All Branches</option>
                        {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>

                    <select style={selectStyle} value={semesterFilter} onChange={(e) => setSemesterFilter(e.target.value)}>
                        <option value="">All Semesters</option>
                        {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid #ddd', textAlign: 'left' }}>
                            <th style={{ padding: '10px' }}>Name</th>
                            <th style={{ padding: '10px' }}>USN/EMPID</th>
                            <th style={{ padding: '10px' }}>Email</th>
                            <th style={{ padding: '10px' }}>Branch</th>
                            <th style={{ padding: '10px' }}>Semester</th>
                            <th style={{ padding: '10px' }}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(u => (
                            <tr key={u.id} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '10px' }}>{u.name}</td>
                                <td style={{ padding: '10px' }}>{u.id}</td>
                                <td style={{ padding: '10px', color: '#666' }}>{u.email}</td>
                                <td style={{ padding: '10px' }}>{u.branch}</td>
                                <td style={{ padding: '10px' }}>{u.semester}</td>
                                <td style={{ padding: '10px', fontWeight: 'bold', color: u.status === 'active' ? 'green' : 'red', textTransform: 'capitalize' }}>
                                    {u.status}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default Home