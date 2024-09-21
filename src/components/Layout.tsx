import * as React from "react";
import TopUI from "./TopUI";
import { FC } from "react";
import { useState } from "react";

interface ComponentProps {
  location: any;
  children: any | undefined;
  setCurTag?(value: string): void;
}

const Layout = ({ location, children, setCurTag }: ComponentProps) => {
  const rootPath = "/"; //`${__PATH_PREFIX__}/`
  const isRootPath = location?.pathname === rootPath;

  return (
    <div>
      <TopUI setCurTag={setCurTag} />
      <div className="global-wrapper" data-is-root-path={isRootPath}>
        <header className="global-header">{}</header>
        <main>{children}</main>
        <footer>
          © {new Date().getFullYear()}, Built with
          {` `}
          <a href="https://www.gatsbyjs.com">Gatsby</a>
        </footer>
      </div>
    </div>
  );
};

export default Layout;
