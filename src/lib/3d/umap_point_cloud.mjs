"use strict";

import * as BABYLON from 'babylonjs';

import extract from '../io/extract.mjs';
import cloud_extent from './cloud_extent.mjs';

import pointer_lock from './pointer_lock.mjs';

function make_camera_fps(scene) {
	// This creates and positions a free camera (non-mesh)
	const camera = new BABYLON.UniversalCamera("camera1", new BABYLON.Vector3(0, 5, -10), scene);
	
	camera.inputs.addMouseWheel();
	camera.inputs.attached["mousewheel"].wheelPrecisionX = 0.5;
	camera.inputs.attached["mousewheel"].wheelPrecisionY = 0.5;
	camera.inputs.attached["mousewheel"].wheelPrecisionZ = 0.5;
	// console.log(camera.inputs.attached);
	// const keyboard = camera.inputs.attached["keyboard"].
	
	camera.keysUpward = [32,17];
	camera.keysDownward = [16];
	// camera
	
	// This targets the camera to scene origin
	camera.setTarget(BABYLON.Vector3.Zero());
	
	return camera;
}

function make_camera_orbit(scene) {
	const camera = new BABYLON.ArcRotateCamera("camera_orbit",
		BABYLON.Tools.ToRadians(0),
		BABYLON.Tools.ToRadians(60),
		30,
		BABYLON.Vector3.Zero(),
		scene
	);
	camera.inputs.addGamepad();
	camera.lowerRadiusLimit = 1;
	camera.inputs.attached["mousewheel"].wheelPrecision = 10;
	
	return camera;
}

function point_importer(data_3d, scale_val=1) {
	const extent = cloud_extent(data_3d);
	const range = extent.max.subtract(extent.min);
	const offset = extent.min
		.add(range.divide(new BABYLON.Vector3(2, 2, 2)))
		.multiply(new BABYLON.Vector3(-1, -1, -1));
	const scale = new BABYLON.Vector3(scale_val, scale_val, scale_val);
	return (particle, i, i_group) => {
		particle.position = (new BABYLON.Vector3(
			...extract.point(data_3d[i])
		)).add(offset).multiply(scale);
	};
}

function umap_point_cloud(engine, manager) {
	// For testing.
	
	// This creates a basic Babylon Scene object (non-mesh)
	const scene = new BABYLON.Scene(engine);
	pointer_lock(scene);
	
	const camera = make_camera_fps(scene);
	// const camera = make_camera_orbit(scene);
	// TODO: investigate switching camera modes between orbit & fps
	// This attaches the camera to the canvas
	camera.attachControl(manager.canvas, true);
	
	camera.onViewMatrixChangedObservable.add(() => {
		const nearest_point = manager.collision_3d.find_looking_point(camera.getForwardRay());
		console.log(`DEBUG:babylon/umap_point_cloud nearest_point`, nearest_point);
	});

	// This creates a light, aiming 0,1,0 - to the sky (non-mesh)
	const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
	light.intensity = 0.7; // Default: 1
	
	
	const point_cloud = new BABYLON.PointsCloudSystem("umap", 1, scene);
	point_cloud.addPoints(
		manager.data_3d.length,
		point_importer(manager.data_3d, 5)
	);
	point_cloud.buildMeshAsync(); // Would return a mesh if we awaited it

	// Our built-in 'sphere' shape.
	// const sphere = BABYLON.MeshBuilder.CreateSphere("sphere", { diameter: 0.5, segments: 32 }, scene);
	// sphere.material = new BABYLON.StandardMaterial("sphere material", scene);
	// sphere.material.diffuseColor = new BABYLON.Color3(0.196, 0.172, 0.784);
	// sphere.position.y = 1; // Move the sphere upward 1/2 its height
	
	
	
	// // Our built-in 'ground' shape.
	// const ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 6, height: 6 }, scene);
	// ground.material = new BABYLON.StandardMaterial("Ground Material", scene);
	// ground.material.diffuseColor = BABYLON.Color3.Red();

	return scene;
}

export default umap_point_cloud;