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

interface quoteType {
  author: string | null
  content: string
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

  const quote: quoteType[] = [
    {
      author: `괴테`,
      content: `시작하라. 그 자체가 천재성이고 힘이며, 마력이다.`,
    },
    {
      author: `중용`,
      content: `남이 한 번에 능하거든 나는 백 번을 하고,
    남이 열 번에 능하거든 나는 천 번을 한다.`,
    },
    { author: `미상`, content: `아침에는 꿈을 적고 밤에는 과거를 적어라.` },
    {
      author: `윌 듀란트`,
      content: `과거를 기록하지 않는 사람은 미래를 쓸 수 없다.`,
    },
    {
      author: `칼 세이건`,
      content: `우리는 기록을 통해 미래를 예측하고, 미래를 통해 기록을 이해한다.`,
    },
  ]

  // Set these values by editing "siteMetadata" in gatsby-config.js
  const author: authorType = data.site.siteMetadata?.author
  //const social = data.site.siteMetadata?.social

  const randomIndex: number = Math.floor(Math.random() * quote.length)
  const randomQuote: quoteType = quote[randomIndex]
  return (
    <div>
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
              <strong>{author.name}</strong> 이라고 합니다.
              <br />
              {author?.summary || null}
            </p>
          )}
        </div>
      </div>
      {/*<div className="bio-quote">
        <p>{randomQuote.content}</p>
        <p style={{ fontSize: "0.8rem", textAlign: "right" }}>
          - {randomQuote.author}
        </p>
      </div>*/}
    </div>
  )
}

export default Bio
