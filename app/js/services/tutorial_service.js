import * as PlayboardUtils from '../utils/playboard_utils';
import * as PileUtils from '../utils/pile_utils';
import * as AiUtils from '../utils/ai_utils';
import { Player } from '../enums/player';
import { Move } from '../entities/move';

/**
 * Compute the best move in the current state of the given game for the tutorial mode.
 */
export function getBestMove(game) {

	const mandatoryMoves = PlayboardUtils.getMandatoryMoves(game, true);

	// If a mandatory move is existant just return the first of it:
	if (mandatoryMoves && mandatoryMoves.length > 0 ) {
		return mandatoryMoves[0];
	}
	// No mandatory move found - check for best move of choice:
	else {
		const moveOfChoice = AiUtils.getMoveOfChoice(game, true);
		if(moveOfChoice !== null) {
			return moveOfChoice;
		}
		// No move of choice found - player has to
		// a) play topmost card of his reserve pile or
		// b) switch cards from waste pile to reserve pile or
		// c) end his turn:
		else {
			const reservePilePositionOfPlayer = PileUtils.getReservePilePositionOfPlayer(Player.PLAYER_A);
			const reservePileOfPlayer = game.getPlayboard().getPlayboardMap().get(reservePilePositionOfPlayer);
			const wastePilePositionOfPlayer = PileUtils.getWastePilePositionOfPlayer(Player.PLAYER_A);
			const wastePileOfPlayer = game.getPlayboard().getPlayboardMap().get(wastePilePositionOfPlayer);

			// If the reserve pile of the player is empty:
			if (PileUtils.isPileEmpty(reservePileOfPlayer)) {
				if (!PileUtils.isPileEmpty(wastePileOfPlayer)) {
					const move = new Move();
					move.setSourcePilePosition(PileUtils.getWastePilePositionOfPlayer(Player.PLAYER_A));
					move.setTargetPilePosition(PileUtils.getReservePilePositionOfPlayer(Player.PLAYER_A));
					move.setPlayer(Player.PLAYER_A);
					return move;
				}
			}
			// There are still cards on the reserve pile:
			else {
				const topCard2PileOfReservePile = PileUtils.getTopCard2PileElement(reservePileOfPlayer);

				// Reserve pile card already open - player has to end turn by pushing the top card of the reserve pile on the waste pile:
				if (topCard2PileOfReservePile.isFaceUp()) {
					const endTurnMove = new Move();
					endTurnMove.setSourcePilePosition(reservePilePositionOfPlayer);
					endTurnMove.setTargetPilePosition(wastePilePositionOfPlayer);
					endTurnMove.setPlayer(Player.PLAYER_A);
					return endTurnMove;
				}
				// Uncover top card of reserve pile:
				else {
					const move = new Move();
					move.setSourcePilePosition(PileUtils.getReservePilePositionOfPlayer(Player.PLAYER_A));
					move.setTargetPilePosition(PileUtils.getReservePilePositionOfPlayer(Player.PLAYER_A));
					move.setPlayer(Player.PLAYER_A);
					return move;
				}
			}
		}
	}
}