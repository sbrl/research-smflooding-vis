# Social-Media-Vis

> Visualisations of the main smflooding research for outreach purposes

This repository contains a cool browser-based 3D visualisation linked to my [social media flooding research](https://github.com/sbrl/research-smflooding), primarily intended for outreach activities, like the [hull science festival](https://scifest.hull.ac.uk/).

**See the demo in action here:** [TODO: insert link here]

## Background
By embedding a wordlist with [GloVe](https://nlp.stanford.edu/projects/glove/) and then running it through [UMAP](https://umap-learn.readthedocs.io/en/latest/) to reduce the number of dimensions from 25/50/etc down to 3, a neat visual can be created that effectively illustrates how AIs understand text. Similar sorts of words end up with similar sorts of positions - for example, during some outreach activities I've done we've found little clusters of:

- Numbers
- Football teams
- etc

This demo is built entirely in the browser. Due to the use of the [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API), a proper context must be used in order for the demo to work properly. This can either be a local website (e.g. `npx serve path/to/dist`) or a real website (either http or https, though the latter is always preferred), but it **will not work with `file://` urls**.

If you just want to view the demo, see the link above. If, however, you're interested in hacking on the software, read on!

## System Requirements
- [Node.js](https://nodejs.org/) and npm (usually bundled with Node.js)
- Web browser - only Firefox has been tested. **Chrome or Chrome-based browsers are not recommended.**

## Getting Started
This guide assumes Linux, but should work on other platforms (e.g. nix, BSD, macOS, Windows, etc) as well. Tweak for your system.

First, clone this git repository:

```bash
git clone git@github.com:sbrl/research-smflooding-vis.git
cd research-smflooding-vis
```

Then, install dependencies:

```bash
npm install
```

With dependencies installed, build the code:

```bash
npm run build
```

Running this build command will spit the result out into a directory entitled `dist` in the root of the repository. 

**Note:** Running this build command will also write an index file that the file picker uses to detect compatible files to display in the interface when you first load the page. See below for format information.

Finally, launch a local development server centred on the `dist/` subdirectory. I like to do that like so:

```bash
npx serve dist/
```

Then, enter the resulting URL into your web browser and you're away!

### Data file format
Once you have built the code once, dataset files may be placed anywhere in `dist/` - however in order for `npm run build` to pick up on them they must be in a subdirectory `data` - i.e. `dist/data` relative to the root of the repository. Once you have placed them here, re-run `npm run build` and it will automatically update the index file `index.json` in `dist/` and allow your dataset files to be displayed in the web interface.

Dataset files must have either 1 of the following file extensions:

1. `.ds.tsv`
2. `.ds.tsv.gz`

If ending in `.gz`, it is assumed that the file is compressed with `gzip`.

The format of the actual file is as follows:

```tsv
<wordA>	<x>	<y>	<z>
<wordB>	<x>	<y>	<z>
<wordC>	<x>	<y>	<z>
```

....with a single tab character in between each column. Here's a practical example:

```tsv
cat    -10.147051      2.3838716       2.9629934
apple   -4.798643       3.1498482       -2.8428414
tree -2.1351748      1.7223179       5.5107193
```

Note that there is **no header** to the TSV file. Generation of these files can be done with [`umapify.py` in the main research-smflooding repository](https://github.com/sbrl/research-smflooding/blob/main/src/umapify.py).

## Notes
- We use perceptually uniform colour schemes to avoid bias. Further reading: <https://colorcet.com/>

## Known issues
- Gamepad support may work only with a PS4 controller. [Babylon.js](https://babylonjs.com/)' gamepad support is horribly broken, resulting in the need to apply [a patch](https://github.com/sbrl/research-smflooding-vis/blob/c526f463393cd41802d948aca5e89b97bf058167/patches/%40babylonjs%2Bcore%2B6.19.1.patch) to disable it and use a custom hacked-together version instead. Believe it or not, I tried 3 other dedicated libraries and none of those worked either....! Then I was running out of time, so I ended up with this workaround.

## Contributing
Contributions are welcome - both issues and pull requests! Please mention in your pull request that you release your work under the GPL-3.0 (see below).

Please bear in mind that I am currently working on this code, so it is unlikely that everything will be working as it should at the moment.

If you're feeling that way inclined, the sponsor button at the top of the page (if you're on GitHub) will take you to my [Liberapay profile](https://liberapay.com/sbrl) if you'd like to donate to say an extra thank you :-)


## License
This code, like the [main research repository](https://github.com/sbrl/research-smflooding) is released under the GNU Affero General Public License 3.0. The full license text is included in the `LICENSE` file in this repository. Tldr legal have a [great summary](https://tldrlegal.com/license/gnu-general-public-license-v3-(gpl-3)) of the license if you're interested.

The reason for this licence is specifically because producing this research has taken a very significant chunk of my energy, and my greatest wish is that it benefits society in an open and transparent manner in the spirit of the open source community.