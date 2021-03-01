import { DeckColor } from '../enums/cardinformation/deckcolor';

export class Card2Pile {
    constructor(card, pile) {
        this._card = card;
        this._pile = pile;
        this._pictureString = null;
        this._isFaceUp = false;
    }

    getCard() {
        return this._card;
    }

    setCard(card) {
        this._card = card;
    }

    getPile() {
        return this._pile;
    }

    setPile(pile) {
        this._pile = pile;
    }

    isFaceUp() {
        return this._isFaceUp;
    }

    setFaceUp(isFaceUp) {
        this._isFaceUp = isFaceUp;
    }

    setPictureString(isFaceUp, cardDesign) {
        let tmpPictureString = "../img/" + cardDesign + "/";

        if (isFaceUp) {
            tmpPictureString += this.getCard().getSuit().getCardOrder() + (4 * (this.getCard().getCardNumber().getPictureNumber() - 1));

        } else {
            tmpPictureString += this.getCard().getDeckcolor() == DeckColor.BLUE ? "b1fv" : "b2fv";
        }

        tmpPictureString += ".svg";
        this._pictureString = tmpPictureString;
    }

    getPictureString() {
        return this._pictureString;
    }

}