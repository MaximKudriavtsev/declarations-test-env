// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html
const path = require('path');
const resolve = require('resolve');

module.exports = {
    'globals': {
        'ts-jest': {
            tsConfig: './src/tests/tsconfig.json',
            diagnostics: false, // set to true to enable type checking
        }
    },
    collectCoverage: true,
    collectCoverageFrom: [
        './src/widgets/**/*.tsx',
    ],
    coverageDirectory: './src/tests/code_coverage',
    coverageThreshold: {
        './src/widgets/**/*.tsx': {
            functions: 100,
            statements: 100,
            lines: 100,
            branches: 100
        }
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
    preset: 'ts-jest',
    setupFiles: [
        path.join(path.resolve('.'), './src/tests/preact-adapter.js'),
    ],
    testMatch: [
        path.join(path.resolve('.'), './src/**/*.tests.[jt]s?(x)')
    ],
    transform: {
        '.(js|jsx|ts|tsx)': resolve.sync('ts-jest')
    }
};
