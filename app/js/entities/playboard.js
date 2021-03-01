export class Playboard {

    constructor() {
        this._playboardMap = null;
        this._moveHistory = null;
    }

    getPlayboardMap() {
        return this._playboardMap;
    }

    setPlayboardMap(playboardMap) {
        this._playboardMap = playboardMap;
    }

    getMoveHistory() {
        return this._moveHistory;
    }

    setMoveHistory(moveHistory) {
        this._moveHistory = moveHistory;
    }
}
