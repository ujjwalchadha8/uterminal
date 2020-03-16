## UTerminal
Open source, front end terminal with following features:
- Easy to integrate in Vanilla HTML/JS projects as well as typescript
- Supports command/Input suggestions
- Autosaves all commands to for quick reload with up and down arrow
- Set the UI with CSS library

### Install using npm
```
npm install uterminal
```

### How to use

#### HTML
```HTML
<div style="width: 200px; height: 500px;" class="uterminal" id="terminal-id"></div>
```

#### Javascript
```javascript
 const terminal = new UTerminal("terminal-id", "signature");
 terminal.init();
 terminal.newCommandLine();
 terminal.onNewCommand(command => {
     // handle command here
	 console.log(command);
	 terminal.write("Response");
	 terminal.newCommandLine();
 });
```

#### See Live Working [here](https://ujjwal-chadha.web.app/)


