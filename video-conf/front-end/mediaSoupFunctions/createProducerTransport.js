
const createProducerTransport = (socket,device)=>new Promise(async(resolve, reject)=>{
    // ask the server to make a transport and send params
    const producerTransportParams = await socket.emitWithAck('requestTransport',{type:"producer"})
    // console.log(producerTransportParams)
    //use the device to create a front-end transport to send
    // it takes our object from requestTransport
    const producerTransport = device.createSendTransport(producerTransportParams)
    // console.log(producerTransport)
    producerTransport.on('connect',async({dtlsParamters},callback,errback)=>{
        // emit connectTransport
        console.log("Connect running on produce...")
    })
    producerTransport.on('produce',async(parameters, callback, errback)=>{
        // emit startProducing
    })
    // send the transport back to main
    resolve(producerTransport)
})

export default createProducerTransport
