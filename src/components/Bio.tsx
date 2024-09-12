/**
 * Bio component that queries for data
 * with Gatsby's useStaticQuery component
 *
 * See: https://www.gatsbyjs.com/docs/how-to/querying-data/use-static-query/
 */

import * as React from "react"
import { useStaticQuery, graphql } from "gatsby"
import { FC } from "react"
//import { StaticImage } from "gatsby-plugin-image"

interface authorType {
  name: string
  summary: string
}

const Bio = () => {
  const data = useStaticQuery(graphql`
    query BioQuery {
      site {
        siteMetadata {
          author {
            name
            summary
          }
          social {
            twitter
          }
        }
      }
    }
  `)

  // Set these values by editing "siteMetadata" in gatsby-config.js
  const author: authorType = data.site.siteMetadata?.author
  //const social = data.site.siteMetadata?.social

  return (
    <div className="bio">
      {/*{" "}
      <StaticImage
        className="bio-avatar"
        layout="fixed"
        formats={["auto", "webp", "avif"]}
        src="../images/profile-pic.png"
        width={50}
        height={50}
        quality={95}
        alt="Profile picture"
      />
      */}
      <div>
        {author?.name && (
          <p>
            <strong>@{author.name}</strong> 이라고 합니다. 😎
            <br />
            {author?.summary || null}
            <br />
            <br />
            <span className="smaller">배움을 노나먹어요</span>
          </p>
        )}
      </div>
    </div>
  )
}

export default Bio
