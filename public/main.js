import * as ui from "./modules/uiUtils.js";
import * as ws from "./modules/ws.js";
import * as ajax from "./modules/ajax.js";
import * as constants from "./modules/constants.js";
import * as state from "./modules/state.js";
import * as webRTCHandler from "./modules/webRTCHandler.js";

// Generate unique user code for every user.

const userId = Math.round(Math.random() * 1000000);

// initialize the DOM
ui.initializeUi(userId);

// Set up WebSocket connection
const wsClientConnection = new WebSocket(`/?userId=${userId}`);

// pass websocket logic to another module
ws.registerSocketEvents(wsClientConnection);

// create room
ui.DOM.createRoomButton.addEventListener('click', () => {
    const roomName = ui.DOM.inputRoomNameElement.value;
    if (!roomName){
        return alert("Please enter a room name.");
    }
    ui.LogToCustomConsole(`Checking if room ${roomName} exists...`, constants.myColors.green);
    ajax.createRoom(roomName, userId);
});

// destroy room
ui.DOM.destroyRoomButton.addEventListener('click', () => {
    const roomName = state.getState().roomName;
    ui.LogToCustomConsole(`Destroying room ${roomName}...`, constants.myColors.red);
    ajax.destroyRoom(roomName, userId);
});

// join room
ui.DOM.joinRoomButton.addEventListener('click', () => {
    const roomName = ui.DOM.inputRoomNameElement.value;
    if (!roomName) {
        return alert("Please enter a room name to join.");
    }
    ws.joinRoom(roomName, userId, wsClientConnection);
});

// Exit room
ui.DOM.exitButton.addEventListener('click', () => {
    const roomName = state.getState().roomName;
    if (!roomName) {
        ui.LogToCustomConsole("Error: No room name found in state", constants.myColors.red);
        console.error("Room name is null or undefined:", state.getState());
        return;
    }
    ui.exitRoom();
    ws.exitRoom(roomName, userId);
    ui.LogToCustomConsole(`Exiting room ${roomName}...`, constants.myColors.red);
    //close the peer connection and data channel
    webRTCHandler.closePeerConnection();
});

// Send Message
ui.DOM.sendMessageButton.addEventListener('click', () => {
    const message = ui.DOM.messageInputField.value.trim();
    if (!message) {
        return alert("Please enter a message to send.");
    }
    ui.addOutgoingMessageToUi(message);
    webRTCHandler.sendMessageUsingDataChannel(message);
});

// Video Controls
document.getElementById('toggle_video_button')?.addEventListener('click', async () => {
    const button = document.getElementById('toggle_video_button');
    const currentHasVideo = document.getElementById('localVideo')?.srcObject?.getVideoTracks().length > 0;
    
    button.disabled = true; // Prevent multiple clicks
    button.textContent = '⏳ Processing...';
    
    try {
        await webRTCHandler.toggleVideo();
        
        // Update button based on new state
        const newHasVideo = document.getElementById('localVideo')?.srcObject?.getVideoTracks().length > 0;
        button.textContent = newHasVideo ? '📹 Video On' : '📹 Video Off';
        button.style.backgroundColor = newHasVideo ? '#0991a2' : '#666';
    } catch (error) {
        console.error("Error toggling video:", error);
        button.textContent = '📹 Error';
        button.style.backgroundColor = '#ff0000';
    } finally {
        button.disabled = false;
    }
});

document.getElementById('toggle_audio_button')?.addEventListener('click', async () => {
    const button = document.getElementById('toggle_audio_button');
    const currentHasAudio = document.getElementById('localVideo')?.srcObject?.getAudioTracks().length > 0;
    
    button.disabled = true; // Prevent multiple clicks
    button.textContent = '⏳ Processing...';
    
    try {
        await webRTCHandler.toggleAudio();
        
        // Update button based on new state
        const newHasAudio = document.getElementById('localVideo')?.srcObject?.getAudioTracks().length > 0;
        button.textContent = newHasAudio ? '🎤 Audio On' : '🎤 Audio Off';
        button.style.backgroundColor = newHasAudio ? '#0991a2' : '#666';
    } catch (error) {
        console.error("Error toggling audio:", error);
        button.textContent = '🎤 Error';
        button.style.backgroundColor = '#ff0000';
    } finally {
        button.disabled = false;
    }
});