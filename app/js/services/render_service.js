import {PilePosition} from "../enums/pileinformation/pileposition";
import {PileType} from "../enums/pileinformation/piletype";
import {Player} from "../enums/player";
import {Game} from "../game";

import * as kute from "kute.js";

import noty from "noty";

import $ from "jquery";

// jQuery-UI components:
import "jquery-ui/ui/widgets/draggable";
import "jquery-ui/ui/widgets/droppable";
import "jquery-ui/ui/widgets/progressbar";
import "jquery-ui/ui/widgets/slider";
import "jquery-ui-touch-punch";

import i18next from "i18next";
import * as jokesService from "./jokes_service";
import * as localStorageService from "./localstorage_service";
import sweetAlert2 from "sweetalert2";

import "tooltipster";

export function setupApp() {
    setGlobalEventHandlers();
    setupTooltipsterTooltips();
    effectsOnPageLoad();
}

// Preload images to allow to play the game in offline mode.
// All loaded images will be stored to the Browser cache.
export function preloadImages() {
    var imagesToPreload = [];

    for (let i = 1; i <= 52; i++) {
        imagesToPreload.push("../img/cards_plain/" + i + ".svg");
    }
    imagesToPreload.push("../img/cards_plain/b1fv.svg");
    imagesToPreload.push("../img/cards_plain/b2fv.svg");

    imagesToPreload.push("../img/arrow-left-to-right.png");
    imagesToPreload.push("../img/chip_blackdiamonds.png");

    imagesToPreload.push("../img/gameOverLost.png");
    imagesToPreload.push("../img/gameOverWon.png");

    preloadImagesHelper(imagesToPreload);
}

function preloadImagesHelper(imagesToPreload) {
    var images = [];
    for (var i = 0; i < imagesToPreload.length; i++) {
        images[i] = new Image();
        images[i].src = imagesToPreload[i];
    }
}

export function setupLocalStorageFields(game) {
    // Speedslider:
    const speed = localStorageService.getSpeed();
    $(".speedSlider").slider({
        min: 1,
        max: 10,
        value: speed,
        create: function () {
            $("#speedSliderText").text($(this).slider("value"));
        },
        slide: function (event, ui) {
            $("#speedSliderText").text(ui.value);
        },
        change: function (event, ui) {
            localStorageService.updateSpeed(ui.value);
        }
    });

    // TutorialMode:
    const storedTutorialMode = localStorageService.getTutorialMode();
    if (storedTutorialMode) {
        if (storedTutorialMode === "true") {
            $("#checkboxTutorial").prop('checked', true);
            game.setTutorialMode(true);
            game.showBestMoveForTutorialMode();
        } else if (storedTutorialMode === "false") {
            $("#checkboxTutorial").prop('checked', false);
            game.setTutorialMode(false);
        }
    }
    $(document).off("change.localstorage", "#checkboxTutorial");
    $(document).on("change.localstorage", "#checkboxTutorial", function () {
        if ($(this).is(':checked')) {
            localStorageService.updateTutorialMode(true);
        } else {
            localStorageService.updateTutorialMode(false);
        }
    });

    // Level:
    const level = localStorageService.getLevel();
    $("#selectDifficultyOfGame").val(level);
    game.setLevelOfDifficulty(parseFloat(level));

    $(document).off("change.localstorage", "#selectDifficultyOfGame");
    $(document).on("change.localstorage", "#selectDifficultyOfGame", function () {
        localStorageService.updateLevel($(this).val());
    });

    // Language:
    const language = localStorageService.getLanguage();
    if (language) {
        $("#selectLanguage").val(language);
        $("#selectLanguage").trigger("change");
    }
    $(document).off("change.localstorage", "#selectLanguage");
    $(document).on("change.localstorage", "#selectLanguage", function () {
        localStorageService.updateLanguage($(this).val());
    });

    // Sort aces on center piles:
    const showAcesOnCenterPilesSorted = localStorageService.getShowAcesOnCenterPileSorted();
    if (showAcesOnCenterPilesSorted) {
        if (showAcesOnCenterPilesSorted === "true") {
            $("#checkboxOrderAcesOnCenterPiles").prop('checked', true);
            game.setShowAcesOnCenterPilesSorted(true);
            setBackgroundImagesToShowOnCenterPiles();
        } else if (showAcesOnCenterPilesSorted === "false") {
            $("#checkboxOrderAcesOnCenterPiles").prop('checked', false);
            game.setShowAcesOnCenterPilesSorted(false);
            removeBackgroundImagesToShowOnCenterPiles();
        }
    }
    $(document).off("change.localstorage", "#checkboxOrderAcesOnCenterPiles");
    $(document).on("change.localstorage", "#checkboxOrderAcesOnCenterPiles", function () {
        if ($(this).is(':checked')) {
            localStorageService.updateShowAcesOnCenterPileSorted(true);
        } else {
            localStorageService.updateShowAcesOnCenterPileSorted(false);
        }
    });
}

function setupTooltipsterTooltips() {
    $('.tooltipsterTooltip').tooltipster({
        trigger: 'click',
        theme: 'tooltipster-noir'
    });
}

/**
 * Renders the complete playboard of the given game according to its current state.
 */
export function renderPlayboard(game) {

    let activePlayerChanged = false;
    if (!$("." + game.getActivePlayer().name).hasClass("playerBoardActive")) {
        activePlayerChanged = true;
    }

    renderPlayboardPiles();
    renderPlayboardCards(game);
    renderKnockButton(game);
    renderPlayerBoards(game, activePlayerChanged);
    updateDragAndDropFunctionality(game);
}

function renderPlayboardPiles() {
    $(".pilePanel.cp").removeClass("redFrame");
    $(".pilePanel.cp").removeClass("redFilter");
    $(".pilePanel").removeClass("toHighlightOnDragStartForTutorialMode");
    $(".pilePanel").removeClass("highlightedOnDragStartForTutorialMode");
}

export function hideKnockButton() {
    $(".knockButton").hide();
}

function renderKnockButton(game) {
    if (game.isGameOver()) {
        hideKnockButton();
    } else if (game.getActivePlayer() == Player.PLAYER_B) {
        $(".knockButton").show();
    }
}

