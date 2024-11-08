import './style.css'
import buttons from './uiStuff/uiButtons'
import { io } from 'socket.io-client'
import { Device } from 'mediasoup-client'

let device = null

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

buttons.joinRoom.addEventListener('click',joinRoom)
