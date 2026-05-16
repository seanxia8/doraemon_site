'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { basePath, withBasePath } from '@/lib/paths';

const ASCII_LARTPC_VERSION = '81e1c988';
const WC_CHERENKOV_VERSION = '4c7a3f7b';

const scripts = {
  lartpc: {
    src: withBasePath(`/ascii-lartpc.js?v=${ASCII_LARTPC_VERSION}`),
  },
  cherenkov: {
    src: withBasePath(`/wc-cherenkov.js?v=${WC_CHERENKOV_VERSION}`),
  },
};

const loadedModules = new Set<string>();

function ensureModuleLoaded(src: string) {
  if (loadedModules.has(src)) {
    return;
  }

  loadedModules.add(src);
  void import(/* webpackIgnore: true */ src).catch(() => {
    loadedModules.delete(src);
  });
}

function normalizePathname(pathname: string) {
  const localPath = basePath && pathname.startsWith(basePath)
    ? pathname.slice(basePath.length) || '/'
    : pathname;

  if (localPath === '/') {
    return localPath;
  }

  return localPath.replace(/\/$/, '');
}

export function AsciiElementScripts() {
  const pathname = usePathname();

  useEffect(() => {
    const routePath = normalizePathname(pathname);
    const hasLartpcElement = document.querySelector('ascii-lartpc') !== null;
    const hasCherenkovElement = document.querySelector('wc-cherenkov') !== null;

    if (routePath === '/' || hasLartpcElement) {
      ensureModuleLoaded(scripts.lartpc.src);
    }

    if (routePath === '/challenges' || hasCherenkovElement) {
      ensureModuleLoaded(scripts.cherenkov.src);
    }
  }, [pathname]);

  return null;
}
