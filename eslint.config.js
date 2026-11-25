import js from '@eslint/js'
import globals from 'globals'
import json from '@eslint/json'
import css from '@eslint/css'
import { defineConfig } from 'eslint/config'

const foundryKeys = [
    'game',
    'foundry',
    'Hooks',
    'fromUuidSync',
    'fromUuid',
    'ui',
    'canvas',
    'CONST',
    'CONFIG',
    'libWrapper',
    'socketlib',
    '_loc',
    'PIXI',
    'dnd5e',
]

export default defineConfig([
    {
        files: ['**/*.{js,mjs,cjs}'],
        plugins: { js },
        extends: ['js/recommended'],
        languageOptions: {
            globals: { ...globals.browser, ...foundryKeys.reduce((acc, key) => ({ ...acc, [key]: 'readonly' }), {}) },
        },
    },
    { files: ['**/*.json'], plugins: { json }, language: 'json/json', extends: ['json/recommended'] },
    { files: ['**/*.css'], plugins: { css }, language: 'css/css', extends: ['css/recommended'] },
    {
        rules: {
            'no-unused-vars': 'warn',
            'no-undef': 'error',
            'no-console': ['error', { allow: ['error'] }],
        },
    },
])
