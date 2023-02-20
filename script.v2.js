import ws, {WsEvent, WsEventType} from './ws.js';

const editorRef =  document.querySelector("#editor");
const linesCounterRef = document.querySelector("#linesCounter");

//TODO: remove hardcorded guest cursor
const guest = document.querySelector(".cursor");

const keyMap = Object.freeze({
    ENTER: 13,
    BACKSPACE : 8,

    ARROW_UP : 37,
    ARROW_RIGHT : 38,
    ARROW_DOWN : 39,
    ARROW_LEFT : 40,
});

const props = {
    lines : 1,
    element : editorRef,
    counterRef : linesCounterRef,

    effects : {
        bold :  {
            ref : document.querySelector("#bold"), 
            isActive :false,
        }
    },

    addLine : function(){
        this.lines += 1;
        const newLine = document.createElement("li");
        newLine.textContent = this.lines;
        linesCounterRef.appendChild(newLine);
        this.syncScroll();

    },
    removeLine : function() {
        if(this.lines > 1) {
            linesCounterRef.removeChild(linesCounterRef.lastChild);
            this.lines -=1;
            this.syncScroll();
        }
    },

    syncScroll : function(){
        this.counterRef.scroll(0, this.element.scrollTop);
    },

};

const Editor = new Proxy(props, {});

Editor.element.addEventListener("keydown", e => {
    const currlineCount = Editor.element.childElementCount;

    if(e.keyCode == keyMap.ENTER ) {
        Editor.addLine();
    }else if(e.keyCode == keyMap.BACKSPACE && currlineCount <= Editor.lines) {
        Editor.removeLine();
    }else if(e.keyCode >= keyMap.ARROW_UP || e.keyCode <= keyMap.ARROW_LEFT ) {
        sendCaretCoords(getCaretCoords());
        sendText(Editor.element.innerHTML);
    }
});

Editor.element.addEventListener("scroll", Editor.syncScroll.bind(Editor));

Editor.effects.bold.ref.addEventListener("click", e => {
    Editor.effects.bold.isActive = !Editor.effects.bold.isActive;

    //TODO: reflect bold active when writing
    //TODO: fix bugs when removes bold
    const range = window.getSelection().getRangeAt(0);
    const parent = range.startContainer.parentElement.parentElement;
    
    if(Editor.effects.bold.isActive && !parent.getAttribute("data-bold")) {

        const wrap = document.createElement("span");
        wrap.setAttribute("data-bold", "true")
        const bold = document.createElement("b");
        bold.appendChild(range.extractContents())
        wrap.appendChild(bold)
        range.insertNode(wrap);


    }else {
        const isBold = parent.getAttribute("data-bold");

        if(isBold) {

            parent.previousSibling.textContent += range.startContainer.textContent;
            parent.remove()
        }
    }

});

Editor.element.addEventListener("click", e => {
    sendCaretCoords(getCaretCoords());
});

window.addEventListener("guestCaretUpdate", e => {
    updateGuestCaretCoords(e.detail);
});

window.addEventListener("textUpdate", e => {
    updateTextContent(e.detail);
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
    //TODO: migrate to use WsEvent class
    if(coords) ws.send( JSON.stringify({
        eventType : WsEventType.CARET_CORD, 
        data : coords,
    }));
}

function sendText(text) {
    if(text) ws.send(JSON.stringify( new WsEvent(WsEventType.TEXT, text) ));
}

function updateTextContent(text) {
    Editor.element.innerHTML = text;
}

function updateGuestCaretCoords(coords) {
    console.log(coords)
    guest.style.left = `${coords.x+ 5}px`;
    guest.style.top =  `${coords.y + 5}px`;
}