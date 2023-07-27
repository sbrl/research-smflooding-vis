"use strict";

import Octree, { Vec3 } from "octree-es";
import array_differ from "array-differ";

import extract from '../io/extract.mjs';

class PlaneTextManager {
	constructor(manager, scene) {
		this.scene = scene;
		
		this.planes = new Map();
		
		this.points = new Octree(new Vec3(0, 0, 0), new Vec3(250, 250, 250));
		this.radius = 10;
		
		this.#init(manager.data_3d);
		
	}
	
	#pos_tostring(pos) {
		return `(${pos.x}, ${pos.y}, ${pos.z})`;
	}
	
	#init(data_3d) {
		for(const row of data_3d) {
			this.points.add(
				new Vec3(...extract.point(row)),
				extract.text(row)
			);
		}
	}
	
	update(pos) {
		const o_pos = new Vec3(pos.x, pos.y, pos.z);
		const result = this.points.findNearbyPoints(o_pos, this.radius);
		const pos_strs_new = result.points.map(point => this.#pos_tostring(point));
		for(const i in result.points) {
			// If it's already drawn, then keep it
			if(this.planes.has(pos_strs_new[i]))
				continue;
			
			this.#create(pos, result.data[i]);
			
		}
		
		// Delete all the planes that are now out of range
		// TODO: Recycle them instead
		const to_remove = array_differ(this.planes.keys(), pos_strs_new);
		for(const pos_str_old of to_remove)
			this.#delete(pos_str_old);
	}
	
	
	#create(pos, text) {
		if(pos instanceof Vec3)
			pos = new BABYLON.Vector3(pos.x, pos.y, pos.z);
		
		const plane = new BABYLON.MeshBuilder.CreatePlane("plane-text", {
			width: 8, height: 8
		});
		plane.position = pos;
		const texture = new BABYLON.DynamicTexture("text", 256, this.scene);
		texture.drawText(text, null, null, "12px sans-serif", "");
		texture.hasAlpha = true;
		plane.material = diffuse(scene, new BABYLON.Color4(64, 44, 38));
		plane.material.diffuseTexture = texture;
		const pos_str = this.#pos_tostring(pos);
		this.planes.set(pos_str, {
			pos,
			pos_str,
			plane,
			texture
		});
	}
	
	#delete(pos_str) {
		this.planes.delete(pos_str);
	}
}

export default PlaneTextManager;