function renderPlayboardCards(game) {

    const playboard = game.getPlayboard();
    const cardDesign = "cards_plain";

    $('.cardImgWrapper.card').remove();

    for (let pilePosition of PilePosition.enumValues) {
        const card2pileElements = playboard.getPlayboardMap().get(pilePosition).getCard2PileElements();

        // Render reserve piles:
        if (pilePosition.getPileType() == PileType.RESERVE) {

            if (card2pileElements.length > 0) {

                // Render the last but two card:
                if (card2pileElements.length > 2) {
                    const lastButOneCard2pileElement = card2pileElements[card2pileElements.length - 3];
                    lastButOneCard2pileElement.setPictureString(false, cardDesign);

                    let cardImg = $("<img src='" + lastButOneCard2pileElement.getPictureString() + "' class='cardImg " + cardDesign + "'>");

                    let cardImgWrapper = $('<span class="cardImgWrapper card rp shifted ui-undraggable"></span>');
                    cardImgWrapper.append(cardImg);

                    $("#" + pilePosition.name).append(cardImgWrapper);
                }

                // Render the last but one card:
                if (card2pileElements.length > 1) {
                    const lastButOneCard2pileElement = card2pileElements[card2pileElements.length - 2];
                    lastButOneCard2pileElement.setPictureString(false, cardDesign);

                    let cardImg = $("<img src='" + lastButOneCard2pileElement.getPictureString() + "' class='cardImg " + cardDesign + "'>");

                    let cardImgWrapper = $('<span class="cardImgWrapper card rp ui-undraggable"></span>');
                    if (card2pileElements.length <= 2) {
                        $(cardImgWrapper).addClass("shifted");
                    }
                    cardImgWrapper.append(cardImg);

                    $("#" + pilePosition.name).append(cardImgWrapper);
                }

                // Render top card on reserve pile:
                if (card2pileElements.length > 0) {
                    const card2pileElement = card2pileElements[card2pileElements.length - 1];
                    if (card2pileElement.isFaceUp()) {
                        card2pileElement.setPictureString(true, cardDesign);
                    } else {
                        card2pileElement.setPictureString(false, cardDesign);
                    }

                    let cardImg = $("<img src='" + card2pileElement.getPictureString() + "' class='cardImg " + cardDesign + "'>");

                    let cardImgWrapper = $('<span class="cardImgWrapper card rp ui-undraggable"></span>');
                    if (card2pileElement.isFaceUp()) {
                        $(cardImgWrapper).addClass("flippedCard");
                    }
                    // Add flippable class to top card:
                    if (!card2pileElement.isFaceUp()
                        && game.getActivePlayer() == game.getIdentityPlayer()
                        && (game.getIdentityPlayer() == Player.PLAYER_A && pilePosition == PilePosition.RESERVE_PILE_PLAYER_A
                            || game.getIdentityPlayer() == Player.PLAYER_B && pilePosition == PilePosition.RESERVE_PILE_PLAYER_B)) {
                        $(cardImgWrapper).addClass("flippableCard");
                    }
                    cardImgWrapper.append(cardImg);

                    $("#" + pilePosition.name).append(cardImgWrapper);
                }
            }
        }
        // Render center piles:
        else if (pilePosition.getPileType() == PileType.CENTER) {

            // Render the last but one card:
            if (card2pileElements.length > 1) {
                const card2pileElement = card2pileElements[card2pileElements.length - 2];
                card2pileElement.setPictureString(true, cardDesign);

                let cardImg = $("<img src='" + card2pileElement.getPictureString() + "' class='cardImg " + cardDesign + "'>");

                let cardImgWrapper = $('<span class="cardImgWrapper card cp ui-undraggable"></span>');
                cardImgWrapper.append(cardImg);

                $("#" + pilePosition.name).append(cardImgWrapper);
            }

            if (card2pileElements.length > 0) {
                const card2pileElement = card2pileElements[card2pileElements.length - 1];
                // If center pile is finished by King the King card should be face down:
                if (card2pileElement.isFaceUp()) {
                    card2pileElement.setPictureString(true, cardDesign);
                } else {
                    card2pileElement.setPictureString(false, cardDesign);
                }

                let cardImg = $("<img src='" + card2pileElement.getPictureString() + "' class='cardImg " + cardDesign + "'>");

                let cardImgWrapper = $('<span class="cardImgWrapper card cp ui-undraggable"></span>');
                cardImgWrapper.append(cardImg);

                $("#" + pilePosition.name).append(cardImgWrapper);
            }
        }
        // Render waste piles:
        else if (pilePosition.getPileType() == PileType.WASTE) {

            // Render the last but two card:
            if (card2pileElements.length > 2) {
                const lastButTwoCard2pileElement = card2pileElements[card2pileElements.length - 3];
                lastButTwoCard2pileElement.setPictureString(true, cardDesign);

                let cardImg = $("<img src='" + lastButTwoCard2pileElement.getPictureString() + "' class='cardImg " + cardDesign + "'>");

                let cardImgWrapper = $('<span class="cardImgWrapper card wp shifted ui-undraggable"></span>');
                cardImgWrapper.append(cardImg);

                $("#" + pilePosition.name).append(cardImgWrapper);
            }

            // Render the last but one card:
            if (card2pileElements.length > 1) {
                const lastButOneCard2pileElement = card2pileElements[card2pileElements.length - 2];
                lastButOneCard2pileElement.setPictureString(true, cardDesign);

                let cardImg = $("<img src='" + lastButOneCard2pileElement.getPictureString() + "' class='cardImg " + cardDesign + "'>");

                let cardImgWrapper = $('<span class="cardImgWrapper card wp shifted ui-undraggable"></span>');
                cardImgWrapper.append(cardImg);

                $("#" + pilePosition.name).append(cardImgWrapper);
            }

            // Render top card on waste pile:
            if (card2pileElements.length > 0) {
                const topCard2pileElement = card2pileElements[card2pileElements.length - 1];
                topCard2pileElement.setPictureString(true, cardDesign);

                let cardImg = $("<img src='" + topCard2pileElement.getPictureString() + "' class='cardImg " + cardDesign + "'>");

                let cardImgWrapper = $('<span class="cardImgWrapper card wp ui-undraggable"></span>');
                cardImgWrapper.append(cardImg);

                $("#" + pilePosition.name).append(cardImgWrapper);
            }

        }
        // Render house piles:
        else {
            let count = 0;

            for (let card2pileElement of card2pileElements) {
                card2pileElement.setPictureString(true, cardDesign);

                let cardImg = $("<img src='" + card2pileElement.getPictureString() + "' class='cardImg " + cardDesign + "'>");

                let cardImgWrapper = $('<span class="cardImgWrapper card ui-undraggable"></span>');
                cardImgWrapper.append(cardImg);

                if (pilePosition.name.includes("HOUSE_PILE_LEFT")) {
                    $(cardImgWrapper).addClass("hp_left");
                    if (count > 0) {
                        $(cardImgWrapper).addClass("shifted");
                    }
                } else if (pilePosition.name.includes("HOUSE_PILE_RIGHT")) {
                    $(cardImgWrapper).addClass("hp_right");
                    if (count > 0) {
                        $(cardImgWrapper).addClass("shifted");
                    }
                }

                $("#" + pilePosition.name).append(cardImgWrapper);

                count++;
            }
        }
    }
}

function renderPlayerBoards(game, activePlayerChanged) {

    if (game.isGameOver()) {
        kute.allTo(".playerBoard", {backgroundColor: "#E5E5E5"}, {duration: 700}).start();
    } else {
        $(".playerBoard").each(function () {
            if ($(this).hasClass(game.getActivePlayer().name)) {
                $(this).addClass("playerBoardActive");
                $(this).removeClass("playerBoardInactive");
            } else {
                $(this).removeClass("playerBoardActive");
                $(this).addClass("playerBoardInactive");
            }
        });

        if (activePlayerChanged) {
            animatePlayerboards(game);
        }
    }

    renderProgressbars(game);
    renderChangeWastePileAndReservePileIcon(game);
}

