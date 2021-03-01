import { Enum } from 'enumify';

export class CardNumber extends Enum {

    /**
    * Check if the order of this number is the successor of the order of the given number.
    * @return boolean true if the order of this cardnumber is the successor of the order of the given number
    */
    isSuccessor(anotherCardNumber) {
        return (this.getOrder() - 1) == anotherCardNumber.getOrder();
    }

    /**
    * Check if the order of this number is the predecessor of the order of the given number.
    * Note: Special rule for DEUCE: DEUCE is the predecessor for ACE!
    * @return boolean true if the order of this number is the predecessor of the order of the given number
    */
    isPredecessor(anotherCardNumber) {
        return (this.getOrder() + 1) == anotherCardNumber.getOrder();
    }
}

CardNumber.initEnum({
    ACE: {
        getOrder() {
            return 1;
        },
        getPictureNumber() {
            return 1;
        }
    },
    DEUCE: {
        getOrder() {
            return 2;
        },
        getPictureNumber() {
            return 13;
        }
    },
    THREE: {
        getOrder() {
            return 3;
        },
        getPictureNumber() {
            return 12;
        }
    },
    FOUR: {
        getOrder() {
            return 4;
        },
        getPictureNumber() {
            return 11;
        }
    },
    FIVE: {
        getOrder() {
            return 5;
        },
        getPictureNumber() {
            return 10;
        }
    },
    SIX: {
        getOrder() {
            return 6;
        },
        getPictureNumber(){
            return 9;
        }
    },
    SEVEN: {
        getOrder() {
            return 7;
        },
        getPictureNumber() {
            return 8;
        }
    },
    EIGHT: {
        getOrder() {
            return 8;
        },
        getPictureNumber() {
            return 7;
        }
    },
    NINE: {
        getOrder() {
            return 9;
        },
        getPictureNumber() {
            return 6;
        }
    },
    TEN: {
        getOrder() {
            return 10;
        },
        getPictureNumber() {
            return 5;
        }
    },
    JACK: {
        getOrder() {
            return 11;
        },
        getPictureNumber() {
            return 4;
        }
    },
    QUEEN: {
        getOrder() {
            return 12;
        },
        getPictureNumber() {
            return 3;
        }
    },
    KING: {
        getOrder() {
            return 13;
        },
        getPictureNumber() {
            return 2;
        }
    }
});