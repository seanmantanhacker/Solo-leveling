const express = require('express');
const app = express();
const PORT = process.env.PORT || 3500;
const path = require('path');

const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer(app);
const io = new Server(server);  // Attach Socket.IO

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname,'/frontend/views'));
app.use(express.static(path.join(__dirname, '/frontend/assets')));

app.get('/', (req, res) => {
    res.render('index', {
        data: "a",
        ses: "a"
    });
})

let players = {};

io.on('connection', socket => {
    console.log('A player connected:', socket.id);

    // Initialize new player
    players[socket.id] = { x: 400, y: 300 };

    socket.emit('currentPlayers', players);
    socket.broadcast.emit('newPlayer', { id: socket.id, x: 400, y: 300 });

    // Listen for movement updates
    socket.on('playerMovement', data => {
        if(players[socket.id]){
            players[socket.id].x = data.x;
            players[socket.id].y = data.y;
            socket.broadcast.emit('playerMoved', { id: socket.id, x: data.x, y: data.y });
        }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
        console.log('Player disconnected:', socket.id);
        delete players[socket.id];
        socket.broadcast.emit('playerDisconnected', socket.id);
    });
});

//Handle 404
app.use(function (req, res, next) {
   if (req.accepts('html') && res.status(404)) {
      res.render('404')
      return;
   }
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
