"use strict";

import * as BABYLON from 'babylonjs';

/**
 * Size attenuation plugin for PointCloudSystem objects.
 * @source https://playground.babylonjs.com/#UTHA7W#2
 * @source https://forum.babylonjs.com/t/point-cloud-system-size-attenuation/31811/5
 */
class PCSAttenuationMaterialPlugin extends BABYLON.MaterialPluginBase {
	
	pcsAttenuation = 0.1;
	
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
		super(material, "PCSAttenuation", 1000, { "PCSATTENUATION": false });
	}
	
	prepareDefines(defines, scene, mesh) {
		defines.PCSATTENUATION = this._isEnabled;
	}
	
	getUniforms() {
		return {
			"ubo": [
				{ name: "pcsAttenuation", size: 1, type: "float" },
			],
			"vertex":
				`#ifdef PCSATTENUATION
                    uniform float pcsAttenuation;
                #endif`,
		};
	}
	
	bindForSubMesh(uniformBuffer, scene, engine, subMesh) {
		if (this._isEnabled) {
			uniformBuffer.updateColor3("pcsAttenuation", this.pcsAttenuation);
		}
	}
	
	getClassName() {
		return "PCSAttenuationMaterialPlugin";
	}
	
	getCustomCode(shaderType) {
		return shaderType === "vertex" ? {
			"CUSTOM_VERTEX_MAIN_END": `
                #ifdef PCSATTENUATION
                    gl_PointSize = pointSize * (1. - (gl_Position.z / gl_Position.w * 0.5 + 0.5));
                #endif
            `,
		} : null;
	}
}

export default PCSAttenuationMaterialPlugin;