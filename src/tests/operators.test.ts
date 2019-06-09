import { TestScheduler } from 'rxjs/testing';
import { map } from 'rxjs/operators';

import { select, ofType } from '../operators';

describe('operators', () => {
    const scheduler = new TestScheduler((actual, expected) => expect(actual).toEqual(expected));

    describe('select', () => {
        const mockStateA = { sth: 1 };
        const mockStateB = { sth: 2 };

        it('should not run another operator if the selection has not changed', () => {
            const mapMock = jest.fn(({ sth }: { sth: number }) => sth + 1);

            const callingScheduler = new TestScheduler(() => {
                expect(mapMock).toHaveBeenCalledTimes(2);
            });

            callingScheduler.run(({ expectObservable, cold }) => {
                const source$ = cold('-a-a-b-b', {
                    a: mockStateA,
                    b: mockStateB,
                });
                const expected$ = '   -a-a-b-b';

                const selection$ = source$.pipe(
                    select(a => a),
                    map(mapMock),
                );

                expectObservable(selection$).toBe(expected$);
            });
        });

        it('it should use mapper function if provided', () => {
            scheduler.run(({ expectObservable, cold }) => {
                const source$ = cold('a', {
                    a: mockStateA,
                });
                const expected$ = '   a';

                const selection$ = source$.pipe(select(x => x.sth + 1));

                expectObservable(selection$).toBe(expected$, {
                    a: 2,
                });
            });
        });

        it('it should use pluck if path is provided', () => {
            const nestedObj = {
                a: {
                    b: {
                        sth: 1,
                    },
                },
            };

            scheduler.run(({ expectObservable, cold }) => {
                const source$ = cold('a', {
                    a: nestedObj,
                });
                const expected$ = '   a';

                const selection$ = source$.pipe(select('a', 'b', 'sth'));

                expectObservable(selection$).toBe(expected$, {
                    a: 1,
                });
            });
        });
    });

    describe('ofType', () => {
        it('should return only actions of provided types', () => {
            const actions = {
                a: { type: 'ONE' },
                b: { type: 'TWO' },
                c: { type: 'THREE' },
            };

            scheduler.run(({ expectObservable, cold }) => {
                const source$ = cold('-ab-c-', actions);
                const expected$ = '   --b-c-';

                const limitedAction$ = source$.pipe(ofType(actions.b.type, actions.c.type));

                expectObservable(limitedAction$).toBe(expected$, {
                    b: actions.b,
                    c: actions.c,
                });
            });
        });
    });
});
