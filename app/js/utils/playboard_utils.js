import { PilePosition } from '../enums/pileinformation/pileposition';
import { PileType } from '../enums/pileinformation/piletype';
import { Card2Pile } from '../entities/card2pile';
import { CardNumber } from '../enums/cardinformation/cardnumber';
import { Move } from '../entities/move';
import { Player } from '../enums/player';
import { Suit } from "../enums/cardinformation/suit";

import * as PileUtils from './pile_utils';
import * as CardUtils from './card_utils';

export function dealCards(playboard, deck1, deck2) {

    const playboardMap = playboard.getPlayboardMap();

    // Put all cards of deck1 on the reserve pile of player A:
    const reservePilePlayerA = playboardMap.get(PilePosition.RESERVE_PILE_PLAYER_A);
    for (let card2Pile of deck1) {
		card2Pile.setPile(reservePilePlayerA);
    }
    
    reservePilePlayerA.setCard2PileElements(deck1);

    // Put all cards of deck2 on the reserve pile of player B:
    const reservePilePlayerB = playboardMap.get(PilePosition.RESERVE_PILE_PLAYER_B);
    for (let card2Pile of deck2) {
        card2Pile.setPile(reservePilePlayerB);
    }
    
    reservePilePlayerB.setCard2PileElements(deck2);

    // Move the first four cards of player A from his reserve pile to the house piles:
    const housePilesForPlayerA = [];
    housePilesForPlayerA.push(PilePosition.HOUSE_PILE_RIGHT_1);
    housePilesForPlayerA.push(PilePosition.HOUSE_PILE_RIGHT_2);
    housePilesForPlayerA.push(PilePosition.HOUSE_PILE_RIGHT_3);
    housePilesForPlayerA.push(PilePosition.HOUSE_PILE_RIGHT_4);

    for (const position of housePilesForPlayerA) {
        const targetPile = playboardMap.get(position).getCard2PileElements();
        const card2PileElement = new Card2Pile(
            PileUtils.popCardFromPile(playboardMap.get(PilePosition.RESERVE_PILE_PLAYER_A)),
            playboardMap.get(position));

        card2PileElement.setFaceUp(true);
        targetPile.push(card2PileElement);
    }

    // Move the first four cards of player B from his reserve pile to the house piles:
    const housePilesForPlayerB = [];
    housePilesForPlayerB.push(PilePosition.HOUSE_PILE_LEFT_1);
    housePilesForPlayerB.push(PilePosition.HOUSE_PILE_LEFT_2);
    housePilesForPlayerB.push(PilePosition.HOUSE_PILE_LEFT_3);
    housePilesForPlayerB.push(PilePosition.HOUSE_PILE_LEFT_4);

    for (const position of housePilesForPlayerB) {
        const targetPile = playboardMap.get(position).getCard2PileElements();
        const card2PileElement = new Card2Pile(
            PileUtils.popCardFromPile(playboardMap.get(PilePosition.RESERVE_PILE_PLAYER_B)),
            playboardMap.get(position));

        card2PileElement.setFaceUp(true);
        targetPile.push(card2PileElement);
    }
    
    // Move one card of player A from his reserve pile to his waste pile:
    const pile = playboardMap.get(PilePosition.WASTE_PILE_PLAYER_A);
    const cardsWpA = pile.getCard2PileElements();
    const cardOnPileElement1 = new Card2Pile(
        PileUtils.popCardFromPile(playboardMap.get(PilePosition.RESERVE_PILE_PLAYER_A)),
        pile);
    cardOnPileElement1.setFaceUp(true);
    cardsWpA.push(cardOnPileElement1);

    // Move one card of player B from his reserve pile to his waste pile:
    const pile2 = playboardMap.get(PilePosition.WASTE_PILE_PLAYER_B);
    const cardsWpB = pile2.getCard2PileElements();
    const cardOnPileElement2 = new Card2Pile(
        PileUtils.popCardFromPile(playboardMap.get(PilePosition.RESERVE_PILE_PLAYER_B)),
        pile2);
    cardOnPileElement2.setFaceUp(true);
    cardsWpB.push(cardOnPileElement2);
}

