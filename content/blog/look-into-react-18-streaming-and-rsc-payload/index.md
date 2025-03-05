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

# 들어가기 전 세팅 ..

일단 `npx create-next-app@latest` 같은거 실행해서 대충 세팅해서 만듭시다.  
저는 typescript까지 포함해줬어요

그리고 편하게 실험을 해보기 위한 두 가지 유틸함수를 추가할건데

```ts
// sleep.ts
export async function sleep(ms: number) {
  const promise = new Promise<void>(resolve => {
    setTimeout(() => {
      resolve();
    }, ms);
  });

  return promise;
}

// fetchJson.ts
export interface JsonPlaceholder {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
}

export async function fetchJson(num: number) {
  const response = await fetch(
    `https://jsonplaceholder.typicode.com/todos/${num}`,
    { method: "get", cache: "no-store" }
  );
  const data: JsonPlaceholder = await response.json();

  return data;
}
```

하나는 지정한 시간동안 기다리는 함수고요  
하나는 JSON 데이터 fetch를 테스트해볼 수 있는 고마운 사이트의 api로 요청을 날리는 함수입니다

# 서버 컴포넌트를 만들어보기

서버 컴포넌트를 만들어볼텐데요  
Next.js 13 이상 App Router를 사용한다면, 모든 컴포넌트들이 기본적으로 서버 컴포넌트가 됩니다  
서버 컴포넌트를 사용한답시고 컴포넌트 상단에 `'use server'` 지시어를 쓰는건 하지맙시다.  
컴포넌트는 지시어가 없으면 서버 컴포넌트, `'use client'` 지시어가 있으면 클라이언트 컴포넌트고  
`'use server'`는 [서버 함수](https://react.dev/reference/rsc/server-functions)에 사용합니다.  
그리고, 서버 컴포넌트가 뭐가 좋은거지? 에 대해서는 [관련 Next.js 문서](https://nextjs.org/docs/app/building-your-application/rendering/server-components#benefits-of-server-rendering)를 참고하세요

아무튼간에 서버 컴포넌트를 사용할 수 있고 심지어는 아래처럼 비동기로 만들 수 있습니다 :

```tsx
import { fetchJson } from "@/utils/fetchJson";
import { sleep } from "@/utils/sleep";

export default async function Page() {
  const data = await fetchJson(1);
  await sleep(5000);
  return (
    <div>
      <h1>RSC ONLY:</h1>
      <h3>ONLY REACT SERVER COMPONENT!</h3>
      <h5>data fetched:</h5>
      <p>
        id: {data.id} | userId: {data.userId}
      </p>
      <p>title: {data.title}</p>
    </div>
  );
}
```
