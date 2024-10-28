---
title: "Three.js 공식문서로 시작해보기. - 3일차"
date: 2024-10-28 18:06:39
description: "Post Processing, 행렬 변환, 애니메이션 시스템"
tag: ["TIL", "Three.js"]
---

> ! 주의 : TIL 게시글입니다. 다듬지 않고 올리거나 기록을 통째로 복붙했을 수 있는 뒷고기 포스팅입니다.

저번에는 [오브젝트를 폐기하는 방법](https://threejs.org/docs/#manual/ko/introduction/How-to-dispose-of-objects)까지 했는데요  
이번에는 [후처리 사용 방법](https://threejs.org/docs/#manual/ko/introduction/How-to-use-post-processing)부터 남은 매뉴얼들을 모두 끝내겠습니다

# 후처리 (Post Processing)

[후처리 사용방법](https://threejs.org/docs/#manual/ko/introduction/How-to-use-post-processing)에 대해 다룹니다.  
포스트 프로세싱이라는 말이 더 익숙하신 분도 있곘는데요(사양 좀 있는 게임이면 포스트 프로세싱 최저로 하는거 국룰)  
렌더링한 화면에 다양한 그래픽 효과나 안티 엘리어싱을 적용하는 등의 후처리를 말합니다.

![포스트 프로세싱](image.png)

이 과정이 **후처리**라고 이름이 붙은 이유는..

- 먼저 비디오 카드의 메모리 버퍼에 있는 대상을 렌더링하기 위해 장면(Scene)이 그려집니다(우리가 지금까지 한 일들).
- 그 다음(또는 최종적으로 렌더링되기 직전)에 필터와 효과(후처리 효과)를 이미지 버퍼에 적용합니다.

three.js에서는 [EffectComposer](https://threejs.org/docs/index.html#examples/en/postprocessing/EffectComposer)를 통해 이를 구현합니다.

## 후처리 작업하기

three.js에서는 `EffectComposer`로 구현한다고 했는데요  
이를 위해 `Composer`와 `Pass` 객체들을 import해와야 합니다

```js
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { GlitchPass } from "three/addons/postprocessing/GlitchPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
```

이런 식으로

그 다음에는, `WebGLRenderer` 객체를 넣어서 composer 객체를 만듭시다.

```js
const composer = new EffectComposer(renderer);
```

composer를 사용할 때는 앱의 애니메이션 루프를 변경해줘야 합니다.  
기존에는 `WebGLRenderer`의 `render()`메서드 호출로 렌더링했던 반면  
이제 각각의 `EffectComposer`에 대응되는 렌더링 방법을 사용합니다.

```js
function animate() {
  requestAnimationFrame(animate);
  composer.render();
}
```

이제 composer를 준비했으니, 후처리 과정을 설정합니다.  
이는 앱을 만드는 최종 화면 출력을 담당하며, 코드를 작성한 순서대로 처리됩니다.

공식문서에서는 `glitchPass`라는 찌지직효과를 쓰는데, 저는 `RenderPixelatedPass`를 써봤습니다.

```js
const renderPass = new RenderPass(scene, camera);
const renderPixelatedPass = new RenderPixelatedPass(5, scene, camera);
const outputPass = new OutputPass();
composer.addPass(renderPass);
composer.addPass(renderPixelatedPass);
composer.addPass(outputPass);
```

1. `RenderPass` : 일반적으로 가장 먼저 호출하여 기본 렌더링 장면을 담아냅니다.
2. `RenderPixelatedPass` : 이미지 데이터 전반에 걸쳐 픽셀 효과를 줍니다. 인자로 각 pixel의 단위, `scene`, `camera`를 받습니다.
3. `OutputPass` : 일반적으로 가장 마지막에 위치하여 `sRGB`변환 또는 [톤 매핑](https://docs.unity3d.com/kr/530/Manual/script-Tonemapping.html)등을 수행합니다.

기본적으로 `renderPass` --> 원하는 프로세스를 끼워넣고 --> `outputPass` 이런 구조를 가지겠네요  
[여기](https://github.com/mrdoob/three.js/tree/dev/examples/jsm/postprocessing)에서 기본 내장된 post-processing 방식을 확인해볼 수 있습니다.  
또는 만약 쉐이더를 직접 작성했고 이를 후처리에서 사용하려면, `ShaderPass`를 사용합니다.

```js
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { LuminosityShader } from "three/addons/shaders/LuminosityShader.js";

// boilerplate 초기화 루틴 이후

const luminosityPass = new ShaderPass(LuminosityShader);
composer.addPass(luminosityPass);
```

처음 `Shader`를 만들 때는 `CopyShader`를 사용하면 좋은게, `EffectComposer`에 아무 효과를 적용하지 않고 이미지 컨텐츠만 복사해줍니다.

### 샘플

[저번에 만든 예제 코드](/til/how-to-threejs-2/#샘플)에다가 픽셀효과 후처리를 적용해봤습니다.

<iframe src="https://stackblitz.com/edit/vitejs-vite-gnik1n?embed=1&file=utils.js&hideExplorer=1&hideNavigation=1&view=preview" width="100%" height="400px"></iframe>

개짱귀여운데요??;; 맘에듭니다

# 행렬 변환

[행렬 변환](https://threejs.org/docs/index.html#manual/ko/introduction/Matrix-transformations)에 대해 다룹니다.  
Three.js는 행렬을 이용해 3D 변형(위치 변환, 회전, 확대 등)합니다.  
Three.js에서 거의 모든 3D물체는 [Object3D](https://threejs.org/docs/index.html#api/ko/core/Object3D) 슈퍼클래스를 구현하므로, `matrix` 속성을 가집니다.  
이 `matrix` 속성은 행렬 정보를 나타내며, 오브젝트의 위치, 회전, 확대 정보를 가집니다.

## 오브젝트를 변형하는 방법 두 가지

오브젝트를 변형하려면 두 가지 방법이 있는데,  
하나는 속성만 변경하면 내부에서 행렬 재계산이 일어나는 방식,  
하나는 행렬을 직접 수정하는 방식입니다.

1. 전자의 경우, 오브젝트의 `position, quaternion, scale`같은 속성을 조절합니다. 그럼 내부에서 알아서 그에 맞는 행렬 재계산이 일어납니다.
   - ex: `object.position.copy(start_position)`
   - `matrixAutoUpdate` 속성을 `false`로 꺼버리면 재계산이 일어나지 않습니다. 이를 이용하여 오브젝트를 고정하거나 직접 재계산합니다.
     - 이 속성을 껐으면 `object.updateMatrix()`메서드로 행렬을 수동 업데이트합니다.
2. 오브젝트의 행렬을 직접 수정합니다. ([Matrix4](https://threejs.org/docs/index.html#api/en/math/Matrix4)클래스의 행렬 수정 메서드를 사용하면 굿)
   - `object.matrix.setRotationFromQuaternion(quaternion)`처럼..
   - 이 경우 무조건 `object.matrixAutoUpdate=false`로 자동 재계산을 꺼둬야 합니다.
   - 또한 `updateMatrix()`메서드를 사용하지 않습니다. 이걸 쓰면 수동 변경한 행렬을 덮어버리고 `position, scale` 등의 행렬이 재계산됩니다.

## 오브젝트와 월드 행렬

오브젝트의 `matrix` 속성이 업데이트되면 이 오브젝트의 변형 정보는 관련된 [parent](https://threejs.org/docs/index.html#api/ko/core/Object3D.parent)에 저장됩니다.  
오브젝트의 변형 정보를 **world 좌표**에서 가져오려면, [Object3D.matrixWorld](https://threejs.org/docs/index.html#api/ko/core/Object3D.matrixWorld)에 접근합니다.  
자식 또는 부모 오브젝트가 변형된 경우, `updateMatrixWorld()` 메서드를 호출하여 자식 오브젝트의 `matrixWorld`도 업데이트되게 해줘야 합니다.

### World 행렬??

근데 문서에는 딱히 world 행렬에 대한 일말의 소개도 없었습니다  
그래서 대충 찾아보고 GPT한테도 물어보고 하니  
3D 렌더링 좌표를 나타낼 때는 **local 행렬**과 **world 행렬**이라는게 있더라구요  
이는 거의 상대 좌표와 절대 좌표같은 개념이네요  
world행렬은 절대적인 기준점으로 모든 대상에 대해 동일하게 적용되고,  
local행렬은 상대적인 기준을 가집니다. 예를 들어 three.js에서는 위 내용으로 미루어보았을 때 `parent`가 기준이 될 수 있겠네요

![](https://i.imgur.com/91Heags.png)

이런 그림을 생각해봅시다  
노란 공을 기준으로 하는 local 좌표에서는 사람의 좌표가 변하여 더 가까워졌습니다  
그러나 world 기준에서는 사람은 움직이지 않고 그대로입니다. 움직인건 노란 공이구요  
이런 식으로 **물리학에서 상대/절대 좌표계**를 뜻하듯이 하는 개념으로 받아들여집니다

라는 정리에 대해 GPT(Three.js expert)에게 "잘 이해한거 맞아?"라고 물어봤습니다  
대충 비슷하다고 하면서 추가 설명을 해줬네요

**Three.js에서 로컬 -> 월드 변환 흐름**

1. **로컬 행렬 (Local Matrix)**:
   - 각 오브젝트는 자신의 **위치, 회전, 스케일**을 기반으로 **로컬 행렬**을 계산합니다.
2. **월드 행렬 (World Matrix)**:
   - 이 로컬 행렬이 부모 객체의 행렬과 곱해지면서 월드 행렬로 변환됩니다.
   - **`matrixWorld`** 속성은 이 최종 월드 좌표계를 나타내는 행렬입니다.
3. **부모-자식 관계** 예제:
   - 만약 사람이 **노란 공의 부모**라고 하면, 공의 위치는 사람의 로컬 좌표계에 상대적으로 존재하게 됩니다.  
      → 공의 위치가 `(2, 0, 0)`이고 사람이 `(10, 0, 0)`에 있다면, 월드 좌표계에서 공은 `(12, 0, 0)`이 됩니다.

어라.. 어떤 오브젝트의 로컬 행렬과 부모 객체의 행렬을 행렬곱연산을 내면 월드행렬이라네요???  
아무튼 이런 개념이 있었습니다

## 회전과 사원수(Quaternion)

three.js에서는 3D회전을 나타내기 위해 두 가지 방법이 존재합니다

- [Euler angles](https://ko.wikipedia.org/wiki/%EC%98%A4%EC%9D%BC%EB%9F%AC_%EA%B0%81): 보통 아는 $xyz$를 중심으로 회전하여 $\alpha\beta\gamma$를 나타내는 체계
- [quaternion](https://namu.wiki/w/%EC%82%AC%EC%9B%90%EC%88%98): 사원수라는 다른 체계인데.. 옛날에 역학 수업에서 헤밀토니안이라는게 좀 비슷해보이는데 도저히 잘 모르겠습니다;;

아무튼 그런데 오일러 각도 체계는 gimbal lock이라는 문제 때문에 항상 가능하진 않고, 그래서 내부에선 quaternion속성으로 저장한다고 합니다.  
이 gimbal lock은 다른 각 회전때문에 $\beta$각 범위가 제한되는 경우가 생긴다나 뭐시기인데 아폴로 11호도 이거때문에 자세조정이 힘들었다고 하네요  
아무튼 둘 사이의 변환 메서드를 제공하니까 편한거 쓰면 된다고 합니다.  
예를 들어, `setRotationFromEuler`로 quaternion을 업데이트할 수 있습니다.

# 애니메이션 시스템

[애니메이션 시스템](https://threejs.org/docs/index.html#manual/ko/introduction/Animation-system)에 대해 다룹니다.

three.js 애니메이션 시스템에서는 모델의 다양한 속성을 설정할 수 있습니다. [Skinned Mesh](https://threejs.org/docs/index.html#api/en/objects/SkinnedMesh)뼈대, 물체 변형, 재질 속성, 가시성 등..  
애니메이션의 속성은 페이드 인, 페이드 아웃, 크로스페이드, 랩 등의 종류가 존재합니다  
한 오브젝트에 대한 변화 속도나 가중치도 조절할 수 있고, 서로 다른 오브젝트 간의 애니메이션도 전부 개별적으로 변화시킬 수 있습니다.  
또는 오브젝트들 간의 다양한 애니메이션에 대해 싱크를 맞추기도 가능합니다

저는 개인적으로 이 파트 읽기 시작할 당시에는 잘 이해가 안 갔는데, 그냥 눈 딱 감고 문서 쭉 읽어보고 다시 생각해보는게 그나마 이해가능했습니다

## 애니메이션 클립

애니메이션 3D 오브젝트를 불러왔으면(ex: [`GLTFLoader`](https://threejs.org/docs/index.html#examples/en/loaders/GLTFLoader)로 gltf 모델을 불려오기), 그 오브젝트에 `animations`라는 배열이 있는걸 확인할 수 있습니다.  
여기에는 해당 모델애 대한 [`AnimationClips`](https://threejs.org/docs/index.html#api/en/animation/AnimationClip)가 존재합니다.

이 `AnimationClips`는 보통 해당 오브젝트의 특정 행동에 대한 데이터를 가집니다.  
예를 들어, "걷는 모션 한 사이클", "점프", "춤추기" 등..

## 키프레임 트랙

각 **애니메이션 클립**에 대한 애니메이션 속성 데이터는 [KeyframeTrack](https://threejs.org/docs/index.html#api/ko/animation/KeyframeTrack)에 저장됩니다.

> KeyframeTrack은 시간 리스트와 관련 값으로 구성되어 있고 오브젝트의 특정 프로퍼티를 동작시키는 데 사용되는 [keyframes](https://en.wikipedia.org/wiki/Key_frame)의 시간별 시퀀스입니다.

이 `KeyframeTrack`은 `times` 리스트와 그 각 순간에 대응하는 `values`리스트로 구성됩니다.  
각 애니메이션 클립은 그리고 여러 키프레임 트랙으로 구성될 수도 잇습니다. 예를 들어, 1번 키프레임 트랙은 팔을 뻗고, 2번 키프레임 트랙은 팔을 회전하고, ..

## 애니메이션 믹서

이렇게 저장된 데이터들은 아직 그냥 애니메이션에 대한 기본 정보를 나타내는 데이터 쪼가리입니다.  
실제 플레이백은 [AnimationMixer](https://threejs.org/docs/index.html#api/ko/animation/AnimationMixer)가 담당합니다.

> AnimationMixer는 Scene에 있는 특정 오브젝트의 애니메이션 플레이어입니다.

게다가 단순한 애니메이션 플레이어가 아닌, 여러 애니메이션 동시재생, 혼합, 병합재생 등을 수행할 수 있습니다.

## 애니메이션 액션

**애니메이션 믹서**는 속성과 메서드가 많지 않고, 일반적인 구성요소만 존재합니다.  
대신 [AnimationActions](https://threejs.org/docs/index.html#api/ko/animation/AnimationAction)를 사용하여, 특정 **애니메이션 클립**이 언제, 어떤 믹서에서, 실행/정지/중지되어야 하는지 설정할 수 있습니다(예약).  
나아가 얼마나 반복할거고, 페이드가 필요한지, 그럼 페이드 인인지 아웃인지, 등등 디테일한 설정이 가능합니다

공식문서에서는 애니메이션 믹서를 생성자로 직접 생성하기보다는 `AnimationMixer.clipAction`으로 인스턴스화하는 것이 좋다고 합니다.  
더 나은 성능을 위한 캐싱 등을 제공한다 등의 이유가 있습니다

## 애니메이션 오브젝트 그룹

같은 애니메이션 효과를 공유하는 오브젝트 그룹을 만들려면 [AnimationObjectGroup](https://threejs.org/docs/index.html#api/ko/animation/AnimationObjectGroup)를 사용합니다.

## 활용해보기

사실 애니메이션 시스템 문서나 Keyframes 등등 관련 문서에서 예시 코드가 너무 빈약합니다..  
샘플이라고 적어놓은 것들은 사실 생략한 것도 많고 하더라구요  
그리고 예를 들어 `Three.VectorKeyframeTrack()`으로 키프레임 트랙을 만들거면 예시로 어떻게 코드를 구성하는지도 잘 안 나와있습니다.  
내가 못찾았나?

아무튼 문서 파헤쳐보고 GPT한테도 물어물어서 간단한 애니메이션 클립을 활용하는 샘플을 만들어봤습니다

먼저, [이런 사이트](https://sketchfab.com/3d-models?features=downloadable&sort_by=-likeCount)에서 적당한 에셋을 하나 구해왔습니다.  
그중에서도 매우 귀염둥이인 시바견을 하나 가져왔어요  
이걸 가져다가 프로젝트 내부(저는 `/public/gltf/` 폴더를 만들고 그 밑에 넣었습니다)에 가져다둡니다.  
이제 [3D 모델 불러오기](https://threejs.org/docs/#manual/ko/introduction/Loading-3D-models)에서 말하는 것처럼 로드해오면 됩니다. 아래처럼

```js
const loader = new GLTFLoader();

loader.load(
  "/gltf/scene.gltf", //path to asset
  function (gltf) {
    // 로드 성공 콜백
    model = gltf.scene;
    gltf.scene.scale.set(10, 10, 10); //좀 작아서 확대함
    scene.add(model);
  },
  undefined, //로드 중 콜백
  function (error) {
    //에러 콜백
    console.error(error);
  }
);
```

저는 애셋을 `public/gltf/scene.gltf`와 같이 두었으니까 저렇게 path를 쓰는겁니다  
이러면 귀여운 시바견이 나오구요

이제 gltf를 로드한 콜백 내에서 애니메이션 로직을 추가합니다  
먼저 mixer, model(얘는 이미 있지만)을 콜백 바깥에서 만들어줍시다. 나중에 필요해서요

```js
let mixer, model;

loader.load(...)
```

이제 load의 콜백 내에서 `scene.add(model)` 뒤에 애니메이션 클립을 정의해줍니다.  
저는 불투명도를 조절하는 `NumberKeyframeTrack`과, 회전을 주는 `VectorKeyframeTrack`을 만들겠습니다

```js
mixer = new THREE.AnimationMixer(model); // 시바견에 대한 애니메이션 믹서 생성
model.traverse(child => {
  if (child.isMesh && child.material) {
    child.material.transparent = true;

    //불투명도 키프레임
    const opacityKF = new THREE.NumberKeyframeTrack(
      `${child.name}.material.opacity`, // 이름(중요)
      [0, 1, 2][(1, 0, 1)] // times // values
    );

    //회전 키프레임
    const rotateKF = new THREE.VectorKeyframeTrack(
      `${child.name}.rotation[z]`,
      [0, 0.5, 1, 1.5, 2],
      [0, Math.PI * 2, Math.PI * 4, Math.PI * 6, Math.PI * 8]
    );

    const clip = new THREE.AnimationClip("OpacityAnimation", 4, [
      opacityKF, //이 배열에 키프레임을 삽입
      rotateKF
    ]);

    // clipAction 생성, play
    const action = mixer.clipAction(clip, child);
    action.play();
  }
});
```

키프레임의 첫 번째 인자에는 이름 프로퍼티가 들어갑니다. [KeyframeTrack의 이름](https://threejs.org/docs/index.html#api/ko/animation/KeyframeTrack.name)문서를 참고하세요. 이름 잘못쓰면 동작하지 않습니다

저는 처음에 이걸 traverse 순회가 아닌 단일 `model`에 대해 저 코드를 작성했더니

```
THREE.PropertyBinding: Can not bind to objectName of node undefined.
```

이런 에러가 떴습니다. 찾아보니 GLTF모델 구조때문에 매터리얼 그잡채에 직접 접근할 수 없어서 그렇다네요.
