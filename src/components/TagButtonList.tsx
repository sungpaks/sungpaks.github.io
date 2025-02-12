import React from "react";
import { MarkdownRemarkNode } from "../types/common";

export default function TagButtonList({
  post,
  onClickTag
}: {
  post: MarkdownRemarkNode;
  onClickTag: (tag: string) => void;
}) {
  return (
    <>
      {post.frontmatter.tag?.map(c => {
        return (
          <button
            key={c}
            id={c}
            className="custom-button tag-button"
            onClick={() => onClickTag(c)}
          >
            {c}
          </button>
        );
      })}
    </>
  );
}
