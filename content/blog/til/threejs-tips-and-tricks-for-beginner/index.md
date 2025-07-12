---
title: "이건 첫 번째 레슨, 초보를 위한 Three.js Tips & Tricks (번역 90%)"
date: 2025-07-12 22:46:21
description: "모르면 맞아야 하는 초심자들을 위한 Three.js 팁과 노하우들"
tag: ["TIL", "JavaScript", "Three.js"]
---

> ! 주의 : TIL 게시글입니다. 다듬지 않고 올리거나 기록을 통째로 복붙했을 수 있는 뒷고기 포스팅입니다.

Three.js 관련해서 이것저것 찾아보다가 [Discovery Three.js](https://discoverthreejs.com/)라는 좋은 사이트를 발견했습니다  
특히 [The Big List of three.js Tips and Tricks!](https://discoverthreejs.com/tips-and-tricks/) 문서가 너무 좋아서 하나하나 읽어봤네요  
저는 맞으면서 배웠는데 그런 맞으면서 배운 것들이 압축되어있는 느낌  
그리고 아직도 몰랐던 내용들이 좀 있었습니다

아무튼 그래서 저같이 영어울렁증 있는 코리안들도 간단하게 훑어볼 수 있게 정리(거의 번역)해왔습니다  
언제 쓴 자료인지는 모르곘는데 deprecated된 내용도 조금씩 있더라구요  
제가 아는 선에서는 이런 부분도 정정해서 역주를 달아놨습니다.

`(역주)`가 달려있는게 아닌 것들은 거의 그대로 번역만 한 사족없는 내용들입니다.

# 물체가 안보여용

- 브라우저 콘솔 열어보세요(당연히 해보셨겠죠?)
- 배경색 검은색말고 딴거 해보세요
- **조명**은 응당 있어야
- 재질들을 `MeshBasicMaterial`로 써보세요. <-- _조명이 필요하지 않은_ 재질
  - `MeshStandardMaterial`같은 것들은 조명에 의해 영향을 받음 - 조명 없으면 당연히 안보임
- 카메라 확인
  - **viewing frustrum**([절두체](https://ko.wikipedia.org/wiki/%EC%A0%88%EB%91%90%EC%B2%B4)) 에 포함되는지 확인하세요.
    - 예를 들어, near가 10인데 1만큼의 거리 내에 있으면 안보임
  - 또한 당연히 **카메라의 위치나 시야각**에 물체가 포함되는지도 보세요
  - (역주) [OrbitControls](https://threejs.org/docs/#examples/ko/controls/OrbitControls)쓰면 마우스로 카메라를 이동/줌/회전하면서 보기 용이함
- **스케일**을 대충 정하지 말고 기준을 잡으세요.
  - ex. "1"을 1미터로 생각하는 등, 기준을 명확히

# General Tips

- 자바스크립트에서 **객체 생성은 비싼 작업**이니 루프 내에서 막 하지 마세요
  - 대신 `Vector3` 객체 하나만 생성해두고 `vector.set()`같은 메서드로 재사용 ㄱㄱ
- 렌더 루프에서도 마찬가지 : **최소한 초당 60프레임은 보장**해야 애니메이션이 매끄러움
  - 그러니 매 루프에서 일어나는 일이 적어도 1/60초 내에 끝나야 함
- `Geometry`대신에 `BufferGeometry`쓰세요. 훨씬빠름 (`BoxGeometry`같은 빌트인 geometry도, 대응되는 `BoxBufferGeometry`있음)
- 재질, 텍스쳐, 오브젝트 등등 다른것도 재사용을 항상 생각하세요

# 국제 단위계 쓰기

국제단위계: 이를테면

- 거리는 미터. (`1 three.js unit = 1 meter 대응)
  - (역주) Three.js는 거리 단위가 unitless라고 아는데 딱 이렇게 대응시켜 생각하면 편하다는 뜻?같기도
- 시간은 seconds
- 빛은 Candela(cd), Lumen(lm), Lux(lx)
  - `renderer.physicallyCorrectLights = true` 를 켜는 경우에 해당
    - (역주) Lumen 단위가 되는 것으로 알고있음.

우주 시뮬레이션처럼 완전히 특별한 단위계를 사용해야 한다면 : [로그 스케일의 depth buffer를 사용하세요](https://threejs.org/examples/#webgl_camera_logarithmicdepthbuffer)

# 정확한 색상

(근사적으로)정확한 색상을 위해서는 렌더러 세팅을 이렇게 해주세요

```js
renderer.gammaFactor = 2.2;
renderer.outputEncoding = THREE.sRGBEncoding;
```

(역주) 근데 최근에 감마팩터 옵션 쓰니까 deprecated라고 나왔읍니다. outputEncoding도 typescript에 잡히지가 않구요

- [이와 관련한 Three.js 포럼 질문](https://discourse.threejs.org/t/deprecated-gamma-correction-alternative/57170)
- [Three.js **r152부터는 Color Management 시스템이 변경**](https://discourse.threejs.org/t/updates-to-color-management-in-three-js-r152/50791)되어서 `encoding`들을 이제 `colorSpace`라고 생각하셔야 합니다.
  - 예를 들어, `outputEncoding` -> `outputColorSpace`

색상은:

```js
const color = new Color(0x800080);
color.convertSRGBToLinear();

// 또는 재질에 적용된 색상도
const material = new MeshBasicMaterial({ color: 0x800080 });
material.color.convertSRGBToLinear();
```

(역주) 위에서 언급한 r152버전부터 또한 `convertSRGBToLinear()`가 필요하지 않습니다.
아래는 Migration Guide에서 발췌

> 1. Be aware that three.js now interprets CSS and hexadecimal as *sRGB* colors by default (as in CSS and HTML), and automatically converts them to Linear-sRGB:

# JavaScript

- 자바스크립트 엔진은 자주 업데이트되고 최적화가 계속 추가되니, 뭐가 빠른건지는 알아서 테스트해보거나 최신 자료를 찾아보세요.
  - ex. `array.map, array.forEach`쓰지마세요!! 등??
- 스타일 가이드와 린트 룰을 따르세요
  - eslint, prettier 등.
  - [Airbnb 스타일](https://github.com/airbnb/javascript)이 보통 자주 쓰이지만, Three.js에서는 [mrdoob (Three.js 레포지토리 방장) 스타일](https://github.com/mrdoob/three.js/wiki/Mr.doob%27s-Code-Style%E2%84%A2)이 선호되는 듯
  - 관련 플러그인: [eslint-config-airbnb](https://www.npmjs.com/package/eslint-config-airbnb) , [eslint-config-mdcs](https://www.npmjs.com/package/eslint-config-mdcs).

# 모델, 메쉬 등 볼 수 있는 것들

- Wavefront OBJ, COLLADA같이 텍스트 기반 3D 데이터 포맷보다는 웹에 최적화된 **glTF**같은거 쓰세요.
- glTF 파일을 **Draco mesh compression**으로 압축하세요. 가끔은 10%까지 되기도 함!!
  - 또는 gltfpack 이라는 루키도 있음
- 한꺼번에 많은 오브젝트를 보이게하거나 안보이게 하려면(또는 씬에서 제거/추가) - [Layers](https://threejs.org/docs/#api/en/core/Layers)쓰세요
- 정확히 같은 위치에 놓인 물체들은 _Z-fighting_ 을 일으키며 깜빡거립니다. GPU도 힘들어하니 0.001같이 아주 작은 간격을 두세요
- 원점의 중심으로부터 너무 멀리 가지 마세요 - 큰 좌표계에서는 floating-point 에러 위험이 생깁니다
- `Scene`을 움직이지 마세요. (만들어질 때 `(0,0,0)`)

# 카메라

- 성능을 위해 절두체를 잘 활용하세요.
  - (역주) ex. 배그에서 너무 멀면 렌더링 안해버리는 것처럼
- far clipping plane (멀리 있는 것들이 안보이기 시작하는, 절두체의 먼 쪽 평면) 에 걸치게 물체를 두지 마세요. 특히 그 평면이 크면 클수록 더!! 깜빡임 문제가 생깁니다.

# 렌더러

- `preserveDrawingBuffer`, alpha buffer, stencil buffer, depth buffer 이런거는 꼭 필요한거 아니면 쓰지마세요
- 렌더러 생성 시 `powerPreference: "high-performance` 써보세요. 유저 시스템의 GPU가 여러개면 제일 좋은거 쓰게합니다
- 카메라 위치가 [epsilon](https://docs.unity3d.com/Packages/com.unity.visualeffectgraph@10.5/manual/Operator-Epsilon.html) 단위로 변했거나 애니메이션이 일어나는 경우에만 다시 렌더링하세요
- 씬이 정적이고 `OrbitControl`을 쓴다면 `change` 이벤트리스너에서 `renderer.render(scene, camera)`를 호출하세요 - 카메라가 움직일 때만 렌더링하게

마지막 두 개는 프레임 속도를 향상하는건 아니지만 팬 작동과 (모바일 기기의) 배터리 소모를 줄여줍니다

# 조명

- 직선광 (`SpotLight, PointLight, RectAreaLight, DirectionalLight`)은 상대적으로 느립니다.
- 씬에 조명을 직접 새로 추가하거나 제거하기보다는 `light.visible=false` 또는 `light.intensity=0`을 사용합시다.
  - 조명이 새로 들어오거나 제거되면 `WebGLRenderer`는 전체 쉐이더 프로그램을 다시 컴파일해야 합니다.
- `renderer.physicallyCorrectLights`는 켜서 국제단위계 씁시다.

# 그림자

- 씬이 정적이면 그림자 맵을 매 프레임이 아닌 무언가 변경이 있을 때만 업데이트하세요
- [CameraHelper](https://threejs.org/docs/#api/en/helpers/CameraHelper)를 사용하면 그림자와 카메라의 시야 절두체를 시각적으로 확인하기 좋습니다
- 그림자 절두체와 텍스쳐 해상도는 최대한 작게
- point light에 의한 그림자는 다른 것들보다 더 계산이 비쌉니다. 예를 들어, `PointLight`는 각 6개 방향을 계산해야하므로 `DirectionLight`와 `SpotLight`보다 6배 연산이 필요합니다.
  - `CameraHelper`는 point light의 그림자 하나만 보여줍니다. 나머지 5개가 더 있다는 사실에 유념하세요

# 재질

- `MeshLambertMaterial`은 광나는 재질에는 동작하지 않습니다. 그러나 의류같은 매트한 재질들에 대해서는 `MeshPhongMaterial`만큼이나 비슷하게 보이겠지만 더 빠릅니다.
- morph target이나 morph normal 쓴다면 `morphTargets=true`를, SkinnedMesh 쓴다면 `material.skinning = true`를 켜줍시다.
  - (역주) 근데 두 옵션 다 공식문서에 안보이는걸 보면 없어졌나 싶기도 합니다
- morph target, morph normal, skinned mesh 등에 대해서는 재질을 공유할 수 없습니다. 각각의 재질은 유니크한 재질을 새로 만듭시다. (`material.clone()` 활용)

# Custom Materials , Geometry

이 부분은 딱히 와닿는(옮긴이 기준) 부분이 없어서 넘어갑니다. 내용도 별로 없고

# 텍스쳐

- 사이즈는 2의 제곱수(**POT**: Power Of Two)로 합시다. ex. 1, 2, 4, 8, 16, ..., 512, ..
- 텍스쳐 사이즈를 변경하는 것보다 새로 만드는게 더 빠릅니다
- 텍스쳐 사이즈는 가능한 작게.
- Non-POT 사이즈의 텍스쳐는 선형 또는 근사적 필터링과, clamp-to-edge또는 clamp-to-border 래핑이 필요합니다.
  - Mipmap 필터링과 repeat 래핑을 지원하지 않습니다.
  - 그니까 POT 사이즈 텍스쳐를 쓰시라고.
- 모든 텍스쳐는 같은 사이즈일 때 메모리에서 차지하는 용량이 똑같습니다. JPG와 PNG도, 파일 크기는 다를 수 있어도, GPU 메모리에서의 공간 차지는 똑같습니다

# Antialiasing과 Post-Processing

은 내용도 적고 딱히 이 기능 자체가 기초적이진 않은 것 같아서 넘어갑니다.
궁금하면 [여기](https://discoverthreejs.com/tips-and-tricks/#antialiasing)에서 확인

# 무언가를 제거하기

씬에서 무언가를 제거할 때는

- 일시적이고 곧 다시 추가할거라면, `object.visible = false` 또는 `material.opacity = 0`, 또는 `light.intensity = 0` 같이 임시로 안보이게 합시다.
- 완전히 제거할거라면, 관련한 [공식문서 매뉴얼](https://discoverthreejs.com/tips-and-tricks/#antialiasing)이 있으니 잘 참고합시다.

# 이외 내용 + 추가 읽을 거리들

- 씬에서 오브젝트를 업데이트한다면: [How to update things](https://threejs.org/docs/#manual/en/introduction/How-to-update-things).
- [이 아티클의 Performance 관련 내용](Read this article: [How to update things](https://threejs.org/docs/#manual/en/introduction/How-to-update-things).)
- [Optimizing graphics performance (Unity)](https://docs.unity3d.com/Manual/OptimizingGraphicsPerformance.html)
- [Performance Guidelines for Artists and Designers (Unreal)](https://docs.unrealengine.com/en-us/Engine/Performance/Guidelines)
- [WebGL Insights Tips](http://webglinsights.github.io/tips.html)
