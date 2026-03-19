import Layout from "../components/Layout";
import Seo from "../components/seo";
import React from "react";

export default function AboutMePage({ location }: any) {
  return (
    <Layout location={location}>
      <div className="about-me-container">
        <h3>@조성훈</h3>
        <p>
          물리천문학과와 소프트웨어학과에서 공부했고,{" "}
          <b>웹 프론트엔드 엔지니어</b>로 일하고 있습니다.
        </p>
        <p>
          복잡한 현상 또는 문제를 제 방식으로 이해하고 쉬운 언어로 풀어내
          설명하기를 좋아합니다. 여기에는 그 중 일부를 꺼내둡니다.
        </p>
        <p>
          공유하고 함께 성장하는 개발자들 문화가 좋아서 개발을 시작했습니다.
          요즘은 웹이라는 생태계가 좋고, 특히 그 안에서 보통의 웹보다 약간
          새로운 경험을 만드는게 재밌습니다.
        </p>
        <h4>Why I Work</h4>
        <p>
          기술로 문제를 해결하고 사용자에게 닿는 경험을 만드는 일에서 즐거움을
          느낍니다.
        </p>
        <p>
          조직의 목표를 먼저 이해하려 합니다. Why를 온전히 이해하고 나면 어떤
          일을 어떻게 할지 자연스럽게 결정할 수 있다고 느낍니다.
        </p>
        <p>
          모든 경험은 자산이 된다고 생각합니다. 시도하고 경험하며 배우는 것을
          좋아합니다.
        </p>
        <h4>How I Work</h4>
        <p>
          초기 스타트업에서 일하며 제품의 전 과정에 참여하고 있습니다. 지금 하는
          일이 조직에게 어떤 의미인지 항상 생각하게 됐습니다. 팀의 목표를 이루기
          위해 제안하고 조율합니다.
        </p>
        <p>
          자주 검증합니다. 작게 핵심 위주로 실험하고, 짧은 피드백 루프를
          만듭니다.
          <br />
          고객이 원하는 방향이 맞는지, 팀이 생각한 방향과 맞는지, 다른 리스크는
          없는지 확인합니다.
        </p>
        <p>
          테스트 코드나 리팩토링, 문서화 등을 특별하게 생각하지 않습니다. 대신
          일상적인 작업으로 함께 다룹니다.
        </p>
        <p>
          함께 일하기 편한 동료가 되고 싶습니다. 기술적 내용, 어려움과 대안 등을
          그들의 언어로 이야기하고, 문서를 남깁니다.{" "}
          <a href="/winning-as-a-teammate/#동료를-내-편으로-만들어라">
            신뢰 자산
          </a>
          을 먼저 쌓으려 합니다.
        </p>
        <h4>What I Do</h4>
        <p>
          웹에서 새로운 종류의 경험을 만들기 좋아하여
          <a href="/r3f-postprocessing-tonemapping-issue/">
            웹 3D 렌더링
          </a>,{" "}
          <a href="/draggable-and-auto-walking-character-chrome-extension/">
            크롬 확장 프로그램
          </a>
          , <a href="/asset-preload-runtime-caching/">웹 게임 개발</a>
          등을 시도하곤 합니다.
        </p>
        <p>
          요즘은 시스템에 의해 품질과 팀의 의도가 지켜지는 코드베이스를 만드는
          데 관심이 생겨 아키텍처/컨벤션 준수 검사 및 CI 파이프라인,{" "}
          <a href="/customized-feature-sliced-design-architecture-for-my-team/#폴더구조-아키텍처-헌법을-지킬-수-밖에-없게-하기">
            린트 룰
          </a>
          등을 시도하고 있습니다.
          <br />
          지뢰를 밟으면 바로 알 수 있는 시스템이 몇 백, 몇 천 줄 문서보다 더
          강하고 병목을 줄일 수 있음을 느끼고 있습니다.
        </p>
        <p>
          기술 블로그는 기록을 습관으로 만들고자 시작했고 꽤 효과 있는 것
          같습니다. 하다보니 저만의 방식으로 기술이나 경험, 배움을 써두는 것이
          재밌어서 지속적으로 작성하고 있습니다.
        </p>
      </div>
    </Layout>
  );
}

export const Head = () => (
  <Seo title="조성개발실록" description="" children={null} />
);
