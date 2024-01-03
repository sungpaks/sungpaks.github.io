import * as React from "react"
import { useStaticQuery, graphql } from "gatsby"
import { Link } from "gatsby"

function TopUI() {
  return (
    <div className="top-ui">
      <h4 style={{ marginTop: 20 }}>
        <Link to="/">👍 성훈 블로그</Link>
      </h4>
    </div>
  )
}

export default TopUI
