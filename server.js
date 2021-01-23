const express = require('express')
const http = require('http')
const socketio = require('socket.io')
const cors = require('cors');
const router = require('./router');

const {joinRoom, playersInRoom} = require('./rooms');

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

    
    socket.on('joinRoom', ({name, room}, callback) => {
        console.log('handling joinRoom event on the server side');
        const currentRoom = joinRoom({id: socket.id, room, name});

        socket.join(currentRoom);
        
        numOfPlayers = playersInRoom(room);

        if (numOfPlayers === 1){
            socket.emit('waiting', {message: 'Waiting for otherqweqweqw player...'});
        } else if (numOfPlayers === 2){
            socket.emit('newGame', {piece: 'O', turn: false, message: 'Opponent\'s turn: ❤️'});
            socket.broadcast.to(currentRoom).emit('newGame', {piece: '❤️', turn: true, message: "Your turn: ❤️"});
        } else {

        }
        
        callback(currentRoom);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
})

app.use('/', router);

server.listen(PORT, () => console.log(`Listening on port ${PORT}...`))