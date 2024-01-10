import * as React from "react"
import Layout from "../components/layout"
import { Link, graphql } from "gatsby"

const TagPage = ({ data, location }) => {
  const siteTitle = data.site.siteMetadata?.title || `Title`
  const posts = data.allMarkdownRemark.nodes

  return (
    <Layout>
      <div style={{ marginTop: "100px", marginBottom: "100px" }}>
        <h2 style={{ paddingBottom: "10px", paddingTop: "50px" }}>
          🏷️ All Tags
          <hr></hr>
        </h2>
        {data.tags.group.map(t => {
          const buttonScaleStyle = {
            transform: `scale(${1 + (t.totalCount - 1) / 10})`,
          }
          return (
            <Link
              key={t.fieldValue}
              className="custom-button tag-button"
              style={buttonScaleStyle}
              to="/tag" //"/tag/" + t.fieldValue}
            >
              {t.fieldValue} ({t.totalCount})
            </Link>
          )
        })}
      </div>
    </Layout>
  )
}

export default TagPage

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