function renderChangeWastePileAndReservePileIcon(game) {
    if (game.isGameOver()) {
        $("#changeWastePileAndReservePileIcon").hide();
    } else if ($(".PLAYER_A").hasClass("playerBoardActive") && ($("#RESERVE_PILE_PLAYER_A").children(".cardImgWrapper").length == 0)) {
        $("#changeWastePileAndReservePileIcon").show();
    } else {
        $("#changeWastePileAndReservePileIcon").hide();
    }
}

function renderProgressbars(game) {

    const procentOfCardsLeftOfPlayerB = game.getPercentOfCardsLeft(Player.PLAYER_B);
    const progressBarClassPlayerB = getProgressbarClass(procentOfCardsLeftOfPlayerB);

    const procentOfCardsLeftOfPlayerA = game.getPercentOfCardsLeft(Player.PLAYER_A);
    const progressBarClassPlayerA = getProgressbarClass(procentOfCardsLeftOfPlayerA);

    // Remove all classes starting with the string "smaller":
    $(".progressbar.PLAYER_B").removeClass(function (index, css) {
        return (css.match(/(^|\s)smaller\S+/g) || []).join(' ');
    });
    $(".progressbar.PLAYER_B").addClass(progressBarClassPlayerB);
    $(".progressbar.PLAYER_B").progressbar({
        value: procentOfCardsLeftOfPlayerB
    });

    // Remove all classes starting with the string "smaller":
    $(".progressbar.PLAYER_A").removeClass(function (index, css) {
        return (css.match(/(^|\s)smaller\S+/g) || []).join(' ');
    });
    $(".progressbar.PLAYER_A").addClass(progressBarClassPlayerA);
    $(".progressbar.PLAYER_A").progressbar({
        value: procentOfCardsLeftOfPlayerA
    });

}

function getProgressbarClass(percentOfCards) {
    if (percentOfCards <= 5) {
        return "smaller5";
    } else if (percentOfCards <= 10) {
        return "smaller10";
    } else if (percentOfCards <= 25) {
        return "smaller25";
    } else if (percentOfCards <= 37) {
        return "smaller37";
    } else if (percentOfCards <= 50) {
        return "smaller50";
    } else {
        return "";
    }
}

function updateDragAndDropFunctionality(game) {

    if (game.getActivePlayer() == game.getIdentityPlayer()) {

        // Update draggables:
        $(".pilePanel.rp .cardImgWrapper.flippedCard").draggable({revert: "invalid"});
        $(".pilePanel.rp .cardImgWrapper.flippedCard").removeClass("ui-undraggable");
        // If top card of reserve pile is flipped, the other cards must not be draggable:
        if ($(".pilePanel.rp .cardImgWrapper.flippedCard").length == 0) {
            $(".pilePanel#WASTE_PILE_PLAYER_A .cardImgWrapper:last-child").draggable({revert: "invalid"});
            $(".pilePanel#WASTE_PILE_PLAYER_A .cardImgWrapper:last-child").removeClass("ui-undraggable");
            $(".pilePanel.hp .cardImgWrapper:last-child").draggable({
                revert: "invalid"
            });
            $(".pilePanel.hp .cardImgWrapper:last-child").removeClass("ui-undraggable");
        }

        // Update droppables:
        $(".pilePanel.cp, .pilePanel.wp, .pilePanel.hp").droppable({
            drop: function (event, ui) {
                const idSourcePile = ui.draggable.parent(".pilePanel").attr("id");
                const idTargetPile = $(this).attr("id");
                game.onDropCardOnPile(idSourcePile, idTargetPile);
            }
        });
    }
}

/**
 * Set the event handlers which are not depending on an existing game.
 */