/**
 * Check if the given move is an allowed move on the given playboard.
 * @param game the current game
 * @param move the move which should be checked
 * @param considerStateOfReservePile if set to true the state of the reserve pile (top card open or not) is considered
 * to decide if the move is allowed or not. If set to false we can also check if the move WOULD be allowed if the player would not
 * have uncovered the top card of his reserve pile.
 * @returns boolean true if the move is allowed, else false
 */
export function isMoveAllowed(game, move, considerStateOfReservePile) {

	const playboard = game.getPlayboard();
    if (!isMoveAllowedBasedOnPlayer(game.getActivePlayer(), move.getPlayer())) {
        return false;
    }

    const sourcePile = playboard.getPlayboardMap().get(move.getSourcePilePosition());
    const targetPile = playboard.getPlayboardMap().get(move.getTargetPilePosition());

    if (considerStateOfReservePile) {
        if (!isMoveAllowedBasedOnStateOfReservePile(playboard, move.getPlayer(), sourcePile, targetPile)) {
            return false;
        }
    }

    if (!isMoveAllowedBasedOnPiles(move.getPlayer(), sourcePile, targetPile)) {
        return false;
    }

    return isMoveAllowedBasedOnCard(playboard, move, game);
}

/**
 * Checks if the given move is allowed based on the active player of the game in comparison the the player
 * who wants to make the move.
 *
 * @param activePlayer The active Player of the game.
 * @param movePlayer The player who wants to make the move.
 * @return boolean true if the activePlayer is the movePlayer
 */
function isMoveAllowedBasedOnPlayer(activePlayer, movePlayer) {
    return activePlayer == movePlayer;
}

/**
 * Checks if a move is allowed based on the state of the reserve pile of the move player. If the
 * move player has uncovered the top card of his reserve pile he is only allowed to play this
 * card and no other one.
 */
function isMoveAllowedBasedOnStateOfReservePile(playboard, player, sourcePile) {

    const reservePileMovePlayer = playboard.getPlayboardMap().get(PileUtils.getReservePilePositionOfPlayer(player));

    return !(PileUtils.getTopCard2PileElement(reservePileMovePlayer)
	&& PileUtils.getTopCard2PileElement(reservePileMovePlayer).isFaceUp()
	&& sourcePile.getPosition() != reservePileMovePlayer.getPosition());

}

/**
 * Checks if the given move is allowed based on the types and positions of the source and target piles of the move and
 * on the player who wants to make the move.
 */
function isMoveAllowedBasedOnPiles(player, sourcePile, targetPile) {

    const typeOfSourcePile = sourcePile.getPosition().getPileType();
    const positionOfSourcePile = sourcePile.getPosition();
    const typeOfTargetPile = targetPile.getPosition().getPileType();

    // Move is not allowed if the target pile is of type reserve:
    if (typeOfTargetPile == PileType.RESERVE) {
        return false;
    }
    // Move is not allowed if the source pile is of type center:
    if (typeOfSourcePile == PileType.CENTER) {
        return false;
    }

    // Move is not allowed if player wants to move a card from the reserve pile of the opponent player:
    if (positionOfSourcePile == PileUtils.getReservePilePositionOfOpponentPlayer(player)) {
        return false;
    }

    // Move is not allowed if player wants to move a card from the waste pile of the opponent player:
    return positionOfSourcePile != PileUtils.getWastePilePositionOfOpponentPlayer(player);
}

/**
 * Checks if a move is allowed based on the card number, color and suit of the card which should be moved
 * from the source pile to the target pile of the move.
 */
