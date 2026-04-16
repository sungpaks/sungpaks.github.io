import React from "react";
import HouseViewerRepro from "../components/HouseViewer";
import Seo from "../components/seo";

export default function PostprocessingDemo() {
  return <HouseViewerRepro />;
}

export const Head = () => (
  <Seo
    title="Postprocessing 데모"
    description="Postprocessing 재현용 데모 페이지입니다."
    pathname="/postprocessing-demo/"
    noindex
  />
);
