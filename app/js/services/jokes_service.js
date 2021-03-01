import i18next from 'i18next';

import {i18n_en_jokes} from '../locales/en_jokes';
import {i18n_de_jokes} from '../locales/de_jokes';
import {i18n_fr_jokes} from "../locales/fr_jokes";

export function getRandomJoke() {
	const jokesJson = getJokesJson();
	let randomNumber = Math.floor(Math.random() * Object.keys(jokesJson).length);
	randomNumber += 1; // Index correction: jokesJson starts with 1 not with 0!
	return jokesJson[randomNumber];
}

export function getJokeByNumber(number) {
	const jokesJson = getJokesJson();
	return jokesJson[number];
}

function getJokesJson() {
	let jokesJson;
	switch (i18next.language) {
		case "en":
			jokesJson = i18n_en_jokes;
			break;
		case "de":
			jokesJson = i18n_de_jokes;
			break;
		case "fr":
			jokesJson = i18n_fr_jokes;
			break;
			
	}
	return jokesJson;
}