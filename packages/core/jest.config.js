// eslint-disable-next-line functional/immutable-data
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleFileExtensions: ['ts', 'js'],
    testPathIgnorePatterns: ['/node_modules/', '/dist'],
    collectCoverage: true,
};
