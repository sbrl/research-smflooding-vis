"use strict";

function load_start() {
	document.body.classList.add(`loading`);
}

function load_end() {
	document.body.classList.remove(`loading`);
}

export default {
	start: load_start,
	end: load_end
};