export function setGlobalEventHandlers() {

    $(document).on("dragstart", ".ui-undraggable, #logoImage, .playerBoard img", function () {
        return false;
    });

    $(document).on("dragstart", ".ui-draggable", function () {
        $(this).css("z-index", "3");

        if ($(this).hasClass("highlightedSourcePileCardForTutorialMode")) {
            $(".toHighlightOnDragStartForTutorialMode").addClass("highlightedOnDragStartForTutorialMode");
        }

        // When user starts dragging the top card of a reserve or waste pile containing only two cards
        // the "shifted" class must be removed from the last but one card.
        if (($(this).parent("span").hasClass("rp") || $(this).parent("span").hasClass("wp")) && $(this).parent("span").find(".cardImgWrapper").length >= 2) {
            $(this).parent("span").find(".cardImgWrapper:nth-child(2)").removeClass("shifted");
        }
    });

    $(document).on("click", ".newGameButton", function () {

        let dialogTitle = i18next.t("newGame");
        let dialogContent = i18next.t("areYouSure");
        let yesButton = i18next.t("yes");
        let noButton = i18next.t("no");

        let imageUrl = "../img/chip_blackdiamonds.png";

        sweetAlert2({
            title: dialogTitle,
            html: dialogContent,
            customClass: "fontsize-14",
            showCloseButton: true,
            showCancelButton: true,
            confirmButtonText: yesButton,
            cancelButtonText: noButton,
            imageUrl: imageUrl,
        }).then(
            // On confirm:
            function () {
                stopGameAnimation();

                // Cleanup for possibly before pressed pause button:
                if ($(".pauseGameButton").hasClass("toResume")) {
                    $(".pauseGameButton").find("img").attr("src", "img/pause.png");
                    let buttonTitle = i18next.t("pauseGame");
                    $(".pauseGameButton").find("img").attr("title", buttonTitle);
                    $(".pauseGameButton").removeClass("toResume");
                    $(".pauseGameButton").addClass("toPause");
                    $(".pauseIconBig").hide();
                    $(".playingfield .row").removeClass("pausedGameModal");
                }

                // Cleanup for knock stuff and possibly disabled buttons:
                $(".knockButton").hide();
                $("*").removeClass("disabledButton");
                $("*").removeClass("centerPileForKnockProve");
                $("*").removeClass("highlightBackground");

                // Initialize the new game... NOTE: the instance of the "old" game will be still existent,
                // and the game event handlers will still react to events on the "old" instance of game if they are
                // not unbinded (see "setGameEventHandlers(..)" for more information.
                const game = new Game();
                game.initializeGame();
                setupLocalStorageFields(game);
            },
            // On dismiss (can be 'overlay', 'cancel', 'close', 'esc', 'timer'):
            function () {
                if (!$(".pauseGameButton").hasClass("toResume")) {
                    resumeGameAnimation();
                }
            });
    });

    function getGamesPlayedByLevel(level, isInput = false) {
        let result = '<td class="center">';
        let numberOfGames = 0;
        let numberOfGamesLocalStorage = localStorageService.getStatisticsNumberOfGames(level);
        if (numberOfGamesLocalStorage) {
            numberOfGames = numberOfGamesLocalStorage;
        }
        if (isInput) {
            result += "<input class='statisticsInputNumber' name='statisticsGamesPlayedByLevel" + level + "' type='number' min='0' value='" + numberOfGames + "' style='width:65px;'/>";
        } else {
            result += numberOfGames;
        }
        result += '</td>';
        return result;
    }

    function getGamesWonByLevel(level, isInput = false) {
        let result = '<td class="center">';
        let numberOfGames = 0;
        let numberOfGamesLocalStorage = localStorageService.getStatisticsNumberOfGamesWon(level);
        if (numberOfGamesLocalStorage) {
            numberOfGames = numberOfGamesLocalStorage;
        }
        if (isInput) {
            result += "<input class='statisticsInputNumber' name='statisticsGamesWonByLevel" + level + "' type='number' min='0' value='" + numberOfGames + "' style='width:65px;'/>";
        } else {
            result += numberOfGames;
        }
        result += '</td>';
        return result;
    }

    function getGamesLostByLevel(level, isInput = false) {
        let result = '<td class="center">';
        let numberOfGames = 0;
        let numberOfGamesLocalStorage = localStorageService.getStatisticsNumberOfGamesLost(level);
        if (numberOfGamesLocalStorage) {
            numberOfGames = numberOfGamesLocalStorage;
        }
        if (isInput) {
            result += "<input class='statisticsInputNumber' name='statisticsGamesLostByLevel" + level + "' type='number' min='0' value='" + numberOfGames + "' style='width:65px;'/>";
        } else {
            result += numberOfGames;
        }
        result += '</td>';
        return result;
    }

    function getGamesAverageDurationByLevel(level, isInput = false) {
        let result = '<td class="center">';
        let averageDurationOfGame = '-';
        let averageDurationOfGameLocalStorage = localStorageService.getStatisticsAverageDurationOfGame(level);
        if (averageDurationOfGameLocalStorage) {
            averageDurationOfGame = averageDurationOfGameLocalStorage;
            averageDurationOfGame = secondsToHHMMSS(averageDurationOfGame);
        }
        if (isInput) {
            if (averageDurationOfGame == "-") {
                averageDurationOfGame = "";
            }
            result += "<input class='statisticsInputTime' placeholder='HH:MM:SS' name='statisticsGamesAverageDurationByLevel" + level + "' type='text' value='" + averageDurationOfGame + "' style='width:65px;'/>";
        } else {
            result += averageDurationOfGame;
        }
        result += '</td>';
        return result;
    }

    $(document).on("click", ".statisticsButton", function () {
        let dialogTitle = i18next.t("statistics");
        let dialogContent = '';

        dialogContent += '<table class="statisticsTable">';

        // Header row:
        dialogContent += '<tr>';
        dialogContent += '<td>';
        dialogContent += '<strong>' + i18next.t("levelOfDifficulty") + '</strong>';
        dialogContent += '</td>';
        dialogContent += '<td>';
        dialogContent += '<strong>' + i18next.t("levelBeginner") + '</strong>';
        dialogContent += '</td>';
        dialogContent += '<td>';
        dialogContent += '<strong>' + i18next.t("levelEasy") + '</strong>';
        dialogContent += '</td>';
        dialogContent += '<td>';
        dialogContent += '<strong>' + i18next.t("levelNormal") + '</strong>';
        dialogContent += '</td>';
        dialogContent += '<td>';
        dialogContent += '<strong>' + i18next.t("levelAdvanced") + '</strong>';
        dialogContent += '</td>';
        dialogContent += '<td>';
        dialogContent += '<strong>' + i18next.t("levelProfessional") + '</strong>';
        dialogContent += '</td>';
        dialogContent += '</tr>';

        // Number of games played:
        dialogContent += '<tr>';
        dialogContent += '<td>';
        dialogContent += '<strong>' + i18next.t("statisticsNumberOfGames") + '</strong>';
        dialogContent += '</td>';
        dialogContent += getGamesPlayedByLevel(0.0);
        dialogContent += getGamesPlayedByLevel(0.25);
        dialogContent += getGamesPlayedByLevel(0.5);
        dialogContent += getGamesPlayedByLevel(0.75);
        dialogContent += getGamesPlayedByLevel(1.0);
        dialogContent += '</tr>';

        // Number of games won:
        dialogContent += '<tr>';
        dialogContent += '<td>';
        dialogContent += '<strong>' + i18next.t("statisticsNumberOfGamesWon") + '</strong>';
        dialogContent += '</td>';
        dialogContent += getGamesWonByLevel(0.0);
        dialogContent += getGamesWonByLevel(0.25);
        dialogContent += getGamesWonByLevel(0.5);
        dialogContent += getGamesWonByLevel(0.75);
        dialogContent += getGamesWonByLevel(1.0);
        dialogContent += '</tr>';

        // Number of games lost:
        dialogContent += '<tr>';
        dialogContent += '<td>';
        dialogContent += '<strong>' + i18next.t("statisticsNumberOfGamesLost") + '</strong>';
        dialogContent += '</td>';
        dialogContent += getGamesLostByLevel(0.0);
        dialogContent += getGamesLostByLevel(0.25);
        dialogContent += getGamesLostByLevel(0.5);
        dialogContent += getGamesLostByLevel(0.75);
        dialogContent += getGamesLostByLevel(1.0);
        dialogContent += '</tr>';

        // Average duration of game:
        dialogContent += '<tr>';
        dialogContent += '<td>';
        dialogContent += '<strong>&#8709;&nbsp;' + i18next.t("statisticsDurationOfGame") + '</strong>';
        dialogContent += '</td>';
        dialogContent += getGamesAverageDurationByLevel(0.0);
        dialogContent += getGamesAverageDurationByLevel(0.25);
        dialogContent += getGamesAverageDurationByLevel(0.5);
        dialogContent += getGamesAverageDurationByLevel(0.75);
        dialogContent += getGamesAverageDurationByLevel(1.0);
        dialogContent += '</tr>';

        dialogContent += '</table>';

        sweetAlert2({
            title: dialogTitle,
            html: dialogContent,
            showCloseButton: true,
            width: "auto",
            customClass: 'fontsize-13 swat-left scrollXpopup',
            onClose: function () {
                if (!$(".pauseGameButton").hasClass("toResume")) {
                    resumeGameAnimation();
                }
            }
        });
    });

    // Pause card animation on click of any relevant button:
    $(document).on("click", ".interruptGameplayAction", function () {
        pauseGameAnimation();
    });

    $(document).on("click", ".pauseGameButton", function () {
        if ($(this).hasClass("toPause")) {

            pauseGameAnimation();

            $(this).find("img").attr("src", "../img/resume.png");
            let buttonTitle = i18next.t("resumeGame");
            $(this).find("img").attr("title", buttonTitle);
            $(this).removeClass("toPause");
            $(this).addClass("toResume");

            $(".pauseIconBig").show();
            $(".playingfield .row").addClass("pausedGameModal");
        } else if ($(this).hasClass("toResume")) {
            $(this).find("img").attr("src", "../img/pause.png");
            let buttonTitle = i18next.t("pauseGame");
            $(this).find("img").attr("title", buttonTitle);
            $(this).removeClass("toResume");
            $(this).addClass("toPause");

            $(".pauseIconBig").hide();
            $(".playingfield .row").removeClass("pausedGameModal");

            resumeGameAnimation();
        }
    });

    $(document).on("click", ".pauseIconBig", function () {
        $(".pauseGameButton").trigger("click");
    });

    // Short cut SPACE for knocking:
    $(document).keypress(function (e) {
        if (e.charCode == 32) {
            const activeKnockButton = !$(".knockButton").hasClass("disabledButton") && $(".knockButton").is(":visible");
            const dialogOpened = $(".swal2-modal").is(":visible");
            if (activeKnockButton && !dialogOpened) {
                $(".knockButton").trigger("click");
            }
        }
    });

}

