import * as ui from './uiUtils.js';
import * as constants from './constants.js';
import * as ws from './ws.js';

// set up global variables
let pc;
let dataChannel;
let localStream;
let remoteStream;
let iceCandidatesGeneratedArray = [];
let iceCandidatesReceivedBuffer = [];

// step 1 md file congiguration
const webRTCConfiguration = {
    iceServers: [
        {
            urls: [
                "stun:stun.l.google.com:19302",
                "stun:stun1.l.google.com:19302",
                "stun:stun2.l.google.com:19302",
                "stun:stun3.l.google.com:19302",
                "stun:stun4.l.google.com:19302"
            ]
        }
    ]
};

export async function startWebRTCProcess() {
    ui.LogToCustomConsole("Starting automatic WebRTC process...", constants.myColors.green);
    
    try {
        // Step 1: Get user media (camera + microphone)
        ui.LogToCustomConsole("Step 1: Accessing camera and microphone", constants.myColors.green);
        await getUserMedia();
        
        // Step 2: Create peer connection
        ui.LogToCustomConsole("Step 2: Creating RTCPeerConnection", constants.myColors.green);
        createPeerConnectionObject();
        console.log("Local Description after creating peer connection:", pc.localDescription);
        
        // Step 3: Add local stream to peer connection
        ui.LogToCustomConsole("Step 3: Adding local stream to peer connection", constants.myColors.green);
        addLocalStreamToPeerConnection();
        
        // Step 4: Create data channel for chat
        ui.LogToCustomConsole("Step 4: Creating data channel for chat", constants.myColors.green);
        createDataChannel(true);
        console.log("PC object after creating data channel:", pc);
        
        // Step 5: Create offer
        ui.LogToCustomConsole("Step 5: Creating WebRTC offer", constants.myColors.green);
        const offer = await pc.createOffer();
        ui.LogToCustomConsole("Offer created successfully", constants.myColors.green);
        console.log("Offer created:", offer);
        
        // Step 6: Set local description
        ui.LogToCustomConsole("Step 6: Setting local description", constants.myColors.green);
        await pc.setLocalDescription(offer);
        ui.LogToCustomConsole("Local description set successfully", constants.myColors.green);
        console.log("Local Description after setting offer:", pc.localDescription);
        
        // Step 7: Send offer to other peer
        ui.LogToCustomConsole("Step 7: Sending offer to peer", constants.myColors.green);
        ws.sendOffer(offer);
        ui.LogToCustomConsole("Offer sent successfully. Waiting for answer...", constants.myColors.blue);
        
    } catch (error) {
        ui.LogToCustomConsole(`Error in WebRTC process: ${error.message}`, constants.myColors.red);
        console.error("WebRTC process error:", error);
    }
};

// Get user media (camera + microphone)
async function getUserMedia() {
    try {
        localStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        });
        
        // Display local video
        const localVideo = document.getElementById('localVideo');
        if (localVideo) {
            localVideo.srcObject = localStream;
        }
        
        // Initialize toggle buttons as OFF - disable tracks initially
        initializeToggleButtonsOff();
        
        ui.LogToCustomConsole("Camera and microphone access granted", constants.myColors.green);
        return localStream;
    } catch (error) {
        ui.LogToCustomConsole(`Error accessing media devices: ${error.message}`, constants.myColors.red);
        throw error;
    }
}

// Initialize toggle buttons as OFF
function initializeToggleButtonsOff() {
    // Remove video and audio tracks initially to match toggle logic
    const videoTrack = localStream.getVideoTracks()[0];
    const audioTrack = localStream.getAudioTracks()[0];
    
    if (videoTrack) {
        videoTrack.stop();
        localStream.removeTrack(videoTrack);
    }
    if (audioTrack) {
        audioTrack.stop();
        localStream.removeTrack(audioTrack);
    }
    
    // Update button states and local video display
    const videoButton = document.getElementById('toggle_video_button');
    const audioButton = document.getElementById('toggle_audio_button');
    const localVideo = document.getElementById('localVideo');
    
    if (videoButton) {
        videoButton.textContent = '📹 Video Off';
        videoButton.style.backgroundColor = '#666';
    }
    
    if (audioButton) {
        audioButton.textContent = '🎤 Audio Off';
        audioButton.style.backgroundColor = '#666';
    }
    
    // Make local video black when disabled
    if (localVideo) {
        localVideo.style.filter = 'brightness(0)';
    }
    
    ui.LogToCustomConsole("Video and audio tracks removed - initialized as OFF", constants.myColors.blue);
}

