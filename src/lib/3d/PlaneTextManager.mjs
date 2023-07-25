"use strict";

class PlaneTextManager {
	constructor(scene) {
		this.scene = scene;
		
		this.planes = new Map();
	}
	
	create(pos) {
		const plane = new BABYLON.MeshBuilder.CreatePlane("plane-text", {
			width: 8, height: 8
		});
		plane.position = pos;
		const texture = new BABYLON.DynamicTexture("text", 256, this.scene);
		texture.drawText("flooding", null, null, "12px sans-serif", "");
		texture.hasAlpha = true;
		plane.material = diffuse(scene, new BABYLON.Color4(64, 44, 38));
		plane.material.diffuseTexture = texture;
		this.planes.set(pos.toString(), {
			plane,
			texture
		});
	}
	
	delete(pos) {
		this.planes.delete(pos.toString());
	}
}

export default PlaneTextManager;