import * as React from "react";
import { graphql } from "gatsby";

import Layout from "../components/Layout";
import Seo from "../components/seo";

const NotFoundPage = ({ data, location }) => {
  const siteTitle = data.site.siteMetadata.title;

  return (
    <Layout location={location} title={siteTitle}>
      <h1>404: Not Found</h1>
      <p>You just hit a route that doesn&#39;t exist... the sadness.</p>
    </Layout>
  );
};

export const Head = () => (
  <Seo
    title="404: Not Found"
    description="존재하지 않는 페이지입니다."
    pathname="/404/"
    noindex
  />
);

export default NotFoundPage;

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
      }
    }
  }
`;
