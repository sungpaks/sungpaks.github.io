---
title: "💥 3분카레보다 빠르게 자바스크립트로 물리적인 충돌 구현하기"
date: 2025-11-02 12:31:01
description: "일반물리학 수업이 생각나요"
tag: ["JavaScript"]
---

최근에 완전히 손 놓고 있던 [Bugi and Friends](https://chromewebstore.google.com/detail/bugi-and-friends-150/cidndoahplamogkfaimmahedcnakjnag?hl=ko&gl=001)을 조금 업데이트했습니다

- AI로 나만의 캐릭터를 생성하는 기능을 추가해봤고 (실험적)
  - 이거 본인의 API Key를 원래 입력해야 하지만 `hamburger`를 API Key에 입력하면 제가 대신 냅니다. 다만 30분 전역 락이 걸려있어요. 크레딧이 사라지면 또 안될수도
- 감자튀김 캐릭터도 생겼고
- 던져진 햄부기가 다른 햄부기와 충돌합니다

아무튼 많관부  
그 중에서 오늘은 이 **충돌 구현**에 대한 이야기인데, 완전 탄성 충돌을 이용하려고 합니다

![햄부기끼리 충돌 예시](https://i.imgur.com/xAWcidZ.gif)

# 완전 탄성 충돌

이렇게 두 물체가 충돌해서 서로 튕겨나가는 상황을 그려내려면 **완전 탄성 충돌**로 간주하면 좋겠는데요  
완전 탄성 충돌이란 **충돌 전후의 운동량과 운동에너지가 모두 보존**되는 충돌인데  
대충 "_단순하고 이상적으로 서로 반발(반사)하는 충돌_"이라고 생각합시다.  
같은 *햄부기끼리는 질량이 같다*고 생각할 수 있으니까, 1차원에서는 아래와 같이 나타낼 수 있곘네요

![1차원 완전탄성충돌](https://i.imgur.com/uNDIBLv.png)

근데 2차원에서는 이렇게 정면충돌뿐만 아니라 빗겨치는 상황이 많이 생깁니다

![2차원 충돌](https://i.imgur.com/q00ISKj.png)

이런 경우에는 충돌각(입사각)을 고려한 벡터연산을 해봐야 할 것 같은데요  
밤에 누워서 자려다가 갑자기 .. 이걸 어떻게 벡터계산하더라? 싶어서

![뜬눈으로](https://i.imgur.com/NGZfoYM.png)

지피티한테 다이어그램 그려달라고 시켰는데

![지피티가 그려준 다이어그램](https://i.imgur.com/Wi3nZWV.png)

좀 인간의 인지로는 쉽사리 이해가 안 가게 그려주거나, 너무 간단한 상황을 그려주더라구요  
그래도 다이어그램 그려주는건 잠깐 놀랐는데 생각해보니 얘는 파이썬을 제일 잘하니까 그닥 놀랍지도 않은 듯  
옛날에 [scipy 써볼 때](/linear-fit-by-python-scipy) 저렇게 생긴 그림을 쉽게 그릴 수 있었습니다

![scipy 써본 사진](https://i.imgur.com/K3acTaf.png)

암튼간에, 2차원에서 완전 탄성 충돌이 어떻게 일어나는지 잠깐 분해해봅시다.

## 2차원에서의 완전 탄성 충돌

![2차원에서 크기를 고려한 완전탄성충돌 그림 1](https://i.imgur.com/fvS7eDS.png)

제가 이해해두고 넘어가려는 것은  
이런 식으로 서로 다른 속도벡터와 서로 다른 입사각으로 빗겨칠 때 어떻게 되느냐인데  
이렇게 .. 좀 복잡해보여도 가장 일반적인 경우에 대한 해를 구해두면 단순한건 금방 나오니까 좋아요

왼쪽 위의 1번 공은 $v_1$(빨간 화살표)의 속도로 운동중이고, 입사각은 $\theta_1$입니다  
입사각은 중심과 중심을 잇는 점선(dotted)과 속도벡터가 이루는 각이구요  
오른쪽 아래의 2번 공은 비슷하게, $v_2$(파란 화살표)의 속도로 운동하고 입사각은 $\theta_2$입니다

이제부터 충돌 후의 속도 $v_1', v_2'$를 구하려면 아래 한 문장만 기억하고 전개하면 되는데  
**충돌하면 서로 _법선(수직) 방향 속도는 교환하고 접선 방향 속도는 유지_** 한다 입니다.  
충돌하는 두 물체가 서로 질량이 같으니 이렇게 간단하게 생각할 수 있네요

![스파이더맨 거울 짤](https://i.imgur.com/tEjANW4.png)

일단 그럼 아까 그림에서 **법선(normal)속도 $v_{n1}$, $v_{n2}$, 접선(tangent)속도 $v_{t1}$, $v_{t2}$** 를 분해해봅시다

![2차원에서 크기를 고려한 완전탄성충돌 그림 2](https://i.imgur.com/C8zckao.png)

여기서 그럼 "법선 방향"을 $\hat{n}$이라 할 때  
충돌 전에는 $\vec{v_1} = v_{n1}\hat{n} + v_{t1}\hat{t}$  
충돌 후 $\vec{v_1}' = v_{n1}\hat{n} + v_{t1}\hat{t} - v_{n1}\hat{n} + v_{n2}\hat{n}$(법선방향 속도를 교환)  
3,4항을 묶어 $- v_{n1}\hat{n} + v_{n2}\hat{n} = (v_2 - v_1)\hat{n}$ 이렇게 상대속도로 표현할 수 있고  
그럼 상대속도 $\vec{u} = \vec{v_2} - \vec{v_1}$로 쓸 때  
**충돌 후 속도는 $\vec{v_1}' = \vec{v_1} - \vec{u}\cdot\hat{n}$** 라고 단순하게 쓸 수 있습니다

이렇게 쓰면 편한게 입사각 $\theta$를 코드쓸 때 하나도 생각하지 않아도 되고  
중심 x,y와 속도 x,y만 있으면 된다는 점입니다  
$\hat{n}$은 그냥 중심점을 이어서 만들면 되거덩요

# 구현하기

이제 그냥 끝인데 .. 구현만 하면 됩니다  
먼저 벡터 연산을 자바스크립트 코드로 작성하고

```js
function sub(a, b) {
  return { x: a.x - b.x, y: a.y - b.y };
}
function dot(a, b) {
  return a.x * b.x + a.y * b.y;
}
function mul(a, s) {
  return { x: a.x * s, y: a.y * s };
}
function add(a, b) {
  return { x: a.x + b.x, y: a.y + b.y };
}
```

그리고 혹시 [Math.hypot()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/hypot)이라는 수학메서드가 있는거 아셨나요?

![뭔가 발견?](https://i.imgur.com/GGCI1OV.png)
![hypot 설명](https://i.imgur.com/CTuP3kY.png)

피타고라스 딸깍 ㅋㅋㅋ 이거로 법선 단위벡터를 편하게 구할 수 있는데

```js
// c1, c2는 x, y 프로퍼티(number)를 갖는 벡터 객체
function getNormalUnitVector(c1, c2) {
  const normalVector = sub(c1, c2); // 중심 사이를 잇는 벡터
  const normalVectorLength = Math.hypot(d); //
  const unitNormalVector = {
    x: normalVector.x / normalVectorLength,
    y: normalVector.y / normalVectorLength
  };
}
```

이런 식이겠네요  
*충돌 후의 속도를 구하는 함수*는 이제

```js
// c1, c2, v1, v2는 x, y 프로퍼티(number)를 갖는 벡터 객체
function getVelocityAfterCollision(c1, c2, v1, v2) {
  const normalUnitVector = getNormalUnitVector(c1, c2);

  const relativeVelocity = sub(v1, v2);
  const relativeVelocityAlongNormal = dot(relativeVelocity, normalUnitVector);

  const newV1 = sub(v1, mul(normalUnitVector, relativeVelocityAlongNormal));
  const newV2 = add(v2, mul(normalUnitVector, relativeVelocityAlongNormal));

  return { v1: newV1, v2: newV2 };
}
```

쉬운데요 ~

## 충돌 감지 (Collision Detection)

충돌 감지도 잠깐 살펴보고 지나가자면

![충돌](https://i.imgur.com/OCG9jt9.png)

지금 물체가 원 모양이므로 단순히  
`if(두_물체의_중점_사이_거리 <= 반지름*2)` 면 됩니다

```js
function checkCollision(c1, c2, r1, r2) {
  const d = Math.hypot(c2.x - c1.x, c2.y - c1.y);
  return d <= r1 + r2;
}
```

이걸 이용해서 아래와 같은 구현을 넣으면 끝인데

- 어떤 햄부기가 날아가는 중이라면, 다른 햄부기들을 for문으로 돌며 `checCollision`
- `checkCollision`된 햄부기가 있다면, `getVelocityAfterCollision`로 충돌 후의 속도를 계산하여 둘 다 속도 변경
- 위치를 충돌 직전으로 되돌리거나, 직전에 부딪힌 햄부기와는 부딪히지 않게 처리
  - 이게 있어야 *겹쳐져서 무한으로 충돌 연산*이 일어나지 않습니다

---

\
나중에 발견했는데 [충돌의 물리학](https://omniphys.github.io/collision/)이라는 웬 아티클이 있더라구요(서울대 사범대 부설고??)  
여기에도 물체끼리의 충돌 연산 구현이 아주 잘 설명되어 있습니다  
여기는 게다가 반발계수까지 넣었네요  
다른 재밌는 것들도 많은 것 같아요 ㅋㅋㅋ 읽어보면 좋을 듯

이만 마칩니다
