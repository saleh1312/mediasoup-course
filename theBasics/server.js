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

//set up the socketio server, listening by way of our express https sever
const io = socketio(httpsServer,{
    cors: ['https://localhost:3030']
})

httpsServer.listen(3030)