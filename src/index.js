const express = require('express')
const path = require('path')
const http = require('http')
const socketio = require('socket.io')
const Filter = require('bad-words')
const {generateMessage , generateLocationMessage} = require('./utils/messages')
const {addUser, removeUser,getUser,getUsersInRoom} = require('./utils/users')

const app = express()
const server = http.createServer(app) //tis is done by express behinf the scene but we have to explictly did it with socket.io
const io = socketio(server) //socket io expect to be called with raw http server so we had to explictly do it


const port = process.env.PORT || 3000

const publicDirectoryPath = path.join(__dirname,'../public')

app.use(express.static(publicDirectoryPath))

// let count = 0
io.on('connection',(socket) => {

  console.log('new websocket connection')
  // socket.broadcast.emit('message',generateMessage('A new user has joned')) //send to all except user itself (this connected socket)

  //listen for 'join'
  socket.on('join',({username, room},callback) => {
      const {error, user} = addUser({id: socket.id ,username ,room})
      // console.log(user);
      // console.log(socket.id);

      if (error){
        return callback(error)
      }

      // socket.join(room)
      socket.join(user.room)

      socket.emit('message',generateMessage("Admin",'Welcome!')) //socket.emit --> send to every connected client.
      socket.broadcast.to(user.room).emit('message',generateMessage('Admin',`${user.username} has joined!`))
      //broadcast.to(room).emit send to all except user itself BUT WITHIN THIS ROOM (this connected socket)
      io.to(user.room).emit('roomData',{
        room: user.room,
        users: getUsersInRoom(user.room)
      })
      callback()
  })

  socket.on('sendMessage',(message,callback)=> {
    const user = getUser(socket.id)
    const filter = new Filter()
    if (filter.isProfane(message)){
      return callback('Profinity is not allowed')
    }
    // console.log(user);
    io.to(user.room).emit('message', generateMessage(user.username,message))
    callback() //for ack
  })

  socket.on('sendLocation',(coords, callback) => {
    // console.log(coords); //coord is obj
    const user = getUser(socket.id)
    // io.emit('locationMessage', generateLocationMessage(`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
    io.to(user.room).emit('locationMessage', generateLocationMessage(user.username,`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))

    callback()

  })



//whenever a clinet disconnected
  socket.on('disconnect', () => {
    const user = removeUser(socket.id)
    if(user){
      io.to(user.room).emit('message', generateMessage("Admin",`${user.username} has left`))
      io.to(user.room).emit('roomData',{
        room: user.room,
        users: getUsersInRoom(user.room)
      })
    }
  })







  // socket.emit('countUpdated',count)
  // socket.on('increment',()=>{
  //     count++
  //     // socket.emit('countUpdated', count) //emit to specific connection
  //     io.emit('countUpdated', count) //emit to all open connection
  // })

})

server.listen(port, ()=>{
  console.log(`server is ip on port ${port}`)
})
