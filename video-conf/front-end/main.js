import './style.css'
import buttons from './uiStuff/uiButtons'
import { io } from 'socket.io-client'
import { Device } from 'mediasoup-client'
import getMic2 from './getMic2'
import createProducerTransport from './mediaSoupFunctions/createProducerTransport'
import createProducer from './mediaSoupFunctions/createProducer'

let device = null
let localStream = null
let producerTransport = null
let videoProducer = null
let audioProducer = null

// const socket = io.connect('https://localhost:3031')
//FOR LOCAL ONLY... no https
const socket = io.connect('http://localhost:3031')
socket.on('connect',()=>{
  console.log("Connected")
})

const joinRoom = async()=>{
  // console.log("Join room!")
  const userName = document.getElementById('username').value
  const roomName = document.getElementById('room-input').value
  const joinRoomResp = await socket.emitWithAck('joinRoom',{userName,roomName})
  // console.log(joinRoomResp)
  device = new Device()
  await device.load({routerRtpCapabilities: joinRoomResp.routerRtpCapabilities})
  console.log(device)
  
  //PLACEHOLDER... start making the transports for current speakers
  buttons.control.classList.remove('d-none')
}

const enableFeed = async()=>{
  const mic2Id = await getMic2() //this is for me!
  localStream = await navigator.mediaDevices.getUserMedia({
    video: true,
    // audio: true,
    audio: {deviceId:{exact:mic2Id}}, //this is for me!
  })
  buttons.localMediaLeft.srcObject = localStream
  buttons.enableFeed.disabled = true
  buttons.sendFeed.disabled = false
  buttons.muteBtn.disabled = false
}

const sendFeed = async()=>{
  //create a transport for THIS client's upstream
  // it will handle both audio and video producers
  producerTransport = await createProducerTransport(socket,device)
  // console.log("Have producer transport. Time to produce!")
  // Create our producers
  const producers = await createProducer(localStream, producerTransport)
  audioProducer = producers.audioProducer
  videoProducer = producers.videoProducer
  console.log(producers)
  buttons.hangUp.disabled = false
}

const muteAudio = ()=>{
  // mute at the producer level, to keep the transport, and all
  // other mechanism in place
  if(audioProducer.paused){
    // currently paused. User wants to unpause
    audioProducer.resume()
    buttons.muteBtn.innerHTML = "Audio On"
    buttons.muteBtn.classList.add('btn-success') //turn it green
    buttons.muteBtn.classList.remove('btn-danger') //remove the red
    // unpause on the server
    socket.emit('audioChange','unmute')
  }else{
    //currently on, user wnats to pause
    audioProducer.pause()
    buttons.muteBtn.innerHTML = "Audio Muted"
    buttons.muteBtn.classList.remove('btn-success') //turn it green
    buttons.muteBtn.classList.add('btn-danger') //remove the red
    socket.emit('audioChange','mute')
  }
}

buttons.joinRoom.addEventListener('click',joinRoom)
buttons.enableFeed.addEventListener('click',enableFeed)
buttons.sendFeed.addEventListener('click',sendFeed)
buttons.muteBtn.addEventListener('click',muteAudio)