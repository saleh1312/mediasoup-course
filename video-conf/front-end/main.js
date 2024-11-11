import './style.css'
import buttons from './uiStuff/uiButtons'
import { io } from 'socket.io-client'
import { Device } from 'mediasoup-client'
import getMic2 from './getMic2'
import createProducerTransport from './mediaSoupFunctions/createProducerTransport'

let device = null
let localStream = null
let producerTransport = null

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
  producerTransport = await createProducerTransport(socket)
}

buttons.joinRoom.addEventListener('click',joinRoom)
buttons.enableFeed.addEventListener('click',enableFeed)
buttons.sendFeed.addEventListener('click',sendFeed)