"use strict";

import pako from 'pako';
import { TSV } from 'tsv';

async function fetch_umap(source_url) {
	const response = await (await fetch(source_url)).arrayBuffer();
	const response8 = new Uint8Array(response);
	const inflated = pako.inflate(response8);
	
	const decoder = new TextDecoder();
	const response_str = decoder.decode(inflated);
	
	TSV.header = false;
	const result = TSV.parse(response_str).map(item => [
		item[0],
		...item.slice(1).map(parseFloat)
	]);
	
	return result;
}

export default fetch_umap;