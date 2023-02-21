const editorRef =  document.querySelector("#editor");
const linesCounterRef = document.querySelector("#linesCounter");



class Note {
    constructor(lines = 1) {
        this.pageWidth = editorRef.offsetWidth;
        this.fontSize = 10;
        this.lines = new Array();

        for(let i= 0 ; i < lines; ++i ) {
            const line = this.#line();
            this.lines.push(line);
        }

    }

    #line() {
        return new Array();
    }

    insertText(text, posx, posy, effects) {
        text.split("").forEach((char, index) => {
            const glyph = new Glyph(char, posx, posy, effects);
            this.lines[posy].splice(index, 0, glyph);
        });
    }

    putChatAt(char, {line, col}) {
        const glyph = new Glyph(char, col, line, null);
        this.lines[line ].splice(col, 0, glyph);
    }

    addLine() {
        this.lines.push(this.#line());
    }
}
class Glyph {
    constructor(char, posx, posy, effects) {
        this.char = char;
        this.posx = posx;
        this.posy = posy;
        this.effects = effects;
    }
}



class JeopardyDocEngine {
    /**
     * 
     * @param {Note} note 
     */
    render(note) {
        Editor.element.innerHTML = "";
        Editor.counterRef.innerHTML = "";
        Editor.lines = 0;

        
        note.lines.forEach((line, index) => {
            const d = document.createElement("div");
            d.setAttribute("line-index", index);
            d.classList.add("line");

            line.forEach(glyph => {
                if(glyph) {

                    const parsedGlyph = this.parseGlyph(glyph);
                    parsedGlyph.contentEditable = false;
                    d.appendChild( parsedGlyph );                    
                }
            }); 

            Editor.element.appendChild(d);
            Editor.addGuiLine();
        });

        
    }

    /**
     * TODO: implement effects
     * @param {Glyph} glyph 
     */
    parseGlyph(glyph) {
        const span = document.createElement("span");
        span.textContent = glyph.char;
        return span;
    }
}


const Editor = new Proxy({
    lines : 1,
    element : editorRef,
    counterRef : linesCounterRef,
    ws : null,
    carets: [],
    users : [],

    engine : new JeopardyDocEngine(),
    doc : new Note(),

    addLine : function(){
        this.addGuiLine();
        this.addDocLine();
    },

    addGuiLine() {
        this.lines += 1;
        const newLine = document.createElement("li");
        newLine.textContent = this.lines;
        linesCounterRef.appendChild(newLine);
        this.syncScroll();
    },

    addDocLine() {
        this.doc.addLine();
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

    getUser : function(id) {
        return this.users.find(u => u.id == id);
    },

    rerender: function() {
        this.engine.render(this.doc);
    }   

}, {
    set: function(target, attr, value) {
        if(attr === "doc") {
            target.engine.render(value);
            target.doc.lines = value.lines;
            target.doc.fontSize = value.fontSize;
            target.doc.pageWidth = value.pageWidth;

        }else {
            target[attr] = value;
        }
        return true;
    }
});


// const doc = new Note(4);
// doc.insertText("testing my engine", 0, 4);
// Editor.engine.render(doc);

export default Editor;