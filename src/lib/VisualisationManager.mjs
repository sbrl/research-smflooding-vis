"use strict";

import fetch_umap from "./io/fetch_umap.mjs";

import babylon_renderer from "./3d/babylon_renderer.mjs";
import filepicker from "./domui/filepicker.mjs";

class VisualisationManager {
	constructor(filepaths_umap) {
		// TODO: Implement UI to choose file to load
		this.filepaths_umap = filepaths_umap;
		
		this.canvas = document.querySelector("#render-canvas");
	}
	
	async init() {
		const target_filepath = await filepicker(this.filepaths_umap);
		
		this.data = await fetch_umap(target_filepath);
		// this.data = await fetch_umap(this.filepaths_umap[0]);
		// this.data = await fetch_umap(this.filepath_umap_2d);
		
		
		console.log(this.data);
		
		await babylon_renderer(this);
	}
}

export default VisualisationManager;