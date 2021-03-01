import { Enum } from 'enumify';
import { CardColor } from './cardcolor';

export class Suit extends Enum {}

Suit.initEnum({
	CLUBS: {
		getCardColor() {
			return CardColor.BLACK;
		},
		getCardOrder() {
			return 1;
		}
	},
	SPADES: {
		getCardColor() {
			return CardColor.BLACK;
		},
		getCardOrder() {
			return 2;
		}
	},
	HEARTS: {
		getCardColor() {
			return CardColor.RED;
		},
		getCardOrder() {
			return 3;
		}
	},
	DIAMONDS: {
		getCardColor() {
			return CardColor.RED;
		},
		getCardOrder() {
			return 4;
		}
	}
});