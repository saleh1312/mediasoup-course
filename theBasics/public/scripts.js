
// Globals
let socket = null
let device = null
let localStream = null
let producerTransport = null

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
    console.log(data)
}

// Socket listners here!
function addSocketListeners(){
    socket.on('connect',()=>{
        // this will auto trigger, once we are connected
        connectButton.innerHTML = "Connected"
        deviceButton.disabled = false
    })
}