import * as React from "react"
import { Link, graphql } from "gatsby"

import Layout from "../components/layout"

const TagPost = ({ pageContext, data, location }) => {
  const { tags } = pageContext

  return (
    <Layout>
      <p>wow</p>
      <div>{tags.map(tag => tag)}</div>
    </Layout>
  )
}

export default TagPost

export const pageQuery = graphql`
  {
    site {
      siteMetadata {
        title
      }
    }
    allMarkdownRemark(sort: { frontmatter: { date: DESC } }) {
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
`
