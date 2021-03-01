export class Move {

    getPlayer() {
        return this._player;
    }

    setPlayer(player) {
        this._player = player;
    }

    getSourcePilePosition() {
        return this._sourcePilePosition;
    }

    setSourcePilePosition(sourcePilePosition) {
        this._sourcePilePosition = sourcePilePosition;
    }

    getTargetPilePosition() {
        return this._targetPilePosition;
    }

    setTargetPilePosition(targetPilePosition) {
        this._targetPilePosition = targetPilePosition;
    }

	toString() {
		return "Move: " + this._player.name + ", " + this._sourcePilePosition.name + ", " + this._targetPilePosition.name;
	}
}