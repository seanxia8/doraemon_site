import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { ComponentProps } from 'react';
import { withBasePath } from './paths';

function Anchor({ href, ...props }: ComponentProps<'a'>) {
  return <a href={href ? withBasePath(href) : href} {...props} />;
}

function Image({ className, src, ...props }: ComponentProps<'img'>) {
  return (
    <img
      className={className ?? 'docs-physics-image'}
      src={typeof src === 'string' ? withBasePath(src) : src}
      {...props}
    />
  );
}

export const mdxComponents = {
  ...defaultMdxComponents,
  a: Anchor,
  img: Image,
};
