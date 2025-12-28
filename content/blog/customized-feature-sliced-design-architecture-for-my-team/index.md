---
title: "🗿 FSD는 장소가 아니다.. (Feature Sliced Design)"
date: 2025-12-30 00:25:40
description: "인지적 관점에서 고민한 React 프로젝트의 폴더구조"
tag: ["React", "TypeScript", "Frontend Architecture"]
---

얼마 전에, 약 5개월 간 진행한 [카카오 테크포임팩트 랩](https://techforimpact.io/lab/info) 프로젝트 최종발표가 있었습니다  
저는 [가방싸LAB](https://techforimpact.io/lab/project/16)에 웹 프론트엔드 개발자로 참여하여 **시뮬레이션 게임으로 디지털 재난안전교육 만들기**를 주제로 모바일 웹 게임을 만들었습니다.  
아직 마무리할 요소들이 남아 한 달 연장하게 되었지만, working하는 서비스를 일단 만들어냈고 최종발표 날 부스 시연도 하며 피드백을 얻었어요

<figure>

![테크포임팩트 부스 운영 모습](https://i.imgur.com/rtWqFaL.jpeg)

<figcaption>
시연 부스를 운영했어요
</figcaption>
</figure>

오늘 이 글에서는 이 프로젝트에서 **FSD(Feature-Sliced Design)기반의 폴더구조 아키텍처**를 세우게 된 고민과 경험에 대해 이야기하고자 합니다.  
그 전에 먼저 **다른 폴더구조/방법론에서 어떤 부족함을 느꼈는지** 이야기하고  
그 다음에 **FSD를 왜, 어떻게 차용했는지** 에 대해 다루고자 합니다.

들어가기에 앞서, 프로젝트의 **도메인 특성, 기술스택 등**은 폴더 구조 아키텍처를 정하는 데 중요한 의사결정 요소로 작용하는데요  
간단히 소개하고 넘어가자면 아래와 같습니다

- React 19 + TypeScript + TanStack Query + TailwindCSS
- 클라이언트 라우터 없이 단일 화면 흐름으로 진행되는 게임 형태 (`/foo-page`, `/bar/121`, ... 등의 페이지 경로 없음)
- 모바일 웹 브라우저에서, 가로모드로 플레이하는 게임의 형태
- 중요 도메인 키워드로는 "캐릭터", "가방", "아이템", "시나리오" 등이 있고, 게임에는 단계적 사이클이 존재합니다.
  - ex: 캐릭터 선택 -> 생존가방을 준비 -> 시나리오 플레이 -> 엔딩

FSD에 대해 하~~나도 모르신다면, 아주 잘 작성되어있는 [Feature-Sliced Design 문서](https://feature-sliced.github.io/documentation/kr/)가 있으니 잠깐 읽어보셔도 좋을 것 같습니다.  
뒤에서 한번 간단한 설명을 하고 지나가긴 할 예정입니다

# 또 너냐 `components/`?

가장 간단한 React식 폴더구조를 떠올려봅시다.  
React란 응당 **컴포넌트**라는 개념이 가장 주체가 되기 마련이고,

```
src/
- components/
  - Button
  - LandingPage
  - ItemSelection
- hooks/
  - useItemList
```

이런 식으로 `components/` 라는 폴더 밑에 컴포넌트들을 모으는 형태를 쉽게 볼 수 있습니다.  
또한 비슷하게, 훅을 `hooks/`에, 유틸함수같은 js 라이브러리 모듈을 `lib/`에 모을 수 있겠구요  
**기술적 역할에 따라 수평 분류**한 형태라고 해야할 것 같고, (적어도 저는) 이런 분류를 자주 봐왔습니다.  
그러나 정말정말 간단한 프로젝트가 아니라면 이 구조는 좀 힘들 것 같은데

- 각 코드(컴포넌트 등)들은 **역할 표현력**이 현저히 떨어집니다.
  - 어디서 어떤 도메인 개념을 위해 쓰이며, 얼마나 많은 곳에서 재사용되는지 알 수 없습니다
- 서로 참조하거나 사용되는 관계에 따른 응집이 나타나지 않습니다.
  - ItemSelection에서 useItemList를 쓴다고 해도, 이 관계가 쉽게 보이지 않습니다.

그럼 아래와 같이, 각 폴더 안에서 역할이나 재사용 범위에 따라 한번 더 나눌까요?

## `components/` 내부를 분류해본다면

```
src/
- components/
  - common/
    - Button.tsx
  - blocks/
    - ItemSelection/
      - index.tsx
      - ItemSlot.tsx
  - pages/
    - LandingPage.tsx
- hooks/
  - auth/
    - useAuth.ts
  - items/
    - useItemList.ts
```

이런 형태는 **여전히 단순하면서도 받아들이기 쉽고, 역할 표현력이 개선**되었다고 보이네요.  
작은 프로젝트에서는 충분히 합리적일 수 있고, 실제로 이런 베이스의 구조를 종종 볼 수 있습니다.  
이럴 때 각 단위를 어떻게 자르며 뭐라고 부를지는 팀에서 정하기 나름이지만 대충 아래와 같은 생각을 했을 것 같아요

- 컴포넌트는 완전히 재사용 베이스면 `common`, common을 몇 개 조합했다면 `block`, 완전히 한 화면을 나타낸다면 `page` 이런 식?
- 또한 `ItemSelection`이라는 도메인 단위로 컴포넌트가 묶였네요. [Component Folder Pattern](https://medium.com/styled-components/component-folder-pattern-ee42df37ec68)의 한 사례로 보입니다.
- 훅은 인증 관련을 `auth`로, 아이템 관련을 `items`로 둔 것 같네요

이러한 방식은 그나마 위에서 살펴본 방식보다 **기술적 역할**은 잘 표현되지만,  
**도메인/비즈니스적인 역할에 따른 응집**이 나타나지 않고, **인지적 차원**에서의 고려가 없습니다.  
여전히 관련있는 코드들이 멀리 분산되어 있네요.  
"A 기능"과 관련있는 코드들을 찾으려 하는 경우, 관련 코드들을 따라가며 머릿속에서 직접 연결하고 조합해야 합니다.  
마치 드래곤볼을 찾듯이요

<figure>

![드래곤볼 찾기](https://i.imgur.com/TpL76za.png)

<figcaption>
찾아라 드래곤볼! ([푸른거탑] 中)
</figcaption>
</figure>

예시로, `ItemSelection`컴포넌트는 아이템 데이터를 위해 `useItemList.ts`를 사용한다고 해봅시다.  
이 경우, **두 파일 간의 상대적 거리가 꽤 멀고 분산**되어있으므로, 인지적으로 이 둘을 묶어서 기억하는 데 생각을 소모합니다.  
또한 만약 `useItemList`를 수정하려고 한다면, 이것이 **`ItemSelection`에서만 쓰인다는 보장이 없으므로, 사이드 이펙트 가능성을 직접 생각**해야 합니다.

![아 맞다](https://i.imgur.com/atrO1lW.png)

이런 "직접 생각해야 하는 주의사항"은 혼자 작업해도 놓치는 일이 생길 수 있고, 이 코드를 다른 팀원이 작성했다면 특히나 더 놓치기 쉽습니다.

### 잠시 알아보기: Atomic Design Pattern

위 방식은 이전에 본 적 있는 [Atomic Design 방법론](https://atomicdesign.bradfrost.com/chapter-2/) 궤가 비슷해보이기도 하는데요  
이와 관련하여 Teo님의 [Atomic Design Pattern의 Best Practice 여정기](https://velog.io/@teo/Atomic-Design-Pattern)라는 글이 꽤 재밌으니 관심있으시면 한번 살펴보셔도 좋겠습니다

<figure>

![Atomic Design Pattern](https://i.imgur.com/MSj7Pzm.png)

<figcaption>
출처 https://atomicdesign.bradfrost.com/chapter-2/
</figcaption>
</figure>

직전에서 `components/` 폴더를 재사용 범위에 따라 분류한 것과 비슷할 수 있는데요  
마치 화학에서 원자가 조합되어 분자가 되고, 분자가 조합되어 유기체가 되고, ...하듯이  
컴포넌트를 이와 같은 기술적 역할 범위에 따라 분류하고 그룹짓는다는 느낌의 개념입니다

저도 전에 잠깐 이런 분류체계를 쓰는 코드베이스에서 작업해본 적이 있습니다  
개념 자체는 좋은데, 항상 "이게 Molecules냐 Organisms냐"같은 애매함이 문제였던 기억이 있어요

그리고 이것저것 장점과 단점은 모두 차치하고, 이런 체계가 제 고민에 대한 답이 될 수 없는 이유는  
여전히 **기술적인 역할 범위**만을 체계적으로 다룹니다. 제가 원하는건 **인지적 차원에서의 분류**인데..  
많은 글에서 다루듯이 **Atomic Design은 컴포넌트가 주요 관심사인 디자인 시스템에서 유용**할 수 있습니다.  
(참고: [FSD에서 Atomic Design을 통합할 수도 있습니다](https://feature-sliced.github.io/documentation/kr/docs/get-started/faq#atomic-design%EC%9D%84-%ED%95%A8%EA%BB%98-%EC%82%AC%EC%9A%A9%ED%95%A0-%EC%88%98-%EC%9E%88%EB%82%98%EC%9A%94))

## 왜 자꾸 인지적 관점을 찾나요?

이처럼 여러 분류 방법들을 떠올려봤지만  
제가 계속 아쉬움을 느꼈던 포인트는  
코드가 **기술적으로 어떻게 쓰이느냐**에 대한 기준은 있었으나  
**사람에게 어떻게 이해되느냐**에 대한 기준은 잘 보이지 않았다는 점이었습니다.

![아직도 이해 불가!](https://i.imgur.com/aE4lcaF.png)

제가 계속 찾던 **코드들이 인지적 관점에서 모여있다**라는 이상향이 어떤 의미를 갖는지 한번 생각해봅시다

- 예를 들어, 같은 기능의 구현을 위한 3개의 파일이 모여있다면 이를 **묶어서 기억(청킹)** 할 수 있습니다
- 이렇게 묶어서 기억하면 3개 파일을 모두 머릿속의 작업 공간에 올려두는게 아니라, **묶인 덩어리로 한 칸만 사용**할 수 있습니다.
  - 이는 코드베이스를 탐험하는 **개발자의 머릿속 부담을 덜어줍니다.**
- 기술적 표현 뿐만 아니라 **도메인/비즈니스적 맥락**으로 코드베이스가 표현된다면 이해가 더 용이하고 협업 시에도 대화가 쉽습니다.
  - 실제로 <프로그래머의 뇌>에서는 _"코드를 읽는 것은 자연어 텍스트를 읽는 것과 유사한 점이 많다"_ 라는 언급이 있기도 합니다

많은 개념들이 <프로그래머의 뇌 - 펠리너 헤르만스 저> 에서 나오는 인지과학적 개념들입니다  
폴더구조에 대한 고민을 하던 당시에는 이 책을 읽진 않았었지만 나중에 읽고 보니 제 고민들이 이렇게 설명될 수 있다는 것을 느꼈네요

## Route가 있으면 Route 중심으로 구성할 수 있겠지만..

저같은 경우는 실무에서 Next.js App Router를 쓰는데요  
이 때 주로 쓰는 구조를 떠올려봤습니다.

```
app/
- products/
    - create/
      page.tsx
    page.tsx
  page.tsx
  layout.tsx
```

App Router는 기본적으로 이렇게, 페이지 경로(route)들을 `app/` 폴더 밑에 중첩 폴더로 만듭니다.  
예를 들어, 위 구조에서는 중첩된 Route로 `/products`와 `/products/create`가 있겠네요

이제 `products/create/`에서만 사용하는 `ProductForm`이 추가된다면

```
app/
- products/
    create/
      page.tsx
      _components/
        ProductForm.tsx
```

이렇게 Private Folder에 숨겨줍니다. 이는 `products/create/` 하위 Route에서만 사용되는 _전용 컴포넌트_ 입니다.

![우리들만의 비밀](https://i.imgur.com/Qa2MMUj.png)

또한 같은 방식으로 전용 훅, 전용 모델(타입 등) 폴더를 추가할 수도 있습니다.

```

app/
- products/
    create/
      page.tsx
      _components/
        ProductForm.tsx
      _hooks/
        useCreateProduct.ts
```

이렇게 하면 `products/create/`에서만 쓰는 컴포넌트, 훅 등을 **응집**해낼 수 있습니다.

- **분산도 개선**: 이제 `products/create/`에서만 쓰는 컴포넌트들은 `products/create/`하위에만 있습니다.
- **역할 표현력 개선**: `products/create/`하위에 있다는 사실만으로 "상품을 생성할 때 쓰이는 코드들"임을 알 수 있습니다.
- **숨겨진 의존성 문제 해소**: `products/create/`하위에서만 쓰인다는 사실이 약속되어있으니 다른 곳에서 쓰이지 않음을 알 수 있습니다.
  - 다만 _이러한 전용 파일들은 하위 Route에서만 import를 허용한다_ 가 지켜져야 함에 주의합니다.

Next.js처럼 **Route**(또는 **페이지**)기반의 웹서비스를 만드는 경우라면, 실제로 Route라는 멘탈 모델로 묶는 일은 상당히 좋은 **청킹(묶어서 기억하거나 이해) 단위**가 될 수 있는데

- "상품 생성 페이지"같은 Route 개념은 누구나 **이해하기 쉽고 공유가능**합니다. 그만큼 **역할 표현력**이 뛰어나고 빠르게 관련 코드의 위치를 찾을 수 있습니다.
- **페이지 경로는 도메인 기능 단위와 자주 일치**하는데, 예를 들어 "상품"이라는 도메인 개념은 `products/` 경로 밑에서 자주 사용됩니다.
- `_components`, `_hooks`처럼 **내부 Private Scope**로 "이 페이지에서만 쓰이는 모듈"을 외부에서는 숨깁니다.

그러나 이번 프로젝트는 **"게임"의 특성상 Route가 없으므로, 코드를 묶을 다른 청킹 단위 또는 멘탈 모델을 생각**해봐야 합니다

# FSD: Feature-Sliced Design

지금까지 위에서 고민했던 포인트는 크게 두 가지 정도로 압축할 수 있습니다

- 컴포넌트, 훅, 라이브러리모듈 등 코드들을 **무슨 단위로 묶고 격리**할까?
- **책임의 범위** 또는 **다른 모듈에 의존되는 정도**에 따라서도 분류하고 싶다.

![유레카](https://i.imgur.com/H2L62N2.png)

FSD는 이 두 가지 고민을 한번에 해결할 수 있습니다.

- **Feature-Sliced**: 도메인 개념/기능의 단위로 코드를 묶습니다.
  - ex: `features/item-select`, `features/character-select`
- **Layered**: 역할이나 재사용/책임 범위에 따라 계층을 자릅니다.
  - ex: 완전히 "도구"처럼 재사용 목적이면 `shared`

왜 FSD가 이번 프로젝트에 정말 fit하게 맞았고 유용했는지, 어떻게 차용했는지 이야기하기 전에,  
먼저 FSD에 대해 간단히 알아봅시다.

## FSD 잠깐 소개

[문서 가라사대](https://feature-sliced.github.io/documentation/kr/docs/get-started/overview), FSD란

> Feature-Sliced Design(FSD) 는 프론트엔드 애플리케이션의 코드를 구조화하기 위한 아키텍처 방법론입니다.  
> 이 방법론의 목적은 **요구사항이 바뀌어도 코드 구조가 무너지지 않고, 새 기능을 쉽게 추가할 수 있는 프로젝트**를 만드는 것입니다.  
> FSD는 코드를 **얼마나 많은 책임을 가지는지**와 **다른 모듈에 얼마나 의존하는지**에 따라 계층화합니다.

대략적인 형태는 아래와 같습니다.

<figure>

![FSD Layers, Slices, Segments](https://i.imgur.com/UDF4Up6.png)

<figcaption>
https://feature-sliced.github.io 에서 가져왔습니다.
</figcaption>
</figure>

FSD의 핵심 개념은 **Layer**와 **Slice**, 그리고 **Segments**입니다.

- **Layer**: FSD 프로젝트의 표준 최상위 폴더입니다. 이 Layer는 역할 또는 사용 범위에 따라 7가지로 나뉩니다.
  - 위(고수준)에서부터 아래(저수준)로 app -> process -> pages -> widgets -> features -> entities -> shared
  - 하위 레이어에 속할 수록 범용적으로 사용되며, 도메인 개념의 냄새는 옅어집니다.
  - 상위 레이어는 하위 레이어를 의존(위에서 아래)할 수 있지만, 반대로 **아래에서 위로 흐르는 의존 관계는 금지**됩니다.
    - ex. `app -> features` O, `entities -> features` X
    - 이 원칙은 **일관성, 격리성, 재사용 범위 제어**등의 장점을 제공합니다.
  - 각 Layer를 무조건 모두 사용할 필요는 없습니다. 프로젝트의 특성에 따라 필요한 만큼 사용합니다.
- **Slices**: Layer 내부를 도메인 개념에 따라 한번 더 나눕니다.
  - app과 shared를 제외한 모든 레이어에 Slice를 이름/개수 제약없이 도입할 수 있습니다.
    - ex. user, post, comment, item, character, ..
    - 프로젝트에서 필요한 모든 중요한 도메인 개념이 Slice로 존재할 수 있습니다.
    - 비즈니스 용어가 폴더 구조에 반영되는 **도메인 중심 구조** 덕분에 이해가 쉽습니다.
  - **같은 Layer 내의 Slice 참조는 원칙적으로 지양**합니다.
    - 이를 잘 지키면 **높은 응집도**와 **낮은 결합도**를 동시에 이룰 수 있습니다.
- **Segment**: Slice 또는 app/shared 레이어는 Segment로 세분화되어, 코드의 기술적 역할에 따라 분리/그룹짓습니다.
  - ex. `ui/`에 UI컴포넌트를, `model/`에 store, hook, type 등, `lib`에 공통 라이브러리 모듈을

## 도입을 결정한 포인트

특히 이번 프로젝트에서 FSD식 접근이 유용하다고 생각한 이유가 몇 가지 있었는데요

![완전 맘에들어](https://i.imgur.com/U2NPvxj.png)

- 위에서 살펴봤듯이, 이번에 만드는 서비스에는 **Route**가 없으므로 **코드를 묶기 위한 다른 멘탈 모델**이 필요했습니다.
  - 게임 기능, 또는 게임 단계같은 멘탈 모델을 구축하는게 더 이해하기 쉽겠네요
  - 협업하는 게임 기획자분들이 사용하시는 **도메인 용어**를 적극적으로 사용하면 도움이 될 것입니다
- **Feature**란 제가 원하던 **비즈니스 로직 응집/청킹**을 위한 좋은 멘탈 모델이었습니다.
  - 도구는 `shared`에, 비즈니스 로직을 `features`에, 최종적으로 `app`에서 조립. 을 기본 개념으로 가져갑니다.
  - 예를 들어, feature에는 캐릭터 선택, 아이템 선택, 인물 대사 이벤트 등이 있을 수 있습니다.
  - 이제 머리속으로 `item-select` 기능 관련 코드를 직접 연결짓지 않아도 됩니다. 이미 훅, 컴포넌트, 타입 정의, 유틸 모듈 등이 `features/item-select` Slice에 모여있습니다.
- 이 당시에도 **요구사항이 명확하지 않았습니다.** 이러한 상황에서 _"새 기능을 빠르게 올리는 상황"_ 또는 _"요구사항이 비틀리는 상황"_ 에 효과적으로 대응할 기반을 만들고자 했습니다.
  - 위에서 살펴봤듯이 FSD는 `이 방법론의 목적은 요구사항이 바뀌어도 코드 구조가 무너지지 않고, 새 기능을 쉽게 추가할 수 있는 프로젝트를 만드는 것`이라고 언급합니다.
  - ex. "캐릭터 선택 기능 변경" -> `character-select`에서만 작업. "아이템 선택 기능 추가" -> `item-select`만 구현하여 상위 레이어에서 조립.
- 묶이고 계층화된 코드들(Layer 또는 Slice)은 격리되고 의존성 흐름이 통제됩니다.
  - 같은 레이어끼리의 Slice는 의존이 금지되므로, 숨은 의존성 문제를 시스템 차원에서 해소합니다.
  - 이는 Slice끼리의 결합을 느슨하게 만들고, 덕분에 유지보수에 있어 마음이 편해집니다.

그렇다고 항상 FSD가 좋고 FSD만이 정답인건 아닙니다.  
국가 시스템이 어디는 내각제, 어디는 대통령제, 어디는 국왕이 있고, 어디는 대통령이 5년이고 어디는 4년이고, 다 다른 것처럼요  
FSD 문서에서도 팀이나 프로젝트 특성에 맞는 FSD 도입을 권장합니다.

![안 맞는 것 같아요](https://i.imgur.com/QtBFp5H.png)

> 예시로 각 페이지가 독립적인 특성을 가진 프로젝트에서는 오히려 구조가 복잡해질 수 있습니다.

이건 아까 Route를 중심으로 폴더구조를 구성하여 효과를 볼 수 있었던 경우가 이에 속할 수 있겠네요

문서에서는 또한 "딱 필요한 정도의 Layer만 챙기기"를 권장합니다.  
계층을 7개 소개했다고 7개 전부 쓰라는 이야기가 아닙니다.  
Layer를 나누고 Slice로 자른다는 개념만 가져가도 충분합니다.

## 4-Layered FSD로 시작했어요

가장 처음에는 `app/`, `processes/`, `features/`, `shared` 네 가지 계층으로 시작해봤습니다.  
예시로 아래와 같이 생겼는데요

```bash
app/                     # 앱 엔트리/전역 조립만
  App.tsx
  main.tsx
  layout/                # 전역 프레임(헤더/푸터/포털/토스트/가드)
    RootLayout.tsx
  providers/             # 전역 Provider 조립 (Theme, Query, Zustand Devtools 등)
    AppProviders.tsx
  pages/                 # (라우터 도입 전엔 'screens'처럼 사용)
    LandingPage.tsx
    GamePage.tsx
features/                # 사용자 시나리오/기능 단위(응집)
  shelf-selection/
    ui/
      ShelfSelectionCanvas.tsx
      ShelfItem.tsx
    model/               # zustand slice, zod schema, types
      useShelfSelectionStore.ts
      types.ts
    lib/
      coords.ts
    index.ts             # barrel
shared/                  # 어디서나 재사용(의존의 바닥)
  ui/                    # 디자인 시스템 래퍼 + 공용 컴포넌트(둘 다 여기에)
    primitives/          # 버튼/인풋/다이얼로그 등 ShadCN 래퍼
      Button.tsx
      Dialog.tsx
    composites/          # 여러 프리미티브 합성(OverlayModal, DataTable 등)
      OverlayModal.tsx
    index.ts
  hooks/
    useOrientationGuard.ts
    useBoolean.ts
api/                     # openapi-typescript-codegen
```

1. **app/**: 전역 레이아웃·프로바이더·페이지(=Screen) 등 **조립 Layer**입니다.
   - 비즈니스 로직은 최소화하고, 오케스트레이션과 조합, 배치만 담당합니다.
   - 상태 주입, 화면 전환, 전역 레이아웃(또는 가드) 등
2. **process/** : **횡단 도메인/피쳐 간 관심사** 등.
   - 공식문서에서 process는 _deprecated_ 이지만, **Route가 없는 게임**이라는 프로젝트 특성상 **전역 흐름을 통제할 경계**가 필요했고, process의 위치/의미가 이에 적절하다고 판단해 차용해봤습니다.
   - 게임 전반적인 흐름에 포함되지만, 특정 Feature나 Entity에 포함되지 않는 경우에 해당합니다.
     - ex: "지금 게임 진행도", "현재 선택된 캐릭터 정보", "가진 아이템 정보", ...
3. **features/**: **기능별 응집**. 화면에 얹히는 “덩어리”라고 해도 괜찮을 수 있습니다.
   - 재사용 가능하며, 도메인 냄새가 아주 납니다.
   - 유저 시나리오나 게임 기능 단위를 응집합니다.
4. **shared/**: **유일한 공용 바닥**으로, 재사용 가능한 도구들 모음집입니다.
   - **도메인 무취**를 유지하며, shared는 같은 shared 내의 모듈만 import할 수 있습니다.
   - 도메인 무취이므로 "다른 어떤 프로젝트에 복사/붙여넣기 해도 무방한"정도의 재사용 모듈이면 shared에 위치합니다.
5. (번외) **api/** : API dto 타입, service 등 `openapi-typescript-codegen`에 의해 swagger문서로부터 자동생성되는 api 관련 코드
   - FSD 공식문서에서는 api를 Slice/Layer에 포함되는(ex. `foo-feature/api`) 하나의 세그먼트가 될 수 있다고 설명합니다.
   - 그러나 이 프로젝트에서 api 관련 코드는 codegen되므로 `api/`가 루트 폴더에 존재합니다.
     - 대신 api 호출부를 TanStack Query 커스텀훅으로 래핑하여 적절한 계층/슬라이스에서 export합니다.

의존 방향은 아래와 같이 단방향으로만 이루어지며, 역방향 의존을 금지합니다.

```
app  →  processes  →  features   →  shared
                               ↘ api (codegen)
```

또한 Barrel Export로 각 Slice 또는 Layer 내부를 닫고, 필요한 만큼의 모듈만 노출하여 의존성 결합이 강해지는 경우를 방지합니다.

```ts
// features/item-select/index.ts
export { default as ItemSelection } from "./ui/ItemSelection";
export { default as useSelectedItems } from "./models/useSelectedItems";
```

## 폴더구조 아키텍처 헌법을 지킬 수 밖에 없게 하기

폴더 구조란 문서화만 되어있다고 자동으로 지켜지진 않습니다  
팀원마다의 "폴더 구조 철학"에 대한 이해와 공감대가 당연히 다를거구요  
그러니 리뷰보다 앞설 수 있도록 **정량화된 룰**, 그리고 어기면 바로 빌드/커밋 단계에서 드러나는 **제도적 장치**가 필요합니다.

![레이더 가동](https://i.imgur.com/wYZic3o.png)

크게 네 가지 정도를 생각해볼 수 있는데

- A. **ESLint**로 **의존성 방향** 강제
  - `eslint-plugin-boundaries`로 **단방향 의존**과 **테스트/Mocking 예외**를 강제.
- B. **경로 별칭** 설정으로 Layer 식별
  - `@app/*`, `@processes/*`, `@features/*`, `@entities/*`, `@shared/*`, `@api/*`, `@config/*`
  - 깊은 상대경로 금지.
- C. **Barrel Export**로 공개면(Stable API) 관리
  - 각 feature는 **외부에 약속된 것만** `index.ts`로 export.
  - import할 때 슬라이스 내부 구현으로 직접 접근 X
- D. **상태 범위** 스코핑
  - 전역 상태는 **processes**에서만(필요 최소한).
  - feature 내부 상태는 feature에 격리.

특히 `A. ESLint로 강제`와 `B. 경로 별칭`을 꽤 유용하게 썼고  
관련 프로젝트 설정에 대해 [자세히 코드 스니펫까지 언급한 글](/til/eslint-configuration-for-fsd-rules)을 써뒀으니 필요하시다면 참고하세요.  
`C. Barrel Export`도 팀 합의가 있다면 ESLint 규칙을 설정해볼 수 있어보입니다.

## Entities를 추가하여 5-Layered가 되었어요

프로젝트를 진행하다보니 계층을 하나 더 두고 싶어졌는데요

<figure>

![더 갖고와](https://i.imgur.com/JbS5Tcn.png)

<figcaption>
케장콘
</figcaption>
</figure>

`features`보다는 더 낮은, 더 재사용 범위가 넓은 Layer에 두고 싶지만,  
그렇다고 `shared`에 두자니 *도메인 냄새*가 짙게 묻어있어 `shared`에 둘 수 없는 경우가 있었습니다  
FSD의 Layer들 중 `features`와 `shared` 사이에는 `entities` 계층이 존재하는데

> Entities Layer는 프로젝트에서 다루는 **핵심 비즈니스 개념**을 표현합니다.

예를 들어, 우리 게임에는 아래와 같은 Entity Slice가 존재합니다.

- game-session: 유저가 **현재 플레이중인 게임의 정보**(이어하기 세션)입니다. 플레이중인 캐릭터, 가방 상태, 진행상황 등이 이에 속합니다.
  - 이러한 정보는 게임 전반에 걸쳐 참조됩니다.
- portrait: **인물 대사** 화면을 위한 UI블록과 데이터 타입 등을 포함합니다.
  - 여러 feature에서 이러한 대사 화면을 사용하는 요구사항이 있었습니다.
- inventory: 현재 **가진 아이템들**을 화면에 표시하는 UI블록과 관련 타입 등을 포함합니다.
  - 이 또한 여러 feature에서 "내가 가진 아이템"을 확인하려는 요구사항이 있습니다.

모두 이 프로젝트 전반에서 사용되는 핵심 개념들이었습니다.
이에 따라 **Entities Layer**가 추가됩니다

![Entities Layer 추가 PR](https://i.imgur.com/Djh4unz.png)

이에 따라 아키텍처 헌법이 조정되는데  
의존 방향은

```
app  →  processes  →  features  →  entities  →  shared
                                         ↘ api (codegen)
```

이렇게 변하고, 이에 따라 eslint룰이나 경로 별칭 설정도 업데이트해줍니다.

### Entity 간 관계

[FSD - "Entity 간 관계"](https://feature-sliced.github.io/documentation/kr/docs/reference/layers#entity-%EA%B0%84-%EA%B4%80%EA%B3%84) 문서에서 말하기를

> 원칙적으로 **Entity Slice끼리는 서로 모르는 상태가 이상적**이지만,  
> 실제 애플리케이션에서는 Entity가 다른 Entity를 하위에 포함하거나 서로 상호작용하는 일이 자주 발생합니다.  
> 이런 경우 **두 Entity 간의 구체적 상호작용 로직은 상위 레이어에서 처리**하도록 권장합니다.

라고 합니다  
앞에서 나온 *같은 Layer의 다른 Slice끼리는 서로 의존을 금한다*의 한 형태라고도 보이네요

![어색한 두 사람](https://i.imgur.com/7yjA7Jl.png)

예를 들어, game-session이라고 하는 entity는 **현재 유저가 가진 아이템 정보**를 다룰 수 있고,  
inventory라는 entity는 **가진 아이템을 표현하는 UI블록**을 다룹니다.  
이 두 개념은 실제로 **서로 상호작용하는 관계**를 가지므로, app이나 feature에서 조합되어 사용됩니다.  
예를 들면, 어떤 feature slice에서 inventory의 컴포넌트에 아이템 목록을 props로 주입하고  
그 아이템 목록은 game-session으로부터 가져온 경우가 있을 수 있습니다

이런 식으로 **상위 Layer에서 조합한다**는 아이디어를 어디서든 유지해두면 꽤 유용한데  
마치 **의존성 역전**처럼 쓰이기도 해서, inventory entity를 사용할 때  
실제 데이터 뿐만 아니라 임의의 데이터를 주입해보는 등 테스트 또는 mock데이터를 넣을 때 용이합니다

# 후기와 회고

폴더구조 아키텍처에 FSD를 채택한 결정은 결론적으로 아주 적절했고  
프로젝트 구현을 바쁘게 진행하는 와중에도 그 덕을 많이 봤습니다.

- 코드가 기능 단위로 묶여있으니 **요구사항 변화에 대응**이 쉬웠습니다
  - 내부 구현만 바뀌는 경우, 대부분 **격리된 Slice 내부**에서만 작업이 끝납니다.
  - 기능 간 결합 방식까지 영향이 있는 경우에도, **상위 레이어에서의 조합 로직을 수정**하여 대응할 수 있습니다.
  - 실제로 "선반에서 물건 고르기" 기능은 MVP 구현으로 그 Feature Slice가 만들어진 후 여러 변경을 겪었습니다.
    - UI 구현/수정 -> `/ui` 세그먼트에서 작업
    - API 반영 -> `/model`에 _조회/제출_ 등 API 호출 훅 작성
    - 기능 요구사항 변경, 부가 기능 구현 등 -> Slice 내부에서 관련 로직 작업
    - 해당 기능 직후의 흐름에 대한 요구사항 변경 -> `app/` 레이어에서 `onSubmit` 같은 결합부 수정
- 어떤 Slice의 역할 범위는 갈 수록 축소되거나 확대될 수 있는데, 이 경우 중간에 **Layer를 격상하거나 하강**하면 되었습니다
  - 이 과정에서 미처 파악하지 못한 Layer 의존 규칙 이탈이 있더라도, 위에서 설정한 Lint 에러 덕에 바로 대응할 수 있습니다.
- **내가 작성하지 않은 코드를 파악하고 이해**하는 데 용이했습니다.
  - 특히 마감 직전에는 많은 작업이 빠르게 올라갔는데, 코드리뷰를 거쳐도 팀원이 작업한 코드를 완전히 파악하지 못하는 경우가 생깁니다.
  - 이럴 때 특히 **도메인 언어로 코드베이스가 구조화되며 설명된다**라는 FSD의 특성이 도움이 됩니다. 머릿속에서 묶어서 생각하지 않아도 이미 묶여있기 때문이겠습니다
    - 또한 이 덕분에 머릿 속의 **멘탈 모델**과 **실제 물리적 코드 배치**가 유사해집니다.
  - Slice 단위로 업무를 분담하고 병렬 작업을 진행하기에도 꽤 좋았습니다.

처음에는 저도 FSD의 개념을 도입함에 있어 저항감이 있었습니다  
Layer, Slice, Segment같은 용어, 그리고 그 각각의 상호관계를 모두 알아야 하기 때문이었어요  
제가 "FSD 해봅시다!"했을 때 팀원분의 저항감이 당연히 더 컸을거구요

![글쎄...](https://i.imgur.com/2PFFKp2.png)

그래서 일단 그 모든 결정을 내리게 된 경위를 담아서, Notion 문서로 공유했습니다

![Notion 문서 1](https://i.imgur.com/5vUIdKV.png)
![Notion 문서 2](https://i.imgur.com/TksaouI.png)

- 제가 고민했던 히스토리(이전 구조, FSD를 떠올리기 전의 간단한 개선안, 그러나 그 개선안도 부족했던 이유 등)
- 당시 코드베이스를 예시로 코드(파일)들이 어떻게 재구성될지 제시
- FSD 개념에 생소하면 가장 자주 궁금할 수 있는 내용을 정리

또한 결론적인 FSD 폴더구조 핵심만 문서화하여 **코드베이스 아키텍처 원칙**과 **Cursor Rules**를 레포지토리에 추가하거나  
ESLint 등 관련 프로젝트 설정을 작업하는 일 등  
귀찮은 일들은 당연히 치워두고 길을 닦아뒀구요

![코드베이스 아키텍처 원칙](https://i.imgur.com/gmJsmWH.png)

팀원분도 나중에 "처음 써보는 구조라서 꽤 어색했는데, 쓰다보니 잘 도입한 것 같다"고 하셨었어요

다만 몇 가지 아쉬운 점들은

- 초반에는 Barrel Export를 침범하여 직접 import하는 경우가 있었는데,
  - 그정도로 써야 할 정도의 재사용성이라면 해당 코드만 Layer를 내려야 했고
  - 그런 일이 없도록 Lint룰을 더 넣었으면 좋았겠네요
- `app` Layer에서는 비즈니스로직을 최소화하고 싶었는데, 조립하다보니 로직이 자꾸 추가될 때가 있었습니다
  - 로직을 빼둘 곳이 애매하기도 하고, 시간도 없어서 흐린눈 했었네요 ㅠㅠ

이 정도겠네요  
나중에 다시 FSD가 필요한 상황이 있게 된다면 이번 경험이 큰 도움이 될 것 같습니다.  
특히 그 때의 팀 상황이나 도메인에 맞게 반죽해서 쓸 수 있는 경험치가 되겠네요  
다른 형태의 폴더 구조를 구상하는 데 있어서도 좋은 영감이 될 듯 합니다.

다만 이번 경우에는 꽤 도메인이나 프로젝트 특성이 특이해서 이에 맞는 구조를 고민하다가 FSD까지 도달한 케이스인데요  
FSD 도입 전에 아래 몇 가지를 고려해보면 좋을 것 같습니다.

- 혼자 하는 미니 프로젝트에서는 규칙/레이어 등을 유지하는 비용이 더 클 수 있습니다.
- Route 등의 다른 관심사로 구조의 축을 세우는 편이 더 효과적일 수도 있습니다.
  - 위에서 잠깐 공식문서 언급이 나온 것처럼 *페이지 단위로 완전 독립적인 경우*가 그렇겠죠?
- 무엇보다도 **왜, 어떻게 FSD를 쓸지에 대한 팀 내 합의**가 선행되어야 합니다

![패트와매트 악수](https://i.imgur.com/U7eEAbu.png)

FSD든 뭐든 간에 **우리 프로젝트, 우리 팀에 맞는 구조**를 고민하고 함께 세우는 것이 가장 중요한 것 같습니다.

이만 마칩니다
