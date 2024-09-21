---
title: "🔍 리액트 검색창 구현 : Render Props + 동적 key 설정 + Debouncing"
date: 2024-09-21 21:11:25
description: "앗! 리액트 검색창 구현 삼형제다!"
tag: ["React", "TypeScript"]
---

![리액트 검색창 삼형제](image-1.png)

이번 시간에는 Render Props에 대해 알아보고  
key를 동적으로 넣는 방법도 알아보고  
Debouncing으로 사용자 경험을 높이는 법도 알아봅시다.  
그리고 이 세 트리오를 짬뽕해서 검색창 구현해보려구요.  
실제 구현할 때는 TypeScript도 좀 사용하면서 해보겠습니다

# 이론 먼저.

## Render Props

Render props라는 리액트 패턴, 또는 테크닉, 을 활용하여 유연한 재사용 컴포넌트를 만들어볼 수 있습니다.  
JSX를 반환하는, 즉 **Render할 수 있는 함수를 props로 전달**하는 것입니다.  
props로 뭐든 되긴 하는데, 보통 `children`으로 넘긴다네요

만약 "검색 가능한 리스트" 컴포넌트를 만들고, 여기서 검색 로직을 작성한다고 해봅시다.

```jsx
function SearchableList({ items }) {
  const [searchTerm, setSearchTerm] = useState("");
  const searchResults = // 대충 searchTerm으로부터 items 필터링
    function handleChange(event) {
      setSearchTerm(event.target.value);
    };
  return (
    <div>
      <input type="search" onChange={handleChange} />
      <ul>
        {searchResults.map(item => {
          return (
            <li key={item}>
              <h1>{item.title}</h1>
              <p>{item.description}</p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
```

이렇게 할까요?  
근데 이건.. 목록 컴포넌트를 렌더링하는게 너무 특정 item에 치중되어 있네요  
그렇다고 목록에서 `<SomeItem item={item}/>`이라고 쓰기도 못미덥습니다. 이것도 결국 특정 Item에 국한되어있죠,  
`<AnotherItem item={item}>`을 렌더링하고 싶으면 어떡하지? 싶습니다.  
저는 지금 여기서, *무슨 item이든 상관 없이 검색과 검색된 결과 리스트를 제공하는 재사용 컴포넌트*를 작성하고 싶은건데..

![뻣뻣](image.png)

이 때, Render Props를 이용해볼 수 있습니다.  
`children` prop으로 Render가능한 JSX를 반환하는 함수를 받아오고,  
단순히 `<li>{children(item)}</li>`처럼 쓰면 되겠습니다. 아래처럼

```jsx
function SearchableList({ items, children }) {
  const [searchTerm, setSearchTerm] = useState("");
  const searchResults = // 대충 searchTerm으로부터 items 필터링
    function handleChange(event) {
      setSearchTerm(event.target.value);
    };
  return (
    <div>
      <input type="search" onChange={handleChange} />
      <ul>
        {searchResults.map(item => {
          return <li key={item}>{children(item)}</li>;
        })}
      </ul>
    </div>
  );
}
```

그럼 이 `SearchableList`라는 Wrapper컴포넌트를 쓰는 입장에서는,

```jsx
<SearchableList items={PLACES}>
  {item => {
    return <Place item={item} />;
  }}
</SearchableList>
```

이렇게 쓰면 되곘어요. item을 인자로 받기로 했으니까, 이걸 받고 해당하는 렌더링 컴포넌트를 반환합니다.  
지금은 "장소"에 대한 개별 리스트아이템을 써먹은건데,  
"게시글"처럼 다른 것을 검색하고 싶은 경우 저 `<Place>`자리를 그냥,  
그 다른 item에 맞는 컴포넌트로 대체하면 됩니다. 예를 들면 `<PostItem>`처럼요.  
그리고 인자인 `item`을 받아서 뭔가 하고싶으면, 로직을 추가해도 되겠죠?  
결국엔 Render만 될 수 있게 jsx를 반환하는 함수이기만 하면 됩니다.

이처럼, `<SearchableList>`의 책임은 item의 리스트를 검색하여 제한하는 로직, 딱 거기까지만 가져가고,  
item 각 항목을 예쁘게 UI에 담아내는 Rendering 책임은 추상화하여 `<SearchableList>`를 사용하는 주체에게 떠넘깁니다.  
이렇게 하여 꽤나 강력하고 유연한 검색용 재사용 컴포넌트를 만들었어요

## 동적으로 key 처리하기

아시다시피 `map()`에서처럼 목록으로 컴포넌트들을 찍어내는 경우, `key` props를 무조건 넣어줘야 하죠?  
근데 위에서 쓴 코드에서는, 대충 `item`이라고 퉁치고 있는게 좀 맘에 들지 않습니다.  
`id` 프로퍼티가 있다면 `item.id`로, 어떤 경우에는 `item.title`로, ...  
`<SearchableList>`를 사용하려는 객체가 뭐냐에 따라서 `key`로 뭘 쓸지 알 수가 없습니다.

