import { Enum } from 'enumify';
import { CardRendering } from './cardrendering';
import { CardOrder } from './cardorder';

export class PileType extends Enum {}

PileType.initEnum({
    WASTE: {
        getRendering() {
            return CardRendering.ALL_CARDS_FACE_UP;
		},
        getCardOrder() {
			return CardOrder.SUIT;
        }
    },
    RESERVE: {
		getRendering() {
			return CardRendering.ONE_CARD_FACE_UP;
		},
		getCardOrder() {
			return CardOrder.NONE;
		}
    },
    HOUSE: {
		getRendering() {
			return CardRendering.ALL_CARDS_FACE_UP;
		},
		getCardOrder() {
			return CardOrder.COLOR;
		}
    },
    CENTER: {
		getRendering() {
			return CardRendering.ALL_CARDS_FACE_UP;
		},
		getCardOrder() {
			return CardOrder.SUIT;
		}
    }
});