// If card animation was paused, resume animation now:
function resumeGameAnimation() {

    // Do not update pause sum duration if the user did not make his first move in the current game until now:
    let isGameStarted = localStorageService.getGameStarted();
    if (isGameStarted == 1) {
        localStorageService.updatePauseSumDuration();
    }

    if (window.cardAnimation && window.cardAnimation.paused) {
        window.cardAnimation.play();
    }
}

// Pause card animation if there is a current one running:
function pauseGameAnimation() {

    // Do not set pause time start if game is already paused (e.g. click "pause" then click on the "thank you" link).
    if (!$(".pauseIconBig").is(":visible")) {
        // Do not set pause time start if the user did not make his first move in the current game until now:
        let isGameStarted = localStorageService.getGameStarted();
        if (isGameStarted == 1) {
            localStorageService.setPauseStart();
        }
    }

    if (window.cardAnimation && window.cardAnimation.playing) {
        window.cardAnimation.pause();
    }
}

// Stop card animation:
function stopGameAnimation() {
    if (window.cardAnimation) {
        window.cardAnimation.stop();
        delete window.cardAnimation;
    }
}

/**
 * Set the event handlers depending on the given game.
 * NOTE: Every of these handlers must be unbinded first by using "off"
 * so that after starting a new game the handler reacts only one time
 * and not for several instances of the Game class.
 */
export function setGameEventHandlers(game) {

    $(document).off("click", "#changeWastePileAndReservePileIcon");
    $(document).on("click", "#changeWastePileAndReservePileIcon", function (e) {
        e.preventDefault();
        game.onClickChangeWastePileAndReservePileIcon();
    });

    $(document).off("click", ".flippableCard");
    $(document).on("click", ".flippableCard", function () {
        game.onClickReservePileCard();
    });

    $(document).off("change.levelclick", "#selectDifficultyOfGame");
    $(document).on("change.levelclick", "#selectDifficultyOfGame", function () {
        game.setLevelOfDifficulty($(this).val());
    });

    $(document).off("click", ".knockButton");
    $(document).on("click", ".knockButton", function () {
        game.onClickOfKnockButton();
    });

    $(document).off("click", ".centerPileForKnockProve");
    $(document).on("click", ".centerPileForKnockProve", function () {
        // Remove centerPileForKnockProve class now to avoid double click inconsistency:
        $("*").removeClass("centerPileForKnockProve");

        let centerPilePosition = $(this).attr("id");

        // Special treatment for clickable card on center pile (instead of clickable pile):
        if ($(this).is(".cardImgWrapper")) {
            centerPilePosition = game.getIntendedMoveOfArtificialIntelligence().getTargetPilePosition().name;
            game.onClickOfKnockHighlightedCenterPile(centerPilePosition, true);
        } else {
            game.onClickOfKnockHighlightedCenterPile(centerPilePosition, false);
        }

    });

    $(document).off("change.checkboxclick", "#checkboxTutorial");
    $(document).on("change.checkboxclick", "#checkboxTutorial", function () {
        if ($(this).is(':checked')) {
            game.setTutorialMode(true);

            // Show dialog:
            let dialogTitle = i18next.t("tutorial");
            let dialogContent = i18next.t("tutorialActivated");
            sweetAlert2({
                title: dialogTitle,
                html: dialogContent,
                customClass: 'fontsize-14 swat-left line-height-20-px',
                showCloseButton: true,
                allowOutsideClick: false,
                onOpen: function () {
                    pauseGameAnimation();
                },
                onClose: function () {
                    if (!$(".pauseGameButton").hasClass("toResume")) {
                        resumeGameAnimation();
                    }
                }
            });

            game.showBestMoveForTutorialMode();
        } else {
            game.setTutorialMode(false);

            // Cleanup:
            $(".cardImgWrapper").removeClass("highlightedSourcePileCardForTutorialMode");
            $(".cardImgWrapper").removeClass("toHighlightOnDragStartForTutorialMode");
            $(".cardImgWrapper").removeClass("highlightedOnDragStartForTutorialMode");
            $(".pilePanel").removeClass("highlightedCenterPileToClickForTutorialMode");
            $(".pilePanel").removeClass("toHighlightOnDragStartForTutorialMode");
            $(".pilePanel").removeClass("highlightedOnDragStartForTutorialMode");
        }
    });

    $(document).off("change.checkboxclick", "#checkboxOrderAcesOnCenterPiles");
    $(document).on("change.checkboxclick", "#checkboxOrderAcesOnCenterPiles", function () {
        if ($(this).is(':checked')) {
            game.setShowAcesOnCenterPilesSorted(true);
            setBackgroundImagesToShowOnCenterPiles();

        } else {
            game.setShowAcesOnCenterPilesSorted(false);
            removeBackgroundImagesToShowOnCenterPiles();
        }
    });
}

export function setBackgroundImagesToShowOnCenterPiles() {

    $(".aceOrderedOnCenterPile").remove();

    for (let i = 1; i <= 4; i++) {
        const directions = ['LEFT', 'RIGHT'];
        directions.forEach(function(value) {
            const centerPile = $("#CENTER_PILE_" + value + "_" + i);

            centerPile.prepend("<span class='aceOrderedOnCenterPile'></span>")
                .find(".aceOrderedOnCenterPile").css({
                "background-image": "url(../img/cards_plain/" + i + ".svg" + ")"
            });
        });
    }
}

export function removeBackgroundImagesToShowOnCenterPiles() {
    $(".aceOrderedOnCenterPile").remove();
}

export function effectsOnPageLoad() {
    $(document).ready(function () {
        $(".spinnerLoader").fadeOut('fast', function () {
            $("#gameHeadline").show();
            $("#logoImage").fadeIn();
            animateLogoImage();
        });
        $(".content-wrapper").fadeIn();
        $(".footer-wrapper").css('opacity', '100');
        $("#selectLanguageWrapper").fadeIn();
    });
}

function animatePlayerboards(game) {

    if ($(".playerBoardActive").length > 0) {
        kute.to(".playerBoardActive", {backgroundColor: "#f7dd4c"}, {
            duration: 700,
            complete: function () {
                // After the animation of the playerboards is finished check if there should be a card highlighting for tutorial mode:
                if (!game.isGameOver() && game.isInTutorialMode()) {
                    game.showBestMoveForTutorialMode();
                }
            }
        }).start();
    }


    kute.allTo(".playerBoardInactive", {backgroundColor: "#E5E5E5"}, {duration: 700}).start();
}

function animateLogoImage() {
    kute.fromTo("#logoImage", {rotateY: 0}, {rotateY: 720}, {duration: 1500, easing: 'easingCubicOut'}).start();
}

