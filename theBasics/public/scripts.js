
// Globals
let socket = null
let device = null

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
}

// Socket listners here!
function addSocketListeners(){
    socket.on('connect',()=>{
        // this will auto trigger, once we are connected
        connectButton.innerHTML = "Connected"
        deviceButton.disabled = false
    })
}