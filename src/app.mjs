"use strict";

import VisualisationManager from './lib/VisualisationManager.mjs';

window.addEventListener("load", async (event) => {
	const filepaths = await (await fetch(`./index.json`, {
		cache: 'no-cache'
	})).json();
	
	const manager = new VisualisationManager(
		filepaths // Dynamic :D
		// [ // Currently, only the first item is rendered. To select which to render, we'd need some UI element
		// 	"./data/wikipedia-multilang_g50_UMAP-d3.txt.gz",
		// 	"./data/tweets-all-new-20220117-glove_twitter_27B_50d-UMAPPED_d3.txt.gz",
		// 	"./data/tweets-all-new-20220117-glove_twitter_27B_50d-UMAPPED_d2.tsv.gz"
		// ]
	);
	await manager.init();
});
