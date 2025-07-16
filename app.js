// import modules
import http from "http";
import express from "express";
import { WebSocketServer } from "ws";
import * as constants from "./constants.js";

// define a port for live and testing
const PORT = process.env.PORT || 3000;

//initialize express app
let app = express();
app.use(express.static("public"));
app.use(express.json()); // for parsing application/json

//define global variables
const connections = [
    // will contains { ws: WebSocket, userId: Number }
];

// define state for rooms
const rooms = [
    // will contain { roomName, peer1, peer2 }
];

// create an HTTP server
const server = http.createServer(app);

// server static html files
app.get("/", (req, res) => {
    res.sendFile("index.html", { root: "./public" });
});

// room creation via POST request
app.post("/create-room", (req, res) => {
    // parse the request body
    console.log("Received request to create room:", req.body);
    const { roomName, userId } = req.body;
    console.log("Room Name:", roomName, "User ID:", userId);
    // check if room already exists
    const roomExists = rooms.find((room) => room.roomName === roomName);
    if (roomExists) {
        const message = {
            data: {
                type: constants.type.ROOM_CREATE.RESPONSE_FAILURE,
                message: `Room ${roomName} already exists.`,
            },
        };
        res.status(400).json(message);
    } else {
        // create a new room
        rooms.push({ roomName, peer1: userId, peer2: null });
        console.log(`Room ${roomName} created by user ID: ${userId}`);
        const message = {
            data: {
                type: constants.type.ROOM_CREATE.RESPONSE_SUCCESS,
            },
        };
        res.status(200).json(message);
    }
});

// room destruction via POST request
app.post("/destroy-room", (req, res) => {
    // parse the request body
    console.log("Received request to destroy room:", req.body);
    const { roomName } = req.body;
    console.log("Room Name:", roomName);
    // check if room already exists
    const roomExistIndex = rooms.findIndex((room) => room.roomName === roomName);
    if (roomExistIndex !== -1) {
        rooms.splice(roomExistIndex, 1);
        console.log(`Room ${roomName} destroyed successfully.`);
        const successfullyDestroyedMessage = {
            data: {
                type: constants.type.ROOM_DESTROY.RESPONSE_SUCCESS,
                message: `Room ${roomName} destroyed successfully.`,
            },
        };
        return res.status(200).json(successfullyDestroyedMessage);
    } else {
        const message = {
            data: {
                type: constants.type.ROOM_DESTROY.RESPONSE_FAILURE,
                message: `Room ${roomName} does not exist.`,
            },
        };
        return res.status(400).json(message);
    }
});

// create a WebSocket server
const wss = new WebSocketServer({ server });

// handle WebSocket connections
wss.on("connection", (ws, req) => handleConnection(ws, req));

function handleConnection(ws, req) {
    const userId = extractUserId(req);
    console.log(`User connected with ID: ${userId}`);

    // update connections array
    addConnection(ws, userId);

    // handle all 3 event listeners
    ws.on("message", (data) => handleMessage(data));
    ws.on("close", () => handleClose(userId));
    ws.on("error", () => console.error(`Error occurred for user ID: ${userId}`));
}

function handleMessage(data) {
    try {
        let message = JSON.parse(data);
        console.log("Received message:", message);

        // process message based on its label
        switch (message.label) {
            case constants.labels.NORMAL_SERVER_PROCESS:
                console.log("==== Normal Server Process ====");
                handleNormalServerProcess(message.data);
                break;
            case constants.labels.WEBRTC_PROCESS:
                console.log("==== WebRTC Process ====");
                webRTCServerProcess(message.data);
                break;
            default:
                console.warn("Unknown label:", message.label);
                return;
        }
    } catch (error) {
        console.error("Error handling message:", error);
        return;
    }
}

function handleClose(userId) {
    // remove the user from connections
    const index = connections.findIndex((conn) => conn.userId === userId);
    if (index !== -1) {
        connections.splice(index, 1);
        console.log(`User ID: ${userId} removed from connections`);
        console.log(`Current connections: ${connections.length}`);
    } else {
        console.warn(`User ID: ${userId} not found in connections`);
        return;
    }

    // remove rooms
    rooms.forEach((room) => {

        const otherUserId = (room.peer1 === userId) ? room.peer2 : room.peer1;
        const notificationMessage = {
            label: constants.labels.NORMAL_SERVER_PROCESS,
            data: {
                type: constants.type.ROOM_DISCONNECTION.NOTIFY,
                message: `User ID: ${userId} has exited the room.`,
            }
        };

        if (otherUserId) {
            sendWebSocketMessageToUser(otherUserId, notificationMessage);
        }

        if (room.peer1 === userId) {
            room.peer1 = null;
        }
        if (room.peer2 === userId) {
            room.peer2 = null;
        }
        // if both peers are null, remove the room
        if (!room.peer1 && !room.peer2) {
            const roomIndex = rooms.findIndex(
                (roomInArray) => roomInArray.roomName === room.roomName
            );

            if (roomIndex !== -1) {
                rooms.splice(roomIndex, 1);
                console.log(
                    `Room ${room.roomName} removed as both peers are disconnected.`
                );
            }
        }
    });
}

function addConnection(ws, userId) {
    connections.push({ ws, userId });
    console.log(`Current connections: ${connections.length}`);
}

function extractUserId(req) {
    const queryParam = new URLSearchParams(req.url.split("?")[1]);
    return Number(queryParam.get("userId"));
}

// start the server
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});

