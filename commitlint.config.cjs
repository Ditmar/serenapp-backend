module.exports = {
    extends: ['@commitlint/config-conventional'],
    rules: {
        // Allow only these types; others will be rejected by our Husky gate anyway
        'type-enum': [2, 'always', ['feat', 'fix', 'release', 'hotfix']],
        // Enforce the exact format "type: subject" (no scope, no exclamation)
        'type-case': [2, 'always', 'lower-case'],
        'subject-empty': [2, 'never'],
    },
};
