module.exports = {
    plugins: ['functional'],
    extends: [
        'plugin:functional/recommended',
        'plugin:@typescript-eslint/recommended',
        'prettier/@typescript-eslint',
        'plugin:prettier/recommended',
    ],
    rules: {
        '@typescript-eslint/no-use-before-define': 'off',
        'functional/functional-parameters': 'off',
        'functional/no-expression-statement': 'off',
        'functional/prefer-type-literal': 'off',
        'functional/no-conditional-statement': 'off',
        'functional/prefer-readonly-type': 'off', // broken for now, it doesn't respect Readonly<T>
    },
};
