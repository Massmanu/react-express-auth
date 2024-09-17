import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import './Welcome.css';
import axios from 'axios';

function Welcome() {
    const navigate = useNavigate();
    const location = useLocation();
    const [quote, setQuote] = useState('');
    const { email } = location.state || {};

    const handleUpload = () => {
        navigate('/upload');
    };

    const handleLogout = () => {
        // Clear the JWT token from localStorage or any other storage
        localStorage.removeItem('jwtToken');
        // Redirect to home page
        navigate('/');
    };

    useEffect(() => {
        const fetchQuote = async () => {
            try {
                const response = await axios.get('https://api.quotable.io/random');
                setQuote(response.data.content); // `content` field contains the quote text
            } catch (error) {
                console.error('Error fetching quote:', error);
            }
        };
        fetchQuote();
    }, []);

    const handlePlay = () => {
        navigate('/videoplayer');
    };

    return (
        <div className="welcome-container">
            <button className="logout-button" onClick={handleLogout}>Logout</button>
            <div className="welcome-content">
                <h1>Welcome, {email}!</h1>
                {quote && (
                    <div className="quote-container">
                        <p>Quote of the day</p>
                        <p className="quote-text">{quote}</p>
                    </div>
                )}
                <p>You have successfully logged in. What would you like to do next?</p>
                <button onClick={handleUpload}>Upload a Video</button>
                <button onClick={handlePlay}>Play Transcoded Videos</button>
            </div>
        </div>
    );
}

export default Welcome;
