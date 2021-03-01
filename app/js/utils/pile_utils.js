import { Card2Pile } from '../entities/card2pile';
import { Player } from '../enums/player';
import { PilePosition } from '../enums/pileinformation/pileposition';

/**
 * Remove the top card of the given pile (pop stack operation).
 */
export function popCardFromPile(pile) {
    if(pile.getCard2PileElements().length > 0) {
		const poppedCard2PileElement = pile.getCard2PileElements().pop();
		return poppedCard2PileElement.getCard();
	}
}

/**
 * Put the given card on top of the given pile.
 */
export function pushCardToPile(card, pile) {
    const card2PileElement = new Card2Pile(card, pile);
    pile.getCard2PileElements().push(card2PileElement);
}

/**
 * Return the position of the reserve pile of the given player.
 */
export function getReservePilePositionOfPlayer(player) {
    if (player == Player.PLAYER_A) {
        return PilePosition.RESERVE_PILE_PLAYER_A;
    }
    else if (player == Player.PLAYER_B) {
        return PilePosition.RESERVE_PILE_PLAYER_B;
    }
}

/**
 * Return the position of the reserve pile of the opponent player of the given player.
 */
export function getReservePilePositionOfOpponentPlayer(player) {
    if (player == Player.PLAYER_A) {
        return PilePosition.RESERVE_PILE_PLAYER_B;
    }
    else if (player == Player.PLAYER_B) {
        return PilePosition.RESERVE_PILE_PLAYER_A;
    }
}

/**
 * Return the position of the waste pile of the given player.
 */
export function getWastePilePositionOfPlayer(player) {
    if (player == Player.PLAYER_A) {
        return PilePosition.WASTE_PILE_PLAYER_A;
    }
    else if (player == Player.PLAYER_B) {
        return PilePosition.WASTE_PILE_PLAYER_B;
    }
}

/**
 * Return the position of the waste pile of the opponent player of the given player.
 */
export function getWastePilePositionOfOpponentPlayer(player) {
    if (player == Player.PLAYER_A) {
        return PilePosition.WASTE_PILE_PLAYER_B;
    }
    else if (player == Player.PLAYER_B) {
        return PilePosition.WASTE_PILE_PLAYER_A;
    }
}

/**
 * Return the topmost card2pile element of the given pile.
 */
export function getTopCard2PileElement(pile) {
    const card2PileElements = pile.getCard2PileElements();
    if(card2PileElements && card2PileElements.length > 0) {
        return card2PileElements[card2PileElements.length - 1];
    }
}

/**
 * Get the topmost card of the given pile.
 */
export function getTopCard(pile) {
    const topCard2PileElement = getTopCard2PileElement(pile);
    if(topCard2PileElement) {
        return topCard2PileElement.getCard();
    }
}

/**
 * Get the second highest card of the given pile.
 */
export function getSecondTopCard(pile) {

	const card2PileElements = pile.getCard2PileElements();

	if(card2PileElements && card2PileElements.length >= 2) {
		return card2PileElements[card2PileElements.length - 2].getCard();
	}
}

/**
 * Check if the given pile is empty (has no cards on it).
 */
export function isPileEmpty(pile) {
	const card2PileElements = pile.getCard2PileElements();
	return !card2PileElements || card2PileElements.length == 0;
}

