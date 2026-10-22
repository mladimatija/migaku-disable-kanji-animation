import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettierConfig from 'eslint-config-prettier/flat';
import globals from 'globals';

export default tseslint.config(
	// Ignore-list must live in its own object with no other keys.
	{
		ignores: [
			'node_modules/**',
			'dist/**',
			'.vite/**',
			'coverage/**',
			'icons/icon-*.png',
			'test-results/**',
			'playwright-report/**',
			'*.zip',
		],
	},

	js.configs.recommended,

	// Type-aware TS rules, scoped to files covered by tsconfig.json.
	{
		files: ['src/**/*.ts', 'vite.config.ts', 'tests/**/*.ts', 'playwright.config.ts'],
		extends: [...tseslint.configs.recommendedTypeChecked, ...tseslint.configs.stylisticTypeChecked],
		languageOptions: {
			parserOptions: {
				projectService: true,
				tsconfigRootDir: import.meta.dirname,
			},
		},
		rules: {
			'@typescript-eslint/no-unused-vars': [
				'warn',
				{
					argsIgnorePattern: '^_',
					varsIgnorePattern: '^_',
					caughtErrorsIgnorePattern: '^_',
				},
			],
			'@typescript-eslint/no-explicit-any': 'error',
			'@typescript-eslint/no-floating-promises': 'error',
			'@typescript-eslint/no-misused-promises': ['error', { checksVoidReturn: false }],
		},
	},

	// Project-wide quality rules (JS + TS, no type info needed).
	{
		rules: {
			'no-unused-vars': 'off',
			'no-console': 'off',
			'no-debugger': 'error',
			'no-duplicate-imports': 'error',
			'no-var': 'error',
			'prefer-const': 'error',
			eqeqeq: ['error', 'always'],
		},
	},

	// Browser globals - the content script runs inside Migaku's page.
	{
		files: ['src/**/*.ts'],
		languageOptions: {
			globals: {
				...globals.browser,
				chrome: 'readonly',
			},
		},
	},

	// Node globals - vite config + Playwright files run under Node.
	{
		files: ['vite.config.ts', 'tests/**/*.ts', 'playwright.config.ts'],
		languageOptions: {
			globals: globals.node,
		},
	},

	// Node.js build scripts.
	{
		files: ['scripts/**/*.js', 'eslint.config.mjs'],
		languageOptions: {
			ecmaVersion: 'latest',
			sourceType: 'module',
			globals: globals.node,
		},
	},

	// Must be last: disables every rule Prettier would conflict with.
	prettierConfig,
);
