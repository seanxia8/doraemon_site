import type { Metadata } from 'next';
import { RootProvider } from 'fumadocs-ui/provider/next';
import type { ReactNode } from 'react';
import './global.css';

export const metadata: Metadata = {
  title: {
    default: 'DORAEMON Open Dataset Challenge',
    template: '%s | DORAEMON Challenge',
  },
  description:
    'Challenge documentation for DORAEMON open datasets, metrics, baselines, validators, and submissions.',
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <RootProvider
          theme={{
            enabled: true,
            attribute: 'class',
            defaultTheme: 'light',
            enableSystem: false,
          }}
          search={{ enabled: false }}
          i18n={{
            translations: {
              search: 'search',
              searchNoResult: 'no results found',
              toc: 'on this page',
              tocNoHeadings: 'no headings',
              lastUpdate: 'last updated on',
              chooseLanguage: 'choose a language',
              nextPage: 'next page',
              previousPage: 'previous page',
              chooseTheme: 'theme',
              editOnGithub: 'edit on github',
            },
          }}
        >
          {children}
        </RootProvider>
      </body>
    </html>
  );
}
