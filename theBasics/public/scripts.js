
// Globals
let socket = null
let device = null
let localStream = null
let producerTransport = null
let producer = null
let consumerTransport = null
let consumer = null

// connect to the server
const initConnect = ()=>{
    // console.log("Init connect")
    socket = io('https://localhost:3030')
    connectButton.innerHTML = "Connecting..."
    connectButton.disabled = true
    // keep the socket listeners in their own place
    addSocketListeners()
}

const deviceSetup = async()=>{
    // console.log(mediasoupClient)
    device = new mediasoupClient.Device();
    // now let's load it!
    const routerRtpCapabilities = await socket.emitWithAck('getRtpCap')
    // console.log(routerRtpCapabilities)
    await device.load({routerRtpCapabilities })
//     console.log(device.loaded)
    deviceButton.disabled = true
    createProdButton.disabled = false
}

const createProducer = async()=>{
    // console.log("Create transport")
    try{
        localStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
        })
        console.log(localStream)
        localVideo.srcObject = localStream
    }catch(err){
        console.log("GUM error",err)
    }
    //ask the socket.io server (signaling) for transport information
    const data = await socket.emitWithAck('create-producer-transport')
    const { id, iceParameters, iceCandidates,dtlsParameters } = data
    // console.log(data)
    // make a transport on the client (producer)!
    const transport = device.createSendTransport({
        id, iceParameters, iceCandidates,dtlsParameters
    })
    producerTransport = transport
    // the transport connect event will NOT fire until
    // we call transport.produce()
    producerTransport.on('connect',async({dtlsParameters},callback,errback)=>{
        // console.log("Transport connect event has fired!")
        // connect comes with local dtlsParameters. We need
        // to send these up to the server, so we can finish
        // the connection
        console.log(dtlsParameters)
        const resp = await socket.emitWithAck('connect-transport',{dtlsParameters})
        if(resp === "success"){
            //calling callback simply lets the app know, the server
            // succeeded in connecting, so trigger the produce event
            callback()
        }else if(resp === "error"){
            //calling errback simply lets the app know, the server
            // failed in connecting, so HALT everything
            errback()
        }
        console.log(resp)
    })
    producerTransport.on('produce', async(parameters, callback, errback)=>{
        // console.log("Transport produce event has fired!")
        console.log(parameters)
        const { kind, rtpParameters } = parameters
        const resp = await socket.emitWithAck('start-producing',{ kind, rtpParameters })
        if(resp === "error"){
            //somethign went wrong when the server tried to produce
            errback()
        }else{
            // resp contains an id!
            callback({id:resp})
        }
        // console.log(resp)
        publishButton.disabled = true
        createConsButton.disabled = false
    })
    createProdButton.disabled = true
    publishButton.disabled = false
}

const publish = async()=>{
    // console.log("Publish feed!")
    const track = localStream.getVideoTracks()[0]
    producer = await producerTransport.produce({track})
}

const createConsumer = async()=>{
    //ask the socket.io server (signaling) for transport information
    const data = await socket.emitWithAck('create-consumer-transport')
    const { id, iceParameters, iceCandidates,dtlsParameters } = data
    // console.log(data)
    // make a transport on the client (producer)!
    const transport = device.createRecvTransport({
        id, iceParameters, iceCandidates,dtlsParameters
    })
    consumerTransport = transport
    // the transport connect event will NOT fire until
    // we call transport.consume()
    consumerTransport.on('connect',async({dtlsParameters},callback,errback)=>{
        // console.log("Transport connect event has fired!")
        // connect comes with local dtlsParameters. We need
        // to send these up to the server, so we can finish
        // the connection
        // console.log(dtlsParameters)
        const resp = await socket.emitWithAck('connect-consumer-transport',{dtlsParameters})
        if(resp === "success"){
            //calling callback simply lets the app know, the server
            // succeeded in connecting, so trigger the produce event
            callback()
        }else if(resp === "error"){
            //calling errback simply lets the app know, the server
            // failed in connecting, so HALT everything
            errback()
        }
        console.log(resp)
    })
    createConsButton.disabled = true
    consumeButton.disabled = false
}

// Socket listners here!
function addSocketListeners(){
    socket.on('connect',()=>{
        // this will auto trigger, once we are connected
        connectButton.innerHTML = "Connected"
        deviceButton.disabled = false
    })
}