// SEE SOCKET.IO, PEER & PEERJs DOCUMENTATION

const socket = io();

// variables for DOM elems
const message = document.getElementById('message'),
    handle = document.getElementById('handle'),
    output = document.getElementById('output'),
    typing = document.getElementById('typing'),
    button = document.getElementById('button');

//   send typing message to server
message.addEventListener('keypress', () => {
    socket.emit('userTyping', handle.value)
})


// button click send messages to server, then gets sent to clients 
button.addEventListener('click', () => {
    socket.emit('userMessage', {
        handle: handle.value,
        message: message.value
    })
    document.getElementById('message').value = "";
})




//   listen for events coming from the server

socket.on("userMessage", (data) => {
    typing.innerHTML = "";
    output.innerHTML += '<p> <strong>' + data.handle + ': </strong>' + data.message + '</p>'
})

socket.on('userTyping', (data) => {
    typing.innerHTML = '<p><em>' + data + ' is typing... </em></p>'
})

/* =======================================

PART II VIDEO CHAT  

==========================================*/


//   get the local video and display it with permission
//mozilla.org
function getLVideo(callbacks) {
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
    var constraints = {
        audio: true,
        video: true
    }
    navigator.getUserMedia(constraints, callbacks.success, callbacks.error)

}

// diplay our stream if we have permission of the media
function recStream(stream, elemid) {
    var video = document.getElementById(elemid);

    video.srcObject = stream;

    window.peer_stream = stream;
}
// function takes in a obj for the promise of using the media or not
getLVideo({
    success: function (stream) {
        window.localstream = stream;
        recStream(stream, 'lVideo');
    },
    error: function (err) {
        alert("cannot access your camera");
        console.log(err);
    }
})

// global variables for assign local and remote
var conn;
var peer_id;

// create a peer connection with peer obj or create you own using peer server docs
var peer = new Peer({ key: 'lwjd5qra8257b9' });

// display the peer id on the DOM 
peer.on('open', function () {
    document.getElementById("displayId").innerHTML = peer.id
})

// when a client connects to another connected client
peer.on('connection', function (connection) {
    conn = connection;
    peer_id = connection.peer

    document.getElementById('connId').value = peer_id;
});

// 
peer.on('error', function (err) {
    alert("an error has happened:" + err);
    console.log(err);
})
// onclick connection button 
document.getElementById('conn_button').addEventListener('click', function () {
    peer_id = document.getElementById("connId").value;
    // if there is a peer id, use global var to connect with current peerid
    if (peer_id) {
        conn = peer.connect(peer_id)
    } else {
        alert("enter an id");
        return false;
    }
})
// call when call button is clicked
peer.on('call', function (call) {

    // this prompt can act funny if the browser tab is not ACTIVE it can return false
    var acceptCall = confirm("Do you want to answer this call?");
    // if accpt, exchange across the browser
    if (acceptCall) {
        call.answer(window.localstream);

        call.on('stream', function (stream) {

            window.peer_stream = stream;

            recStream(stream, 'rVideo')
        });
        // display alert if call is denien
        call.on('close', function () {
            alert('The call has been denind');
        })
    } else {
        console.log("call denied")
    }
});

// fires to the call event to initiate a call 
document.getElementById('call_button').addEventListener('click', function () {
    console.log("calling a peer: " + peer_id);
    console.log(peer);

    // using our peer id to call the other then to display each others media
    var call = peer.call(peer_id, window.localstream);

    call.on('stream', function (stream) {
        window.peer_stream = stream;

        recStream(stream, 'rVideo');
    })
}); 
