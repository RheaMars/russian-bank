export class Pile {
    constructor(position, card2PileElements) {
        this._position = position;
        if(card2PileElements === undefined) {
			this._card2PileElements = [];
        }
        else {
			this._card2PileElements = card2PileElements;
		}
    }

    getPosition() {
        return this._position;
    }

    setCard2PileElements(card2PileElements) {
        this._card2PileElements = card2PileElements;
    }

    getCard2PileElements() {
        return this._card2PileElements;
    }

    toString() {
        return "Pile: " + this._position.name;
    }
}
