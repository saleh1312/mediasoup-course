const fs = require('fs') //we need this to read our keys. Part of node
const https = require('https') //we need this for a secure express server. part of node
const http = require('http') 
//express sets up the http server and serves our front end
const express = require('express')
const app = express()
//seve everything in public statically
app.use(express.static('public'))

//get the keys we made with mkcert
const key = fs.readFileSync('./config/cert.key')
const cert = fs.readFileSync('./config/cert.crt')
const options = {key,cert}
//use those keys with the https module to have https
// const httpsServer = https.createServer(options, app)
//FOR LOCAL ONlY... non https
const httpServer = http.createServer(app)

const socketio = require('socket.io')
const mediasoup = require('mediasoup')

const config = require('./config/config')
const createWorkers = require('./createWorkers')
const Client = require('./classes/Client')
const Room = require('./classes/Room')

//set up the socketio server, listening by way of our express https sever
// const io = socketio(httpsServer,{
const io = socketio(httpServer,{
    cors: [`https://localhost:5173`],
    cors: [`http://localhost:5173`],
    cors: [`https://192.168.1.44`]
})

//our globals
//init workers, it's where our mediasoup workers will live
let workers = null
// init router, it's where our 1 router will live
let router = null

//initMediaSoup gets mediasoup ready to do its thing
const initMediaSoup = async()=>{
    workers = await createWorkers()
    // console.log(workers)
    router = await workers[0].createRouter({
        mediaCodecs: config.routerMediaCodecs
    })
}

initMediaSoup() //build our mediasoup server/sfu

// socketIo listeners
io.on('connect', socket=>{
    // this is where this client/user/socket lives!
    let client; //this client object available to all our socket listeners
    const handshake = socket.handshake //socket.handshake is where auth and query live
    //you could now check handshake for password, auth, etc.
    socket.on('joinRoom',({userName,roomName})=>{
        client = new Client(userName,socket,router)
    })
})

// httpsServer.listen(config.port)
httpServer.listen(config.port)