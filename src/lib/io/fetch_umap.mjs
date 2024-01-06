"use strict";

import pako from 'pako';
import { TSV } from 'tsv';

// import Futility from 'futility';
import BadWordsNext from 'bad-words-next';
import en from 'bad-words-next/data/en.json';

// console.log(`DEBUG Futility`, Futility);
// const word_detector = new Futility.default();
const word_detector = new BadWordsNext({ data: en });

const DO_FILTER = true;

async function fetch_umap(source_url) {
	const response = await (await fetch(source_url)).arrayBuffer();
	const response8 = new Uint8Array(response);
	const inflated = pako.inflate(response8);
	
	const decoder = new TextDecoder();
	const response_str = decoder.decode(inflated);
	
	TSV.header = false;
	let result = TSV.parse(response_str).map(item => [
		`${item[0]}`, // Force string since npm's tsv doesn't support disabling parseFloat to let us do it manually
		...item.slice(1).map(parseFloat)
	]);
	if(DO_FILTER) {
		const count_before_filter = result.length;
		// result = result.filter(row => !word_detector.test(row[0]));
		result = result.filter(row => {
			return !word_detector.check(row[0])
		});
		const count_after_filter = result.length;
		const count_filtered = count_before_filter - count_after_filter;
		console.log(`[fetch_umap:FILTER] Filter active | ${count_before_filter} → ${count_after_filter}; filtered out ${count_filtered} rude words (${((count_filtered/count_before_filter)*100).toFixed(2)}%)`);
	}
	else {
		console.log(`[fetch_umap:FILTER] Filter NOT active.`);
	}
	
	return result;
}

export default fetch_umap;