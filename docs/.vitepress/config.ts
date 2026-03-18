import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'FIZZY MCP',
  description: 'AI-powered task management with Model Context Protocol',

  head: [
    ['meta', { name: 'theme-color', content: '#22d3ee' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
    [
      'link',
      {
        href: 'https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;500;600;700&display=swap',
        rel: 'stylesheet',
      },
    ],
  ],

  cleanUrls: true,

  themeConfig: {
    logo: '/logo.svg',

    nav: [
      { text: 'Docs', link: '/getting-started/introduction' },
      { text: 'Tools', link: '/tools/overview' },
      { text: 'Workflows', link: '/workflows/ai-driven-tasks' },
      { text: 'GitHub', link: 'https://github.com/ryanyogan/fizzy-mcp' },
    ],

    sidebar: [
      {
        text: 'Getting Started',
        items: [
          { text: 'Introduction', link: '/getting-started/introduction' },
          { text: 'Installation', link: '/getting-started/installation' },
          { text: 'Quick Start', link: '/getting-started/quickstart' },
        ],
      },
      {
        text: 'Configuration',
        collapsed: false,
        items: [
          { text: 'Claude Desktop', link: '/configuration/claude-desktop' },
          { text: 'Claude Code', link: '/configuration/claude-code' },
          { text: 'Cursor', link: '/configuration/cursor' },
          { text: 'OpenCode', link: '/configuration/opencode' },
          { text: 'Windsurf', link: '/configuration/windsurf' },
          { text: 'Continue', link: '/configuration/continue' },
          { text: 'Environment Variables', link: '/configuration/environment' },
        ],
      },
      {
        text: 'Workflows',
        collapsed: false,
        items: [
          { text: 'AI-Driven Tasks', link: '/workflows/ai-driven-tasks' },
          { text: 'Project Management', link: '/workflows/project-management' },
          { text: 'Team Collaboration', link: '/workflows/team-collaboration' },
        ],
      },
      {
        text: 'Tools Reference',
        collapsed: true,
        items: [
          { text: 'Overview', link: '/tools/overview' },
          {
            text: 'Identity',
            collapsed: true,
            items: [
              { text: 'fizzy_get_identity', link: '/tools/identity/get-identity' },
              { text: 'fizzy_get_account', link: '/tools/identity/get-account' },
            ],
          },
          {
            text: 'Boards',
            collapsed: true,
            items: [
              { text: 'fizzy_list_boards', link: '/tools/boards/list-boards' },
              { text: 'fizzy_get_board', link: '/tools/boards/get-board' },
              { text: 'fizzy_create_board', link: '/tools/boards/create-board' },
              { text: 'fizzy_update_board', link: '/tools/boards/update-board' },
              { text: 'fizzy_delete_board', link: '/tools/boards/delete-board' },
            ],
          },
          {
            text: 'Cards',
            collapsed: true,
            items: [
              { text: 'fizzy_list_cards', link: '/tools/cards/list-cards' },
              { text: 'fizzy_get_card', link: '/tools/cards/get-card' },
              { text: 'fizzy_create_card', link: '/tools/cards/create-card' },
              { text: 'fizzy_update_card', link: '/tools/cards/update-card' },
              { text: 'fizzy_delete_card', link: '/tools/cards/delete-card' },
              { text: 'fizzy_close_card', link: '/tools/cards/close-card' },
              { text: 'fizzy_reopen_card', link: '/tools/cards/reopen-card' },
              { text: 'fizzy_postpone_card', link: '/tools/cards/postpone-card' },
              { text: 'fizzy_triage_card', link: '/tools/cards/triage-card' },
            ],
          },
          {
            text: 'Comments',
            collapsed: true,
            items: [
              { text: 'fizzy_list_comments', link: '/tools/comments/list-comments' },
              { text: 'fizzy_create_comment', link: '/tools/comments/create-comment' },
              { text: 'fizzy_update_comment', link: '/tools/comments/update-comment' },
              { text: 'fizzy_delete_comment', link: '/tools/comments/delete-comment' },
            ],
          },
          {
            text: 'Columns',
            collapsed: true,
            items: [
              { text: 'fizzy_list_columns', link: '/tools/columns/list-columns' },
              { text: 'fizzy_create_column', link: '/tools/columns/create-column' },
            ],
          },
          {
            text: 'Tags & Users',
            collapsed: true,
            items: [
              { text: 'fizzy_list_tags', link: '/tools/tags/list-tags' },
              { text: 'fizzy_list_users', link: '/tools/users/list-users' },
            ],
          },
        ],
      },
      {
        text: 'API Reference',
        collapsed: true,
        items: [
          { text: 'TypeScript Client', link: '/api/client' },
          { text: 'Error Handling', link: '/api/errors' },
          { text: 'Result Type', link: '/api/result' },
        ],
      },
    ],

    socialLinks: [{ icon: 'github', link: 'https://github.com/ryanyogan/fizzy-mcp' }],

    search: {
      provider: 'local',
      options: {
        detailedView: true,
      },
    },

    editLink: {
      pattern: 'https://github.com/ryanyogan/fizzy-mcp/edit/main/docs/:path',
      text: 'Edit this page on GitHub',
    },

    footer: {
      message: 'Open source under MIT License',
      copyright: 'Built by Ryan Yogan',
    },
  },
});
