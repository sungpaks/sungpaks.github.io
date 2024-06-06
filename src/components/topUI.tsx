import * as React from "react"
import { FC } from "react"
import { useStaticQuery, graphql } from "gatsby"
import { Link } from "gatsby"
import { useEffect, useState } from "react"

interface ComponentProps {
  setCurTag?(value: string): void
}

function TopUI({ setCurTag }: ComponentProps) {
  const [scrollPercent, setScrollPercent] = useState(0)
  useEffect(() => {
    document.addEventListener("scroll", () => {
      const currentScroll: number = document.documentElement.scrollTop
      const totalScroll: number =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight
      setScrollPercent((currentScroll * 100) / totalScroll)
    })
  }, [])

  return (
    <div>
      <div className="top-ui">
        <h5 className="top-ui-title" style={{ margin: 0 }}>
          <Link
            to="/"
            onClick={() => {
              if (setCurTag) setCurTag("ALL")
            }}
          >
            👍 조성개발실록
          </Link>
        </h5>
        <div>
          <div className="top-ui-tag" style={{ margin: "0 20px 0 0" }}>
            <Link to="/tag">Tag</Link>
          </div>
          <div className="top-ui-tag">
            <a
              id="light-or-dark"
              onClick={() => {
                const theme = localStorage.getItem("theme")
                if (!theme || theme === "original") {
                  document.body.classList.add("theme-reverse")
                  localStorage.setItem("theme", "reversed")
                } else {
                  document.body.classList.remove("theme-reverse")
                  localStorage.setItem("theme", "original")
                }
              }}
            >
              ?
            </a>
          </div>
        </div>
      </div>
      <div
        className="progress-bar"
        style={{ width: `${scrollPercent}%` }}
      ></div>
    </div>
  )
}

export default TopUI
