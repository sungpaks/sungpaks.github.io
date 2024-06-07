import * as React from "react"
import { FC } from "react"
import Layout from "../components/Layout"
import { Link, graphql } from "gatsby"
import kebabCase from "lodash.kebabcase"
import { PageQueryData } from "."

interface ComponentProps {
  data: PageQueryData
  location: any
}

const TagPage = ({ data, location }: ComponentProps) => {
  const siteTitle = data.site.siteMetadata?.title || `Title`
  const posts = data.allMarkdownRemark.nodes

  return (
    <Layout location={location} setCurTag={undefined}>
      <div style={{ marginTop: "100px", marginBottom: "100px" }}>
        <h2 style={{ paddingBottom: "10px", paddingTop: "50px" }}>
          🏷️ All Tags
          <hr></hr>
        </h2>
        <div className="tag-button-container">
          {data.tags.group.map(t => {
            const buttonScaleStyle = {
              transform: `scale(${1 + (t.totalCount - 1) / 10})`,
              marginRight: `calc(5px + ${t.totalCount * 5}px)`,
              marginLeft: `calc(5px + ${t.totalCount * 5}px)`,
            }
            return (
              <Link
                key={t.fieldValue}
                className="custom-button tag-button"
                style={buttonScaleStyle}
                to={`/tag/${kebabCase(t.fieldValue)}`}
              >
                {t.fieldValue} ({t.totalCount})
              </Link>
            )
          })}
        </div>
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
