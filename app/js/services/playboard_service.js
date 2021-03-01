import { DeckColor } from '../enums/cardinformation/deckcolor';
import { Suit } from '../enums/cardinformation/suit';
import { CardNumber } from '../enums/cardinformation/cardnumber';
import { Card } from '../entities/card';
import { Card2Pile } from '../entities/card2pile';
import { Playboard } from '../entities/playboard';
import { PileType } from '../enums/pileinformation/piletype';
import { PilePosition } from '../enums/pileinformation/pileposition';
import { Pile } from '../entities/pile';
import { Move } from '../entities/move';

import * as Utils from '../utils/utils';
import * as PlayboardUtils from '../utils/playboard_utils';
import * as PileUtils from '../utils/pile_utils';

export function initializePlayboard() {

	const blueCardDeck = createShuffledCarddeck(DeckColor.BLUE);
	const redCardDeck = createShuffledCarddeck(DeckColor.RED);

	const playboardMap = createPlayboardMap();
	const playboard = new Playboard();
	playboard.setPlayboardMap(playboardMap);

	// Initial distribution of cards:
	PlayboardUtils.dealCards(playboard, blueCardDeck, redCardDeck);

	playboard.setMoveHistory(new Map());

	return playboard;
}

function createShuffledCarddeck(carddeckcolor) {
	let cardDeck = [];

	for (let cardsuit of Suit.enumValues) {
		for (let cardnumber of CardNumber.enumValues) {
			const card = new Card(cardsuit, cardnumber, carddeckcolor);
			const card2Pile = new Card2Pile(card);
			cardDeck.push(card2Pile);
		}
	}
	cardDeck = Utils.shuffleArray(cardDeck);
	return cardDeck;
}

function createPlayboardMap() {
    const playboardMap = new Map();
    for (let pilePosition of PilePosition.enumValues) {
        const pile = new Pile(pilePosition, []);
        playboardMap.set(pilePosition, pile);
    }
    return playboardMap;
}

export function makeMove(game, move, isAllowedMove) {

	const playboard = game.getPlayboard();
    PlayboardUtils.changePlayboard(playboard, move, isAllowedMove);

    let isNullMove = false;

    // Move from house pile to same house pile:
    if(move.getSourcePilePosition() == move.getTargetPilePosition()
        && move.getSourcePilePosition().getPileType() == PileType.HOUSE) {
        isNullMove = true;
    }
    // Move from own reserve pile to own reserve pile:
    else if(move.getSourcePilePosition() == PileUtils.getReservePilePositionOfPlayer(move.getPlayer())
        && move.getTargetPilePosition() == PileUtils.getReservePilePositionOfPlayer(move.getPlayer())) {
        isNullMove = true;
    }

    if(isAllowedMove && !isNullMove) {
        addMoveToMoveHistory(playboard, move);
        game.checkForEndOfGame();
        if(!game.isGameOver()) {
			game.checkForChangeOnActivePlayer(move);
		}
    }

    return playboard;
}

export function uncoverTopCardOfReservePile(playboard, player) {

	const pilePosition = PileUtils.getReservePilePositionOfPlayer(player);
	const reservePileOfPlayer = playboard.getPlayboardMap().get(pilePosition);
	const topCardOnPileElement = PileUtils.getTopCard2PileElement(reservePileOfPlayer);

	if (!PileUtils.isPileEmpty(reservePileOfPlayer) && !topCardOnPileElement.isFaceUp()) {
		topCardOnPileElement.setFaceUp(true);

		const move = new Move();
		move.setSourcePilePosition(pilePosition);
		move.setTargetPilePosition(pilePosition);
		move.setPlayer(player);
		addMoveToMoveHistory(playboard, move);
		return move;
	}
}

/**
 * Store a move to the move history of the given playboard.
 *
 * We have three kinds of stored moves:
 *
 * 1. Player X uncovered the topmost card of his own reserve pile. Called by
 * uncoverTopCardOfReservePile() method, identified by RESERVE_PILE_PLAYER_X
 * to RESERVE_PILE_PLAYER_X.
 * 2. Player X moved all the cards of his waste
 * pile to his (formerly empty) reserve pile. Called by
 * moveCardsFromWastePileToReservePile() method, identified by
 * WASTE_PILE_PLAYER_X to RESERVE_PILE_PLAYER_X.
 * 3. All other moves (the "real" moves). Called by makeMove(), identified e.g. by PLAYER_X from
 * HOUSE_PILE_LEFT_3 to WASTE_PILE_PLAYER_Y.
 *
 */
export function addMoveToMoveHistory(playboard, move) {
	const numberOfLastMove = playboard.getMoveHistory().size;
	const numberOfNewMove = numberOfLastMove + 1;
	playboard.getMoveHistory().set(numberOfNewMove, move);
}

/**
 * Move the cards of the given player from its WP to its RP.
 * @param playboard
 * @param player
 * @param isKnockedMove
 * @returns {Move}
 */
export function moveCardsFromWastePileToReservePile(playboard, player, isKnockedMove) {

	let movedCards = false;
	if(!isKnockedMove) {
		movedCards = PlayboardUtils.moveCardsFromWastePileToReservePile(playboard, player);
	}
	else {
		movedCards = true;
	}

	if (movedCards) {
		const move = new Move();
		move.setSourcePilePosition(PileUtils.getWastePilePositionOfPlayer(player));
		move.setTargetPilePosition(PileUtils.getReservePilePositionOfPlayer(player));
		move.setPlayer(player);
		addMoveToMoveHistory(playboard, move);
		return move;
	}
}

/**
 * Testing helper function.
 */
export function removeAllCardsFromPlayboard(playboard) {
	for (let pilePosition of PilePosition.enumValues) {
		const card2pileElements = playboard.getPlayboardMap().get(pilePosition).getCard2PileElements();
		card2pileElements.length = 0;
	}
}