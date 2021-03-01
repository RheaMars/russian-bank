
import * as PlayboardUtils from '../utils/playboard_utils';
import * as PileUtils from '../utils/pile_utils';

import { PileType } from '../enums/pileinformation/piletype';
import { PilePosition } from '../enums/pileinformation/pileposition';
import { Player } from '../enums/player';

import * as AiConfig from '../config/ai_config';

/**
 * Computes the move of choice for the current state of the given playboard.
 *
 * This method considers the following strategy:
 *
 * - Remove the really stupid moves from the list of all allowed moves to get the at least reasonable moves.
 * - Split the remaining moves up in three categories:
 * Priority-1-moves: Moves that push away a card from my own pile (WP and RP) to a foreign pile.
 * Priority-2-moves: Moves that push a card to to the waste pile of the opponent.
 * Priority-3-moves: Remaining moves of the list of reasonable moves.
 *
 * @param isTutorialRelated if set to true this function should compute the best possible move for
 * the real player in the tutorial mode
 *
 * Note: This method does not consider mandatory moves!
 * If levelOfDifficulty if is set to 1 this method will return the smartest move instead of a randomized move.
 */
export function getMoveOfChoice(game, isTutorialRelated) {

	const playboard = game.getPlayboard();
	const levelOfDifficulty = game.getLevelOfDifficulty();
	const allowedMoves = PlayboardUtils.getAllowedMoves(game);

	// Catch reasonable moves (allowed moves without completely stupid moves like null moves):
	const reasonableMoves = filterAllowedMovesToReasonableMoves(game, allowedMoves);

	// Split the reasonable moves up in three categories:
	const priority1Moves = []; // Move a card away from the own piles (RP and WP)
	const priority2Moves = []; // Move a card to the waste pile of the opponent
	const priority3Moves = []; // All other moves

	for (let move of reasonableMoves) {

		let moveAddedToPrio1OrPrio2 = false;

		// If we find a move that moves a card away from the own piles (RP and WP):
		if (move.getSourcePilePosition() == PileUtils.getWastePilePositionOfPlayer(move.getPlayer())
			|| move.getSourcePilePosition() == PileUtils.getReservePilePositionOfPlayer(move.getPlayer())) {
			priority1Moves.push(move);
			moveAddedToPrio1OrPrio2 = true;
		}

		// If we find a move that moves a card to the waste pile of the opponent:
		if (move.getTargetPilePosition() == PileUtils.getWastePilePositionOfOpponentPlayer(move.getPlayer())) {
			priority2Moves.push(move);
			moveAddedToPrio1OrPrio2 = true;
		}

		// All other moves:
		if (!moveAddedToPrio1OrPrio2) {
			priority3Moves.push(move);
		}
	}
	
	let moveOfChoice = null;

	// No reasonable move found, so there is no move of choice:
	if (reasonableMoves.length == 0) {
		moveOfChoice = null;
	} else {

		if(levelOfDifficulty == 1 || isTutorialRelated) {
			moveOfChoice = getBestMoveOfChoice(playboard, priority1Moves, priority2Moves, priority3Moves);
		}
		else {
			moveOfChoice = getRandomizedMoveOfChoice(playboard, levelOfDifficulty, priority1Moves, priority2Moves, priority3Moves);
		}
	}

	return moveOfChoice;
}

/**
 * Filters the given list of moves to keep only moves which are not completely brainless (e.g. a move from a pile to the same
 * pile).
 */
