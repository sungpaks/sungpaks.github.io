import * as React from "react";
import { FC } from "react";
import { useStaticQuery, graphql } from "gatsby";
import { Link } from "gatsby";
import { useEffect, useState } from "react";
import { CommentIcon, DarkIcon, TagIcon, ThemeIcon } from "./Icons";
import {
  IconMessageUser,
  IconMoon,
  IconSun,
  IconSunMoon,
  IconTags
} from "@tabler/icons-react";

interface ComponentProps {
  setCurTag?(value: string): void;
}

const STROKE = 1.5;

function TopUI({ setCurTag }: ComponentProps) {
  const [scrollPercent, setScrollPercent] = useState(0);
  const ORIGINAL = "original";
  const REVERSED = "reversed";
  const THEME_REVERSE = "theme-reverse";
  const KEY_THEME = "theme";
  const [preferDark, setPreferedDark] = useState(false);
  const LIGHT_MODE = <IconMoon stroke={STROKE} />;
  const DARK_MODE = <IconSun stroke={STROKE} />;
  const [curMode, setCurMode] = useState(<IconSunMoon stroke={STROKE} />);

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll: number = document.documentElement.scrollTop;
      const totalScroll: number =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;
      setScrollPercent((currentScroll * 100) / totalScroll);
    };
    document.addEventListener("scroll", handleScroll);
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setPreferedDark(true);
    }
    setCurMode(
      preferDark
        ? localStorage.getItem(KEY_THEME) === REVERSED
          ? LIGHT_MODE
          : DARK_MODE
        : localStorage.getItem(KEY_THEME) === REVERSED
        ? DARK_MODE
        : LIGHT_MODE
    );
    return () => {
      document.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="top-ui-container">
      <div className="top-ui">
        <h5 className="top-ui-title">
          <Link
            to="/"
            onClick={() => {
              if (setCurTag) setCurTag("ALL");
            }}
          >
            조성개발실록
          </Link>
        </h5>
        <div className="top-ui-tag-container">
          <div className="top-ui-tag">
            <div className="tooltip">
              <a
                id="light-or-dark"
                onClick={() => {
                  const theme = localStorage.getItem(KEY_THEME);
                  if (!theme || theme === ORIGINAL) {
                    document.body.classList.add(THEME_REVERSE);
                    localStorage.setItem(KEY_THEME, REVERSED);
                  } else {
                    document.body.classList.remove(THEME_REVERSE);
                    localStorage.setItem(KEY_THEME, ORIGINAL);
                  }
                  window.dispatchEvent(
                    new StorageEvent("storage", { key: KEY_THEME })
                  );
                  setCurMode(
                    preferDark
                      ? localStorage.getItem(KEY_THEME) === REVERSED
                        ? DARK_MODE
                        : LIGHT_MODE
                      : localStorage.getItem(KEY_THEME) === REVERSED
                      ? LIGHT_MODE
                      : DARK_MODE
                  );
                }}
              >
                {curMode}
              </a>
              <div className="tooltip-text">테마 변경</div>
            </div>
          </div>
          <div className="top-ui-tag" style={{ margin: "0 0 0 0" }}>
            <div className="tooltip">
              <Link to="/tag">
                <IconTags stroke={STROKE} />
              </Link>
              <div className="tooltip-text">태그</div>
            </div>
          </div>
          <div className="top-ui-tag">
            <div className="tooltip">
              <Link to="/visitor-log">
                <IconMessageUser stroke={STROKE} />
              </Link>
              <div className="tooltip-text">방명록</div>
            </div>
          </div>
        </div>
      </div>

      <div
        className="progress-bar"
        style={{ width: `${scrollPercent}%` }}
      ></div>
    </div>
  );
}

export default TopUI;
