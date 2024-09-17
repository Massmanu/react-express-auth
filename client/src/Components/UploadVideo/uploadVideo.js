import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Upload.css';

function Upload() {
    const [videoFile, setVideoFile] = useState(null);
    const [fileName, setFileName] = useState(''); // New state for file name
    const [message, setMessage] = useState('');
    const [progress, setProgress] = useState(0);
    const navigate = useNavigate();

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        setVideoFile(file);
        setFileName(file ? file.name : ''); // Set the file name or clear if no file selected
    };

    const handleUpload = async (event) => {
        event.preventDefault();
        const formData = new FormData();
        formData.append('video', videoFile);

        const token = localStorage.getItem('jwtToken');

        try {
            setMessage('Uploading video...');
            const response = await axios.post('http://ec2-54-253-16-126.ap-southeast-2.compute.amazonaws.com:5000/upload', formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            setMessage('Video uploaded and transcoding started...');
            listenForProgressUpdates();

        } catch (error) {
            setMessage('There was an error uploading the video');
            console.error('Error:', error);
        }
    };

    const listenForProgressUpdates = () => {
        const eventSource = new EventSource('http://ec2-54-253-16-126.ap-southeast-2.compute.amazonaws.com:5000/progress');

        eventSource.onmessage = (event) => {
            const progressPercent = parseFloat(event.data);
            setProgress(progressPercent);

            if (progressPercent >= 100) {
                setMessage('Transcoding completed');
                eventSource.close();
            } else {
                setMessage(`Transcoding in progress... ${progressPercent}%`);
            }
        };

        eventSource.onerror = () => {
            eventSource.close();
        };
    };

    return (
        <div className="upload-container">
            <div className="upload-box">
                <h1>Upload Video</h1>
                <form onSubmit={handleUpload}>
                    <label className="upload-label" htmlFor="file-input">
                        Choose a file
                    </label>
                    <input id="file-input" type="file" accept="video/*" onChange={handleFileChange} required />
                    {fileName && <p className="file-name">{fileName}</p>} {/* Display selected file name */}
                    <button className="upload-button" type="submit" disabled={progress > 0 && progress < 100}>
                        {progress > 0 && progress < 100 ? `Transcoding... (${progress}%)` : 'Upload'}
                    </button>
                </form>
                {message && <p className="upload-message">{message}</p>}
                <button className="welcome-btn" onClick={() => navigate('/videoplayer')}>
                    Go to Video Playback Page
                </button>
            </div>
        </div>
    );
}

export default Upload;
