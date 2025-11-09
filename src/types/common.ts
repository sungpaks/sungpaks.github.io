export interface SiteMetadata {
  title: string;
}

export interface Frontmatter {
  date: string;
  title: string;
  description: string;
  tag: string[];
  ogImage?: string;
}

export interface Fields {
  slug: string;
}

export interface MarkdownRemarkNode {
  excerpt: string;
  fields: Fields;
  frontmatter: Frontmatter;
}

export interface TagNode {
  fieldValue: string;
  totalCount: number;
}
