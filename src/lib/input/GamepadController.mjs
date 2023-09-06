"use strict";

import 'joypad.js';

console.log(`DEBUG:GamepadController`, joypad);

class GamepadController {
	constructor() {
		joypad.on("connect", event => {
			console.log(`DEBUG:joypad CONNECT`, event);
		});
		joypad.on("buttonPress", event => {
			console.log(`DEBUG:joypad BUTTON`, event);
		});
	}
	
	
}

export default GamepadController;