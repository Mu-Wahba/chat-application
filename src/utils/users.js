//keep track of users in array
const users = []

//addUser, removeUser,getUser,getUsersInRoom
const addUser = ({id, username,room}) => { //id is from socket connection
  //clean the data
  username = username.trim().toLowerCase()
  room = room.trim().toLowerCase()
  //validate username, password are provides
  if(!username || !room){
    return {
      error: "username and room are required!"
    }
  }
  //check for existing users
  const existingUser = users.find((user) => {
    return user.room === room && user.username === username
  })
  //validat username
  if (existingUser) {
    return {
      error: "Username is already exist!!"
    }
  }
  //store user
  const user = {id,username,room}
  users.push(user)
  return { user }
}

//REMOVE FUNCTION
const removeUser = (id) => {
    //find them in array and delete them if exists
    const userIndex = users.findIndex((user)=> {    //-1(found a match) or 1
      return user.id == id
    })
    if (userIndex !== -1){
      return users.splice(userIndex,1)[0]   //array of removed items[{id,name,room}]
    }
}

//getUser function
const getUser = (id) => {
  return users.find(user => user.id === id)
}

//getUsersInRoom FUNCTION
const getUsersInRoom = (room) => {
  return users.filter(user => user.room === room)
}

// addUser({ id: 9, username: 'wahba', room: 'q' })
// console.log(users);
//
// const z = getUser(9)
// console.log(users);
// console.log(z.room)
// console.log(users);
//
//

module.exports = {
       addUser,
       removeUser,
       getUser,
       getUsersInRoom
}
