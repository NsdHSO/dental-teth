const {defineConfig} = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");
const unusedImports = require("eslint-plugin-unused-imports");

module.exports = defineConfig([
    ...expoConfig,
    {
        ignores: ["dist/*", "node_modules/*"],
    },
    {
        plugins: {
            "unused-imports": unusedImports,
        },
        rules: {
            // Disable import/no-unresolved for workspace packages - TypeScript handles this
            "import/no-unresolved": ["error", {
                ignore: ["^@yuhuu/"]
            }],
            "@typescript-eslint/no-unused-vars": "off",
            "unused-imports/no-unused-imports": "error",
            "unused-imports/no-unused-vars": [
                "warn",
                {
                    vars: "all",
                    varsIgnorePattern: "^_",
                    args: "after-used",
                    argsIgnorePattern: "^_",
                },
            ],
        },
    },
    {
        files: ["**/__tests__/**/*.{ts,tsx,js,jsx}", "**/*.test.{ts,tsx,js,jsx}", "**/*.spec.{ts,tsx,js,jsx}", "**/jest.setup.{ts,js}", "**/__mocks__/**/*.{ts,tsx,js,jsx}"],
        rules: {
            "@typescript-eslint/no-require-imports": "off",
        },
    },
]);
