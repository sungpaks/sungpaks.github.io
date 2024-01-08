import * as React from "react"
import { useStaticQuery, graphql } from "gatsby"
import { Link } from "gatsby"

function TopUI({ setCurTag }) {
  return (
    <div className="top-ui">
      <h4 className="top-ui-title" style={{ marginTop: 20 }}>
        <Link to="/" onClick={() => setCurTag("ALL")}>
          👍 성훈 블로그
        </Link>
      </h4>
      <h6 className="top-ui-tag">
        <Link to="/">Tag</Link>
      </h6>
    </div>
  )
}

export default TopUI
