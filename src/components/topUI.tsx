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
  document.addEventListener("scroll", () => {
    const currentScroll: number = document.documentElement.scrollTop
    const totalScroll: number =
      document.documentElement.scrollHeight -
      document.documentElement.clientHeight
    setScrollPercent(Math.round((currentScroll * 100) / totalScroll))
  })
  //useEffect(() => {}, [document.documentElement.scroll])

  return (
    <div>
      <div className="top-ui">
        <h4 className="top-ui-title" style={{ margin: 0 }}>
          <Link
            to="/"
            onClick={() => {
              if (setCurTag) setCurTag("ALL")
            }}
          >
            👍 성훈 블로그
          </Link>
        </h4>
        <h6 className="top-ui-tag" style={{ margin: "0 20px 0 0" }}>
          <Link to="/tag">Tag</Link>
        </h6>
      </div>
      <div
        className="progress-bar"
        style={{ width: `${scrollPercent}%` }}
      ></div>
    </div>
  )
}

export default TopUI
