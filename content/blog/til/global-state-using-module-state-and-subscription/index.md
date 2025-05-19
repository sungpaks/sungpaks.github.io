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
  const inc1 = () => {
    count += 1;
    setState(count);
  };
  return (
    <div>
      {count} <button onClick={inc1}>+1</button>
    </div>
  );
};
```

이러면 버튼을 누르면 실제로 `count`가 올라갑니다.  
근데 여기서 `Component2`를 또한 추가해보면

```tsx
let count = 0;

const Component1 = () => { ... }
const Component2 = () => {
  const [state, setState] = useState(count);
  const inc2 = () => {
    count += 2;
    setState(count);
  };
  return (
    <div>
      {count} <button onClick={inc2}>+2</button>
    </div>
  );
};
```

`Component1`과 거의 동일하게 `Component2`를 구현하고 이제 눌러봅니다.

![상태가 따로 관리됨](https://i.imgur.com/7vPhrAs.gif)

버튼을 누르면 `count`가 올라가긴 하지만, 당연히도 각 컴포넌트의 `count`상태는 공유되지 않습니다.  
각 컴포넌트의 `count`만 따로 관리하는 상태인데요, 이게 `count`값들이 컴포넌트 간에 공유되었으면 좋겠습니다

`count` 상태변화를 컴포넌트 간에 공유하기 위한 _아주 단순한_ 방법으로, `setState`함수들을 한 데 모아 한번에 트리거해볼 수 있습니다.

```tsx
let count = 10;
const setStateFunctions = new Set<(count: number) => void>();

const Component1 = () => {
  const [state, setState] = useState(count);
  useEffect(() => {
    setStateFunctions.add(setState);
    return () => {
      setStateFunctions.delete(setState);
    };
  }, []);
  const inc1 = () => {
    count += 1;
    setStateFunctions.forEach((fn) => fn(count));
  };
  return (
    <div>
      {state} <Button onClick={inc1}>+1</Button>
    </div>
  );
};

const Component2 = () => { ... };
```

`const setStateFunctions = new Set()`과 같이 **`setState`함수들 모음집**을 만들고,  
`count`를 증가시키는 함수는 `setStateFunctions`에 있는 함수들을 모두 트리거하게 하는 방식입니다  
근데 이런 방식은 그다지 현실적이진 않네요. 두 컴포넌트들에 불필요하리만큼 반복적인 코드를 작성해야 했습니다.

<iframe
  src="https://sungpaks.github.io/micro-state-management-example/sharing-module-state-with-subscription/"
  class="example-embed"
  title="Module State Example"
  loading="lazy"
  style="height: 600px"
></iframe>

살펴봤던 내용에 대한 동작 예제를 여기에서 확인하실 수 있습니다.

# 기본적인 subscription을 추가하기

**Subscription**이란 **업데이트같은 변화에 대해 notify를 받는 패턴**입니다.  
보통 아래와 같이 생기는게 국룰인데

```ts
const unsubscribe = store.subscribe(() => {
  console.log("store is updated");
  // .. 다른 작업 ..
});
```

위 코드는 다음과 같은 subscription 구현을 가정합니다:

- `store`라는 변수는 `subscribe` 라는 메서드를 가진다.
- `subscribe`라는 메서드는 callback함수를 인자로 받는다.
- `subscribe`라는 메서드는 `unsubscribe`라는 함수를 반환한다.

`store`에 어떤 변화가 들어왔다면 `subscribe`에 전달한 콜백함수가 실행되기를 기대하는 것이 첫 째요,  
`subscribe(callbackFn)`으로 구독했다면 이 구독을 취소할 `unsubscribe` 함수를 반환받기를 기대하는 것이 둘 째입니다.

그럼 이제부터, 이 Subscription으로 module state 관리를 구현해봅시다.

# `createStore`

module state 상태값과 `subscribe` 메서드를 갖는 객체를 `store`라고 부르고, `store` 팩토리인 `createStore`함수를 만들어봅니다.

```ts
export type Store<T> = {
  getState: () => T;
  setState: (action: T | ((prev: T) => T)) => void;
  subscribe: (callback: () => void) => () => void;
};