function isMoveAllowedBasedOnCard(playboard, move, game) {

    const sourcePile = playboard.getPlayboardMap().get(move.getSourcePilePosition());
    const targetPile = playboard.getPlayboardMap().get(move.getTargetPilePosition());
    const topCardOfSourcePile = PileUtils.getTopCard(sourcePile);
    const topCardOfTargetPile = PileUtils.getTopCard(targetPile);

	// There must be at least one card2pile element on the source pile:
	if(playboard.getPlayboardMap().get(move.getSourcePilePosition()).getCard2PileElements().length == 0) {
		return false;
	}

    // Top card of source pile must be face up:
    if (PileUtils.getTopCard2PileElement(sourcePile) != null && !PileUtils.getTopCard2PileElement(sourcePile).isFaceUp()) {
        return false;
    }

    // MOVE CARD FROM HOUSE PILE:
    if (sourcePile.getPosition().getPileType() == PileType.HOUSE) {

        switch (targetPile.getPosition().getPileType()) {
            // Move card from house to center pile:
            case PileType.CENTER:
                if (targetPile.getCard2PileElements().length == 0 && topCardOfSourcePile.getCardNumber() == CardNumber.ACE) {
                    if (game.getShowAcesOnCenterPilesSorted()) {
                        return isAceAllowedToBePlayedOnCenterPile(topCardOfSourcePile, targetPile);
                    }
                    return true;
                } else if (targetPile.getCard2PileElements().length > 0
                    && sourcePile.getCard2PileElements().length > 0
                    && CardUtils.haveEqualSuits(topCardOfSourcePile, topCardOfTargetPile)
                    && CardUtils.isSuccessor(topCardOfSourcePile, topCardOfTargetPile)) {
                    return true;
                }
                break;
            // Move card from house to house pile:
            case PileType.HOUSE:
                // Move card to the same house pile ("null move"):
                if (sourcePile.getPosition() == targetPile.getPosition()) {
                    return true;
                }
                // Move card to another house pile:
                else {
                    if (targetPile.getCard2PileElements().length == 0) {
                        return true;
                    } else if (targetPile.getCard2PileElements().length > 0
                        && sourcePile.getCard2PileElements().length > 0
                        && !CardUtils.haveEqualColors(topCardOfSourcePile, topCardOfTargetPile)
                        && CardUtils.isPredecessor(topCardOfSourcePile, topCardOfTargetPile)) {
                        return true;
                    }
                }
                break;
            case PileType.WASTE:
                // Move card from a house pile to the waste pile of the other player:
                if (targetPile.getPosition() == PileUtils.getWastePilePositionOfOpponentPlayer(move.getPlayer())) {
                    if (targetPile.getCard2PileElements().length != 0
                        && CardUtils.haveEqualSuits(topCardOfSourcePile, topCardOfTargetPile)
                        && (CardUtils.isSuccessor(topCardOfSourcePile, topCardOfTargetPile) || CardUtils.isPredecessor(
                            topCardOfSourcePile,
                            topCardOfTargetPile))) {
                        return true;
                    }
                }
                // Move card from a house pile to the own waste pile:
                else if (targetPile.getPosition() == PileUtils.getWastePilePositionOfPlayer(move.getPlayer())) {
                    return true;
                }
                break;
            default:
                break;
        }
    }
    // MOVE CARD FROM RESERVE PILE OR FROM WASTE PILE:
    else if (sourcePile.getPosition().getPileType() == PileType.RESERVE || sourcePile.getPosition().getPileType() == PileType.WASTE) {
        switch (targetPile.getPosition().getPileType()) {
            case PileType.WASTE:
                // Move card from own reserve pile or from own waste pile to own waste pile:
                if (targetPile.getPosition() == PileUtils.getWastePilePositionOfPlayer(move.getPlayer())) {
                    return true;
                }
                // Move card from own reserve pile or own waste pile to waste pile of other player:
                else if (targetPile.getPosition() == PileUtils.getWastePilePositionOfOpponentPlayer(move.getPlayer())) {
                    if (targetPile.getCard2PileElements().length != 0
                        && CardUtils.haveEqualSuits(topCardOfSourcePile, topCardOfTargetPile)
                        && (CardUtils.isSuccessor(topCardOfSourcePile, topCardOfTargetPile) || CardUtils.isPredecessor(
                            topCardOfSourcePile,
                            topCardOfTargetPile))) {
                        return true;
                    }
                }
                break;
            case PileType.CENTER:
                // Move card from own reserve pile or from own waste pile to center pile:
                if (targetPile.getCard2PileElements().length == 0 && topCardOfSourcePile.getCardNumber() == CardNumber.ACE) { // Will never happen for waste pile...
                    if (game.getShowAcesOnCenterPilesSorted()) {
                        return isAceAllowedToBePlayedOnCenterPile(topCardOfSourcePile, targetPile);
                    }
                    return true;
                } else if (targetPile.getCard2PileElements().length > 0
                    && sourcePile.getCard2PileElements().length > 0
                    && CardUtils.haveEqualSuits(topCardOfSourcePile, topCardOfTargetPile)
                    && CardUtils.isSuccessor(topCardOfSourcePile, topCardOfTargetPile)) {
                    return true;
                }
                break;
            case PileType.HOUSE:
                // Move card from own reserve pile or from own waste pile to house pile:
                if (targetPile.getCard2PileElements().length == 0) {
                    return true;
                } else if (targetPile.getCard2PileElements().length > 0
                    && sourcePile.getCard2PileElements().length > 0
                    && !CardUtils.haveEqualColors(topCardOfSourcePile, topCardOfTargetPile)
                    && CardUtils.isPredecessor(topCardOfSourcePile, topCardOfTargetPile)) {
                    return true;
                }
                break;
            default:
                break;
        }
    }
    return false;
}

