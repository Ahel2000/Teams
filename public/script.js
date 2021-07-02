const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const chatContents = document.getElementById('chat-contents')
const send = document.getElementById('send-button')
const lineBreak = document.createElement("br")
const mic = document.getElementById('element-4')
const vid = document.getElementById('element-2')
const input = document.getElementById('message-input')
const share = document.getElementById('element-5')
const shareLink = document.getElementById('share-button')
const record = document.getElementById('element-6')


//Added TURN and STUN server configuration for
//fixing connectivity issue over different wifi networks
//But does this really work?
/*const myPeer = new Peer(undefined, {
  secure: true,
  host: 'stormy-brook-32763.herokuapp.com',
  port: 443,
  path: '/peerjs',
  config: {
    'iceServers' : [{urls : "stun:stun.stunprotocol.org"
          },
          {
            urls: 'turn:numb.viagenie.ca',
          credential: 'Ahel@2000',
          username : 'aheldc@gmail.com'
        },
      ]
  }
})*/

const myPeer = new Peer(undefined, {
  host: '/',
  port: 3030
})

//retrieves the user name with which user joined from previous page
var user = window.sessionStorage.getItem('Name')
if(user === null)user = 'Anonymous'

var firebaseConfig = {
  apiKey: "AIzaSyAZYrdWPPo3xwJ8MrKQxDreCO6BbN5RSqs",
  authDomain: "teamsclonesite.firebaseapp.com",
  projectId: "teamsclonesite",
  storageBucket: "teamsclonesite.appspot.com",
  messagingSenderId: "292225232182",
  appId: "1:292225232182:web:0b58800c63f20865875797"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

var flag = 0;
//getData()


console.log("After function")  
//if(flag === 0)window.location.href ="/create-meeting"
const myVideo = document.createElement('video')
myVideo.controls = true;

let myVideoStream;
let myId;
let currentPeer

//USER SHOULD NOT LISTEN TO HIS OWN VOICE
//ELSE WOULD CAUSE ECHO
//SO USER'S OWN VIDEO IS MUTED
myVideo.muted = true
const peers = {}

var getUserMedia =
  navigator.getUserMedia ||
  navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia;


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
    video.controls = true;
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream)
      currentPeer = call.peerConnection
    })
  })

  //TRIGGERED WHEN A NEW USER CONNECTS
  //WE SEND DOWN THE USERID TO THIS EVENT
  socket.on('user-connected', userId => {
    setTimeout(connectToNewUser,1000,userId, stream)
  })
})

socket.on('user-disconnected', userId => {
  //if (peers[userId]) 
  peers[userId].close()
})

//THIS IS TRIGGERED WHEN
//THE USER RECEIVES A MESSAGE
socket.on('receive-message',(userId,message) => {
  const div = document.createElement('div')
  div.textContent = message
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

  console.log(call)

  const video = document.createElement('video')
  video.controls = true;

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

The next few lines of code stops users from creating their own meeting ids
Checks if meeting id user wrote is present in database or not
If not present, redirects to 404 not found page

*/

db.collection('meetings').get().then((querySnapshop) => {
  querySnapshop.forEach((doc)=>{
    const meetingId = doc.data().meetingId;
    console.log(meetingId)
    if(meetingId == ROOM_ID){
      flag = 1;
    }
  })
})

setTimeout(function(){
  if(flag == 0)window.location.href ="/home/404"
  console.log("flag:",flag)
},3000);


/*

The next few lines of code contain the snippets
that are used to share the screen

*/

//FUNCTION INVOKED WHEN SHARE SCREEN ICON IS PRESSED
async function shareScreen(){
  console.log(myPeer._connections.entries())
  await navigator.mediaDevices.getDisplayMedia().then(stream => {
    for(let [key,value] of myPeer._connections.entries()){
      console.log(myPeer._connections.get(key))
      myPeer._connections.get(key)[0]
      .peerConnection.getSenders()[1]
      .replaceTrack(stream.getTracks()[0])
    }

    //WHEN SCREEN SHARE IS STOPPED
    stream.getTracks()[0].onended = async function(){
      await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      }).then(stream => {
        for(let [key,value] of myPeer._connections.entries()){
        console.log(myPeer._connections.get(key))
        myPeer._connections.get(key)[0]
        .peerConnection.getSenders()[1]
        .replaceTrack(myVideoStream.getTracks()[1])
      }
      })
      
    }
    
  })
}


/*

The next few lines of code contain the code snippets
that are used to record the meeting

*/

const start = async () => {
  const stream = await navigator.mediaDevices.getDisplayMedia({
    video: {
      mediaSource: "screen",
    }
  })

  const data = []
  const mediaRecorder = new mediaRecorder(stream)

  mediaRecorder.ondataavailable = (e) => {
    data.push(e.data)
  }

  mediaRecorder.start()
  mediaRecorder.onStop = (e) => {
    
    var url = URL.createObjectURL(
      new Blob(data, {
        type: 'video/webm',
      })
    )

    let a = document.createElement('a')
    document.body.appendChild(a)
    a.style = "display: none"
    a.href = url
    a.download = "test.webm"
    a.click()
    window.URL.revokeObjectURL(url)

  }
  
}




/*The next few lines of code contain the code snippets 
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

The next few lines of code contain the code snippets 
that listen to button clicks and icon clicks

*/

//PREVENT PAGE REFRESH ON PRESSING ENTER WITHIN INPUT BOX
input.addEventListener('keypress',function(e){
  if(e.keyCode == 13){
    e.preventDefault()
    sendMessage()
  }
})


//LISTENS TO BUTTON CLICK WHILE SENDING MESSAGES
send.addEventListener('click',function(e){
  const message = document.getElementById('message-input').value
  if(message === "")return
  sendMessage()
})

//LISTENS TO BUTTON CLICK THAT MUTES OR UNMUTES THE MIC
mic.addEventListener('click',function(e){
  muteUnmute()
})

//LISTENS TO BUTTON CLICK THAT SWITCHES VIDEO ON OR OFF
vid.addEventListener('click', function(e){
  videoOnOff()
})

//LISTENS TO BUTTON CLICK THAT SHARES SCREEN
share.addEventListener('click',function(e){
  shareScreen()
})

//LISTENS TO BUTTON CLICK THAT SHARES LINK WITH OTHERS
shareLink.addEventListener('click',function(e){
  const mailId = document.getElementById('mailid').value;
  socket.emit('share-link', mailId,user,ROOM_ID);
})

record.addEventListener('click',function(e){
  start()
})

//triggers the send-message event
function sendMessage(){
  const message = document.getElementById('message-input').value
    if(message === "")return
    const div = document.createElement('div')
    div.textContent = "You(9:40) : " + message
    div.style.borderRadius = '20px'
    div.style.color = '#fff'
    chatContents.append(lineBreak)
    chatContents.append(div)
    chatContents.append(lineBreak)
    socket.emit('send-message',10,user + ":" + message,ROOM_ID)
    document.getElementById('message-input').value = '';
}