export function highlightBestMoveForTutorialMode(game, bestMove) {

    $("#changeWastePileAndReservePileIcon .cardImgWrapper").removeClass("highlightedSourcePileCardForTutorialMode");

    // If the best move is to move the cards from WP to RP the switch icon should be highlighted:
    if ($("#changeWastePileAndReservePileIcon").is(":visible")
        && bestMove.getSourcePilePosition() == PilePosition.WASTE_PILE_PLAYER_A
        && bestMove.getTargetPilePosition() == PilePosition.RESERVE_PILE_PLAYER_A) {
        $("#changeWastePileAndReservePileIcon img").addClass("highlightedSourcePileCardForTutorialMode");
    } else {
        const idSourcePile = bestMove.getSourcePilePosition().name;
        const sourcePile = $('#' + idSourcePile);
        const topMostCardOfSourcePile = sourcePile.find(".cardImgWrapper").last();
        topMostCardOfSourcePile.addClass("highlightedSourcePileCardForTutorialMode");

        const idTargetPile = bestMove.getTargetPilePosition().name;
        const targetPile = $('#' + idTargetPile);
        const topMostCardOfTargetPile = targetPile.find(".cardImgWrapper").last();
        // If there is at least one card on the target pile highlight this card:
        if (topMostCardOfTargetPile.length > 0) {
            topMostCardOfTargetPile.addClass("toHighlightOnDragStartForTutorialMode");
        }
        // ... else highlight the pile itself:
        else {
            targetPile.addClass("toHighlightOnDragStartForTutorialMode");
        }
    }
}

export function enableLevelSelect() {
    $("select[name='selectDifficultyOfGame']").attr('disabled', false);
}

export function disableLevelSelect() {
    $("select[name='selectDifficultyOfGame']").attr('disabled', true);
}

export function enableSortAcesOnCenterPilesChoice() {
    $("input[id='checkboxOrderAcesOnCenterPiles']").attr('disabled', false);
}

export function disableSortAcesOnCenterPilesChoice() {
    $("input[id='checkboxOrderAcesOnCenterPiles']").attr('disabled', true);
}

export function animateMove(game, moveToAnimate, wasKnockedByArtificialIntelligence, wasKnockedByIdentityPlayer, isDisallowedBackwardMove, forgottenMandatoryMoves, intendedMove) {

    const idSourcePile = moveToAnimate.getSourcePilePosition().name;
    const idTargetPile = moveToAnimate.getTargetPilePosition().name;

    const sourcePile = $('#' + idSourcePile);

    const topMostCardOfSourcePile = sourcePile.find(".cardImgWrapper").last();

    const sourcePileOffset = {
        x: topMostCardOfSourcePile.offset().left,
        y: topMostCardOfSourcePile.offset().top
    };

    const aPositions = getTargetPositionsOfAnimation(idTargetPile, sourcePileOffset);
    const leftPositionTargetPile = aPositions["leftPosition"];
    const topPositionTargetPile = aPositions["topPosition"];
    const targetPileOffset = aPositions["targetOffset"];

    // Highlighting of cards:
    if (wasKnockedByArtificialIntelligence) {
        highlightForgottenMandatoryMoves(moveToAnimate, forgottenMandatoryMoves, intendedMove);
    } else if (wasKnockedByIdentityPlayer) { // Red frame for card justified knocked by identity player.
        topMostCardOfSourcePile.addClass("redFrame");
        topMostCardOfSourcePile.addClass("redFilter");
    } else if (isDisallowedBackwardMove) { // Yellow frame for disallowed moveToAnimate card.
        topMostCardOfSourcePile.addClass("yellowFrame");
    } else { // Yellow frame for default moveToAnimate of the AI.
        topMostCardOfSourcePile.addClass("yellowFrame");
    }

    topMostCardOfSourcePile.css("z-index", "3");

    const cardSelector = document.querySelector('#' + idSourcePile + " .cardImgWrapper:last-child");
    const isKnockedMove = wasKnockedByArtificialIntelligence || wasKnockedByIdentityPlayer;
    const durationOfCardAnimation = getDurationOfCardAnimation(isDisallowedBackwardMove, isKnockedMove, targetPileOffset, sourcePileOffset);
    const delayOfCardAnimation = getDelayOfCardAnimation(isDisallowedBackwardMove, isKnockedMove);

    window.cardAnimation = kute.to(
        cardSelector,
        {translate: [leftPositionTargetPile, topPositionTargetPile]},
        {
            delay: delayOfCardAnimation,
            duration: durationOfCardAnimation,
            easing: 'easingCubicOut',
            start: function () {

                // On start of animation of a card of a reserve or waste pile containing only two cards
                // the "shifted" class must be removed from the last but one card.
                if ((sourcePile.hasClass("rp") || sourcePile.hasClass("wp")) && sourcePile.find(".cardImgWrapper").length >= 2) {
                    sourcePile.find(".cardImgWrapper:nth-child(2)").removeClass("shifted");
                }

                // If tutorial mode is activated and AI forgets to make a mandatory move show dialog:
                if (game.isInTutorialMode() && game.getActivePlayer() == Player.PLAYER_B && game.isMoveKnockable(moveToAnimate)) {
                    let dialogTitle = i18next.t("tutorial");
                    let dialogContent = i18next.t("tutorialModeKnockDialog");
                    sweetAlert2({
                        title: dialogTitle,
                        html: dialogContent,
                        customClass: 'fontsize-13 swat-left',
                        showCloseButton: true,
                        allowOutsideClick: false,
                        onOpen: function () {
                            pauseGameAnimation();
                        },
                        onClose: function () {
                            if (!$(".pauseGameButton").hasClass("toResume")) {
                                resumeGameAnimation();
                            }
                        }
                    });
                }
            },
            complete: function () {
                if (!game.isInKnockedState()) {
                    game.makeMoveAfterMoveAnimation(idSourcePile, idTargetPile, wasKnockedByArtificialIntelligence, wasKnockedByIdentityPlayer, isDisallowedBackwardMove);
                }
            }
        }
    );
    window.cardAnimation.start();
}

/**
 * Compute the delay for a card animation based
 * a) on the type of the move (disallowed backward moves should have a small delay at any time, knocked moves should have a high delay)
 * b) on the speed selected by the user via speed slider.
 *
 * @return integer the delay for the animation in milliseconds
 */
function getDelayOfCardAnimation(isDisallowedBackwardMove, isKnockedMove) {

    let delayInMilliseconds;

    if (isDisallowedBackwardMove) {
        return 300;
    }

    if (isKnockedMove) {
        return 2000;
    }

    const currentValueOfSpeedSlider = $('.speedSlider').slider("option", "value");

    switch (currentValueOfSpeedSlider) {
        case 1:
            delayInMilliseconds = 1400;
            break;
        case 2:
            delayInMilliseconds = 1100;
            break;
        case 3:
            delayInMilliseconds = 1000;
            break;
        case 4:
            delayInMilliseconds = 900;
            break;
        case 5:
            delayInMilliseconds = 800;
            break;
        case 6:
            delayInMilliseconds = 700;
            break;
        case 7:
            delayInMilliseconds = 600;
            break;
        case 8:
            delayInMilliseconds = 500;
            break;
        case 9:
            delayInMilliseconds = 300;
            break;
        case 10:
            delayInMilliseconds = 300;
            break;
    }

    return delayInMilliseconds;
}

/**
 * Compute the duration for a card animation based
 * a) on the type of the move (disallowed backward moves, knocked moves)
 * b) on the distance between the source and the target pile and
 * c) on the speed selected by the user via speed slider.
 *
 * @return integer the duration for the animation in milliseconds
 */
