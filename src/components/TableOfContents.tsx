import React from "react"
import { useStaticQuery, graphql } from "gatsby"

interface ComponentProps {
  tableOfContents: string
}

function TableOfContents({ tableOfContents }: ComponentProps) {
  return (
    <div className="toc-container">
      this is ToC
      <div
        className="toc"
        dangerouslySetInnerHTML={{ __html: tableOfContents }}
      />
    </div>
  )
}

export default TableOfContents
