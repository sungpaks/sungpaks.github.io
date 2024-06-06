/**
 * Implement Gatsby's SSR (Server Side Rendering) APIs in this file.
 *
 * See: https://www.gatsbyjs.com/docs/reference/config-files/gatsby-ssr/
 */
const React = require("react")

/**
 * @type {import('gatsby').GatsbySSR['onRenderBody']}
 */
exports.onRenderBody = ({ setHtmlAttributes, setPreBodyComponents }) => {
  const script = `
    const theme = localStorage.getItem("theme");
    if (!theme || theme === "original") {
      document.body.classList.remove("theme-reverse")
    } else {
      document.body.classList.add("theme-reverse")
    }
  `
  setHtmlAttributes({ lang: `en` })
  setPreBodyComponents(<script dangerouslySetInnerHTML={{ __html: script }} />)
}
