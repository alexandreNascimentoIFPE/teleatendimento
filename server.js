const express = require('express')
const app     = express()
const http    = require('http').Server(app)
const io      = require('socket.io')(http)
const PORT    = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log('conectado na porta :' + PORT)
})

app.get('/', (req, res) =>{
    res.sendFile(__dirname + "/index.html")
})

app.use(express.static('public'));

io.on('connection', function(socket){
    console.log("cliente esta conectado" + socket.id)
})