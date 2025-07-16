import * as ui from "./uiUtils.js";
import * as constants from "./constants.js";
import * as state from "./state.js";

// create a new room
export function createRoom(roomName, userId) {
    fetch("/create-room", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ roomName, userId })
    })
    .then(response => response.json())
    .then(resObj  => {
        console.log("Risposta server:", resObj); // Log the server response
        if(resObj.data.type === constants.type.ROOM_CREATE.RESPONSE_SUCCESS) {
            state.setRoomName(roomName);
            ui.LogToCustomConsole(`Room ${roomName} created successfully.`, constants.myColors.green);
            ui.LogToCustomConsole("Wait for peer to join...", constants.myColors.blue);
            ui.creatorToProceedToRoom();
        }
        if (resObj.data.type === constants.type.ROOM_CREATE.RESPONSE_FAILURE) {
            ui.LogToCustomConsole(resObj.data.message, constants.myColors.red);
            return;
        }
    })
    .catch(error => {
        console.error("Error creating room:", error)
        ui.LogToCustomConsole(`Error creating room: ${error}`, constants.myColors.red);
    });
}

// destroy room
export function destroyRoom(roomName) {
    fetch("/destroy-room", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ roomName })
    })
    .then(response => response.json())
    .then(resObj  => {
       if(resObj.data.type === constants.type.ROOM_DESTROY.RESPONSE_SUCCESS) {
            ui.LogToCustomConsole(resObj.data.message, constants.myColors.green);
            state.setRoomName(null); // Clear the room name in state
            ui.exitRoom();
        }
        if (resObj.data.type === constants.type.ROOM_DESTROY.RESPONSE_FAILURE) {
            ui.LogToCustomConsole(resObj.data.message, constants.myColors.red);
        }
    })
    .catch(error => {
        console.error("Error destroying room:", error)
        ui.LogToCustomConsole(`Error destroying room: ${error}`, constants.myColors.red);
    });
}