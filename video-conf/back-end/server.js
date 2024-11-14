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
const createWorkers = require('./utilities/createWorkers')
const getWorker = require('./utilities/getWorker')
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
// router is now managed by the Room object
// master rooms array that contains all our Room object
const rooms = []

//initMediaSoup gets mediasoup ready to do its thing
const initMediaSoup = async()=>{
    workers = await createWorkers()
    // console.log(workers)

}

initMediaSoup() //build our mediasoup server/sfu

// socketIo listeners
io.on('connect', socket=>{
    // this is where this client/user/socket lives!
    let client; //this client object available to all our socket listeners
    const handshake = socket.handshake //socket.handshake is where auth and query live
    //you could now check handshake for password, auth, etc.
    socket.on('joinRoom', async({userName,roomName},ackCb)=>{
        let newRoom = false
        client = new Client(userName,socket)
        let requestedRoom = rooms.find(room=> room.roomName === roomName)
        if(!requestedRoom){
            newRoom = true
            // make the new room, add a worker, add a router
            const workerToUse = await getWorker(workers)
            requestedRoom = new Room(roomName,workerToUse)
            await requestedRoom.createRouter(io)
            rooms.push(requestedRoom)
        }
        // add the room to the client
        client.room = requestedRoom
        // add the client to the Room clients
        client.room.addClient(client)
        // add this socket to the socket room
        socket.join(client.room.roomName)

        // PLACEHOLDER... 6. Eventually, we will need to get all current producers... come back to this!

        ackCb({
            routerRtpCapabilities: client.room.router.rtpCapabilities,
            newRoom,
        })
    })
    socket.on('requestTransport',async({type},ackCb)=>{
        // whether producer or consumer, client needs params
        let clientTransportParams
        if(type === "producer"){
            // run addClient, which is part of our Client class
            clientTransportParams = await client.addTransport(type)
        }else if(type === "consumer"){

        }
        ackCb(clientTransportParams)
    })
    socket.on('connectTransport',async({dtlsParameters,type},ackCb)=>{
        if(type === "producer"){
            try{
                await client.upstreamTransport.connect({dtlsParameters}) 
                ackCb("success")               
            }catch(error){
                console.log(error)
                ackCb('error')
            }
        }else if(type === "consumer"){

        }
    })
    socket.on('startProducing',async({kind,rtpParameters},ackCb)=>{
        // create a producer with the rtpParameters we were sent
        try{
            const newProducer = await client.upstreamTransport.produce({kind,rtpParameters})
            //add the producer to this client obect
            client.addProducer(kind,newProducer)
            // the front end is waiting for the id
            ackCb(newProducer.id)
        }catch(err){
            console.log(err)
            ackCb(err)
        }
        // PLACEHOLDER 1 - if this is an audiotrack, then this is a new possible speaker
        // PLACEHOLER 2 - if the room is populated, then let the connected peers know someone joined
    })

})

// httpsServer.listen(config.port)
httpServer.listen(config.port)