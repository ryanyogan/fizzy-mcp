/**
 * CLI for the Fizzy MCP server.
 *
 * Commands:
 * - auth: Configure authentication
 * - configure: Auto-configure AI agents
 * - whoami: Show current identity
 * - status: Check server configuration
 * - logout: Clear stored credentials
 */

import { Command } from 'commander';
import * as readline from 'node:readline';
import { exec } from 'node:child_process';
import { FizzyClient } from '@fizzy-mcp/client';
import { type ServerMode, HOSTED_URLS, FIZZY_TOKEN_URL } from '@fizzy-mcp/shared';
import {
  resolveConfig,
  saveConfig,
  clearConfig,
  isConfigured,
  getConfigPath,
  readStoredConfig,
} from './credentials.js';
import { showBanner, showWelcome, colors, box, keyValue, listItem } from './ui/index.js';
import { withSpinner, showSuccess, showFailure, showInfo, showWarning } from './ui/spinner.js';
import { runConfigureFlow } from './configure/index.js';

const VERSION = '0.1.0';

const program = new Command();

program
  .name('fizzy-mcp')
  .description('MCP server for Fizzy - AI-powered task management')
  .version(VERSION);

/**
 * Prompts for user input from stdin.
 */
async function prompt(question: string, hidden = false): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stderr,
  });

  return new Promise((resolve) => {
    if (hidden) {
      // For hidden input, we need to manually handle it
      process.stderr.write(question);
      let input = '';

      process.stdin.setRawMode(true);
      process.stdin.resume();
      process.stdin.setEncoding('utf8');

      const onData = (char: string) => {
        if (char === '\n' || char === '\r' || char === '\u0004') {
          process.stdin.setRawMode(false);
          process.stdin.pause();
          process.stdin.removeListener('data', onData);
          process.stderr.write('\n');
          rl.close();
          resolve(input);
        } else if (char === '\u0003') {
          // Ctrl+C
          process.exit(0);
        } else if (char === '\u007F' || char === '\b') {
          // Backspace
          if (input.length > 0) {
            input = input.slice(0, -1);
          }
        } else {
          input += char;
        }
      };

      process.stdin.on('data', onData);
    } else {
      rl.question(question, (answer) => {
        rl.close();
        resolve(answer);
      });
    }
  });
}

/**
 * Opens a URL in the default browser.
 */
function openBrowser(url: string): void {
  const command =
    process.platform === 'darwin'
      ? `open "${url}"`
      : process.platform === 'win32'
        ? `start "" "${url}"`
        : `xdg-open "${url}"`;

  exec(command, (err) => {
    if (err) {
      console.error(colors.muted(`Could not open browser. Please visit: ${url}`));
    }
  });
}

/**
 * Prompts user to select server mode (local or remote).
 */
async function promptServerMode(): Promise<ServerMode> {
  console.error('');
  console.error(colors.text('How would you like to run Fizzy MCP?'));
  console.error('');
  console.error(
    listItem(
      `${colors.primaryBright('1.')} ${colors.success('Remote (Recommended)')} - Use our hosted service`,
    ),
  );
  console.error(colors.muted('      No local server needed. Works with any MCP client.'));
  console.error(colors.muted(`      Rate limits: 100 writes/day (free), 1000/day (with API key)`));
  console.error('');
  console.error(
    listItem(`${colors.primaryBright('2.')} ${colors.text('Local')} - Run server on your machine`),
  );
  console.error(colors.muted('      Full control, no rate limits. Requires local Node.js.'));
  console.error('');

  const input = await prompt(`${colors.primary('Enter choice [1]:')} `);
  const choice = input.trim() || '1';

  if (choice === '2' || choice.toLowerCase() === 'local') {
    return 'local';
  }
  return 'remote';
}

/**
 * Prompts for Fizzy access token with option to open browser.
 */
