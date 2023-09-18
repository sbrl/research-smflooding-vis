"use strict";

export default function(urls) {
	return new Promise((resolve, _reject) => {
		const el_dialog = document.querySelector("#dialog-filepicker");
		const el_button = el_dialog.querySelector("#filepicker-button-load");
		const el_select = el_dialog.querySelector("#filepicker-select-file");
		
		for(const url of urls) {
			const option = document.createElement("option");
			option.value = url;
			option.text = url;
			el_select.appendChild(option);
		}
		
		el_button.addEventListener("click", (event) => {
			el_dialog.close();
			resolve(el_select.value);
		});
		el_dialog.showModal();
	});
}