Render Props에서 한 것과 꽤 비슷하게 이걸 처리할 수 있어요. 저만 비슷하다고 느끼는지는 모르겠으나..  
**item을 받아 key를 반환하는 콜백함수**를 props로 넘겨주면 됩니다.  
예를 들어, props로 `itemKeyFn`을 받아와서, `key={itemKeyFn(item)}` 이렇게 쓰면 되겠죠?

그러면 `<SearchableList>`를 사용할 적에는

```jsx
<SearchableList itemKeyFn={item => item.id}>
  {item => <Place item={item} />}
</SearchableList>
```

이렇게 쓰면 되겠어요  
이러면 `<SearchableList>`를 사용하는 객체를 위해 확장될 수 있는 셈입니다

## Debouncing

지금 저 검색 컴포넌트는 매 key stroke를 렌더링에 반영합니다.  
당연히 상태값인 `searchTerm`이 수정되면, 파생상태인 `searchResults`도 업데이트되고,  
바뀐 `searchResult`에 따른 리스트를 UI에 반영하게 됩니다.

![정신없는 짤](image-2.png)

아.. 그러면 타자를 칠 때마다 렌더링이 마구마구 일어나고, 아주 정신이 사나운 사태가 벌어지고 말아요  
검색 결과를 보여줄 때 조금 여유를 가지고 보여줘야겠습니다..

그래서 뭘 할거냐면, 검색창 입력값이 바뀌어도, 임의의 시간(500ms정도?)을 기다리겠습니다.  
500ms가 지나는 동안 새로운 입력이 없으면, 사용자가 결과를 원하는 것으로 간주하고, 검색을 진행합니다.  
500ms가 지나기 전에 새로운 입력이 들어오면, 다시 새로운 500ms를 시작합니다.  
이를 구현하려면 아래처럼 합니다 :

```jsx
const lastChange = useRef();
function handleChange(event) {
  if (lastChange.current) {
    clearTimeout(lastChange.current);
  }
  lastChange.current = setTimeout(() => {
    lastChange.current = null;
    setSearchTerm(event.target.value);
  }, 500);
}
```

1. 500ms 뒤에 입력값이 상태에 반영되도록 예약(하고, `lastChange` 참조로 이 예약 타이머를 갖고 있기)
2. 예약이 걸려있는데 handleChange가 다시 호출된 경우(`if(lastChange.current)`), 이전 예약을 취소하고 다시 새로 예약
3. 이 때, 예약의 콜백에서 `lastChange.current=null`로 이제 예약이 비었음을 나타내줘야 합니다.

이렇게 하면, 사용자가 마구마구 타자를 칠 때는 잠시 여유를 갖고 기다립니다.  
사용자가 입력을 좀 쉴 때, 그 때가 되어서야 검색 결과를 보여줘요.

![여유](image-3.png)

# TypeScript와 함께 직접 구현하기

아래는 제가 진짜 최근 프로젝트에 써놓은 코드입니다  
여담으로 이 프로젝트는 최근 꽤나 급하게 작업할 일이 있었어서  
기술 부채는 늘어만 가는데.. 여기에 스파게티를 토핑으로 추가하는 그 기분이 매우 죄책감들었습니다

![기술부채..](image-5.png)

```tsx
<Box className={styles["scenario-list"]}>
  {scenarios.map((item, index) => {
    return (
      <Box className={styles.card} key={item.title}>
        <div>
          <img src={item.profileImage} />
          <p>{item.title}</p>
          <button
            className={styles["start-button"]}
            onClick={() => handleClickStart(index + 1)}
          >
            시작하기
          </button>
        </div>
      </Box>
    );
  })}
</Box>
```

이런.. 살짝 끔찍?한, "시나리오 리스트" 컴포넌트가 있었습니다.  
컴포넌트 분리도 안 되어있고, 검색 기능도 사실은 아직 만들지 않았었어요  
데이터는 가짜 객체 배열이라, 나중에 바뀔 가능성이 있어 `any`타입으로 뒀습니다

![예시](image-4.png)

검색창 컴포넌트까지 포함해서 이렇게 생긴 페이지였습니다.  
여기다 검색 기능을 실제로 추가하고,  
위에서 배운 것처럼 Render Props를 이용한 유연한 컴포넌트로 만들고 싶네요

## 먼저 SearchableList 컴포넌트를 만듭시다.

아래와 같이 구현해줬습니다.