async function promptFizzyToken(): Promise<string> {
  const tokenInstructions = [
    colors.text('You need a Personal Access Token from Fizzy.'),
    '',
    `${colors.primary('1.')} Go to ${colors.primaryBright(FIZZY_TOKEN_URL)}`,
    `${colors.primary('2.')} Click ${colors.text('New Personal Access Token')}`,
    `${colors.primary('3.')} Give it a name and copy the token`,
    '',
    colors.muted('Press Enter to open the page in your browser, or paste your token:'),
  ].join('\n');

  console.error(box(tokenInstructions, { title: 'Fizzy Token' }));

  const input = await prompt(`${colors.primary('Token:')} `, true);

  if (!input || input.trim() === '') {
    // Open browser to Fizzy token page
    console.error('');
    showInfo(`Opening ${FIZZY_TOKEN_URL} in your browser...`);
    openBrowser(FIZZY_TOKEN_URL);
    console.error('');
    console.error(colors.muted('After creating your token, paste it here:'));

    const token = await prompt(`${colors.primary('Token:')} `, true);
    return token.trim();
  }

  return input.trim();
}

/**
 * Prompts for hosted service API key (optional).
 */
async function promptHostedApiKey(): Promise<string | undefined> {
  console.error('');
  console.error(colors.text('Would you like to use an API key for higher rate limits?'));
  console.error('');
  console.error(colors.muted('Without an API key: 100 writes/day'));
  console.error(colors.muted('With an API key:    1,000 writes/day'));
  console.error('');
  console.error(
    colors.muted('API keys will be available at the Fizzy MCP dashboard (coming soon).'),
  );
  console.error(colors.muted('Press Enter to skip, or paste your API key:'));
  console.error('');

  const input = await prompt(`${colors.primary('API Key (optional):')} `);
  const apiKey = input.trim();

  if (apiKey && !apiKey.startsWith('fmcp_')) {
    showWarning('API keys should start with "fmcp_". Skipping.');
    return undefined;
  }

  return apiKey || undefined;
}

/**
 * Auth command - configure access token
 */
program
  .command('auth')
  .description('Configure Fizzy authentication')
  .option('-t, --token <token>', 'Access token (will prompt if not provided)')
  .option('-m, --mode <mode>', 'Server mode: "local" or "remote"')
  .option('-k, --api-key <key>', 'Hosted service API key (for higher limits)')
  .option('--no-configure', 'Skip auto-configuration of AI agents')
  .action(
    async (options: { token?: string; mode?: string; apiKey?: string; configure: boolean }) => {
      // Show beautiful banner
      showBanner();

      // Determine server mode
      let mode: ServerMode;
      if (options.mode === 'local' || options.mode === 'remote') {
        mode = options.mode;
      } else {
        mode = await promptServerMode();
      }

      showInfo(`Using ${mode === 'remote' ? 'remote (hosted)' : 'local'} mode`);

      // Get Fizzy token
      let token = options.token;

      if (!token) {
        token = await promptFizzyToken();
      }

      if (!token || token.trim() === '') {
        showFailure('Access token is required');
        process.exit(1);
      }

      token = token.trim();

      // Validate the token by fetching identity
      let identity;
      try {
        identity = await withSpinner(
          'Validating token...',
          async () => {
            const client = new FizzyClient({ accessToken: token! });
            const result = await client.identity.getIdentity();
            if (!result.ok) {
              throw new Error(result.error.message);
            }
            return result.value;
          },
          {
            success: 'Token validated',
            failure: 'Invalid access token',
          },
        );
      } catch (err) {
        process.exit(1);
      }

      // Get user info from first account (user is the same across all accounts)
      const firstAccount = identity.accounts[0];
      if (firstAccount) {
        showWelcome(firstAccount.user.name, firstAccount.user.email_address);
      }

      // Show available accounts
      if (identity.accounts.length === 0) {
        showWarning('No accessible accounts found');
        console.error(colors.muted('Make sure your token has access to at least one account.'));
      } else if (identity.accounts.length > 1) {
        console.error('');
        console.error(colors.text('Available accounts:'));
        for (const account of identity.accounts) {
          const slug = account.slug.startsWith('/') ? account.slug : `/${account.slug}`;
          console.error(listItem(`${account.name} ${colors.muted(`(${slug})`)}`));
        }
      }

      // Determine account slug
      let accountSlug: string | undefined;

      if (identity.accounts.length === 1) {
        // Auto-select single account
        const account = identity.accounts[0]!;
        accountSlug = account.slug.startsWith('/') ? account.slug : `/${account.slug}`;
        showInfo(`Auto-selected account: ${account.name}`);
      } else if (identity.accounts.length > 1) {
        // Prompt for account selection
        console.error('');
        console.error(colors.text('Which account would you like to use?'));
        console.error(
          colors.muted('(Press Enter to auto-detect at runtime, or enter the account slug)'),
        );
        const input = await prompt(`${colors.primary('Account slug:')} `);
        if (input.trim()) {
          accountSlug = input.trim();
          // Ensure it starts with /
          if (!accountSlug.startsWith('/')) {
            accountSlug = '/' + accountSlug;
          }
        }
      }

      // Get hosted API key if using remote mode
      let hostedApiKey: string | undefined;
      if (mode === 'remote') {
        if (options.apiKey) {
          hostedApiKey = options.apiKey;
        } else {
          hostedApiKey = await promptHostedApiKey();
        }
      }

      // Save configuration
      const stored = readStoredConfig();
      saveConfig({
        ...stored,
        mode,
        accessToken: token,
        accountSlug,
        hostedApiKey,
      });

      console.error('');
      showSuccess(`Configuration saved to ${getConfigPath()}`);

      // Show mode-specific information
      if (mode === 'remote') {
        console.error('');
        const remoteInfo = [
          keyValue('Mode', colors.success('Remote (Hosted)')),
          keyValue('Endpoint', HOSTED_URLS.mcp),
          keyValue('API Key', hostedApiKey ? colors.success('Configured') : colors.muted('None')),
          keyValue('Rate Limit', hostedApiKey ? '1,000 writes/day' : '100 writes/day'),
        ].join('\n');
        console.error(box(remoteInfo, { title: 'Remote Mode', borderColor: '#22d3ee' }));
      }

      // Run auto-configuration flow if not disabled
      if (options.configure) {
        await runConfigureFlow();
      }

      // Show manual configuration example
      console.error('');
      console.error(colors.text('MCP client configuration:'));
      console.error('');

      if (mode === 'remote') {
        // Remote mode uses HTTP transport - show config with actual token
        const mcpConfig = {
          mcpServers: {
            fizzy: {
              transport: 'http',
              url: HOSTED_URLS.mcp,
              headers: {
                'X-Fizzy-Token': token,
                ...(hostedApiKey ? { 'X-API-Key': hostedApiKey } : {}),
                ...(accountSlug ? { 'X-Fizzy-Account-Slug': accountSlug } : {}),
              },
            },
          },
        };
        console.error(colors.muted(JSON.stringify(mcpConfig, null, 2)));
        console.error('');
        console.error(colors.warning('Note: This config contains your token. Keep it secure!'));
      } else {
        // Local mode uses stdio - credentials are stored in config file
        console.error(
          colors.muted(
            JSON.stringify(
              {
                mcpServers: {
                  fizzy: {
                    command: 'npx',
                    args: ['-y', 'fizzy-do-mcp@latest'],
                  },
                },
              },
              null,
              2,
            ),
          ),
        );
        console.error('');
        console.error(
          colors.muted('Credentials are stored securely - no need to add them to the config.'),
        );
      }
    },
  );