function isAceAllowedToBePlayedOnCenterPile(aceCard, targetPile) {

    if (aceCard.getCardNumber() != CardNumber.ACE) {
        return false;
    }

    const suitOfAce = aceCard.getSuit();
    const positionOfTargetPile = targetPile.getPosition().name;

    if (suitOfAce === Suit.CLUBS && (positionOfTargetPile === "CENTER_PILE_LEFT_1"
        || positionOfTargetPile === "CENTER_PILE_RIGHT_1")) {
        return true;
    }
    else if (suitOfAce === Suit.SPADES && (positionOfTargetPile === "CENTER_PILE_LEFT_2"
        || positionOfTargetPile === "CENTER_PILE_RIGHT_2")) {
        return true;
    }
    else if (suitOfAce === Suit.HEARTS && (positionOfTargetPile === "CENTER_PILE_LEFT_3"
        || positionOfTargetPile === "CENTER_PILE_RIGHT_3")) {
        return true;
    }
    else if (suitOfAce === Suit.DIAMONDS && (positionOfTargetPile === "CENTER_PILE_LEFT_4"
        || positionOfTargetPile === "CENTER_PILE_RIGHT_4")) {
        return true;
    }

    return false;
}

/**
 * Change the playboard map of the given playboard according to the given move.
 */
export function changePlayboard(playboard, move, isAllowedMove) {

    const sourcePile = playboard.getPlayboardMap().get(move.getSourcePilePosition());
    const targetPile = playboard.getPlayboardMap().get(move.getTargetPilePosition());

    const topCard2PileElementSourcePile = sourcePile.getCard2PileElements()[sourcePile.getCard2PileElements().length - 1];

    const newTopCard = PileUtils.popCardFromPile(sourcePile);
    PileUtils.pushCardToPile(newTopCard, targetPile);

	const topCard2PileElementTargetPile = targetPile.getCard2PileElements()[targetPile.getCard2PileElements().length - 1];

	// Set faceUp to false if moved card was a KING who is completing a center pile:
	if (isAllowedMove
		&& topCard2PileElementTargetPile.getCard().getCardNumber() == CardNumber.KING
		&& move.getTargetPilePosition().getPileType() == PileType.CENTER) {
		topCard2PileElementTargetPile.setFaceUp(false);
	} else {
		topCard2PileElementTargetPile.setFaceUp(topCard2PileElementSourcePile.isFaceUp());
	}
}

/**
 * Returns a list with the mandatory moves on the given playboard (there may be multiple targets to the same source).
 *
 * @param game the current game
 * @param considerStateOfReservePile if set to true the current state of the reserve pile of the active player (top card
 * open or not) is considered to compute the mandatory moves. Else ALL mandatory moves are checked independent of the
 * current state of the reserve pile.
 */
