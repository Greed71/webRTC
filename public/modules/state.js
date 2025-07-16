// file to keep all states
let state = {
    userId: null,
    userWebSocketConnection: null,
    roomName: null,
    otherUserId: null
};

// get current state
export const getState = () => {
    return state;
}

// generic setter function
const setState = (newState) => {
    state = {
        ...state,
        ...newState
    }
};

// set userId
export const setUserId = (userId) => {
    setState({ userId });
}

// set otherUserId
export const setOtherUserId = (otherUserId) => {
    setState({ otherUserId: otherUserId });
}

// set WebSocket state
export const setWebSocketConnection = (wsConnection) => {
    setState({ userWebSocketConnection: wsConnection });
}

// reset state
export const resetState = () => {
    setState({
        roomName: null,
        otherUserId: null,
    });
}

// set roomName
export const setRoomName = (roomName) => {
    console.log("Setting roomName:", roomName);
    setState({ roomName });
}