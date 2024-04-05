"use strict";

var loading_time = null;

function load_start() {
	loading_time = new Date();
	document.body.classList.add(`loading`);
}

function load_end() {
	document.body.classList.remove(`loading`);
	console.log(`Loading complete in ${(new Date() - loading_time)}s`)
}

export default {
	start: load_start,
	end: load_end
};