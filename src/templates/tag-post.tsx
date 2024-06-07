import * as React from "react"
import { Link, graphql } from "gatsby"

import Layout from "../components/Layout"
import Seo from "../components/seo"
import { FC } from "react"

interface Frontmatter {
  date: string
  title: string
  description: string
  tag: string[]
}

interface MarkdownRemarkNode {
  fields: {
    slug: string
  }
  frontmatter: Frontmatter
}

interface SiteMetadata {
  title: string
}

interface PageQueryData {
  site: {
    siteMetadata: SiteMetadata
  }
  allMarkdownRemark: {
    nodes: MarkdownRemarkNode[]
  }
}

interface ComponentProps {
  pageContext: {
    tags: string
  }
  data: PageQueryData
  location: any
}

const TagPost = ({ pageContext, data, location }: ComponentProps) => {
  const { tags } = pageContext
  const posts = data.allMarkdownRemark.nodes
  const tagHeader = "All Tags"
  return (
    <Layout location={location}>
      <Seo title={tagHeader} description={tags} />
      <div style={{ marginTop: "100px", marginBottom: "100px" }}>
        <h2 style={{ paddingBottom: "10px", paddingTop: "50px" }}>
          <span style={{ color: "green" }}>🔍 {tags}</span>
          <span> 관련 게시글</span>
          <hr></hr>
        </h2>
        {posts.map(post => {
          return (
            <div key={post.fields.slug}>
              <h2>
                <Link to={`${post.fields.slug}`}>{post.frontmatter.title}</Link>
              </h2>
              <p>{post.frontmatter.description}</p>
            </div>
          )
        })}
      </div>
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
