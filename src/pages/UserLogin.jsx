import { useState } from "react";
import { supabase } from '../lib/supabaseClient.js'
import { useNavigate } from "react-router-dom"

function UserLogin() {
    const [identifier, setIdentifier] = useState('')
    const [email, setEmail] = useState('')
    const [role, setRole] = useState('')
    const [verifyOTP, setVerifyOTP] = useState(false)
    const [otp, setOTP] = useState('')
    const navigate = useNavigate()

    async function handleSendOTP() {
        const id = identifier.toUpperCase()

        const { data: student } = await supabase
            .from('students')
            .select('email, status')
            .eq('usn', id)
            .maybeSingle()

        let foundEmail = null
        let foundRole = null
        let foundStatus = null

        if (student) {
            foundEmail = student.email
            foundRole = 'student'
            foundStatus = student.status
        } else {
            const { data: teacher } = await supabase
                .from('teachers')
                .select('email, status')
                .eq('empid', id)
                .maybeSingle()

            if (teacher) {
                foundEmail = teacher.email
                foundRole = 'teacher'
                foundStatus = teacher.status
            }
        }

        if (!foundEmail) {
            alert('USN/EMPID NOT FOUND!')
            return
        }

        if (foundStatus === 'suspended') {
            alert('Your account is suspended. Contact admin.')
            return
        }

        if (foundStatus === 'banned') {
            alert('Your account is banned.')
            return
        }

        if (foundStatus === 'deleted') {
            alert('This account no longer exists.')
            return
        }

        const { error: otpError } = await supabase.auth.signInWithOtp({ email: foundEmail })

        if (otpError) {
            alert('OTP NOT SENT. TRY AGAIN.')
        } else {
            setEmail(foundEmail)
            setRole(foundRole)
            setVerifyOTP(true)
            alert(`OTP sent to ${foundEmail}`)
        }
    }

    async function handleVerifyOTP() {
        const { data, error } = await supabase.auth.verifyOtp({
            email: email,
            token: otp,
            type: 'email'
        })

        if (error) {
            alert('Incorrect OTP. Try again.')
        } else {
            navigate('/UserDashboard', { replace: true })
        }
    }

    const inputStyle = {
        width: '100%',
        padding: '11px 14px',
        marginBottom: '12px',
        boxSizing: 'border-box',
        borderRadius: '8px',
        border: '1px solid #ddd',
        fontSize: '14px',
        outline: 'none'
    }

    const buttonStyle = {
        width: '100%',
        padding: '11px',
        backgroundColor: '#222',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '14.5px',
        fontWeight: '600'
    }

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            backgroundColor: '#f4f4f5',
            fontFamily: 'system-ui, sans-serif'
        }}>
            <div style={{
                backgroundColor: 'white',
                padding: '36px',
                borderRadius: '14px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                width: '360px'
            }}>
                <h2 style={{ textAlign: 'center', marginBottom: '6px', color: '#222' }}>Welcome</h2>
                <p style={{ textAlign: 'center', color: '#888', fontSize: '13.5px', marginBottom: '24px' }}>
                    Sign in with your USN or EMPID
                </p>

                <input
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Enter USN / EMPID"
                    style={inputStyle}
                />
                <button onClick={handleSendOTP} style={buttonStyle}>Send OTP</button>

                {verifyOTP && (
                    <div style={{ marginTop: '16px' }}>
                        <input
                            value={otp}
                            onChange={(e) => setOTP(e.target.value)}
                            placeholder="Enter OTP"
                            style={inputStyle}
                        />
                        <button onClick={handleVerifyOTP} style={buttonStyle}>Verify OTP</button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default UserLogin