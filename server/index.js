const express = require('express');
const mysql = require('mysql2/promise'); // Using promise version for async/await
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const { SSMClient, GetParameterCommand } = require('@aws-sdk/client-ssm');

const app = express();
const corsOptions = {

    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.use(express.json());

// MySQL connection
const db = mysql.createPool({
    host: 'db',
    user: 'root',
    password: '3188',
    database: 'video_transcoding_db'
});
db.getConnection()
    .then(() => {
        console.log('MySQL Connected...');
    })
    .catch(err => {
        console.error('MySQL connection error:', err.stack);
    });
// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });


const ssmClient = new SSMClient({ region: 'ap-southeast-2' });

app.get('/api/ec2-dns', async (req, res) => {
    try {
        const response = await ssmClient.send(
            new GetParameterCommand({
                Name: '/n11775637/my-ec2-instance-ip-address',
                WithDecryption: true,
            })
        );
        res.json({ dns: response.Parameter.Value });
        console.log(response.Parameter.Value);
    } catch (error) {
        console.error('Error fetching DNS from SSM:', error);
        res.status(500).json({ error: 'Failed to fetch EC2 DNS' });
    }
});



// Register route
app.post('/register', async (req, res) => {
    const { full_name, email, password } = req.body;

    if (!full_name || !email || !password) {
        return res.status(400).send('All fields are required');
    }

    const hashedPassword = bcrypt.hashSync(password, 8);

    try {
        // Check if email already exists
        const [existingUser] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(400).send('Email already in use');
        }

        // Insert new user
        await db.query(
            'INSERT INTO users (full_name, email, password) VALUES (?, ?, ?)',
            [full_name, email, hashedPassword]
        );

        res.status(200).send('User registered successfully');
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).send('Server error');
    }
});



// Login route
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send('Email and password are required');
    }

    db.execute('SELECT * FROM users WHERE email = ?', [email])
        .then(([rows]) => {
            if (rows.length === 0) {
                return res.status(404).send('User not found');
            }

            const user = rows[0];
            const isValidPassword = bcrypt.compareSync(password, user.password);

            if (!isValidPassword) {
                return res.status(401).send('Invalid password');
            }

            const token = jwt.sign({ id: user.id }, 'secret', { expiresIn: '10h' });
            res.status(200).json({ token });
        })
        .catch(err => {
            console.error('Database query error:', err);
            res.status(500).send('Server error');
        });
});

// Middleware to authenticate JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.header('Authorization');
    console.log('Authorization Header:', authHeader); // Log the header

    const token = authHeader?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'Access Denied' });

    jwt.verify(token, 'secret', (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid token' });
        req.user = user;
        next();
    });
};

let clients = [];

const sendProgressUpdate = (percent) => {
    clients.forEach((client) => {
        if (client && client.res) {
            client.res.write(`data: ${percent}\n\n`);
        }
    });

};

app.get('/progress', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders(); // flush the headers to establish SSE with the client

    const clientId = Date.now();
    const newClient = {
        id: clientId,
        res,
    };
    clients.push(newClient);

    // Handle client disconnect
    req.on('close', () => {
        clients = clients.filter(client => client.id !== clientId);
        res.end();
    });
});



// Upload and transcode video
app.post('/upload', authenticateToken, upload.single('video'), async (req, res) => {
    const { filename, path: tempPath, originalname } = req.file;
    const videoPath = `uploads/${filename}`;
    const resolutions = [360, 480, 720];

    // Rename the uploaded file
    fs.renameSync(tempPath, videoPath);

    try {
        const [result] = await db.execute(
            'INSERT INTO videos (original_name, file_name) VALUES (?, ?)',
            [originalname, filename]
        );


        console.log('DB Insert Result:', result);
        const videoId = result.insertId;

        if (!videoId) {
            throw new Error("Failed to retrieve video ID from database");
        }

        // Return videoId immediately after the video is uploaded
        res.status(200).json({ videoId, message: 'Video uploaded and transcoding started' });

        // Transcode video into different resolutions
        const transcodePromises = resolutions.map((resolution) =>
            new Promise((resolve, reject) => {
                const outputVideoPath = `uploads/${filename}_${resolution}p.mp4`;
                ffmpeg(videoPath)
                    .output(outputVideoPath)
                    .videoCodec('libx264')
                    .size(`${resolution}x?`)
                    .on('progress', (progress) => {
                        sendProgressUpdate(progress.percent.toFixed(2));
                    })
                    .on('end', async () => {
                        await db.execute(
                            'INSERT INTO transcoded_videos (video_id, resolution, file_name) VALUES (?, ?, ?)',
                            [videoId, resolution, `${filename}_${resolution}p.mp4`]
                        );
                        resolve();
                    })
                    .on('error', reject)
                    .run();
            })
        );

        await Promise.all(transcodePromises);

        console.log('Video transcoded successfully');
    } catch (error) {
        console.error('Error during upload or transcoding:', error);

    }
});


// Route to get the list of videos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/videos', authenticateToken, async (req, res) => {
    try {
        const [rows] = await db.execute(
            'SELECT videos.original_name, transcoded_videos.file_name, transcoded_videos.resolution FROM transcoded_videos INNER JOIN videos ON transcoded_videos.video_id = videos.id'
        );

        // Add the URL to the video file for each video
        const videosWithUrls = rows.map(video => ({
            ...video,
            url: `http://localhost:5000/uploads/${video.file_name}`
        }));
        console.log('Videos with URLs:', videosWithUrls);
        res.status(200).json(videosWithUrls);
    } catch (error) {
        console.error('Error fetching videos:', error);
        res.status(500).send('An error occurred while fetching videos');
    }
});

// Delete video endpoint
// Delete video by file name
app.delete('/videos/:fileName', authenticateToken, async (req, res) => {
    const { fileName } = req.params;

    try {
        // Delete from transcoded_videos
        await db.execute('DELETE FROM transcoded_videos WHERE file_name = ?', [fileName]);

        // Delete from videos table
        await db.execute('DELETE FROM videos WHERE file_name = ?', [fileName]);

        // Delete the video files from the server
        const filePath = path.join(__dirname, 'uploads', fileName);
        const resolutions = [360, 480, 720];
        fs.unlinkSync(filePath); // Delete original file

        resolutions.forEach(resolution => {
            const transcodedFilePath = path.join(__dirname, 'uploads', `${fileName}_${resolution}p.mp4`);
            if (fs.existsSync(transcodedFilePath)) {
                fs.unlinkSync(transcodedFilePath); // Delete transcoded files
            }
        });

        res.status(200).send('Video and its transcoded versions deleted successfully');
    } catch (error) {
        console.error('Error deleting video:', error);
        res.status(500).send('An error occurred while deleting the video');
    }
});




app.listen(5000, () => console.log('Server started on port 5000'));
