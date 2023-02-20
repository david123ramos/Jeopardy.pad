const App = function(){
    
    
    document.addEventListener("DOMContentLoaded", init);
    var textA;
    var list;
    var selectedText = "";
    var selectedTextParent = null;

    function init() {

        const text = document.getElementById("text");
        textA = text
        text.addEventListener("keyup", actualizeLines);
        text.addEventListener("scroll", syncScroll);
        text.onmouseup = logSelection
        list = document.getElementById("countlines");

        const b = Bold();
        b.addEventListener("click",  () => {
            selectedTextParent

            const b = document.createElement("strong");
            b.textContent = selectedText.toString();

            const range = selectedText.getRangeAt(0);
            range.deleteContents();
            range.insertNode(b);
            
        });

        document.querySelector("#effects").appendChild( b );
    }

    function getLines(){
        return document.querySelector("ul").children.length;
    }

    function actualizeLines(event){

        const ENTER = 13;

        if(event.keyCode === ENTER){
            appendNumber( getLines() + 1 );
        }else{

            const newLines = textA.children.length;
            list.innerHTML ="";
            for(let i =1; i <= newLines; i++){ appendNumber(i) }
        }
    }
    
    function appendNumber(value){
        
        var children = Array.from(document.querySelector('ul').children).map(el => el.innerText);
        
        if(!children.includes(value+"")){

            var li = document.createElement("li");
            li.innerText = value ;
            list.appendChild(li);
        }
    }

    function syncScroll(){
        list.scrollTop = this.scrollTop;
    }

    function logSelection(event) {

        if (window.getSelection || document.getSelection) {
            selectedText = window.getSelection();
            selectedTextParent =  window.getSelection().anchorNode;
            console.log( selectedTextParent )
        } else if(document.selection) {
            selectedText = document.selection.createRange().text;
        }
    }
}();

const Bold = function(){
    const btn = document.createElement("button");
    btn.style.fontWeight = ""
    btn.innerHTML = "<strong>Bold</strong>";
    return btn;
}

function setCaret() {
    var el = document.getElementById("text")
    var range = document.createRange()
    var sel = window.getSelection()
    
    range.setStart(el,0)
    range.collapse(true)
    
    sel.removeAllRanges()
    sel.addRange(range)
}