function filterAllowedMovesToReasonableMoves(game, movesToFilter) {

	const player = game.getActivePlayer();
	const playboard = game.getPlayboard();
	let reasonableMoves = [];

	for (let move of movesToFilter) {

		// Avoid to play cards to the own waste pile:
		if (move.getTargetPilePosition() == PileUtils.getWastePilePositionOfPlayer(player)) {
			continue;
		}

		// Avoid moves from pile to the same pile (null moves):
		if (move.getSourcePilePosition() == move.getTargetPilePosition()) {
			continue;
		}

		// Avoid playing card from a house pile to another house pile with zero cards (this means in worst case to lose an empty slot):
		const targetPile = playboard.getPlayboardMap().get(move.getTargetPilePosition());
		if (move.getSourcePilePosition().getPileType() == PileType.HOUSE
			&& move.getTargetPilePosition().getPileType() == PileType.HOUSE
			&& targetPile.getCard2PileElements().length == 0) {
			continue;
		}

		// Avoid playing a card from a house pile to another house pile where second top card of source pile
		// has the same number and color like the top card of the target pile (kind of null move in loop).
		if (move.getSourcePilePosition().getPileType() == PileType.HOUSE && move.getTargetPilePosition().getPileType() == PileType.HOUSE) {
			const sourcePile = playboard.getPlayboardMap().get(move.getSourcePilePosition());
			if (sourcePile.getCard2PileElements().length >= 2) {

				const numberOfTopmostCardTargetPile = PileUtils.getTopCard(targetPile).getCardNumber();
				const colorOfTopmostCardTargetPile = PileUtils.getTopCard(targetPile).getSuit().getCardColor();

				const numberOfSecondTopmostCardSourcePile = PileUtils.getSecondTopCard(sourcePile).getCardNumber();
				const colorOfSecondTopmostCardSourcePile = PileUtils.getSecondTopCard(sourcePile).getSuit().getCardColor();

				if (numberOfTopmostCardTargetPile == numberOfSecondTopmostCardSourcePile
					&& colorOfTopmostCardTargetPile == colorOfSecondTopmostCardSourcePile) {
					continue;
				}
			}
		}

		reasonableMoves.push(move);
	}
	
	return reasonableMoves;
}

/**
 * Catch "the most smartest move" out of the given lists (separated by priority of moves).
 */
function getBestMoveOfChoice(playboard, priority1Moves, priority2Moves, priority3Moves) {
	if (priority1Moves.length > 0) {
		return getMoveOfChoiceWithinPriority1(playboard, 0, priority1Moves, false);
	} else if (priority2Moves.length > 0) {
		return getMoveOfChoiceWithinPriority2or3(playboard, 0, priority2Moves, false);
	} else {
		return getMoveOfChoiceWithinPriority2or3(playboard, 0, priority3Moves, false);
	}
}

/**
 * Catch a randomized move out of the given lists (separated by priority of moves).
 */
function getRandomizedMoveOfChoice(playboard, levelOfDifficulty, priority1Moves, priority2Moves, priority3Moves) {

	let moveOfChoice = null;
	const randomNumber = Math.random();

	if (priority1Moves.length > 0 && priority2Moves.length > 0 && priority3Moves.length > 0) {

		if (randomNumber <= getProbability(levelOfDifficulty, AiConfig.PROBABILITY_TAKE_PRIO_1_MOVE_INSTEAD_OF_PRIO_2_OR_3)) {
			moveOfChoice = getMoveOfChoiceWithinPriority1(playboard, levelOfDifficulty, priority1Moves, true);
		}
		else if(randomNumber <= getProbability(levelOfDifficulty, AiConfig.PROBABILITY_TAKE_PRIO_1_MOVE_INSTEAD_OF_PRIO_2_OR_3 + AiConfig.PROBABILITY_TAKE_PRIO_2_MOVE_INSTEAD_OF_PRIO_1_OR_3)) {
			moveOfChoice = getMoveOfChoiceWithinPriority2or3(playboard, levelOfDifficulty, priority2Moves, true);
		}
		else {
			moveOfChoice = getMoveOfChoiceWithinPriority2or3(playboard, levelOfDifficulty, priority3Moves, true);
		}
	}
	else if(priority1Moves.length > 0 && priority2Moves.length > 0) {

		if (randomNumber <= getProbability(levelOfDifficulty, AiConfig.PROBABILITY_TAKE_PRIO_1_MOVE_INSTEAD_OF_PRIO_2)) {
			moveOfChoice = getMoveOfChoiceWithinPriority1(playboard, levelOfDifficulty, priority1Moves, true);
		}
		else {
			moveOfChoice = getMoveOfChoiceWithinPriority2or3(playboard, levelOfDifficulty, priority2Moves, true);
		}

	}
	else if(priority1Moves.length > 0 && priority3Moves.length > 0) {
		if (randomNumber <= getProbability(levelOfDifficulty, getProbability(levelOfDifficulty, AiConfig.PROBABILITY_TAKE_PRIO_1_MOVE_INSTEAD_OF_PRIO_3))) {
			moveOfChoice = getMoveOfChoiceWithinPriority1(playboard, levelOfDifficulty, priority1Moves, true);
		}
		else {
			moveOfChoice = getMoveOfChoiceWithinPriority2or3(playboard, levelOfDifficulty, priority3Moves, true);
		}
	}
	else if(priority2Moves.length > 0 && priority3Moves.length > 0) {
		if (randomNumber <= getProbability(levelOfDifficulty, AiConfig.PROBABILITY_TAKE_PRIO_2_MOVE_INSTEAD_OF_PRIO_3)) {
			moveOfChoice = getMoveOfChoiceWithinPriority2or3(playboard, levelOfDifficulty, priority2Moves, true);
		}
		else {
			moveOfChoice = getMoveOfChoiceWithinPriority2or3(playboard, levelOfDifficulty, priority3Moves, true);
		}
	}
	else if(priority1Moves.length > 0) {
		moveOfChoice = getMoveOfChoiceWithinPriority1(playboard, levelOfDifficulty, priority1Moves, true);
	}
	else if(priority2Moves.length > 0) {
		moveOfChoice = getMoveOfChoiceWithinPriority2or3(playboard, levelOfDifficulty, priority2Moves, true);
	}
	else if(priority3Moves.length > 0) {
		moveOfChoice = getMoveOfChoiceWithinPriority2or3(playboard, levelOfDifficulty, priority3Moves, true);
	}

	return moveOfChoice;
}

