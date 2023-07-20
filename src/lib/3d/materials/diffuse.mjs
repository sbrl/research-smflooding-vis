"use strict";

import { StandardMaterial } from 'babylonjs';

let next = 0;

export default function diffuse(scene, colour) {
	const mat = new StandardMaterial(`materialdiffuse${next++}`, scene);
	mat.diffuseColor = colour;
	return mat;
}