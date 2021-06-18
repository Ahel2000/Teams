const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { v4: uuidV4 } = require('uuid')
const { ExpressPeerServer } = require("peer")
const peerServer = ExpressPeerServer(server, {
  debug: true,
})

app.use('/peerjs', peerServer)
app.set('view engine', 'ejs')
app.use(express.static('public'))

/*app.get('/', (req, res) => {
  res.redirect(`/${uuidV4()}`)
})

app.get('/:room', (req, res) => {
  res.render('room', { roomId: req.params.room })
})

app.get('/home/create',(req,res) => {
  res.render('landing')
})

app.get('/home/create-meeting',(req,res) => {
  res.render('create')
})*/

app.get('/', (req, res) => {
  res.redirect('/home')
})

app.get('/home',(req,res) => {
  res.render('landing')
})

app.get('/create-meeting',(req,res) => {
  res.render('create')
})

app.get('/join-meeting',(req,res) => {
  res.render('join')
})

app.get('/meeting',(req,res) => {
  console.log(req.params)
  res.redirect(`/${uuidV4()}`)
})

app.get('/:room', (req, res) => {
  res.render('room', { roomId: req.params.room })
})

io.on('connection', socket => {
  socket.on('send-message',(id,message,room) => {
    socket.to(room).broadcast.emit('receive-message',id,message)
  })
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId)
    socket.to(roomId).broadcast.emit('user-connected', userId)

    socket.on('disconnect', () => {
      socket.to(roomId).broadcast.emit('user-disconnected', userId)
    })
  })
})

server.listen(process.env.PORT || 3000)