export function getMandatoryMoves(game, considerStateOfReservePile) {
	const playboard = game.getPlayboard();

	const mandatoryMoves = [];

	// Loop only over allowed moves:
	if(considerStateOfReservePile) {
		const allowedMoves = getAllowedMoves(game);

		for (let move of allowedMoves) {
			if(isMoveMandatory(game, move, true)) {
				mandatoryMoves.push(move);
			}
		}
	}
	// Loop over all possible moves:
	else {
		playboard.getPlayboardMap().forEach(function(value, key) {
			const sourcePilePosition = key;
			playboard.getPlayboardMap().forEach(function(value, key) {
				const targetPilePosition = key;
				const move = new Move();
				move.setPlayer(game.getActivePlayer());
				move.setSourcePilePosition(sourcePilePosition);
				move.setTargetPilePosition(targetPilePosition);
				
				if (isMoveAllowed(game, move, false) && isMoveMandatory(game, move, false)) {
					mandatoryMoves.push(move);
				}
			});
		});
	}
	return mandatoryMoves;
}

/**
 * Returns true if a given move is mandatory.
 * @param game the current game
 * @param move the move to check
 * @param considerStateOfReservePile if set to true the state of the reserve pile is considered (is top card
 * open or not). To check if a move is mandatory without regard to the state of the reserve pile set this variable
 * to false.
 */
function isMoveMandatory(game, move, considerStateOfReservePile) {

	const bIsMoveAllowed = isMoveAllowed(game, move, considerStateOfReservePile); // the move should be allowed in the first place
	const isTargetCenter = (move.getTargetPilePosition().getPileType() == PileType.CENTER); // the target pile should be a center pile

	return bIsMoveAllowed && isTargetCenter;
}

/**
 * Returns a list with all allowed moves at a given playboard.
 */
export function getAllowedMoves(game) {
	
	const playboard = game.getPlayboard();
	const allowedMoves = [];
	
	playboard.getPlayboardMap().forEach(function(value, key) {
		const sourcePilePosition = key;

		playboard.getPlayboardMap().forEach(function(value, key) {
			const targetPilePosition = key;

			const move = new Move();
			move.setPlayer(game.getActivePlayer());
			move.setSourcePilePosition(sourcePilePosition);
			move.setTargetPilePosition(targetPilePosition);
			if (isMoveAllowed(game, move, true)) {
				allowedMoves.push(move);
			}
		});
	});
	
	return allowedMoves;
}

/**
 * Move all cards lying on the waste pile of the given player to his reserve pile.
 * All cards are set face down and the order of cards on the pile is reversed.
 *
 * @return boolean true if the cards have been moved from waste pile to reserve pile, else false
 */
export function moveCardsFromWastePileToReservePile(playboard, player) {

	const pilePositionReservePile = PileUtils.getReservePilePositionOfPlayer(player);
	const pilePositionWastePile = PileUtils.getWastePilePositionOfPlayer(player);

	const wastePile = playboard.getPlayboardMap().get(pilePositionWastePile);
	const reservePile = playboard.getPlayboardMap().get(pilePositionReservePile);

	if (reservePile.getCard2PileElements().length == 0) {

		let reserveCard2PileElements = reservePile.getCard2PileElements();
		let wasteCard2PileElements = wastePile.getCard2PileElements();
		wasteCard2PileElements.reverse();

		for (let card2PileElement of wasteCard2PileElements) {
			card2PileElement.setFaceUp(false);
			card2PileElement.setPile(reservePile);
			reserveCard2PileElements.push(card2PileElement);
		}
		
		wastePile.getCard2PileElements().length = 0;

		return true;
	}
	return false;
}

/**
 * Check if there is any empty house pile slot on the given playboard.
 */
export function checkForEmptyHousePileSlots(playboard) {
	let emptySlotFound = false;
	playboard.getPlayboardMap().forEach(function(value, key) {
		const pilePositionType = key.getPileType();
		const topCard = PileUtils.getTopCard(value);
		if(pilePositionType == PileType.HOUSE && topCard == null) {
			emptySlotFound = true;
			return;
		}
	});
	return emptySlotFound;
}

/**
 * Returns an array of all moves which are mandatory in the current game state.
 * Remove duplicate mandatory moves, e.g. for playing an Ace of Hearts from HP-LEFT-1
 * do only return ONE mandatory move instead of [HP-LEFT-1 to CP-LEFT-1,
 * HP-LEFT-1 to CP-LEFT-2, HP-LEFT-1 to CP-LEFT-3 ...].
 */
