import * as state from './state.js';
import * as ui from './uiUtils.js';
import * as constants from './constants.js';
import * as webRTCHandler from './webRTCHandler.js';

// Event listener for WebSocket connection
export function registerSocketEvents(wsClientConnection) {
    // update user state with WebSocket connection
    state.setWebSocketConnection(wsClientConnection);
    // Handle open event
    wsClientConnection.onopen = () => {
        ui.LogToCustomConsole("You are connected to the WebSocket server.", constants.myColors.green);
    }
    // Handle message event
    wsClientConnection.onmessage = handleMessage;
    // Handle error event
    wsClientConnection.onerror = handleError;
    // Handle close event
    wsClientConnection.onclose = handleClose;
}

function handleError(event) {
    ui.LogToCustomConsole("An error was thrown", constants.myColors.red);
}

function handleClose(event) {
    ui.LogToCustomConsole("You are disconnected from the WebSocket server.", null, true, constants.myColors.red);
}

// ###### OUTGOING MESSAGES ######

// OUTGOING: JOIN ROOM
export function joinRoom(roomName, userId) {
    const message = {
        label: constants.labels.NORMAL_SERVER_PROCESS,
        data: {
            type: constants.type.ROOM_JOIN.REQUEST,
            roomName,
            userId
        }
    };
    state.getState().userWebSocketConnection.send(JSON.stringify(message));
}

// OUTGOING: EXIT ROOM
export function exitRoom(roomName, userId) {
    const message = {
        label: constants.labels.NORMAL_SERVER_PROCESS,
        data: {
            type: constants.type.ROOM_EXIT.REQUEST,
            roomName,
            userId
        }
    };
    state.getState().userWebSocketConnection.send(JSON.stringify(message));
}

// OUTGOING: SENDING AN OFFER TO THE SIGNALING SERVER
export function sendOffer(offer) {
    const message = {
        label: constants.labels.WEBRTC_PROCESS,
        data: {
            type: constants.type.WEB_RTC.OFFER,
            offer,
            otherUserId: state.getState().otherUserId,
        }
    };
    state.getState().userWebSocketConnection.send(JSON.stringify(message));
}

// OUTGOING: SENDING AN ANSWER BACK TO THE SIGNALING SERVER
export function sendAnswer(answer) {
    const message = {
        label: constants.labels.WEBRTC_PROCESS,
        data: {
            type: constants.type.WEB_RTC.ANSWER,
            answer,
            otherUserId: state.getState().otherUserId,
        }
    };
    state.getState().userWebSocketConnection.send(JSON.stringify(message));
}

// OUTGOING: SENDING ICE CANDIDATE TO THE SIGNALING SERVER
export function sendIceCandidates(candidatesArray) {
    const message = {
        label: constants.labels.WEBRTC_PROCESS,
        data: {
            type: constants.type.WEB_RTC.ICE_CANDIDATE,
            candidates: candidatesArray,
            otherUserId: state.getState().otherUserId,
        }
    };
    state.getState().userWebSocketConnection.send(JSON.stringify(message));
}

// OUTGOING: SENDING RENEGOTIATION OFFER
export function sendRenegotiationOffer(offer) {
    const message = {
        label: constants.labels.WEBRTC_PROCESS,
        data: {
            type: constants.type.WEB_RTC.RENEGOTIATION_OFFER,
            offer,
            otherUserId: state.getState().otherUserId,
        }
    };
    state.getState().userWebSocketConnection.send(JSON.stringify(message));
}

// OUTGOING: SENDING RENEGOTIATION ANSWER
export function sendRenegotiationAnswer(answer) {
    const message = {
        label: constants.labels.WEBRTC_PROCESS,
        data: {
            type: constants.type.WEB_RTC.RENEGOTIATION_ANSWER,
            answer,
            otherUserId: state.getState().otherUserId,
        }
    };
    state.getState().userWebSocketConnection.send(JSON.stringify(message));
}

// ###### INCOMING MESSAGES ######
function handleMessage(event) {
    const message = JSON.parse(event.data);
    switch (message.label) {
        case constants.labels.NORMAL_SERVER_PROCESS:
            handleNormalServerProcess(message.data);
            break;
        case constants.labels.WEBRTC_PROCESS:
            webRTCServerProcess(message.data);
            break;
        default:
            console.warn("Unknown message label:", message.label);
    }
}

function handleNormalServerProcess(data) {
    switch (data.type) {
        case constants.type.ROOM_JOIN.NOTIFY:
            joinNotification(data);
            break;
        case constants.type.ROOM_JOIN.RESPONSE_SUCCESS:
            joinSuccess(data);
            break;
        case constants.type.ROOM_JOIN.RESPONSE_FAILURE:
            ui.LogToCustomConsole(data.message, constants.myColors.red);
            break;
        case constants.type.ROOM_EXIT.NOTIFY:
            exitNotificationHandler(data);
            break;
        case constants.type.ROOM_DISCONNECTION.NOTIFY:
            exitNotificationHandler(data);
            break;
        default:
            console.warn("Unknown data type:", data.type);
    }
}

function webRTCServerProcess(data) {
    // Handle the message based on the type of the response
    switch (data.type) {
        case constants.type.WEB_RTC.OFFER:
            webRTCHandler.handleOffer(data);
            break;
        case constants.type.WEB_RTC.ANSWER:
            webRTCHandler.handleAnswer(data);
            break;
        case constants.type.WEB_RTC.ICE_CANDIDATE:
            webRTCHandler.handleIceCandidate(data);
            break;
        case constants.type.WEB_RTC.RENEGOTIATION_OFFER:
            webRTCHandler.handleRenegotiationOffer(data);
            break;
        case constants.type.WEB_RTC.RENEGOTIATION_ANSWER:
            webRTCHandler.handleRenegotiationAnswer(data);
            break;
        default:
            console.warn("Unknown data type:", data.type);
    }
}

// User successfully joined a room
function joinSuccess(data) {
    state.setOtherUserId(data.creatorId);
    state.setRoomName(data.roomName);
    ui.joineeToEnterRoom();
    // at this point we start the WebRTC process
    webRTCHandler.startWebRTCProcess(data.roomName, data.creatorId);
}

// Notify the user that another user has joined the room
function joinNotification(data) {
    alert("User " + data.joineeId + " has joined the room.");
    state.setOtherUserId(data.joineeId);
    ui.LogToCustomConsole(data.message, constants.myColors.green);
    ui.updateCreatorsRoom();
}

// Notify the user that another user has exited the room
function exitNotificationHandler(data) {
    ui.LogToCustomConsole(data.message, constants.myColors.red);
    ui.updateUiForRemainingUsers();
    webRTCHandler.closePeerConnection();
}