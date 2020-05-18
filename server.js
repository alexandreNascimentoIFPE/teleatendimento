const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const PORT = process.env.PORT || 3000;

// port setup and listening 
http.listen(PORT, () => {
    console.log("listening on port " + PORT)
});

// serving our index.html 
app.get('/', (req, res) => {
    res.sendFile(__dirname + "/index.html")
})
// allows files in this folder to be served all the time
app.use(express.static('public'));

// init socket 
io.on('connection', function (socket) {
    console.log("client is connected " + socket.id)
    // receive the event, then send data to clients
    socket.on('userMessage', (data) => {
        io.sockets.emit("userMessage", data)
    })
    // receive the typing event, send out to clients
    socket.on('userTyping', (data) => {
        socket.broadcast.emit('userTyping', data)

    });
})