import * as U from '../union';

describe('Union', () => {
    const ONE = U.caseOf('ONE')();
    const TWO = U.caseOf('TWO')<number>();

    describe('caseOf', () => {
        it('creates a tuple with phantom type as a second element', () => {
            expect(ONE).toEqual(['ONE', undefined]);
            expect(TWO).toEqual(['TWO', undefined]);
        });
    });

    describe('createUnion', () => {
        const union = U.createUnion(ONE, TWO);

        it('creates a record with all provided cases', () => {
            expect(union.ONE).toBeDefined();
            expect(union.TWO).toBeDefined();
        });

        it('creates an typed action creator for each record entry', () => {
            expect(union.ONE.type).toBe('ONE');
            expect(typeof union.ONE).toBe('function');

            expect(union.TWO.type).toBe('TWO');
            expect(typeof union.TWO).toBe('function');
        });
    });
});
