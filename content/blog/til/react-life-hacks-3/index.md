---
title: "96년차 개발자도 모르는 리액트 잡기술 (3)"
date: 2024-09-21 14:20:33
description: "죽지도 않고 돌아온 시리즈"
tag: ["TIL", "React"]
---

> ! 주의 : TIL 게시글입니다. 다듬지 않고 올리거나 기록을 통째로 복붙했을 수 있는 뒷고기 포스팅입니다.

# \<form\>

[form](https://developer.mozilla.org/ko/docs/Web/HTML/Element/form)은 무엇입니까?  
입력필드의 집합입니다
우리는 여러 입력필드들로부터 데이터를 긁어와서, 검증하고, 제출하고 싶습니다

이 form 내부에 존재하는 버튼들은 기본값으로 `type="submit"`이 되어,  
클릭 시 브라우저는 http요청을 생성하고 전송합니다.  
대개 우리는 브라우저의 이 기본적인 양식 제출 방식이 아닌 직접 다루고 싶어하기에  
버튼을 `type="button"`으로 만들어 onClick으로 처리하거나,  
`onSubmit` 핸들러에서 `event.preventDefault()`로 요청 전송을 방지합니다.

## form 데이터 데루기

리액트에서 form 내의 input 요소들로부터 데이터를 얻어오는 법은 크게 세 가지가 있습니다 :

### 1. state

[이전에 양방향 바인딩과 ref를 이용한 입력값 관리에 대해 살짝 봤습니다](https://sungpaks.github.io/til/react-life-hacks-1/#%EA%B0%92%EC%9D%84-%EC%86%8C%EC%A4%91%ED%9E%88-%EA%B0%96%EA%B3%A0-%EC%9E%88%EA%B8%B0)
리액트에서는 input 요소의 값을 상태로 관리하여 언제든지 그 값에 접근할 수 있습니다.

그런데 form 내의 입력란이 막.. 많아지면 이를 개별 state 객체로 관리하기 힘들어집니다  
따라서 상태를 아예 객체 하나로 퉁치고, 아래처럼 상태값을 관리해볼 수 있습니다 :

```jsx
function handleInputChange(identifier, e) {
  setEnteredValues(prev => {
    return {
      ...prev,
      [identifier]: e.target.value,
    }
  })
}
```

객체의 **키값으로 동적인 값**을 주기 위해 `[identifier]`와 같이 대괄호로 동적인 값임을 명시했습니다.

이제 `<input value={enterdValues.email} onChange={(e)=>handleInputChange('email', e)}>`와 같이 써주면 편하겠네요

### 2. ref

참조를 이용해볼 수도 있습니다. 코드 자체는 이게 더 간단할 수 있습니다
`useRef()`로 참조를 생성하고, `<input ref={ref}>`와 같이 등록하면,  
제출 시점에 `ref.current.value`로 값에 접근할 수 있습니다.

그런데 제출 후 값을 초기화하고 싶으면  
`ref.current.value = ''`와 같은 행동을 할 수 있지만  
약간.. 리액트 패러다임에 맞지 않는다고 전에 살펴봤었습니다

### FormData로 \<form\> 제출 제어하기

또 한가지, 브라우저 내장 기능인 FormData를 사용해볼 수 있습니다.  
onSubmit에서 받아온 event객체를 `new FormData(event.target)`과 같이 써서 FormData객체를 생성할 수 있습니다.

이 때, FormData 객체를 생성하려면, 각 html input요소에 `name` attribute를 설정해줘야 합니다.  
`<input name="email">`처럼요  
`<select>, <textfield>`같은 다른 필드도 예외없이 전부요

이제 이 `name` attribute에 썼던 이름을 이용하여 값을 가져올 수 있습니다.  
`.get('email')`같은 메서드로 개별 값을 가져올 수도 있고,  
`Object.fromEntries(formData.entries())`와 같이  
Object 전역객체의 정적메서드를 사용하여 한 번에 객체로 변환할 수 있습니다.

주의할 점은, 이 때 체크박스 하위 값들은 이 엔트리에 모두 포함되지 않는데  
`type="checkbox", name="acquisition"`같은 동일한 이름의 하위 옵션들이라서  
`formData.getAll('acquisition')`과 같이 사용해줘야 체크된 값들을 모두 가져옵니다.

이 경우 값 리셋도 쉬운데,  
`<Form>` 내에서 `type="reset"`인 버튼을 두면 이걸 클릭하여 초기화되게 할 수도 있고  
onSubmit 이벤트 객체에서 `event.target.reset()` 메서드를 제공하므로 프로그래밍적인 방법으로도 가능합니다.

## form 데이터 검증하기

html 요소들에 [빌트인 attribute를 사용](https://developer.mozilla.org/en-US/docs/Learn/Forms/Form_validation#using_built-in_form_validation)하여 어느정도의 입력을 제어하고 검증할 수 있습니다.  
그 외에도,

### 1. 매 입력(stroke)마다 검증하고 경고를 날릴까요?

이 경우는 필연적으로 state로 입력값을 제어하는 경우여야 합니다.  
그래야 매 stroke마다 확인하고, UI를 업데이트하겠죠?

근데 너무 이른 판단일 수 있어요 아무래도..  
사용자는 아직 입력 중인데, 제대로 입력하라고 호들갑을 떨어버리면 불쾌할 수 있습니다.  
"유저는 왕이다"

### 2. 포커스 해제 시

`onBlur` 이벤트 리스너를 등록하여, 입력 요소에 포커스가 해제되면 값을 검증할 수 있습니다.  
그럼 유효한 값이 아닌 상태로 포커스를 떠나는 경우를 경고할 수 있습니다.  
아까보단 좀 낫네요

근데 그럼 다시 타이핑하러 돌아와도, 경고가 남아있을 수 있겠죠?  
이를 위해 첫 번째 방법과 결합하여 다시 타이핑을 재개하면 경고를 제거하게 하거나,  
`onFocus` 이벤트를 등록하여 포커스 시 경고를 제거해볼 수 있겠습니다.

### 3. Form 제출 시 검사하기

모든 입력이 끝나고 제출된 후에야 값을 검사합니다.  
ref나 FormData로 구현하면 아마 보통 이래야 하겠죠?

이 경우 사용자는 충분히 유효한 값을 입력할 기회를 갖지만,  
다 제출하고 나서야 피드백을 받으니 좀 늦은 감이 있을 수도 있습니다.

그럼 어떤 방법을 사용하죠? 하면 국룰처럼 외치는 "취향차이"가 정답입니다

# 지연로딩

[지연로딩](https://wikidocs.net/197644)은 코드(컴포넌트들)를 무조건 한 번에 다 로딩하는 것이 아닌,  
페이지를 로드 시 필요한 컴포넌트들만 로드하게 합니다.

예를 들어, 코드에서 import로 가져오는 구문을 수정해볼 수 있는데  
`const BlogPage = lazy(() => import('./pages/Blog'));`와 같이 컴포넌트를 지연로딩해볼 수 있습니다.  
참고로 `lazy()`함수는 리액트에서 제공하는 유틸함수입니다

앗, 그럼 아직 안 가져왔을 때를 위해 또한 리액트가 제공하는 `<Suspense>`블록을 사용할 수 있는데

```jsx
<Suspense fallback={기다리는동안보여줄컴포넌트}>
    <BlogPage>
<Suspense>
```

이렇게 Suspense로 감싸서 효과를 낼 수 있습니다.

# 합성 컴포넌트 만들기 (Components Composition)

**합성 컴포넌트**는 스스로 독립적으로는 동작하지 못하되, 함께 있어야 비로소 동작할 수 있는 컴포넌트 조합을 만드는 일종의 리액트 패턴입니다.  
비슷한 예로, html 요소 중 `<option>`과 `<select>`가 그러한 관계죠

예를 들어, 아코디언(하나를 탭하면 디테일을 열고, 그럼 다른 애들은 닫혀 있는) 컴포넌트를 만들고 싶으면

```jsx
function Accordion({ items, className }) {
  return (
    <ul className={className}>
      {items.map(item => (
        <li>item</li>
      ))}
    </ul>
  )
}
```

이렇게 써볼까요?  
근데 확장성이 좀 부족해보입니다. item이 저렇게 생겼을거라는 보장이 없어요.

## `children` props로 유연하게 하위 컴포넌트를 받게 하기

```jsx
function Accordion({ children, className }) {
  return <ul className={className}>{children}</ul>
}
```

이렇게 껍데기만 만들고, `children` props를 받아 합성 컴포넌트를 노려보는게 좋을 것 같습니다.

이제 이 안에 들어갈 item인 AccordionItem을 만들어보면 좋을 것 같아요

```jsx
function AccordionItem({ className, title, children }) {
  return (
    <li className={className}>
      <h3>{title}</h3>
      <div>{children}</div>
    </li>
  )
}
```

이렇게 대충 item 컴포넌트를 만들어서,

```jsx
<Accordion className="accordion">
  <AccordionItem className={"accordion-item"} title="1st">
    first item
  </AccordionItem>
  <AccordionItem className={"accordion-item"} title="2nd">
    second item
  </AccordionItem>
</Accordion>
```

이런 식으로 쓸 수 있겠습니다.

## (합성된)컴포넌트의 묶음에 로직을 추가하기

이제 아코디언 아이템이 하나만 열리게 동작을 추가하고 싶어요  
근데 : `<Accordion>`에서는 children과 직접적인 상호작용이 어렵습니다.  
여기서는 단순히 children을 받아서 렌더링에 넘기기만 할 뿐이라서요

대신 Context로 상태를 전달하면 좋을 것 같습니다

```jsx
const AccordionContext = createContext()

export function useAccordionContext() {
  const ctx = useContext(AccordionContext)

  //Context.Provider의 범위 내에 해당하지 않을 수 있음
  if (!ctx) throw new Error()

  return ctx
}

export default function Accordion({ children, className }) {
  const [openItemId, setOpenItemId] = useState(null)
  function toggleItem(id) {
    setOpenItemId(prevId => (prevId === id ? null : id))
  }
  const contextValue = {
    openItemId,
    toggleItem,
  }
  return (
    <AccordionContext.Provider value={contextValue}>
      <ul className={className}>{children}</ul>
    </AccordionContext.Provider>
  )
}
```

이렇게 Wrapper 컴포넌트인 `<Accordion>`에서 상태값을 컨텍스트로써 제공하게 합니다.  
그럼 하위 컴포넌트들은 어디서든 그 값이 필요하면 컨텍스트 값을 가져다 쓸 수 있습니다.  
그리고 `useAccordionContext()` 커스텀 훅을 추가하여  
아예 `useContext`를 더욱 캡슐화?해버렸습니다  
근데 이 때, 이 훅을 사용한 곳이 적절한 `Provider`의 하위에 있지 않은 경우를 예외처리해줘야겠죠?

이제 `<AccordionItem>`에서는 `const { openItemId, toggleItem } = useAccordionContext();` 이렇게 하면 정보를 얻어올 수 있습니다.

## 합성 컴포넌트를 그룹화하기

근데 처음에, 합성 컴포넌트의 하위 컴포넌트는 응당 *스스로는 독립적인 컴포넌트로서 사용되지 못하는 컴포넌트*라고 했습니다.  
근데 지금은 모르는 누군가 와서 `<AccordionItem>`을 import하고 개별적으로 사용해버리면  
그 목적을 달성하지 못합니다.  
또한 `<Accordion>`밑에는 `<AccordionItem>`이 그룹으로 사용되어야 한다는 필연성을 저밖에 알지 못하죠,

이제 `<AccordionItem>`이 무조건 `<Accordion>`의 하위가 되게 그룹화하는 방법이 있는데  
AccordionItem 컴포넌트를 export하지 않고, Accordion 컴포넌트의 구현부에 위치하게 합니다.  
그런 다음, 단순히  
**`Accordion.Item = AccordionItem` 이렇게 프로퍼티로 등록**해버립니다!!

그럼 사용할 때는, AccordionItem을 import할 필요도 없이,  
`<Accordion.Item>`으로 서브 컴포넌트를 갖다쓸 수 있습니다.  
마치 `<Context.Provider>`처럼요  
이렇게 하면 더 명시적으로 *메인과 서브 컴포넌트*를 합섭 컴포넌트로서 그룹화해버릴 수 있습니다.

---

끗. 여기까지 하겠습니다. 