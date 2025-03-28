---
title: "React-Three-Fiber 데모: 파티클 효과 구현하기"
date: 2025-03-25 22:19:16
description: "points + geometryBuffer + geometryAttributes"
tag: ["TIL", "Three.js", "react-three-fiber"]
---

> ! 주의 : TIL 게시글입니다. 다듬지 않고 올리거나 기록을 통째로 복붙했을 수 있는 뒷고기 포스팅입니다.

제 블로그 대문에 보면 웬 솟아오르는 로켓이 있는데요

<figure>

![](https://i.imgur.com/neJyyfb.gif)

<figcaption>

This work is based on "Rocket 🚀"
(https://sketchfab.com/3d-models/rocket-9b9b64b138f24e4a908238c0b471930e)
by lizlancaster (https://sketchfab.com/lizlancaster) licensed under
CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/)

</figcaption>
</figure>

이거 React-Three-Fiber로 만들어본 데모입니다. 로켓은 무료사이트에서 퍼왔구요  
로켓을 잡아서 이리저리 돌려보면 로켓 방향을 바꿀 수도 있습니다(사실 카메라가 움직이는거심)  
아무튼간에 오늘은 여기에 쓰인 파티클 효과 구현에 대해 알아보겠습니다

# 점을 여러개 생성하려면

3D 오브젝트를 생성할 때 우리는 mesh를 사용했습니다

```tsx
<mesh visible position={[1, 2, 3]} rotation={[Math.PI / 2, 0, 0]}>
  <sphereGeometry args={[1, 16, 16]} />
  <meshStandardMaterial color="hotpink" transparent />
</mesh>
```

근데 이번에 구현할 파티클 시스템에서는 `<points>`를 씁니다.  
**입자**에 해당하는 점만 있으면 되니깐요  
그럼 저런 효과를 구현하려면 아주 많은 수의 입자를 생성해야 할 것 같습니다  
300개정도 한다고 생각해봅시다.  
그럼 이런건 어떤가요? ㅋㅋㅋ

```tsx
Array.from({ length: 3000 }).map((_, i) => (
  <points key={i} points={}>
    <fooGeometry />
    <fooMaterial />
  </points>
));
```

택도없습니다. 이러면 300개의 `<points>` 를 위한 메모리를 할당하고, 300개의 WebGL draw call을 유발하고, 300번의 렌더링 처리가 필요합니다.

대신 [`bufferGeometry`](https://threejs.org/docs/?q=bufferGeo#api/en/core/BufferGeometry)로 커스텀 기하학 정보를 담아서, 이를 단일 `<points>`에서 사용합니다.

```tsx
<points>
  <bufferGeometry>
    <bufferAttribute
      attach="attributes-position"
      count={count}
      array={positions}
      itemSize={3}
    />
  </bufferGeometry>
  <pointsMaterial />
</points>
```

그럼 이 300개 점들의 위치정보 배열을 만들러 가봅시다

# 파티클들의 위치와 속도를 초기화하기

먼저 `<points>` 오브젝트를 참조할 ref와, 파티클들의 위치와 속도를 담을 ref를 만들어줍니다

```tsx
const count = 300; // 파티클 수
const particles = React.useRef<Points>(null);
const particlesData = React.useRef({
    positions: new Float32Array(count * 3),
    velocities: new Float32Array(count * 3)
});

...

return <points ref={particles}>
  // ...
</points>
```

300개만큼의 파티클 입자들 위치와 속도를 유지하기 위해 `Float32Array`를 두 개 만들어줍니다.  
이 때 배열의 크기는 300 x 3입니다. 3차원 공간이니깐여

이제 각 입자들의 초기 위치와 속도를 정해줍니다

```tsx
const getRandomPositionFromCenter = useCallback(
  () => Math.random() * 1.4 - 0.7,
  []
);
// 초기화
const REDUCTION_FACTOR = 0.01;
for (let i = 0; i < count; i++) {
  const x = (Math.random() - 0.5) * 0.5;
  const y = (Math.random() - 1) * 10;
  const z = (Math.random() - 0.5) * 0.5;

  particlesData.current.positions[i * 3] = getRandomPositionFromCenter();
  particlesData.current.positions[i * 3 + 1] = getRandomPositionFromCenter();
  particlesData.current.positions[i * 3 + 2] = getRandomPositionFromCenter();
  particlesData.current.velocities[i * 3] = x * REDUCTION_FACTOR;
  particlesData.current.velocities[i * 3 + 1] = y * REDUCTION_FACTOR;
  particlesData.current.velocities[i * 3 + 2] = z * REDUCTION_FACTOR;
}
```

일단 중심 위치로부터 적당~한 랜덤 범위를 뽑아서 위치를 할당해줍시다.
사실은 로켓을 월드좌표의 0,0,0에 둘거라 그냥 0,0,0기준으로 Center가 뽑히기만 하면 됩니다  
그리고 속도는 로켓이 바라보는 방향(Y) 반대로 갈 수 있도록 정해줍니다.  
근데 Y축으로만 움직이게 하면 좀 재미없는 직선이 되니까 X, Z축에 랜덤을 좀 섞어줍니다

# useFrame으로 파티클들이 움직이도록 업데이트

```tsx
useFrame(() => {
  if (!particles.current) return;

  const positions = particlesData.current.positions;
  const velocities = particlesData.current.velocities;

  for (let i = 0; i < count; i++) {
    const particlePosition = new Vector3(
      positions[i * 3],
      positions[i * 3 + 1],
      positions[i * 3 + 2]
    );

    particlePosition.x += velocities[i * 3];
    particlePosition.y += velocities[i * 3 + 1];
    particlePosition.z += velocities[i * 3 + 2];

    const dist = particlePosition.length();
    const minProbability = 0.01;
    const maxProbability = 0.99;
    const probability =
      Math.pow(dist / maxDistance, 2) * (maxProbability - minProbability) +
      minProbability;

    if (Math.random() < probability) {
      positions[i * 3] = getRandomPositionFromCenter();
      positions[i * 3 + 1] = getRandomPositionFromCenter();
      positions[i * 3 + 2] = getRandomPositionFromCenter();
    } else {
      positions[i * 3] = particlePosition.x;
      positions[i * 3 + 1] = particlePosition.y;
      positions[i * 3 + 2] = particlePosition.z;
    }
  }
  particles.current.geometry.attributes.position.needsUpdate = true;
});
```

useFrame을 사용하여 애니메이션 프레임을 요청해줍니다  
여기서는 300개의 위치, 속도 값 각각에 대해 (각 파티클에 대해)

- `new Vector3(x,y,z)`와 같이 현재 파티클의 위치를 벡터객체로 생성합니다
- 이제 이 위치에서 속도를 더해주어($x = x_i + vt$) 속도에 따른 위치 변화를 업데이트합니다
- 파티클이 너무 멀리 가면 사라지도록 해줍니다. : 거리에 따라 확률적인 particle 초기화 구현
  - 먼저 `Vector3.length()`로 원점으로부터의 거리를 구할 수 있습니다
  - 이 거리에 비례하는 파티클 초기화 확률 계산식을 세웁니다
  - 이제 난수를 하나 뽑아보고, 이 확률보다 크면 살려주고 작으면 위치를 다시 원점으로 돌려보냅니다.

그리고 마지막에는 `particles`(`<points>`를 참조함)의 위치 속성을 업데이트해야 한다고 플래그를 켜줍니다.  
지금처럼 `bufferGeometry`의 `attribute`를 직접 수정했다면 `needsUpate`로 업데이트해야함을 알려야 합니다.

# 이제 `bufferGeometry`에 위치값을 전달해요

이제 마지막인데요, `<points>`의 geometry로 `bufferGeometry`를 전달해줍시다.

```tsx
<points ref={particles}>
  <bufferGeometry>
    <bufferAttribute
      attach="attributes-position"
      count={count}
      array={particlesData.current.positions}
      itemSize={3} // x,y,z
    />
  </bufferGeometry>
</points>
```

기하학 속성으로 우리가 전달할 것은 위치정보입니다  
그래서 이는 `attributes` 중에서도 `position`에 해당하구요  
`<bufferAttribute>`로 `<bufferGeometry>`에 속성을 선언적으로 전달할 수 있고요  
`attach="attributes-position"` props로 이게 위치 속성임을 알려줍니다.  
`array`에 위치 배열을, `count`에 몇 개의 위치(xyz)들이 들었는지 알려줍니다.

음.. 그리고 three.js에서 물체는 응당 기하학+재질이니  
`<pointsMaterial/>`로 점의 재질을 정해줍시다 적당히

```tsx
<points ref={particles}>
  <bufferGeometry>
    <bufferAttribute
      attach="attributes-position"
      count={count}
      array={particlesData.current.positions}
      itemSize={3}
    />
  </bufferGeometry>
  <pointsMaterial size={0.1} color={color} transparent opacity={0.8} />
</points>
```

그러면 이런 결과가 나옵니다 !!

<iframe src="https://codesandbox.io/embed/9vvlgp?view=preview&module=%2Fsrc%2FApp.tsx&hidenavigation=1"
     style="width:100%; height: 500px; border:0; border-radius: 4px; overflow:hidden;"
     title="React Three Fiber + TypeScript: Basic example (forked)"
     allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
     sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
   ></iframe>

쩝 근데 왜케 밍밍하죠? 색상을 단색으로 해서 그런가  
뭔가 아쉬우니 좀 더 해봅시다

## 잠깐 코드를 정리해요

`getRandomPositionFromCenter`같은거보다 그냥 입자를 초기화하는 함수를 만들어두고 콜하는게 더 나아보입니다

```tsx
const initParticle = useCallback(
  (
    particlesData: React.MutableRefObject<{
      positions: Float32Array;
      velocities: Float32Array;
    }>,
    i: number
  ) => {
    const positions = particlesData.current.positions;
    const velocities = particlesData.current.velocities;
    positions[i * 3] = Math.random();
    positions[i * 3 + 1] = Math.random();
    positions[i * 3 + 2] = Math.random();
    velocities[i * 3] = (Math.random() - 0.5) * 0.1;
    velocities[i * 3 + 1] = (Math.random() + 0.5) * 0.1;
    velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.1;
  },
  [count]
);
```

x, y, z 속도나 위치를 각각 다르게 하고싶을 수도 있으니깐여
그럼 이제 처음에는

```tsx
for (let i = 0; i < count; i++) {
  initParticle(particlesData, particlesColor, i);
}
```

이렇게 하고, 단일 입자가 너무 멀리가서 초기화할 때도

```tsx
if (Math.random() < probability) {
  initParticle(particlesData, particlesColor, i);
}
```

이러면 되겠어요. 이게 나은듯

# 색깔도 랜덤으로 해볼래요

갑자기 입자들의 색깔이 랜덤으로 나오게 하고, 뿜어내듯이 나오게 해보고 싶어졌습니다
입자들의 색을 하나씩 직접 정하려면 이것도 `<bufferAttributes>`를 사용해야할 것 같아요

일단 300개 입자들의 위치/속도 배열을 만들었던 것처럼, 색상 배열도 만들어봅시다

```tsx
const particlesData = React.useRef({
  positions: new Float32Array(count * 3),
  velocities: new Float32Array(count * 3),
  colors: new Float32Array(count * 3)
});
```

이번에도 `Float32Array`가 적당할 것 같아요.  
색상은 `#ffffff`처럼 16진수 6개로 나타내니 한 자리에 16비트인데,  
rgb로 자르면 32비트고, 그럼 Float32Array를 입자수 \* 3만큼 만들어서 `itemSize=3`으로 하면 되겠어요  
색상도 3차원인것임 ㄷㄷㄷ 근데 차원이라는 단어를 생각해보면 별로 놀랄 일은 아닌듯

암튼 이제 `initParticle` 함수에서 컬러도 랜덤으로 넣게 짜봅시다

```tsx
const initParticle = useCallback(
  (
    particlesData: React.MutableRefObject<{
      positions: Float32Array;
      velocities: Float32Array;
      colors: Float32Array;
    }>,
    i: number
  ) => {
    // ... 위치, 속도를 초기화
    const colors = particlesData.current.colors;
    const color = new Color(Math.random() * 0xffffff);
    colors[i] = color.r;
    colors[i + 1] = color.g;
    colors[i + 2] = color.b;
  },
  [count]
);
```

`Math.random()`은 0~1범위를 랜덤으로 뽑으니까, `Math.random() * 0xffffff`라고 하면 `0x000000 ~ 0xffffff` 범위를 뽑아주겠죠?  
이걸 r, g, b로 잘라서 잘 넣어줍시다

이제 `bufferAttribute`를 사용하여 색상속성을 넣어줄 일만 남았는데

```tsx
<bufferGeometry>
  <bufferAttribute
    attach="attributes-position"
    count={count}
    array={particlesData.current.positions}
    itemSize={3}
  />
  <bufferAttribute
    attach="attributes-color"
    count={count}
    array={particlesData.current.colors}
    itemSize={3}
  />
</bufferGeometry>
```

대충 이런 식으로 `bufferGeometry` 밑에 추가로 attribute를 넣어줍니다.

```tsx
<pointsMaterial
  size={0.1}
  transparent
  opacity={1}
  vertexColors
></pointsMaterial>
```

그리고 그 밑에 원래 있었던 `pointMaterial`에서는 `color` props를 제거하고,  
꼭!!!!!!!!!!!!!!!1 `vertexColors=true`여야 합니다.  
그래야 정점별로 색상을 달리 지정하게끔 할 수 있어욥

이제 대충 `initParticle`의 속도값을 조정하고 중력가속도를 넣어줘서 아래처럼 완성해봤습니다

<iframe src="https://codesandbox.io/embed/frdv7k?view=preview&module=%2Fsrc%2FParticles.tsx&hidenavigation=1"
     style="width:100%; height: 500px; border:0; border-radius: 4px; overflow:hidden;"
     title="React Three Fiber + TypeScript: Basic example (forked)"
     allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
     sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
   ></iframe>

검은 배경에 하니까 좀 느낌나네요  
뭔가를 축하해야할 것 같은 느낌?

![얏호](./image.png)
