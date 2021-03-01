import { Player } from '../enums/player';

export function getOpponentPlayer(player) {
	if(player == Player.PLAYER_A) {
		return Player.PLAYER_B;
	}
	else if(player == Player.PLAYER_B) {
		return Player.PLAYER_A;
	}
}
