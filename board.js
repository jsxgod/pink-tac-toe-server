class Board{
    constructor() {
        this.squares = new Array(9).fill(null);
        this.gameStarted = false;
        this.gameEnd = false;
        this.turn = '❤️';
        this.winner = null;
    }

    switch = () => {
        if(this.turn === '❤️') {
            this.turn = '🎀';
        } else {
            this.turn = '❤️';   
        }
    }

    storeMove = (index, piece) => {
        if(!this.squares[index] && piece === this.turn){
            this.gameStarted = true;
            const newSquares = [...this.squares];
            newSquares.splice(index, 1, piece);
            this.squares = newSquares;
            return true;
        }
        return false;
    }

    calculateDraw = () => {
        return this.squares.every(square => square !== null);
    }


    calculateWinner = (squares) => {
        const lines = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6],
        ];
        for (let i = 0; i < lines.length; i++) {
            const [a, b, c] = lines[i];
            if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
                this.gameEnd = true;
                console.log('found a winner: ', squares[a]);
                this.winner = squares[a];
                return squares[a];
            }
        }
        console.log('Noone won.')
        this.gameStarted = true;
        return null;
    }

}

module.exports = Board;