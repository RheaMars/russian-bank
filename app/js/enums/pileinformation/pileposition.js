import { Enum } from 'enumify';
import { PileType } from './piletype';

export class PilePosition extends Enum {}

PilePosition.initEnum({
    RESERVE_PILE_PLAYER_A: {
        getPileType() {
            return PileType.RESERVE;
        }
    },
    WASTE_PILE_PLAYER_A: {
        getPileType() {
            return PileType.WASTE;
        }
    },
    RESERVE_PILE_PLAYER_B: {
        getPileType() {
            return PileType.RESERVE;
        }
    },
    WASTE_PILE_PLAYER_B: {
        getPileType() {
            return PileType.WASTE;
        }
    },
    HOUSE_PILE_LEFT_1: {
        getPileType() {
            return PileType.HOUSE;
        }
    },
    HOUSE_PILE_LEFT_2: {
        getPileType() {
            return PileType.HOUSE;
        }
    },
    HOUSE_PILE_LEFT_3: {
        getPileType() {
            return PileType.HOUSE;
        }
    },
    HOUSE_PILE_LEFT_4: {
        getPileType() {
            return PileType.HOUSE;
        }
    },
    HOUSE_PILE_RIGHT_1: {
        getPileType() {
            return PileType.HOUSE;
        }
    },
    HOUSE_PILE_RIGHT_2: {
        getPileType() {
            return PileType.HOUSE;
        }
    },
    HOUSE_PILE_RIGHT_3: {
        getPileType() {
            return PileType.HOUSE;
        }
    },
    HOUSE_PILE_RIGHT_4: {
        getPileType() {
            return PileType.HOUSE;
        }
    },
    CENTER_PILE_LEFT_1: {
        getPileType() {
            return PileType.CENTER;
        }
    },
    CENTER_PILE_LEFT_2: {
        getPileType() {
            return PileType.CENTER;
        }
    },
    CENTER_PILE_LEFT_3: {
        getPileType() {
            return PileType.CENTER;
        }
    },
    CENTER_PILE_LEFT_4: {
        getPileType() {
            return PileType.CENTER;
        }
    },
    CENTER_PILE_RIGHT_1: {
        getPileType() {
            return PileType.CENTER;
        }
    },
    CENTER_PILE_RIGHT_2: {
        getPileType() {
            return PileType.CENTER;
        }
    },
    CENTER_PILE_RIGHT_3: {
        getPileType() {
            return PileType.CENTER;
        }
    },
    CENTER_PILE_RIGHT_4: {
        getPileType() {
            return PileType.CENTER;
        }
    }
});