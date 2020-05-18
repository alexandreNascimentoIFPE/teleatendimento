var divSelectRoom     = document.getElementById("selectRoom");
var divConsultingRoom = document.getElementById("consultingRoom");
var inputRoomNumber   = document.getElementById("roomNumber");
var btnGoRoom         = document.getElementById("goRoom");
var localvideo        = document.getElementById("localVideo");
var remotevideo       = document.getElementById("remoteVideo");

var roomNumber;
var localStream;
var remoteStream;
var rtcPeerConnection;
var iceServers = {
    'iceServers' : [
        {'url': 'stun:stun.services.mozilla.com'},
        {'url': 'stun:stun.i.google.com:19302'}
    ]
}
var streamConstraints = {audio: true,
                         video: true}
var isCaller;

var socket = io();

btnGoRoom.onclick = function(){
    if (inputRoomNumber == "") {
        alert("digite um numero valido")
    }
    else{
        roomNumber = inputRoomNumber.value;
        socket.emit('create or join',roomNumber);
        divSelectRoom.style = "display: nome;";
        divConsultingRoom.style = "display: block;";
    }
}
socket.on('created', function(room){
    navigator.mediaDevices.getUserMedia(streamConstraints).then(function (stream){
        localStream = stream;
        localvideo.src = URL.createObjectURL(stream);
        isCaller = true;
    }).catch(function(err){
        console.log('um erro aconteceu', err)
    });
});
socket.on('joined', function(room){
    navigator.mediaDevices.getUserMedia(streamConstraints).then(function (stream){
        localStream = stream;
        localvideo.src = URL.createObjectURL(stream);
        socket.emit('ready', roomNumber);
    }).catch(function(err){
        console.log('um erro aconteceu', err)
    });
});
socket.on('ready', function() {
    if(isCaller){
        rtcPeerConnection = new RTCPeerConnection(iceServers);
        rtcPeerConnection.onicecandidate = onIceCandidate;
        rtcPeerConnection.onaddstream    = onAddStream;
        rtcPeerConnection.addStream(localStream);
        rtcPeerConnection.createOffer(setLocalAndOffer, function(e) {console.log(e)});
    }
});
socket.on('offer', function(event) {
    if (!isCaller) {
        rtcPeerConnection = new RTCPeerConnection(iceServers); 
        rtcPeerConnection.onicecandidate = onIceCandidate;
        rtcPeerConnection.onaddstream    = onAddStream;  
        rtcPeerConnection.addStream(localStream);
        rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(event));
        rtcPeerConnection.createAnswer(setLocalAndAnswer, function(e) {console.log(e)});
    }
});
socket.on('answer', function (event) {
    rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(event));
});
socket.on('candidate', function (event) {
    var candidate = new RTCIceCandidate({
        sdpMLineIndex: event.label,
        candidate: event.candidate
    });
    rtcPeerConnection.addIceCandidate(candidate);
});
function onAddStream(event){
    remotevideo.src = URL.createObjectURL(event.stream);
    remoteStream = event.stream;
}
function onIceCandidate(event) {
    if (event.candidate) {
        console.log('sending ice candidate');
        socket.emit('candidate', {
            type: 'candidate',
            label: event.candidate.sdpMLineIndex,
            id: event.candidate.spdMid,
            candidate: event.candidate.candidate,
            room: roomNumber
        })
    }
}
function setLocalAndOffer(sessionDescription) {
    rtcPeerConnection.setLocalDescription(sessionDescription);
    socket.emit('offer', {
        type: 'offer',
        sdp: sessionDescription,
        room: roomNumber
    });
}
function setLocalAndAnswer(sessionDescription) {
    rtcPeerConnection.setLocalDescription(sessionDescription);
    socket.emit('answer', {
        type: 'answer',
        sdp: sessionDescription,
        room: roomNumber
    });
}