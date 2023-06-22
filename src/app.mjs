"use strict";

import VisualisationManager from './lib/VisualisationManager.mjs';

window.addEventListener("load", async (event) => {
	const manager = new VisualisationManager(
		"./data/tweets-all-new-20220117-UMAPPED_d3.txt.gz",
		"./data/tweets-all-new-20220117-UMAPPED_d2.tsv.gz"
	);
	await manager.init();
});