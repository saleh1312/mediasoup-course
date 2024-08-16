const fs = require('fs') //we need this to read our keys. Part of node
const https = require('https') //we need this for a secure express server. part of node
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
const httpsServer = https.createServer(options, app)

const socketio = require('socket.io')
const mediasoup = require('mediasoup')

const config = require('./config/config')
const createWorkers = require('./createWorkers')

//set up the socketio server, listening by way of our express https sever
const io = socketio(httpsServer,{
    cors: [`https://localhost:${config.port}`]
})

//init workers, it's where our mediasoup workers will live
let workers = null

//initMediaSoup gets mediasoup ready to do its thing
const initMediaSoup = async()=>{
    workers = await createWorkers()
    // console.log(workers)
}

initMediaSoup() //build our mediasoup server/sfu

httpsServer.listen(config.port)