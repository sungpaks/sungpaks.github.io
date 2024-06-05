import * as React from "react"
import { Link, graphql } from "gatsby"
import { useState } from "react"
import { useEffect } from "react"
import Bio from "../components/bio"
import Layout from "../components/layout"
import Seo from "../components/seo"
import { FC } from "react"

interface SiteMetadata {
  title: string
}

interface Frontmatter {
  date: string
  title: string
  description: string
  tag: string[]
}

interface Fields {
  slug: string
}

interface MarkdownRemarkNode {
  excerpt: string
  fields: Fields
  frontmatter: Frontmatter
}

interface TagNode {
  fieldValue: string
  totalCount: number
}

export interface PageQueryData {
  site: {
    siteMetadata: SiteMetadata
  }
  allMarkdownRemark: {
    nodes: MarkdownRemarkNode[]
  }
  tags: {
    group: TagNode[]
  }
}

interface ComponentProps {
  data: PageQueryData
  location: any
}

const BlogIndex = ({ data, location }: ComponentProps) => {
  const siteTitle = data.site.siteMetadata?.title || `Title`
  const posts = data.allMarkdownRemark.nodes
  const [curTag, setCurTag] = useState<string>("ALL")
  const [curPostList, setCurPostList] = useState<MarkdownRemarkNode[]>(posts)

  useEffect(() => {
    if (curTag === "ALL") {
      setCurPostList([...posts])
    } else {
      setCurPostList([...posts.filter(p => p.frontmatter.tag.includes(curTag))])
    }
    const tagButtons = document.getElementsByClassName("tag-button")
    for (let i = 0; i < tagButtons.length; i++) {
      if (curTag !== "ALL" && tagButtons[i].id === curTag) {
        tagButtons[i].classList.add("pressed")
      } else {
        tagButtons[i].classList.remove("pressed")
      }
    }
  }, [curTag])

  if (posts.length === 0) {
    return (
      <Layout location={location} setCurTag={setCurTag}>
        <Bio />
        <p>
          No blog posts found. Add markdown posts to "content/blog" (or the
          directory you specified for the "gatsby-source-filesystem" plugin in
          gatsby-config.js).
        </p>
      </Layout>
    )
  }

  return (
    <Layout location={location} setCurTag={setCurTag}>
      <Bio />
      <hr />
      <ol style={{ listStyle: `none` }}>
        {curPostList.map(post => {
          const title = post.frontmatter.title || post.fields.slug
          /*const categories = [
            { fieldValue: ALL_NAME, totalCount: allPosts.length },
            ...data.categories.group,
          ]*/

          return (
            <li key={post.fields.slug}>
              <article
                className="post-list-item"
                itemScope
                itemType="http://schema.org/Article"
              >
                <header>
                  <h2>
                    <Link to={post.fields.slug} itemProp="url">
                      <span
                        itemProp="headline"
                        className="post-list-item-title"
                      >
                        {title}
                      </span>
                    </Link>
                  </h2>
                </header>
                {post.frontmatter.tag?.map(c => {
                  return (
                    <button
                      key={c}
                      id={c}
                      className="custom-button tag-button"
                      onClick={e => {
                        setCurTag(c === curTag ? "ALL" : c)
                        if (c === curTag) {
                        }
                      }}
                    >
                      {c}
                    </button>
                  )
                })}
                <section>
                  <p
                    dangerouslySetInnerHTML={{
                      __html: post.frontmatter.description || post.excerpt,
                    }}
                    itemProp="description"
                  />
                </section>
                <small>{post.frontmatter.date}</small>
              </article>
            </li>
          )
        })}
      </ol>
      <hr />
    </Layout>
  )
}

export default BlogIndex

/**
 * Head export to define metadata for the page
 *
 * See: https://www.gatsbyjs.com/docs/reference/built-in-components/gatsby-head/
 */
export const Head = () => (
  <Seo title="All posts" description="" children={null} />
)

export const pageQuery = graphql`
  {
    site {
      siteMetadata {
        title
      }
    }
    allMarkdownRemark(sort: { frontmatter: { date: DESC } }) {
      nodes {
        excerpt
        fields {
          slug
        }
        frontmatter {
          date(formatString: "MMMM DD, YYYY")
          title
          description
          tag
        }
      }
    }

    tags: allMarkdownRemark(limit: 2000) {
      group(field: frontmatter___tag) {
        fieldValue
        totalCount
      }
    }
  }
`
