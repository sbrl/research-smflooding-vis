"use strict";

/**
 * Activates optional locking of the mouse cursor.
 * @source	https://replit.com/talk/learn/Too-cool/15957/390729#adding-a-pointer-lock
 * @param   {BABYLON.Scene}  scene  The scene to enable pointer locking with.
 * @return  {undefined}
 */
function pointer_lock(scene) {
	const canvas = scene.getEngine().getRenderingCanvas();
	canvas.addEventListener("click", _event => {
		if(canvas.requestPointerLock)
			canvas.requestPointerLock();
	});
}

export default pointer_lock;