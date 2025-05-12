---
title: "Zustand 메인테이너가 알려주는 Module State로 전역상태 관리하기"
date: 2025-05-12 20:32:57
description: "[Micro State Management with React Hooks] Chapter 4"
tag: ["TIL", "React", "TypeScript", "JavaScript"]
---

> ! 주의 : TIL 게시글입니다. 다듬지 않고 올리거나 기록을 통째로 복붙했을 수 있는 뒷고기 포스팅입니다.

> [Micro State Management with React Hooks](https://github.com/PacktPublishing/Micro-State-Management-with-React-Hooks)를 읽고 예제와 함께 정리하는 시리즈입니다.

[직전 포스팅](/til/global-state-using-context)에서는 Context를 사용한 전역상태에 대해 다뤘습니다  
Context를 사용하면 서로 다른 서브트리에 서로 다른 값을 제공할 때 이점이 있었는데요  
이러한 경우가 아닌 **singleton 전역 상태**를 전체 트리 범위에서 사용하려는 경우라면, **Module State**를 사용하는 편이 더 어울립니다

시작하기 전에 : 모든 예제 코드는 [공개된 레포지토리](https://github.com/sungpaks/micro-state-management-example)에서 확인하실 수 있고, [여기](https://sungpaks.github.io/micro-state-management-example/)에 대충 배포해두었으니 직접 가셔서 눌러보실 수 있습니다.

# Module State란?

Module State라는 단어는 엄격한 정의 상으로는 **ECMAScript 모듈 스코프에 정의된 상수 또는 변수**인데요  
이 책에서는 간단히 **전역 또는 파일 스코프 내에 정의된 변수**를 말합니다.  
"ECMAScript 모듈 스코프에 정의된"... 이 잘 모르시겠다면 [번들러 이야기](/what-and-why-and-how-bundler)를 한번 보시면 좋을 듯 합니다

간단한 Module State 예시를 살펴보기 위해, React와는 관련없지만 React의 상태처럼 동작하는 `state`를 하나 만들어봅시다.

```js
let state = { count: 0 };
export const getState = () => state;
export const setState = nextState => {
  state = nextState;
};
```

이렇게 `get, set` 함수를 만들었습니다.  
**모듈 밖에서 사용**가능하기 위해 `export`함을 잊지맙시다.

이제 좀 더 React의 상태 엇비슷하려면 `setState`를 함수 업데이트도 가능하게 해봅시다.

```js
export const setState = nextState => {
  state = typeof nextState === "function" ? nextState(state) : nextState;
};
```

이제 이 `setState`는 `setState(prev => ({...prev, count: prev.count + 1}))` 과 같이 익숙한 형태로 사용해볼 수 있습니다.  
이 `state`는 "전역 또는 파일 스코프 내에 정의된 변수"이므로 Module State라고 불릴만 합니다. 별거없네요

또는 이 Module State를 위와 같이 직접 정의하기보다, 이러한 Module State와 그에 접근하는 함수를 동봉하는 컨테이너를 만들어봅시다.

```js
export const createContainer = initialState => {
  let state = initialState;
  const getState = () => state;
  const setState = nextState => {
    state = typeof nextState === "function" ? nextState(state) : nextState;
  };
  return { getState, setState };
};
```

이제 이 Module State는 아래와 같이 사용할 수 있겠네요

```js
import { createContainer } from "...";

const { getState, setState } = createContainer({ count: 0 });
```

## React에서 Module State 사용하기?

전역 변수 `count`를 선언하고 React 컴포넌트에서 이를 사용한다고 해봅시다

```tsx
let count = 0;

const Component = () => {
  const inc = () => {
    count += 1;
  };
  return (
    <div>
      {count} <button onClick={inc}>+1</button>
    </div>
  );
};
```

아쉽게도 기대하는 대로 동작하지는 않습니다.  
버튼을 클릭하면 `count` 변수의 값이 실제로 변하지만, 이는 React State가 아니므로 리렌더링을 유발하지 않습니다.

React에서 리렌더링을 트리거하려면 `useState` 또는 `useReducer`같은 것을 사용해볼 수 있습니다

```tsx
let count = 0;

const Component1 = () => {
  const [state, setState] = useState(count);
  const inc = () => {
    count += 1;
    setState(count);
  };
  return (
    <div>
      {count} <button onClick={inc}>+1</button>
    </div>
  );
};
```
