module.exports = {
  root: true,
  extends: ['plugin:@next/next/recommended', '@payloadcms', 'plugin:react-hooks/recommended'],
  ignorePatterns: ['**/payload-types.ts'],
  plugins: ['prettier', 'react-hooks'],
  rules: {
    'prettier/prettier': ['error', { endOfLine: 'auto' }],
    'no-console': 'off',
    'react-hooks/rules-of-hooks': 'off',
    'react-hooks/exhaustive-deps': 'off',
  },
}
