"use strict";

import lines from 'readablestream-lines';

/**
 * Simple GloVe implementation.
 * Ported from Python: https://github.com/sbrl/research-smflooding/blob/bd8c04b519d2d5e3d1a7780e801a73000be7c0e0/src/lib/glove/glove.py
 */
class GloVe {
	constructor(filepath_glove) {
		this.uri_glove = filepath_glove;
		this.map = new Map();
	}
	
	async read() {
		const resp = await fetch(this.uri_glove);
		const reader = resp.body.getReader();
		for await (let line of lines(reader)) {
			let parts = line.split(" ");
			const word = parts.shift();
			this.map.set(word, Float32Array.from(parts.map(parseFloat)));
		}
		reader.releaseLock();
	}
	
	#tokenize(str) {
		return str.split(/[\s?!,.:]+/g);
	}
	
	#normalise(str) {
		// GloVe text normaliser. Ported from Python to JS ref https://github.com/sbrl/research-smflooding/blob/bd8c04b519d2d5e3d1a7780e801a73000be7c0e0/src/lib/glove/normalise_text.py#L82
		return str.replace(/https?:\/\/\S+\b|www\.(\w+\.)+\S*/g, " <url> ")
			.replace(/@\S+/g, " <user> ")
			.replace(/[8:=;]['`\-]?[)dD]+|[)dD]+['`\-]?[8:=;]/g, " <smile> ")
			.replace(/[8:=;]['`\-]?p+/g, " <lolface> ")
			.replace(/[8:=;]['`\-]?\(+|\)+['`\-]?[8:=;]/g, " <sadface> ")
			.replace(/[8:=;]['`\-]?[\/|l*]/g, " <neutralface> ")
			.replace(/\//g, " / ")
			.replace(/<3/g, " <heart> ")
			.replace(/[-+]?[.\d]*[\d]+[:,.\d]*/g, " <number> ")
			.replace(/([!?.]){2,}/g, " $1 <repeat> ")
			.replace(/\b(\S*?)(.)\2{2,}\b/g, " $1$2 <elong> ")
			.replace(/#\S+/g, match => {
				const body = match.substring(1);
				const upper = body.toLocaleUpperCase();
				if(body === upper)
					return body.toLocaleLowerCase();
				else {
					// Ref https://stackoverflow.com/a/20381799/1460422##comment107330111_20381799
					return ` `+body.split(/(?<![A-Z])(?=[A-Z])/g)+` `;
				}
			})
			.replace(/[A-Z]{2,}/g, " $& <allcaps> ")
			.replace(/’/g, "'")
			.replace(/([!?:;.,\[\]])/g, " $1 ")
			.replace(/\s+/g, " ")
			.toLocaleLowerCase();
	}
	
	from_sentence(sentence) {
		return this.from_tokens(this.#tokenize(
			this.#normalise(sentence)
		));
	}
	
	from_tokens(tokens, normalised=true) {
		if(!normalised) tokens = tokens.map(token => this.#normalise(token));
		const result = [];
		for(const token of tokens) {
			const embedding = this.map.get(token);
			if(embedding === null) continue;
			result.push(embedding.slice());
		}
		return result;
	}
}

export default GloVe;