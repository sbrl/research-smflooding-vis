"use strict";

import fetch_umap from "./io/fetch_umap.mjs";

import babylon_renderer from "./3d/babylon_renderer.mjs";

class VisualisationManager {
	constructor(filepath_umap_3d, filepath_umap_2d) {
		this.filepath_umap_3d = filepath_umap_3d;
		this.filepath_umap_2d = filepath_umap_2d;
		
		this.canvas = document.querySelector("#render-canvas");
	}
	
	async init() {
		this.data_3d = await fetch_umap(this.filepath_umap_3d);
		this.data_2d = await fetch_umap(this.filepath_umap_2d);
		
		
		console.log(this.data_3d);
		
		await babylon_renderer(this);
	}
}

export default VisualisationManager;