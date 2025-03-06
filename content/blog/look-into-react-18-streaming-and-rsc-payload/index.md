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
버전은 브랜뉴인 React 19, Next.js 15 App Router로 해볼건데

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

이러면 모든게 편해지는데  
`useEffect`와 `useState`로 첫 렌더링 이후에 fetch하고.. 그 전에는 fallback을 리턴하고..  
이런거 그냥 `await` 딸깍으로 데이터가 준비될 때까지 렌더링을 잠깐 멈춰둘 수 있습니다.

![5초 기다린 모습](image-1.png)

`await sleep(5000)`으로 인해 5초 지난 후 렌더링이 재개되어 HTML을 받을 수 있구요

![RSC ONLY의 HTML](image-2.png)

5초 후 받은 HTML에는 이미 값이 다 차있는 상태네요  
비교를 위해 클라이언트 사이드에서 전통적인 방식(`useEffect, useState`사용)으로 대충 구현해보면

```tsx
export default function Page() {
  const [data, setData] = useState<JsonPlaceholder>();

  useEffect(() => {
    sleep(5000).then(() => fetchJson(1).then(res => setData(res)));
  }, []);

  return (
    <div>
      <h1>RCC ONLY:</h1>
      <h3>ONLY CLIENT COMPONENT!</h3>
      <h5>data fetched:</h5>
      {data && (
        <>
          <p>
            id: {data.id} | userId: {data.userId}
          </p>
          <p>title: {data.title}</p>
        </>
      )}
    </div>
  );
}
```

이런 식으로 될까요? 클라이언트 컴포넌트는 _렌더링을 중단_ 까지는 할 수 없으니, 데이터만 5초 기다렸다가 가져오도록 해봤습니다  
아무튼 이런 식으로 데이터가 필요한 부분은 나중에 데이터가 준비되어야 추가하도록 하면

![RCC ONLY의 HTML](image-3.png)

이렇게 `data`가 필요한 부분은 뚝 끊긴 채로 HTML이 전달되고, 그 밑은 나중에 클라이언트 사이드에서 JavaScript를 사용하여 채워집니다

# 서버 컴포넌트에 Suspense를 사용하여 Streaming하기

마법은 이제부터 시작인데요  
아까처럼.. 데이터 준비하는데 오래 걸린답시고 진짜 5초 뒤에나 페이지가 그려지면 아주 끔찍하죠?

![울화통!!](image-4.png)

다행히도 저번시간에 `Suspense`를 사용하여 Streaming하면 컴포넌트들을 **준비되는 대로** 가져다줄 수 있다고 했습니다  
어떻게 하는지 봅시다

먼저 n초동안 잠들어버리는 간단한 컴포넌트를 만들게요

```tsx
import { sleep } from "@/utils/sleep";

export default async function Sleep({ seconds }: { seconds: number }) {
  await sleep(seconds * 1000);
  return <p>{seconds}초 잤어요</p>;
}
```

비동기 서버 컴포넌트로 만들어서 렌더링이 중단가능하게 합니다  
그런 다음 이 컴포넌트를 사용할 때는 `Suspense`로 경계를 만듭니다

```tsx
import Sleep from "@/components/Sleep";
import { Suspense } from "react";

export default async function Page() {
  return (
    <div>
      <p>잠에들어라....얍</p>
      <Suspense fallback={<p>zzzZZ</p>}>
        <Sleep seconds={5} />
      </Suspense>
      <Suspense fallback={<p>zzzzzZZZZZ</p>}>
        <Sleep seconds={10} />
      </Suspense>
    </div>
  );
}
```

이러면 처음에는 `<Suspense>`를 만났을 때, fallback으로 먼저 HTML을 채웁니다.  
그러고 나중에 서스펜스 경계 내부의 컴포넌트가 준비되었다면, fallback을 갈아끼웁니다.

