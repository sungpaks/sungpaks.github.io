import * as React from "react"
import { Link, graphql } from "gatsby"
import { useState } from "react"
import { useEffect } from "react"
import Bio from "../components/bio"
import Layout from "../components/layout"
import Seo from "../components/seo"

const BlogIndex = ({ data, location }) => {
  const siteTitle = data.site.siteMetadata?.title || `Title`
  const posts = data.allMarkdownRemark.nodes
  const [curCategory, setCurCategory] = useState("ALL")
  const [curPostList, setCurPostList] = useState(posts)
  useEffect(() => {
    if (curCategory === "ALL") {
      setCurPostList([...posts])
    } else {
      setCurPostList([
        ...posts.filter(p => p.frontmatter.category.includes(curCategory)),
      ])
    }
  }, [curCategory])

  if (posts.length === 0) {
    return (
      <Layout location={location} title={siteTitle}>
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
    <Layout
      location={location}
      title={siteTitle}
      setCurCategory={setCurCategory}
    >
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
                {post.frontmatter.category?.map(c => {
                  return (
                    <button
                      class="custom-button category-button"
                      onClick={() => {
                        setCurCategory(c === curCategory ? "ALL" : c)
                      }}
                      style={{
                        top: c === curCategory ? "2px" : 0,
                        color: c === curCategory ? "darkgray" : "black",
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
export const Head = () => <Seo title="All posts" />

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
          category
        }
      }
    }

    categories: allMarkdownRemark(limit: 2000) {
      group(field: frontmatter___category) {
        fieldValue
        totalCount
      }
    }
  }
`
