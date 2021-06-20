const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const chatContents = document.getElementById('chat-contents')
const send = document.getElementById('send-button')
const lineBreak = document.createElement("br")
const mic = document.getElementById('element-4')
const vid = document.getElementById('element-2')

//const currUser = "";
const myPeer = new Peer(undefined, {
  secure: true,
  host: 'stormy-brook-32763.herokuapp.com',
  port: 443,
  path: '/peerjs'
})

/*const myPeer = new Peer(undefined, {
  host: '/',
  port: 3030
})*/

const myVideo = document.createElement('video')

let myVideoStream;
let myId;

//USER SHOULD NOT LISTEN TO HIS OWN VOICE
//ELSE WOULD CAUSE ECHO
//SO USER'S OWN VIDEO IS MUTED
myVideo.muted = true
const peers = {}
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  myVideoStream = stream
  //ADDS MY OWN VIDEO TO THE SCREEN
  addVideoStream(myVideo, stream)

  //FETCH THE VIDEO STREAM OF EVERY OTHER USER
  myPeer.on('call', call => {
    call.answer(stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream)
    })
  })

  //TRIGGERED WHEN A NEW USER CONNECTS
  //WE SEND DOWN THE USERID TO THIS EVENT
  socket.on('user-connected', userId => {
    setTimeout(connectToNewUser,1000,userId, stream)
  })
})

socket.on('user-disconnected', userId => {
  if (peers[userId]) peers[userId].close()
})

//THIS IS TRIGGERED WHEN
//THE USER RECEIVES A MESSAGE
socket.on('receive-message',(userId,message) => {
  const div = document.createElement('div')
  div.textContent = "Anonymous(9:40) : " + message
  div.style.borderRadius = '20px'
  chatContents.append(lineBreak)
  chatContents.append(div)
  chatContents.append(lineBreak)
})


//ON ESTABLISHING CONNECTION,
//THE USER IS MADE TO JOIN THE ROOM
myPeer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id)
  myId = id;
})


//ADD THE VIDEO OF THE NEW USER
//TO THE SCREEN OF ALL OTHER USERS
function connectToNewUser(userId, stream) {
  //This calls the newly connected user
  //and sends down my video stream
  const call = myPeer.call(userId, stream)


  const video = document.createElement('video')

  //This receives the other users' video stream
  //and appends to my video screen
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream)
  })

  //REMOVES VIDEO ON HANGING UP THE CALL
  call.on('close', () => {
    video.remove()
  })

  peers[userId] = call
}


//FUNCTION TO ADD VIDEO STREAM OF NEW USER TO ALL OTHERS' SCREEN
function addVideoStream(video, stream) {
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  videoGrid.append(video)
  let totalUsers = document.getElementsByTagName("video").length;
  
}

/*

The next few lines of code contain the code snippets 
that are used to change the audio settings during a conference

*/

//MUTE OR UNMUTE THE MIC
function muteUnmute(){
  console.log(myVideoStream)
  console.log(myVideoStream.getAudioTracks())
  const enabled = myVideoStream.getAudioTracks()[0].enabled
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false
    setUnmuteButton()
  } else {
    myVideoStream.getAudioTracks()[0].enabled = true
    setMuteButton()
  }
}

//CHANGES THE MIC ICON TO MUTED MIC ICON
function setUnmuteButton(){
  const html = `<i class="unmute fa fa-microphone-slash" style="color: red; background-color: aliceblue;"></i>`;
  document.getElementById("element-4").innerHTML = html;
}

//CHANGES THE MUTED MIC ICON TO MIC ICON
function setMuteButton(){
  const html = `<i class="unmute fa fa-microphone" style="color: red; background-color: aliceblue;"></i>`;
  document.getElementById("element-4").innerHTML = html;
}


/*

The next few lines of codes contain the code snippets
that are used to change video settings during the conference

*/

//FUNCTION TO SWITCH VIDEO ON OR OFF
function videoOnOff(){
  const enabled = myVideoStream.getVideoTracks()[0].enabled
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false
    unsetVideoButton()
  } else {
    myVideoStream.getVideoTracks()[0].enabled = true
    setVideoButton()
  }
}

//CHANGES VIDEO ICON TO PAUSED ICON
function setVideoButton(){
  const html = `<i class="unmute fa fa-video-camera" style="color: red; background-color: aliceblue;"></i>`;
  document.getElementById("element-2").innerHTML = html;
}

//CHANGES PAUSED ICON TO VIDEO ICON
function unsetVideoButton(){
  const html = `<i class="unmute fa fa-play" style="color: red; background-color: aliceblue;"></i>`;
  document.getElementById("element-2").innerHTML = html;
}



/* 

The next few lines OF code contain the code snippets 
that listen to button clicks and icon clicks

*/


//LISTENS TO BUTTON CLICK WHILE SENDING MESSAGES
send.addEventListener('click',function(e){
  const message = document.getElementById('message-input').value
  if(message === "")return
  const div = document.createElement('div')
  div.textContent = "You(9:40) : " + message
  div.style.borderRadius = '20px'
  div.style.color = '#fff'
  chatContents.append(lineBreak)
  chatContents.append(div)
  chatContents.append(lineBreak)
  socket.emit('send-message',10,message,ROOM_ID)
})

//LISTENS TO BUTTON CLICK THAT MUTES OR UNMUTES THE MIC
mic.addEventListener('click',function(e){
  muteUnmute()
})

vid.addEventListener('click', function(e){
  videoOnOff()
})


