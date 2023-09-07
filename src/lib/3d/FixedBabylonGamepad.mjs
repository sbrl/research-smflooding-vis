"use strict";

import controller from "../input/GamepadController.mjs";

import { Vector2, Vector3 } from "@babylonjs/core";

class FixedBabylonGamepad {
	constructor(camera) {
		this.speed = 0.1;
		this.rotation_speed = 0.003;
		
		this.camera = camera;
		controller.addEventListener("axis_changed", this.handle_axis_changed.bind(this));
		controller.addEventListener("button_released", this.handle_button_released.bind(this));
		
		this.speed_vectors = {};
		this.rotation_speed_vectors = {};
		
		this.__update_fn = this.do_update.bind(this);
		
		this.__update_fn();
		
		this.last_update = new Date();
	}
	
	handle_button_released(event) {
		switch(event.detail.button_human) {
			case "button_bumper_left":
				console.log(`[GamepadController] button_bumper_left was released, reloading page`);
				location.reload();
				break;
			default:
				console.log(`[GamepadController] Button released:`, event.detail.button_human);
		}
	}
	
	handle_axis_changed(event) {
		// console.log(`DEBUG:FixedBabylonGamepad AXIS`, event.detail);
		const { now, axis_name } = event.detail;
		
		switch (event.detail.axis_name) {
			case `axis_left_horizontal`:
				const rotationLeftRight = (new Vector2(0, 1)).scale(now * this.rotation_speed);
				this.rotation_speed_vectors[axis_name] = [rotationLeftRight, +new Date()];
				break;
			case `axis_left_vertical`:
				const rotationUpDown = (new Vector2(1, 0)).scale(now * this.rotation_speed);
				this.rotation_speed_vectors[axis_name] = [rotationUpDown, +new Date()];
				break;
			case `axis_right_vertical`:
				const move_by_prescale = this.camera.getDirection(Vector3.Backward());
				const move_by = move_by_prescale.scale(this.speed * now);

				if (move_by_prescale.length() < 0.1)
					delete this.speed_vectors[axis_name];
				else
					this.speed_vectors[axis_name] = [move_by, +new Date()];

				break;
			case `axis_right_horizontal`:
				const move_by_lr_prescale = this.camera.getDirection(Vector3.Right());
				const move_by_lr = move_by_lr_prescale.scale(this.speed * now);
				
				if(move_by_lr_prescale.length() < 0.1)
					delete this.speed_vectors[axis_name];
				else
					this.speed_vectors[axis_name] = [ move_by_lr, +new Date() ];
				
				break;
			
			case `dpad_vertical`:
				let move_vertical = Vector3.Down().scale(now * this.speed);
				console.log(`DEBUG:FixedBabylonGamepad dpad_vertical FINAL`, move_vertical, `now`, now, `speed`, this.speed);
				this.speed_vectors[axis_name] = [ move_vertical, +new Date() ];
				break;

			case `bumper_left`:
				if (now == -1)
					delete this.speed_vectors[axis_name];
				else {
					const move_down = Vector3.Down().scale((now + 1) / 2 * this.speed);
					this.speed_vectors[axis_name] = [move_down, +new Date()];
				}
				break;
			case `bumper_right`:
				if (now == -1)
					delete this.speed_vectors[axis_name];
				else {
					const move_down = Vector3.Up().scale((now + 1) / 2 * this.speed);
					this.speed_vectors[axis_name] = [move_down, +new Date()];
				}
				break;
		}
		
		// if(move_by !== null) {
		// 	console.log(`DEBUG DEBUG move_by`, move_by);
		// 	this.camera.cameraDirection.addInPlace(move_by);
		// }
	}
	
	do_update() {
		for(const i of Object.keys(this.speed_vectors)) {
			const [ vector, last_update ] = this.speed_vectors[i];
			// console.log(`DEBUG:FixedBabylonGamepad APPLY vector`, vector);
			this.camera.cameraDirection.addInPlace(vector);
			if(+new Date() - last_update > 100 && vector.length() < 0.05)
				delete this.speed_vectors[i];
		}
		
		for (const i of Object.keys(this.rotation_speed_vectors)) {
			const [ vector, last_update ] = this.rotation_speed_vectors[i];
			this.camera.cameraRotation.addInPlace(vector);
			if(+new Date() - last_update > 100 && vector.length() < 0.001)
				delete this.rotation_speed_vectors[i];
		}
		
		requestAnimationFrame(this.__update_fn);
	}
}

export default FixedBabylonGamepad;