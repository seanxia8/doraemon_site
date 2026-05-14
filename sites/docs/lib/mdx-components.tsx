import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { ComponentProps } from 'react';
import { withBasePath } from './paths';

type StaticImageLike = {
  src: string;
  width?: number;
  height?: number;
};

type MdxImageProps = Omit<ComponentProps<'img'>, 'src'> & {
  src?: ComponentProps<'img'>['src'] | StaticImageLike;
};

function Anchor({ href, ...props }: ComponentProps<'a'>) {
  return <a href={href ? withBasePath(href) : href} {...props} />;
}

function resolveImage(src: MdxImageProps['src']) {
  if (!src) return {};

  if (typeof src === 'string') {
    return { src: withBasePath(src) };
  }

  if (typeof src === 'object' && 'src' in src && typeof src.src === 'string') {
    return {
      src: withBasePath(src.src),
      width: src.width,
      height: src.height,
    };
  }

  return {};
}

function Image({ className, height, src, width, ...props }: MdxImageProps) {
  const image = resolveImage(src);

  return (
    <img
      {...props}
      className={className ?? 'docs-mdx-image'}
      height={height ?? image.height}
      src={image.src}
      width={width ?? image.width}
    />
  );
}

export const mdxComponents = {
  ...defaultMdxComponents,
  a: Anchor,
  img: Image,
};
