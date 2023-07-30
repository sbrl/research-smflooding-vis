"use strict";

import { Vector3 } from 'babylonjs';

export default function range(points) {
	const min = points[0].clone();
	const max = points[0].clone();
	
	for(const point of points) {
		if(point.x < min.x) min.x = point.x;
		if(point.y < min.y) min.y = point.y;
		if(point.z < min.z) min.z = point.z;
		
		if (point.x > max.x) max.x = point.x;
		if (point.y > max.y) max.y = point.y;
		if (point.z > max.z) max.z = point.z;
	}
	
	return { min, max };
}