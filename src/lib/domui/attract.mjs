"use strict";

export default function attract(url) {
	return new Promise((resolve, reject) => {
		if(typeof url != "string") reject(new Error(`Error: Expected url to be a string, got ${typeof url}`));
		
		const img = new Image();
		img.addEventListener("error", reject, { once: true });
		img.addEventListener("load", (_event) => {
			const canvas = document.querySelector("#attraction-canvas");
			const ctx = canvas.getContext("2d");
			
			ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
			
			img.removeEventListener("error", reject);
			resolve();
		}, { once: true });
		img.src = url;
	});
}