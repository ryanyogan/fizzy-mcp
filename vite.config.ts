import { defineConfig } from 'vite-plus';

export default defineConfig({
  lint: {
    options: { typeAware: true, typeCheck: true },
    ignorePatterns: [
      'docs/',
      'apps/hosted/drizzle.config.ts',
      'apps/hosted/worker-configuration.d.ts',
      'apps/hosted/migrations/',
    ],
  },
  fmt: {
    semi: true,
    singleQuote: true,
    tabWidth: 2,
    trailingComma: 'all',
    printWidth: 100,
    bracketSpacing: true,
    sortPackageJson: false,
    ignorePatterns: ['dist/', 'node_modules/', '.turbo/', 'pnpm-lock.yaml', '*.md'],
  },
});
