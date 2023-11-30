"use strict";

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

import esbuild from 'esbuild';
import pretty_ms from 'pretty-ms';

import log from './lib/core/NamespacedLog.mjs'; const l = log("esbuild");

const __dirname = import.meta.url.slice(7, import.meta.url.lastIndexOf("/"));
const outdir = path.resolve(__dirname, "../dist");

/**
 * Hashes the contents of a file.
 * @ref		https://stackoverflow.com/a/44643479/1460422
 * @param	{string}	hashName	The name of the hash algorithm to use.
 * @param	{string}	path		The path to the file to hash.
 * @return	{string}	The resulting hash as a hexadecimal string.
 */
function hash_file(hashName, path) {
	return new Promise((resolve, reject) => {
		const hash = crypto.createHash(hashName);
		const stream = fs.createReadStream(path);
		stream.once("error", reject);
		stream.on("data", chunk => hash.update(chunk));
		stream.once("end", () => {
			stream.off("error", reject);
			resolve(hash.digest('base64'));
		});
	});
}

async function do_html() {
	// We *would* use SHA3 here, but we need to use SHA2 for subresource integrity
	let algorithm = "sha384";
	let css_hash = await hash_file(algorithm, path.join(outdir, "app.css"));
	let js_hash = await hash_file(algorithm, path.join(outdir, "app.js"));

	let html = (await fs.promises.readFile(path.join(__dirname, "index.html"), "utf-8"))
		.replace(/\{JS_HASH\}/g, js_hash)
		.replace(/\{CSS_HASH\}/g, css_hash)
		.replace(/\{JS_HASH_SHORT\}/g, js_hash.substring(0, 7).replace(/[+/=]/, ""))
		.replace(/\{CSS_HASH_SHORT\}/g, css_hash.substring(0, 7).replace(/[+/=]/, ""))
		.replace(/\{ALGO\}/g, algorithm);
	// TODO: Use fs.promises.copyFile() for index.html here, and also maybe find & replace for css/js filenames that we can then randomise?

	await fs.promises.writeFile(path.join(outdir, "index.html"), html);
}

async function write_index() {
	const filepaths = [];
	const filenames = await fs.promises.readdir(path.join(outdir, `data`));
	for(const filename of filenames) {
		if(filename.match(/\.ds\.tsv(?:.gz)?$/i))
			filepaths.push(path.join(`./data`, filename));
	}
	await fs.promises.writeFile(path.join(outdir, `index.json`), JSON.stringify(filepaths));
	l.log(`Written index with ${filepaths.length} items —→ ${path.join(outdir, `index.json`)}`);
}

const do_html_plugin = {
	name: "do_html",
	setup(build) {
		build.onEnd(async result => {
			await do_html();
		})
	}
}

const do_data_index_plugin = {
	name: "do_data_index",
	setup(build) {
		build.onEnd(async result => {
			await write_index();
		})
	}
}

function get_esbuild_context() {
	return {
		entryPoints: [
			"./app.mjs",
			"./app.css"
		].map(filepath => path.resolve(__dirname, filepath)),
		outdir,
		bundle: true,
		minify: typeof process.env.NO_MINIFY === "undefined",
		sourcemap: true,
		treeShaking: true,
		loader: {
			".html": "text",
			".svg": "file",
			".woff2": "file",
			".woff": "file",
			".eot": "file",
			".ttf": "file",
			".png": "file",
			".jpeg": "file"
		},
		plugins: [
			do_html_plugin,
			do_data_index_plugin
		]
	};
}


(async () => {
	const do_watch = typeof process.env.ESBUILD_WATCH !== "undefined";
	
	if (!do_watch) l.log(`[1 / 1] Building client frontend....`);
	
	l.log(`Output directory is ${outdir}`);
	if(!fs.existsSync(outdir))
		await fs.promises.mkdir(outdir);
	
	const time_start = new Date();
	const files_to_copy = [ // These files will be copied as-is
		// "./img/logo.svg",
		// "./img/logo-16.png",
		// "./img/logo-180.png",
		// "./img/logo-256.png"
		"./img/github.svg"
	].map(filepath => path.resolve(__dirname, filepath));
	
	// Always do at least one build first
	const result = await esbuild.build(get_esbuild_context());
	if (result.errors.length > 0 || result.warnings.length > 0)
		console.log(result);
	
	// ...only then do we watch if necessary
	if(do_watch) {
		const ctx = await esbuild.context(get_esbuild_context());
		await ctx.watch();
	}
	
	// This causes a crash for some reason
	//console.log(await esbuild.analyzeMetafile(result.metafile));
	
	await Promise.all(files_to_copy.map(filename_source => fs.promises.cp(
		filename_source,
		path.join(outdir, path.basename(filename_source))
	)));
	
	
	if (do_watch)
		l.log(`Now watching for changes`);
	else
		l.log(`Build complete in ${pretty_ms(new Date() - time_start)}.`);
})();



