const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const cors = require('cors');
const router = require('./router');

const {joinRoom, playersInRoom} = require('./rooms');
const Board = require('./board');

const PORT = process.env.PORT || 4000;

const app = express();
const server = http.createServer(app);
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
    let currentRoom = null;

    
    socket.on('joinRoom', ({name, room}, callback) => {
        currentRoom = joinRoom({id: socket.id, room, name});

        socket.join(room);
        
        numOfPlayers = playersInRoom(room);
        console.log(numOfPlayers);

        if (numOfPlayers === 1){
            socket.emit('waiting', {message: 'Waiting for other player...'});
        } else if (numOfPlayers === 2){
            currentRoom.board = new Board();
            socket.emit('newGame', {piece: '🎀', turn: false, message: 'Opponent\'s turn: ❤️', opponent: currentRoom.players[0].name});
            socket.broadcast.to(room).emit('newGame', {piece: '❤️', turn: true, message: "Your turn: ❤️", opponent: name});
        } else {
            currentRoom.players.pop();
            socket.leave(room);
            socket.emit('roomIsFull', 'room is full');
        }
        callback(currentRoom);
    });

    socket.on('move', ({index, piece}) => {
        if (currentRoom.board.storeMove(index, piece)){
            if(currentRoom.board.calculateWinner(currentRoom.board.squares)){
                io.to(currentRoom.name).emit('winner', {boardState: currentRoom.board.squares, winner: currentRoom.board.turn});
            } else if(currentRoom.board.calculateDraw()){
                io.to(currentRoom.name).emit('draw', {boardState: currentRoom.board.squares});
            } else {
                currentRoom.board.switch();
                io.to(currentRoom.name).emit('update', {boardState: currentRoom.board.squares, nextPiece: currentRoom.board.turn});
            }
        } else {
            console.log('Did not store move, board:', currentRoom.board);
        }
    });

    socket.on('disconnect', () => {
        if(currentRoom){
            socket.leave(currentRoom.name);
        }
    });
})

app.use('/', router);

server.listen(PORT, () => console.log(`Listening on port ${PORT}...`))