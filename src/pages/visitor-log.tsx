import * as React from "react";
import { Link, graphql } from "gatsby";
import { useState } from "react";
import { useEffect } from "react";
import memoImage from "../images/memo.png";
import Layout from "../components/Layout";
import Seo from "../components/seo";
import { FC } from "react";
import Giscus from "@giscus/react";

interface SiteMetadata {
  title: string;
}

interface Frontmatter {
  date: string;
  title: string;
  description: string;
  tag: string[];
}

interface Fields {
  slug: string;
}

interface MarkdownRemarkNode {
  excerpt: string;
  fields: Fields;
  frontmatter: Frontmatter;
}

interface TagNode {
  fieldValue: string;
  totalCount: number;
}

export interface PageQueryData {
  site: {
    siteMetadata: SiteMetadata;
  };
  allMarkdownRemark: {
    nodes: MarkdownRemarkNode[];
  };
  tags: {
    group: TagNode[];
  };
}

interface ComponentProps {
  data: PageQueryData;
  location: any;
}

const VisitorLog = ({ data, location }: ComponentProps) => {
  const LIGHT = "light";
  const DARK = "dark";
  const KEY_THEME = "theme";
  const REVERSED = "reversed";
  const [curTheme, setCurTheme] = useState(LIGHT);
  useEffect(() => {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      //시스템 설정이 다크임
      setCurTheme(
        window.localStorage.getItem(KEY_THEME) === REVERSED ? LIGHT : DARK
      ); //뒤집혔으면 라이트로 ㄱㄱ
    } else {
      //시스템 설정이 라이트임
      setCurTheme(
        window.localStorage.getItem(KEY_THEME) === REVERSED ? DARK : LIGHT
      ); //뒤집혔으면 다크로 ㄱㄱ
    }
  }, []);

  useEffect(() => {
    const storageListener = (event: StorageEvent) => {
      if (event.key === KEY_THEME) {
        setCurTheme(prev => (prev === DARK ? LIGHT : DARK));
      }
    };
    window.addEventListener("storage", storageListener);
    return () => {
      window.removeEventListener("storage", storageListener);
    };
  }, []);

  return (
    <Layout location={location}>
      <div className="bio">
        <p>
          <br />
          <p style={{ textAlign: "center" }}>
            <img src={memoImage} alt="메모.." width="100px" height="auto" />
            방명록 쓰실래요?
          </p>
        </p>
      </div>
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
        theme={curTheme}
        lang="ko"
        crossorigin="anonymous"
        async
      ></Giscus>
    </Layout>
  );
};

export default VisitorLog;

/**
 * Head export to define metadata for the page
 *
 * See: https://www.gatsbyjs.com/docs/reference/built-in-components/gatsby-head/
 */
export const Head = () => (
  <Seo title="visitors log" description="" children={null} />
);