![RSC Streaming 결과 ](https://i.imgur.com/4bB7l9m.gif)

5초 뒤에 `zzzZZ`가 `5초 잤어요`로 바뀌고,  
10초 뒤에 `zzzzzZZZZZ`가 `10초 잤어요`로 바뀌는거십니다

## Suspense끝나면 fallback을 어떻게 갈아끼우나요?

근데 HTML은 이미 fallback으로 채워서 내려갔는데, 어떻게 fallback자리를 새로 도착한 HTML조각들로 갈아끼울 수 있을까요?  
밑에다 붙이는 것도 아니고..  
이를 알아보기 위해, 위에서 봤던 예시 코드를 실행하면 HTML이 어떻게 변하는지 열어봅시다.

### 1. Suspense가 둘 다 안 끝남

먼저 위 예시에서 두 Suspense가 모두 완료되지 않은 타이밍(~5초 미만)의 HTML을 열어봅시다

![Suspense 둘 다 안끝난 경우 HTML](image-6.png)

보면 이렇게 일단 fallback(`zzzZZ` 등)으로 HTML이 채워지고, 그 뒤로는 아직 HTML이 닫히지 않았는데

![chuncked로 HTML을 스트리밍](image-7.png)

이 HTML의 응답헤더에 `Transfor-Encoding: chuncked`와 같이 지정하여 HTML을 Streaming중임을 알 수 있습니다

![아직 멀었니](image-14.png)

### 2. Suspense가 하나 끝남

이제 Suspense가 하나 끝난 타이밍(5초 이상 ~ 10초 미만)을 봅시다

![Suspense가 하나 끝난 경우 HTML](image-9.png)

Suspense로 기다리던 `5초 잤어요` 블록이 도착했는데,  
웬 `$RC`라는 함수의 선언과 호출이 있는 이상한 스크립트가 같이 왔어요  
이게 React가 **Suspense 경계를 갈아끼우는 비결**입니다

#### `$RC(b, c, e)` : completeBoundary

이 `$RC`라는 함수는 Suspense 경계를 갈아끼우기 위한 함수인데, 원본은 [React fizz instruction 중 하나인 completeBoundary](https://github.com/facebook/react/blob/b9be4537c2459f8fc0312b796570003620bc8600/packages/react-dom-bindings/src/server/fizz-instruction-set/ReactDOMFizzInstructionSetShared.js?ref=hackernoon.com#L46)입니다  
원본 코드에 정말 자세한 주석이 친절하게 써있긴한데요  
위 코드를 기준으로 어떤 일이 일어났는지 다시 봅시다

```html
<div>
  <p>잠에들어라....얍</p>
  <!--$?-->
  <template id="B:0"></template>
  <p>zzzZZ</p>
  <!--/$-->
  <!--$?-->
  <template id="B:1"></template>
  <p>zzzzzZZZZZ</p>
  <!--/$-->
</div>
```

일단 fallback으로 채워진 HTML이 왔었는데, 사실 `<!--$?-->, <!--/$-->`와 같이 수상하고 이상한 주석이 있고  
`<template id="B:0">`처럼 수상해보이는 [콘텐츠 템플릿 요소](https://developer.mozilla.org/ko/docs/Web/HTML/Element/template)도 있습니다  
이 `B:0`이라는 id는 나중에 **제거할 fallback이 어디있는지**를 위한 마킹이고,  
`<!--$?-->`는 Suspense경계의 시작점, `<!--/$-->`는 종료점을 나타냅니다

그리고 첫 번째 Suspense가 끝나고 도착한 HTML조각은 아래와 같았습니다

```html
<div hidden id="S:0">
  <p>
    5
    <!-- -->
    초 잤어요
  </p>
</div>
```

여기에도 `S:0`이라는 수상한 id가 붙어있고, hidden으로 숨겨놓았네요

이제 아까 그 스크립트(`$RC`)를 다시 봅시다

```html
<script>
  /**
   * Suspense되었던 부분이 도착하면 갈아끼우는 스크립트 ($RC함수)
   * b : fallback경계의 id (ex. B:0)
   * c : 새로 도착한 노드의 id (ex. S:0)
   * e : errorDigest
   */
  $RC = function (b, c, e) {
    c = document.getElementById(c); // 새로 도착한 노드를 get
    c.parentNode.removeChild(c); // 원래 있던 자리에서 제거
    var a = document.getElementById(b); // fallback 노드를 get
    if (a) {
      b = a.previousSibling;
      if (e) (b.data = "$!"), a.setAttribute("data-dgst", e);
      else {
        e = b.parentNode;
        a = b.nextSibling;
        var f = 0;
        do {
          // 기존 fallback 노드를 삭제.
          if (a && 8 === a.nodeType) {
            // a타입이 8 => 주석노드
            var d = a.data;
            if ("/$" === d)
              if (0 === f)
                // 종료태그 "/$" 가 나올때까지 노드 삭제를 반복
                break;
              else f--;
            // 시작 태그는 "$?"
            else ("$" !== d && "$?" !== d && "$!" !== d) || f++;
          }
          d = a.nextSibling;
          e.removeChild(a);
          a = d;
        } while (a);
        for (
          ;
          c.firstChild; //받아온 노드를 추가하기.

        )
          e.insertBefore(c.firstChild, a);
        b.data = "$"; // "$"는 완료되었음을 표시함.
      }
      b._reactRetry && b._reactRetry(); // 혹시 실패하면 재시도
    }
  };
  $RC("B:0", "S:0"); // $RC(fallback노드, 새로도착한노드) 를 실행하여 노드를 갈아끼우기
</script>
```

(1) Suspense fallback의 시작점 플래그 주석인`<!--$?-->`부터 종료점 플래그 주석인 `<!--/$-->`까지 노드를 삭제합니다  
(2) Suspense가 완료되고 새로 받아온 노드를 fallback이 있던 자리에 추가합니다

그럼 이후 개발자도구의 Elements를 보면 교체된 자리는

![Suspense 교체 이후 HTML Elements](image-10.png)

이렇게 `<!--$-->`로 마킹하여 "교체됨"을 나타냈네요.

<figure>

![퍼엉~](image-11.png)

<figcaption>
바꿔치기
</figcaption>
</figure>

### 3. Suspense 둘 다 끝남

Suspense Boundary를 바꿔치기하는 인술이 있는걸 알았으니 이제 이해가 편하겠네요  
두 번째 Suspense가 끝나도 똑같습니다

![두 번째 Suspense까지 끝난 html](image-12.png)

이제 `$RC`함수 선언이 이미 있으니 `$RC("B:1", "S:1")`이라고 호출만 해주면 되겠죠?  
그리고는 Streaming이 끝났고 html이 닫혔습니다

# Suspense로 클라이언트 컴포넌트를 기다릴 수도 있어요

제곧내  
클라이언트 컴포넌트가 Promise를 반환하는 함수를 받아서 [`use`훅](https://ko.react.dev/reference/react/use)으로 이를 읽으면 됩니다

> use에 전달된 Promise가 대기Pending하는 동안 use를 호출하는 컴포넌트는 Suspend됩니다.

이제 아래처럼 Promise를 props로 받는 간단한 클라이언트 컴포넌트를 만들고

```tsx
"use client";
import { use } from "react";

export default function RCC({ cb }: { cb: Promise<any> }) {
  const result = use(cb);

  return <p>{result}</p>;
}
```

이제 이 `<RCC>`에 Promise를 전달하고 Suspense로 감싸면?

```tsx
export default async function Page() {
  return (
    <div>
      <h1>Client Component + Suspense</h1>
      <Suspense fallback={<p>큰거온다 ....</p>}>
        <RCC cb={getSomething()} />
      </Suspense>
    </div>
  );
}
```

결과는?

![RCC + Suspense](https://i.imgur.com/U4IPxeY.gif)

이러면 Streaming되는 형태도 위에서 서버 컴포넌트를 Suspense할 때와 정말 아주 비슷하게 이루어집니다  
너무 비슷해서 굳이 또 안보여줘도 될 정도

# 아까부터 자꾸 보이는 `self.__next_f.push`
