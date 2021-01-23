const express = require('express')
const http = require('http')
const socketio = require('socket.io')
const cors = require('cors');
const router = require('./router');

const PORT = process.env.PORT || 4000

const app = express()
const server = http.createServer(app)
const io = socketio(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
    }
});

app.use(cors());

io.on('connection', socket => {
    console.log('New client connected');

    

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
})

app.use('/', router);

server.listen(PORT, () => console.log(`Listening on port ${PORT}...`))