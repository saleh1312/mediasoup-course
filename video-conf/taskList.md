# Video Conferencing Task List
## user clicks on joinRoom
1. Run joinRoom socket.io event, send up userName and roomName
### server gets joinRoom event
1. Make client
2. If room does not exist
- get a worker
- create new room with it's own router
- add new room to master rooms array
3. Add this client to the room (whether it's new or not)
4. Add the room to the client object for convenience
5. Add this socket to the socket.io room for communication
6. Eventually, we will need to get all current producers... come back to this!
7. Send back routerCapabilities, and speakers/producers

### client gets joinRoom response
1. Load device
2. Eventually, start building transports for current producers
3. Display control buttons

## user clicks feedOn button
1. getUserMedia
    - Note: I have to pull 2nd mic, you do not
2. add video to local video box
3. Enable control buttons

## user clicks on sendFeed button
1. Create sendFeed function and listener
2. Request/create a transport for THIS client's upstream
    - It wil handle both an audio producer and a video producer
    - Abstract to a createProducerTransport function
3. Wait for server to send back params
### server gets requestTransport event
1. Prepare for both consumer and producer requests
2. Reuse createWebRtcTransportBothKinds (ugh!) from theBasics project
    - Put this in our Client class as a method
3. Add a few new details into it
4. Add new transport to the right part of our Client object
5. Respond with our clientTransportParams
### front-end recieves params from server
    - Create sendTransport with params
    - Listen for connect 
        - emit connectTransport on connect
        - Move forward on success
    - Listen for produce
        - Emit startProducer to server
        - Move forward on success
### On transport created, create producer
1. Get video and audio tracks from stream
2. Start producing both!
