---
title: "🚰 29K+ Star 오픈소스에서 메모리가 줄줄 새는 원인 찾기 (JavaScript 메모리 누수)"
date: 2025-06-28 12:53:36
description: "JavaScript 메모리 관리, 그리고 Chrome Dev Tools에서 메모리 누수 진단하기 - Detached DOM Elements 위주로"
tag: ["JavaScript"]
---

최근에 [Mantine](https://github.com/mantinedev/mantine)이라는 오픈소스 프로젝트에 기여했는데요  
이게 뭐냐면 회사에서 쓰는 React 컴포넌트 라이브러리입니다

<figure>

![Pokemon Mantine](https://i.imgur.com/Rbe7FEo.png)

<figcaption>
만타인 - [포켓몬스터]
</figcaption>

</figure>

이 글 쓰면서 알았는데 포켓몬 이름이었네요?? 진짜귀엽다만타인최고!!!!!!!!!!!!!!!!!!

암튼간에.. Mantine에서 `help needed` 라벨이 달린 이슈들을 살펴보다가  
[Tree component retain references to detached DOM, leading to memory leak #7677](https://github.com/mantinedev/mantine/issues/7677) 이라는 이슈가 있었습니다  
JavaScript에서 메모리 누수에 대해서 파본 적이 없지만 그래서인지 왠지 호승심이 드는 주제더라구여  
그래서 아예 개념부터 시작해서 Bottom-Up 방식으로 들어가 함 해결해보고자 했습니다

이번 글에서는

- 먼저 배경지식으로 JavaScript에서의 메모리 관리에 대해 가볍게 알아보고
- 저 이슈가 말하는 메모리 누수가 무슨 현상이고 어떻게 알 수 있는지 + 왜 그랬는지
  - 이슈의 원인은 알고보니 별 시덥잖은 이유여서 기대하지는 않는게 좋습니다
- Chrome Dev Tools에서 메모리를 프로파일링하기 위해 무엇을 알아야 할지

등을 알아보겠습니다

# 배경지식: JavaScript의 메모리 관리

C언어같은 저수준 언어들은 `malloc()`과 `free()` 등의 함수로 개발자가 직접 메모리 할당과 해제를 관리합니다.

![C malloc/free meme](https://i.imgur.com/6bTqtFs.png)

반면 JavaScript(같은 고수준 언어)는 객체가 생성되었을 때 자동으로 메모리를 할당하며, 필요하지 않아지면 자동으로 해제합니다.  
이렇게 **자동으로 메모리를 해제하는 메모리 관리 기법**을 **가비지 컬렉션(Garbage Collection, GC)** 라고 합니다.

대부분의 프로그래밍 언어에서 메모리 생존 주기는 다 비슷비슷한데,

1. 필요할 때 할당하고
2. 할당된 메모리를 사용(읽기/쓰기)하고
3. 더 이상 필요하지 않으면 해제한다.

보통 이러는게 자연스러운 흐름입니다.  
그리고 JavaScript같은 고수준 언어는 1번과 3번이 암묵적으로 동작한다는 이야기라고 봐야겠네요.  
2번은 그냥 으레 하듯 코드 <small>~~싸는~~</small> 쓰는거구요

메모리 할당에 대해 잠깐 살펴보면?

```js
const n = 123; // 정수를 담는 메모리 할당
const s = "foo"; // 문자열을 담는 메모리 할당
const o = { a: 1 }; // 객체와 그 객체에 포함된 값들을 담는 메모리 할당
// ... 이외에도 배열, 함수, 함수식 등 선언/할당
```

JavaScript에서는 이런 식으로 프로그래머가 무언가 값을 선언할 때 자동으로 메모리가 할당된다는 것이고  
이외에도 `document.createElement("div")` 처럼 함수 호출의 결과로 메모리가 할당될 수도 있는거고  
아니면 `s2 = s.substr(0, 3)`처럼 메서드에 의해 새로운 값이나 오브젝트가 할당될 수도 있겠네요

## 메모리를 해제하기: 가비지 컬렉션 (Garbage Collection)

물건을 꺼내서 사용한 다음에는 응당 다시 제자리에 두어야 하는데요  
저는 제 방 하나 정리 못하지만 JavaScript에서는 가비지 컬렉터라고 해서 메모리 대신 치워주는 착한 친구가 있습니다  
이 친구는 제 메모리들이 더 이상 필요하지 않으면 몰래 잘 정리해주는데요

근데 _더 이상 필요하지 않은 메모리_ 는 어떻게 알까요??

![필요없어!](https://i.imgur.com/QWMQCJM.png)

아쉽게도 _더 이상 필요하지 않은_ 이라는게 언제인지는 결정적인 문제가 아닙니다  
제 머릿속을 들여다볼 수도 없고..  
그래서 가비지 컬렉터들은 이 문제에 대한 근사적인 해결책을 구현합니다

일단 가장 핵심적으로 쓰이는 개념은 **참조**(Reference)인데

> A라는 메모리를 통해 B라는 메모리에 접근할 수 있다면, "B는 A에 의해 참조된다"

라고 생각해볼 수 있습니다.

![참조 관계](https://i.imgur.com/zuCStwE.png)

이는 가비지 컬렉션의 핵심 개념이고,  
모든 JavaScript 오브젝트는 [prototype](https://developer.mozilla.org/ko/docs/Learn_web_development/Extensions/Advanced_JavaScript_objects/Object_prototypes)을 통한 암시적 참조 및 그 객체의 property를 통한 명시적 참조를 가집니다.

### 1. Reference Counting

*더 이상 필요하지 않다*를 판단하는 가장 단순한 방법 중 하나는 객체에 대한 **참조를 세는 방법**입니다.  
어떤 객체를 참조하는 다른 객체들의 수를 세고,  
그것이 0이면 _"다른 어떤 객체도 참조하지 않는 객체"_ 이므로 이를 **가비지**(필요 없는 메모리)로 봅니다.

![Reference Counting 예시](https://i.imgur.com/5vBmFR1.png)

대충 이런 식일까요?  
근데 이러면 순환참조에서 문제가 생깁니다.  
실제로는 어디에서도 사용되지 않지만, 서로가 서로에 대한 참조를 유지해버린다면..

![Reference Counting에서의 순환참조 문제](https://i.imgur.com/DrnyQR9.png)

`Reference Count: 1`로 0이 아니라서 수집할 수가 없습니다.  
이는 Reference Counting 방식의 가비지 컬렉션에서 발생할 수 있는 메모리 누수의 흔한 원입니다.

### 2. Mark and Sweep

참조를 세는 대신, 이번에는 **"도달할 수 없는 객체"를 "가비지"로 정의**해봅시다.  
전역 객체인 `Root`를 두고, `Root`에서부터 도달 가능한지 여부를 봅니다.  
`Root`에서 시작해서, `Root`가 직접 참조하는 객체, `Root`가 참조하는 객체가 참조하는 객체, ...

![Mark and Sweep](https://i.imgur.com/Y08xPkm.png)

`Root`에서부터의 순회로 `obj1, obj2, obj3, obj4`는 도달할 방법이 있지만,  
`obj5, obj6`에는 도달할 방법이 존재하지 않으므로 가비지로 보고, 치워버립니다.

![막다른 길](https://i.imgur.com/HTm0VOl.png)

수집하는 주기 등 세부 구현에서의 개선이나 차이가 있을 수 있지만, 현재 모든 최신 엔진들은 이 **Mark-and-Sweep** 방식을 기본으로 하여 가비지를 수집합니다.

이외에도 JavaScript의 메모리 관리에 대해 더 살펴보시려면 [JavaScript의 메모리 관리 from MDN](https://developer.mozilla.org/ko/docs/Web/JavaScript/Guide/Memory_management) 문서를 참고하세요

# 아까 그 이슈는 뭐가 문제였나요?

처음에 언급한 Mantine의 [#7677](https://github.com/mantinedev/mantine/issues/7677) 이슈로 다시 돌아가봅시다.  
무슨 내용이냐면, Mantine에는 [Tree](https://mantine.dev/core/tree/) 컴포넌트가 있는데

![Mantine Tree Component](https://i.imgur.com/9kpjCER.gif)

계층이 있는 컴포넌트들을 하위에 숨겨뒀다가, 클릭해서 Expand하거나 Collapse할 수 있는 컴포넌트입니다만  
이 Tree component를 열었다가 닫으면, 그 하위 Element들이 DOM에서 빠지면서 관련 메모리가 적절히 해제되어야 하지만  
그렇지 않고 이 Element들에 대한 참조가 남아있어서 **Detached DOM Element**에 의한 **Memory Leak**이 발생한다  
라는 내용입니다

![#7677 이슈 일부](https://i.imgur.com/6ScGbd3.png)

이 이슈를 남긴 사람이 직접 남겨준 Bug Reprod. 내용인데

1. Chrome DevTools (F12로 켜기) - Memory 탭에 들어가서, "Detached Elements" Profiling을 선택
2. Tree 컴포넌트를 열었다가, 닫고
3. 스냅샷을 찍으면! 저렇게 나온다네요

아쉽지만 지금은 저거랑 똑같이 Mantine Tree 컴포넌트 문서에 들어가도 확인할 길이 없어요  
제가 고쳐놔서 ㅋㅋ;;  
그리고 이렇게 **메모리 누수가 발생하는 직접적인 원인은 React Dev Tools(Chrome Extension)** 였습니다..

![React Dev Tools](https://i.imgur.com/bHiAkPN.png)

React 개발자들이라면 주머니에 하나쯤 갖고게시는 이 확장프로그램 맞습니다

![시무룩](https://i.imgur.com/9tueRby.png)

아무튼 처음 저 이슈를 파보기 시작했을 때 저는 메모리 패널에서의 모든게 생소했습니다  
그래서 일단 크게 두 가지를 먼저 알아보고자 했는데  
하나는 **Detached DOM Elements가 뭐냐?** 고  
다른 하나는 **Chrome DevTools의 Memory 탭에서 뭘 할 수 있나?** 였습니다  
이런 것들부터 시작해서 Bottom-Up 방식으로 메모리 누수에 대해 먼저 알고 해결을 시도했었네요

# Detached DOM Elements

DOM 노드(ex. `div`)는 DOM 트리 또는 JavaScript 코드에서 참조될 수 있습니다.  
예를 들어, JavaScript에서는 아래와 같이 DOM 노드를 생성하고, DOM트리에 추가할 수 있습니다.  
또는 DOM Tree에 존재하는 노드를 참조할 수도 있구요

```js
const foo = document.createElement("div");
const bar = document.getElementById("bar");
bar.appendChild(foo);
```

![DOM 노드에 대한 참조](https://i.imgur.com/M9hVRsF.png)

그런데 어떤 노드는 만들기만 하고 DOM Tree에 붙이지 않을 수도 있습니다.

```js
const baz = document.createElement("span");
// .. 그냥 만들었어요 ^^
```

아니면.. DOM Tree에서 제거했으나 여전히 JavaScript 변수에 의해 참조될 수도 있구요

```js
bar.removeChild(foo);
// .. 그러나 foo는 여전히 div 요소를 참조함
```

이렇게 **DOM 트리에 붙어있지 않지만 JavaScript에 의한 참조가 남아있는 요소**를 **Detached DOM Element**라고 부릅니다.

![DOM 노드에 대한 참조: detached DOM element](https://i.imgur.com/EmKeAC6.png)

이렇게 JavaScript에 의한 참조가 남아있는 경우 **도달 가능**하므로 가비지 컬렉팅의 대상이 되지 않습니다.  
이는 곧 **메모리를 해제할 수 없음**을 의미하며 **(잠재적인) 메모리 누수의 원인**이 될 수 있습니다.

## Detached DOM Elements 를 발견하기

Chrome Dev Tools에서 Detached DOM Elements가 남는지 확인할 수 있습니다.  
먼저 F12같은거 눌러서 Chrome Dev Tools에 들어가고, "**메모리(Memory)**"탭으로 들어가봅니다.

![Chrome Dev Tools 메모리탭](https://i.imgur.com/dFJnlwx.png)

여기에서 `Detached elements`를 선택하고, Take Snapshot을 찍어봅니다.

![Detached elements 스냅샷 예시](https://i.imgur.com/Rh17qk0.png)

저는 크롬에서 "새 탭"누르면 나오는 그 기본페이지 거기서 찍어봤습니다
여기에서는 Detached DOM Element의 정확한 HTML 생김새와 node count를 확인할 수 있습니다.

이 `Detached elements` 스냅샷 말고도, 4가지 선택지 중 가장 위에 있던 `Heap snapshot`으로도 확인해볼 수 있습니다

![힙 스냅샷에서 Detached Element](https://i.imgur.com/hjUWcup.png)

저는 여기서 가장 먼저 궁금했던 것은

![shallow size, retained size](https://i.imgur.com/ZyFDrUb.png)

Shallow Size와 Retained Size 그리고 Distance였네요  
이 용어들을 포함해서 힙 스냅샷 패널을 분석하는 법을 알아봐야겠으니 Chrome for Developers 문서를 읽기로 했습니다.  
[메모리 용어](https://developer.chrome.com/docs/devtools/memory-problems/get-started?hl=ko)부터 시작합니다

# 메모리 용어와 프로파일링 그리고 문제 해결

메모리를 원시 자료형(숫자 및 문자열, 등)과 객체(연결이 있는 배열)가 있는 어떤 그래프로 생각해볼 수 있습니다.

![메모리를 연결 그래프로 생각해보면..](https://i.imgur.com/LvOl7eo.png)

객체는 다음 두 가지 방법으로 메모리를 보유할 수 있는데:

- 객체 자체에서 직접. - 명시적
- 다른 객체에 대한 참조를 보유하여, 그 객체가 "가비지"가 되지 않도록 유지. - 암시적

예를 들면 :

```js
obj.a = "fooo"; // 객체 자체에 문자열을 위한 메모리를 가진다.
obj.b = obj2; // 다른 객체를 참조한다 -> "간접적으로 보유"한다고 생각 가능
```

메모리를 보유하는 이 두 가지 방법이 Shallow Size와 Retained Size를 이해하는데 도움이 됩니다.

## Shallow Size vs. Retained Size

**Shallow Size**는 **객체 자체에 보관되는 메모리의 크기**를 나타냅니다.

- 보통 JavaScript 객체는 본인에 대한 설명, 그리고 원시값들을 저장하기 위해 예약된 메모리를 가집니다.
- 일반적으로 Shallow Size에서 상당한 크기를 차지할 수 있는 종류는 배열과 문자열 정도인데, 문자열과 외부 배열은 보통 *Renderer Memory*에 주로 저장되는 경우가 많으므로 JavaScript 힙에는 작은 **Wrapper Object**만이 남아있게 됩니다.
- **Renderer Memory** = 페이지가 렌더링되는 프로세스의 _모든_ 메모리를 일컫습니다.
  - Native 메모리 + 페이지의 JS 힙 메모리 + 페이지에서 시작된 모든 전용 worker의 JS 힙 메모리 + ...
- 명시적으로 보유한 메모리 크기라고 봐야겠네요.

**Retained Size**는 **객체와 그 객체에 종속된 객체들이 GC Root에 의해 닿지 못하게 된 경우 해제될 총 메모리 크기**를 나타냅니다.

- **GC Root**? 브라우저에서 `window`객체, 또는 Node.js 모듈의 Global 객체, 또는 DOM Tree 등 ..
- 메모리 그래프는 루트로부터 시작하며, 루트에서부터 순회하여 도달할 수 없으면 가비지 컬렉팅의 대상이 됩니다.
- 암시적(간접적)으로 붙들고 있는 메모리 크기라고 봐야겠네요.

![Shallow Size vs. Retained Size](https://i.imgur.com/bJ8ngc6.png)

Shallow Size는 객체 그 자신이 갖는 메모리, Retained Size는 객체가 짊어진 그 일가족? 쯤 되겠네요

![큰 가방 짤](https://i.imgur.com/fsm46M2.png)

특히 일반 JS객체처럼 보이지만, 실제로는 네이티브(C++) 엔진 레벨에 존재하며 JS에는 이 객체를 가리키는 *Wrapper Object*만이 노출되어있는 경우가 있습니다  
DOM 노드(`HTMLDivElement`, `document.createElement("div")`반환값, 등..)같은 친구들이 그러한데요  
이런 친구들은 JavaScript 힙에 적재되지 않고, JavaScript에서는 이 네이티브 객체를 가리키는 Wrapper Object로만 액세스할 수 있습니다.  
약간 빙산의 일각만 노출되어있고, 큰 부분은 다 네이티브 영역에 숨겨져 있다, 고 연상되네요

그리고 이야기가 나와서 말인데, **GC Root에서부터 객체까지 도달하기 위한 거리**를 **distance**라고 부릅니다.  
위에서 살짝 궁금했던 그 Distance 맞습니다.

![Heap Snapshot Distance](https://i.imgur.com/qNIlZv7.png)

힙은 상호 연결된 객체의 네트워크라고 생각할 수 있으니 Distance라는 표현이 꽤 와닿긴 합니다

JavaScript와 V8엔진에서의 메모리 용어에 대해 더 알고싶으시면

- [Memory Terminology - Chrome for Developers](https://developer.chrome.com/docs/devtools/memory-problems/get-started?hl=en)
- [Tracing from JS to the DOM and back again - V8 Blog](https://v8.dev/blog/tracing-js-dom)

이런거 탐독해보세요. 아리까리한데 아무튼 재밌음

## 메모리 문제를 분석하고 해결하기

Chrome Dev Tools의 메모리 패널로 다시 돌아가봅시다.

![Chrome DevTools 메모리 패널](https://i.imgur.com/5T4ny8L.png)

### 힙 스냅샷 찍기

네 가지 라디오버튼 중 첫 번째인 `Heap Snapshot`은 페이지의 JS 객체와 관련 DOM 노드들 간의 메모리 분포를 보여줍니다.

이 힙 스냅샷으로 Detached DOM Element에 의한 메모리 누수를 발견하는 방법을 보려고 합니다.  
먼저 아래와 같이 아주 간단하게 Detached DOM Element를 만들어내봅니다.

```js
const foo = document.createElement("img");
```

![간단한 Detached DOM Element 만들기](https://i.imgur.com/8CBxZ4o.png)

`<img>` 태그를 생성하여 JavaScript 참조를 만들고 DOM에는 추가하지 않았으므로 이 노드는 **Detached** 되어있습니다.

![길 잃은 펭귄](https://i.imgur.com/Kgm6tR9.png)

DOM에 합류하지 못하고 길을 잃은 노드를 찾으러 가봅시다.  
Memory 패널에서 `Take Snapshot`을 눌러 스냅샷을 남깁니다.

![힙 스냅샷 예시](https://i.imgur.com/PP54zFO.png)

여기에서 방금 만든 `Detached <img>`를 찾아봅시다.  
잘 안보이면 상단부의 `Filter by class`에 검색어를 입력하여 보고싶은 종류를 필터링할 수 있습니다.

![Detached img 찾기](https://i.imgur.com/nFyidzU.png)

이런 식으로, `Detached`라고 입력하면 `Detached` 어쩌구만 나오니까 찾기 쉽습니다.  
`Detached <img>`를 찾았으니 이거 함 눌러봅시다

![Detached 요소의 Retainers를 살펴보기](https://i.imgur.com/WDjoPte.png)

누르면 네 개의 `Detached <img>`가 나왔는데, 제가 만든 것은 어떠한 attribute도 붙지 않은 `<img>`였으니 세 번째(`@41667`)네요

이거 한번 눌러보면 아래 `Retainers` 패널에 뭔가 나오는데  
여기에서는 해당 **객체를 참조하는 코드**에 관한 자세한 정보를 확인해볼 수 있습니다.  
아까 만든 `foo`가 이 노드를 참조하고 있음을 알 수 있네요.

<figure>

![잡았다 요놈](https://i.imgur.com/7pYuMB6.png)

<figcaption>

[출처](https://comic.naver.com/webtoon/detail?titleId=163295&no=15&weekday=tue)

</figcaption>
</figure>

혹시 Node를 참조해놓고 까먹어서 메모리가 샌다면 이렇게라도 찾을 수 있겠습니다

### 할당 타임라인 녹화하기

![할당 타임라인 버튼](https://i.imgur.com/2isaYHa.png)

이번에는 `Heap Snapshot` 대신에 `Allocations on timeline` 한번 선택해봅시다

![할당 타임라인 녹화중](https://i.imgur.com/49Biq3v.png)

이런 식으로, 시간에 따른 JavaScript 메모리 할당을 관측할 수 있습니다.  
이거 켜놓고 한 1000개정도 Detached Node를 만들어봅시다

![할당 타임라인에서 1000개 detached 요소 만들기](https://i.imgur.com/g9XZNGJ.png)

5초정도 되는 타이밍에 아래 코드를 실행시켰습니다

```js
const x = [];
for (let i = 0; i < 1000; i++) x.push(document.createElement("div"));
```

이제 5초 타이밍 전후로 범위를 줄여서, `Detached <div>` 1000개를 찾아봅시다

![할당 타임라인에서 범위 좁혀서 원하는 할당 찾기](https://i.imgur.com/6wzBmZv.png)

1000개의 `Detached <div>`를 찾을 수 있었고, `x`라는 배열에서 이들을 참조한다는 것 까지 알 수 있네요  
메모리 누수가 의심되는 동작이 있다면 할당 타임라인 녹화를 켜두고 그 동작을 트리거해봅시다.

![지켜보는 짤](https://i.imgur.com/Cf35wub.png)

기록된 타임라인에서 그 동작이 트리거된 순간 어떤 메모리 할당이 일어나는지 진단해볼 수 있겠습니다

### 할당 샘플링

![할당 샘플링 버튼](https://i.imgur.com/rkeI59h.png)

`Allocation sampling`에서는 각 JavaScript 스택별(함수별, 이라고 생각하면 편함) 메모리 할당을 샘플링할 수 있습니다.  
이 샘플링은 성능 오버헤드를 최소한으로 유발하기 때문에 장기간 켜두며 정보를 수집해봐도 좋습니다.

저는 할당 샘플링을 켠 채로 아래와 같은 간단한 함수를 만들고 1회 실행해보겠습니다

```js
const x = [];
const bar = () => {
  for (let i = 0; i < 100; i++) x.push(document.createElement("div"));
};
bar();
```

![할당 샘플링 결과](https://i.imgur.com/QHoKHhN.png)

`bar()` 함수에 의해 `16.4KB`만큼의 할당이 있었네요.  
`Self size`와 `Total size`는 제가 기억하기로는  
self는 "콜스택 자기 자신에 의한"이고 total은 "그 하위까지 포함"입니다  
[웹 렌더링 성능 최적화](/chrome-extension-performance-optimization/#결과는)에 관한 글에서 `self`와 `total`에 대해 잠깐 다뤘었네요. 거기선 `time`이었지만

### 분리된 요소

![Detached elements 버튼](https://i.imgur.com/yzY8Xey.png)

`Detached elements`는 위에서 한번 살펴봤었는데요  
여기에서는 JavaScript 참조에 의해 유지되는 객체를 식별할 수 있습니다.

![Detached elements 결과 예시](https://i.imgur.com/t46E9QU.png)

대충 이렇게 생겼었죠?  
Detached DOM Elements가 발생했음을 가장 간단히 식별할 수 있는 방법이었습니다.

---

# 끝

이번 글에서는 **JavaScript에서의 메모리 관리와 Chrome Dev Tools에서 메모리 누수**(특히 **Detached DOM Elements**를 중심으로)를 진단하는 방법에 대해 다뤘습니다.  
JavaScript 코드를 작성하는 입장에서 메모리에 대해 크게 신경쓰지 않는 경우가 있을 수 있는데  
그러나 메모리 문제가 쌓이면 사용자가 인식할 수 있게 되는 경우가 많으므로 이를 식별하고 대처하는 일은 중요합니다.

![답답하다 아주 그냥](https://i.imgur.com/76Cq2iI.png)

사용자가 아래와 같은 문제를 겪는다면 메모리 문제일 수 있습니다:

- 페이지에서 **시간이 지남에 따라 점점 성능이 저하**됨 - 메모리 누수 가능성
- 페이지의 **성능이 지속적으로 나쁨** - 메모리 팽창(필요 이상의 메모리를 사용하는 경우) 가능성
- 페이지가 **지연되거나 잠깐 일시정지되는 듯** 보임 - 잦은 가비지 컬렉션의 영향일 가능성
  - 가비지 컬렉션이 진행되는 중에는 모든 스크립트 실행이 중단되기 때문입니다.

혹시나 이런 증상이 발견되면 메모리를 뜯어볼 타이밍이겠네요  
이만 마칩니다

## Ref.

[메모리 용어 - Chrome for Developers](https://developer.chrome.com/docs/devtools/memory-problems/get-started?hl=ko)  
[메모리 문제 해결 - Chrome for Developers](https://developer.chrome.com/docs/devtools/memory-problems?hl=ko)  
[힙 스냅샷 기록 - Chrome for Developers](https://developer.chrome.com/docs/devtools/memory-problems/heap-snapshots?hl=ko)  
[Tracing from JS to the DOM and back again - V8 dev](https://v8.dev/blog/tracing-js-dom)  
[JavaScript의 메모리 관리 - MDN](https://developer.mozilla.org/ko/docs/Web/JavaScript/Guide/Memory_management)  
[Memory Leaks in DOM Elements and Closures](https://medium.com/@rahul.jindal57/memory-leaks-in-dom-elements-and-closures-b3452f129dac)
