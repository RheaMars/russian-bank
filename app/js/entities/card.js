
export class Card {
    constructor(suit, cardNumber, deckcolor) {
        this._suit = suit;
        this._cardNumber = cardNumber;
        this._deckcolor = deckcolor;
    }

    getSuit() {
        return this._suit;
    }

    setSuit(suit) {
        this._suit = suit;
	}

    getCardNumber() {
        return this._cardNumber;
    }

	setCardNumber(cardNumber) {
		this._cardNumber = cardNumber;
	}

    getDeckcolor() {
        return this._deckcolor;
    }

    toString() {
        return "Card: " + this._suit.name + ", " + this._cardNumber.name + ", " + this._deckcolor.name;
    }
}