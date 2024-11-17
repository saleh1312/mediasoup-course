const createConsumer = (consumerTransport,pid,device,socket,kind,slot)=>{
    return new Promise(async(resovle, reject)=>{
        // consume from the basics, emit the consumeMedia event, we take
        // the params we get back, and run .consume(). That gives us our track
        const consumerParams = await socket.emitWithAck('consumeMedia',{rtpCapabilities:device.rtpCapabilities,pid,kind})
        console.log(consumerParams)
    })
}

export default createConsumer