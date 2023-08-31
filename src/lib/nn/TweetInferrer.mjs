"use strict";

import tf from '@tensorflow/tfjs-core';
import tflite from "@tensorflow/tfjs-tflite";
import GloVe from "./GloVe.mjs";

class TweetInferrer {
	constructor(uri_checkpoint, uri_glove) {
		this.uri_checkpoint = uri_checkpoint;
		this.glove = new GloVe(this.uri_glove);
	}
	
	async load() {
		await Promise.all([
			this.glove.load(),
			(async () => {
				this.model = tflite.loadTFLiteModel(this.uri_checkpoint);
			})()
		]);
	}
	
	async infer(str) {
		const result = tf.tidy(() => {
			const embeddings = this.glove.from_sentence(str)
				.map(arr => tf.tensor(arr));
			
			// TODO: This will probably need to match the batch size of the model
			const input = embeddings.expandDims();
			
			return this.model.predict(input);
		});
	}
}

export default TweetInferrer;