export const createStore = <T extends unknown>(initialState: T): Store<T> => {
  let state = initialState;
  const callbacks = new Set<() => void>();

  const getState = () => state;

  const setState = (nextState: T | ((prev: T) => T)) => {
    state =
      typeof nextState === "function"
        ? (nextState as (prev: T) => T)(state)
        : nextState;
    callbacks.forEach(callback => callback());
  };

  const subscribe = (callback: () => void) => {
    callbacks.add(callback);
    return () => callbacks.delete(callback);
  };

  return { getState, setState, subscribe };
};
```

이전에 살펴본 `createContainer`와 비슷하게 생겼지만 다른 점은 아래와 같은 Subscription이 추가되었다는 점입니다.

- 이 모듈 상태를 구독할 수 있는 `subscribe`메서드
- 상태 업데이트 + 다른 구독 callback들을 트리거하는 `setState`

이제 이 `createStore`로

```ts
import { createStore } from "...";

const store = createStore({ count: 0 });
console.log(store.getState());
store.setState({ count: 1 });
store.subscribe(() => {
  console.log("store is updated!!");
});
```

이런 식으로 사용해볼 수 있습니다.  
`store`는 내부에 `state`라는 상태 변수를 관리하는 하나의 Module State입니다.  
그리고 여기까지 `createStore`는 React의 기능을 일절 사용하지 않은, 바닐라 JS로도 문제없이 돌아가는 예시입니다

# `useStore`

이제 `store`를 React에서 사용하기 위한 `useStore`훅을 만들어 봅시다

```ts
export function useStore<T extends unknown>(store: Store<T>) {
  const [state, setState] = useState(store.getState());
  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      setState(store.getState());
    });

    setState(store.getState()); // [1]

    return unsubscribe;
  }, [store]);
  return [state, store.setState] as const;
}
```

`useEffect`로 `store`를 구독하여 상태를 관리합니다.  
`store`의 값이 변하면 `state`도 변하고, 상태값의 변경은 `store.setState`를 통하여 다른 모든 구독자들이 영향받게 합니다.

중요한 지점이 주석친 `[1]` 부분인데, 이에 대한 원문 언급은 다음과 같습니다.

> This is to cover an edge case. It invokes the `setState()` function once in `useEffect`.  
> This is due to the fact that `useEffect` is delayed and there's a change that `store` already has a new state.

그러니까 `useEffect`는 **늦게 실행된다**라는 말인데  
`useEffect`는 아시다시피 브라우저의 paint가 끝난 후 사이드 이펙트를 실행합니다.  
그 사이에 `store`의 상태값이 이미 바뀌었을 수 있고, 따라서 상태를 한 번 동기화해줍니다.  
만약 `[1]`에서 `store.getState()`값이 그대로라면, 상태값 비교가 동일하므로 리렌더링은 일어나지 않습니다(bail out).

이제 `useStore`를 사용해봅시다

```tsx
const Component1 = () => {
  const [state, setState] = useStore(store);
  const inc1 = () => setState(prev => ({ ...prev, count: prev.count + 1 }));
  return (
    <div>
      {state.count} <button onClick={inc1}>+1</button>
    </div>
  );
};
```

그냥 `useState` 쓰듯이 쓸 수 있습니다.

# extra re-render 방지하기

위에서 살펴본 `useStore` 훅은 상태값 객체 전체를 반환합니다.  
이는 객체의 아주 일부만 업데이트되더라도 모든 구독자들이 리렌더링 대상이 된다는 말이고,  
[이전 글에서 살펴본 extra re-render](/til/global-state-using-context/#context-사용-시-extra-re-render에-주의)문제가 다시 발생합니다.

## Working with Selector

Selector라는 잡기술을 써서 객체의 일부분만 골라서 써봅시다.  
먼저 예를 들어 아래와 같은 객체를 상태로 갖는 `store`를 만들었다고 해봅시다

```tsx
const store = createStore({ count1: 0, count2: 0 });
```

이제 아까같았으면 `useStore`로 이 store를 사용했을텐데요  
대신에 `useStoreSelector`를 구현해봅시다.  
이 `useStoreSelector` 훅은 필요한 값만을 **select**하는 함수를 인자로 받습니다.

```tsx
const useStoreSelector = <T, S>(store: Store<T>, selector: (state: T) => S) => {
  const [state, setState] = useState(() => selector(store.getState()));

  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      setState(selector(store.getState()));
    });
    return unsubscribe;
  }, [store, selector]);

  return state;
};
```

사용할 값만을 골라내는 `selector`함수를 추가 인자로 받고,  
이 `selector`함수의 반환값만을 state로 유지합니다.  
아래와 같이 사용할 수 있습니다.

```tsx
const Component1 = () => {
  const state = useStoreSelector(
    store,
    useCallback(state => state.count1, [])
  );
};

