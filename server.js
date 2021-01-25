const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const cors = require('cors');
const router = require('./router');

const {joinRoom, playersInRoom} = require('./rooms');

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

determinePiece = (room) => {
    if(room){
        return room.players[0].piece === '❤️' ? '🎀' : '❤️';
    }
    return null;
}

io.on('connection', socket => {
    console.log('New client connected');
    let currentRoom = null;

    
    socket.on('joinRoom', ({name, room}, callback) => {
        currentRoom = joinRoom({id: socket.id, room, name});

        socket.join(currentRoom.name);
        
        // number of players in the room after this socket joined the lobby
        numOfPlayers = playersInRoom(room);
        console.log(numOfPlayers);

        if (numOfPlayers === 1){
            console.log('Waiting...');
            socket.emit('waiting', {boardState: currentRoom.board.squares, message: 'Waiting for other player...'});
        } else if (numOfPlayers === 2){
            // User connected to a fresh room as the second user - start a new game
            if(!currentRoom.board.gameStarted){
                console.log('new game');
                socket.emit('newGame', {boardState: currentRoom.board.squares, piece: '🎀', turn: false, message: 'Opponent\'s turn: ❤️', opponent: currentRoom.players[0].name});
                socket.broadcast.to(room).emit('newGame', {boardState: currentRoom.board.squares, piece: '❤️', turn: true, message: "Your turn: ❤️", opponent: name});
            } else { // Game has been started but is not finished yet
                console.log('reloading');
                socket.emit('reload', {piece: determinePiece(currentRoom), boardState: currentRoom.board.squares, nextPiece: currentRoom.board.turn, winner: currentRoom.board.winner});
            }
        } else {
            console.log('Room is full - removing client');
            currentRoom.players = currentRoom.players.filter(player => player.id !== socket.id);
            socket.leave(currentRoom.name);
            socket.emit('roomIsFull', 'Room is full.');
        }
        callback(currentRoom);
    });

    socket.on('move', ({index, piece}) => {
        if (currentRoom.board.storeMove(index, piece)){
            if(currentRoom.board.calculateWinner(currentRoom.board.squares)){
                console.log(currentRoom);
                io.to(currentRoom.name).emit('winner', {boardState: currentRoom.board.squares, winner: currentRoom.players.filter(player => player.piece === currentRoom.board.winner)[0].id});
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

    socket.on('rematch', () => {
        currentRoom.rematchRequests += 1;

        if(currentRoom.rematchRequests == 1){
            socket.broadcast.to(currentRoom.name).emit('request-rematch');
        } else if (currentRoom.rematchRequests == 2) {
            currentRoom.rematchRequests = 0;
            currentRoom.board.squares.fill(null);
            io.to(currentRoom.name).emit('update', {boardState: currentRoom.board.squares, nextPiece: '❤️'});
        }
    });

    socket.on('disconnect', () => {
        if(currentRoom){
            console.log('Disconnecting client');
            socket.leave(currentRoom.name);
            currentRoom.players = currentRoom.players.filter(player => player.id !== socket.id);

            // This user is the last one to leave the room (becomes empty)
            if(currentRoom.players.length === 0) {
                console.log('Deleting room ', currentRoom.name);
                currentRoom = null;
            } else if(currentRoom.players.length === 1 && !currentRoom.board.gameEnd){
            // Wait 5 seconds and award the win to the last user in the room
                setTimeout(() => {
                    if(currentRoom.players.length === 1){
                        console.log('Winner by Timeout.');
                        currentRoom.board.gameEnd = true;
                        io.to(currentRoom.name).emit('timeout-winner', {message: 'You won by timeout, '});
                    }
                }, 5000); 
            }
            
        }
    });
})

app.use('/', router);

server.listen(PORT, () => console.log(`Listening on port ${PORT}...`))