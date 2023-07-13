"use strict";

function extract_text(row) {
	return row[0];
}

function extract_point(row) {
	return row.slice(1);
}

export default {
	text: extract_text,
	point: extract_point
};
export {
	extract_point as point,
	extract_text as text
};