---
title: "🎁 면접관께서 가로되, 번들러가 무엇이냐 물으니"
date: 2024-11-21 20:40:38
description: "지원자가 횡설수설 대답하매 마침내 모르겠다며 땀 흘리더라 - 면 11:14"
tag: ["JavaScript"]
---

기술면접에서 긴장한 상태로 앉아있다가..

> 웹팩, Vite같은 번들러의 역할이 뭔가요?

물으시는 것을 듣자마자  
아차.. 사실 매일같이 옆에 있으면서도 잘 모르고있었구나, 깨달았습니다

지식이 부족한 채로 어떻게든 대답할까 싶어 한 두 마디를 이어가다가  
구멍을 하나 막으려고 보니 두 군데서 또 물이 새고 있는 자신을 발견하고는.. 모르겠다 했습니다.

![바보갓은 나애모습](image.png)

천둥벌거숭이가 된 기분이라고 할까요?

그래서 자세히 좀 알아봤습니다..

# 태초에 어떤 문제가 존재했는가?

웹 페이지는 웹 문서 뼈대 그 잡채인 HTML, 옷을 입히는 CSS, 그리고 움직이게 하는 JS로 이루어집니다  
만약 웹 페이지에 자바스크립트 파일을 로드하려면..  
`<script src="index.js">`처럼 스크립트 태그로 삽입하겠죠?

예시로, 간단한 HTML에 간단한 JS코드를 집어넣는 코드를 작성해봅시다.

```html
<html>
  <head>
    <link
      rel="stylesheet"
      href="https://cdn.jsdelivr.net/npm/@picocss/pico@1/css/pico.min.css"
    />

    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Very Simple Traditional App</title>
  </head>
  <body>
    <div style="width: 20%; margin: 30vh auto">
      <button id="redirect-page-btn">Redirect</button>
      <button id="say-hello">Say Hi</button>
    </div>
  </body>
  <script src="foo.js"></script>
  <script src="redirect.js"></script>
  <script src="alert.js"></script>
  <script src="index.js"></script>
</html>
```

```js
----------------------------------------------
//foo.js
function bar() {
    // do nothing
}
const baz = "baz";
----------------------------------------------
// alert.js
function SayHi() {
    alert("Hello, My Name is..");
}
----------------------------------------------
// index.js
document.getElementById("say-hello").addEventListener("click", SayHi);
----------------------------------------------
```

간단한 html 요소들을 두고, pico css를 CDN으로 삽입하여 대강의 스타일만 넣었습니다.
그리고 여러 자바스크립트 파일을 삽입했습니다.

JS코드들이 여러 파일로 분리되어있지만, 자바스크립트는 기본적으로 **전역 스코프를 공유**합니다.  
따라서 별도의 작업 없이도 서로 스스럼 없이 지낼 수 있습니다  
예를 들면 `index.js`에서 `alert.js`의 `SayHi()`함수를 사용하는 등..

![SayHi()함수에 전역으로 접근 가능](https://i.imgur.com/RzrUEYF.png)

이러면 에브리띵 오케이일 것 같지만 여러가지 지뢰가 도사립니다..

## 1. 네트워크 요청은 파일 수만큼 보냄

먼저 개발자모드를 열고 네트워크 탭에서 전송된 요청을 봅시다

![네트워크 요청 수](https://i.imgur.com/R1jGjuj.png)

세 개의 자바스크립트 파일을 삽입했으니, 이를 로드하기 위해 세 번의 요청이 필요합니다.  
심지어 하등 사용하지도 않은, 그래서 필요하지도 않은 `foo.js`까지도요

이렇게 아무리 용량이 작아도 자바스크립트 파일을 100개로 나눠놓았으면 100번의 요청이 필요합니다..

## 2. 의존성을 조심

또한 이 스크립트를 삽입할 때는 의존성 관계를 잘 생각해야 할텐데, 예를 들어 아래처럼 되어버리면..

```html
<script src="foo.js"></script>
<script src="index.js"></script>
<script src="alert.js"></script>
```

![의존성 순서 에러](https://i.imgur.com/1HWTAYV.png)

에러가 발생해버립니다.  
`alert.js`에서 `SayHi()`가 선언되기도 전에 `index.js`에서 참조했으니까요

## 3. 전역 스코프 오염

이제 만약 이걸 작성한 저 말고 다른 새로운 사람이 와서 여기에 코드를 작성한다고 해봅시다.  
그러고는 이런 생각을 할 수도요? "_`baz`라는 변수를 만들어야지~_"

```js
document.getElementById("say-hello").addEventListener("click", SayHi);

const baz = "bazbaz";
console.log(baz);
```

어라, 근데 이미 `foo.js`에 `baz`라는 변수가 선언되어 있습니다.  
이 사실을 알지 못하는 사람이라면, 영문도 모른 채 이런 에러를 마주치게 됩니다.

![네임스페이스 충돌](https://i.imgur.com/Vo20nJt.png)

이러면 이제 나중가면 게임 캐릭터 이름 지을때마냥 변수 중복확인이라도 해야하겠는데요?

<figure>

![메이플스토리 중복이름](image-1.png)

<figcaption>게임 "메이플스토리"의 닉네임 중복확인..</figcaption>

</figure>

### 함수는 덮어씌워지더라구요

처음에는 이 예시 `baz`를 함수로 하려고 했는데,

```js
// foo.js
function bar() {
  // do nothing
}
function baz() {
  // do nothing too
}
// index.js
document.getElementById("say-hello").addEventListener("click", SayHi);

function bar() {
  console.log("bar");
}
console.log(bar);
```

그런데 웬걸? 에러가 나지 않았습니다.

![함수가 덮어씌워짐](https://i.imgur.com/urfFDa5.png)

나중에 정의한 함수로 `bar`함수가 덮어씌워졌네요?

[호이스팅](https://developer.mozilla.org/ko/docs/Glossary/Hoisting)과 관련이 있다고 합니다.

> JavaScript 호이스팅은 인터프리터가 코드를 실행하기 전에 함수, 변수, 클래스 또는 import 등의 선언문을 해당 범위의 맨 위로 끌어올리는 것처럼 보이는 현상을 뜻합니다.

자바스크립트 인터프리터가 전체 함수 선언을 전부 긁어서 현재 속한 스코프의 최상단으로 끌어올리게 되는데,  
이 과정에서 중복된 함수가 있다면 나중에 가져온 것으로 덮어씌워지게 됩니다.
