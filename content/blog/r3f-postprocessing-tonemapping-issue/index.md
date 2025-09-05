---
title: "🌈 Postprocessing 적용 시 색감/톤이 바뀌는 사람 보시오(Three.js, R3F)"
date: 2025-08-31 10:25:44
description: "Postprocessing과 EffectChain, Color Space, Tone Mapping 대환장 콜라보"
tag: ["Three.js", "react-three-fiber", "React", "Trouble Shooting"]
---

아래에 해당한다면 저랑 같은 문제를 겪고 계실 확률이 높습니다

- 렌더러에 `toneMapping` 설정이 있는 경우 (`NoToneMapping`이 아닌)
- `NoToneMapping` 설정을 안했지만 React-Three/Fiber를 사용중인 경우

바로 결론이 필요하시면 [해결](#해결)로 넘어가세요

# 문제상황

Three.js + React Three Fiber를 사용한 3D Viewer를 개발하고 있는데요  
오브젝트(Mesh)를 선택하면 해당 물체에 윤곽선을 보여주는 효과가 필요했습니다.

![오브젝트 선택 Outline](https://i.imgur.com/vKMator.png)

대충 이런 식으로요.(저건 그냥 [데모](/postprocessing-demo/)입니다)  
이런거는 Three.js에서 Postprocessing중에 [OutlinePass](https://threejs.org/examples/webgl_postprocessing_outline.html)를 사용하여 구현해볼 수 있습니다  
또는 React Three Fiber(r3f)를 사용한다면 [@react-three/postprocessing](https://github.com/pmndrs/react-postprocessing)패키지에서 [`<Outline />`](https://react-postprocessing.docs.pmnd.rs/effects/outline)을 사용할 수도 있구요

아무튼간에, 그렇게 postprocessing을 사용하여 Outline효과를 적용했는데

![postprocessing 전/후](https://i.imgur.com/OX27k4C.png)

이렇게 postprocessing을 적용한 전과 후로 전체 씬의 색감(톤이라고 해야 할 듯)이 변해버리는 불상사가 발생했습니다  
씬이 확 밝아졌어요 ..

![눈부셔](https://i.imgur.com/zOhcQvk.png)

[데모](/postprocessing-demo)에서 확인해보실 수도 있는데, 우상단 컨트롤패널을 아래와 같이 기본 상태로 두고 메쉬 아무데나 클릭해보세요

![데모 기본 옵션](https://i.imgur.com/X5AQSFB.png)

# 원인을 찾아 다이브

아무래도 아래와 같은 `EffectComposer`(postprocessing 코드)를 넣었을 때 문제인 것으로 보였어요

```tsx
...
{
  selectedMeshes.length > 0 &&
  <EffectComposer multisampling={8} autoClear={false}>
    <Outline />
  </EffectComposer>
}
```

그래서 이 `EffectComposer` 관련하여 저와 비슷한 현상을 겪은 사람의 [Github Discussion (@react-three/postprocessing)](https://github.com/pmndrs/postprocessing/discussions/436)을 찾았습니다

![Github Discussion - EffectComposer 이슈](https://i.imgur.com/MKUz22a.png)

> @react-three/postprocessing의 예제에서 EffectComposer를 사용하면 배경 색이 약간 변하는 것을 발견했습니다.

이에 대한 해답을 찾았다며 질문자분이 자문자답 해주셨는데..

![Discussion - Marked as answer](https://i.imgur.com/GqKImGq.png)

그냥 단순히 `<Canvas>`에 `linear` prop을 넣으면 된다고 했지만? 당연히 그렇게 쉽게 해결되지가 않았습니다..  
[r3f canvas 문서](https://r3f.docs.pmnd.rs/api/canvas)에서 `linear` prop에 대해, "자동 **sRGB 색공간**과 **감마보정**을 끕니다."라고 되어있는데  
밑에서 알아봅시다.  
그 전에 먼저 Postprocessing에 대해 살짝 훑구요

## 포스트프로세싱과 효과 체인 (Postprocessing & Effect Chain)

포스트프로세싱은 한국어로 **후처리**인 그 이름처럼, *렌더링된 후의 output을 다시 input으로 받아 다양한 효과*를 적용합니다  
이 때 **Pass**와 **Effect**라는 개념을 추가하는데

- Pass는 처리 단계의 단위로, 하나의 Pass마다 화면 전체를 다시 렌더링합니다.
- Effect는 Pass 안에서 실제로 적용되는 효과 알고리즘입니다.

예를 들어, Three.js에서는 아래와 같이 3단계(Pass)로 효과(Effect)를 적용합니다.

```ts
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
composer.addPass(new EffectPass(camera, new BloomEffect()));
composer.addPass(new EffectPass(camera, new Outline()));
```

![포스트프로세싱 단계](https://i.imgur.com/zlHVr23.png)

이 때 주의할 점은 *이전의 연산결과가 곧 다음 연산의 재료가 되므로 순서에 유의*합니다.  
이러한 **렌더 -> 포스트프로세싱 -> 출력 순서**의 파이프라인을 **효과 체인(Effect Chain)** 이라고 합니다.  
예를 들어, 아까 *렌더링된 output을 다시 input*으로 넣어야한다고 했습니다. 그러니 `RenderPass(scene, camera)`가 가장 앞서야겠죠?

## 색공간과 감마보정 (ColorSpace & Gamma Correction)

사실 색공간에 대해서 이야기하기에는 꽤 긴 이야기긴한데요..  
자세한 설명은 [위키](https://en.wikipedia.org/wiki/CIE_1931_color_space)나 [Three.js - ColorSpace](https://threejs.org/manual/#en/color-management)문서를 읽어보시고, 간단히 넘어가봅시다

우리는 색상을 보통 빨강, 초록, 파랑 세 가지 RGB를 똑같이 0~255 사이의 값으로 나타내 색상을 표현(RGB색상시스템)하지만,  
사실 인간의 색상지각은 그렇게 딱 떨어지지가 않습니다. [색채 지각](https://ko.wikipedia.org/wiki/%EC%83%89%EC%B1%84_%EC%A7%80%EA%B0%81)참조.

<figure>

![CIE 1931](https://i.imgur.com/dkJDtDL.png)

<figcaption>CIE 1931 색공간의 색도분포표.</figcaption>
</figure>

대충 이런식으로 인간의 인지 범위가 있는데  
색상을 RGB로 나타내려면 이 중에서 적당히 골라서 빨강, 초록, 파랑으로 사용해야 합니다.

![색도분포표에서 세 점을 찍어 RGB선택](https://i.imgur.com/6lFFqfP.png)

예를 들어 맘대로 그냥 본인이 만드는 모니터의 색상시스템을 오른쪽처럼 해버릴 수도 있는거구요

근데 매번 다르면 아주 열받으니까 RGB 시스템의 국룰을 만들었고 이를 **sRGB(standard RGB)** 라고 부릅니다.

<figure>

![sRGB in CIE 1931 chromaticity diagram](https://i.imgur.com/Wap01zj.png)

<figcaption>sRGB color & white point (D65) - CIE 1931 chromaticity diagram.</figcaption>
</figure>

이러고나면 색공간에서 수치값으로(또는 반대로)매핑하는 방식이 고민입니다  
예를 들어 `R=1.0`이 `R=0.5`보다 물리적으로 2배 밝다고 봐야할까요? 또는 인간의 눈으로 인지되는 밝기가 2배 높다고 봐야할까요?  
이는 분명히 다르고, 목적에 따라 양쪽 중 어떤 한 방식을 선택할 수 있습니다.

이 때 **물리량이 기준이면 선형(linear), 인간의 인지가 기준이면 비선형(non-linear)** 이라고 부릅니다.  
또한 선형 값을 -> 비선형으로 변환/보정하는 과정을 **감마 보정(Gamma Correction)** 이라고 합니다.  
실제로 인간의 눈은 어두운 영역에 민감하고 밝은 영역에 둔해서, 선형 값을 그대로 디스플레이에 출력해버리면 전체적으로 확 어둡다고 느껴버립니다.

![안보여용](https://i.imgur.com/I65QpWc.png)

Three.js에서는 렌더러의 outputColorSpace를 `SRGBColorSpace`(비선형 sRGB)와 `LinearSRGBColorSpace`(선형 sRGB)두 가지 중 하나로 설정할 수 있습니다.  
위에서 언급한것처럼 `SRGBColorSpace`일 때 비선형 보정되어 인간이 보기에 자연스럽다고 느끼고,  
`LinearSRGBColorSpace`는 물리적 광도에 대해 선형적이므로 부자연스럽다고 느낍니다.  
아래의 데모 스크린샷에서 `LinearSRGBColorSpace`(좌)와 `SRGBColorSpace`(우)를 확인해보세요.

![비선형 sRGB와 선형 sRGB 차이](https://i.imgur.com/KaE4tIQ.png)

### Postprocessing의 Output ColorSpace

[pmndrs/postprocessing](https://github.com/pmndrs/postprocessing?tab=readme-ov-file#output-color)문서에서는 Output Color Space에 대해 언급하는데요

> 새로운 애플리케이션은 색상 관리를 위한 선형 워크플로우를 따라야 하며, 포스트 프로세싱은 이를 자동으로 지원합니다. WebGLRenderer.canvasColorSpace를 SRGBColorSpace로 설정하기만 하면 포스트 프로세싱이 그에 따라 진행됩니다. 내장 패스는 화면에 렌더링할 때 자동으로 색상을 인코딩하고 내부 렌더링 작업은 항상 가장 적합한 색 공간에서 수행됩니다.

이 때 **linear workflow**는  
(1) 텍스쳐 등의 색상을 sRGB로 input -> (2) 선형(Linear) 공간에서 색상 연산 -> (3) 계산 결과는 sRGB로 다시 output

이러한 과정인데, postprocessing이 알아서 해줄거니까 `WebGLRenderer`설정을 `outputColorSpace = SRGBColorSpace`로 유지하기만 하면 된다고 하네요

그러면 앞에서 살펴본 Discussion에서 "이거 하세요"했던 **`linear` prop은 빼는게** 좋긴 하겠네요?? 얘는 outputColorSpace를 `LinearSRGBColorSpace`로 바꿔버립니다.  
어차피 **사실적인 색감을 위해서는 outputColorSpace가 `SRGBColorSpace`임이 필수**긴해요. 이것을 포기할 순 없습니다

## Tone Mapping - 톤 매핑

그 밑에 아주아주아주 중요한 절인 [Tone Mapping](https://github.com/pmndrs/postprocessing?tab=readme-ov-file#tone-mapping)을 읽어봅시다  
여기에서는 **Postprocessing과 ToneMapping을 같이 쓸 때 주의할 점**에 대해 이야기합니다  
그 전에 **ToneMapping**이 뭔지 잠깐 보고 지나가면

> ToneMapping은 HDR(High Dynamic Range)출력 색상을 LDR(Low Dynamic Range)출력 색상으로 변환하는 프로세스입니다.

이 때 **Dynamic Range**는 **색상을 표현하는 숫자의 범위**를 뜻합니다  
예를 들어, LDR은 0~1의 범위에서 색상을 표현(ex. 0은 검은색, 1은 흰색)하는 반면, HDR은 음수 또는 1 초과의 범위에서 색상을 표현할 수 있습니다.

![HDR LDR 예시](https://i.imgur.com/nfPzwLy.png)

이를테면 위 그림처럼, HDR의 넓은 범위에서는 검은색과 회색 사이의 명암 차이를 세세하게 구분할 수 있지만  
LDR의 좁은 범위에서는 검은색과 회색 사이를 뭉뚱그려 표현하게 됩니다  
HDR -> LDR 변환 프로세스는 마치 색상을 [양자화(Quantization)](<https://ko.wikipedia.org/wiki/%EC%96%91%EC%9E%90%ED%99%94_(%EC%A0%95%EB%B3%B4_%EC%9D%B4%EB%A1%A0)>)하는 과정이네요.

![압축프레스](https://i.imgur.com/xj7g7RZ.png)

다시, Postprocessing에서 이 ToneMapping을 사용할 때 주의할점은  
**렌더러의 톤 매핑은 끄고 포스트프로세싱 효과 체인의 마지막에 톤매핑 효과를(Pass로서) 집어넣는다!!** 입니다  
여기에는 두 가지 이유가 있는데

- ToneMapping은 HDR -> LDR 양자화라고 했는데, 이를 **렌더러설정에 넣으면 이미 Postprocessing이 적용되기도 전에 LDR로** 눌려버립니다.
  - 0 ~ 100 사이에서 연산한 색상의 디테일/퀄리티와 0 ~ 1 사이에서 연산하는 디테일/퀄리티는 안봐도 뻔하네요(0 ~ 100이라는 수치는 비유를 위해 과장했습니다)
- 렌더러의 ***clear color*에는 쉐이더가 포함되지 않으므로 ToneMapping이 적용되지 않습니다.** 이는 곧 배경과 오브젝트 사이에 색감 불일치 문제를 야기합니다.
  - _clear color_ 란 렌더러가 매 프레임마다 장면을 지워내는 색상을 의미합니다.
  - "렌더러의 _clear_ 과정은 쉐이더를 거치지 않는다" 라고 하면 더 이해가 편하겠네요
  - ToneMapping은 사실 쉐이더의 일종으로, "_Fragment Shader 단계에서 픽셀마다 수행되는 수학적 함수_" 이기 때문입니다.
  - Postprocessing은 전체 입력 이미지에 적용되므로 톤 매핑도 전체 이미지에 균일하게 적용됩니다.

이러니 포스트프로세싱을 사용한다면 렌더러의 톤 매핑은 끄고, 효과 체인의 마지막에 `ShaderPass`로 톤 매핑을 추가합니다.  
r3f에서는 `<ToneMappingEffect>`로 ~~딸깍~~ 간편하게 추가할 수 있습니다.

**주의: r3f의 `<Canvas>`는 [toneMapping 기본값이 `ACESFilmicToneMapping`](https://r3f.docs.pmnd.rs/api/canvas#defaults)** 으로, 기본적으로 렌더러에 톤 매핑이 추가되어있는 셈입니다  
본인이 톤 매핑을 안쓸거라면 `NoToneMapping`을 명시하고, 톤 매핑을 쓸거라면 `<EffectComposer>` 내부 마지막에 `<ToneMappingEffect />`를 넣어줍시다.

# 해결

이제 요구사항의 종류별로 어떻게 설정하면 좋을지 정리해봅시다.

## 1. React Three Fiber (r3f) 쓴다면..

### 1-(1). ToneMapping 안 쓸거라면..

r3f고 ToneMapping 안 쓸거면 단순히 Canvas의 `gl` prop으로 다음과 같이 **렌더러의 `toneMapping`을 꺼줍시다.**

```tsx
<Canvas
  gl={{
    toneMapping: THREE.NoToneMapping
  }}
></Canvas>
```

위에서 살펴봤듯이 r3f Canvas의 `gl` prop 기본 설정은 `toneMapping: THREE.ACESFilmicToneMapping`이라 꼭 `NoToneMapping`으로 바꿔줍시다.  
이렇게만 하시면 되니 이제 `<EffectComposer>`에 원하는 포스트프로세싱 효과를 넣어줍시다.

### 1-(2). ToneMapping 쓸거라면..

근데 ToneMapping을 쓰고 싶다면

```tsx
<Canvas
  gl={{
    toneMapping: THREE.NoToneMapping
  }}
>
  ...
  <EffectComposer>
    {effectOn && /* 원하는 다른 후처리 Effect*/}
    <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
  </EffectComposer>
</Canvas>
```

**(1)렌더러에는 톤매핑을 끄고 (2)`<EffectComposer>`는 항시 켜되, (3)`<ToneMapping>`을 마지막에 넣고, 원하는 후처리 효과만 조건부로 토글**해주는게 좋겠네요.

## 2. 단순 Three.js만 쓰고 있다면..

이 경우 `postprocessing` 패키지 없어도 three 패키지의 `examples/jsm`에서 가져다 쓰는 것만으로 해결해볼 수 있습니다.

이 때 기억하고 가야 할 점은

- **포스트프로세싱이 끝나고 색상을 선형 -> 비선형 감마보정**하는 것은 `postprocessing` 라이브러리에서 해주던 일입니다. 이거 안 쓰면 우리가 직접 해줘야 합니다
- **ToneMapping은 Shader의 일종**이라고 했습니다.

### 2-(1). ToneMapping 안 쓸거라면..

이러면 단순히 **감마보정**만 신경써주는 것만으로 전후 색상을 일치시킬 수 있습니다.

```js
import { GammaCorrectionShader } from "three/examples/jsm/shaders/GammaCorrectionShader.js";

...
const shaderPass = new ShaderPass(GammaCorrectionShader);
composer.addPass(shaderPass);
```

![Three.js postprocessing on/off - NoToneMapping](https://i.imgur.com/h1OiY1z.png)

전체 코드가 필요하시면 [Codesandbox](https://codesandbox.io/p/devbox/cool-chaum-5flsps)에서 확인해보세요

### 2-(2). ToneMapping 쓸거라면 ..

이 경우 **ShaderPass를 톤매핑 한 번, 감마보정 한 번** 총 두 번을 써야합니다

```js
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { OutlinePass } from "three/examples/jsm/postprocessing/OutlinePass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { GammaCorrectionShader } from "three/examples/jsm/shaders/GammaCorrectionShader.js";
import { ACESFilmicToneMappingShader } from "three/examples/jsm/shaders/ACESFilmicToneMappingShader";

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
// 👉 ToneMapping 켜고 시작
renderer.toneMapping = THREE.ACESFilmicToneMapping;

...
// 👉 Shader Pass로 톤매핑쉐이더 추가
composer.addPass(new ShaderPass(ACESFilmicToneMappingShader));

// 👉 마지막에 색상 공간을 sRGB로 변환해주는 Pass
composer.addPass(new ShaderPass(GammaCorrectionShader));
```

![Three.js postprocessing on/off - ToneMapping](https://i.imgur.com/FjCksz4.png)

이렇게 **(1)렌더러에 원하는 ToneMapping을 켜고 시작한 다음 (2)포스트프로세싱을 사용하게 되면 효과 체인 마지막에 톤매핑 쉐이더를** 넣어줍니다.  
전체 코드를 봐야겠다면 [Codesandbox](https://codesandbox.io/p/devbox/recursing-dewdney-wt8wpy?embed=1&file=%2Fmain.js)에서 확인해보세요.

---

\
이렇게 해서, **Three.js에서 Postprocessing을 적용하고나면 색감이 달라지는 문제**를 알아보고  
r3f인지 threejs 바닐라인지, ToneMapping을 쓸건지 아닌지, 등등 **니즈에 따른 해결법**을 알아봤습니다.

또한 그 과정에서, **왜 그런 문제가 생겼고 이렇게 해결되는지**, 아래 내용을 통해 알아봤습니다

- **Postprocessing**과 **Effect Chain**에 대해
- **Color Space**에 대한 개념과 **선형/비선형** 워크플로우, 그리고 **감마보정** 등
- **ToneMapping**이 무엇이며 **Postprocessing과 함께 사용 시** 무엇을 주의해야 하는지

재밌는 내용이 많았네요

아직도 약간.. 그럼 EffectComposer 켜고 톤매핑 끄고 어쩌구저쩌구 청기올려 백기내려 하면 어떻게되는지 헷갈리신다면  
[데모](/postprocessing-demo)에서 컨트롤패널UI의 옵션을 끄고 켜고, 메쉬를 클릭해보고, 하면서 어떻게 되는지 실제로 확인해보세요.

![청기백기](https://i.imgur.com/TOGuakO.png)

이만 마칩니다.