function getDurationOfCardAnimation(isDisallowedBackwardMove, isKnockedMove, targetPileOffset, sourcePileOffset) {

    let durationInMilliseconds;

    if (isDisallowedBackwardMove || isKnockedMove) {
        durationInMilliseconds = 1000;
        return durationInMilliseconds;
    }

    durationInMilliseconds = 400; // Base value...

    const xTemp = parseInt(targetPileOffset.x) - parseInt(sourcePileOffset.x);
    const yTemp = parseInt(targetPileOffset.y) - parseInt(sourcePileOffset.y);
    const distanceInPix = Math.sqrt(Math.pow(xTemp, 2) + Math.pow(yTemp, 2));

    durationInMilliseconds += distanceInPix * 3; // distanceInPix is some value between 60 and 450...

    const currentValueOfSpeedSlider = $('.speedSlider').slider("option", "value");

    switch (currentValueOfSpeedSlider) {
        case 1:
            durationInMilliseconds += 1000;
            break;
        case 2:
            durationInMilliseconds += 850;
            break;
        case 3:
            durationInMilliseconds += 700;
            break;
        case 4:
            durationInMilliseconds += 550;
            break;
        case 5:
            durationInMilliseconds += 400;
            break;
        case 6:
            durationInMilliseconds += 300;
            break;
        case 7:
            durationInMilliseconds += 200;
            break;
        case 8:
            durationInMilliseconds += 100;
            break;
        case 9:
            durationInMilliseconds -= 0;
            break;
        case 10:
            durationInMilliseconds -= 200;
            break;
    }

    return durationInMilliseconds;
}

function getTargetPositionsOfAnimation(idTargetPile, sourceOffset) {

    const targetPile = $('#' + idTargetPile);
    let targetOffset;
    let correctionValue;
    let leftPosition;
    let topPosition;

    // Move card to house pile:
    if (idTargetPile.indexOf("HOUSE_PILE") >= 0) {

        // Move card to empty house pile:
        if (targetPile.find(".cardImgWrapper").last().length == 0) {

            targetOffset = {
                x: targetPile.offset().left,
                y: targetPile.offset().top
            };

            let widthOfHousePile = $(".pilePanel.hp:first").css("width");
            widthOfHousePile = widthOfHousePile.replace('px', '');
            widthOfHousePile = parseInt(widthOfHousePile);

            let widthOfCard;
            if ($(".cardImgWrapper.card.wp:first").length > 0) {
                widthOfCard = $(".cardImgWrapper.card.wp:first").css("width");
            } else {
                widthOfCard = $(".cardImgWrapper.card.rp:first").css("width");
            }
            widthOfCard = widthOfCard.replace('px', '');
            widthOfCard = parseInt(widthOfCard);

            if (idTargetPile.indexOf("LEFT") >= 0) {
                correctionValue = widthOfHousePile - widthOfCard;
            } else if (idTargetPile.indexOf("RIGHT") >= 0) {
                correctionValue = 0;
            }

            leftPosition = targetOffset.x - sourceOffset.x + correctionValue;
            topPosition = targetOffset.y - sourceOffset.y;
        }
        // Move card to non empty house pile:
        else {

            let topMostCardOfTargetPile = targetPile.find(".cardImgWrapper").last();

            targetOffset = {
                x: topMostCardOfTargetPile.offset().left,
                y: topMostCardOfTargetPile.offset().top
            };

            const overlappingDistanceBetweenCards = 16;

            if (idTargetPile.indexOf("LEFT") >= 0) {
                correctionValue = -1 * overlappingDistanceBetweenCards;
            } else if (idTargetPile.indexOf("RIGHT") >= 0) {
                correctionValue = overlappingDistanceBetweenCards;
            }

            leftPosition = targetOffset.x - sourceOffset.x + correctionValue;
            topPosition = targetOffset.y - sourceOffset.y;
        }
    }
    // Move card to waste pile or center pile:
    else {

        targetOffset = {
            x: targetPile.offset().left,
            y: targetPile.offset().top
        };

        leftPosition = targetOffset.x - sourceOffset.x;
        topPosition = targetOffset.y - sourceOffset.y;
    }

    const result = [];
    result["leftPosition"] = leftPosition;
    result["topPosition"] = topPosition;
    result["targetOffset"] = targetOffset;
    return result;
}

export function renderGameOverDialog(game) {

    let dialogTitle;
    let dialogContent;
    let imageUrl;

    if (game.getWinnerPlayer().name === "PLAYER_A") {
        dialogTitle = i18next.t("congratulations");
        dialogContent = i18next.t("youWon");
        imageUrl = "../img/gameOverWon.png";
    } else if (game.getWinnerPlayer().name === "PLAYER_B") {
        dialogTitle = i18next.t("itsAPitty");
        dialogContent = i18next.t("youLost");
        const joke = jokesService.getRandomJoke();
        dialogContent += "<div class='joke'>" + joke + "</div>";
        imageUrl = "../img/gameOverLost.png";
    }

    sweetAlert2({
        title: dialogTitle,
        html: dialogContent,
        showCloseButton: true,
        imageUrl: imageUrl,
        allowOutsideClick: false
    });
}

export function renderNotyMoveNotAllowed(game, backwardMove) {
    let message = i18next.t("moveNotAllowedInfo");
    noty({
        layout: 'center',
        theme: 'relax',
        type: 'warning',
        timeout: 1200,
        text: message,
        animation: {
            // Animate.css class names:
            open: 'animated fadeIn',
            close: 'animated zoomOut'
        },
        callback: {
            onShow: function () {
                $(".interruptGameplayAction, .pauseGameButton, .knockButton").addClass("disabledButton");
            },
            onClose: function () {
                $(".interruptGameplayAction, .pauseGameButton, .knockButton").removeClass("disabledButton");
                game.animateMove(backwardMove, false, false, true, null);
            }
        }
    });
}

function highlightForgottenMandatoryMoves(moveToAnimate, forgottenMandatoryMoves, intendedMove) {

    const idSourcePile = moveToAnimate.getSourcePilePosition().name;
    const sourcePile = $('#' + idSourcePile);
    const topMostCardOfSourcePile = sourcePile.find(".cardImgWrapper").last();

    // If the moved card of the intended move was a mandatory move itself color it red:
    let movedCardWasPartOfAMandatoryMove = false;
    for (let forgottenMove of forgottenMandatoryMoves) {
        const idSourcePileOfForgottenMove = forgottenMove.getSourcePilePosition().name;
        const idSourcePileOfIntendedMove = intendedMove.getSourcePilePosition().name;
        if (idSourcePileOfForgottenMove == idSourcePileOfIntendedMove) {
            topMostCardOfSourcePile.addClass("redFrame");
            topMostCardOfSourcePile.addClass("redFilter");
            movedCardWasPartOfAMandatoryMove = true;
            break;
        }
    }

    // Else color it yellow:
    if (!movedCardWasPartOfAMandatoryMove) {
        topMostCardOfSourcePile.addClass("yellowFrame");
    }

    // Color all forgotten mandatory move cards beside the moved card red:
    for (let forgottenMove of forgottenMandatoryMoves) {

        const idSourcePileOfForgottenMove = forgottenMove.getSourcePilePosition().name;
        const idTargetPileOfForgottenMove = forgottenMove.getTargetPilePosition().name;
        const idSourcePileOfIntendedMove = intendedMove.getSourcePilePosition().name;

        // 1. Color the card which should have been played to a center pile:
        // But: No red highlighting for the moved card if the moved card of the intended move was a mandatory move itself
        // (already covered by the highlighting above)
        if (idSourcePileOfIntendedMove != idSourcePileOfForgottenMove) {
            const sourcePileOfForgottenMove = $('#' + idSourcePileOfForgottenMove);
            const topMostCardOfSourcePileMandatoryMove = sourcePileOfForgottenMove.find(".cardImgWrapper").last();
            topMostCardOfSourcePileMandatoryMove.addClass("redFrame");
            topMostCardOfSourcePileMandatoryMove.addClass("redFilter");
        }

        // 2. Color the center pile to which the card of the forgotten move should have been played:
        const targetPileOfForgottenMove = $('#' + idTargetPileOfForgottenMove);
        targetPileOfForgottenMove.addClass("redFrame");
        targetPileOfForgottenMove.addClass("redFilter");

    }

}

