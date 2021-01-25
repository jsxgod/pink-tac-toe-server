
const Board = require('./board');

rooms = new Map();

const joinRoom = ({id, room, name}) => {
    existingRoom = rooms.get(room);
    player = {id, name, room};

    if(existingRoom){
        if(existingRoom.players.length === 0){
            player.piece = '❤️';
            existingRoom.board = new Board();
        } else {
            if(existingRoom.board.gameEnd){
                existingRoom.board = new Board();
            }  
            player.piece = existingRoom.players[0].piece === '❤️' ? '🎀' : '❤️';
        }
        existingRoom.players.push(player);
        return existingRoom;
    } else {
        player.piece = '❤️';
        rooms.set(room, {board: new Board(), players: [player], name: room});
        return rooms.get(room);
    }
}

const playersInRoom = (room) => {
    if(rooms.has(room)){
        return rooms.get(room).players.length;
    }

    return -1;
}

module.exports = {joinRoom, playersInRoom};