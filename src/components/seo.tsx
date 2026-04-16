/**
 * SEO component that queries for data with
 * Gatsby's useStaticQuery React hook
 *
 * See: https://www.gatsbyjs.com/docs/how-to/querying-data/use-static-query/
 */

import * as React from "react";
import { useStaticQuery, graphql } from "gatsby";

interface ComponentProps {
  description?: string;
  title: string;
  children?: React.ReactNode;
  thumbnail?: string;
  pathname?: string;
  type?: "website" | "article";
  noindex?: boolean;
  publishedTime?: string;
  modifiedTime?: string;
  structuredData?: Record<string, unknown> | Record<string, unknown>[];
}

const Seo = ({
  description,
  title,
  children,
  thumbnail,
  pathname = "/",
  type = "website",
  noindex = false,
  publishedTime,
  modifiedTime,
  structuredData
}: ComponentProps) => {
  const { site } = useStaticQuery(
    graphql`
      query {
        site {
          siteMetadata {
            title
            description
            siteUrl
            author {
              name
              summary
            }
            social {
              twitter
            }
          }
        }
      }
    `
  );

  const metaDescription = description || site.siteMetadata.description;
  const defaultTitle = site.siteMetadata?.title;
  const siteUrl = site.siteMetadata?.siteUrl || "";
  const canonicalUrl = siteUrl ? new URL(pathname, siteUrl).toString() : "";
  const metaTitle =
    title === defaultTitle ? title : `${title} | ${defaultTitle}`;
  const twitterHandle = site.siteMetadata?.social?.twitter || "";
  const robots = noindex
    ? "noindex, follow"
    : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";
  const schemaEntries = structuredData
    ? Array.isArray(structuredData)
      ? structuredData
      : [structuredData]
    : [];

  const seo = {
    title: metaTitle || defaultTitle,
    description: description || metaDescription,
    thumbnail
  };

  const twitterCardType = thumbnail ? "summary_large_image" : "summary";

  return (
    <>
      <title>{seo.title}</title>
      <html lang="ko" />
      <meta name="description" content={seo.description} />
      <meta name="robots" content={robots} />
      <meta name="googlebot" content={robots} />
      <meta name="author" content={site.siteMetadata?.author?.name || ""} />
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:type" content={type} />
      <meta property="og:locale" content="ko_KR" />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      {seo.thumbnail && <meta property="og:image" content={seo.thumbnail} />}
      <meta property="og:site_name" content={site.siteMetadata.title} />
      <meta name="twitter:card" content={twitterCardType} />
      {twitterHandle && <meta name="twitter:creator" content={twitterHandle} />}
      {twitterHandle && <meta name="twitter:site" content={twitterHandle} />}
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:description" content={metaDescription} />
      {seo.thumbnail && <meta name="twitter:image" content={seo.thumbnail} />}
      {type === "article" && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === "article" && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {type === "article" && site.siteMetadata?.author?.name && (
        <meta
          property="article:author"
          content={site.siteMetadata.author.name}
        />
      )}
      {schemaEntries.map((entry, index) => (
        <script
          key={`structured-data-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(entry) }}
        />
      ))}
      {children}
      <meta
        name="google-site-verification"
        content="iP6AmcpYft1WcrX_A3DlYxkWH2bwT-mrYanTBB8vm4k"
      />
    </>
  );
};

export default Seo;
