/**
 * @file src/types/ConsecutiveIntegerSequence.ts
 */
import { printConsoleGroup as print } from "../utils/io";
export const MAX_NUM_SEQUENCES = 4;

/**
 * @class `ConsecutiveIntegerSequence`
 * @param {number} start - The starting integer of the sequence.
 * @param {number} end - The ending integer of the sequence.
 * @property {number} length - The number of integers in the sequence.
 */
export class ConsecutiveIntegerSequence {
    start: number;
    end: number;
    
    /**
     * @constructor
     * @param {number} start  - The starting integer of the sequence.
     * @param {number} end  - The ending integer of the sequence.
     */
    constructor(start: number, end: number) {
        this.start = start;
        this.end = end;
    }

    /**
     * @returns {number} `length` - The number of integers in the sequence.
     */
    get length(): number {
        return this.end - this.start + 1;
    }

    /**
     * @returns {Array<number>} `sequence` - An array of consecutive integers from start to end.
     */
    get sequence(): Array<number> {
        return Array.from({ length: this.length }, (_, i) => this.start + i);
    }
}

/**
 * @typedefn `FindConsecutiveIntegerSequencesResult`
 * @property {Array<ConsecutiveIntegerSequence>} sequences - `Array<`{@link ConsecutiveIntegerSequence}`>` of consecutive integer sequences
 * @property {Array<string>} remainingValues - `Array<string>` of non-consecutive values (or if the zip code contains non-numeric characters)
 */
export type FindConsecutiveIntegerSequencesResult = {
    sequences: Array<ConsecutiveIntegerSequence>;
    remainingValues: Array<string>;
}
/**
 * 
 * @param {Array<string>} valuesArr - `Array<string>` of values (in this case zip codes) to check for consecutive integer sequences 
 * @param {number} maxNumSequences - Maximum number of sequences to find before dumping rest of the values into remainingValues.
 * @returns {FindConsecutiveIntegerSequencesResult} - {@link FindConsecutiveIntegerSequencesResult} object containing the following properties:
 * - sequences: Array\<{@link ConsecutiveIntegerSequence}> of consecutive integer sequences result.sequences.length <= maxNumSequences
 * - remainingValues: `Array<string>` of non-consecutive values (i.e. the zip code contains non-numeric characters)
 */
export function findConsecutiveIntegerSequences(
    valuesArr: Array<string>, 
    maxNumSequences: number=MAX_NUM_SEQUENCES
): FindConsecutiveIntegerSequencesResult {
    let result: FindConsecutiveIntegerSequencesResult = {
        sequences: [],
        remainingValues: []
    };
    
    // Create pairs of [originalValue, numericValue] for processing
    let valuePairs = valuesArr.map(val => [val, Number(val)]);
    
    // Sort based on numeric values, keeping non-numeric at the end
    valuePairs.sort((a, b) => {
        if (isNaN(a[1] as number) && isNaN(b[1] as number)) return (a[0] as string).localeCompare(b[0] as string);
        if (isNaN(a[1] as number)) return 1;
        if (isNaN(b[1] as number)) return -1;
        return (a[1] as number) - (b[1] as number);
    });
    
    let currentSequence: ConsecutiveIntegerSequence | null = null;
    
    for (let i = 0; i < valuePairs.length; i++) {
        let [originalValue, numericValue] = valuePairs[i];
        numericValue = numericValue as number; // Type assertion to ensure numericValue is treated as a number
        if (isNaN(numericValue as number)) {
            result.remainingValues.push(String(originalValue).padStart(5, '0'));
            continue;
        }
        
        if (!currentSequence) {
            currentSequence = new ConsecutiveIntegerSequence(numericValue, numericValue);
        } else if (numericValue === currentSequence.end + 1) {
            currentSequence.end = numericValue;
        } else if (currentSequence.length > 2) {
            result.sequences.push(currentSequence);
            currentSequence = new ConsecutiveIntegerSequence(numericValue, numericValue);
        } else {
            // Handle short sequences
            if (currentSequence.length === 1) {
                result.remainingValues.push(String(currentSequence.start).padStart(5, '0'));
            } else { // length === 2
                result.remainingValues.push(String(currentSequence.start).padStart(5, '0'), String(currentSequence.end).padStart(5, '0'));
            }
            currentSequence = new ConsecutiveIntegerSequence(numericValue, numericValue);
        }
    }
    
    // Handle the final sequence
    if (currentSequence) {
        if (currentSequence.length > 2) {
            result.sequences.push(currentSequence);
        } else if (currentSequence.length === 2) {
            result.remainingValues.push(String(currentSequence.start).padStart(5, '0'), String(currentSequence.end).padStart(5, '0'));
        } else { // length === 1
            result.remainingValues.push(String(currentSequence.start).padStart(5, '0'));
        }
    }

    // Validation code
    let reformedValueArr = [...result.remainingValues];
    for (let seq of result.sequences) {
        reformedValueArr.push(...seq.sequence.map(String));
    }
    
    console.log('Reformed Value Array length:', reformedValueArr.length);
    console.log('Reformed Value Array to Set size:', new Set(reformedValueArr).size);
    
    print({label: 'Validation of findConsecutiveIntegerSequences()',
        details: [
            `Number of Remaining Values: ${result.remainingValues.length}`,
            `Number of Sequences: ${result.sequences.length}`,
            `Combined Length of Consecutive Sequences: ${result.sequences.reduce((acc, seq) => acc + seq.length, 0)}`,
        ]
    });
    
    if (maxNumSequences && result.sequences.length > maxNumSequences) {
        // Sort sequences by length (descending)
        result.sequences.sort((a, b) => b.length - a.length);
        // Keep only the top sequences
        const discardedSequences = result.sequences.slice(maxNumSequences);
        result.sequences = result.sequences.slice(0, maxNumSequences);
        // For all the remaining sequences, push seq.sequence.map(String) into result.remainingValues
        for (const seq of discardedSequences) {
            result.remainingValues.push(...seq.sequence.map(num => String(num).padStart(5, '0')));
        }
    }
    print({label: 'End result of findConsecutiveIntegerSequences()',
        details: [
            `Number of Remaining Values: ${result.remainingValues.length}`,
            `Number of Sequences: ${result.sequences.length}`,
            `Combined Length of Consecutive Sequences: ${result.sequences.reduce((acc, seq) => acc + seq.length, 0)}`,
        ]
    });
    print({label: 'Top sequences:', details: `${result.sequences.map(seq => seq.sequence)}`});
    return result;
}
