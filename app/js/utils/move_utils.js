import { Player } from '../enums/player';
import { Move } from '../entities/move';
import * as PileUtils from '../utils/pile_utils';

/**
 * Withdraw the given move.
 */
export function createBackwardMove(intendedMove, isAllowedMove) {

	const backwardMove = new Move();
	backwardMove.setPlayer(Player.DEALER);

	// Move card to waste pile if source pile of original move was the reserve pile of the player:
	if(isAllowedMove && intendedMove.getSourcePilePosition() == PileUtils.getReservePilePositionOfPlayer(intendedMove.getPlayer())) {
		backwardMove.setSourcePilePosition(intendedMove.getTargetPilePosition());
		backwardMove.setTargetPilePosition(PileUtils.getWastePilePositionOfPlayer(intendedMove.getPlayer()));
	}
	// Move card back to where it was before:
	else {
		backwardMove.setSourcePilePosition(intendedMove.getTargetPilePosition());
		backwardMove.setTargetPilePosition(intendedMove.getSourcePilePosition());
	}

	return backwardMove;
}

