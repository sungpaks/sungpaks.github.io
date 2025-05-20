---
title: "Context로 전역상태 만들어서 구독과 좋아요 알림설정까지"
date: 2025-05-20 23:32:43
description: "[Micro State Management with React Hooks] Chapter 5"
tag: ["TIL", "React", "TypeScript", "JavaScript"]
---

> ! 주의 : TIL 게시글입니다. 다듬지 않고 올리거나 기록을 통째로 복붙했을 수 있는 뒷고기 포스팅입니다.

> [Micro State Management with React Hooks](https://github.com/PacktPublishing/Micro-State-Management-with-React-Hooks)를 읽고 예제와 함께 정리하는 시리즈입니다.

지난 Chapter 3에서는 Context를 사용한 전역상태 관리를,  
Chapter 4에서는 Module State를 사용한 전역상태 관리를 알아봤습니다

이 두 가지 방법은 각각 그들만의 특징이 있었는데

- Context
  - 서로 다른 하위트리에 서로 다른 전역상태 값을 전달(`different values for different subtree`)할 수 있었지만
  - extra re-render 방지가 아쉬웠습니다
- Module State
  - Selector 또는 Subscription으로 extra re-render를 효과적으로 방지했지만
  - 전역으로 정의된 module state는 트리 어디에서나 동일한 단일 값(singleton)을 전달할 수 있을 뿐이었습니다.

이번 시간에는 이 두 특징들 중 좋은 점만 짬뽕해서 누리는 방법을 탐구해봅니다.

![스까무라](https://i.imgur.com/bmjrTPP.png)

# Module State의 한계

Module State를 사용한 전역상태는 아래와 같이, `createStore`와 `useStore`같은걸 사용했는데요

```tsx
const store = createStore({ color: "black" });

const Component = () => {
  const [state, setState] = useStore(store);
  // ...
};
```

근데 갑자기 "아 여기서만 `color`를 white로 하고 싶은데.." 라는 생각이 들었다면 ..

```ts
const store2 = createStore({ color: "white" });

const Component2 = () => {
  const [state, setState] = useStore(store2);
  // ...
};
```

근데 문제는 다른 값을 사용하려는 니즈가 생길 때마다 `store`를 새로 만들어야 합니다.  
또한 `Component3, Component4, ...`가 `store3, store4, ...` 빼고 다 똑같이 생겼을거지만, 재활용하지 못하고 매번 새로 복붙해서 만들어야 하는 문제가 생깁니다.  
Module State가 React의 외부에 정의되기 때문에요..

그리고.. 그냥 아래와 같이 _props로 store를 지정해주면 재사용가능한거 아님?_ 이라고 생각할 수 있는데

```tsx
const Component = (store: Store) => {
  const [state, setState] = useStore(store1);
};
```

근데 우리는 처음에 *prop drilling*을 줄이기 위해 상태를 전역관리하기 시작했는데, 이건 좀 모순되네요.  
역시 이럴때는 **Context**를 쓰는게 맞습니다.

# Context를 써야할 때

Context를 사용했을 때를 떠올려봅시다.

```tsx
const ThemeContext = createContext("black");

const Component = () => {
  const theme = useContext(ThemeContext);

  return <div>Theme: {theme}</div>;
};
```

그냥 이렇게만 만들어두면, `<Component />`가 어떤 ContextProvider 범위에 속하느냐에 따라 값을 다르게 가져갈 수 있었습니다.  
`<Component2 />, <Component3 />`이런거 만들지 않아도요

```tsx
<ThemeContext.Provider value="white">
  <Component />
  <ThemeContext.Provider value="blue">
    <Component />
  </ThemeContext.Provider>
</ThemeContext.Provider>
```

심지어 위에서 `createContext("black")` 처럼 default value를 전달해둔 경우에는, Provider 없이도 사용하여 default value를 누릴 수 있었습니다.

이렇게 `different values for different subtree`에 해당하는 경우라면 Context가 찹쌀떡입니다  
물론 전체 컴포넌트 트리에서 root Provider 단 하나만 존재하는 경우라면, Context보다는 Module State로 커버가능합니다.

이렇게 하여 Module State와 Context를 리캡하는 시간을 가졌으니,  
이제 Context와 Subscription을 결합하는 패턴을 들여다 봅시다.

# Context + Subscription 패턴

먼저 [_Chapter 4. Module State_](/til/global-state-using-module-state-and-subscription)에서 했던 것과 동일한 `createStore`를 작성하고 시작합니다.

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

## StoreContext + StoreProvider

Chapter 4에서는 `createStore`로 만든 store를 Module State로서 사용했는데,  
이제 이 store를 Context 값으로서 쓸려구요

```tsx
type State = { count: number; text?: string };

const StoreContext = createContext<Store<State>>(
  createStore<State>({ count: 0, text: "hello" })
);
```

이제 StoreProvider를 만들어봅니다.

```tsx
const StoreProvider = ({
  initialState,
  children
}: {
  initialState: State;
  children: React.ReactNode;
}) => {
  const storeRef = useRef<Store<State>>(null);
  if (!storeRef.current) {
    storeRef.current = createStore(initialState);
  }
  return (
    <StoreContext.Provider value={storeRef.current}>
      {children}
    </StoreContext.Provider>
  );
};
```

`useRef`를 사용하여, `StoreProvider`가 처음 render될 때만 store객체가 초기화되도록 구성해줍니다.  
`initialState` 자리에 store 초기값을 전달하면, 이를 ref로 유지하고 그 하위트리에 store를 전역적으로 제공하려고 합니다.  
`different stores for different subtrees`가 되게 하려구요

## useSelector & useSetState

이제 `useSelector`라는 훅을 구현할건데  
이전에 Chapter 4에서 살펴봤던 `useStoreSelector`와 비슷하게 생긴 형태지만  
`store`를 인자로 받았던 `useStoreSelector`와는 다르게, `useSelector`는 `store`객체를 `StoreContext`에서 꺼내다 사용합니다.

```tsx
const useSelector = <S extends unknown>(selector: (state: State) => S) => {
  const store = useContext(StoreContext);
  return useSubscription(
    useMemo(
      () => ({
        getCurrentValue: () => selector(store.getState()),
        subscribe: store.subscribe
      }),
      [store, selector]
    )
  );
};
```

`useSyncExternalStore`를 아래와 같이 사용해도 동일하게 동작합니다.

```tsx
const useSelector = <S extends unknown>(selector: (state: State) => S) => {
  const store = useContext(StoreContext);
  return useSyncExternalStore(
    store.subscribe,
    useCallback(() => selector(store.getState()), [selector, store])
  );
};
```

`useContext`와 `useSubscription`을 함께 사용한다는 점이 키포인트입니다.

그리고 이제, module state때와는 다르게, 상태값을 업데이트할 수 있는 방법도 준비해줘야 합니다.  
`store`가 이제 React 외부가 아닌 Context에 있으니까요

```tsx
const useSetState = () => {
  const store = useContext(StoreContext);
  return store.setState;
};
```

## 이렇게 사용해요

아래와 같은 형태의 store를 만든다고 생각해봅시다.

```tsx
type State = { count: number; text?: string };

const StoreContext = createContext<Store<State>>(
  createStore<State>({ count: 0, text: "Using default store" })
);
```

이제 `selector`함수를 컴포넌트 바깥에 생성해주고,  
`store`로부터 값을 꺼내 사용하거나 `useSetState`로 값을 변경하는 컴포넌트를 적당히 작성해줍니다.

```tsx
const selectCount = (state: State) => state.count;
const selectText = (state: State) => state.text;

const CountComponent = () => {
  const count = useSelector(selectCount);
  const setCount = useSetState();
  const inc = () => {
    setCount(prev => ({ ...prev, count: prev.count + 1 }));
  };
  return (
    <div>
      count: {count} <RenderCount />
      <Button onClick={inc}>+1</Button>
    </div>
  );
};

const TextComponent = () => {
  const text = useSelector(selectText);
  return (
    <h3>
      text: {text} <RenderCount />
    </h3>
  );
};
```

이제 이 컴포넌트들을 사용하되,  
`<StoreProvider>`로 어떤 하위트리에는 다른 값들을 전달하게 할 수 있습니다.

```tsx
function App() {
  return (
    <>
      <TextComponent />
      <CountComponent />
      <br />
      <StoreProvider initialState={{ count: 10, text: "Using store provider" }}>
        <TextComponent />
        <CountComponent />
        <br />
        <StoreProvider
          initialState={{ count: 20, text: "Using inner store provider" }}
        >
          <TextComponent />
          <CountComponent />
        </StoreProvider>
      </StoreProvider>
    </>
  );
}
```

아래에서 이 예제가 잘 동작하는지 확인해보세요

<iframe src="https://sungpaks.github.io/micro-state-management-example/sharing-component-state-with-context-and-subscription"
class="example-embed"
  title="Module State Example"
  loading="lazy"
  style="height: 600px"  
>
</iframe>

`<Component />` 컴포넌트가 **어떤 특정 `store`에 종속적이지 않다**는 점이 중요합니다.

- `<StoreProvider>`가 없다면 default store(`createStore`에서 전달한)를 씁니다.
- `<StoreProvider>`를 한 번 감싸면, `<StoreProvider>`에 전달한 `initialState`값으로 새로운 store가 만들어지고 이 새로운 store를 꺼내 사용합니다.
- `<StoreProvider>`로 또 감싸면, 또 store가 만들어지고 이 또 새로운 store를 꺼내 사용합니다.

이렇게 하여 `different stores for different subtree`를 구현합니다.  
또한 Subscription을 사용한 덕분에 extra re-render 걱정도 없구요.  
이 덕분에 Context 구독자가 많아져서 골드버튼도 받을 수 있곘네요

---

\
이번 챕터는 좀 짧고 이전 내용 Recap과 응용이 많았습니다  
이 다음 내용은 저자이신 다이시 카토 선생님이 만드신 `Zustand, Jotai, Valtio`의 특징 비교, 구현 등인데요  
다음 글도 이에 대한 내용을 정리해서 올 것 같습니다

이만 마칩니다