// Add local stream to peer connection
function addLocalStreamToPeerConnection() {
    localStream.getTracks().forEach(track => {
        pc.addTrack(track, localStream);
    });
    ui.LogToCustomConsole("Local stream added to peer connection", constants.myColors.green);
}

// create a users local peer connection object
function createPeerConnectionObject() {
    
    pc = new RTCPeerConnection(webRTCConfiguration);

    // ### register event listeners

    // 1. listen for WebRTC connection state changes
    pc.addEventListener("connectionstatechange", () => {
        console.log("Connection state changed:", pc.connectionState);
        if (pc.connectionState === "connected") {
            ui.LogToCustomConsole("WebRTC video + chat connection established successfully!", null, true, constants.myColors.green);
            ui.updateUiOnSuccessfullCConnection();
        }
    });

    // 2. listen for change in the signaling state
    pc.addEventListener("signalingstatechange", () => {
        ui.LogToCustomConsole(`Signaling state changed: ${pc.signalingState}`, null, true, constants.myColors.orange);
    });

    // 3. listen for ICE candidate gathering
    pc.addEventListener("icecandidate", (event) => {
        if (event.candidate) {
            ui.LogToCustomConsole("ICE candidate gathered", null, true, constants.myColors.blue);
            console.log("New ICE candidate:", event.candidate);
            iceCandidatesGeneratedArray.push(event.candidate);
        } else {
            console.log("All ICE candidates have been gathered.");
        }
    });

    // 4. listen for remote stream (video/audio)
    pc.addEventListener("track", (event) => {
        ui.LogToCustomConsole("Remote stream received", constants.myColors.green);
        const remoteVideo = document.getElementById('remoteVideo');
        if (remoteVideo && event.streams[0]) {
            remoteVideo.srcObject = event.streams[0];
            remoteVideo.style.filter = ''; // Remove any filter when track is added
            remoteStream = event.streams[0];
            
            // Monitor for track removal to show black screen
            event.streams[0].addEventListener('removetrack', (e) => {
                ui.LogToCustomConsole("Remote track removed - showing black screen", constants.myColors.orange);
                // Check if no video tracks remain
                if (event.streams[0].getVideoTracks().length === 0) {
                    remoteVideo.style.filter = 'brightness(0)';
                }
            });
        }
        
        // Handle track ending (when peer removes track)
        event.track.onended = () => {
            ui.LogToCustomConsole(`Remote ${event.track.kind} track ended`, constants.myColors.orange);
            if (event.track.kind === 'video') {
                // Make remote video black when track is removed
                if (remoteVideo) {
                    remoteVideo.style.filter = 'brightness(0)';
                }
            }
        };
    });

    // 4. listen for ICE connection state changes
    //pc.addEventListener("iceconnectionstatechange", () => {
    //    if (pc.iceConnectionState === "disconnected") {
    //        closePeerConnection();
    //    }
    //});
}

// create a data channel
function createDataChannel(isOfferor) {
    if(isOfferor){
        dataChannel = pc.createDataChannel("chat");
        registerDataChannelEvents();
        ui.LogToCustomConsole("Data channel created successfully.", constants.myColors.green);
    }else {
        // if this eles is triggere we are dealing with the offeree
        // the receiver needs to register a ondatachannel event listener
        // this will only fire once a valid webRTC connection has been established
        pc.ondatachannel = (e) => {
            dataChannel = e.channel;
            registerDataChannelEvents();
            ui.LogToCustomConsole("OnDataChannel registered successfully.", constants.myColors.green);
        }
    }
};

// register data channel events
function registerDataChannelEvents() {
    dataChannel.addEventListener("message", (e) => {
        console.log("message has been received from the data channel:", e.data);
        const messageElement = e.data;
        ui.addIncomingMessageToUi(messageElement);
    });
    dataChannel.addEventListener("open", (e) => {
        console.log("Data channel is open:", e);
    });
    dataChannel.addEventListener("close", (e) => {
        console.log("Data channel is closed:", e);
    });
    
}

