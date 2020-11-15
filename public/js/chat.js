const socket = io()


//ELEMENTS
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $messages = document.querySelector('#messages')

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//Options
const { username, room} = Qs.parse(location.search,{ ignoreQueryPrefix: true})
//location.search = "?username=ss&room=s" , ignoreQueryPreifix: true --> to remove ? at the begining
const autoscroll = () => {
    //New Msg element
    const $newMessage = $messages.lastElementChild
    //Height of the last new msg
    const newMessgeStyles = getComputedStyle($newMessage)
    const newMessgeMargin = parseInt(newMessgeStyles.marginBottom)
    const newMessgeHeight = $newMessage.offsetHeight + newMessgeMargin

    //visible hieght
    const visibleHeight = $messages.offsetHeight
    //Heigh of msgs container
    const containerHeight = $messages.scrollHeight
    //how far i've scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight
    if (containerHeight - newMessgeHeight <= scrollOffset ){
      $messages.scrollTop  = $messages.scrollHeight
    }


}



//listen for message event
socket.on('message', (msg) => {
  // console.log(msg);
  const html = Mustache.render(messageTemplate,{ username:msg.username,incoming_msg: msg.text, createdAt: moment(msg.createdAt).format('h:mm a') })
  $messages.insertAdjacentHTML('beforeend',html)
  autoscroll()
})

//listen for locationMessage event
socket.on('locationMessage', (msg) => {
  // console.log(msg);
  const html = Mustache.render(locationTemplate,{ username:msg.username ,incoming_location: msg.url, createdAt: moment(msg.createdAt).format('h:mm a') })
  $messages.insertAdjacentHTML('beforeend',html)
  autoscroll()
})

//listen for roomData event
socket.on('roomData',({room,users})=> {
  // console.log(room);
  // console.log(users);
  const html = Mustache.render(sidebarTemplate,{ room,users })
  document.querySelector('#sidebar').innerHTML = html

})

//FORM
// document.querySelector('#message-form').addEventListener('submit', (e) => {
$messageForm.addEventListener('submit', (e) => {
  e.preventDefault()
  $messageFormButton.setAttribute('disabled', 'disabled')
  // const message = document.querySelector('input').value
  const message = e.target.elements.message.value //iput name message

  socket.emit('sendMessage',message,(errorMsg)=> {
    $messageFormButton.removeAttribute('disabled')
    $messageFormInput.value = ''
    $messageFormInput.focus()

    if(errorMsg){
      return console.log(errorMsg) //errorMsg coming from callback('Profinity is not allowed')
    }
    console.log('msg delivered');
  })
})



const $sendLocationBtn = document.querySelector('#send-location')
$sendLocationBtn.addEventListener('click', () => {
if(!navigator.geolocation)  {
  return alert('geolocation not supported by you browser')
}
$sendLocationBtn.setAttribute('disabled', 'disabled')
navigator.geolocation.getCurrentPosition( (position)=>{
  // console.log(position.coords.latitude);
  socket.emit('sendLocation',{
    latitude: position.coords.latitude,
    longitude: position.coords.longitude
  },() => {
    $sendLocationBtn.removeAttribute('disabled')
    console.log('location shared');
  })
})

})

socket.emit('join',{username,room},(err)=>{
    if(err){
      alert(err)
      location.href = '/'
    }
})




//recieve the event
// socket.on('countUpdated', (count) => {
//   console.log('the count has been updated', count);
// })
//
// document.querySelector('#increment').addEventListener('click', () => {
//   console.log('clicked')
//   socket.emit('increment')
// })
