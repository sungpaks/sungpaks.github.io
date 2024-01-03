import * as React from "react"
import { useStaticQuery, graphql } from "gatsby"
import { Link } from "gatsby"

function TopUI() {
  return (
    <div className="top-ui">
      <h2>
        <Link to="/">성훈 블로그</Link>
      </h2>
    </div>
  )
}

export default TopUI