export async function handleOffer(data) {
    ui.LogToCustomConsole("WebRTC offer received. Starting automatic answer process...", constants.myColors.green);
    
    try {
        // Step 1: Get user media
        ui.LogToCustomConsole("Step 1: Accessing camera and microphone", constants.myColors.green);
        await getUserMedia();
        
        // Step 2: Create peer connection
        ui.LogToCustomConsole("Step 2: Creating RTCPeerConnection", constants.myColors.green);
        createPeerConnectionObject();
        
        // Step 3: Add local stream to peer connection
        ui.LogToCustomConsole("Step 3: Adding local stream to peer connection", constants.myColors.green);
        addLocalStreamToPeerConnection();
        
        // Step 4: Register data channel listener for chat
        ui.LogToCustomConsole("Step 4: Registering data channel listener for chat", constants.myColors.green);
        createDataChannel(false);
        
        // Step 5: Set remote description with received offer
        ui.LogToCustomConsole("Step 5: Setting remote description", constants.myColors.green);
        await pc.setRemoteDescription(data.offer);
        
        // Step 6: Create answer
        ui.LogToCustomConsole("Step 6: Creating answer", constants.myColors.green);
        const answer = await pc.createAnswer();
        ui.LogToCustomConsole("Answer created successfully", constants.myColors.green);
        console.log("Answer created:", answer);
        
        // Step 7: Set local description with answer
        ui.LogToCustomConsole("Step 7: Setting local description", constants.myColors.green);
        await pc.setLocalDescription(answer);
        
        // Step 8: Send answer to other peer
        ui.LogToCustomConsole("Step 8: Sending answer to peer", constants.myColors.green);
        ws.sendAnswer(answer);
        
        // Step 9: Send ICE candidates
        ui.LogToCustomConsole("Step 9: Sending ICE candidates", constants.myColors.green);
        ws.sendIceCandidates(iceCandidatesGeneratedArray);
        ui.LogToCustomConsole("Answer and ICE candidates sent. Waiting for connection...", constants.myColors.blue);
        
    } catch (error) {
        ui.LogToCustomConsole(`Error handling offer: ${error.message}`, constants.myColors.red);
        console.error("Handle offer error:", error);
    }
}

export async function handleAnswer(data) {
    ui.LogToCustomConsole("WebRTC answer received. Completing connection...", constants.myColors.green);
    
    try {
        // Step 1: Set remote description with received answer
        ui.LogToCustomConsole("Setting remote description with answer", constants.myColors.green);
        await pc.setRemoteDescription(data.answer);
        ui.LogToCustomConsole("Remote description set successfully", constants.myColors.green);
        
        // Step 2: Send ICE candidates automatically
        ui.LogToCustomConsole("Sending ICE candidates", constants.myColors.green);
        ws.sendIceCandidates(iceCandidatesGeneratedArray);
        
        // Step 3: Process buffered ICE candidates
        ui.LogToCustomConsole("Processing buffered ICE candidates", constants.myColors.green);
        for (const candidate of iceCandidatesReceivedBuffer) {
            try {
                await pc.addIceCandidate(candidate);
                ui.LogToCustomConsole("ICE candidate added successfully", constants.myColors.green);
            } catch (error) {
                console.error("Error adding ICE candidate:", error);
            }
        }
        iceCandidatesReceivedBuffer.splice(0, iceCandidatesReceivedBuffer.length); // clear buffer
        
        ui.LogToCustomConsole("WebRTC video + chat connection process completed. Waiting for connection...", constants.myColors.blue);
        
    } catch (error) {
        ui.LogToCustomConsole(`Error handling answer: ${error.message}`, constants.myColors.red);
        console.error("Handle answer error:", error);
    }
}

export function handleIceCandidate(data) {
    if(pc.remoteDescription) {
        try {
            data.candidates.forEach(candidate => {
                pc.addIceCandidate(candidate);
                ui.LogToCustomConsole("ICE candidate added successfully.", constants.myColors.green);
            });
        } catch (error) {
            console.error("Error adding ICE candidate:", error);
        }
    }else {
        data.candidates.forEach(candidate => {
            iceCandidatesReceivedBuffer.push(candidate);
            ui.LogToCustomConsole("ICE candidate received and buffered.", constants.myColors.blue);
        });
    }
}

// Handle renegotiation offer (when peer adds/removes tracks)
export async function handleRenegotiationOffer(data) {
    try {
        ui.LogToCustomConsole("Renegotiation offer received", constants.myColors.blue);
        
        // Set remote description with new offer
        await pc.setRemoteDescription(data.offer);
        
        // Create answer
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        
        // Send answer back
        ws.sendRenegotiationAnswer(answer);
        
        ui.LogToCustomConsole("Renegotiation answer sent", constants.myColors.green);
        
    } catch (error) {
        console.error("Error handling renegotiation offer:", error);
        ui.LogToCustomConsole(`Renegotiation error: ${error.message}`, constants.myColors.red);
    }
}

