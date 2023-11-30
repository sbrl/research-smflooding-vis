"use strict";

import attract_url from '../attract.jpeg';
import fetch_umap from "./io/fetch_umap.mjs";

import babylon_renderer from "./3d/babylon_renderer.mjs";
import filepicker from "./domui/filepicker.mjs";
import attract from "./domui/attract.mjs";
import loading from './domui/loading.mjs';

class VisualisationManager {
	constructor(filepaths_umap) {
		// TODO: Implement UI to choose file to load
		this.filepaths_umap = filepaths_umap;
		
		this.canvas = document.querySelector("#render-canvas");
	}
	
	async init() {
		attract(attract_url); // NOTE: This is indeed an async function.... but we want to just get the image done at the same time as loading the file picker for speed.
		const target_filepath = await filepicker(this.filepaths_umap);
		
		loading.start();
		
		this.data = await fetch_umap(target_filepath);
		// this.data = await fetch_umap(this.filepaths_umap[0]);
		// this.data = await fetch_umap(this.filepath_umap_2d);
		console.log(this.data);
		
		
		// Hide the attraction canvas now we're ready to display the real one
		const canvas_attract = document.querySelector("#attraction-canvas");
		canvas_attract.remove();
		this.canvas.classList.remove(`gone`);
		
		loading.end();
		
		await babylon_renderer(this);
	}
}

export default VisualisationManager;