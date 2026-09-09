import { useState } from "react"
import { supabase } from '../../lib/supabaseClient.js'

const BRANCHES = ['CS', 'EE', 'EC', 'CV', 'ME', 'IS', 'CI', 'SE', 'CD']

function CreateUser() {
    const [role, setRole] = useState('student')
    const [formData, setFormData] = useState({})
    const [loading, setLoading] = useState(false)
    const [toast, setToast] = useState(null)

    function handleChange(e) {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    function showToast(message, type) {
        setToast({ message, type })
        setTimeout(() => setToast(null), 5000)
    }

    function switchRole(newRole) {
        setRole(newRole)
        setFormData({})
    }

    async function handleSubmit() {
        setLoading(true)

        const { error } = await supabase.functions.invoke('create-user', {
            body: { role, ...formData }
        })

        setLoading(false)

        if (error) {
            showToast('Error creating user: ' + error.message, 'error')
        } else {
            showToast('User created successfully!', 'success')
            setFormData({})
        }
    }

    const inputStyle = {
        width: '100%',
        padding: '12px',
        marginBottom: '14px',
        borderRadius: '6px',
        border: '1px solid #ccc',
        boxSizing: 'border-box'
    }

    const buttonStyle = {
        padding: '12px 24px',
        borderRadius: '6px',
        border: 'none',
        cursor: 'pointer',
        fontSize: '15px'
    }

    return (
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <div style={{ display: 'flex', borderRadius: '8px', overflow: 'hidden', border: '1px solid #ccc', marginBottom: '24px' }}>
                <div
                    onClick={() => switchRole('student')}
                    style={{
                        flex: 1,
                        padding: '10px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        backgroundColor: role === 'student' ? '#333' : 'white',
                        color: role === 'student' ? 'white' : '#333'
                    }}
                >
                    Student
                </div>
                <div
                    onClick={() => switchRole('teacher')}
                    style={{
                        flex: 1,
                        padding: '10px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        backgroundColor: role === 'teacher' ? '#333' : 'white',
                        color: role === 'teacher' ? 'white' : '#333'
                    }}
                >
                    Teacher
                </div>
            </div>

            <div style={{
                backgroundColor: 'white',
                borderRadius: '10px',
                border: '1px solid #e0e0e0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                padding: '24px'
            }}>
                <h3 style={{ marginTop: 0, marginBottom: '20px' }}>
                    {role === 'student' ? 'Student Details' : 'Teacher Details'}
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
                    {role === 'student' && (
                        <>
                            <input style={inputStyle} name="usn" placeholder="USN" onChange={handleChange} value={formData.usn || ''} />
                            <input style={inputStyle} name="name" placeholder="Name" onChange={handleChange} value={formData.name || ''} />
                            <input style={inputStyle} name="email" placeholder="Email" onChange={handleChange} value={formData.email || ''} />
                            <select style={inputStyle} name="branch" onChange={handleChange} value={formData.branch || ''}>
                                <option value="" disabled>Select Branch</option>
                                {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                            </select>
                            <select style={inputStyle} name="semester" onChange={handleChange} value={formData.semester || ''}>
                                <option value="" disabled>Select Semester</option>
                                {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </>
                    )}

                    {role === 'teacher' && (
                        <>
                            <input style={inputStyle} name="empid" placeholder="EMPID" onChange={handleChange} value={formData.empid || ''} />
                            <input style={inputStyle} name="name" placeholder="Name" onChange={handleChange} value={formData.name || ''} />
                            <input style={inputStyle} name="email" placeholder="Email" onChange={handleChange} value={formData.email || ''} />
                            <select style={inputStyle} name="branch" onChange={handleChange} value={formData.branch || ''}>
                                <option value="" disabled>Select Branch</option>
                                {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                            </select>
                        </>
                    )}
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <button
                        style={{ ...buttonStyle, backgroundColor: '#333', color: 'white', flex: 1 }}
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? 'Creating...' : 'Create'}
                    </button>
                    <button
                        style={{ ...buttonStyle, backgroundColor: '#eee', color: '#333', flex: 1 }}
                        onClick={() => setFormData({})}
                    >
                        Cancel
                    </button>
                </div>
            </div>

            {toast && (
                <div style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    backgroundColor: toast.type === 'error' ? '#f8d7da' : '#d4edda',
                    color: toast.type === 'error' ? '#721c24' : '#155724',
                    padding: '12px 20px',
                    borderRadius: '6px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                }}>
                    {toast.message}
                </div>
            )}
        </div>
    )
}

export default CreateUser