/**
 * Configure command - auto-configure AI agents
 */
program
  .command('configure')
  .description('Auto-configure AI agents (Claude Desktop, Cursor, OpenCode)')
  .action(async () => {
    showBanner();

    if (!isConfigured()) {
      showFailure('Not authenticated');
      console.error(colors.muted('Run "fizzy-mcp auth" first to set up credentials.'));
      process.exit(1);
    }

    const configured = await runConfigureFlow();
    if (!configured) {
      console.error('');
      console.error(colors.muted('No agents were configured.'));
    }
  });

/**
 * Whoami command - show current identity
 */
program
  .command('whoami')
  .description('Show current Fizzy identity')
  .action(async () => {
    if (!isConfigured()) {
      showFailure('Not authenticated');
      console.error(colors.muted('Run "fizzy-mcp auth" first.'));
      process.exit(1);
    }

    const config = resolveConfig();
    if (!config) {
      showFailure('Invalid configuration');
      console.error(colors.muted('Run "fizzy-mcp auth" to reconfigure.'));
      process.exit(1);
    }

    const client = new FizzyClient({
      accessToken: config.accessToken,
      ...(config.accountSlug ? { accountSlug: config.accountSlug } : {}),
      baseUrl: config.baseUrl,
    });

    let identity;
    try {
      identity = await withSpinner('Fetching identity...', async () => {
        const result = await client.identity.getIdentity();
        if (!result.ok) {
          throw new Error(result.error.message);
        }
        return result.value;
      });
    } catch (err) {
      showFailure('Failed to fetch identity');
      process.exit(1);
    }

    const firstAccount = identity.accounts[0];

    if (firstAccount) {
      const info = [
        keyValue('Name', firstAccount.user.name),
        keyValue('Email', firstAccount.user.email_address),
        firstAccount.user.avatar_url ? keyValue('Avatar', firstAccount.user.avatar_url) : null,
      ]
        .filter(Boolean)
        .join('\n');

      console.error(box(info, { title: 'Identity' }));
    }

    console.error(colors.text('Accounts:'));
    for (const account of identity.accounts) {
      const slug = account.slug.startsWith('/') ? account.slug : `/${account.slug}`;
      const active = config.accountSlug === slug ? colors.success(' (active)') : '';
      console.error(listItem(`${account.name} ${colors.muted(`(${slug})`)}${active}`));
    }
  });

