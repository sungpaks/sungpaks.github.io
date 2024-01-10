import * as React from "react"
import { Link, graphql } from "gatsby"

import Layout from "../components/layout"
import Seo from "../components/seo"

const TagPost = ({ pageContext, data, location }) => {
  const { tags } = pageContext
  const posts = data.allMarkdownRemark.nodes
  const tagHeader = "All Tags"
  console.log(data)
  return (
    <Layout>
      <Seo title={tagHeader} />
      <span style={{ color: "green" }}>{tags}</span>
      <span> 관련 게시글</span>
      {posts.map(post => {
        return (
          <div style={{ marginTop: "100px" }}>
            <h2>
              <Link to={`${post.fields.slug}`}>{post.frontmatter.title}</Link>
            </h2>
            <p>{post.frontmatter.description}</p>
          </div>
        )
      })}
    </Layout>
  )
}

export default TagPost

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
`
