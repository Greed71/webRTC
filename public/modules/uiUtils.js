import * as state from './state.js'
import * as constants from './constants.js';

// selecting DOM elements
const user_session_id_element = document.getElementById("session_id_display");
const infoModalButton = document.getElementById('info_modal_button');
const infoModalContainer = document.getElementById('info_modal_content_container');
const closeModalButton = document.getElementById('close');
const inputRoomNameElement = document.getElementById('input_room_channel_name');
const joinRoomButton = document.getElementById('join_button');
const createRoomButton = document.getElementById('create_room_button');
const roomNameHeadingTag = document.getElementById('room_name_heading_tag');
const landingPage = document.getElementById('landing_page_container');
const roomInterface = document.getElementById('room_interface');
const messagesContainer = document.getElementById('messages');
const messageInputField = document.getElementById('message_input_field');
const messageInputContainer = document.getElementById('message_input');
const sendMessageButton = document.getElementById('send_message_button');
const destroyRoomButton = document.getElementById('destroy_button');
const exitButton = document.getElementById('exit_button');
const consoleDisplay = document.getElementById('console_display');

export const DOM = {
    createRoomButton,
    inputRoomNameElement,
    destroyRoomButton,
    joinRoomButton,
    exitButton,
    sendMessageButton,
    messageInputField
};

// initiaize UI events
export function initializeUi(userId){
    user_session_id_element.innerHTML = `User ID: ${userId}`;
    state.setUserId(userId);
    // set up modal
    setUpModalEvents();
}

function setUpModalEvents() {
    infoModalButton.onclick = openModal;
    closeModalButton.onclick = closeModal;

    // close modal on clicking outside the modal content
    window.onclick = function(event) {
        if (event.target === infoModalContainer) {
            closeModal();
        }
    };
}

// open modal
function openModal() {
    infoModalContainer.classList.add('show');
    infoModalContainer.classList.remove('hide');
}

// close modal
function closeModal() {
    infoModalContainer.classList.add('hide');
    infoModalContainer.classList.remove('show');
}

// listen for enter/return key on input field
inputRoomNameElement.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        createRoomButton.click();
    }    
})

// function to enter room interface
export function creatorToProceedToRoom() {
    landingPage.style.display = 'none';
    exitButton.classList.add('hide');
    roomInterface.classList.remove('hide');
    roomNameHeadingTag.textContent = "You are in room: " + state.getState().roomName;
}

// function for exit to home
export function exitRoom() {
    inputRoomNameElement.value = "";
    landingPage.style.display = 'block';
    roomInterface.classList.add('hide');
    state.resetState(); // Reset the state when exiting the room
}

export function joineeToEnterRoom() {
    landingPage.style.display = 'none';
    roomInterface.classList.remove('hide');
    destroyRoomButton.classList.add('hide');
    roomNameHeadingTag.textContent = "You are in room: " + state.getState().roomName;
    messagesContainer.innerHTML = "Connecting via WebRTC video + chat...";
}

export function updateCreatorsRoom(){
    destroyRoomButton.classList.add('hide');
    exitButton.classList.remove('hide');
    messagesContainer.innerHTML = "Connecting via WebRTC video + chat...";
}

export function updateUiForRemainingUsers() {
    alert("A user has exited the room.");
    state.setOtherUserId(null);
    messagesContainer.innerHTML = "Waiting for a peer to join.";
}

// custom logger
export function LogToCustomConsole(message, color = "#ffffffff", highlight = false, highlightColor = "#158655ff") {
    const messageElement = document.createElement('div');
    messageElement.classList.add('console_message');
    messageElement.textContent = message;
    messageElement.style.color = color;
    
    if (highlight) {
        messageElement.style.backgroundColor = highlightColor;
        messageElement.style.fontWeight = 'bold';
        messageElement.style.padding = '5px';
        messageElement.style.borderRadius = '3px';
        messageElement.style.transition = 'background-color 0.5s ease';
    }

    consoleDisplay.appendChild(messageElement);
    consoleDisplay.scrollTop = consoleDisplay.scrollHeight;
}

export function updateUiOnSuccessfullCConnection() {
    // showing the message input container
    messageInputContainer.classList.remove('hide');
    messageInputContainer.classList.add('show');
    // remove text insider the messages container
    messagesContainer.innerHTML = "";

    // register keypress event for sending messages
    messageInputField.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            sendMessageButton.click();
        }
    });
}

export function addOutgoingMessageToUi(message) {
    const userTag = "YOU";
    const formattedMessage = `${userTag}: ${message}`;
    const messageElement = document.createElement('div');
    messageElement.style.color = constants.myColors.send;
    messageElement.textContent = formattedMessage;
    messagesContainer.appendChild(messageElement);
    messageInputField.value = ""; // Clear the input field after sending
    messagesContainer.scrollTop = messagesContainer.scrollHeight; // Scroll to the bottom
}

export function addIncomingMessageToUi(message) {
    const userTag = state.getState().otherUserId;
    const formattedMessage = `${userTag}: ${message}`;
    const messageElement = document.createElement('div');
    messageElement.style.color = constants.myColors.received;
    messageElement.textContent = formattedMessage;
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight; // Scroll to the bottom
}