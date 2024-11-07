#Video Conferencing Task List
## user clicks on joinRoom
1. Run joinRoom socket.io event, send up userName and roomName
## server gets joinRoom event
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