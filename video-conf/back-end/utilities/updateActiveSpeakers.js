
const updateActiveSpeakers = (room,io)=>{
    //this function is called on newDominantSpeaker, or a new peer produces
    // mutes existing consumers/producer if below 5, for all peers in room
    // unmutes existing consumers/producer if in top 5, for all peers in room
    // return new transports by peer
    //called by either activeSpeakerObserver (newDominantSpeaker) or startProducing

    const activeSpeakers = room.activeSpeakerList.slice(0,5)
    const mutedSpeakers = room.activeSpeakerList.slice(5)
    const newTransportsByPeer = {}
    // loop through all connected clients in the room
    room.clients.forEach(client=>{
        // loop through all clients to mute
        mutedSpeakers.forEach(pid=>{
            // pid is the producer id we want to mute
            if(client?.producer?.audio?.id === pid){
                // this client is the produer. Mute the producer
                client?.producer?.audio.pause()
                client?.producer?.video.pause()
                return
            }
            const downstreamToStop = client.downstreamTransports.find(t=>t?.audio?.producerId === pid)
            if(downstreamToStop){
                // found the audio, mute both
                downstreamToStop.audio.pause()
                downstreamToStop.video.pause()
            }//no else. Do nothing if no match
        })
    })
    
}

module.exports = updateActiveSpeakers
