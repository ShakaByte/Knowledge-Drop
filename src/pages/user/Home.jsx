import { useState, useEffect } from "react"
import { supabase } from '../../lib/supabaseClient.js'
import { useNavigate } from "react-router-dom"

const BRANCHES = ['CS', 'EE', 'EC', 'CV', 'ME', 'IS', 'CI', 'SE', 'CD']

function Home() {
    const [subjects, setSubjects] = useState([])
    const [search, setSearch] = useState('')
    const [branchFilter, setBranchFilter] = useState('')
    const [semesterFilter, setSemesterFilter] = useState('')
    const navigate = useNavigate()
    const [stats, setStats] = useState({ totalFiles: 0, totalSubjects: 0, unreadNotifs: 0 })

    useEffect(() => {
        loadDefaultsAndSubjects()
    }, [])

    useEffect(() => {
        if (branchFilter && semesterFilter) {
            fetchSubjects(branchFilter, semesterFilter)
        }
    }, [branchFilter, semesterFilter])

    async function loadDefaultsAndSubjects() {
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

        if (branch) setBranchFilter(branch)
        if (semester) setSemesterFilter(String(semester))

        if (branch && semester) {
            fetchSubjects(branch, semester)
            loadStats(branch, semester, user.id)
        }
    }

    async function fetchSubjects(branch, semester) {
        const { data } = await supabase
            .from('subjects')
            .select('*')
            .eq('branch', branch)
            .eq('semester', semester)

        setSubjects(data || [])
    }

    async function loadStats(branch, semester, userId) {
        const { count: fileCount } = await supabase
            .from('file_details')
            .select('*', { count: 'exact', head: true })
            .eq('branch', branch)
            .eq('semester', semester)
            .eq('status', 'active')

        const { count: subjectCount } = await supabase
            .from('subjects')
            .select('*', { count: 'exact', head: true })
            .eq('branch', branch)
            .eq('semester', semester)

        const { count: unreadCount } = await supabase
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('is_read', false)

        setStats({
            totalFiles: fileCount || 0,
            totalSubjects: subjectCount || 0,
            unreadNotifs: unreadCount || 0
        })
    }

    const filteredSubjects = subjects.filter(s =>
        s.subject_name.toLowerCase().includes(search.toLowerCase()) ||
        s.subject_code.toLowerCase().includes(search.toLowerCase())
    )

    const selectStyle = {
        padding: '9px 12px',
        borderRadius: '7px',
        border: '1px solid #ddd',
        fontSize: '13.5px',
        marginRight: '10px',
        backgroundColor: '#fff'
    }

    return (
        <div>
            <h4 style={{ marginTop: 0, marginBottom: '14px', color: '#222' }}>Subjects</h4>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '18px' }}>
                <select value={branchFilter} onChange={(e) => setBranchFilter(e.target.value)} style={selectStyle}>
                    {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                </select>

                <select value={semesterFilter} onChange={(e) => setSemesterFilter(e.target.value)} style={selectStyle}>
                    {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Sem {s}</option>)}
                </select>

                <input
                    placeholder="Search subjects..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ padding: '9px 12px', borderRadius: '7px', border: '1px solid #ddd', fontSize: '13.5px', flex: 1, minWidth: '180px' }}
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
                {filteredSubjects.map((s) => (
                    <div
                        key={s.subject_code}
                        style={{
                            border: '1px solid #eaeaea',
                            borderRadius: '10px',
                            padding: '14px 16px',
                            cursor: 'pointer',
                            backgroundColor: '#fafafa',
                            transition: 'box-shadow 0.15s ease, transform 0.1s ease'
                        }}
                        onClick={() => navigate(`/UserDashboard/subject/${s.subject_code}`)}
                        onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 3px 10px rgba(0,0,0,0.07)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                        onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none' }}
                    >
                        <div style={{ fontWeight: '600', fontSize: '14.5px', color: '#222' }}>{s.subject_name}</div>
                        <div style={{ fontSize: '12.5px', color: '#888', marginTop: '4px' }}>{s.subject_code}</div>
                    </div>
                ))}
            </div>

            <div style={{
                marginTop: '28px',
                border: '1px solid #eaeaea',
                borderRadius: '12px',
                padding: '18px 20px',
                backgroundColor: '#fafafa'
            }}>
                <h4 style={{ marginTop: 0, marginBottom: '12px', color: '#222' }}>Quick Stats</h4>
                <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                    <div>
                        <div style={{ fontSize: '22px', fontWeight: '700', color: '#222' }}>{stats.totalFiles}</div>
                        <div style={{ fontSize: '12.5px', color: '#888' }}>Files this semester</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '22px', fontWeight: '700', color: '#222' }}>{stats.totalSubjects}</div>
                        <div style={{ fontSize: '12.5px', color: '#888' }}>Subjects</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '22px', fontWeight: '700', color: '#222' }}>{stats.unreadNotifs}</div>
                        <div style={{ fontSize: '12.5px', color: '#888' }}>Unread notifications</div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Home