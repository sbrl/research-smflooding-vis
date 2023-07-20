"use strict";

import * as BABYLON from 'babylonjs';

class PCSAttenuationMaterialPlugin extends BABYLON.MaterialPluginBase {

	sizeAttenuation = 1.0;

	get isEnabled() {
		return this._isEnabled;
	}

	set isEnabled(enabled) {
		if (this._isEnabled === enabled) {
			return;
		}
		this._isEnabled = enabled;
		this.markAllDefinesAsDirty();
		this._enable(this._isEnabled);
	}

	_isEnabled = false;

	constructor(material) {
		super(material, "SizeAttenuation", 1000, { "SIZEATTENUATION": false });
	}

	prepareDefines(defines, scene, mesh) {
		defines.SIZEATTENUATION = this._isEnabled;
	}

	getUniforms() {
		return {
			"ubo": [
				{ name: "sizeAttenuation", size: 1, type: "float" },
			],
			"vertex":
				`#ifdef SIZEATTENUATION
                    uniform float sizeAttenuation;
                #endif`,
		};
	}

	bindForSubMesh(uniformBuffer, scene, engine, subMesh) {
		if (this._isEnabled) {
			uniformBuffer.updateColor3("sizeAttenuation", this.sizeAttenuation);
		}
	}

	getClassName() {
		return "SizeAttenuationMaterialPlugin";
	}

	getCustomCode(shaderType) {
		return shaderType === "vertex" ? {
			"CUSTOM_VERTEX_MAIN_END": `
                #ifdef SIZEATTENUATION
                    gl_PointSize = pointSize * (1. - (gl_Position.z / gl_Position.w * 0.5 + 0.5));
                #endif
            `,
		} : null;
	}
}


export default PCSAttenuationMaterialPlugin;