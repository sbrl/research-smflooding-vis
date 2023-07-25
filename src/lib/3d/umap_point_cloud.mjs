"use strict";

import * as BABYLON from 'babylonjs';
import chroma from 'chroma-js';

import extract from '../io/extract.mjs';
import cloud_extent from './cloud_extent.mjs';
import pointer_lock from './pointer_lock.mjs';
import diffuse from './materials/diffuse.mjs';
import PCSAttenuationMaterialPlugin from './plugins/PCSAttenuationMaterialPlugin.mjs';

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
	
	// TODO: Add proper gamepad support ref https://doc.babylonjs.com/features/featuresDeepDive/input/gamepads
	
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

function point_importer(data_3d, scale_val=1, colourmap=null) {
	if(colourmap === null) {
		colourmap = chroma.scale([ // viridis, a perceptually uniform colourmap
			"#fde725", "#addc30", "#5ec962",
			"#28ae80", "#21918c", "#2c728e",
			"#3b528b", "#472d7b", "#440154"
		]).mode("lab");
	}
	const extent = cloud_extent(data_3d);
	const range = extent.max.subtract(extent.min);
	const offset = extent.min
		.add(range.divide(new BABYLON.Vector3(2, 2, 2)))
		.multiply(new BABYLON.Vector3(-1, -1, -1))
		.add(new BABYLON.Vector3(1.2, 1.2, 1.2));
	const scale = new BABYLON.Vector3(scale_val, scale_val, scale_val);
	return (particle, i, i_group) => {
		particle.position = (new BABYLON.Vector3(
			...extract.point(data_3d[i])
		)).add(offset).multiply(scale);
		const distance = (particle.position.length()+1) / (scale_val * 7);
		particle.color = BABYLON.Color4.FromHexString(colourmap(distance).toString("hex"));
		// console.log(`pos`, particle.position.toString(), `distance`, distance, `colour`, particle.color.toString());
	};
}

async function umap_point_cloud(engine, manager) {
	// For testing.
	
	// This creates a basic Babylon Scene object (non-mesh)
	const scene = new BABYLON.Scene(engine);
	pointer_lock(scene);
	
	const camera = make_camera_fps(scene);
	// const camera = make_camera_orbit(scene);
	// TODO: investigate switching camera modes between orbit & fps
	// This attaches the camera to the canvas
	camera.attachControl(manager.canvas, true);
	
	// camera.onViewMatrixChangedObservable.add(() => {
	// 	const nearest_point = manager.collision_3d.find_looking_point(camera.getForwardRay());
	// 	console.log(`DEBUG:babylon/umap_point_cloud nearest_point`, nearest_point);
	// });

	// This creates a light, aiming 0,1,0 - to the sky (non-mesh)
	const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
	light.intensity = 0.7; // Default: 1
	
	BABYLON.RegisterMaterialPlugin("PCSAttenuation", (material) => {
		material.pcsAttenuationPlugin = new PCSAttenuationMaterialPlugin(material);
		return material.colorify;
	})
	
	// Ref https://doc.babylonjs.com/typedoc/classes/BABYLON.PointsCloudSystem#particles
	// You can reference particles afterwards - e.g. to change colour, size, etc
	const point_cloud = new BABYLON.PointsCloudSystem("umap", 200, scene);
	point_cloud.addPoints(
		manager.data_3d.length,
		point_importer(manager.data_3d, 50)
	);
	await point_cloud.buildMeshAsync(); // Would return a mesh if we awaited it
	point_cloud.mesh.material.pcsAttenuationPlugin.isEnabled = true;
	
	// TODO: Put this above all points closer than X to the player
	const plane = new BABYLON.MeshBuilder.CreatePlane("plane-text", {
		width: 8, height: 8
	});
	const texture = new BABYLON.DynamicTexture("text", 256, scene);
	texture.drawText("flooding", null, null, "12px sans-serif", "#22222");
	texture.hasAlpha = true;
	plane.material = diffuse(scene, new BABYLON.Color4(64, 44, 38));
	plane.material.diffuseTexture = texture;
	
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
