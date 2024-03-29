import * as React from "react"
import { Link, graphql } from "gatsby"

import Bio from "../components/bio"
import Layout from "../components/layout"
import Seo from "../components/seo"
import Giscus from "@giscus/react"
import kebabCase from "lodash.kebabcase"

interface Frontmatter {
  title: string
  date: string
  description?: string
  tag?: string[]
}

interface MarkdownRemark {
  id: string
  excerpt: string
  html: string
  frontmatter: Frontmatter
}

interface BlogPostBySlugQuery {
  site: {
    siteMetadata: {
      title: string
    }
  }
  markdownRemark: MarkdownRemark
  previous?: {
    fields: {
      slug: string
    }
    frontmatter: {
      title: string
    }
  }
  next?: {
    fields: {
      slug: string
    }
    frontmatter: {
      title: string
    }
  }
}

interface ComponentProps {
  data: BlogPostBySlugQuery
  location: any
}

const BlogPostTemplate = ({
  data: { previous, next, site, markdownRemark: post },
  location,
}: ComponentProps) => {
  const siteTitle = site.siteMetadata?.title || `Title`

  return (
    <Layout location={location} setCurTag={undefined}>
      <article
        className="blog-post"
        itemScope
        itemType="http://schema.org/Article"
      >
        <header>
          <h1 itemProp="headline">{post.frontmatter.title}</h1>
          {post.frontmatter.tag?.map(t => {
            return (
              <Link
                className="custom-button tag-button"
                to={`/tag/${kebabCase(t)}`}
              >
                {t}
              </Link>
            )
          })}
          <p>{post.frontmatter.date}</p>
        </header>
        <hr />
        <br />
        <section
          dangerouslySetInnerHTML={{ __html: post.html }}
          itemProp="articleBody"
        />
        <hr />
      </article>
      <nav className="blog-post-nav">
        <ul
          style={{
            display: `flex`,
            flexWrap: `wrap`,
            justifyContent: `space-between`,
            listStyle: `none`,
            padding: 0,
          }}
        >
          <li>
            {previous && (
              <Link to={previous.fields.slug} rel="prev">
                ← {previous.frontmatter.title}
              </Link>
            )}
          </li>
          <li>
            {next && (
              <Link to={next.fields.slug} rel="next">
                {next.frontmatter.title} →
              </Link>
            )}
          </li>
        </ul>
      </nav>
      <Giscus
        src="https://giscus.app/client.js"
        repo="sungpaks/blog-comments"
        repoId="R_kgDOLARSPg"
        category="Announcements"
        categoryId="DIC_kwDOLARSPs4CcKJh"
        mapping="pathname"
        strict="0"
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="top"
        theme="preferred_color_scheme"
        lang="ko"
        crossorigin="anonymous"
        async
      ></Giscus>
    </Layout>
  )
}

export const Head = ({ data: { markdownRemark: post } }: any) => {
  return (
    <Seo
      title={post.frontmatter.title}
      description={post.frontmatter.description || post.excerpt}
    />
  )
}

export default BlogPostTemplate

export const pageQuery = graphql`
  query BlogPostBySlug(
    $id: String!
    $previousPostId: String
    $nextPostId: String
  ) {
    site {
      siteMetadata {
        title
      }
    }
    markdownRemark(id: { eq: $id }) {
      id
      excerpt(pruneLength: 160)
      html
      frontmatter {
        title
        date(formatString: "MMMM DD, YYYY")
        description
        tag
      }
    }
    previous: markdownRemark(id: { eq: $previousPostId }) {
      fields {
        slug
      }
      frontmatter {
        title
      }
    }
    next: markdownRemark(id: { eq: $nextPostId }) {
      fields {
        slug
      }
      frontmatter {
        title
      }
    }
  }
`
