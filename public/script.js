const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const chatContents = document.getElementById('chat-contents')
const send = document.getElementById('send-button')
//const currUser = "";
const myPeer = new Peer(undefined, {
  host: '/',
  port: '3030'
})
const myVideo = document.createElement('video')
myVideo.muted = true
const peers = {}
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  addVideoStream(myVideo, stream)

  myPeer.on('call', call => {
    call.answer(stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream)
    })
  })

  socket.on('user-connected', userId => {
    setTimeout(connectToNewUser,1000,userId, stream)
    currUser = userId
  })
})

socket.on('user-disconnected', userId => {
  if (peers[userId]) peers[userId].close()
})

socket.on('receive-message',(userId,message) => {
  const div = document.createElement('div')
  div.textContent = userId + ": " + message
  div.style.background = '#ffffff'
  chatContents.append(div)
})

myPeer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id)
  
})

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream)
  const video = document.createElement('video')
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream)
  })
  call.on('close', () => {
    video.remove()
  })

  peers[userId] = call
}

function addVideoStream(video, stream) {
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  videoGrid.append(video)
  let totalUsers = document.getElementsByTagName("video").length;
  
}

send.addEventListener('click',function(e){
  const message = document.getElementById('message-input').value
  if(message === "")return
  const div = document.createElement('div')
  div.textContent = message
  div.style.background = '#ffffff'
  chatContents.append(div)
  socket.emit('send-message',10,message,ROOM_ID)
})


