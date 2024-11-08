class Client{
    constructor(userName,socket){
        this.userName = userName
        this.socket = socket
        //instead of calling this producerTransport, call it upstream, THIS client's transport
        // for sending data
        this.upstreamTransport = null
        //we will have an audio and video consumer
        this.producer = {}
        //instead of calling this consumerTransport, call it downstream, 
        // THIS client's transport for pulling data
        this.downstreamTransports = []
        //an array of consumers, each with 2 parts
        this.consumers = []
        // this.rooms = []
        this.room = null // this will be a Room object
    }
}

module.exports = Client