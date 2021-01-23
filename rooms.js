
rooms = new Map();

const joinRoom = ({id, room, name}) => {
    existingRoom = rooms.get(room);
    player = {id, name, room};

    if(existingRoom){
        existingRoom.players.push(player);
        return existingRoom;
    } else {
        rooms.set(room, {players: [player], name: room});
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