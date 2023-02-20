const URI = "ws://localhost:3000";
const ws = new WebSocket(URI);

ws.onopen = function(e) {
    console.log("[WS] connected!");
}

ws.onmessage = async function(msg) {

    msg = JSON.parse(await msg.data.text());

    if(msg.eventType == WsEventType.CARET_CORD) {
        window.dispatchEvent(new CustomEvent("guestCaretUpdate", {bubbles: true, detail : msg.data}))
    }else if(msg.eventType == WsEventType.TEXT) {
        window.dispatchEvent(new CustomEvent("textUpdate", {bubbles: true, detail : msg.data}))
    }
}

export const WsEventType = Object.freeze({
    CARET_CORD: 1,
    TEXT: 2,
});

export class WsEvent {
    constructor(eventType, data) {
        this.eventType = eventType;
        this.data = data;
    }
}


export default ws;