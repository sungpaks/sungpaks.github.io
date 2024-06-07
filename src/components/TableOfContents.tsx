import React from "react"
import { graphql } from "gatsby"

interface MarkdownRemark {
  id: String
  TableOfContents: String
}

interface ComponentProps {
  data: MarkdownRemark
}

function TableOfContents({ data }: ComponentProps) {
  return (
    <div className="toc-container">
      this is ToC
      <div>{data.TableOfContents}</div>
    </div>
  )
}

export default TableOfContents

export const pageQuery = graphql`
  query TableOfContentsBySlug($id: String!) {
    markdownRemark(id: { eq: $id }) {
      id
      tableOfContents
    }
  }
`
