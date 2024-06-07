import * as React from "react"
import { FC } from "react"
import { useStaticQuery, graphql } from "gatsby"
import { Link } from "gatsby"
import { useEffect, useState } from "react"

interface ComponentProps {
  setCurTag?(value: string): void
}

function TopUI({ setCurTag }: ComponentProps) {
  const [scrollPercent, setScrollPercent] = useState(0)
  const ORIGINAL = "original"
  const REVERSED = "reversed"
  const THEME_REVERSE = "theme-reverse"
  const KEY_THEME = "theme"
  const [preferDark, setPreferedDark] = useState(false)
  const LIGHT_MODE = "☀️"
  const DARK_MODE = "🌙"
  const [curMode, setCurMode] = useState("")

  useEffect(() => {
    document.addEventListener("scroll", () => {
      const currentScroll: number = document.documentElement.scrollTop
      const totalScroll: number =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight
      setScrollPercent((currentScroll * 100) / totalScroll)
    })
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setPreferedDark(true)
    }
    setCurMode(
      preferDark
        ? localStorage.getItem(KEY_THEME) === REVERSED
          ? LIGHT_MODE
          : DARK_MODE
        : localStorage.getItem(KEY_THEME) === REVERSED
        ? DARK_MODE
        : LIGHT_MODE
    )
  }, [])

  return (
    <div>
      <div className="top-ui">
        <h5 className="top-ui-title" style={{ margin: 0 }}>
          <Link
            to="/"
            onClick={() => {
              if (setCurTag) setCurTag("ALL")
            }}
          >
            👍 조성개발실록
          </Link>
        </h5>
        <div>
          <div className="top-ui-tag" style={{ margin: "0 20px 0 0" }}>
            <Link to="/tag">Tag</Link>
          </div>
          <div className="top-ui-tag">
            <a
              id="light-or-dark"
              onClick={() => {
                const theme = localStorage.getItem(KEY_THEME)
                if (!theme || theme === ORIGINAL) {
                  document.body.classList.add(THEME_REVERSE)
                  localStorage.setItem(KEY_THEME, REVERSED)
                } else {
                  document.body.classList.remove(THEME_REVERSE)
                  localStorage.setItem(KEY_THEME, ORIGINAL)
                }
                window.dispatchEvent(
                  new StorageEvent("storage", { key: KEY_THEME })
                )
                setCurMode(
                  preferDark
                    ? localStorage.getItem(KEY_THEME) === REVERSED
                      ? LIGHT_MODE
                      : DARK_MODE
                    : localStorage.getItem(KEY_THEME) === REVERSED
                    ? DARK_MODE
                    : LIGHT_MODE
                )
              }}
            >
              {curMode}
            </a>
          </div>
        </div>
      </div>
      <div
        className="progress-bar"
        style={{ width: `${scrollPercent}%` }}
      ></div>
    </div>
  )
}

export default TopUI
