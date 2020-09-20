export const awaitNMockCalls = (fn: jest.Mock, numberOfCalls: number): Promise<void> =>
    new Promise(resolve => {
        const intervalId = setInterval(() => {
            if (fn.mock.calls.length < numberOfCalls) return;

            clearInterval(intervalId);
            resolve();
        }, 50);
    });
