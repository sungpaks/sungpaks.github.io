import { Canvas } from "@react-three/fiber";
import Layout from "../components/Layout";
import Seo from "../components/seo";
import React from "react";

export default function AboutMePage({ location }: any) {
  return (
    <Layout location={location}>
      <div>
        <h3>@조성훈</h3>
        <p>
          웹 프론트엔드 개발자입니다.
          <br />
          서로 배우고 함께 성장하는 문화가 좋아 개발자가 되었습니다.
          <br />
          저만의 언어로 기술과 경험을 나누기 좋아하여 블로그를 운영하고
          있습니다.
        </p>
        <p>
          팀의 목표를 이해하며, 팀의 성공을 위해 필요한 일을 함께 정의하고
          해결합니다.
          <br />
          팀에 효과적으로 기여할 수 있는 팀원이 되기 위한 개인적 성장을
          즐깁니다.
        </p>
      </div>
    </Layout>
  );
}

export const Head = () => (
  <Seo title="조성개발실록" description="" children={null} />
);
