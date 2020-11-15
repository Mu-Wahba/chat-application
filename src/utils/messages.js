//define few function to generate message objects
// socket.emit('message',{
//   text: 'Welcome!',
//   createdAt: new Date().getTime()
// })

const generateMessage = (username,text) => {
  return {
    username,
    text,
    createdAt: new Date().getTime()
  }
}

const generateLocationMessage = (username, url) => {
  return {
    username,
    url,
    createdAt: new Date().getTime()
  }
}

module.exports = {
        generateMessage,
        generateLocationMessage
  }