// >>>> NORMAL SERVER PROCESS <<<<
function handleNormalServerProcess(data) {
    // process the data based on its type
    switch (data.type) {
        case constants.type.ROOM_JOIN.REQUEST:
            joinRoomHandler(data);
            break;
        case constants.type.ROOM_EXIT.REQUEST:
            exitRoomHandler(data);
            break;
        default:
            console.warn("Unknown type:", data.type);
            return;
    }
}

function joinRoomHandler(data) {
    const { roomName, userId } = data;

    // check if the room exists
    const existingRoom = rooms.find((room) => room.roomName === roomName);
    let otherUserId = null;

    if (!existingRoom) {
        console.warn(`Room ${roomName} does not exist`);
        const message = {
            label: constants.labels.NORMAL_SERVER_PROCESS,
            data: {
                type: constants.type.ROOM_JOIN.RESPONSE_FAILURE,
                message: `Room ${roomName} does not exist.`,
            },
        };
        sendWebSocketMessageToUser(userId, message);
        return;
    }

    // check if the room is already full
    if (existingRoom.peer1 && existingRoom.peer2) {
        console.warn(`Room ${roomName} is already full`);
        const message = {
            label: constants.labels.NORMAL_SERVER_PROCESS,
            data: {
                type: constants.type.ROOM_JOIN.RESPONSE_FAILURE,
                message: `Room ${roomName} is already full.`,
            },
        };
        sendWebSocketMessageToUser(userId, message);
        return;
    }

    // allow user to join the room
    console.log(`User ID: ${userId} is trying to join room: ${roomName}`);
    if (!existingRoom.peer1) {
        existingRoom.peer1 = userId;
        otherUserId = existingRoom.peer2; // the other user is peer2
        console.log(`User ID: ${userId} joined as peer1 in room: ${roomName}`);
    } else {
        existingRoom.peer2 = userId;
        console.log(`User ID: ${userId} joined as peer2 in room: ${roomName}`);
        otherUserId = existingRoom.peer1; // the other user is peer1
    }
    const message = {
        label: constants.labels.NORMAL_SERVER_PROCESS,
        data: {
            type: constants.type.ROOM_JOIN.RESPONSE_SUCCESS,
            message: `User ID: ${userId} joined room: ${existingRoom.roomName} successfully.`,
            creatorId: otherUserId,
            roomName: existingRoom.roomName,
        },
    };
    sendWebSocketMessageToUser(userId, message);

    // notify the other user in the room
    const notificationMessage = {
        label: constants.labels.NORMAL_SERVER_PROCESS,
        data: {
            type: constants.type.ROOM_JOIN.NOTIFY,
            message: `User ${userId} has joined the room.`,
            joineeId: userId,
            roomName: existingRoom.roomName,
        },
    };
    sendWebSocketMessageToUser(otherUserId, notificationMessage);
    return;
}

// handle exit room request
function exitRoomHandler(data) {
    const { roomName, userId } = data;
    const room = rooms.find((room) => room.roomName === roomName);
    const otherUserId = (room.peer1 === userId) ? room.peer2 : room.peer1;

    if (!room) {
        console.warn(`Room ${roomName} does not exist`);
        return;
    }
    if (room.peer1 === userId) {
        room.peer1 = null;
        console.log(`User ID: ${userId} exited room: ${roomName} as peer1`);
    } else {
        room.peer2 = null;
        console.log(`User ID: ${userId} exited room: ${roomName} as peer2`);
    }

    // clean up the room if both peers are null
    if (!room.peer1 && !room.peer2) {
        const roomIndex = rooms.findIndex(
            (roomInArray) => roomInArray.roomName === roomName
        );
        if (roomIndex !== -1) {
            rooms.splice(roomIndex, 1);
            console.log(`Room ${roomName} removed as both peers exited.`);
        }
        return;
    }

    // notify the other user in the room that a peer has exited
    const notificationMessage = {
        label: constants.labels.NORMAL_SERVER_PROCESS,
        data: {
            type: constants.type.ROOM_EXIT.NOTIFY,
            message: `User ID: ${userId} has exited the room. Another user can now join`,
            exitedUserId: userId,
            roomName: roomName,
        }
    };
    sendWebSocketMessageToUser(otherUserId, notificationMessage);
    return;
}

// >>>> WEBRTC PROCESS <<<< 
function webRTCServerProcess(data) {
    // process the webRTC data based on its type
    switch (data.type) {
        case constants.type.WEB_RTC.OFFER:
            signalMessageToTheUser(data);
            break;
        case constants.type.WEB_RTC.ANSWER:
            signalMessageToTheUser(data);
            break;
        case constants.type.WEB_RTC.ICE_CANDIDATE:
            signalMessageToTheUser(data);
            break;
        case constants.type.WEB_RTC.RENEGOTIATION_OFFER:
            signalMessageToTheUser(data);
            break;
        case constants.type.WEB_RTC.RENEGOTIATION_ANSWER:
            signalMessageToTheUser(data);
            break;
        default:
            console.warn("Unknown data type:", data.type);
    }
}

function signalMessageToTheUser(data) {
    const { otherUserId } = data;
    const message = {
        label: constants.labels.WEBRTC_PROCESS,
        data: data
    };
    sendWebSocketMessageToUser(otherUserId, message);
    
}

// >>>> WEBSOCKET SERVER FUNCTIONS <<<<
// send a message to a specific user
function sendWebSocketMessageToUser(userId, message) {
    const userConnection = connections.find((conn) => conn.userId === userId);
    if (userConnection && userConnection.ws) {
        userConnection.ws.send(JSON.stringify(message));
        console.log(`Message sent to user ID: ${userId}`);
    } else {
        console.warn(
            `User ID: ${userId} not found or WebSocket connection is closed.`
        );
    }
}
