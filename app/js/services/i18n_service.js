import $ from 'jquery';

import "tooltipster";

import i18next from 'i18next';
import jQueryI18next from 'jquery-i18next';
import {i18n_en} from '../locales/en';
import {i18n_de} from '../locales/de';
import {i18n_fr} from "../locales/fr";

export function setupApp() {
	setContentOnPageLoad();
	setI18EventHandlers();
}

/**
 * Set the content of the page on page load based on the chosen URL.
 */
function setContentOnPageLoad() {

	let langToUse = "en";
	let transFileToUse = i18n_en;

	if (window.location.href.indexOf("/de/") > -1) {
		langToUse = "de";
		transFileToUse = i18n_de;
	}
	else if (window.location.href.indexOf("/fr/") > -1) {
		langToUse = "fr";
		transFileToUse = i18n_fr;
	}

	i18next.init({
		lng: langToUse,
		resources: {
			de: {
				translation: i18n_de
			},
			en: {
				translation: i18n_en
			},
			fr: {
				translation: i18n_fr
			}
		}
	}, () => {
		$("#selectLanguage").val(langToUse);
		document.title = transFileToUse["browserTitle"];
		jQueryI18next.init(i18next, $); //To use i18next with jQuery selectors the use of jQueryI18next is nescessary.
		$("body").localize();
	});
}

function setI18EventHandlers() {

	//Update the content of the page based on the chosen language after change of language.
	$(document).on("change", "#selectLanguage", function () {
		const chosenLang = $(this).val();

		i18next.changeLanguage(chosenLang, () => {

			let transFileToUse = i18n_en;

			if (chosenLang.indexOf("de") !== -1) {
				transFileToUse = i18n_de;
			}
			else if (chosenLang.indexOf("fr") !== -1) {
				transFileToUse = i18n_fr;
			}
			document.title = transFileToUse["browserTitle"];

			jQueryI18next.init(i18next, $);
			$("body").localize();

			// Reload tooltips using tooltipster plugin (info icons on level and speed):
			$(".tooltipsterTooltip").tooltipster('destroy');
			$('.tooltipsterTooltip').tooltipster({
				trigger: 'click',
				theme: 'tooltipster-noir'
			});
		});
	});
}

export function setLanguage(chosenLang) {
	i18next.changeLanguage(chosenLang, () => {
		jQueryI18next.init(i18next, $);
	});
}