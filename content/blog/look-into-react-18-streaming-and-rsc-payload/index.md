---
title: "React 18 가까이서 보기 : Streaming with Suspense, RSC Payload"
date: 2025-03-04 22:05:25
description: "Suspense와 Streaming은 어떻게 동작하는지, RSC Payload"
tag: ["React", "Next.js"]
---

[저번 글](http://localhost:8000/react-18-concurrency-and-streaming-with-rsc/)에서 React 18에서 무슨 일이 있었는지, 동시성 업데이트를 중심으로 살펴봤는데요  
근데 그냥 "이런게 나왔어요~" 만 하고 넘어갔는데

![흠..](image.png)

말만 해서는 잘 모르곘으니깐 뭐라도 만들어보고 찍어먹어보고 해봅시다  
Next.js 15 App Router로 해볼건데

- 간단하게 서버 컴포넌트를 구현
- 서버 컴포넌트와 Suspense를 함께 사용하여 Streaming
- 클라이언트 컴포넌트는 이제 어떻게 쓰는지
- 클라이언트 컴포넌트와 Suspense를 함께 사용하여 Streaming
- RSC Payload가 어떻게 생겨먹었는지 자세히 들여다보기
- Next.js가 당신의 프로젝트를 두 배 느리게 하는 원인????

머 이런거를 다뤄보겠습니다

[저번 글](http://localhost:8000/react-18-concurrency-and-streaming-with-rsc/)에서 소개한 **React 18 동시성 업데이트**가 뭐였는지 기억이 안 나시거나, 아직 안보셔서 모르신다면 쓱 갔다오시면 좋겠습니다.