const selectCount2 = (state: ReturnType<typeof store.getState>) => state.count2;
const Component2 = () => {
  const state = useStoreSelector(store, selectCount2);
};
```

`useCallback`을 사용하거나, selector함수를 컴포넌트 바깥에 선언하여 함수가 안정적인 참조를 가지게끔 해줍시다.  
이 방법의 장점은, **파생 상태**를 쉽게 정의할 수 있다는 점입니다. 이에 관해서는 다음 챕터에서 알아봅니다.

# Working with useSubscription

위에서 살펴본 `useStoreSelector`는 잘 작동하지만, 약간의 주의해야 할 점이 있습니다.
`useEffect` 실행에는 조금의 텀이 있으므로(원문: `Because useEffect fires a little later`),  
`store`나 `selector`가 변경되는 경우 재구독이 끝나기 전까지 stale한 상태값을 반환하게 됩니다.  
이를 직접 고칠 수도 있겠지만 그러려면 기술적 노력이 은근히 들어갑니다 ..

감사하게도 React에서 별도로 제공하는 [useSubscription](https://www.npmjs.com/package/use-subscription)패키지가 있는데요  
아까 `useStoreSelector` 없이도 바로 `useSubScription`과 `store`를 사용할 수 있습니다.

```tsx
useSubscription(useMemo(
  ()=>{
    getCurrentValue: ()=>store.getState().count, // store에서 원하는 값
    subscribe: store.subscribe // store에서 subscribe 메서드 가져오기
  },
  []
))
```

짜잔~ 아주쉽네요  
공식문서에서 말하길, `getCurrentValue`와 `subscribe` 두 개의 메서드를 객체로 반환하면 됩니다.  
이 때, 훅이 호출될 때마다 구독이 다시 진행되는 일을 막기 위해 `useMemo`로 감쌉니다.  
이는 React 18에서 `useSyncExternalStore`가 도입되기 전까지 효과적으로 외부 store를 구독하기 위해 사용할 수 있는 방법이었습니다.

## Working with useSyncExternalStore?

이 책이 쓰여질 당시에는 React 18이 아직 나오기 전이었고, `useSyncExternalStore`가 나온다는 사실만 알려져 있었습니다.  
다이시 카토 선생님도 이에 대한 짧은 언급을 하고 넘어갔는데요  
지금은 React 18이 이미 나왔고 `useSyncExternalStore`를 사용할 수 있으니, 어떻게 사용할 수 있는지 궁금해져서 찾아봤습니다

일단, `useSyncExternalStore`란 **동시성 렌더링 중에도 안전하게 저장소의 값을 적절히 구독**할 수 있는 훅입니다.

- External Store란 우리가 **구독**할 수 있는 무언가를 뜻하는데
  - Internal Store로는 props, context, useReducer, useState 등을 떠올려볼 수 있습니다. Component의 범위를 벗어나지 않네요
  - External Store로는 전역변수, 모듈 스코프 변수(Module State), DOM 상태, redux또는 zustand store 등.. 을 생각해볼 수 있습니다. Component 바깥에 존재합니다.

기존 `useStore`를 어떻게 대체할 수 있는지 봅시다.

```tsx
const useStore = (store, selector) => {
  const [state, setState] = useState(() => selector(store.getState()));
  useEffect(() => {
    const callback = () => setState(selector(store.getState()));
    const unsubscribe = store.subscribe(callback);
    callback();
    return unsubscribe;
  }, [store, selector]);
  return state;
};
```

useStore는 이렇게 생겼었죠? `selector` 함수를 전달받고, 그 반환값을 상태로 유지해서, `useEffect`에서 구독을 구현합니다.  
이 대신에 `useSyncExternalStore`를 사용하면 매우 간단해집니다.

```tsx
const useStore = (store, selector) => {
  return useSyncExternalStore(
    store.subscribe,
    useCallback(() => selector(store.getState(), [store, selector]))
  );
};
```

`useSyncExternalStore`의 [공식문서 레퍼런스](https://ko.react.dev/reference/react/useSyncExternalStore)는 아래와 같습니다

> store에 있는 데이터의 스냅샷을 반환합니다. 두 개의 함수를 인수로 전달해야 합니다.
>
> 1. subscribe 함수는 store를 구독하고 구독을 취소하는 함수를 반환해야 합니다.
> 2. getSnapshot 함수는 store에서 데이터의 스냅샷을 읽어야 합니다.

### Tearing 현상과 useSyncExternalStore

이제 궁금해질 수 있는 것은, `useSyncExternalStore`가 왜 필요했는지, 일 것 같아요  
React 18부터는 **동시성 렌더링**이 가능해졌는데, 잘 모르시겠다면 [여기를 참고](/react-18-concurrency-and-streaming-with-rsc/#react-18---%EB%8F%99%EC%8B%9C%EC%84%B1-%EC%97%85%EB%8D%B0%EC%9D%B4%ED%8A%B8)하시면 좋을 것 같구요.  
아무튼 간에, 이제 렌더링이 **중단 가능**해짐에 따라, Tearing 현상이 발생했습니다.

[Tearing](https://github.com/reactwg/react-18/discussions/69)이란, **렌더링 도중 React가 store를 업데이트하게 되면 UI 불일치가 발생하는 현상**인데요

<figure>

![tearing 현상](https://i.imgur.com/2SoslYl.png)

<figcaption>

출처: Discussion from React 18 Working Group, "what is tearing?"

</figcaption>

</figure>

이전에는 렌더링이 Synchronous해서, store값이 `blue`임을 보고 렌더링을 진행하기 시작하면, 그 중간에 store값이 `red`로 바뀌어도 렌더링이 모두 진행되고 나서야 이 변경이 진행되었습니다.  
그러나 이제 렌더링이 "중간에 끝날 수 있게"되었고, 아래와 같은 시퀀스가 가능해졌습니다.

1. 어떤 컴포넌트가, store값이 `blue`임을 보고 렌더링..
2. 렌더링이 중단되고 store값이 `red`로 업데이트됨
3. 이제 다시 렌더링을 재개, 다른 컴포넌트들은 store값이 `red`임을 보고 렌더링..

이로 인해 위 그림처럼, UI 불일치가 발생할 수 있게 됩니다.  
이러한 tearing 현상을 방지하고 외부 store와 React간의 동기화를 위해 `useSyncExternalStore`를 사용합니다.

다이시 카토 선생님이 쓰신 [Why useSyncExternalStore is not used in Jotai](https://blog.axlight.com/posts/why-use-sync-external-store-is-not-used-in-jotai/)라는 글도 있는데요, 한 번 읽어보면 견문이 깊어집니다.  
귀찮으실까봐 대충 정리해드리자면

- `useState`(또는 `useReducer`) + `useEffect`를 사용하는 방법과 `useSyncExternalStore`를 사용하는 방법 사이의 차이점은 _일시적인 tearing 현상_ 임.
- Jotai는 외부 store를 사용하는게 아닌 Context 혼합방식을 사용하므로, `useTransition`과 함께 동시성 렌더링을 사용하도록 설계되었음
  - `useState`를 사용하며 `useTransition`과의 결합을 보장한다는 점이 tearing보다 중요한 설계 지점임
- Zustand는 외부 store를 사용하여 구현되므로 `useSyncExternalStore`를 사용함.
  - Zustand를 `useTransition`과 사용하면 뭔가 이슈가 있는데([데모참조](<[https://codesandbox.io/s/9ss9r6](https://codesandbox.io/s/9ss9r6)>)), 이는 `useTransition`의 pending상태에 의한 fallback이 아닌 Suspense fallback을 보여주는 쪽으로 설계되어서임

> Ideally, if React provides a building-block function to allow creating a custom useState-like hook (that requires state versioning), Jotai can do it better.  
> It’s very unlikely that it will happen. So, it’s a trade-off.

---

\
지난 글에서는 Context를 사용한 전역상태 관리를,  
이번 글에서는 Module State를 사용한 전역상태 관리를 알아봤습니다  
다음 글에서는 이 두 가지 패턴을 쓰까먹어보겠습니다.