function getMoveOfChoiceWithinPriority1(playboard, levelOfDifficulty, priority1Moves, isRandomized) {
	
	let moveOfChoice = null;
	const randomNumber = Math.random();

	// Check if we can find a prio 1 move that is also a prio 2 move (target pile is waste pile of opponent):
	let doublePrioMoveFound = false;
	
	for (let prio1move of priority1Moves) {
		if (prio1move.getTargetPilePosition() == PileUtils.getWastePilePositionOfOpponentPlayer(prio1move.getPlayer())) {

			if(isRandomized) {
				if (randomNumber <= getProbability(levelOfDifficulty, AiConfig.PROBABILITY_TAKE_PRIO_1_MOVE_THAT_IS_ALSO_OF_PRIO_2)) {
					moveOfChoice = prio1move;
					doublePrioMoveFound = true;
					break;
				}
			}
			else {
				moveOfChoice = prio1move;
				doublePrioMoveFound = true;
				break;
			}

		}
	}
	
	// Check if we can find a prio 1 move that pushes a card to a not empty house pile:
	let notEmptyHousePileTargetFound = false;

	if (!doublePrioMoveFound) {
		for (let prio1move of priority1Moves) {
			const targetPile = playboard.getPlayboardMap().get(prio1move.getTargetPilePosition());
			if (targetPile.getCard2PileElements().length > 0) {

				if(isRandomized) {

					if (randomNumber <= getProbability(levelOfDifficulty, AiConfig.PROBABILITY_TAKE_PRIO_1_MOVE_THAT_MOVES_CARD_TO_NOT_EMPTY_HOUSEPILE)) {
						moveOfChoice = prio1move;
						notEmptyHousePileTargetFound = true;
						break;
					}
				}
				else {
					moveOfChoice = prio1move;
					notEmptyHousePileTargetFound = true;
					break;
				}
			}
		}
	}

	// Just take the first of the priority moves if we haven't found something better until now!
	if (!doublePrioMoveFound && !notEmptyHousePileTargetFound) {
		moveOfChoice = priority1Moves[0];
	}
	
	return moveOfChoice;
}

function getMoveOfChoiceWithinPriority2or3(playboard, levelOfDifficulty, priority2Moves, isRandomized) {

	let moveOfChoice = null;

	const randomNumber = Math.random();

	// Check if we can find a house pile as source pile with only one card left so that we can get a free slot:
	let slotEmptyingMoveFound = false;

	for (let prio2move of priority2Moves) {
		const sourcePile = playboard.getPlayboardMap().get(prio2move.getSourcePilePosition());
		if (sourcePile.getCard2PileElements().length == 1) {

			if(isRandomized) {
				if (randomNumber <= getProbability(levelOfDifficulty, AiConfig.PROBABILITY_TAKE_PRIO_2_OR_3_MOVE_THAT_FREES_A_SLOT)) {
					moveOfChoice = prio2move;
					slotEmptyingMoveFound = true;
					break;
				}
			}
			else {
				moveOfChoice = prio2move;
				slotEmptyingMoveFound = true;
				break;
			}
		}
	}
	
	if (!slotEmptyingMoveFound) {
		moveOfChoice = priority2Moves[0];
	}
	return moveOfChoice;
}

