
import * as PlayerUtils from '../utils/player_utils';
import * as PileUtils from '../utils/pile_utils';
import * as PlayboardUtils from '../utils/playboard_utils';
import * as AiUtils from '../utils/ai_utils';

import { PileType } from '../enums/pileinformation/piletype';
import { CardNumber } from '../enums/cardinformation/cardnumber';
import { Move } from '../entities/move';
import { Player } from '../enums/player';

import * as AiConfig from '../config/ai_config';

/**
 * Used for AI playing. Checks for mandatory and allowed moves of the AI player and
 * after the decision which move is to make the function calls game.animateMoveOfAi() with the chosen move.
 */
export function letArtificialIntelligencePlay(game) {

	const aiPlayer = PlayerUtils.getOpponentPlayer(game.getIdentityPlayer());

	let mandatoryMoves = null;

	const playableAceOnTopOfAnyPile = checkForPlayableAceOnTopOfAnyPile(game.getPlayboard(), aiPlayer);

	const artificialIntelligenceKnockedBefore = checkIfArtificialIntelligenceKnockedBefore(game);
	const artificialIntelligenceWasKnockedByIdentityPlayerBefore = checkIfArtificialIntelligenceWasKnockedBefore(game);
	const randomNumberCheckMandatoryMoves = Math.random();

	// If the AI has the possiblity to play an ACE as mandatory move the mandatory moves must be checked.
	// (Otherwise the AI might overlook the mandatory move of an ace what is not very realistic.)
	if(playableAceOnTopOfAnyPile) {
		mandatoryMoves = PlayboardUtils.getMandatoryMoves(game, true);
	}
	// If the AI knocked in the move before OR if the identity player knocked out the AI before the mandatory moves MUST be checked now!
	// (Otherwise it might happen that the AI knocks and after that forgets itself to play the mandatory card OR that it
	// seems that the AI is not able to understand why the identity player knocked before.)
	else if(artificialIntelligenceKnockedBefore || artificialIntelligenceWasKnockedByIdentityPlayerBefore) {
		mandatoryMoves = PlayboardUtils.getMandatoryMoves(game, true);
	}
	// If the AI did not knock in the move before it's about random and the level of difficulty if the mandatory moves are checked or not:
	else if(randomNumberCheckMandatoryMoves <= AiUtils.getProbability(game.getLevelOfDifficulty(), AiConfig.PROBABILITY_TO_CHECK_MANDATORY_MOVES)) {
		mandatoryMoves = PlayboardUtils.getMandatoryMoves(game, true);
	}

	// Mandatory move found:
	if (mandatoryMoves && mandatoryMoves.length > 0 ) {
		const move = mandatoryMoves[0];
		move.setPlayer(PlayerUtils.getOpponentPlayer(game.getIdentityPlayer()));
		game.setIntendedMoveOfArtificialIntelligence(move);
		game.animateMove(move);
	}
	// No mandatory move found or AI will "forget" to make a given mandatory move:
	else {

		let moveOfChoice = null;
		const emptyHousePileSlotsFound = PlayboardUtils.checkForEmptyHousePileSlots(game.getPlayboard());
		const randomNumberCheckMoveOfChoice = Math.random();

		// If there are empty house pile slots right now the moves of choice must be checked.
		// (Otherwise the AI might "overlook" that there is one or more free slot and that's not very realistic.)
		if(emptyHousePileSlotsFound) {
			moveOfChoice = AiUtils.getMoveOfChoice(game, false);
		}
		else if(randomNumberCheckMoveOfChoice <= AiUtils.getProbability(game.getLevelOfDifficulty(), AiConfig.PROBABILITY_TO_CHECK_MOVES_OF_CHOICE)) {
			moveOfChoice = AiUtils.getMoveOfChoice(game, false);
		}

		// Make the move of choice:
		if (moveOfChoice != null) {
			moveOfChoice.setPlayer(PlayerUtils.getOpponentPlayer(game.getIdentityPlayer()));
			game.setIntendedMoveOfArtificialIntelligence(moveOfChoice);
			game.animateMove(moveOfChoice);
		}
		// No best move found: Play topmost card of reserve pile or switch cards from waste pile to reserve pile or end turn:
		else {

			const reservePilePositionOfPlayer = PileUtils.getReservePilePositionOfPlayer(aiPlayer);
			const reservePileOfPlayer = game.getPlayboard().getPlayboardMap().get(reservePilePositionOfPlayer);
			const wastePilePositionOfPlayer = PileUtils.getWastePilePositionOfPlayer(aiPlayer);
			const wastePileOfPlayer = game.getPlayboard().getPlayboardMap().get(wastePilePositionOfPlayer);

			// If reserve pile is empty:
			if (PileUtils.isPileEmpty(reservePileOfPlayer)) {
				if (!PileUtils.isPileEmpty(wastePileOfPlayer)) {
					// No animation of this kind of move so letArtificialIntelligencePlay is called directly (instead of calling game.animateMove(move)).
					game.moveCardsFromWastePileToReservePile(aiPlayer, false);
					game.letArtificialIntelligencePlay();
				}
				// else: the game is over and the AI won...
			}
			// There are still cards on the reserve pile:
			else {

				const topCard2PileOfReservePile = PileUtils.getTopCard2PileElement(reservePileOfPlayer);

				// Reserve pile card already open - end turn by pushing the top card of the reserve pile on the waste pile:
				if (topCard2PileOfReservePile.isFaceUp()) {

					const endTurnMove = new Move();
					endTurnMove.setSourcePilePosition(reservePilePositionOfPlayer);
					endTurnMove.setTargetPilePosition(wastePilePositionOfPlayer);
					endTurnMove.setPlayer(PlayerUtils.getOpponentPlayer(game.getIdentityPlayer()));
					game.setIntendedMoveOfArtificialIntelligence(endTurnMove);
					game.animateMove(endTurnMove);
					game.hideKnockButton();

				}
				// Uncover top card of reserve pile and go on:
				else {
					// No animation of this kind of move so letArtificialIntelligencePlay is called directly (instead of calling game.animateMove(move)).
					game.uncoverTopCardOfReservePile(aiPlayer);
					game.letArtificialIntelligencePlay();
				}
			}
		}
	}
}

