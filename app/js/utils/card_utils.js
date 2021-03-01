
export function haveEqualSuits(card1, card2) {
    return card1.getSuit() == card2.getSuit();
}

export function isSuccessor(card1, card2) {
    return card1.getCardNumber().isSuccessor(card2.getCardNumber());
}

export function isPredecessor(card1, card2) {
    return card1.getCardNumber().isPredecessor(card2.getCardNumber());
}

export function haveEqualColors(card1, card2) {
    return card1.getSuit().getCardColor() == card2.getSuit().getCardColor();
}