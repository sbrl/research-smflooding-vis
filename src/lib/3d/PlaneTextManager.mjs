"use strict";

import { Vector3 } from 'babylonjs';
import Octree, { Vec3 } from "octree-es";
import array_differ from "array-differ";

import extract from '../io/extract.mjs';
import diffuse from './materials/diffuse.mjs';
import range from './range.mjs';

// const BILLBOARDMODE_NONE	= 0;
const BILLBOARDMODE_ALL		= 7;

class PlaneTextManager {
	constructor(data_transformed, scene) {
		this.scene = scene;
		
		this.planes = new Map();
		
		const range_result = range(data_transformed.map(row => row[1]));
		range_result.min = range_result.min.subtract(new Vector3(10, 10, 10));
		range_result.max = range_result.max.add(new Vector3(10, 10, 10));
		
		const origin = new Vec3(range_result.min.x, range_result.min.y, range_result.min.z);
		const size = new Vec3(range_result.max.x, range_result.max.y, range_result.max.z);
		
		this.data_transformed = data_transformed;
		this.points = new Octree(
			new Vec3(-1000, -1000, -1000), // origin
			new Vec3(2000, 2000, 2000) // size - we assume that this is NOT a radius-like thing
		);
		this.radius = 20;
		this.min_delay = 100;
		this.offset = new Vector3(0, 0.3, 0);
		this.last_update = new Date();
		
		this.#init(data_transformed);
		
		this.next_id = 0;
	}
	
	#pos_tostring(pos) {
		return `(${pos.x}, ${pos.y}, ${pos.z})`;
	}
	
	#init(data_transformed) {
		console.log(`DEBUG:PlaneTextManager init:START`);
		for (const item of data_transformed) {
			this.points.add(
				new Vec3(item[1].x, item[1].y, item[1].z),
				item[0] // data
			);
		}
		console.log(`DEBUG:PlaneTextManager init:END`);
	}
	
	#findNearbyPoints(pos, radius) {
		const result = { points: [], data: [] };
		for(const item of this.data_transformed) {
			if(Vector3.Distance(pos, item[1]) > radius)
				continue;
			
			result.data.push(item[0]);
			result.points.push(item[1]);
		}
		return result;
	}
	
	#should_update() {
		const now = new Date();
		if(now - this.last_update >= this.min_delay) {
			this.last_update = now;
			return true;
		}
		return false;
	}
	
	update(pos) {
		if(!this.#should_update()) return;
		// console.log(`DEBUG:PlaneTextManager update:START`);
		// const pos_oct = new Vec3(pos.x, pos.y, pos.z);
		// const result = this.points.findNearbyPoints(pos_oct, this.radius);
		const result = this.#findNearbyPoints(pos, this.radius);
		// console.log(`DEBUG:PlaneTextManager octree pos`, pos, `radius`, this.radius, `result`, result);
		const pos_strs_new = result.points.map(point => this.#pos_tostring(point));
		
		let create = 0, create_skip = 0, del = 0;
		
		for(const i in result.points) {
			// If it's already drawn, then keep it
			if(this.planes.has(pos_strs_new[i])) {
				create_skip++;
				continue;
			}
			create++;
			this.#create(result.points[i], result.data[i]);
			// console.log(`DEBUG:PlaneTextManager CREATE pos`, result.points[i], `data`, result.data[i]);
		}
		
		// Delete all the planes that are now out of range
		// TODO: Recycle them instead
		const to_remove = array_differ([...this.planes.keys()], pos_strs_new);
		for(const pos_str_old of to_remove) {
			this.#delete(pos_str_old);
			del++;
		}
		
		// console.log(`DEBUG:PlaneTextManager update:END pos ${pos} octree_points ${result.points.length} | planes ${this.planes.size} | create ${create} (${create_skip} skip) | delete ${del}`);
	}
	
	#get_rect_bounds(plane_size, text_width) {
		const radius_height = 12;
		const width_padding = 10;
		
		// x, y, width, height
		return [
			(plane_size/2) - (text_width/2 + width_padding),	// x
			(plane_size/2) - radius_height,	// y
			text_width + (width_padding * 2),	// width
			radius_height * 2,	// height
		];
	}
	
	#create(pos, text) {
		let pos_bab = new BABYLON.Vector3(pos.x, pos.y, pos.z);
		
		const name = `plane-text_${++this.next_id}`;
		const plane = new BABYLON.MeshBuilder.CreatePlane(name, {
			width: 8, height: 6
		});
		plane.position = pos_bab.add(this.offset);
		
		const texture = new BABYLON.DynamicTexture("text", 256, this.scene);
		const ctx = texture.getContext();
		ctx.rect(...this.#get_rect_bounds(256, ctx.measureText(text).width));
		ctx.fillStyle = "white";
		ctx.fill();
		ctx.fillStyle = "black";
		texture.drawText(text, null, null, "12px sans-serif");
		texture.hasAlpha = true;
		
		plane.material = diffuse(this.scene, new BABYLON.Color4(64, 44, 38));
		plane.material.diffuseTexture = texture;
		
		plane.billboardMode = BILLBOARDMODE_ALL;
		
		const pos_str = this.#pos_tostring(pos_bab);
		this.planes.set(pos_str, {
			plane,
			texture
		});
	}
	
	#delete(pos_str) {
		const item = this.planes.get(pos_str);
		this.scene.removeTexture(item.texture);
		this.scene.removeMaterial(item.plane.material);
		this.scene.removeMesh(item.plane);
		this.planes.delete(pos_str);
		// console.log(`DEBUG:PlaneTextManager DELETE at ${pos_str} text ${item.text}`);
	}
}

export default PlaneTextManager;