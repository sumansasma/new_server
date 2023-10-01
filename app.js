const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const app = express();
const port = 3000;

// Enable CORS for all routes
app.use(cors());

// Define the storage for uploaded video files using Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Specify the directory where uploaded videos will be stored
        cb(null, path.join(__dirname, '/opt/render/project/src/opt/render/project/src/uploads/videos'));
    },
    filename: function (req, file, cb) {
        // Generate a unique file name for the uploaded video
        cb(null, file.originalname);
    },
});

// Initialize Multer with the storage configuration
const upload = multer({
    storage: storage,
}).single('videoFile'); // 'videoFile' should match the name attribute in your form input

// Serve static files (CSS, JS, etc.) from the 'public_html' directory
app.use(express.static(path.join(__dirname, 'public_html')));

// Serve the work.html file when accessing the root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public_html', 'work.html'));
});

// Route to handle video uploads
app.post('/upload-video', (req, res) => {
    upload(req, res, (err) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error uploading video.');
        } else {
            // Successfully uploaded the video
            res.send("Video Uploaded Successfully!");
        }
    });
});

// Route to handle video uploads
app.post('/upload-video', (req, res) => {
    upload(req, res, (err) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error uploading video.');
        } else {
            // Successfully uploaded the video
            const videoFileName = req.file.originalname;
            res.send({ message: "Video Uploaded Successfully!", videoFileName });
        }
    });
});

// Route to serve a list of all video file names in the /uploads/videos/ directory
app.get('/all-videos', (req, res) => {
    const videosDirectory = path.join(__dirname, 'uploads/videos');

    // Read the contents of the videos directory
    fs.readdir(videosDirectory, (err, files) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
            return;
        }

        // Filter out non-video files (e.g., directories)
        const videoFiles = files.filter(file => {
            const filePath = path.join(videosDirectory, file);
            return fs.statSync(filePath).isFile() && file.endsWith('.mp4');
        });

        // Respond with a list of video file names
        res.json({ videos: videoFiles });
    });
});

// // Route to serve individual video files
// app.get('/videos/:videoFileName', (req, res) => {
//     const videoFileName = req.params.videoFileName;
//     const videoPath = path.join(__dirname, 'uploads', 'videos', videoFileName);

//     fs.stat(videoPath, (err, stats) => {
//         if (err || !stats.isFile()) {
//             console.error('Error:', err);
//             res.status(404).send('Video not found');
//             return;
//         }

//         // Serve the video file
//         res.sendFile(videoPath);
//     });
// });


// Route to serve all video files in the /uploads/videos/ directory
app.get('/uploads/videos/:videoFileName', (req, res) => {
    const videoFileName = req.params.videoFileName;
    const videoPath = path.join(__dirname, 'uploads/videos', videoFileName);

    fs.stat(videoPath, (err, stats) => {
        if (err || !stats.isFile()) {
            console.error('Error:', err);
            res.status(404).send('Video not found');
            return;
        }

        // Serve the video file
        const videoStream = fs.createReadStream(videoPath);
        res.writeHead(200, {
            'Content-Type': 'video/mp4',
        });
        videoStream.pipe(res);
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
