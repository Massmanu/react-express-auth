import React from 'react';
import { BrowserRouter as Router, Route, Routes, } from 'react-router-dom';
import Register from './Components/Register/Register';
import Login from './Components/Login/Login';
import Welcome from './Components/Welcome/Welcome';
import Upload from './Components/UploadVideo/uploadVideo';
import VideoPlayer from './Components/Videoplayer/videoplayer';
import Home from './Components/Home/Home';

function App() {
  return (
    <>


      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path='/upload' element={<Upload />} />
        <Route path='/videoplayer' element={<VideoPlayer />} />
      </Routes>


    </>

  );
}

export default App;
