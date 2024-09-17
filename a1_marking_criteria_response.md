Assignment 1 - Web Server - Response to Criteria
================================================

Overview
------------------------------------------------

- **Name:**Manoj Mariyappa*
- **Student number:**N11775637*
- **Application name:**Videoxx*
- **Two line description:**This application provides a secure login system where users can upload, transcode and view videos, with video data stored in a MySQL database and authenticated using JWT.* 


Core criteria
------------------------------------------------

### Docker image

- **ECR Repository name:**

    -Backend : react-express-auth-backend
    -Database: react-express-auth-db
    -FrontEnd: react-express-auth-frontend

CONTAINER ID   IMAGE                                                                     COMMAND                  CREATED         STATUS         PORTS                  NAMES
e225fae0be23   react-express-auth-backend                                                "docker-entrypoint.s…"   2 minutes ago   Created                               n11775637-my-react-app-backend
dedda02a57eb   901444280953.dkr.ecr.ap-southeast-2.amazonaws.com/react-express-auth-db   "docker-entrypoint.s…"   2 minutes ago   Created                               react-express-auth-db-1
fc54e6cbff70   react-express-auth-frontend                                               "/docker-entrypoint.…"   2 minutes ago   Up 2 minutes   0.0.0.0:3000->80/tcp   n11775637-my-react-app-frontend
- **Video timestamp:**
- **Relevant files:**
    - client/docker
    - server/docker
    - /docker-compose.yml

### Docker image running on EC2

- **EC2 instance ID:**i-08be41a61db6282d0*
- **Video timestamp:**
    - 5.10

### User login functionality

- **One line description:**Secure login system with JWT authentication..User able to register and be able to login*
- **Video timestamp:**
    - 0.10
- **Relevant files:**
    - server/index.js
    - src/login/login.js

### User dependent functionality

- **One line description:**Users can login into independent account*
- **Video timestamp:**
    -0.50
- **Relevant files:**
    - server/index.js
    - src/login/login.js

### Web client

- **One line description:**React-based single-page application with video upload and playback features.*
- **Video timestamp:**
        -1
    - 
- **Relevant files:**
    - client/

### REST API

- **One line description:**REST API with endpoints for user authentication, video upload, video transcoding,live progress and video retrieval.*
- **Video timestamp:** 
    - 7 -9
- **Relevant files:**
    - server/index.js

### Two kinds of data

#### First kind

- **One line description*:**Video files uploaded by users.*
- **Type:**Unstructured*
- **Rationale:** Video files are stored as binary data and are too large to be managed efficiently in a relational database.*
- **Video timestamp:**
    - 7.2
- **Relevant files:**
    - server/index.js

#### Second kind

- **One line description:**User credentials and video data.*
- **Type:**Structured*
- **Rationale:**Storing user credentials and metadata in MySQL allows for efficient querying and user-specific access control.*
- **Video timestamp:**
    - 8.26
    - 9
- **Relevant files:**
  - server/index.js

### CPU intensive task

- **One line description:**Video transcoding performed after video upload to ensure compatibility with various playback resolutions.*
- **Video timestamp:** 
    - 5
- **Relevant files:**
    - server/index.js

### CPU load testing method

- **One line description:**Script to simulate multiple users uploading videos simultaneously, monitored via htop on the EC2 instance.*
- **Video timestamp:** 
    - 2.3
- **Relevant files:**
    - server/index.js

Additional criteria
------------------------------------------------

### Extensive REST API features

- **One line description:**used rest api features for login, video upload, transcode,to get live progress, and display transcoded video* 
- **Video timestamp:**
    - 8
- **Relevant files:**
    - server/index.js


### Use of external API(s)

- **One line description:** i have used a single external api in the home page for the quote of the day* 
- **Video timestamp:**
    - 1.02
    - 9.5
- **Relevant files:**
    - src/home/home.js


### Extensive web client features

- **One line description:**i have used live user registerion for new user and live progress status of the video transcoding and videoplayer page for video playing*
- **Video timestamp:**
    0.00 -
- **Relevant files:**
    - src/videoplayer
    - src/login
    - src/registration
    - src/upload


### Sophisticated data visualisations

- **One line description:** added styles to all the pages to make Sophisticated data visualisations and in video playback page i have create video cards to play video in Sophisticated way.
- **Video timestamp:**
    - 0.20
    - 3.55
- **Relevant files:**
    - client/src/components


### Additional kinds of data

- **One line description:** Not attempted
- **Video timestamp:**
- **Relevant files:**
    - 


### Significant custom processing

- **One line description:**  Used ffmep to transcodes the video customly the video is transcoded into many custom resloution like 360p, 480p, 720p
- **Video timestamp:** 
    - 3.20
- **Relevant files:**
    - server/index.js


### Live progress indication

- **One line description:* after the video is transcoded the user can see the live progress of transcoding process* 
- **Video timestamp:** 
    - 2
    - 3.51
    - 8
- **Relevant files:**
    - server/index.js
    - client/videoplayer/videoplayer.js


### Infrastructure as code

- **One line description:**Managed using Docker Compose to orchestrate multiple containers (backend, frontend, database).* 
- **Video timestamp:** 
- **Relevant files:**
    - /docker-compose.yml*
    - 


### Other

- **One line description:** Not attempted
- **Video timestamp:**
- **Relevant files:**
    - 
