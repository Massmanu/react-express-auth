import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';



function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const navigate = useNavigate();

    const [publicDNS, setPublicDNS] = useState('');
    useEffect(() => {
        async function fetchDNS() {
            try {
                const response = await axios.get('/api/ec2-dns');
                setPublicDNS(response.data.dns);
            } catch (error) {
                console.error('Error fetching public DNS:', error);
            }
        }
        fetchDNS();
    }, []);

    const handleLogin = () => {
        axios.post(`http://${publicDNS}:5000/login`, {
            email: email,
            password: password,
        })
            .then(response => {
                const token = response.data.token;
                localStorage.setItem('jwtToken', token)
                console.log('Login successfull, Jwt token:', token)
                alert('Login successful');
                navigate('/welcome', { state: { email } });


            })
            .catch(error => {
                console.error('Error logging in:', error.response ? error.response.data : error.message);
            });

    };

    return (
        <div className="auth-container">
            <div className="auth-box">
                <h2>Login</h2>
                <h2>{publicDNS}</h2>
                <input
                    type="text"
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
                <button className="auth-button" onClick={handleLogin}>Login</button>
            </div>
        </div>
    );
}

export default Login;
