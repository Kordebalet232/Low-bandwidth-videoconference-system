const express = require('express');
const app = express();
const PORT = 4000;

const http = require('http').Server(app);
const cors = require('cors');

app.use(cors());

const socketIO = require('socket.io')(http, {
    cors: {
        origin: ["http://localhost:3000", "http://localhost:3001"]
    }
});

socketIO.on('connection', (socket) => {
    console.log(`⚡: ${socket.id} user just connected!`);

    socket.on('newSourceImage', (data) => {
      socketIO.emit('newSourceImage', data)
      console.log('new_source_sent')
    });

    socket.on('kpNorm', (data) => {
      socketIO.emit('nextKpNorm', data)
      console.log('kp_norm_sent')
    })

    socket.on('disconnect', () => {
      console.log('🔥: A user disconnected');
    });

    socket.on('join-room', (userId) => {
      console.log('joined', userId)
      socket.broadcast.emit('user-connected', userId)
      
      socket.on('disconnect', () => {
        socket.broadcast.emit('user-disconnected', userId)
      })
    })
});


app.get('/api', (req, res) => {
  res.json({
    message: 'Hello world',
  });
});

http.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
  });