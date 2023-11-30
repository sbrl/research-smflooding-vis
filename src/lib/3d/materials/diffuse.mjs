"use strict";

import { StandardMaterial } from '@babylonjs/core';

let next = 0;

export default function diffuse(scene, colour) {
	const mat = new StandardMaterial(`materialdiffuse${next++}`, scene);
	// mat.diffuseColor = colour;
	mat.emissiveColor = colour;
	mat.disableLighting = true;
	return mat;
}