import React from "react"
import { useStaticQuery, graphql } from "gatsby"

interface ComponentProps {
  tableOfContents: string
}

function TableOfContents({ tableOfContents }: ComponentProps) {
  return (
    <div className="toc-container">
      <h4>목차</h4>
      <div
        className="toc"
        dangerouslySetInnerHTML={{ __html: tableOfContents }}
      />
    </div>
  )
}

export default TableOfContents
