import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: <span className="docs-brand">DORAEMON</span>,
      url: '/',
    },
    links: [
      {
        text: 'Documentation',
        url: '/docs',
        active: 'nested-url',
      },
      {
        text: 'Challenges',
        url: '/challenges',
        active: 'url',
      },
      {
        text: 'Data Hub',
        url: '/data-hub',
        active: 'url',
      },
    ],
    themeSwitch: {
      enabled: true,
      mode: 'light-dark',
    },
  };
}