```tsx
interface SearchableListProps<T> {
  items: T[];
  keyFn: (item: any) => string | number;
  children: (item: T, index: number) => JSX.Element;
  className: string;
  itemClassName: string;
}

export default function SearchableList<T>({
  items,
  keyFn,
  children,
  className,
  itemClassName
}: SearchableListProps<T>) {
  return (
    <Box className={className}>
      {items.map((item, index) => (
        <Box className={itemClassName} key={keyFn(item)}>
          {children(item, index)}
        </Box>
      ))}
    </Box>
  );
}
```

위에서 살펴본 Render Props 이론에 TypeScript만 더했을 뿐이예요  
key를 동적으로 뱉어줄 `keyFn`은 숫자든 문자열이든 상관은 없습니다  
`children`은 render props를 사용할거라, 이를 위한 인자와 반환값을 강력하게 명시했습니다

알고 계셨나요? 함수형 컴포넌트에서 타입을 `function FooComponent : React.FC`처럼 쓰면 `children`같은 특별 컴포넌트들을 이미 포함시킬 수 있습니다.  
거기다 다른 props가 또 있다면 `React.FC<FooPropsType>`처럼 제네릭을 구체화하면 됩니다  
근데 저는 그냥 저렇게 하는게 편하더라구여.. `React.FC<>`로 하려면 props를 구조분해할당으로 받아오는거 어떻게 하는지 모르겠어서..

이제 각 item 항목들의 render를 담당할 친구를 대충 작성해줍니다.  
저는 `item`과 기타 여러 props를 받는 `<ScenarioListItem>` 컴포넌트를 만들었어요.  
사실 여러분 입장에서는 별 관심을 코드라서 여기에는 안 씁니다.

이제 `<SearchableList>`를 이용하여 시나리오 리스트 검색 컴포넌트를 만들 일만 남았네요

```tsx
<SearchableList items={scenarios} keyFn={item => item.id}>
  {(item, index) => <ScenarioListItem item={item} />}
</SearchableList>
```

편하게 보시라고 안궁금하실 props 넣는 부분은 쳐냈습니다  
아무튼 이렇게 사용해주면,  
`<SearchableList>`에서 children을 render props로 사용할 때  
`children(item, index)`처럼 썼으니, `{(item, index) => 컴포넌트를뱉기}` 이런 식으로 쓰게 됩니다

여기까지 하면 컴포넌트의 분리와 추상화가 잘 마이그레이션되어서  
원래의 리스트가 잘 출력됩니다.

## 검색 로직 추가

![검색한번해봐](image-6.png)

이제 진짜 검색이 되게 해봅시다.

```tsx
<>
  <input className={inputClassName} placeholder="검색어를 입력해주세요." />
  <Box className={className}>
    {items.map((item, index) => (
      <Box className={itemClassName} key={keyFn(item)}>
        {children(item, index)}
      </Box>
    ))}
  </Box>
</>
```

원래 `<SearchableList>` 와 같은 레벨에 있던 input을  
SearchableList.tsx 안쪽으로 병합합니다.  
이제 기능을 만들어요

```tsx
const [searchTerm, setSearchTerm] = useState<string>("");
const lastChange = useRef<any>();
const resultItems = items.filter((item: any) =>
  item.title.toLowerCase().includes(searchTerm.toLowerCase())
);

function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
  if (lastChange.current) {
    clearTimeout(lastChange.current);
  }
  lastChange.current = setTimeout(() => {
    lastChange.current = null;
    setSearchTerm(event.target.value);
  }, 500);
}
```

검색 거르는 로직은 대충 미니멀하게 GPT한테 부탁했습니다.  
그리고 **\*Debouncing**도 넣은거 잘 보이시나요?  
이거 할 때, setTimeout 반환값이 브라우저는 number라서 number로 하니까  
IDE가 Node.js환경인 줄 알고 자꾸 "이거 Timeout객체 타입인데요?" 경고띄우길래.. 그냥 `any` 박았습니다.

나머지는 딱히 새로울 것도 없네요  
이렇게 하고, `handleInputChange`를 가져다 input 요소에 등록합니다.

![결과](https://github.com/sungpaks/sungpaks.github.io/blob/master/content/blog/render-props-and-dynamic-key-and-debouncing/gif-image.gif?raw=true)

좋네요.

---

\
Render Props라는 리액트 패턴도 알아보고  
동적으로 key 넣는 잡기술도 살펴보고  
Debouncing으로 사용자 경험에 대해서도 고민해봤습니다  
사실 Render Props는 요새 커스텀 훅으로 많이 대체될 수 있다고 해요  
아무튼 알아두면 은근히 유용할 패턴인 것 같습니다  
[TIL에서도 리액트 패턴 중 하나인 합성 컴포넌트에 대해 알아봤는데](https://sungpaks.github.io/til/react-life-hacks-3/)  
다른 것들 또 뭐 있나 알아보고 싶어지네요.

이만 마칩니다