// Handle renegotiation answer
export async function handleRenegotiationAnswer(data) {
    try {
        ui.LogToCustomConsole("Renegotiation answer received", constants.myColors.blue);
        
        // Set remote description with answer
        await pc.setRemoteDescription(data.answer);
        
        ui.LogToCustomConsole("Renegotiation completed successfully", constants.myColors.green);
        
    } catch (error) {
        console.error("Error handling renegotiation answer:", error);
        ui.LogToCustomConsole(`Renegotiation error: ${error.message}`, constants.myColors.red);
    }
}

// data channel message handler
export function sendMessageUsingDataChannel(message) {
    dataChannel.send(message);
}

// handle closure of the peer connection
export function closePeerConnection() {
    // Stop local media tracks
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        localStream = null;
        ui.LogToCustomConsole("Local media streams stopped", constants.myColors.orange);
    }
    
    // Close data channel
    if (dataChannel) {
        dataChannel.close();
        dataChannel = null;
        console.log("Data channel closed.");
    }

    if (pc) {
        pc.close();
        pc = null; // reset the peer connection object
        console.log("Peer connection closed.");
    }

    console.log("your pc object after closing the connection:", pc);
}

// Toggle video on/off - removes/adds track
export async function toggleVideo() {
    if (!localStream) return false;
    
    const videoTrack = localStream.getVideoTracks()[0];
    const localVideo = document.getElementById('localVideo');
    
    if (videoTrack) {
        // Remove video track
        videoTrack.stop();
        localStream.removeTrack(videoTrack);
        
        // Make local video black
        if (localVideo) {
            localVideo.style.filter = 'brightness(0)';
        }
        
        // Find and remove sender from peer connection
        const sender = pc.getSenders().find(s => s.track && s.track.kind === 'video');
        if (sender) {
            await pc.removeTrack(sender);
            
            // Renegotiate to notify remote peer
            await renegotiateConnection();
        }
        
        ui.LogToCustomConsole("Video track removed and connection renegotiated", constants.myColors.orange);
        return false;
    } else {
        // Add video track back
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            const newVideoTrack = stream.getVideoTracks()[0];
            localStream.addTrack(newVideoTrack);
            
            // Add to peer connection
            await pc.addTrack(newVideoTrack, localStream);
            
            // Update local video element and remove filter
            if (localVideo) {
                localVideo.srcObject = localStream;
                localVideo.style.filter = '';
            }
            
            // Renegotiate to notify remote peer
            await renegotiateConnection();
            
            ui.LogToCustomConsole("Video track added and connection renegotiated", constants.myColors.green);
            return true;
        } catch (error) {
            ui.LogToCustomConsole(`Error adding video: ${error.message}`, constants.myColors.red);
            return false;
        }
    }
}

// Toggle audio on/off - removes/adds track
export async function toggleAudio() {
    if (!localStream) return false;
    
    const audioTrack = localStream.getAudioTracks()[0];
    
    if (audioTrack) {
        // Remove audio track
        audioTrack.stop();
        localStream.removeTrack(audioTrack);
        
        // Find and remove sender from peer connection
        const sender = pc.getSenders().find(s => s.track && s.track.kind === 'audio');
        if (sender) {
            await pc.removeTrack(sender);
            
            // Renegotiate to notify remote peer
            await renegotiateConnection();
        }
        
        ui.LogToCustomConsole("Audio track removed and connection renegotiated", constants.myColors.orange);
        return false;
    } else {
        // Add audio track back
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const newAudioTrack = stream.getAudioTracks()[0];
            localStream.addTrack(newAudioTrack);
            
            // Add to peer connection
            await pc.addTrack(newAudioTrack, localStream);
            
            // Renegotiate to notify remote peer
            await renegotiateConnection();
            
            ui.LogToCustomConsole("Audio track added and connection renegotiated", constants.myColors.green);
            return true;
        } catch (error) {
            ui.LogToCustomConsole(`Error adding audio: ${error.message}`, constants.myColors.red);
            return false;
        }
    }
}

// Renegotiate connection after track changes
async function renegotiateConnection() {
    if (!pc || pc.connectionState !== 'connected') return;
    
    try {
        ui.LogToCustomConsole("Renegotiating connection...", constants.myColors.blue);
        
        // Create new offer
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        
        // Send offer via websocket for renegotiation
        ws.sendRenegotiationOffer(offer);
        
    } catch (error) {
        console.error("Error during renegotiation:", error);
        ui.LogToCustomConsole(`Renegotiation error: ${error.message}`, constants.myColors.red);
    }
}