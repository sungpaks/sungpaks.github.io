---
title: "Mantine polymorphic으로 두 Mantine 컴포넌트 합치기 "
date: 2025-02-04 21:05:31
description: "예를 들어 component={Paper} 이런거"
tag: ["TIL", "TypeScript", "JavaScript", "React", "Mantine"]
---

> ! 주의 : TIL 게시글입니다. 다듬지 않고 올리거나 기록을 통째로 복붙했을 수 있는 뒷고기 포스팅입니다.

결론부터 말하자면 `component` props 말고 `renderRoot` props쓰세요  
[Mantine 공식문서 - Polymorphic components](https://mantine.dev/guides/polymorphic/)참고.

# 상황

두 Mantine 컴포넌트의 성질을 병합해버리고 싶을 수도 있는데요

![PPAP](image-1.png)

`<Paper>`의 radius도 쓰고싶고 `<Center>`의 중앙정렬도 쓰고싶을 수도 있습니다  
아니면 `<Container>`에다 `<AspectRatio>`의 비율 특성을 갖다쓰고 싶을지도요

제가 실제로 고민했던 상황이 있는데

```tsx
<Stack bg="blue.3">
  <Text>어쩌구저쩌구</Text>
</Stack>
```

대충 이런게 있다고 합시다.  
근데 디자인 상 `<Stack>`이 `border-radius`를 적당히 갖는 컨테이너여야 하면요..  
Mantine의 대부분의 박스컴포넌트들은 인라인 radius props가 없기때문에 아주 귀찮습니다  
이럴때 바로 떠오르는 생각은 아래 정도일듯?

- css를 쓴다. => 매우귀찮음.
- [인라인 스타일](https://mantine.dev/styles/style/)로 쓰거나 Mantine만의 [styles api](https://mantine.dev/styles/styles-api/)쓰기. => 인라인 스타일은 우선순위 뻥튀기가 걱정이고, styles api도 좀 귀찮을지도(`root`? `label`? `inner`?)
- `<Stack>` 대신에 `<Paper>`(애는 radius가 기본적으로 있고 props로도 값 조절 가능)를 쓴다. => 이러면 `display: flex, flex-direction: column` 등등 Stack에서 누리던 스타일들 다 써줘야 함;;
- **[polymorphic](https://mantine.dev/guides/polymorphic/)쓰면 됨 ㅋㅋㅋ `<Stack component={Paper}>` 딸깍**

갑자기 번뜩! 마지막줄처럼 하면 되지않나? 라는 생각이 들어서 해봤었는데요

# `component={Paper}`처럼 polymorphic에 Mantine컴포넌트를 넣어보면?

![js로 polymorphic에 Mantine컴포넌트 넣기](https://i.imgur.com/2QZv7SR.png)

예를 들어 이런식으로 코드를 짰다고 해봅시다  
`<Stack>`은 기본적으로 `border-radius`가 지정되어있지 않아 그냥 직각인데요  
`component={Paper}`와 같이 polymorphic으로 `<Paper>` 특성을 곁들이면 `border-radius`를 간단히 넣을 수 있습니다

이처럼 가능은 한데요, TypeScript쓸 때는 문제가 하나 있습니다

## polymorphic으로 넣은 컴포넌트에서만 가능한 props는 넣을 수 있나요?

예를 들어 `<Paper radius={20}>`이런게 되니까  
`<Stack component={Paper} radius={20}>` 이렇게 쓰고싶은 충동이 있을 수 있는데  
TypeScript에서 이렇게 써버리면 아래처럼 에러가 납니다(자세한 오류는 [TypeScript Playground 참고](https://www.typescriptlang.org/play/?jsx=1&preserveValueImports=false#code/FASwtgDg9gTgLgAgN7AQgynAhgYwNYA0qCAQgK5xxQB2RaAKgKYAecdCAClhIzEQL4IAZjChgEAIgACYLNTghqjAPQ5YjCQG5gwNdQDOiAGJQoCALwIAFAEoLAPmTE0MRnDIxq152l8AeTFw8BDVIGkZ5cyQuHhhBCCiAVkEwJMEAIwBzcwl0gBsyRgA6RIkEGCwAExAyfSiARgAGfnsfX3aEPyZWBGwcnAi4Xgl7egAJAEl0BCm-ZW64Vo7lzoXerH7B4fsAQQB1AFF0AHkAWQOEA4ANHdOOABkDuYWllfa-ckoaEKg82ByAO4ACxAQzKADcsDAQHI4DkoBQ8ooNK83st9kczhcSABVej0Y4AOTaKzmnyo1FRHTmgXwVJswH4QA))

![props 잘못넣으면 ts오류](https://i.imgur.com/gO8aCNe.png)

근데 preview 보시면 실제로 `radius={20}`이 적용되긴 했는데요  
typescript에러가 난다는게 문제입니다

이에 관해서는 Mantine 공식문서의 [Why I cannot use one polymorphic component in component prop of another polymorphic component?
](https://help.mantine.dev/q/polymorphic-in-polymorphic)글에서 관련 내용을 살펴볼 수 있는데요

> 어떤 polymorphic 컴포넌트를 다른 polymorphic 컴포넌트의 component prop으로 넣는 경우, 실제로 사용되기 전까지 루트 요소의 진짜 타입을 알 수가 없어 타입추론이 불가합니다

라고 하네요  
그래서 저런 typescript 에러가 발생했습니다

# `components` prop 대신에 `renderRoot` prop 쓰면 됩니다

공식문서를 꼼꼼히 읽은 누군가는 잘 알고있었을 수도 있는데, `renderRoot` prop을 사용하면 원하던 바를 이룰 수 있습니다  
[관련 문서 참고](https://mantine.dev/guides/polymorphic/#polymorphic-components-with-generic-components)

![renderRoot쓰면 됨](https://i.imgur.com/sfhzBnM.png)

이런 식으로, `renderRoot((props) => <Paper radius={20} {...props}>)`와 같이 prop을 넣어주면 됩니다

이러면 `Paper`에서만 가능한 props도 넣을 수 있고, `<Stack>`은 `<Stack>`대로 쓸 수 있구요

사실 이거는 저번에 한참 Tailwind -> Mantine 마이그레이션할때 몰랐었네요;;

![아하!](image-2.png)

이만 마칩니다
