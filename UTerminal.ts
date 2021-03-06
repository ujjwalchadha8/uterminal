
class UTerminal {

    private rootElement: HTMLElement;
    private containerElement: HTMLElement;
    private signature: string;
    private handleCommand: Function | null;
    private suggestCommand: Function | null;
    private previousCommands: string[];

    constructor(id: string, signature: string) {
        this.rootElement = <HTMLElement> document.getElementById(id);
        this.containerElement = this.rootElement;
        this.signature = signature;
        this.handleCommand = null;
        this.suggestCommand = null;
        this.previousCommands = [];
    }

    init() {
        this.rootElement.addEventListener('click', () => {
            this.focus();
        });
    }

    giveCommandSuggestion(suggestCommand: Function) {
        this.suggestCommand = suggestCommand;
    }

    onNewCommand(handleCommand: Function) {
        this.handleCommand = handleCommand;
    }

    focus() {
        (<HTMLElement>this.containerElement.querySelector('[contenteditable=true]')).focus();
    }

    blankLine() {
        this.write('&nbsp;');
    }

    clear() {
        this.containerElement.innerHTML = "";
    }

    write(response: string) {
        const responseContainer = document.createElement('div');
        const responseElement = document.createElement('text');
        responseElement.innerHTML = response;
        responseContainer.appendChild(responseElement);
        this.containerElement.appendChild(responseContainer);
    }

    moveCursorToEnd() {
        setTimeout(() => {    //Move this out of the current function stack to let the cursor appear before moving it
            const contentEditableElement = <HTMLElement> this.containerElement.querySelector('[contenteditable=true]');
            const range = document.createRange();//Create a range (a range is a like the selection but invisible)
            range.selectNodeContents(contentEditableElement);//Select the entire contents of the element with the range
            range.collapse(false);//collapse the range to the end point. false means collapse to end rather than the start
            const selection = window.getSelection();//get the selection object (allows you to change selection)
            if (!selection) {
                return;
            }
            selection.removeAllRanges();//remove any selections already made
            selection.addRange(range);//make the range you have just created the visible selection
        }, 0);
    }

    input(message: string, handleInput: Function, suggest: Function) {
        const commandContainer = document.createElement('div');
        commandContainer.innerHTML = `
            <text>${message}</text>
            <text>&nbsp;<span contenteditable='true'></span></text><span contenteditable='false' class='suggestion'></span>
        `; 
        const editor = <HTMLElement> commandContainer.children[1].children[0];
        const suggestor = <HTMLElement> commandContainer.children[2];
        this.previousCommands.push("");
        let currentCommandNumber = this.previousCommands.length - 1;
        editor.addEventListener('keydown', (e: KeyboardEvent) => {
            if (e.key === "Enter") {
                e.preventDefault();
                editor.setAttribute('contenteditable', 'false');
                this.previousCommands[this.previousCommands.length -1] = editor.innerText;
                suggestor.innerText = "";
                if (handleInput)
                    handleInput(editor.innerText);
            } else if (e.key === "ArrowUp") {
                currentCommandNumber = Math.max(0, currentCommandNumber - 1);
                editor.innerText = this.previousCommands[currentCommandNumber];
                suggestor.innerText = "";
                this.moveCursorToEnd();
            } else if (e.key === "ArrowDown") {
                currentCommandNumber = Math.min(this.previousCommands.length - 1, currentCommandNumber + 1);
                editor.innerText = this.previousCommands[currentCommandNumber];
                suggestor.innerText = "";
                this.moveCursorToEnd();
            } else if (e.key === "Tab") {
                e.preventDefault();
                editor.innerText += suggestor.innerText;
                suggestor.innerText = "";
                this.moveCursorToEnd();
            }
        });
        editor.addEventListener('input', () => {
            if (suggest) {
                suggestor.innerText = suggest(editor.innerText) || "";
            }
            console.log('input', editor.innerText);
            currentCommandNumber = this.previousCommands.length - 1;
            this.previousCommands[currentCommandNumber] = editor.innerText;
        });
        this.containerElement.appendChild(commandContainer);
        this.focus();
    }

    newCommandLine() { 
        this.input(`<span style='color: green;'>${this.signature}$</span>`, (userCommand: string) => {
            if (!this.handleCommand) {
                console.error('No command handler specified for terminal. You can create a command handler by onNewCommand function.');
                return;
            }
            this.handleCommand(userCommand);
        }, (userInput: string) => {
            if (!this.suggestCommand) {
                return "";
            }
            return this.suggestCommand(userInput);
        });
    }

}

export default UTerminal;