export const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

export function withBasePath(path: string): string {
  if (!basePath || !path.startsWith('/') || path.startsWith('//')) {
    return path;
  }

  if (path === '/') {
    return basePath;
  }

  return `${basePath}${path}`;
}
