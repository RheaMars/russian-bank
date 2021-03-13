export function updateSpeed(speedValue) {
	localStorage.setItem('zpSpeed', speedValue);
}

export function updateLevel(levelValue) {
	localStorage.setItem('zpLevel', levelValue);
}

export function updateTutorialMode(isChecked) {
	localStorage.setItem('zpTutorialMode', isChecked);
}

export function updateLanguage(languageValue) {
	localStorage.setItem('zpLanguage', languageValue);
}

export function increaseStatisticsNumberOfGames() {

	let level = parseFloat(this.getLevel());

	let numberOfGames = 1;

	let numberOfGamesLocalStorage = localStorage.getItem('zpStatisticsNumberOfGamesLevel' + level);
	if (numberOfGamesLocalStorage) {
		numberOfGames = parseInt(numberOfGamesLocalStorage) + 1;
	}

	localStorage.setItem('zpStatisticsNumberOfGamesLevel' + level, numberOfGames);
}

export function increaseStatisticsNumberOfGamesWon() {

	let level = parseFloat(this.getLevel());

	let numberOfGamesWon = 1;

	let numberOfGamesWonLocalStorage = localStorage.getItem('zpStatisticsNumberOfGamesWonLevel' + level);
	if (numberOfGamesWonLocalStorage) {
		numberOfGamesWon = parseInt(numberOfGamesWonLocalStorage) + 1;
	}

	localStorage.setItem('zpStatisticsNumberOfGamesWonLevel' + level, numberOfGamesWon);
}

export function increaseStatisticsNumberOfGamesLost() {

	let level = parseFloat(this.getLevel());

	let numberOfGamesLost = 1;

	let numberOfGamesLostLocalStorage = localStorage.getItem('zpStatisticsNumberOfGamesLostLevel' + level);
	if (numberOfGamesLostLocalStorage) {
		numberOfGamesLost = parseInt(numberOfGamesLostLocalStorage) + 1;
	}

	localStorage.setItem('zpStatisticsNumberOfGamesLostLevel' + level, numberOfGamesLost);
}

export function updateStatisticsAverageDurationOfGame(startTimeTs) {

	let level = parseFloat(this.getLevel());

	let endTimeTs = Math.floor(new Date().getTime() / 1000);

	let pauseTimeInSeconds = 0;
	let pauseTimeInSecondsLocalStorage = localStorage.getItem('zpStatisticsPauseTimeSum');
	if (pauseTimeInSecondsLocalStorage) {
		pauseTimeInSeconds = parseInt(pauseTimeInSecondsLocalStorage);
	}

	let durationOfCurrentGameInSeconds = endTimeTs - startTimeTs - pauseTimeInSeconds;

	let averageDurationOldInSeconds = localStorage.getItem('zpStatisticsAverageDurationOfGameLevel' + level);
	if (!averageDurationOldInSeconds) {
		averageDurationOldInSeconds = 0;
	}

	// Note that this number also contains the game which was finished right now!
	let numberOfGamesPlayed = localStorage.getItem('zpStatisticsNumberOfGamesLevel' + level);

	let averageDurationNewInSeconds = (averageDurationOldInSeconds * (parseInt(numberOfGamesPlayed) - 1)
		+ durationOfCurrentGameInSeconds) / numberOfGamesPlayed;

	localStorage.setItem('zpStatisticsAverageDurationOfGameLevel' + level, averageDurationNewInSeconds);
}

export function setGameStarted(bValue) {
	localStorage.setItem('zpStatisticsGameStarted', bValue);
}

export function getGameStarted() {
	let isGameStarted = localStorage.getItem('zpStatisticsGameStarted');
	if (!isGameStarted) {
		return 0;
	}
	return isGameStarted;
}

export function setPauseStart() {
	let pauseStartTimeTs = Math.floor(new Date().getTime() / 1000);
	localStorage.setItem('zpStatisticsPauseTimeStart', pauseStartTimeTs);
}

export function updatePauseSumDuration() {
	let pauseStartTimeTs = localStorage.getItem('zpStatisticsPauseTimeStart');
	let pauseEndTimeTs = Math.floor(new Date().getTime() / 1000);
	let durationOfCurrentPauseInSeconds = pauseEndTimeTs - pauseStartTimeTs;

	let pauseSumOldInSeconds = localStorage.getItem('zpStatisticsPauseTimeSum');
	if (!pauseSumOldInSeconds) {
		pauseSumOldInSeconds = 0;
	}

	let newPauseTimeSum = parseInt(pauseSumOldInSeconds) + durationOfCurrentPauseInSeconds;
	localStorage.setItem('zpStatisticsPauseTimeSum', newPauseTimeSum);
}

export function resetStatisticsPauseTimeInfo() {
	localStorage.setItem('zpStatisticsPauseTimeStart', 0);
	localStorage.setItem('zpStatisticsPauseTimeSum', 0);
}

export function getSpeed() {
	let speed = localStorage.getItem('zpSpeed');
	if (!speed) {
		return 5; // Default
	}
	return parseInt(speed);
}

export function getLevel() {
	let level = localStorage.getItem('zpLevel');
	if (!level) {
		return "0.5"; // Default;
	}
	return level;
}

export function getTutorialMode() {
	return localStorage.getItem('zpTutorialMode');
}

export function getLanguage() {
	return localStorage.getItem('zpLanguage');
}

export function getStatisticsNumberOfGames(level) {
	return localStorage.getItem('zpStatisticsNumberOfGamesLevel' + level);
}

export function getStatisticsNumberOfGamesWon(level) {
	return localStorage.getItem('zpStatisticsNumberOfGamesWonLevel' + level);
}

export function getStatisticsNumberOfGamesLost(level) {
	return localStorage.getItem('zpStatisticsNumberOfGamesLostLevel' + level);
}

export function getStatisticsAverageDurationOfGame(level) {
	return localStorage.getItem('zpStatisticsAverageDurationOfGameLevel' + level);
}

export function getShowAcesOnCenterPileSorted() {
	return localStorage.getItem('zpAcesOnCenterPilesSorted');
}

export function updateShowAcesOnCenterPileSorted(isChecked) {
	localStorage.setItem('zpAcesOnCenterPilesSorted', isChecked);
}