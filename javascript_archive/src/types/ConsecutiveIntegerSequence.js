/**
 * @file ConsecutiveIntegerSequence.js
 * @description This file contains a type definition that represents a sequence of consecutive integers.
 * @module ConsecutiveIntegerSequence
 * @export { ConsecutiveIntegerSequence }
 */


export const MAX_NUM_SEQUENCES = 4;

/**
 * @class ConsecutiveIntegerSequence
 * @description This class represents a sequence of consecutive integers.
 * @constructor
 * @param {number} start - The starting integer of the sequence.
 * @param {number} end - The ending integer of the sequence.
 * @property {number} length - The number of integers in the sequence.
 */
export class ConsecutiveIntegerSequence {
    /**
     * 
     * @param {number} start  - The starting integer of the sequence.
     * @param {number} end  - The ending integer of the sequence.
     * @returns {ConsecutiveIntegerSequence} intSequence - {@link ConsecutiveIntegerSequence} An object representing a sequence of consecutive integers.
     */
    constructor(start, end) {
        this.start = start;
        this.end = end;
    }

    /**
     * @returns {number} length - The number of integers in the sequence.
     */
    get length() {
        return this.end - this.start + 1;
    }

    /**
     * @returns {Array<number>} sequence - An array of consecutive integers from start to end.
     */
    get sequence() {
        return Array.from({ length: this.length }, (_, i) => this.start + i);
    }
}