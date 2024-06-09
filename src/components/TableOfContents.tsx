import React, { useEffect } from "react"
import { useStaticQuery, graphql } from "gatsby"

interface ComponentProps {
  tableOfContents: string
}

function TableOfContents({ tableOfContents }: ComponentProps) {
  useEffect(() => {
    const postSection = document.getElementById("post-section")
    if (!postSection) return
    const headers = postSection.querySelectorAll("h1, h2, h3, h4, h5, h6")
    if (!headers) return

    document.addEventListener("scroll", () => {
      const overTheTop: Element[] = []
      headers.forEach(h => {
        if (h.getBoundingClientRect().top < 0) {
          overTheTop.push(h)
        }
      })
      const curHeaderText = overTheTop.pop()?.textContent
      const aTags = document
        .getElementById("table-of-contents")
        ?.querySelectorAll("a")
      aTags?.forEach(a => {
        a.classList.remove("activated")
        if (a.textContent === curHeaderText) {
          console.info(a)
          a.classList.add("activated")
        }
      })
    })
  }, [])
  return (
    <aside className="toc-container">
      <div
        id="table-of-contents"
        className="toc"
        dangerouslySetInnerHTML={{ __html: tableOfContents }}
      />
    </aside>
  )
}

export default TableOfContents
