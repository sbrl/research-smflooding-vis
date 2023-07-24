"use strict";

class PlaneTextManager {
	constructor() {
		this.planes = new Map();
	}
	
	create(pos) {
		
	}
	
	delete(pos) {
		this.planes.delete(pos.toString());
	}
}

export default PlaneTextManager;