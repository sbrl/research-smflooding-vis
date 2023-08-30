"use strict";

import * as BABYLON from 'babylonjs';

import umap_point_cloud from './umap_point_cloud.mjs';

var engine = null;
var scene = null;
var current_scene = null;

window.addEventListener("resize", function () {
	if(engine === null) return; // The engine may not be ready yet
	engine.resize();
});

function render_loop(engine, canvas) {
	if(engine === null) {
		console.error(`Attempt to initialise render loop before the engine is ready.`);
		return;
	}
	
	engine.runRenderLoop(() => {
		if(current_scene && current_scene.activeCamera) {
			current_scene.render();
		}
	});
}

function create_engine(canvas) {
	return new BABYLON.Engine(canvas, true, {
		preserveDrawingBuffer: true,
		stencil: true,
		disableWebGL2Support: false
	});
}

async function babylon_renderer(manager) {
	engine = create_engine(manager.canvas);
	if(!engine)
		throw new Error(`Failed to create Babylon.js engine.`);
	
	render_loop(engine, manager.canvas);
	scene = await umap_point_cloud(engine, manager);
	if(!scene) throw new Error(`Error: umap_point_cloud did not return a scene.`);
	
	setTimeout(() => {
		current_scene = scene;
	}, 0);
}


export default babylon_renderer;