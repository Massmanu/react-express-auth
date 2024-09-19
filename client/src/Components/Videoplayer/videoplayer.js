import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './videoplayer.css';

function VideoPlayer() {
    const [videos, setVideos] = useState([]);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [playingIndex, setPlayingIndex] = useState(null);

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

    useEffect(() => {
        const fetchVideos = async () => {
            try {
                const token = localStorage.getItem('jwtToken');
                const response = await axios.get(`http://${publicDNS}:5000/videos`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                console.log('Fetched videos:', response.data); // Debugging line
                setVideos(response.data);
            } catch (error) {
                console.error('Error fetching videos:', error);
            }
        };

        fetchVideos();
    }, []);

    const handleVideoSelection = (video, index) => {
        setSelectedVideo(video);
        setPlayingIndex(index);
    };

    const handleDelete = async (videoId) => {
        console.log('Deleting video with ID:', videoId); // Debugging line
        try {
            const token = localStorage.getItem('jwtToken');
            await axios.delete(`http://${publicDNS}:5000/videos/${videoId}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            // Remove the video from the list after deletion
            setVideos(videos.filter(video => video.id !== videoId));
            setSelectedVideo(null); // Deselect video if it's being deleted
        } catch (error) {
            console.error('Error deleting video:', error);
        }
    };

    return (
        <div className='v-p-c'>
            <div className="video-player-container">
                <h1 className="title">Video Player</h1>
                <div className="video-grid">
                    {videos.map((video, index) => (
                        <React.Fragment key={index}>
                            <div
                                className="video-card"
                                onClick={() => handleVideoSelection(video, index)}
                            >
                                <p>
                                    <i className="fas fa-video"></i> {video.original_name} - {video.resolution}p
                                </p>
                                <button
                                    className="delete-button"
                                    onClick={(e) => {
                                        e.stopPropagation(); // Prevent the click event from selecting the video
                                        handleDelete(video.id); // Ensure `id` is correctly passed here
                                    }}
                                >
                                    Delete
                                </button>
                            </div>
                            {selectedVideo === video && (
                                <div
                                    className={`video-player-card ${playingIndex === index ? 'active' : ''}`}
                                >
                                    <h2 className="playing-title">
                                        {selectedVideo.original_name} - {selectedVideo.resolution}p
                                    </h2>
                                    <video controls className="video-element">
                                        <source src={selectedVideo.url} type="video/mp4" />
                                        Your browser does not support the video tag.
                                    </video>
                                </div>
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default VideoPlayer;
