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
    let thisClientProducerTransport = null
    // socket is the client that just connected
    // changed cb to ack, because cb is too generic
    // ack stand for acknowledge, and is a callback
    socket.on('getRtpCap',ack=>{
        // ack is a callback to run, that will send the args
        // back to the client
        ack(router.rtpCapabilities)
    })
    socket.on('create-producer-transport', async ack=>{
        // create a transport! A producer transport
        thisClientProducerTransport = await router.createWebRtcTransport({
            enableUdp: true,
            enableTcp: true, //always use UDP unless we can't
            preferUdp: true,
            listenInfos: [
                {
                    protocol: 'udp',
                    ip: '0.0.0.0'
                },
                {
                    protocol: 'tcp',
                    ip: '0.0.0.0'
                }
            ]
        })
        console.log(thisClientProducerTransport)
        const clientTransportParams = {
            id: thisClientProducerTransport.id,
            iceParameters: thisClientProducerTransport.iceParameters,
            iceCandidates: thisClientProducerTransport.iceCandidates,
            dtlsParameters: thisClientProducerTransport.dtlsParameters,
        }        
        ack(clientTransportParams) //what we send back to the client
    })
})

httpsServer.listen(config.port)