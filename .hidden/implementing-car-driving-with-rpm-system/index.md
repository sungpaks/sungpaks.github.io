---
title: "기어변속 넣어서 차량 주행 구현하기 - 내 손 안의 F1 게임 만들기 1일차"
date: 2026-05-29 22:25:33
description: "F1 게임할 장비 살 돈은 없어서 그냥 만들어봅니다."
tag: ["Three.js", "TypeScript", "JavaScript"]
---

요즘 저는 F1에 빠져있는데요  
F1이 재밌는 이유는 많고 많지만 엔진 소리, 특히 시프트(기어 변속) 소리를 진짜 좋아해요

<iframe width="560" height="315" src="https://www.youtube.com/embed/hnyFSfLmxUU?si=QE2g7gvNdl7A8KBP" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

F1 게임도 있어서, 브레이크/액셀 페달과 시트 그리고 스티어링 휠 등 장비와 함께하면 이런 소리와 운전하는 재미를 느낄 수 있습니다

<iframe width="560" height="315" src="https://www.youtube.com/embed/--UtTplJMTk?si=mx3sLflbdWXwb2F_" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

그래픽 미쳤다(P)

근데 저는 돈도 없고 집에 그런걸 놓을 곳도 없어서 슬퍼하다가, 그냥 만들기로 했습니다

- 휴대폰을 기울이거나 해서 움직일 수 있다면?
- 실제로 RPM을 표현하고 기어 변속을 할 수 있다면??
- 그리고 그 RPM에 따라 엔진 소리가 변한다면???

와 ! 나도 이제 F1 게임 오너!

