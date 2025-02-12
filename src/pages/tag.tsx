import * as React from "react";
import Layout from "../components/Layout";
import { Link, graphql, navigate } from "gatsby";
import kebabCase from "lodash.kebabcase";
import { PageQueryData } from ".";
import { IconSortAscending, IconSortDescending } from "@tabler/icons-react";
import { AnimateSharedLayout, motion } from "framer-motion";

interface ComponentProps {
  data: PageQueryData;
  location: any;
}

const TagPage = ({ data, location }: ComponentProps) => {
  const siteTitle = data.site.siteMetadata?.title || `Title`;
  const posts = data.allMarkdownRemark.nodes;
  const [isDirectionColumn, setIsDirectionColumn] = React.useState(true);

  return (
    <Layout location={location} setCurTag={undefined}>
      <div>
        <div className="tag-title-container">
          <h2>🏷️ All Tags </h2>
          <div
            style={{ cursor: "pointer" }}
            onClick={() => setIsDirectionColumn(prev => !prev)}
          >
            {isDirectionColumn ? (
              <IconSortAscending size={36} />
            ) : (
              <IconSortDescending size={36} />
            )}
          </div>
        </div>
        <hr />
        {/* <AnimateSharedLayout> */}
        <motion.div
          layout
          className="tag-button-container"
          style={{ flexDirection: isDirectionColumn ? "column" : "row" }}
        >
          {data.tags.group
            .sort((a, b) => b.totalCount - a.totalCount)
            .map(t => {
              if (t.fieldValue === "TIL") return;
              const buttonStyle: React.CSSProperties = {
                width: `calc(100px + ${t.totalCount * 2}%)`
              };
              return (
                <motion.div
                  key={t.fieldValue}
                  layout
                  className="custom-button tag-button"
                  style={buttonStyle}
                  onClick={() => navigate(`/tag/${kebabCase(t.fieldValue)}`)}
                >
                  {t.fieldValue} ({t.totalCount})
                </motion.div>
              );
            })}
        </motion.div>
        {/* </AnimateSharedLayout> */}
      </div>
    </Layout>
  );
};

export default TagPage;

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
`;
