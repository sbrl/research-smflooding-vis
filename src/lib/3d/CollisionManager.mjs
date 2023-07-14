"use strict";

import yaot from 'yaot';

import { text, point } from '../io/extract.mjs';

class CollisionManager {
	constructor(manager) {
		this.manager = manager;
		
		this.tree = yaot();
		this.tree.init(manager.data_3d.map(item => point(item)).flat());
		
		this.nearest_x = 100;
		this.sphere_size = 1;
	}
	
	find_looking_point(ray) {
		const nearest = this.tree.intersectRay(
			ray.origin,
			ray.direction
		);
		// TODO: Try https://doc.babylonjs.com/typedoc/classes/BABYLON.Vector3#Project ?
		for(const index of nearest) {
			const item = this.manager.data_3d[index];
			
		}
		
		console.log(`DEBUG:CollisionManager nearest`, nearest);
	}
}

export default CollisionManager;