import React, { useEffect } from "react"
import { useStaticQuery, graphql } from "gatsby"

interface ComponentProps {
  tableOfContents: string
}

function TableOfContents({ tableOfContents }: ComponentProps) {
  useEffect(() => {
    const tableOfContentsDiv = document.getElementById("table-of-contents")
    if (tableOfContentsDiv?.children.length) {
      for (let i = 0; i < tableOfContentsDiv?.children.length; i++) {
        const curChild = tableOfContentsDiv.children[i]
        console.info(curChild)

        if (curChild.clientTop == 0) console.log("client top!")
        if (curChild.scrollTop == 0) console.log("scroll top!")
      }
    }
  }, [])
  return (
    <div className="toc-container">
      <div
        id="table-of-contents"
        className="toc"
        dangerouslySetInnerHTML={{ __html: tableOfContents }}
      />
    </div>
  )
}

export default TableOfContents
