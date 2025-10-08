---
title: "🤸 온몸 비틀기로 모바일 웹 유저에게 전체화면 경험 유지시켜주기"
date: 2025-09-28 16:27:38
description: "스크롤 없는 화면에서도 위로 스와이프하여 모바일 웹 브라우저 툴바를 숨길 수 있도록"
tag: ["React", "JavaScript", "CSS"]
---

요즘 웹 게임을 만드는 프로젝트에 참여하고 있습니다.  
재난 상황에서 생존가방의 중요성을 알려주는, Game-Based Learning을 목표로 한 웹 게임입니다

![만들고 있는 웹 게임](https://i.imgur.com/FHi2KMj.png)

약간 이런 식으로, 모바일 웹 + 가로모드로 플레이하는 게임인데요  
이런 모바일게임이라면 응당 몰입도를 위해 **전체화면**이어야 하고  
**스크롤은 없는, 뷰포트에 딱 맞는 화면**인게 자연스럽겠습니다.  
웹페이지가 으레 스크롤을 갖는 "문서"인 것과 다르게요

근데 처음 개발 시작할 때 가장 문제였던 점...

![상단 바가 거슬림 - 가로](https://i.imgur.com/KOFcIl1.png)

게다가 iOS 크롬 세로모드에서는요..

![상단 바가 거슬림 - 세로](https://i.imgur.com/shTOAeL.png)

이 툴바 UI가 아래위로 둘 다 생겨버립니다

<figure>

![좁은 틈 고양이](https://i.imgur.com/1R4YG1I.png)

<figcaption>
좁아요..
</figcaption>

</figure>

이게 생각보다 미관상 유저 몰입을 해치고,  
또한 안그래도 작은 모바일 화면을 더 좁게 쓰게 되어버리니  
이것을 줄이고 전체화면처럼 만들 방법을 찾기로 했습니다.

그리고 이 _모바일 웹 브라우저의 고정UI_ (상단/하단바)를 무어라 부르는지가 저는 그 정확한 용어가 궁금했는데

- [Chrome for developers의 한 문서](https://developer.chrome.com/docs/css-ui/edge-to-edge?hl=ko)에서는 "**Address Bar**"(주소 표시줄), "**Navigation Ba**r"(탐색 메뉴)같은 용어를 씁니다.
- [2012년의 이 아티클](https://www.nngroup.com/articles/browser-and-gui-chrome/)에 따르면 _"Chrome이란 사용자 데이터와 웹 페이지 콘텐츠를 둘러싼 사용자 인터페이스 오버헤드를 의미합니다"_ 라며 **Browser Chrome**이라는 용어로 해당 UI를 소개합니다.
  - 다만 구글 크롬 브라우저가 존재해버리는 탓에 이것으로 검색하면 다 구글 크롬 얘기뿐입니다 ;;
- 또는 **Toolbar**, **상단/하단 바**, **Browser Controls** 이런 식으로 대충 부르는 것 같습니다

좀 모바일 웹 + GUI 공식으로 접근하자면 브라우저 크롬인 것 같기도 한데, 이게 구글 크롬이랑 혼동되니까 안될거같구요  
어지간하면 **툴바**라고 이 글에서는 부르겠습니다. 짧으니까요  
또는 가끔 상단바 하단바 이런식으로 부를 수도

이제 본격적으로 시작해보기 전에, 제가 이루고 싶은 요구사항을 정리해보자면

- 언제든지 **유저 상호작용으로 전체화면(흉내라도)** 을 만들 수 있는 방법이 필요하며
- 다만, 게임 특성상 **스크롤 없는 UI**를 구현해야 하고
- 이 방법이 **어떤 환경에서도 작동하며 충분히 단순하여 복잡한 유저행동을 요구하지 않았으면** 합니다.

# 전체화면 경험을 만드는 3가지 방법

먼저.. 궁극적으로는 제 상황을 해결해주진 못했지만 이런 방법이 있다는 내용을 알기 좋았던 문서를 읽고 시작합시다  
web.dev에 [전체화면 경험 만들기](https://web.dev/articles/fullscreen?hl=ko)라는 아티클이 있는데요  
여기서 말하기를 **웹 앱 전체화면을 구현하는 방법**으로 다음과 같이 크게 세 가지 방법이 있다고 합니다

- 사용자 동작에 의해 브라우저에 _전체화면_ 을 요청
- 홈 화면에 앱을 설치
- 주소 표시줄을 자동으로 숨겨 가상 전체화면 구성

이 세 가지에 대해 잠깐 알아봅시다.

## 1. 사용자 동작에 응답하여 브라우저에 전체화면 요청하기

웹 API로 [Fullscreen API](https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API)라는 친구가 있습니다

![웹 브라우저 Fullscreen](https://i.imgur.com/hdhWFwY.jpeg)

대충 이런 상태로 만들어주는 API인데요([데모 URL](https://web-api-examples.github.io/fullscreen.html))  
이거 쓰시면 편하게 전체화면을 만들 수 있습니다.  
이만 마칩니다.

<figure>

![라고 할줄을 아셨습니까](https://i.imgur.com/UZYSmDk.png)

<figcaption>
from 케장콘 8
</figcaption>
</figure>

그러나 iPhone에선 안됩니다..  
전 가난해서 Android 폰이 없어 안드에선 가능한지 잘 모르겠지만요

![아이폰에선 안됨 ㅜㅜ](https://i.imgur.com/fWS2vTf.png)

[Can I Use](caniuse.com/?search=fullscreen)를 확인해보면

![Can I Use Fullscreen API](https://i.imgur.com/Ej44ooC.png)

대충 파릇파릇해서 어지간히 잘 지원하나? 싶지만  
*Notes*에서 5번 각주를 보면 **"부분적 지원"은 iPad만 되고 iPhone은 안된다**를 의미한다고 하네요..  
실제로 제 아이뽀웅 기준으로는 사파리건 크롬이건 간에 다 먹통입니다

"제 기기에서는 되는데요?"를 외칠 수도 없게 되었으니 다른 방법을 찾아야합니다 ..

![It worked on my machine](https://i.imgur.com/2ycZxKf.png)

## 2. 홈 화면에 앱을 설치

웹페이지를 **홈 화면에 추가**하여 진짜 앱처럼 쓸 수 있도록 PWA(Progressive Web App)를 구성하는 방법도 있습니다.

<img src="https://i.imgur.com/g0fuQa8.png" style="max-width:280px;" />

이렇게 홈 화면에 추가하고 그 추가된 앱을 실행하면, 열받았던 모바일 웹 브라우저 툴바UI는 싹 사라져버립니다.

![홈 화면에 추가하고 실행한 모습](https://i.imgur.com/1q7ICL5.png)

그러려면 개발자는 [웹 앱 메니페스트](https://developer.mozilla.org/ko/docs/Web/Progressive_web_apps/Manifest) JSON파일을 추가하고 아래와 같이 웹페이지에 삽입합니다.

```html
<link rel="manifest" href="/manifest.json" />
```

자세한 내용은 [MDN - 프로그레시브 웹 앱](https://developer.mozilla.org/ko/docs/Web/Progressive_web_apps)을 참고하세요.  
다만 이 문서에 따르면 브라우저 호환성이 꽤나 벌겋습니다. 꽤 최근에 나온 기능이기도 하고요

게다가 PWA의 큰 단점 중 하나는 **앱스토어에 등록할 수 없다**는 점인데  
이는 _"앱은 응당 앱스토어에서 받는 것"_ 이라는 유저의 단단한 인식을 깨고 굳이  
_"위에 이렇게 생긴 버튼 눌러서요.. 홈 화면에 추가 누르시고.. 확인 눌러주세요.."_ 라고 안내해야 한다는 것부터 이미 사용자 경험이 꽤 낮다고 보입니다

언젠가는 이 프로젝트에 PWA 메니페스트를 구성할 예정이긴 한데요,  
그러나 이것만 믿고 _"무조건 홈 화면에 추가하고 플레이하세요"_ 하기에는 너무 무책임하다고 생각됩니다  
저는 그냥 모바일에서 링크에 접속하면 바로 게임을 시작할 수 있는 그런 환경을 원해요

## 3. 주소 표시줄을 자동으로 숨기기(?)

단 한 줄로 "가짜 전체화면"을 만드는 법이 있다고 하는데요

```js
window.scrollTo(0, 1);
```

??

아마.. 모바일 웹 브라우저에서 스크롤을 조금 내리면 툴바가 접히는 동작을  
프로그래밍적으로 재현하게 하는 것 같은데요

근데 제가 저 코드줄을 어떻게 사용하고 응용해봐도 스크롤만 진행될 뿐 툴바가 접히진 않았습니다  
실은 AI들도 이것을 학습한건지 항상 저 코드부터 내놓더라구요. 딱히 도움이 되진 않습니다

그리고 그 밑에 웬 경고가 있는데요

> I am telling you this as a friend. It exists. It is a thing, but it is a hack. Please don't use it.

쓰지 말라는 이유는 그 아래 문단을 보건대 "사용자 경험을 해친다"인 것 같은데요  
예를 들어, 뒤로가기할 때 브라우저들은 이전의 스크롤 위치를 복구하려고 하는데  
이것을 덮어쓰므로 유저들이 짜증지대로일 수 있다고 합니다

어차피 동작을 안하니까 다른 방법을 찾아야해요

# 모바일 웹 브라우저 UI는 스크롤을 내리면 숨겨진다

라는 사실은 어지간히 모바일 웹 브라우저를 써본 사람들은 몸으로 기억할 것 같은데요

<figure>

![스크롤 전/후 모바일 웹브라우저의 UI가 닫힌 모습](https://i.imgur.com/CbZeSyk.png)

<figcaption>모바일 웹 브라우저에서 툴바가 열려 있는 초기 상태(좌) & 스크롤로 툴바가 접힌 상태(우)</figcaption>
</figure>

좌측은 기본 상태인데요, 크롬/사파리처럼 모바일 웹 브라우저의 상단/하단 바가 시야를 방해합니다  
여기서, 크롬이든 사파리든, 터치 스크롤(스와이프)로 문서를 내리면, 자연스럽게 상단/하단 바가 최소화됩니다.

그럼 문서 크기를 `100vh + 1px` 이런식으로 아주 살짝만 스크롤이 생기게 하면 안될까요?  
그래서 그런 식으로 스크롤이 아주 살짝 있게 페이지를 하나 만들어봤습니다

<!-- ![calc(100dvh + 1px)로 만든 페이지](https://i.imgur.com/RinDXbJ.gif) -->

![calc(100dvh + 1px)로 만든 페이지](https://i.imgur.com/PdfjDCW.gif)

제가 터치하는 궤적이 흰 선으로 그려지게 해놨습니다.  
제가 열심히 터치하고있다는 사실을 알리기 위해서요 ㅋㅋㅋ

왜 근데 저는 상단/하단에 있는 바가 안접히죠????

![왜 안 되지?](https://i.imgur.com/mMTdkII.png)

## 당신의 웹페이지는 스와이프하여 스크롤해도 툴바가 접히지 않는 이유

뭔가 제가 모르는 `<meta>` 옵션이라거나 이런게 있었던걸까요?  
제가 회사에서 개발하는 웹사이트들도, 이 블로그도, 툴바가 잘만 접히던데요..

그래서 갖가지 페이지들을 다 뒤지며 스와이프로 스크롤해보다가 발견한 점

<figure style="display: flex; justify-content: center; gap: 12px;">

<span>

![스크롤로 전체화면 안되는게 있고](https://i.imgur.com/032vVLw.gif)

</span>

<span>

![스크롤로 전체화면 되는게 있음](https://i.imgur.com/jNBUWUT.gif)

</span>

</figure>

똑같은 사이트인데,  
스크롤하여 툴바가 줄어들지 않는 경우(좌)가 있고,  
스크롤하여 툴바가 줄어드는 경우(우) 있습니다?????

저는 여기서 힌트를 얻었습니다..  
아!! **_문서에 충분한 높이가 있어야_** 하는구나!

![깨달은 짤](https://i.imgur.com/Ug9FKtk.png)

그래서 위에서 `100dvh + 1px`와 같이 실험했던 예시를  
호방~하게 `200dvh`로 바꿔서 해봅니다.

<!-- ![200vh로 다시 스와이프 실험](https://i.imgur.com/z6nJqMa.gif) -->

![200vh로 다시 스와이프 실험](https://i.imgur.com/D0MCfU6.gif)

성공!! 이런 동작이 있었는 줄은 꿈에도 몰랐네요.  
이게 정확히 스크롤이 얼마나 있어야 하는건지는 솔직히 모르겠어요.  
대강 `110vh ~ 120vh` 사이던데  
게다가 vh기준이 아니라 절대px기준일 수도 있구요  
관련 브라우저 명세같은 것이 있는지 찾아보고싶었는데, 아무리 찾아도 안 나왔습니다(혹시 이것에 대해 아신다면 제에발 제보부탁드립니다)

# 구현하기

방금 **문서에 충분한 높이가 있다면 스크롤하여 모바일 웹 브라우저 UI를 축소**할 수 있음을 알았습니다  
이것을 이용하여 마치 **"위로 스와이프하여 전체화면 켜기"** 인 것처럼 유저 경험을 설계하면 될 것 같은데요  
또한 게임에 어울리게, **컨텐츠는 스크롤이 없어야** 한다는 조건이 있었습니다

## 스크롤 가능한 배경 영역과 컨텐츠 영역 레이어를 분리하기

컨텐츠는 스크롤이 없고, 다만 스크롤하여 모바일 웹 브라우저 UI를 축소할 수 있어야 한다면..

![컨텐츠와 배경 영역 레이어 분리](https://i.imgur.com/lWFodIW.png)

이런식으로, 배경에는 스크롤 가능한, 그러나 보이지 않는 레이어를 하나 깔아주고  
그 위에 실제 컨텐츠 화면 레이어를 만들고 이것이 뷰포트 전체를 덮게 하면 좋을 것 같아요

먼저, _스크롤 가능한 배경 레이어_ 역할을 할 `<BackgroundLayer>`를 하나 만듭니다.  
루트 레이아웃처럼 공통 적용될 수 있는 위치에 추가하면 하면 좋겠네요

```tsx
<div aria-hidden className="h-[1000vh] select-none">
  {children}
</div>
```

단순히 그냥 충분한 높이를 가질 수 있도록 해주고,  
`user-select: none;`을 적용하여 이 요소를 선택하지 못하는 상태로 만들어줍니다.

이제 _컨텐츠 화면 컴포넌트_ 에는 아래와 같이 설정해주면 되는데

```tsx
<BackgroundLayer>
  <div className="fixed inset-0 z-[1] touch-pan-y overflow-hidden">
    {renderScreen()}
  </div>
</BackgroundLayer>
```

`fixed inset-0 z-[1]`로 전체 뷰포트에 고정으로 덮어주시고  
`overflow-hidden`으로 혹시나 스크롤이 생기지 않게 해줍시다  
`touch-pan-y`는 터치 방향을 y축으로만 제한합니다.

![레이어 분리 적용 결과](https://i.imgur.com/Ks2tGAg.gif)

이런 식으로, 아래에서 위로 스와이프하여 전체화면에 진입할 수 있고  
화면 전환(Page 1과 Page 2) 간에도 이것이 유지되는 효과를 낼 수 있습니다.  
또한 컨텐츠 영역은 스크롤에 아무 영향 없이 항상 전체 뷰포트를 덮게 되었네요

## 스크롤하여 바닥에 닿지 못하게 방지하기

iOS 사파리에서는 그렇지 않은데요, iOS 크롬에서는 아래와 같이  
_바닥에 닿으면 다시 툴바UI가 튀어나오는_ 동작이 있습니다

![바닥에 닿으면 모바일 웹 브라우저 UI](https://i.imgur.com/TCVEzhv.gif)

한 번 스크롤 바닥에 닿고, 다시 스크롤하려하면 툴바가 튀어나오네요

이것을 막기 위해, 스크롤을 일정량 내리면 다시 스크롤을 초기화해줘야겠어요.  
`<BackgroundLayer />`에 다음을 추가합니다

```tsx
const SCROLL_RESET_RATIO = 0.75;

...

const handleScrollReset = useCallback(() => {
  const doc = document.documentElement;
  const scrollTop =
    window.pageYOffset || doc.scrollTop || document.body.scrollTop || 0;
  const maxScrollable =
    (doc.scrollHeight || document.body.scrollHeight) -
    (doc.clientHeight || window.innerHeight);
  if (maxScrollable <= 0) return;
  const progress = scrollTop / maxScrollable;
  if (progress >= SCROLL_RESET_RATIO) {
    window.scrollTo({ top: 10 });
  }
}, []);

useEffect(() => {
  const onScroll = () => handleScrollReset();
  window.addEventListener("scroll", onScroll, { passive: true });
  return () => window.removeEventListener("scroll", onScroll);
}, [handleScrollReset]);
```

이 때, `scrollTo`에서 `behavior: "smooth"`를 넣지 않도록 주의합시다.  
smooth로 넣어버리면 스크롤이 다시 0으로 올라갈 때 툴바가 또 튀어나옵니다.  
또한 아예 0까지 올려버리면 iOS 사파리에서는 다시 툴바가 튀어나오기도 하니 조금 이격을 줍니다.

아무튼 이렇게 해서 다른 의미의 _무한스크롤_ 을 구현했네요 ..

![끝이 없네](https://i.imgur.com/vitG3Pk.png)

## 자연스러운 유저 경험을 설계하기

이제 "아래에서 위로 **스와이프하여 전체화면으로 플레이할 수 있다**" 라는 사실을 알리고 싶은데요  
온보딩/튜토리얼같은 좀 더 직접적인 방법이 있을 수 있지만  
첫 화면에서 "스와이프하여 시작"처럼 더 자연스럽게 알리는 방법도 있을 것 같습니다.

이런거 구현하려면

- "위로 스와이프하여 시작하세요"같은 안내가 있는 덮개 화면을 하나 준비
- 터치 이벤트를 등록하여 덮개를 밀어올릴 수 있게 상호작용 추가
- 덮개가 일정치 밀어올려졌으면 (ex. 화면의 50%를 넘어갔다면), 자연스럽게 완전히 걷어지도록 설정
- 덮개가 걷어지면, 게임을 시작하는 메인메뉴가 등장

이런 식으로 구현하면 될 것 같네요.  
요구사항만 잘 정리해서 던져주면 AI가 잘 짜주니까, 지루한 상세 구현은 스킵하고  
결과물만 봅시다.

![스와이프하여 전체화면 기능을 유저 경험에 녹여내기](https://i.imgur.com/O0zGtQ7.gif)

인터랙션 디테일이나 디자인은 수정되겠지만 이런 아이디어를 기반으로 게임에 적용될 것 같습니다  
유능한 디자이너분들이 계셔서 걱정이 없습니다. 저만 잘하면 됨 . ..

그리고 터치 이벤트(`touchmove` 등)를 더 세밀하게 조절하면  
위에서 아래로의 스와이프로 인한 툴바 등장을 막는게 어느정도는 되긴 하는데  
유저가 툴바와 상호작용하고 싶을 때를 위해 그정도까지 제어하는건 안좋을 것 같긴 하네요

---

\
이번 시간에는 모바일 웹에서 유저에게 언럭키 전체화면을 제공할 수 있는 방법을 고민했는데요  
[web.dev](https://web.dev/)에서 말하는 3가지 방법이 있었지만  
(1) Fullscreen API는 iOS에서 호환되지 않았고  
(2) "홈 화면에 추가"할 수 있도록 하는 방법은 유저 입장에서 번거로워보였으며  
(3) 뭔가 트릭이라고 나와있는 것은 동작하지 않았습니다

저는 **모바일 웹 브라우저 UI(브라우저 크롬 or 툴바 or ...)는 스크롤할 때 숨겨진다**는 동작을 떠올려서  
이러한 브라우저 동작을 **모바일 웹 게임이라는 특성**에 맞게 응용하고 **사용자 경험에 자연스럽게** 녹여내고자 해봤습니다  
결과적으로는 iOS, Android 관계없이 **사용자 액션**(아래->위 스와이프)**으로 전체화면과 유사한 효과**를 낼 수 있게 됐습니다

저는 "웹에서 이런 것도 되나?"싶은 것들 한번 해보는게 은근 재밌더라구요  
그런 점에서 지금 하는 웹 게임 프로젝트는 기존에 하던 웹개발과는 많이 다르고, 은근히 도전과제가 많아서 재밌는 것 같습니다  
일단 완성부터 잘 해서 들고오겠습니다 ..

이만 마칩니다
