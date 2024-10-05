---
title: "React 프로젝트에 애니메이션 넣기"
date: 2024-10-05 14:28:31
description: "애니메이션 저도 참 좋아하는데요"
tag: ["TIL", "React", "CSS", "Framer"]
---

> ! 주의 : TIL 게시글입니다. 다듬지 않고 올리거나 기록을 통째로 복붙했을 수 있는 뒷고기 포스팅입니다.

[데모 페이지](/demo)

내 프로젝트가 좀 있어보이려면 애니메이션 넣는것도 좋은 선택일 수 있습니다  
아무래도 먹기 좋은 떡이 보기에도 좋습니다. 반대인가?

# CSS만 써서 애니메이션 넣기

먼저 내가 리액트를 쓰든, 뭘 쓰든 간에, CSS 자체로 애니메이션을 넣을 수 있습니다

## Transitions

CSS Transitions를 이용하여, 특정 속성의 값이 변화할 때 애니메이션을 적용할 수 있습니다  
`transition: color 0.5s ease` 이런 식으로요  
"`속성 지속시간 타이밍함수`" 순으로 작성합니다  
타이밍 함수는 없어도 되는데 원하는 스타일이 있으면 적용합니다  
[transition timing function](https://developer.mozilla.org/en-US/docs/Web/CSS/transition-timing-function) 뭐가 있는지는 여기서 확인할 수 있습니다

여러 개 적을 때는 콤마로 구분해요  
`transition: color 0.5s ease, background-color 0.5 ease-out` 이런 식으로

그럼 이제 예를 들어, 다크모드 전환으로 인한 `body`의 배경색과 글씨 색 변화에 효과를 넣고 싶으면

```css
body {
  /*
    다른 속성들
  */
  transition: background-color 0.2s ease-in, color 0.2s ease-in;
}
```

이런 식으로 해주면 되겠죠? 우상단의 동그라미를 눌러보세요

근데 이거는 이미 DOM에 있는 요소의 속성변화를 감지하는거라,  
모달을 조건부로 DOM에 삽입하고 띄울 때 등의 상황에서는 `transition`으로 효과를 볼 수 없습니다  
`transition`은 초기 값에 대해서는 효과가 없거덩요

## Keyframes

대신에 `@keyframes`를 사용할 수 있습니다

```css
@keyframes slide-up-fade-in {
  0% {
    transform: translateY(30px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}
```

이렇게 `@keyframes: 내맘대로-이름-정하기 {}` 와 같이 규칙 블록을 만들고  
열어서 내부에는 `from, to` 또는 `0%, 100%`처럼 단계를 정합니다  
대충 짐작 가능하듯이 `0%`는 처음에 시작할 상태, `100%`는 최종으로 도달할 상태입니다

이제 이 애니메이션을 적용할 대상 선택자에  
`animation: slide-up-fade-in 0.3 ease-out forwards;` 이라고 적어주면 됩니다  
아까 transition과 비슷하게 하네요.  
`forwards` 키워드는 애니메이션이 종료되면 이를 최종상태로 고정하게 명시하는 키워드입니다.  
이제 이 `slide-up-fade-in` 애니메이션이 적용된 경우 투명하고 살짝 아래에 있던 상태에서 스르륵 올라오는 효과가 부여될 것 같네요~

이제 이정도만으로도 어느정도의 애니메이션이 다 가능할텐데  
모달을 닫을 때처럼 DOM에서 삭제하는 경우에는 애니메이션을 넣기 좀 까다롭고  
복잡한 애니메이션도 넣기 머리아픕니다..  
항상 그렇듯이 이걸 편하게 해주는 라이브러리가 또 존재하는데

# Framer Motion

[Framer Motion](https://www.framer.com/motion/)이라는 라이부락리입니다  
`npm install framer-motion`으로 먼저 설치합니다  
이제 이걸 쓸 곳에서 `import { motion } from "framer-motion"`와 같이 임포트해주면 준비됐습니다

## 기본 사용

이제 움직일 요소에 대해, 예를 들어 div라면, `<motion.div>`로 대체해주면 됩니다  
이제 여기다 `animate` 프로퍼티를 넣어주는데, 객체로 넣어줍니다

```jsx
const [x, setX] = useState(0);
return;
<motion.div
  animate={{ x: x }}
  style={{ backgroundColor: "lightgreen", width: "fit-content" }}
>
  <button onClick={() => setX(prev => prev - 10)}>{"<-"}</button>
  안녕하세요? 지나가겠습니다
  <button onClick={() => setX(prev => prev + 10)}>{"->"}</button>
</motion.div>;
```

[데모 : 1](/demo#1)처럼, 예를 들어, x값을 상태로 관리하고 버튼을 눌러 x값이 변하게 만들 수 있습니다  
여기에 transition 프로퍼티를 또 설정할 수 있어서  
`transition={{duration: 3}}`과 같이 커스텀할 수도 있습니다  
`transition={{ type: 'spring', bounce: 5 }}` 이런 식으로 통통 튀게 할 수도 있구요

## 초기 상태와 종료 상태를 정하기

이제 모달을 조건부로 DOM에 추가될 때는 올라오는 모션을 적용하고자 합니다  
`animate`프로퍼티는 그대로 사용하고, `initial={{}}`로 초기 값을 정의할 수 있습니다  
또한 `exit={{}}` 프로퍼티로 DOM에서 나갈 때의 종료 값을 정의할 수도 있습니다

```jsx
<motion.dialog
	initial={{
	  opacity: 0,
	  y: 30,
	}}
	animate={{
	  opacity: 1,
	  y: 0,
	}}
	exit={{
	  opacity: 0,
	  y: 30,
	}}
>
```

이렇게 하고, `isOpen`같은 true/false 상태값으로 모달 오픈 여부를 관리하고,  
`isOpen && <motion.modal>` 이렇게 띄우면  
열 때는 되지만 닫을 때는 모션이 적용되지 않습니다  
이건 `isOpen`이 false로 변하면 리액트가 해당 컴포넌트를 DOM에서 **즉시 제거**하기 때문인데  
이는 곧 리액트는 애니메이션이고 뭐고 몰라~ 라는 뜻입니다

다행히도 framer motion 라이브러리에서 이걸 리액트가 기다리도록 하는 컴포넌트를 제공하는데  
`<AnimatePresence>` 컴포넌트로 감싸면 됩니다

```jsx
<AnimatePresence>
  {isModalOpen && (
    <motion.dialog
      onClose={() => setIsModalOpen(false)}
      open
      initial={{ y: 30, opacity: 0 }}
      exit={{ opacity: 0, y: 30 }}
      animate={{ y: 0, opacity: 1 }}
    >
      <p>안녕하세요? 모달입니다</p>
      <button onClick={() => setIsModalOpen(false)}>모달 닫기</button>
    </motion.dialog>
  )}
</AnimatePresence>
```

이제 이러면 `<AnimatePresence>` 덕분에 React는 애니메이션을 끝까지 기다리고 DOM에서 제거합니다

[데모 : 2](/demo#2)에서 확인해볼 수 있습니다

## variants 프로퍼티로 간단히 할 수 있음

variants 프로퍼티로 아예.. 약간 redux에서 reducer의 action type에서 하듯이?  
아무튼 좀 간단하게 할 수 있습니다.

```jsx
<motion.dialog
	variants={{
	  hidden: {
		opacity: 0,
		y: 30,
	  },
	  visible: {
		opacity: 1,
		y: 0,
	  }
	}}
	initial='hidden'
	animate='visible'
	exit='hidden'
>
```

이런 식인데, 변수처럼 키-값 쌍을 variants에서 정의하고, 이를 `initial, animate, exit`에서 갖다 씁니다.  
사실 `initial`과 `exit`은 내용이 똑같았잖아요?

그리고 이렇게 `variants`에서 선언한 것들은 그 하위 `motion.요소`들도 효과를 받습니다  
자식 모션 컴포넌트에서는 `hidden, visible`이라는 `variants`의 key에 대한 값들만 다시 재정의해주면 됩니다  
`initial, animate, exit`은 다 상속받기 때문이지용

```jsx
<motion.dialog
  variants={{
    hidden: {
      opacity: 0,
      y: 30
    },
    visible: {
      opacity: 1,
      y: 0
    }
  }}
  initial="hidden"
  animate="visible"
  exit="hidden"
>
  <motion.p
    variants={{
      hidden: { opacity: 0, scale: 0.5 },
      visible: { opacity: 1, scale: 1 }
    }}
  >
    HI
  </motion.p>
</motion.dialog>
```

이런 식으로요  
자식 컴포넌트에 맞는 `variants`만 다시 적어주면 됩니다

## Hover할 때는

버튼에 Hover하면 크기를 키우거나 하고 싶을 수 있습니다  
사실 css만으로도 할 수는 있지만.. 이미 framer를 쓰고있으니까욘  
css쓰러 가기는 귀찮고, 이벤트리스너로 하려면 상태값을 또 추가해야합니다  
framer는 단순하게 써줘도 기본으로 부드러운 애니메이션을 적용해주니까 또 좋습니다

아무튼 그래서 `whileHover`같은 while류 프로퍼티를 사용할 수 있습니다

```jsx
<motion.button whileHover={{ scale: 1.5 }} onClick={() => setIsModalOpen(true)}>
  모달 열기
</motion.button>
```

이런 식으로용  
대충 감이 오시죠?

## Staggering

모션 컴포넌트 하위의 여러 자식 모션 컴포넌트들이 등장하게 될 때  
한 번에 어셈블!! 이 아니라 차례대로 줄지어 들어오게 하고 싶다면  
staggering을 이용할 수 있습니다

```jsx
variants={{
	visible: {
	  transition: {
		staggerChildren: 0.05
	  }
	}
  }}
```

단순히 이렇게 해주면 됩니다.  
그럼 `variants`의 `staggerChildren`에서 정의한 시간 간격에 따라  
자식 모션 컴포넌트들이 줄지어 등장합니다  
[데모 : 3](/demo#3)처럼요

## 키 프레임으로 효과 여러 개 넣기

애니메이션 넣을 때, 객체에 `scale:` 이런 키에 대한 값으로 그냥 숫자만 넣었는데요  
숫자 배열도 넣을 수 있습니다.  
`scale: [1.3, 0.7, 1.5, 0.5, 1]` 이러면 1.3 갔다가, 0.7로 다시 갔다가, ... 다 거쳐서 1에 도달합니다

```jsx
<motion.div
    variants={{
        visible: {
            y: [0, 10, -10, 0],
            opacity: 1
        },
        hidden: {
            y: 30,
            opacity: 0
        }
        }}
>
```

이런 식으로 프레임을 지정할 수 있는 셈입니다  
[데모 : 4](/demo#4)에 있습니다

## 명령적인 방법으로 애니메이션 정의하기

지금까지는 선언적이었어요  
모션 요소에 프로퍼티로써 애니메이션을 선언했습니다

근데 이제 명령적인 방법도 궁금하죠? 예를 들어 입력이 유효하지 않으면 요소를 흔들리게 하거나 등..

훅으로 할 수 있습니다. React 라이브러리답게 훅으로 애니메이션을 제어하는 방법을 제공합니다.  
`const [scope, animate] = useAnimate()`

- scope는 ref입니다. 원하는 HTML 요소에 연결하면 되겠습니다. `<form ref={scope}>`처럼
- animate는 `animate(선택자 문자열, { 애니메이션 상태 객체 }, { transition 객체 })`와 같이 써서 애니메이션을 트리거하는 함수입니다.
  - 첫 번째 인자로 문자열로 선택자를 집어넣습니다. `'textarea, input, .my-class'`처럼
  - 두 번째 인자에는 `animate` 프로퍼티에 넣었던 객체와 동일
  - 세 번째 인자에는 `transition` 프로퍼티에 넣었던 객체와 동일하게 합니다.
    - 이 때, stagger는 제공되는 `stagger()`함수를 import하여 `delay: stagger(0.5)`처럼 씁니다.

저는 빈 값을 제출하려 할 때 입력란이 진동되게 했습니다  
아래처럼요

```jsx
const [motionFormRef, motionFormAnimate] = useAnimate();
const handleInputSubmit = e => {
  e.preventDefault();
  const formData = new FormData(e.currentTarget);
  const value = formData.get("demo-input");
  if (!value) {
    motionFormAnimate(
      "input",
      {
        rotateZ: [3, 0, -3, 0]
      },
      {
        duration: 0.2
      }
    );
  }
};

return (
  <form ref={motionFormRef} onSubmit={handleInputSubmit}>
    <input name="demo-input" />
    <button>입력</button>
  </form>
);
```

[데모 : 5](/demo#5)에 구현되어 있습니다

## 스크롤 애니메이션

`useScroll` 훅으로 `scrollX, scrollY, scrollYProgress`같은 값을 가져올 수 있습니다  
`scrollYProgress`는 0~1사이 값을 갖는 진행률이고, `scrollY`는 픽셀값입니다

이제 이 `scrollY`값을 이용하여
`const scrollOpacity = useTransform(scrollY, [0, 200, 300, 500], [1, 0.5, 0.5, 0]);`과 같이

- 첫 번째 인자로, 변화를 추적할 값
- 두 번째 인자로, 브레이크포인트 (scrollY의 픽셀)
- 각 브레이크포인트에 상응하는 반환값

이렇게 하면, `framer motion`라이브러리에서 이 값을 추적하고 변화시킵니다  
그리고 또 이건 상태값으로 관리하는게 아니라서, 컴포넌트 함수를 다시 실행하지 않습니다  
이는 모션 값 객체로 내부에서 알아서 감싸 관리하기 때문인데  
이 덕분에 framer motion에 의한 에니메이션의 적용이 전체 컴포넌트 렌더링 사이클에 영향을 미치지 않게 합니다.  
최적화 방면에서 중요한 역할을 하는 셈이죠

이제 이렇게 얻어온 값을 `<motion.div style={{opacity: scrollOpacity}}>`와 같이 사용합니다.  
이 `style`프로퍼티는 원래도 inline 스타일을 지정할 때 HTML요소에 사용할 수 있었지만  
`<motion.div>`같은 모션 요소에서 더 특별해서, 여기에 모션 값을 넣어주면 그 값의 변화가 애니메이션을 트리거하면서도, 리렌더링이 일어나지 않게 합니다.

전체 코드는 이렇구요

```jsx
const { scrollY } = useScroll();
const scrollOpacity = useTransform(
  scrollY,
  [0, 200, 300, 500, 1000],
  [0, 0.2, 0.3, 0.5, 1]
);
return (
  <motion.div
    style={{
      height: 1000,
      opacity: scrollOpacity
    }}
  ></motion.div>
);
```

데모는 [여기](/demo#6)

## 그 외 잡다한 것들

- `<AnimatePresence>`로 감쌀 때, 이 때 역시 목록처럼 여러 컴포넌트가 있을 때는 `key` props를 줘야 Framer Motion이 이들이 서로 별개임을 알 수 있습니다
- `<AnimatePresence mode='wait'>` 이렇게 하면, 각 애니메이션들은 줄지어서 실행됩니다. (기본값은 `'sync'`라서, 동시에 플레이)
- `<motion.div layoutId='tab-indicator'>` 이런 식으로 `layoutId` 프로퍼티를 추가하면, 이 값이 똑같은 모션 요소들끼리는 전환을 부드럽게 변경해줍니다.

---

\
이거 덕분에 블로그에 애니메이션 좀 넣었네요  
이만 마칩니다
