"use strict";

import * as BABYLON from 'babylonjs';

import extract from "../io/extract.mjs";

export default function cloud_extent(data_3d) {
	if(data_3d.length == 0) return null;
	
	const point_min = extract.point(data_3d[0]);
	const point_max = extract.point(data_3d[0]);
	
	for(const row of data_3d) {
		const point = extract.point(row);
		for (const i in point) {
			if (point[i] > point_max[i])
				point_max[i] = point[i];
			if (point[i] < point_min[i])
				point_min[i] = point[i];
		}
	}
	
	const result = {
		min: new BABYLON.Vector3(...point_min),
		max: new BABYLON.Vector3(...point_max)
	};
	return result;
}