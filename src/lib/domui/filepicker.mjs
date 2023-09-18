"use strict";

export default function(urls) {
	return new Promise((resolve, _reject) => {
		const el_dialog = document.querySelector("#dialog-filepicker");
		const el_button = el_dialog.querySelector("#filepicker-button-load");
		const el_select = el_dialog.querySelector("#filepicker-select-file");

		const handle_keyup = (event) => {
			// enter, space, x
			if ([13, 32, 88].includes(event.keyCode))
				do_resolve();
		};
		const do_resolve = () => {
			el_dialog.close();
			el_select.removeEventListener(`keyup`, handle_keyup);
			resolve(el_select.value);
		};
		
		el_select.addEventListener(`keyup`, handle_keyup);
		
		for(const url of urls) {
			const option = document.createElement("option");
			option.value = url;
			option.text = url;
			el_select.appendChild(option);
		}
		
		el_button.addEventListener("click", do_resolve);
		el_dialog.showModal();
	});
}