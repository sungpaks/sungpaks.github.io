import * as React from "react";
import { Link, graphql } from "gatsby";

import Layout from "../components/Layout";
import Seo from "../components/seo";
import { FC } from "react";
import TagButton from "../components/TagButtonList";
import kebabCase from "lodash.kebabcase";

interface Frontmatter {
  date: string;
  title: string;
  description: string;
  tag: string[];
}

interface MarkdownRemarkNode {
  fields: {
    slug: string;
  };
  frontmatter: Frontmatter;
}

interface SiteMetadata {
  title: string;
}

interface PageQueryData {
  site: {
    siteMetadata: SiteMetadata;
  };
  allMarkdownRemark: {
    nodes: MarkdownRemarkNode[];
  };
}

interface ComponentProps {
  pageContext: {
    tags: string;
  };
  data: PageQueryData;
  location: any;
}

const TagPost = ({ pageContext, data, location }: ComponentProps) => {
  const { tags } = pageContext;
  const posts = data.allMarkdownRemark.nodes;
  const tagHeader = "조성개발실록 - " + tags + " 관련 게시글";
  return (
    <Layout location={location}>
      <div style={{ marginTop: "100px", marginBottom: "100px" }}>
        <h2 style={{ paddingBottom: "10px", paddingTop: "50px" }}>
          <span>🔍 {tags}</span>
          <span> 관련 게시글</span>
          <hr></hr>
        </h2>
        {posts.map(post => {
          return (
            <article
              key={post.fields.slug}
              className="post-list-item"
              itemScope
              itemType="http://schema.org/Article"
            >
              <h2>
                <Link
                  className="post-list-item-title"
                  to={`${post.fields.slug}`}
                >
                  {post.frontmatter.title}
                </Link>
              </h2>
              <TagButton post={post as any} onClickTag={() => {}} />
              <p>{post.frontmatter.description}</p>
              <small>{post.frontmatter.date}</small>
            </article>
          );
        })}
      </div>
    </Layout>
  );
};

export default TagPost;

export const Head = ({ pageContext }: { pageContext: { tags: string } }) => (
  <Seo
    title={`${pageContext.tags} 관련 게시글`}
    description={`${pageContext.tags} 태그로 분류된 글 목록입니다.`}
    pathname={`/tag/${kebabCase(pageContext.tags)}/`}
    noindex
  />
);

export const pageQuery = graphql`
  query ($tags: String) {
    site {
      siteMetadata {
        title
      }
    }
    allMarkdownRemark(
      sort: { frontmatter: { date: DESC } }
      limit: 2000
      filter: { frontmatter: { tag: { in: [$tags] } } }
    ) {
      nodes {
        fields {
          slug
        }
        frontmatter {
          date(formatString: "MMMM DD, YYYY")
          title
          description
          tag
        }
      }
    }
  }
`;
