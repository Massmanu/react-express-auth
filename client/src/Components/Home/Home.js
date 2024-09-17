import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

function Home() {
    const navigate = useNavigate();

    const goToRegister = () => {
        navigate('/register');
    };

    const goToLogin = () => {
        navigate('/login');
    };

    return (
        <div className="home-container">
            <div className="overlay"></div>
            <video className="background-video" autoPlay loop muted>
                <source src="./background_video.mp4" type="video/mp4" />
            </video>
            <div className="content">
                <h1 className="home-title">Welcome to VideoX</h1>
                <p className="home-subtitle">Your ultimate solution for seamless video transcoding.</p>
                <div className="button-container">
                    <button className="trendy-button" onClick={goToRegister}>Register</button>
                    <button className="trendy-button" onClick={goToLogin}>Login</button>
                </div>
            </div>
        </div>
    );
}

export default Home;