export function getForgottenMandatoryMovesToHightlight(game) {
	const allMandatoryMoves = getMandatoryMoves(game, true);
	
	let mandatoryMovesToReturn = [];
	let alreadyStoredSourcePilePositions = [];
	let alreadyStoredTargetPilePositions = [];
	
	for (let mandatoryMove of allMandatoryMoves) {
		if (alreadyStoredSourcePilePositions.includes(mandatoryMove.getSourcePilePosition().name)
		|| alreadyStoredTargetPilePositions.includes(mandatoryMove.getTargetPilePosition().name)) {
			continue;
		}
		mandatoryMovesToReturn.push(mandatoryMove);
		alreadyStoredSourcePilePositions.push(mandatoryMove.getSourcePilePosition().name);
		alreadyStoredTargetPilePositions.push(mandatoryMove.getTargetPilePosition().name);
		
	}
	
	return mandatoryMovesToReturn;
}

export function isIntendedMoveMandatory(intendedMove, game) {
	const allMandatoryMoves = getMandatoryMoves(game, true);
	for (let mandatoryMove of allMandatoryMoves) {
		if(mandatoryMove.getSourcePilePosition() == intendedMove.getSourcePilePosition()) {
			return true;
		}
	}
	return false;
}

/**
 * Check if the AI played a card to the waste pile of the real player in the last move
 * instead of playing it to a center pile.
 *
 * @returns {null} if no forgotten mandatory move can be found, else the forgotten mandatory move.
 */
export function getForgottenMandatoryWastePileMoveOfTheAi(game) {

    let forgottenMandatoryMove = null;

    const lastMove = game.getPlayboard().getMoveHistory().get(game.getPlayboard().getMoveHistory().size);
    const wastePileOfRealPlayer = game.getPlayboard().getPlayboardMap().get(PilePosition.WASTE_PILE_PLAYER_A);

    // Was the AI the player of the last move?
    if (lastMove && lastMove.getPlayer() === Player.PLAYER_B) {

        // Normally we would have to check the last move now...
        let moveToCheck = lastMove;

        // ... but if the AI just turned around a card on its reserve pile we have to check the move before the last move:
        if (lastMove.getTargetPilePosition() === PilePosition.RESERVE_PILE_PLAYER_B
            && lastMove.getSourcePilePosition() === PilePosition.RESERVE_PILE_PLAYER_B) {
            let numberOfMoves = game.getPlayboard().getMoveHistory().size;
            if (numberOfMoves >= 1) {
                const moveBeforeLastMove = game.getPlayboard().getMoveHistory().get(numberOfMoves - 1);
                if (moveBeforeLastMove && moveBeforeLastMove.getPlayer() === Player.PLAYER_B) {
                    moveToCheck = moveBeforeLastMove;
                }
            }
        }

        // Did the AI play a card on the waste pile of the real player in the move to check?
        if (moveToCheck.getTargetPilePosition() === wastePileOfRealPlayer.getPosition()) {

            // Should the card have been played to a center pile?
            const topCardWastePileOfRealPlayer = PileUtils.getTopCard(wastePileOfRealPlayer);
            game.getPlayboard().getPlayboardMap().forEach(function(value, key) {

                const targetPilePosition = key;
                if (targetPilePosition.getPileType() == PileType.CENTER) {

                    const targetPile = game.getPlayboard().getPlayboardMap().get(targetPilePosition);
                    const topCardOfTargetPile = PileUtils.getTopCard(targetPile);

                    if (targetPile.getCard2PileElements().length > 0
                        && wastePileOfRealPlayer.getCard2PileElements().length > 0
                        && CardUtils.haveEqualSuits(topCardWastePileOfRealPlayer, topCardOfTargetPile)
                        && CardUtils.isSuccessor(topCardWastePileOfRealPlayer, topCardOfTargetPile))
                    {
                        forgottenMandatoryMove = new Move();
                        forgottenMandatoryMove.setTargetPilePosition(targetPilePosition);
                    }
                }
            });
        }
    }

    return forgottenMandatoryMove;
}