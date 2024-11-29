/**
 * SEO component that queries for data with
 * Gatsby's useStaticQuery React hook
 *
 * See: https://www.gatsbyjs.com/docs/how-to/querying-data/use-static-query/
 */

import * as React from "react";
import { FC } from "react";
import { useStaticQuery, graphql } from "gatsby";

interface ComponentProps {
  description: string;
  title: string;
  children?: any;
  thumbnail?: string;
}

const Seo = ({ description, title, children, thumbnail }: ComponentProps) => {
  const { site } = useStaticQuery(
    graphql`
      query {
        site {
          siteMetadata {
            title
            description
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

  const seo = {
    title: title || defaultTitle,
    description: description || metaDescription,
    thumbnail
  };

  return (
    <>
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:type" content="website" />
      {seo.thumbnail && <meta property="og:image" content={seo.thumbnail} />}
      <meta property="og:site_name" content={site.siteMetadata.title} />
      <meta name="twitter:card" content="summary" />
      <meta
        name="twitter:creator"
        content={site.siteMetadata?.social?.twitter || ``}
      />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={metaDescription} />
      {children}
      <meta
        name="google-site-verification"
        content="iP6AmcpYft1WcrX_A3DlYxkWH2bwT-mrYanTBB8vm4k"
      />
    </>
  );
};

export default Seo;
