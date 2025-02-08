import { Canvas } from "@react-three/fiber";
import Layout from "../components/Layout";
import Seo from "../components/seo";
import React from "react";

export default function AboutMePage({ location }: any) {
  return (
    <Layout location={location}>
      <div></div>
    </Layout>
  );
}

export const Head = () => (
  <Seo title="조성개발실록" description="" children={null} />
);
