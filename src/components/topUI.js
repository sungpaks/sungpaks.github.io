import * as React from "react"
import { useStaticQuery, graphql } from "gatsby"
import { Link } from "gatsby"

function TopUI({ setCurCategory }) {
  return (
    <div className="top-ui">
      <h4 className="top-ui-title" style={{ marginTop: 20 }}>
        <Link to="/" onClick={() => setCurCategory("ALL")}>
          👍 성훈 블로그
        </Link>
      </h4>
    </div>
  )
}

export default TopUI
