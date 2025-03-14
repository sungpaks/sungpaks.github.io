import React from "react";
import { Link, graphql, navigate } from "gatsby";
import { useState } from "react";
import { useEffect } from "react";
import Bio from "../components/Bio";
import Layout from "../components/Layout";
import Seo from "../components/seo";
import Tab from "../components/Tab";
import { SiteMetadata, MarkdownRemarkNode, TagNode } from "../types/common";
import TagButton from "../components/TagButtonList";

export interface PageQueryData {
  site: {
    siteMetadata: SiteMetadata;
  };
  allMarkdownRemark: {
    nodes: MarkdownRemarkNode[];
  };
  tags: {
    group: TagNode[];
  };
}

interface ComponentProps {
  data: PageQueryData;
  location: any;
}

const BlogIndex = ({ data, location }: ComponentProps) => {
  const posts = data.allMarkdownRemark.nodes;
  const [curTag, setCurTag] = useState<string>("ALL");
  const [curPostList, setCurPostList] = useState<MarkdownRemarkNode[]>(posts);
  const [curTab, setCurTab] = useState<Number>(0);

  useEffect(() => {
    if (curTag === "ALL") {
      setCurPostList([...posts]);
    } else {
      setCurPostList([
        ...posts.filter(p => p.frontmatter.tag.includes(curTag))
      ]);
    }
    const tagButtons = document.getElementsByClassName("tag-button");
    for (let i = 0; i < tagButtons.length; i++) {
      if (curTag !== "ALL" && tagButtons[i].id === curTag) {
        tagButtons[i].classList.add("pressed");
      } else {
        tagButtons[i].classList.remove("pressed");
      }
    }
  }, [curTag]);

  if (posts.length === 0) {
    return (
      <Layout location={location} setCurTag={setCurTag}>
        <Bio />
        <p>
          No blog posts found. Add markdown posts to "content/blog" (or the
          directory you specified for the "gatsby-source-filesystem" plugin in
          gatsby-config.js).
        </p>
      </Layout>
    );
  }

  return (
    <Layout location={location} setCurTag={setCurTag}>
      <Bio />
      <Tab amount={curPostList.length} curTab={0} />
      <ol style={{ listStyle: `none` }}>
        {curPostList.map(post => {
          const title = post.frontmatter.title || post.fields.slug;
          /*const categories = [
            { fieldValue: ALL_NAME, totalCount: allPosts.length },
            ...data.categories.group,
          ]*/

          return (
            <li key={post.fields.slug}>
              <article
                className="post-list-item"
                itemScope
                itemType="http://schema.org/Article"
              >
                <header>
                  <h2>
                    <Link to={post.fields.slug} itemProp="url">
                      <span
                        itemProp="headline"
                        className="post-list-item-title"
                      >
                        {title}
                      </span>
                    </Link>
                  </h2>
                </header>
                <TagButton
                  post={post}
                  onClickTag={c => {
                    setCurTag(c === curTag ? "ALL" : c);
                    if (c === curTag) {
                    }
                  }}
                />
                <section>
                  <p
                    dangerouslySetInnerHTML={{
                      __html: post.frontmatter.description || post.excerpt
                    }}
                    itemProp="description"
                  />
                </section>
                <small>{post.frontmatter.date}</small>
              </article>
            </li>
          );
        })}
      </ol>
      <hr className="hr-dotted" />
    </Layout>
  );
};

export default BlogIndex;

/**
 * Head export to define metadata for the page
 *
 * See: https://www.gatsbyjs.com/docs/reference/built-in-components/gatsby-head/
 */
export const Head = () => (
  <Seo title="조성개발실록" description="" children={null} />
);

export const pageQuery = graphql`
  {
    site {
      siteMetadata {
        title
      }
    }
    allMarkdownRemark(
      sort: { frontmatter: { date: DESC } }
      filter: { frontmatter: { tag: { ne: "TIL" } } }
    ) {
      nodes {
        excerpt
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

    tags: allMarkdownRemark(limit: 2000) {
      group(field: frontmatter___tag) {
        fieldValue
        totalCount
      }
    }
  }
`;