/**
 * Compute a probability value based on the given level of difficulty. The higher
 * the levelOfDifficulty the higher is the returned value.
 *
 * Example:
 * If you call the method like this: AiUtils.getProbability(levelOfDifficulty, 0.9)
 * - for levelOfDifficulty = 0 (very easy) it will return 0.90
 * - for levelOfDifficulty = 0.5 (middle) it will return 0.95
 * - for levelOfDifficulty = 1 (difficult) it will return 0.98
 *
 * Note: For all levels of difficulty besides 1 this function stretches up to the value 1.
 * If the level of difficulty is equal 1, the function stretches up to the value 0.97 to
 * have a small chance that the AI also makes mistakes.
 *
 * @param levelOfDifficulty a value between 0 and 1 describing the difficulty of the game (0 = very easy, 1 = very difficult)
 * @param thresholdValue a value between 0 and 1 describing the smallest probability that can be returned.
 * @return a value between 0 and 1 that can be used as probability to be compared to a random number.
 */
export function getProbability(levelOfDifficulty, thresholdValue) {
	let baseValue = 1.0;
	if(levelOfDifficulty == 1) {
		baseValue = 0.98;
	}
	return thresholdValue + levelOfDifficulty * (baseValue - thresholdValue);
}

/**
 * Check if the given intendedMove can be knocked justifiedly in the given playboard situation.
 * This method is used for the AI and for the real player to check if a knock is knockable.
 *
 * @param intendedMove the move the player intends to make
 * @param game the current game
 * @param considerStateOfReservePile If true it's taken into account if the top card of the reserve
 * pile of the player of the given move is face up or not. This influences the list of grabbed mandatory moves noticeably.
 */
export function isMoveKnockable(intendedMove, game, considerStateOfReservePile) {

	// If the target pile of the given move is the waste pile of the player of the move
	// we don't need to check anything because he loses the turn anyway...
	if(intendedMove.getTargetPilePosition() == PileUtils.getWastePilePositionOfPlayer(intendedMove.getPlayer())) {
		return false;
	}
	// Move should not be knockable if it's a null move (from one pile to the same pile), excluding reserve pile click:
	if(intendedMove.getTargetPilePosition() == intendedMove.getSourcePilePosition()
		&& !(intendedMove.getTargetPilePosition() == PileUtils.getReservePilePositionOfPlayer(intendedMove.getPlayer()))) {
		return false;
	}
	else {
		let isKnockable = false;
		let mandatoryMoves = PlayboardUtils.getMandatoryMoves(game, considerStateOfReservePile);

		// Move can't be knocked justifiedly if there are no mandatory moves:
		if(mandatoryMoves.length == 0) {
			isKnockable = false;
		}
		else {
			// Check if the given intended move is contained in the list of mandatory moves.
			// If so the current move is not knockable with one exception:
			// If the AI uncovered the top card of its reserve pile and gets a "new mandatory move" by this
			// new card it does not count as mandatory move as long as there is at least one other
			// mandatory move on the playboard right now (just to give the real player a chance to knock while
			// the AI is playing the new card).
			let intendedMoveIsMandatory = false;

			const aiUncoveredTopCardOfReservePile = intendedMove.getPlayer() == Player.PLAYER_B
				&& intendedMove.getSourcePilePosition() == PilePosition.RESERVE_PILE_PLAYER_B;

			let anotherMandatoryMoveIsGivenOnPlayboard = false;
			for (let mandatoryMove of mandatoryMoves) {
				if(mandatoryMove.getSourcePilePosition() != PilePosition.RESERVE_PILE_PLAYER_B) {
					anotherMandatoryMoveIsGivenOnPlayboard = true;
					break;
				}
			}
			
			if(aiUncoveredTopCardOfReservePile && anotherMandatoryMoveIsGivenOnPlayboard) {
				intendedMoveIsMandatory = false;
			}
			else {
				for (let mandatoryMove of mandatoryMoves) {
					if(mandatoryMove.getSourcePilePosition() == intendedMove.getSourcePilePosition() &&
						mandatoryMove.getTargetPilePosition() == intendedMove.getTargetPilePosition()) {
						intendedMoveIsMandatory = true;
						break;
					}
				}
			}

			// If the given move is not mandatory and there are other mandatory moves:
			if(!intendedMoveIsMandatory) {
				isKnockable = true;
			}
		}

		return isKnockable;
	}
}