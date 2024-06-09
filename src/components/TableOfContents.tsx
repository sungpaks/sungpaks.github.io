import React, { useEffect, useState } from "react"
import { useStaticQuery, graphql } from "gatsby"

interface ComponentProps {
  tableOfContents: string
}

function TableOfContents({ tableOfContents }: ComponentProps) {
  const [isWide, setIsWide] = useState<boolean | undefined>(true)
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
          a.classList.add("activated")
        }
      })
    })
  }, [])

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 85rem)")
    if (mediaQuery.matches) setIsWide(false)
    mediaQuery.addEventListener("change", event => {
      if (event.matches) {
        setIsWide(false)
      } else {
        setIsWide(true)
      }
    })
  }, [])
  return isWide ? (
    <aside className="toc-container">
      <div
        id="table-of-contents"
        className="toc"
        dangerouslySetInnerHTML={{ __html: tableOfContents }}
      />
    </aside>
  ) : (
    <details open>
      <summary className="x-large">목차</summary>
      <div
        id="table-of-contents"
        className="toc"
        dangerouslySetInnerHTML={{ __html: tableOfContents }}
      />
    </details>
  )
}

export default TableOfContents
