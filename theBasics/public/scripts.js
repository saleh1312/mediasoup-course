
// Globals
let socket = null

// connect to the server
const initConnect = ()=>{
    // console.log("Init connect")
    socket = io('https://localhost:3030')
    connectButton.innerHTML = "Connecting..."
    connectButton.disabled = true
    // keep the socket listeners in their own place
    addSocketListeners()
}

// Socket listners here!
function addSocketListeners(){
    socket.on('connect',()=>{
        // this will auto trigger, once we are connected
        connectButton.innerHTML = "Connected"
        deviceButton.disabled = false
    })
}