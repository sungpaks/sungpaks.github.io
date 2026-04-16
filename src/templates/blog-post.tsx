import * as React from "react";
import { Link, graphql } from "gatsby";

import Bio from "../components/Bio";
import Layout from "../components/Layout";
import Seo from "../components/seo";
import Giscus from "@giscus/react";
import kebabCase from "lodash.kebabcase";
import { useState, useEffect } from "react";
import "katex/dist/katex.min.css";
import TableOfContents from "../components/TableOfContents";
import Bugi from "../components/Bugi";

interface Frontmatter {
  title: string;
  date: string;
  publishedTime?: string;
  description?: string;
  tag?: string[];
  ogImage?: string;
}

interface MarkdownRemark {
  id: string;
  excerpt: string;
  html: string;
  fields: {
    slug: string;
  };
  frontmatter: Frontmatter;
  tableOfContents: string;
}

interface BlogPostBySlugQuery {
  site: {
    siteMetadata: {
      title: string;
      siteUrl?: string;
    };
  };
  markdownRemark: MarkdownRemark;
  previous?: {
    fields: {
      slug: string;
    };
    frontmatter: {
      title: string;
    };
  };
  next?: {
    fields: {
      slug: string;
    };
    frontmatter: {
      title: string;
    };
  };
}

interface ComponentProps {
  data: BlogPostBySlugQuery;
  location: any;
}

const getFirstImageFromHtml = (html: string): string | null => {
  if (!html) {
    return null;
  }

  const imageRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
  let match: RegExpExecArray | null;

  while ((match = imageRegex.exec(html)) !== null) {
    const candidate = match[1];

    if (candidate && !candidate.startsWith("data:")) {
      return candidate;
    }
  }

  return null;
};

const getAbsoluteImageUrl = (
  imagePath: string | null | undefined,
  siteUrl?: string
) => {
  if (!imagePath) {
    return "";
  }

  try {
    if (siteUrl) {
      return new URL(imagePath, siteUrl).toString();
    }

    return new URL(imagePath).toString();
  } catch (error) {
    return imagePath;
  }
};

const BlogPostTemplate = ({
  data: { previous, next, site, markdownRemark: post },
  location
}: ComponentProps) => {
  const siteTitle = site.siteMetadata?.title || `Title`;
  const LIGHT = "light";
  const DARK = "dark";
  const KEY_THEME = "theme";
  const REVERSED = "reversed";
  const [curTheme, setCurTheme] = useState(LIGHT);
  useEffect(() => {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      //시스템 설정이 다크임
      setCurTheme(
        window.localStorage.getItem(KEY_THEME) === REVERSED ? LIGHT : DARK
      ); //뒤집혔으면 라이트로 ㄱㄱ
    } else {
      //시스템 설정이 라이트임
      setCurTheme(
        window.localStorage.getItem(KEY_THEME) === REVERSED ? DARK : LIGHT
      ); //뒤집혔으면 다크로 ㄱㄱ
    }
  }, []);

  useEffect(() => {
    const storageListener = (event: StorageEvent) => {
      if (event.key === KEY_THEME) {
        setCurTheme(prev => (prev === DARK ? LIGHT : DARK));
      }
    };
    window.addEventListener("storage", storageListener);
    return () => {
      window.removeEventListener("storage", storageListener);
    };
  }, []);

  return (
    <Layout location={location} setCurTag={undefined}>
      <article
        className="blog-post"
        itemScope
        itemType="http://schema.org/Article"
      >
        <header>
          <h1 itemProp="headline">{post.frontmatter.title}</h1>
          {post.frontmatter.tag?.map(t => {
            return (
              <Link
                key={t}
                className="custom-button tag-button"
                to={`/tag/${kebabCase(t)}`}
              >
                {t}
              </Link>
            );
          })}
          <p>{post.frontmatter.date}</p>
        </header>
        <hr />

        <TableOfContents tableOfContents={post.tableOfContents} />
        {/* <Hamburger /> */}
        <br />
        <section
          id="post-section"
          dangerouslySetInnerHTML={{ __html: post.html }}
          itemProp="articleBody"
        />
        <hr />
      </article>
      <nav className="blog-post-nav">
        <ul
          style={{
            display: `flex`,
            flexWrap: `wrap`,
            justifyContent: `space-between`,
            listStyle: `none`,
            padding: 0
          }}
        >
          <li>
            {previous && (
              <Link to={previous.fields.slug} rel="prev">
                ← {previous.frontmatter.title}
              </Link>
            )}
          </li>
          <li>
            {next && (
              <Link to={next.fields.slug} rel="next">
                {next.frontmatter.title} →
              </Link>
            )}
          </li>
        </ul>
      </nav>
      <Giscus
        // @ts-ignore
        src="https://giscus.app/client.js"
        repo="sungpaks/blog-comments"
        repoId="R_kgDOLARSPg"
        category="Announcements"
        categoryId="DIC_kwDOLARSPs4CcKJh"
        mapping="pathname"
        strict="0"
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="top"
        theme={curTheme}
        lang="ko"
        crossorigin="anonymous"
        async
      ></Giscus>
    </Layout>
  );
};

