/**
 * The configuration file to set the strength of the AI.
 * Note: All values are the smallest possible probability and increase with the level of difficulty of the game!
 * The smaller these values are the more stupid the AI will play... Highest value is 1.0.
 */
export const PROBABILITY_TO_KNOCK = 0.2;
export const PROBABILITY_TO_CHECK_MANDATORY_MOVES = 0.2;
export const PROBABILITY_TO_CHECK_MOVES_OF_CHOICE = 0.7;
export const PROBABILITY_TAKE_PRIO_1_MOVE_INSTEAD_OF_PRIO_2_OR_3 = 0.5;
export const PROBABILITY_TAKE_PRIO_2_MOVE_INSTEAD_OF_PRIO_1_OR_3 = 0.2;
export const PROBABILITY_TAKE_PRIO_1_MOVE_INSTEAD_OF_PRIO_2 = 0.5;
export const PROBABILITY_TAKE_PRIO_1_MOVE_INSTEAD_OF_PRIO_3 = 0.6;
export const PROBABILITY_TAKE_PRIO_2_MOVE_INSTEAD_OF_PRIO_3 = 0.4;
export const PROBABILITY_TAKE_PRIO_1_MOVE_THAT_IS_ALSO_OF_PRIO_2 = 0.3;
export const PROBABILITY_TAKE_PRIO_1_MOVE_THAT_MOVES_CARD_TO_NOT_EMPTY_HOUSEPILE = 0.7;
export const PROBABILITY_TAKE_PRIO_2_OR_3_MOVE_THAT_FREES_A_SLOT = 0.4;