![](https://i.imgur.com/T4BB1d4.png)

그러려면 먼저 움직이는 차를 준비해야겠죠??  
Three.js로 구현해보려고 합니다

# RPM없이 일단 움직이는 차를 구현하기

![객체 의존성 다이어그램](https://i.imgur.com/5uLEwiH.png)

일단 Three.js와 TypeScript로 대충 이런 구조를 만들었습니다.

- `ThreeScene`에는 모든 요소(오브젝트, 키 입력, 컨트롤러 로직 등)들을 모두 모아 렌더링하고 게임 루프를 돌리게 합니다.
- `KeyboardMoveInput`은 컴퓨터에서 테스트하기 위한 임시 사용자입력 클래스입니다. 키보드로 앞뒤좌우 및 기어변속 키 입력을 받습니다.
  - 나중에는 `MoveInput`을 추상화해 추출하고 여러가지 타입의 입력을 붙일 예정입니다. 이에 대해서는 속편에서 다룰게요
- `createCarModel`과 `createWorld`는 씬에 렌더링할 오브젝트를 생성합니다. Codex한테 대충 만들어달라고 했습니다.
- `VehicleController`: 차량 움직임(가속과 감속, RPM과 기어 변속 등) 로직을 담당할 클래스입니다.

![Codex가 생성해준 차량과 월드 오브젝트](https://i.imgur.com/XiypPeN.png)

Codex 시켰더니 대충 이런 오브젝트들을 그냥 만들어줬습니다  
이제 차를 움직이게 해봅시다

## KeyboardMoveInput

일단 테스트는 키보드로 눌러가며 해봅시다.  
일단 차량 주행에 필요한 세 가지 요소를 선언할건데요, 모두 0~1 사이의 값으로 표현합니다.

- **Throttle**: 대충 액셀을 얼마나 밟았는지 나타내는 수치입니다.
  - 이렇게 생각하면 얼추 맞습니다: "Throttle을 열었다" -> "가속중", "Full Throttle" -> "풀악셀"
- **Break**: 대충 얼마나 멈추고 싶은지 나타내는 수치입니다.
- **Steering**: 방향입니다.

이에 대한 타입을 선언해봅니다

```ts
export type MoveInput = {
  throttle: number;
  brake: number;
  steering: number;
};
```

`KeyboardMoveInput.getInput`에서 대략 이렇게:

```ts
getInput(): MoveInput {
  return {
    throttle: Number(ArrowUp) - Number(ArrowDown),
    brake: Number(Space),
    steering: Number(ArrowRight) - Number(ArrowLeft),
  };
}
```

앞쪽 화살표로 앞쪽 가속을, 뒤쪽 화살표로 뒤쪽 가속을 나타내고, 스페이스바를 눌러 제동합니다.  
좌우 화살표 중 오른쪽은 1로, 왼쪽은 -1로 설정해 방향을 나타내줍니다.

가속과 감속, 방향은 0~1사이에서 연속적으로 변화하는 값이어야 하는데  
키보드로는 0과 1 둘 중 하나만 나타낼 수 있어서 아쉽긴 합니다  
그래도 일단 넘어갑시다

## VehicleController

이 클래스에는 세 가지 공개된 인터페이스가 있습니다.

- `setInput`: 유저 입력으로부터 `throttle, break, steering`을 받아옵니다.
- `update`: 매 프레임마다 호출하여 차 상태(속도, 위치 등)를 갱신하게 됩니다.
- `getTelemetry`: 밖에서 알아야 하는 정보들을 반환해줍니다(속도, 기어, RPM 등)

`setInput`과 `getTelemetry`는 대충 이런 식으로 간단하니 넘어갑시다

```ts
setInput(input: MoveInput): void {
  this.input = input;
}

getTelemetry(): VehicleTelemetry {
  return {
    speedMps: this.speedMps,
    headingRad: this.headingRad,
    input: this.input,
    ...
  };
}
```

제일 중요한건 `update` 메서드예요.

### update

먼저 **속도**와 **바라보는 방향**에 관한 필드를 정의해줍니다

```ts
export class VehicleController {
  private speed = 0;
  private heading = 0;
```

단위는 각각 $m/s$, $rad$ 입니다  
실제로는 `speedMps, headingRad`처럼 변수명에 단위까지 넣어버렸는데  
여기서는 간단하게 `speed, heading`으로만 알아봅시다.

```ts
update(deltaTime: number): void {
  // ...
}
```

직전 호출에 비해 시간이 얼마나 지났는지 `deltaTime`을 인자로 받는 `update` 메서드 내부를 이제부터 구현해봅시다.

#### 속도 계산

1. 가속도(Throttle에 비례)에 의한 가속 $v = v_0 + a*t$ 를 반영하고
2. 감속도 해줘야 하는데, 단순하게 먼저 속도에 비례한 선형 감소를 반영하고
3. 임시로, 속도 제한을 둡니다.

나중에는 3번같은 인위적인 속도제한 대신, 저항에 의한 감속으로 인해 속도가 어떤 지점으로 수렴하게끔 모델링하려고 합니다

```ts
// 가속: Throttle 밟는 만큼 빠르게 가속한다
this.speed += this.input.throttle * acceleration * deltaTime;
// 감속: 현재 속도에 비례해서 속도를 줄인다(단순하게)
this.speed -= this.speed * drag * deltaTime;
// 속도 제한
this.speed = THREE.MathUtils.clamp(this.speed, minSpeed, maxSpeed);
```

이러면 끝입니다.

근데 아까 감속을 너무 단순하게 만들었는데  
현실에서 달리는 차가 저항을 받는 원인으로 생각해볼 수 있는 것은

1. 공기 저항: 속도의 제곱에 비례
2. 공기 점성력에 의한 마찰 저항: 속도에 선형 비례(속도가 느릴 때 유의미)
3. 마찰 저항: 바퀴와 땅 사이에 발생하는 마찰 저항. 속도와 관계없이 일정

이 중에서 1,3번이 가장 유의미하게 영향을 미칩니다  
특히 최고 속도의 한계선을 형성하는 것은 공기 저항이 큰 역할을 하고,  
더 이상 가속하지 않는 경우 저속을 거쳐 정지시키는 역할은 마찰 저항이 큰 역할을 합니다.  
2번 공기 점성력에 의한 마찰은 꽤 저속일 때 유의미한거라, 무시해봅니다.

```ts
const airResistance = this.speed * this.speed * QUADRATIC_DRAG_COEFFICIENT;
const rollingResistance = this.speed !== 0 ? ROLLING_DECELERATION : 0;
const brakeResistanceMps2 = this.input.brake * BRAKE_DECELERATION;
```
