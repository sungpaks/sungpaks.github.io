import * as React from "react"
import { useStaticQuery, graphql } from "gatsby"
import { Link } from "gatsby"

function TopUI({ rootPath }) {
  return (
    <div className="top-ui">
      <h4>
        <a href={rootPath}>성훈 블로그</a>
      </h4>
    </div>
  )
}

export default TopUI