/**
 * Helper method for letArtificialIntelligencePlay().
 * Check if the last move was a knocked move by the artificialIntelligence.
 * Identified by checking the player of the last move.
 * If it was the dealer the move was a backward move after a knock.
 *
 * For example:
 * Move 350: PLAYER_A from WASTE_PILE_PLAYER_A to HOUSE_PILE_RIGHT_4
 * Move 351: DEALER from HOUSE_PILE_RIGHT_4 to WASTE_PILE_PLAYER_A
 * Move 352 (current move,not yet stored to move history): PLAYER_B from X to Y
 *
 */
export function checkIfArtificialIntelligenceKnockedBefore(game) {

	let knockedBefore = false;
	const playboard = game.getPlayboard();

	if(playboard.getMoveHistory().size > 0) {
		const lastMove = playboard.getMoveHistory().get(playboard.getMoveHistory().size);
		if(lastMove.getPlayer() == Player.DEALER) {
			knockedBefore = true;
		}
	}

	return knockedBefore;
}

/**
 * Helper method for letArtificialIntelligencePlay().
 * Check if the last move of the AI was justified knocked by the real player.
 *
 * For example:
 *
 * Move 350: PLAYER_B from HOUSE_PILE_RIGHT_4 to HOUSE_PILE_RIGHT_1
 * Move 351: DEALER from HOUSE_PILE_RIGHT_1 to WASTE_PILE_PLAYER_B
 * Move 352: PLAYER_A from RESERVE_PILE_PLAYER_A to RESERVE_PILE_PLAYER_A
 * Move 352: PLAYER_A from RESERVE_PILE_PLAYER_A to WASTE_PILE_PLAYER_A
 * Move 353 (current move, not yet stored to move history): PLAYER_B from X to Y
 */
export function checkIfArtificialIntelligenceWasKnockedBefore(game) {

	const playboard = game.getPlayboard();
	let wasKnockedBefore = false;
	const aiPlayer = PlayerUtils.getOpponentPlayer(game.getIdentityPlayer());

	// Catch the last move of the AI:
	let numberOfLastMoveOfTheArtificialIntelligence = 0;
	let numberFound = false;

	if(playboard.getMoveHistory().size > 0) {
		let moveCounter = playboard.getMoveHistory().size;
		while (!numberFound && moveCounter > 0) {
			const move = playboard.getMoveHistory().get(moveCounter);
			if(move.getPlayer() == aiPlayer) {
				numberOfLastMoveOfTheArtificialIntelligence = moveCounter;
				numberFound = true;
			}
			moveCounter--;
		}
	}

	// Last move of AI found:
	if(numberOfLastMoveOfTheArtificialIntelligence > 0) {
		// Check the move after the found move of the AI: If its player was the dealer, the AI was knocked out by the real player.
		if(playboard.getMoveHistory().size >= numberOfLastMoveOfTheArtificialIntelligence + 1) {
			const move = playboard.getMoveHistory().get(numberOfLastMoveOfTheArtificialIntelligence + 1);
			if(move.getPlayer() == Player.DEALER) {
				wasKnockedBefore = true;
			}
		}
	}

	return wasKnockedBefore;
}

/**
 * Helper method for letArtificialIntelligencePlay().
 * Check if the given player has the possibility to play an ace right now.
 */
export function checkForPlayableAceOnTopOfAnyPile(playboard, player) {

	let playableAceOnTopOfAnyPile = false;

	const reservePileOfPlayer = playboard.getPlayboardMap().get(PileUtils.getReservePilePositionOfPlayer(player));
	const wastePileOfPlayer = playboard.getPlayboardMap().get(PileUtils.getWastePilePositionOfPlayer(player));
	const topCard2ReservePile = PileUtils.getTopCard2PileElement(reservePileOfPlayer);

	let topCardOfPlayersReservePileIsFaceUp = false;

	if(topCard2ReservePile != null && topCard2ReservePile.isFaceUp()) {
		topCardOfPlayersReservePileIsFaceUp = true;
	}

	// If faceup topcard on reserve pile is an ace:
	if(topCardOfPlayersReservePileIsFaceUp && topCard2ReservePile != null && PileUtils.getTopCard(reservePileOfPlayer).getCardNumber() == CardNumber.ACE) {
		playableAceOnTopOfAnyPile = true;
	}
	// If topcard on waste pile is an ace:
	else if(!topCardOfPlayersReservePileIsFaceUp && PileUtils.getTopCard(wastePileOfPlayer) != null && PileUtils.getTopCard(wastePileOfPlayer).getCardNumber() == CardNumber.ACE){
		playableAceOnTopOfAnyPile = true;
	}
	// Check if there is an ace as topcard of any housepile:
	else if(!topCardOfPlayersReservePileIsFaceUp) {

		playboard.getPlayboardMap().forEach(function(value, key) {
			const pilePosition = key;
			const pile = value;
			const topCard = PileUtils.getTopCard(pile);

			if(topCard != null && topCard.getCardNumber() == CardNumber.ACE && pilePosition.getPileType() == PileType.HOUSE) {
				playableAceOnTopOfAnyPile = true;
				return;
			}
		});
	}
	return playableAceOnTopOfAnyPile;
}