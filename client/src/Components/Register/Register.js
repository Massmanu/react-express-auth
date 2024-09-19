import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Register.css';

function Register() {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const urlEndpoint = 'http://myvideotranscoder.cab432.com'

    const [publicDNS, setPublicDNS] = useState('');
    useEffect(() => {
        async function fetchDNS() {
            try {
                const response = await axios.get(`${urlEndpoint}:5000/api/ec2-dns`);
                setPublicDNS(response.data.dns);
            } catch (error) {
                console.error('Error fetching public DNS:', error);
            }
        }
        fetchDNS();
    }, []);


    const handleRegister = () => {
        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        axios.post(`http://${publicDNS}:5000/register`, {
            full_name: fullName,
            email: email,
            password: password,
        })
            .then(response => alert(response.data))
            .catch(error => alert(error.response.data));
    };

    return (
        <div className="auth-container">
            <div className="auth-box">
                <h2 className="auth-title">Create Your Account</h2>
                <input
                    type="text"
                    placeholder="Full Name"
                    className="auth-input"
                    onChange={(e) => setFullName(e.target.value)}
                />
                <input
                    type="email"
                    placeholder="Email"
                    className="auth-input"
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Password"
                    className="auth-input"
                    onChange={(e) => setPassword(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Confirm Password"
                    className="auth-input"
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button className="auth-button" onClick={handleRegister}>Register</button>
            </div>
        </div>
    );
}

export default Register;
