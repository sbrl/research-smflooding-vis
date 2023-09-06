"use strict";


const button_map = new Map();
button_map.set(`0`, `button_x`);
button_map.set(`1`, `button_circle`);
button_map.set(`2`, `button_triangle`);
button_map.set(`3`, `button_square`);
button_map.set(`4`, `button_bumper_left`);
button_map.set(`5`, `button_bumper_right`);

const axis_map = new Map();
axis_map.set(0, `axis_left_horizontal`);
axis_map.set(1, `axis_left_vertical`);
axis_map.set(2, `bumper_left`);
axis_map.set(3, `axis_right_horizontal`);
axis_map.set(4, `axis_right_vertical`);
axis_map.set(5, `bumper_right`);
axis_map.set(6, `dpad_horizontal`);
axis_map.set(7, `dpad_vertical`);

console.log(`DEBUG:GamepadController BUTTON_MAP`, button_map);

class GamepadController extends EventTarget {
	
	constructor() {
		super();
		this.gamepads = {};
		this.state = {};
		
		// Axis changes smaller than this value will not be reported.
		this.sensitivity = 0.001;
		
		
		window.addEventListener("gamepadconnected", event => {
			console.log(`DEBUG:gamepad CONNECT`, event.gamepad);
			
			this.gamepads[event.gamepad.index] = event.gamepad;
		});
		window.addEventListener("gamepaddisconnected", event => {
			console.log(`DEBUG:gamepad DISCONNECT`, event.gamepad);
			delete this.gamepads[event.gamepad.index];
		})
		// ("button_press", event => {
		// 	const { index: gamepad } = event.detail.gamepad;
		// 	const { buttonName: button_pressed } = event.detail;
		// 	const button = button_map[button_pressed] ?? `UNKNOWN`;
		// 	console.log(`DEBUG:gamepad BUTTON`, button_pressed, `→`, button, `gamepad`, gamepad, `event`, event);
		// });
		// ("axis_move", event => {
		// 	const { stickMoved: stick } = event.detail;
		// 	console.log(`DEBUG:gamepad AXIS_MOVE stick`, stick, `event`, event.detail);
		// });
	}
	
	trigger_axis(gamepad, axis_index, state_now, state_prev) {
		const axis_name = axis_map.get(axis_index) ?? `UNKNOWN`;
		console.log(`DEBUG:GamepadController AXIS_CHANGED gamepad`, gamepad.index, `axis`, axis_name, `/`, axis_index, `prev`, state_prev, `now`, state_now);
		this.dispatchEvent(new Event(`axis_changed`, {
			detail: {
				gamepad,
				axis_index,
				prev: state_prev,
				now: state_now
			}
		}));
	}
	
	trigger_button(gamepad, button_index, state_prev, state_now) {
		const button_human = button_map.get(button_index) ?? `UNKNOWN`;
		
		if(state_prev && !state_now) {
			console.log(`DEBUG:GamepadController BUTTON_RELEASED gamepad`, gamepad.index, `button`, button_index, typeof button_index, `button_human`, button_human)
			this.dispatchEvent(new Event(`button_released`, {
				detail: {
					gamepad,
					button_index,
					button_human
				}
			}));
		}
		if (!state_prev && state_now) {
			console.log(`DEBUG:GamepadController BUTTON_PRESSED gamepad`, gamepad.index, `button`, button_index, typeof button_index, `button_human`, button_human)
			this.dispatchEvent(new Event(`button_pressed`, {
				detail: {
					gamepad,
					button_index,
					button_human
				}
			}));
		}
	}
	
	update() {
		for(const gamepad of Object.values(this.gamepads)) {
			if(!this.state[gamepad.index])
				this.state[gamepad.index] = { buttons: {} };
			
			const state = this.state[gamepad.index];
			
			for(const i in gamepad.buttons) {
				if(state.buttons[i]) {
					if(gamepad.buttons[i].pressed !== state.buttons[i].pressed)
						this.trigger_button(gamepad, i,
							state.buttons[i].pressed,
							gamepad.buttons[i].pressed
						);
				}
				state.buttons[i] = {
					pressed: gamepad.buttons[i].pressed
				};
			}
			
			const axis_updates = gamepad.axes.map((axis_val, i) => {
				if (state.axes) {
					const axis_val_prev = state.axes[i];
					if (Math.abs(axis_val - axis_val_prev) > this.sensitivity) {
						this.trigger_axis(gamepad, i, axis_val, axis_val_prev);
						return true;
					}
				}
				return false;
			});
			
			state.axes = gamepad.axes.map((val, i) => {
				if(axis_updates[i]) return val;
				if(state.axes) return state.axes[i];
				else return val;
			});
		}
	}
}

const controller = new GamepadController();
const update_fn = controller.update.bind(controller);

const do_update = function() {
	update_fn();
	requestAnimationFrame(do_update);
};
do_update();

export default controller;