/**
 * Status command - check configuration
 */
program
  .command('status')
  .description('Check server configuration status')
  .action(() => {
    showBanner();

    if (!isConfigured()) {
      const status = [
        keyValue('Status', colors.warning('Not configured')),
        '',
        colors.muted('Run "fizzy-mcp auth" to configure authentication.'),
      ].join('\n');

      console.error(box(status, { title: 'Server Status', borderColor: '#fbbf24' }));
      process.exit(0);
    }

    const config = resolveConfig();
    const stored = readStoredConfig();

    if (!config) {
      const status = [
        keyValue('Status', colors.error('Invalid configuration')),
        '',
        colors.muted('Run "fizzy-mcp auth" to reconfigure.'),
      ].join('\n');

      console.error(box(status, { title: 'Server Status', borderColor: '#f87171' }));
      process.exit(1);
    }

    const tokenMasked = '*'.repeat(8) + '...' + config.accessToken.slice(-4);
    const mode = stored.mode || 'local';

    const statusLines = [
      keyValue('Status', colors.success('Configured')),
      keyValue('Mode', mode === 'remote' ? colors.primaryBright('Remote (Hosted)') : 'Local'),
      keyValue('Config file', getConfigPath()),
      keyValue('Base URL', config.baseUrl),
      keyValue('Account', config.accountSlug || colors.muted('(auto-detect)')),
      keyValue('Token', tokenMasked),
    ];

    if (mode === 'remote') {
      statusLines.push(keyValue('Endpoint', HOSTED_URLS.mcp));
      statusLines.push(
        keyValue(
          'API Key',
          stored.hostedApiKey ? colors.success('Configured') : colors.muted('None'),
        ),
      );
      statusLines.push(
        keyValue('Rate Limit', stored.hostedApiKey ? '1,000 writes/day' : '100 writes/day'),
      );
    }

    console.error(box(statusLines.join('\n'), { title: 'Server Status', borderColor: '#4ade80' }));
  });

/**
 * Logout command - clear credentials
 */
program
  .command('logout')
  .description('Clear stored credentials')
  .action(() => {
    clearConfig();
    showSuccess('Credentials cleared');
  });

/**
 * Default command (no subcommand) - run the server
 */
program.action(async () => {
  const stored = readStoredConfig();

  // If remote mode, show the MCP config with stored credentials
  if (stored.mode === 'remote') {
    showBanner();

    if (!stored.accessToken) {
      showFailure('No Fizzy token configured');
      console.error(colors.muted('Run "fizzy-mcp auth" to set up your credentials.'));
      process.exit(1);
    }

    console.error(colors.primary('Fizzy MCP is configured for remote mode.'));
    console.error('');
    console.error(colors.text('Add this configuration to your MCP client:'));
    console.error('');

    const mcpConfig = {
      mcpServers: {
        fizzy: {
          transport: 'http',
          url: HOSTED_URLS.mcp,
          headers: {
            'X-Fizzy-Token': stored.accessToken,
            ...(stored.hostedApiKey ? { 'X-API-Key': stored.hostedApiKey } : {}),
            ...(stored.accountSlug ? { 'X-Fizzy-Account-Slug': stored.accountSlug } : {}),
          },
        },
      },
    };

    console.error(colors.muted(JSON.stringify(mcpConfig, null, 2)));
    console.error('');
    console.error(colors.warning('Note: This config contains your token. Keep it secure!'));
    console.error('');
    console.error(colors.muted('To switch to local mode: fizzy-mcp auth --mode local'));
    process.exit(0);
  }

  // Import and run the server
  await import('./index.js');
});

// Parse and execute
program.parse();