export function renderNotyAiKnocked(game, backwardMove, forgottenMandatoryMoves, intendedMove) {
    let message = i18next.t("knockKnockInfo");
    noty({
        layout: 'center',
        theme: 'relax',
        type: 'error',
        text: message,
        animation: {
            // Animate.css class names:
            open: 'animated tada',
            close: 'animated zoomOut'
        },
        closeWith: ['button','click'],
        callback: {
            onShow: function () {
                $(".interruptGameplayAction, .pauseGameButton, .knockButton").addClass("disabledButton");
                // Start showing highlighting of forgotten moves already to give the real player more time
                // to check what he made wrong:
                highlightForgottenMandatoryMoves(backwardMove, forgottenMandatoryMoves, intendedMove);
            },
            onClose: function () {
                $(".interruptGameplayAction, .pauseGameButton, .knockButton").removeClass("disabledButton");
                game.animateMove(backwardMove, true, false, false, forgottenMandatoryMoves, intendedMove);
                game.setKnockedState(false);
            }
        }
    });
}

export function renderNotyPlayerKnocked(game) {

    if (game.isInTutorialMode()) {
        const idPileToClick = game.getHighlightedCenterPileToClickInKnockState();
        if (idPileToClick) {
            $("#" + idPileToClick).addClass("highlightedCenterPileToClickForTutorialMode");
        }
    }

    let message = i18next.t("whyDoYouKnock");
    noty({
        layout: 'center',
        theme: 'relax',
        type: 'warning', // success, error, warning, information, notification
        timeout: 1500,
        text: message,
        animation: {
            // Animate.css class names:
            open: 'animated bounceIn',
            close: 'animated zoomOut'
        },
        callback: {
            onShow: function () {
                $(".knockButton").addClass("disabledButton");
                $(".pilePanel.cp").addClass("centerPileForKnockProve");
                $(".pilePanel.cp").addClass("highlightBackground");

                // If the AI moved a card to a center pile this card should also have a click event:
                if (game.getIntendedMoveOfArtificialIntelligence().getTargetPilePosition().getPileType() == PileType.CENTER) {
                    const sourcePile = $('#' + game.getIntendedMoveOfArtificialIntelligence().getSourcePilePosition().name);
                    const topMostCardOfSourcePile = sourcePile.find(".cardImgWrapper").last();
                    topMostCardOfSourcePile.addClass("centerPileForKnockProve");
                }
            }
        }
    });
}

export function renderNotyKnockJustified(game, backwardMove) {
    $("#noty_center_layout_container").remove(); // Remove "Why do you knock" message if it's still visible.

    let message = i18next.t("justifiedKnock");
    noty({
        layout: 'center',
        theme: 'relax',
        type: 'success',
        timeout: 1300,
        text: message,
        killer: true,
        animation: {
            // Animate.css class names:
            open: 'animated fadeIn',
            close: 'animated zoomOut'
        },
        callback: {
            onShow: function () {
                $(".knockButton").hide();
                $(".interruptGameplayAction, .pauseGameButton").addClass("disabledButton");
                $(".pilePanel.cp").removeClass("highlightedCenterPileToClickForTutorialMode");
                $("*").removeClass("centerPileForKnockProve");
                $(".pilePanel.cp").removeClass("highlightBackground");
            },
            onClose: function () {
                $(".interruptGameplayAction, .pauseGameButton, .knockButton").removeClass("disabledButton");
                // Reset the counter for numbers of turns to miss to avoid that the real player has to miss the
                // turn after justified knocking:
                game.resetCounterNumbersOfTurnsToMiss();
                game.animateMove(backwardMove, false, true, false, null);
                game.setKnockedState(false);
            }
        }
    });
}

export function renderNotyKnockNotJustified(game, playerHasTooManyWrongKnocks, playerPossiblyClickedTooLate) {
    $("#noty_center_layout_container").remove(); // Remove "Why do you knock" message if it's still visible.

    let message;
    if (playerHasTooManyWrongKnocks) {
        message = i18next.t("tooManyWrongKnocks");
    } else if (playerPossiblyClickedTooLate) {
        message = i18next.t("seemsYouAreLate");
    } else {
        message = i18next.t("wrongKnock");
    }
    noty({
        layout: 'center',
        theme: 'relax',
        type: 'error',
        killer: true,
        closeWith: ['button','click'],
        animation: {
            // Animate.css class names:
            open: 'animated fadeIn',
            close: 'animated zoomOut'
        },
        text: message,
        callback: {
            onShow: function () {
                $(".interruptGameplayAction, .pauseGameButton").addClass("disabledButton");
                $("*").removeClass("centerPileForKnockProve");
                $(".pilePanel.cp").removeClass("highlightBackground");
                $(".pilePanel.cp").removeClass("highlightedCenterPileToClickForTutorialMode");
            },
            afterClose: function () {
                $(".interruptGameplayAction, .pauseGameButton, .knockButton").removeClass("disabledButton");
                game.setKnockedState(false);
                game.checkForEndOfGame();
                if (!game.isGameOver()) {
                    game.letArtificialIntelligencePlay();
                }
            }
        }
    });
}

function secondsToHHMMSS(secondsInput) {
    var sec_num = parseInt(secondsInput, 10);
    var hours = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours < 10) {
        hours = "0" + hours;
    }
    if (minutes < 10) {
        minutes = "0" + minutes;
    }
    if (seconds < 10) {
        seconds = "0" + seconds;
    }
    return hours + ':' + minutes + ':' + seconds;
}

export function renderNotyTurnToMiss(game) {
    let message = i18next.t("lostTurnBecauseOfWrongKnocking");

    noty({
        layout: 'center',
        theme: 'relax',
        type: 'warning',
        timeout: 1000,
        text: message,
        animation: {
            // Animate.css class names:
            open: 'animated bounceIn',
            close: 'animated zoomOut'
        },
        callback: {
            onShow: function () {
                $(".interruptGameplayAction, .pauseGameButton, .knockButton").addClass("disabledButton");
            },
            afterClose: function () {
                $(".interruptGameplayAction, .pauseGameButton, .knockButton").removeClass("disabledButton");
                game.letArtificialIntelligencePlay();
            }
        }
    });
}