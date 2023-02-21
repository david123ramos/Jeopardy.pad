import ws, {WsEvent, WsEventType} from './ws.js';
import Editor from './editor.js';
import { keyMap } from './constants.js';

const eventQueue = [];

Editor.element.addEventListener("keyup", e => {
    eventQueue.push(e);
    processEvents();
});

function processEvents() {
    eventQueue.forEach(e => {
        const currlineCount = Editor.element.childElementCount;
        if(e.keyCode == keyMap.ENTER ) {
            Editor.addLine();
        }else if(e.keyCode == keyMap.BACKSPACE && currlineCount <= Editor.lines) {
            //Editor.removeLine();
        }else {
    
            const coords = getCaretCoords();
            sendCaretCoords(coords);
            
            const pos = getPos(e.key);
            console.log(pos, e.key);

            Editor.doc.putChatAt(e.key, pos);
            sendText(Editor.doc);    

        }
        eventQueue.shift();
    });
}


Editor.element.addEventListener("scroll", Editor.syncScroll.bind(Editor));


Editor.element.addEventListener("click", e => {
    sendCaretCoords(getCaretCoords());
});

window.addEventListener("guestCaretUpdate", e => {
    const caretId = e.detail.caretId;
    if(!Editor.carets.includes(caretId)) {
        createGuestCaret(caretId);
        Editor.carets.push(caretId);
    }
    updateGuestCaretCoords(caretId, e.detail.coords);
});

window.addEventListener("textUpdate", e => {
    updateTextContent(e.detail);
});

window.addEventListener("guestConnected", e=> {
    createGuestBadge(e.detail);
});

window.addEventListener("wsconnected", e=> {
    Editor.ws = {id : e.detail}
});

function getCaretCoords() {
    const selection = window.getSelection();

    if(selection.rangeCount !== 0 ){ 
        const range = selection.getRangeAt(0).cloneRange();
        range.collapse(true);
        const rect = range.getClientRects()[0];
        if(rect) {
            return {x : rect.left, y : rect.top};
        }
    }
}

function sendCaretCoords(coords) {
    const msg = {
        caretId : `cursor-${Editor.ws.id}`, 
        coords : coords
    }
    const c = new WsEvent(WsEventType.CARET_CORD, msg);

    if(coords) ws.send( JSON.stringify(c));
}

function sendText(text) {
    if(text) ws.send(JSON.stringify( new WsEvent(WsEventType.TEXT, text) ));
}

function updateTextContent(text) {
    Editor.doc = text;
    // Editor.element.innerHTML = text;
}

function updateGuestCaretCoords(cursorId, coords) {
    const guest = document.body.querySelector(`#${cursorId}`);
    guest.style.left = `${coords.x+ 2}px`;
    guest.style.top =  `${coords.y + 5}px`;
}

function createGuestBadge(guest) {
    Editor.users.push(guest);
    const badge = getGuestBadgeTemplate();
    badge.querySelector("#user-char").textContent = guest.nickname.split("")[0];
    badge.querySelector("span").setAttribute("title", guest.id); 
    document.querySelector("#guests").appendChild(badge);
}

function createGuestCaret(caretId) {
    const cursor = getCaretTemplate();
    cursor.querySelector(".cursor").setAttribute("id", `${caretId}`);

    const user = Editor.getUser(caretId.split("cursor-")[1]);
    cursor.querySelector("#guest-username").textContent = user.nickname;
    document.body.appendChild(cursor);
}

function getCaretTemplate() {
    const template  = document.querySelector("#cursor-template");
    return template.content.cloneNode(true);
}

function getGuestBadgeTemplate(){
    const template = document.querySelector("#guest-template");
    return template.content.cloneNode(true);
}

function getPos(lastChar) {
    const sel = document.getSelection();
    const range = sel.getRangeAt(0);

    const row = range.startContainer.parentElement;

    const text = row.textContent.slice(0, sel.focusOffset);
    
    const line = Array.prototype.indexOf.call(Editor.element.children, row);

    const col = text.substring(0 ,text.lastIndexOf(lastChar)).split("").length;

    return {line, col};
}