export const Head = ({
  data
}: {
  data: {
    markdownRemark: MarkdownRemark;
    site: {
      siteMetadata: {
        title: string;
        siteUrl?: string;
        author?: { name?: string };
      };
    };
  };
}) => {
  const { markdownRemark: post, site } = data;
  const siteUrl = site?.siteMetadata?.siteUrl?.trim() || undefined;
  const firstImage = getFirstImageFromHtml(post.html);
  const frontmatterOgImage = post.frontmatter.ogImage?.trim();
  const ogImage = getAbsoluteImageUrl(
    frontmatterOgImage || firstImage,
    siteUrl
  );
  const canonicalUrl =
    siteUrl && post.fields.slug
      ? new URL(post.fields.slug, siteUrl).toString()
      : undefined;
  const authorName = site?.siteMetadata?.author?.name || "조성훈";

  return (
    <Seo
      title={post.frontmatter.title}
      description={post.frontmatter.description || post.excerpt}
      thumbnail={ogImage}
      pathname={post.fields.slug}
      type="article"
      publishedTime={post.frontmatter.publishedTime}
      structuredData={
        canonicalUrl
          ? {
              "@context": "https://schema.org",
              "@type": "BlogPosting",
              headline: post.frontmatter.title,
              description: post.frontmatter.description || post.excerpt,
              url: canonicalUrl,
              mainEntityOfPage: canonicalUrl,
              inLanguage: "ko-KR",
              datePublished: post.frontmatter.publishedTime,
              author: {
                "@type": "Person",
                name: authorName
              },
              publisher: {
                "@type": "Person",
                name: authorName
              },
              ...(ogImage ? { image: [ogImage] } : {}),
              ...(post.frontmatter.tag?.length
                ? { keywords: post.frontmatter.tag.join(", ") }
                : {})
            }
          : undefined
      }
    />
  );
};

export default BlogPostTemplate;

export const pageQuery = graphql`
  query BlogPostBySlug(
    $id: String!
    $previousPostId: String
    $nextPostId: String
  ) {
    site {
      siteMetadata {
        title
        siteUrl
        author {
          name
        }
      }
    }
    markdownRemark(id: { eq: $id }) {
      id
      excerpt(pruneLength: 160)
      html
      fields {
        slug
      }
      frontmatter {
        title
        date(formatString: "MMMM DD, YYYY")
        publishedTime: date(formatString: "YYYY-MM-DD")
        description
        tag
        ogImage
      }
      tableOfContents
    }
    previous: markdownRemark(id: { eq: $previousPostId }) {
      fields {
        slug
      }
      frontmatter {
        title
      }
    }
    next: markdownRemark(id: { eq: $nextPostId }) {
      fields {
        slug
      }
      frontmatter {
        title
      }
    }
  }
`;
