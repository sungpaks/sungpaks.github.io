---
title: "Jotai 메인테이너가 알려주는 Context로 전역상태 관리하기"
date: 2025-05-05 18:53:15
description: "[Micro State Management with React Hooks] Chapter 3"
tag: ["TIL", "React", "TypeScript", "JavaScript"]
---

> ! 주의 : TIL 게시글입니다. 다듬지 않고 올리거나 기록을 통째로 복붙했을 수 있는 뒷고기 포스팅입니다.

> [Micro State Management with React Hooks](https://github.com/PacktPublishing/Micro-State-Management-with-React-Hooks)를 읽고 예제와 함께 정리하는 시리즈입니다.

React에서 상태(state)는 범위에 따라 크게 두 가지로 나눌 수 있습니다

- local state: 상태가 단일 컴포넌트에 속하며 동봉되어있는 경우 (encapsulated)
- global state: 상태가 여러 컴포넌트에서 사용되는 경우

또한 global state라고 하면 두 가지 관점으로 나뉘는데

- singleton: 전체 React 트리에서 상태가 단 하나의 값만을 가집니다(어디서나 동일한 값).
- shared state: 상태의 값이 서로 다른 컴포넌트들 사이에 공유되지만, 그 값이 단 하나만 있지는 않습니다.

예를 들어 아래와 같은 non-singleton 상태 변수를 생각해볼 수 있습니다(React와는 관계 없는 바닐라 JS코드):

```js
const createContainer = () => {
  let base = 1;
  const addBase = n => n + base;
  const changeBase = b => {
    base = b;
  };
  return { addBase, changeBase };
};

const container1 = createContainer();
const container2 = createContainer();

container1.changeBase(10);

console.log(container1.addBase(2)); // 3
console.log(container2.addBase(2)); // 12
```

여기에서 `base`라는 변수는 container 내부로 그 scope가 제한됩니다  
`base`는 컨테이너에 의해 독립적인 환경을 가지므로 서로 다른 컨테이너의 `base` 간에는 서로 영향을 미치지 않습니다  
각 컨테이너마다 `base`값이 다르게 유지되므로 singleton은 아니네요.

React에서 전역변수를 non-singleton이면서, shared state 형태로 관리하고자 하면 [Context](https://ko.react.dev/learn/passing-data-deeply-with-context)를 사용하기 좋습니다

# Context로 전역상태 만들기

`Context`는 아래와 같은 경우 사용하기 좋습니다.

- props로 데이터를 전달하는게 썩 내키지 않는 경우 (너무 깊게 전달하게 되는 경우)
- 서로 다른 React **sub-tree 내에서 다른 값을 전달**하려는 경우

특히 두 번째가 중요한데, 이에 해당하지 않는다면 `Context`보다는 다른 전략을 사용하는 편이 나을 수 있습니다.

`Context` 사용하여 아래와 같이 `color`값을 공유하는 기본적인 예제를 살펴봅니다.

```tsx
const ColorContext = createContext("black");

const Component = () => {
  const color = useContext(ColorContext);
  return <div style={{ color }}>Hello {color}</div>;
};

const BenefitOfContextExample = () => (
  <>
    <Component />
    <ColorContext.Provider value="red">
      <Component />
    </ColorContext.Provider>
    <ColorContext.Provider value="green">
      <Component />
    </ColorContext.Provider>
    <ColorContext.Provider value="blue">
      <Component />
      <ColorContext.Provider value="skyblue">
        <Component />
      </ColorContext.Provider>
    </ColorContext.Provider>
  </>
);
```

![useContext로 static한 값 전달하기 예제](image.png)

위에서 언급한 바와 같이 `Context`를 사용하면 이렇게 **서로 다른 서브트리에 서로 다른 값을 전달**할 수 있습니다.  
심지어 Provider를 중첩하여 하위 서브트리에서 값을 바꾸어 전달할 수도 있습니다.

![Context로 값을 하위 트리에 다르게 전달하는 예시 그림](https://i.imgur.com/GaMdOD8.png)

(위의 예제 코드와 일치하는 그림은 아니지만), `Context`는 이런 식으로 shared state 형태의 global state를 구현하기 좋은 도구입니다.

## `useContext`로 상태 값만 전달받기

위에서 살펴본 것과 같이, 단순한 **상태값**만 여러 컴포넌트에서 공유받고 싶을 수 있습니다.

```tsx
const CountContext = createContext<number>(0);

function App() {
  const [count, setCount] = useState(0);
  return (
    <CountContext.Provider value={count}>
      <Counter1 />
      <Counter2 />
      <button onClick={() => setCount(c => c + 1)}>Up</button>
    </CountContext.Provider>
  );
}

function Counter1() {
  const count = useContext(CountContext);
  return <div>Count1: {count}</div>;
}

function Counter2() {
  const count = useContext(CountContext);
  return <div>Count2: {count}</div>;
}
```

이 경우 상태값의 변경은 최상위 컴포넌트에서만 담당하고, 하위 컴포넌트는 이 값을 **읽기**만 합니다.

![자식 컴포넌트에서는 값만 받아 사용하기](https://i.imgur.com/I425mRG.gif)

## `useContext`로 `useState` 튜플을 전달하기

또는 `useState` 튜플을 다 전달하여 자식 컴포넌트가 상태값을 수정할 수도 있게 할 수도 있습니다.

```tsx
const CountStateContext = createContext({
  count: 0,
  setCount: (_: SetStateAction<number>) => {}
});

const App = () => {
  const [count, setCount] = useState(0);
  return (
    <CountStateContext.Provider value={{ count, setCount }}>
      <Parent />
    </CountStateContext.Provider>
  );
};

const Parent = () => (
  <>
    <Component1 />
    <Component2 />
  </>
);

const Component1 = () => {
  const { count, setCount } = useContext(CountStateContext);
  return (
    <div>
      Count: {count} <Button onClick={() => setCount(c => c + 1)}>+1</Button>
    </div>
  );
};

const Component2 = () => {
  const { count, setCount } = useContext(CountStateContext);
  return (
    <div>
      Count: {count} <Button onClick={() => setCount(c => c + 2)}>+2</Button>
    </div>
  );
};
```

![자식 컴포넌트에서 useState 튜플을 모두 받아 사용하기](https://i.imgur.com/LTNCzcW.gif)

# Context 사용 시 Extra Re-render에 주의

이제 이러한 전역 상태를 더 복잡하게 만들어봅시다. 예를 들면 객체같은

```tsx
type CountContextTYpe = {
  count1: number;
  count2: number;
};

export const CountContext = createContext<CountContextType>({
  count1: 0,
  count2: 0
});

function Count1() {
  const { count1 } = useContext(CountContext);
  return <div>Count1: {count1}</div>;
}

function Count2() {
  const { count2 } = useContext(CountContext);
  return <div>Count2: {count2}</div>;
}

function Parent() {
  return (
    <>
      <Count1 />
      <Count2 />
    </>
  );
}
```

`Count1`은 `count1` 상태값에만 관심이 있고, `count2`값에는 관심이 없습니다  
이제 상위 컴포넌트에서 :

```tsx
function ExtraRerenderProblemExample() {
  const [count1, setCount1] = useState(0);
  const [count2, setCount2] = useState(0);
  return (
    <CountContext.Provider value={{ count1, count2 }}>
      <Button onClick={() => setCount1(c => c + 1)}>count1 +1</Button>
      <Button onClick={() => setCount2(c => c + 1)}>count2 +1</Button>
      <Parent />
    </CountContext.Provider>
  );
}
```

이런 버튼을 만들었고 `count2`값을 올리려고 `count2 +1` 버튼을 누른다고 생각해봅시다.  
`count1`값은 변하지 않았으니 `<Count1 />`은 리렌더링되지 않았으면 좋겠는데요  
그러나 Context값이 변경되면 그 Consumer들은 리렌더링을 피하지 못합니다

다음과 같은 코드를 추가해서 렌더링 횟수를 추적해봅시다.

```tsx
unction Count1() {
  const { count1 } = useContext(CountContext);
  const renderCount = useRef(0);
  useEffect(() => {
    renderCount.current += 1;
  });
  return (
    <div>
      Count1: {count1}
      <span>(Render count: {renderCount})</span>
    </div>
  );
}
```

결과는 ..

![extra re-rendering](https://i.imgur.com/2cyYJNj.gif)

아래에서 직접 확인해볼 수도 있습니다.

<iframe src="https://sungpaks.github.io/micro-state-management-example/sharing-component-state-with-context#context-extra-rerender-limitations"
class="example-embed"
  title="Extra Re-render Problem"
  loading="lazy"
  style="height: 600px"  
>
</iframe>

`<Count1 />`을 `memo()`로 감싸거나 해도 결과는 동일합니다.  
사실은 위 gif 예시가 `memo()`로 감싼 경우예요.

이렇게 리렌더링되지 않아야 마땅한 컴포넌트가 리렌더링되는 경우를 **Extra Re-Renders** 라고 부릅니다.  
이러한 기술적인 오버헤드를 줄이고 싶다면 두 가지 방법을 시도해볼 수 있습니다.

## 1. 상태를 작은 조각들로 나누기

객체로 같이 묶여있어서 문제라면, 각 프로퍼티마다 각각의 Context를 따로 만들어주면 될거같네요  
예를 들어, 위에서와 같이 `count1, count2`를 쓰려면..

```tsx
const Count1Context = createContext(0);
const Count2Context = createContext(0);

...
<Count1Context.Provider>
  <Count2Context.Provider>
    {children}
  </Count2Context.Provider>
</Count1Context.Provider>
```

그리고 값 뿐만 아니라 setState까지 context로 전파하고 싶다면

```tsx
type CountContextType = [number, Dispatch<SetStateAction<number>>];

const CountContext1 = createContext<CountContextType>([0, () => {}]);
function Provider1({ children }: { children: React.ReactNode }) {
  const [count1, setCount1] = useState(0);
  return (
    <CountContext1.Provider value={[count1, setCount1]}>
      {children}
    </CountContext1.Provider>
  );
}
```

이렇게 `[state, setState]` 튜플로(`useState`반환값 하듯이) context를 만들고,  
Provider 역할을 가져갈 컴포넌트를 하나 만들어서 (상태 관리) + (Provider 감싸기)를 수행하게 하면 딱 깔끔하네요

![solution 1: 상태를 작은 조각들로 나누기 예제 동작](https://i.imgur.com/gWlAsve.gif)

아래에서 실제로 확인해보세요

<iframe src="https://sungpaks.github.io/micro-state-management-example/sharing-component-state-with-context/solution1"
class="example-embed"
  title="Context Extra Re-render Solution2"
  loading="lazy"
  style="height: 600px"  
>
</iframe>

값들을 따로 쓸 것이 분명한 경우에 이렇게 그냥 분할시켜두는 것도 괜찮겠습니다

## 2. useReducer를 사용하여 상태는 하나만 유지하고, 여러 Context로 전파

```tsx
type Action = { type: "INC1" } | { type: "INC2" };

const Count1Context = createContext(0);
const Count2Context = createContext(0);
const DispatchContext = createContext<Dispatch<Action>>(() => {});

function Provider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(
    (prev: { count1: number; count2: number }, action: Action) => {
      if (action.type === "INC1") {
        return {
          ...prev,
          count1: prev.count1 + 1
        };
      }
      if (action.type === "INC2") {
        return {
          ...prev,
          count2: prev.count2 + 1
        };
      }
      throw new Error("no matching action");
    },
    { count1: 0, count2: 0 }
  );

  return (
    <Count1Context.Provider value={state.count1}>
      <Count2Context.Provider value={state.count2}>
        <DispatchContext.Provider value={dispatch}>
          {children}
        </DispatchContext.Provider>
      </Count2Context.Provider>
    </Count1Context.Provider>
  );
}
```

이런 식으로, useReducer를 사용해볼 수 있습니다.

- 상태 값은 각 프로퍼티마다 하나씩, `Context`를 만들어 전파합니다.
- 상태 값을 변경하는 함수 `dispatch`를 또한 전파하기 위해 또 하나의 `Context`를 만듭니다.

`useReducer`는 이렇게 복잡한 상태 관리를 통합하는 장점이 있네요

이제 각 컴포넌트들에서는

```tsx
function Counter2() {
  const count2 = useContext(Count2Context);
  const dispatch = useContext(DispatchContext);
  return (
    <div className="flex gap-2">
      Count2: {count2}
      <Button onClick={() => dispatch({ type: "INC2" })}>+1</Button>
    </div>
  );
}
```

이런 식으로, 값 조회는 `Count2Context`에서, 값 변경은 `DispatchContext`에서 가져다 쓰면 됩니다

![solution 2: useReducer와 여러 context 사용 예제 동작](https://i.imgur.com/Msd1zn3.gif)

이것도 예제 동작을 확인해보실 수 있습니다.

<iframe src="https://sungpaks.github.io/micro-state-management-example/sharing-component-state-with-context/solution2"
class="example-embed"
  title="Context Extra Re-render Solution2"
  loading="lazy"
  style="height: 600px"  
>
</iframe>

# Context 더 잘 쓰기

지금부터는 Context를 더 고수처럼 쓸 수 있는 잡기술을 살펴보겠습니다

## Provider 컴포넌트와 커스텀 훅 세트로 만들기

지금까지는, context를 사용할 컴포넌트에서 직접 `useContext(Count1Context)`처럼 `useContext`를 호출했습니다  
그 대신, `useContext(Count1Context)`를 추상화하는 커스텀 훅을 만들면 좋을 것 같아요

- 혹시라도 Provider 없이 또는 외부에서 사용하는 경우를 알 수 있게 하고,
- 더 명시적으로 Context를 사용할 수 있게

```tsx
type CountContextType = [number, Dispatch<SetStateAction<number>>];

const Count1Context = createContext<CountContextType | null>(null);

const Count1Provider = ({ children }: { children: ReactNode }) => {
  return (
    <Count1Context.Provider value={useState(0)}>
      {children}
    </Count1Context.Provider>
  );
};

function useCount1() {
  const value = useContext(Count1Context);
  if (!value) {
    throw new Error("Provider Missing");
  }
  return value;
}
```

이런 식으로 만들면 될 것 같습니다.  
꽤 자주 쓰이는 패턴인데요

- `useCount1` 커스텀훅을 두어 Consumer 컴포넌트는 `useCount1()`만 호출하면 되고,
- `<Count1Context.Provider value={useCount(0)}>`과 같이 감싸주는 Provider 컴포넌트를 만들어 상태관리와 Provider를 간단하게 압축했습니다.

이렇게 `Context`, `Provider`, 그리고 커스텀 훅까지, 세 개를 한 세트로 만들면 아주 편합니다  
저는 항상 이 세트를 다 담는 파일 이름을 고민했었는데요 ㅋㅋㅋ 책에서 `/contexts/count1.tsx`와 같이 으레 한다고 합니다.

## 커스텀훅 팩토리 패턴

근데 매번 Context 만들 때, 위와 같은 과정을 매번 거치려면 좀 귀찮습니다  
이를 단 몇 줄로 줄여버리는 팩토리 패턴을 사용해봅시다.

```tsx
const createStateContext = <Value, State>(
  useValue: (init?: Value) => State // 값(init)을 받아 상태(state)를 반환하는 훅을 전달.
  // ex: (0) => useState(0), ()=>useReducer(reducer, initialState),
) => {
  // Context 생성
  const StateContext = createContext<State | null>(null);

  // Provider 컴포넌트 생성
  const StateProvider = ({
    initialValue, // useValue훅의 초기값 (optional)
    children
  }: {
    initialValue?: Value;
    children?: ReactNode;
  }) => (
    <StateContext.Provider value={useValue(initialValue)}>
      {children}
    </StateContext.Provider>
  );

  // Context의 값을 뱉는 커스텀훅
  const useContextState = () => {
    const value = useContext(StateContext);
    if (!value) {
      throw new Error("Provider Missing");
    }
    return value;
  };

  return [StateProvider, useContextState] as const;
};
```

이 `createStateContext` 팩토리 함수는 `useValue`라는 어떤 훅을 인자로 받습니다.  
이 `useValue`는 상태(`State`)를 반환하는 훅의 형태면 됩니다.  
예를 들어: `(0) => useState(0), () => useReducer(reducer, initialState), ..`

이제 직전에서 살펴본 세 가지를 한번에 해결하는 일종의 컨테이너가 됩니다:

- `Context`를 만든다. => `useValue`의 반환값과 동일한 타입으로.
- `Provider`컴포넌트를 만든다. => 초기 값(`initialValue`)을 받아 `useValue`를 실행한 결과 나온 상태를 전달하게.
- `useContextState` 커스텀 훅을 만든다. => `Context`의 값을 받을 수 있게.

이제 `Provider`와 커스텀훅을 반환해주면 끝입니다

이거 진짜 강력한데, 이제 그냥 단 한 줄로 `Context` + `Provider` + 커스텀훅을 찍어낼 수 있습니다.  
예를 들어 `count1, count2, count3, ...` 여러 카운트에 대한 Context 전역상태를 만들려면

```tsx
const useNumberState = (init?: number) => useState(init);

const [Count1Provider, useCount1] = createStateContext(useNumberState);
const [Count2Provider, useCount2] = createStateContext(useNumberState);
const [Count3Provider, useCount3] = createStateContext(useNumberState);
```

이제 나머지는 위에서와 동일하게 가면 됩니다. Consumer들을 `<CountProvider>`로 감싸고, 쓸 때는 `useCount()`와 같이요

```tsx
<Count1Provider initialValue={10}>
  <Count2Provider initialValue={20}>
    <Count3Provider initialValue={30}>
      <Parent />
    </Count3Provider>
  </Count2Provider>
</Count1Provider>

...
function Counter1() {
  const [count1, setCount1] = useCount1();

  return ...
}
```

아주 편해졌네요.  
근데 아직도 맘에 안드는 것이 하나 있는데, Provider가 자꾸 중첩되어서 장풍처럼 된다는 점입니다

![nesting 장풍](https://i.imgur.com/VngXPFN.png)

## Provider Nesting 피하기: `reduceRight`

[Array.prototype.reduceRight](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Global_Objects/Array/reduceRight) 메서드를 활용하여 Provider가 많아져도 문제없이 Provider를 통합해볼 수 있습니다.

통합하려는 Provider를 모두 모아 배열로 먼저 준비합니다.

```tsx
const providers = [
  [Count1Provider, { initialValue: 10 }],
  [Count2Provider, { initialValue: 20 }],
  [Count3Provider, { initialValue: 30 }]
] as const;
```

이제 이를 `reduceRight`로 모두 쓰까버립시다

```tsx
// ex. children을 감싼다고 할 때..
providers.reduceRight(
  (innerChildren, [Component, props]) =>
    createElement(Component, props, innerChildren),
  children
);
```

이러면 `children`을 Provider들로 모두 감싸게 되겠죠?  
이러한 동작을 하게끔 HOC(High-Order Component)를 만들어보면 아래와 같습니다

```tsx
function CountProviders({ children }: { children: ReactNode }) {
  const providers = [
    [Count1Provider, { initialValue: 10 }],
    [Count2Provider, { initialValue: 20 }],
    [Count3Provider, { initialValue: 30 }]
  ] as const;
  return providers.reduceRight(
    (innerChildren, [Component, props]) =>
      createElement(Component, props, innerChildren),
    children
  );
}
```

이제 `<CountProviders>{children}</CountProviders>`과 같이 한 번만 감싸주면 되니까 아주 속편합니다

---

\
Context로 전역 상태를 다뤄보는 내용은 여기까지인데요  
처음 시작할 때도 말헀듯이 Context로 전역 상태를 만들 때의 장점은 **다른 Sub-Tree들에 대해 다른 값을 전파**할 수 있다는 점입니다  
저쪽에서는 값이 `a`여야 하고, 이쪽에서는 값이 `b`여야 하고, 따로 관리되어야 할 때 굿이네요

대신에 전체 App에서 값이 아예 하나로 유일해야 하는 singleton 전역 상태를 원하는 경우에는 다른 방법이 더 유리합니다  
다음 시간에는 그 방법이 무엇인지 알아보려고 합니다

마치기 전에, 모든 예제는 [여기](https://sungpaks.github.io/micro-state-management-example/)에 대충 배포해두었으니 직접 가셔서 눌러보실 수 있습니다.  
[레포지토리](https://github.com/sungpaks/micro-state-management-example)도 공개되어 있긴 한데 굳이 보시진 마세요

![머쓱크멜론..](https://i.imgur.com/hV1OoY8.png)
