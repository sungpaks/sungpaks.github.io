---
title: "🎯 React에서 횡스크롤 이미지 핫스팟 기능 구현하기 with Canvas API"
date: 2026-01-08 20:12:02
description: "좌표계 정규화만 떠올리면"
tag: ["JavaScript", "HTML", "Canvas", "React"]
---

최근에 만들었던 재난 생존가방 게임에서는 아래와 같은 기능이 있는데요

![긴 배경](https://i.imgur.com/JNwaBDC.gif)

재난이 일어난 상황에서, 생존 시나리오를 시작하기 전에  
마트 선반에서 아이템을 골라 담으며 생존가방을 준비하는 상황을 표현한 기능입니다.  
가로축으로 이동(스크롤)하며 선반을 탐색하고,  
이미지 상에서 마커(녹색)를 클릭하면 아이템을 담을 수 있습니다.

우리 팀에서는 이를 **횡스크롤 이미지 핫스팟** 기능이라고 불렀는데요  
횡스크롤은 말 그대로 가로축으로 이동할 수 있는 것이고  
이미지 핫스팟은 처음들어보실 것 같은데 그냥  
**이미지에서 어떤 지점(Hotspot)들을 시각적으로 표시하고 인터랙션**할 수 있도록 하는 유저 경험을 말합니다.

<figure>

![Image Hotspot 예시](https://i.imgur.com/VXtza2a.png)

<figcaption>

Image Hotspot의 한 예시.  
예를 들어 딸기 위에 마커를 표시하고, 그 마커를 클릭하면 딸기에 대한 컨텐츠를 팝업합니다.  
출처: [h5p.org - Image Hotspot Tutorial](https://h5p.org/tutorial-image-hotspots)

</figcaption>
</figure>

오늘은 이러한 횡스크롤 + 이미지 핫스팟 기능을  
React 상에서 Canvas를 사용하여 구현해보려 합니다.  
이미지 위의 클릭 가능한 지점들은 앞으로 **스팟(Spot)** 이라고 부를게요

# 구현 스펙

기획측과 논의한 구현 요구사항은

- 이미지 상에서 어떤 **스팟을 터치(클릭)하여 상호작용**할 수 있다.
  - 예를 들어, 이미지에서 "우유병"을 선택 (하단 이미지 예시에서 붉은색 원)
  - 이 "스팟"은 그 스팟의 위치 좌표와 스팟에 있는 아이템의 정보 등이 미리 준비되어 있다.
- 이미지는 **항상 기기 높이를 채우고 원본 비율을 유지**한다.
  - 이미지 폭이 기기 너비보다 크면 -> **횡스크롤**하여 이미지를 좌우이동할 수 있다.
  - 이미지 폭이 기기 너비보다 작으면 -> 이미지를 중앙에 정렬한다.

<figure>

![이미지에서 특정 지점 예시](https://i.imgur.com/JPSlwmU.png)

<figcaption>
이 이미지에서 붉은 원을 클릭(터치)하여 "우유병"과 상호작용하고 싶습니다.
</figcaption>

</figure>

![이미지 너비가 작을 경우 vs 클 경우](https://i.imgur.com/Kw3steC.png)

<figcaption>
이미지 폭이 기기 너비보다 작으면 중앙에 배치하고, 크면 횡스크롤합니다.
</figcaption>

# 어떻게 상대좌표계로 고정하셨죠?

가장 먼저 신경써야 할 것은 **스팟을 놓을 위치 좌표**인데요  
단순히 "이미지 좌측 상단에서부터 아래로 `100px`, 오른쪽으로 `100px`"라고 해서 점을 찍으면 안됩니다  
간단히 이미지로 알아봅시다.

아래 이미지에서는 붉은색 둥근 직사각형이 화면 범위고,  
검은색 직사각형은 이미지입니다.  
요구사항에 따라 비율을 고정한 채 이미지 높이를 화면 높이에 맞추고,  
일단 이해를 위해 이미지는 좌측정렬했습니다.  
이미지 상에 `x`모양으로 스팟을 하나 찍습니다.  
여기를 `x=100px`이라고 하고, 높이는 일단 무시하고 `x`만 생각해봅시다.

![화면 해상도에 따라 절대좌표는 변한다](https://i.imgur.com/wfhIHQY.png)

이런 식으로 스팟의 절대 위치가 달라집니다.  
다시 저 `x=100px` 지점을 클릭해봐도 스팟을 인식할 수 없습니다.

![어디간거야?](https://i.imgur.com/yvrIOvG.png)

이미지 크기에 상관없이 **이미지 상의 스팟 위치를 일관적으로 보장**하려면 **정규화**하여 **상대 좌표**를 사용해야 합니다.  
정규화는 어려운 개념이 아니지만 공대생들이나 알 법한 말이니 자세하게 알아봅시다.

## 좌표를 정규화하기

예를 들어 좌측상단을 `(0,0)`으로, 우측하단을 `(1,1)`로 정해봅니다.

![좌측상단 0,0 우측하단 1,1](https://i.imgur.com/1yRToKe.png)

이제 이미지 상의 어떤 위치좌표든, 이미지가 얼마나 크고 작건, `x`는 너비로 나누고 `y`는 높이로 나눕니다.  
예를 들어, 너비 `1000px`, 높이 `400px`의 이미지가 있고,  
어떤 스팟이 좌측 끝에서 오른쪽으로 `100px`, 맨 위 끝에서 `80px`떨어져 있습니다.  
이것을 정규화 좌표로 나타내려면 각 x,y좌표에 너비,높이를 나누니  
$(\frac{100px}{1000px}, \frac{80px}{400px}) = (0.1, 0.2)$가 되네요  
또는 **전체 너비의 10%, 전체 높이의 20% 지점에 있다**라고 말할 수 있습니다.

![정규화 과정](https://i.imgur.com/1xIWXx2.png)

마치 분모 px와 분자 px도 소거되어서, **px(크기)에 무관해졌다**라고 생각하셔도 쉽습니다.  
이렇게 **단위에 무관한 좌표계에 나타내는 과정**을 **정규화**라고 합니다.  
"정중앙은 50%다"라고 생각하실 때의 50%도 정규화된 상대적 위치에 해당합니다.

이것을 나중에 다른 크기에 적용할 때도, 이미지 너비와 높이를 곱하기만 하면 됩니다.  
예를 들어, 스케일이 두 배 차이나서 너비가 `2000px`면, 스팟의 실제 x좌표는 `200px`입니다.

![상대좌표로 해상도에 무관하게 스팟 위치를 나타내기](https://i.imgur.com/lMlbEsi.png)

이러하니, 위치 좌표는 **정규화**하여 **상대 좌표**를 저장하는 것이 좋겠습니다.  
`(0.1, 0.2)`, `(0.582, 0.182)`처럼요

그럼 좌표계의 원점인 `(0,0)`과 끝점인 `(1,1)`을 정해야 하는데요  
위에서 생각했던 그대로 **좌측 상단을 `(0,0)`, 우측 하단을 `(1,1)`** 로 두는게 좋겠습니다.  
앞으로 구현에 HTML Canvas를 쓸건데, **이 Canvas 원점이 좌측 상단에서 시작**하기 때문입니다

<figure>

![Canvas의 좌표계 기준 from MDN](https://i.imgur.com/HQ7GTJM.png)

<figcaption>

출처: [캔버스(canvas)를 이용한 도형 그리기 - MDN docs](https://developer.mozilla.org/ko/docs/Web/API/Canvas_API/Tutorial/Drawing_shapes)

</figcaption>
</figure>

# 이대로 구현하기

이제 구현을 시작해볼건데

1. 일단 중앙정렬 신경쓰지 않고 이미지를 Canvas에 띄우고
2. 스팟(정규화된 상대 좌표)위에 마커를 그려내고 클릭(터치) 감지 구현
3. 이미지가 짧은 경우 중앙정렬 추가
4. 이미지가 긴 경우 횡스크롤 추가
5. 최적화 등 개선

이런 식으로 쪼개서 진행하면 좋겠는데요  
단계들을 전부 따라가며 코드도 보여드리고 하려면 너무 지루하고 현학적이겠죠?

![지루하고 현학적임](https://i.imgur.com/tI2xgos.png)

어차피 스펙을 거의 100% 확정한 셈이라  
이제부터는 이대로 AI한테 해줘 하면 진짜 잘짜줍니다  
아! 슬픈 일일까요, 좋은 일일까요?

아무튼 중앙정렬(이미지가 짧은 버전)까지만 한번에 알아보고  
그 다음 횡스크롤을 추가하고  
실제로 아이템을 선택하는 상호작용을 추가하는 것까지만 단계적으로 해봅시다.

## 이미지가 짧은 버전(중앙정렬) 먼저 구현

```tsx
const canvasRef = useRef<HTMLCanvasElement>(null);
const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
const [backgroundImg, setBackgroundImg] = useState<HTMLImageElement | null>(
  null
);
const [imageScale, setImageScale] = useState({
  width: 0,
  height: 0,
  offsetX: 0 // 가로 중앙 정렬을 위한 오프셋
});
```

먼저 기본적으로 상태는 이정도 필요합니다.  
`canvasSize`는 `dvw, dvh`로 채울 것이고,  
`imageScale`은 그 캔버스 높이에 맞춘 이미지 높이 + 원본 비율을 유지한 너비 + 중앙정렬을 위해 `offsetX`를 둡니다.

이제 뷰포트 크기와 이미지 스케일을 계산하는 함수를 작성합니다.

```tsx
// 뷰포트 크기 계산 (dvw, dvh 기준)
const calculateCanvasSize = useCallback(() => {
  const dvw = window.innerWidth;
  const dvh = window.innerHeight;
  return { width: dvw, height: dvh };
}, []);

// 이미지 스케일 계산 (높이 100dvh 기준, 원본 비율 유지)
const calculateImageScale = useCallback(
  (imgWidth: number, imgHeight: number) => {
    const { height: containerHeight, width: containerWidth } =
      calculateCanvasSize();

    // 높이를 100dvh에 맞추고 원본 비율 유지
    const scaleRatio = containerHeight / imgHeight;
    const scaledWidth = imgWidth * scaleRatio;
    const scaledHeight = containerHeight;

    return {
      width: scaledWidth,
      height: scaledHeight,
      offsetX: Math.floor((containerWidth - scaledWidth) / 2)
    };
  },
  [calculateCanvasSize]
);
```

`window.innerWidth`는 [레이아웃 뷰포트](https://developer.mozilla.org/ko/docs/Glossary/Layout_viewport)의 너비(px값)를 반환합니다.  
이것저것 다 빼고 안쪽 화면만 뜻합니다.

이제 배경 이미지를 로드해봅니다.

```tsx
const backgroundLoadSeqRef = useRef(0);

// 배경 이미지 로드
useEffect(() => {
  const seq = (backgroundLoadSeqRef.current += 1);

  const img = new Image();
  img.onload = () => {
    if (backgroundLoadSeqRef.current !== seq) return;

    setBackgroundImg(img);
    // 이미지 로드 완료 시 배율 계산
    const scale = calculateImageScale(img.naturalWidth, img.naturalHeight);
    setImageScale(scale);
  };
  img.onerror = () => {};
  img.src = backgroundImage;
}, [backgroundImage, calculateImageScale, calculateCanvasSize, setViewOffsetX]);
```

`img.src = backgroundImage`에서 로드가 시작된 이후  
로딩이 완료되어 `img.onload`가 실행되는 시점까지는 은근한 시간 갭이 있습니다  
이 사이에 새로운 이미지 로드가 시작되면, `onload`가 여럿 겹쳐 레이스 컨디션이 발생할 수도 있습니다

![겹친 사막여우](https://i.imgur.com/girNqeG.png)

그래서 **마지막 이미지 로드 건만 남기기** 위해 `backgroundLoadSeqRef.current !== seq`조건을 추가해줍니다.  
`const seq = (backgroundLoadSeqRef.current += 1);`  
로드 시작 전에 여기에서 발급받은 내 번호가 아직도 마지막 번호가 맞는지 확인하는 셈입니다.

이제 Canvas 크기를 결정합니다.  
최초 & 리사이즈 이벤트가 있을 때마다 재계산해줍니다.

```tsx
// Canvas 크기 설정 및 리사이즈 처리
useEffect(() => {
  // 1. 최초 1회 계산
  const size = calculateCanvasSize();
  setCanvasSize(size);

  const handleResize = () => {
    // 2. 리사이즈 시 재계산
    const newSize = calculateCanvasSize();
    setCanvasSize(newSize);

    // 3. 리사이즈 시 이미지 스케일도 재계산
    if (backgroundImg) {
      const newScale = calculateImageScale(
        backgroundImg.naturalWidth,
        backgroundImg.naturalHeight
      );
      setImageScale(newScale);
    }
  };

  window.addEventListener("resize", handleResize);
  return () => window.removeEventListener("resize", handleResize);
}, [calculateCanvasSize, calculateImageScale, backgroundImg]);
```

이제 Canvas를 렌더링하면 되는데

```tsx
// Canvas 렌더링
useEffect(() => {
  if (!canvasRef.current || !backgroundImg || imageScale.width === 0) return;

  const canvas = canvasRef.current;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // 1. 고해상도 디스플레이 대응
  const dpr = window.devicePixelRatio || 1;
  canvas.width = canvasSize.width * dpr;
  canvas.height = canvasSize.height * dpr;
  ctx.scale(dpr, dpr);

  // 2. 배경 클리어
  ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);

  // 3. 이미지 그리기 (항상 중앙 정렬 또는 크롭)
  if (imageScale.width <= canvasSize.width) {
    // 이미지가 화면보다 작거나 같은 경우 - 중앙에 배치하고 양쪽 여백
    ctx.drawImage(
      backgroundImg,
      imageScale.offsetX, // 중앙 정렬 오프셋
      0,
      imageScale.width,
      imageScale.height
    );
  } else {
    // 이미지가 화면보다 큰 경우 - TODO
    ...
  }

  // 4. 아이템 영역(스팟)을 그려냅니다. - TODO
  drawItemAreas(ctx);
}, [canvasSize, backgroundImg, drawItemAreas, imageScale]);
```

`1. 고해상도 디스플레이 대응`은 MDN 문서 [Scaling for high resolution displays](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas#scaling_for_high_resolution_displays)에서도 소개됩니다.  
이게 왜 필요한지 대충 짚고 넘어가자면

보통 css 상에서 표현되는 1px을 **논리 픽셀**이라고 합니다.  
"뷰포트 너비가 400px"이라고 하면 논리 픽셀이 400px인데요  
옛날에는 이 논리 픽셀 하나에 실제 화소(**물리 픽셀**)을 하나씩만 넣었지만  
요새 기기들은 자주 논리 픽셀 하나에 여러 물리 픽셀을 박아넣어 높은 해상도를 챙깁니다.  
이렇게 논리 픽셀 하나에 물리 픽셀을 얼마나 넣었는지 비율을 **DPR(Device Pixel Ratio)** 라고 합니다.  
이런 경우를 보정해주지 않으면 Canvas 그림이 고해상도 기기에서는 흐릿하게 보이게 됩니다.

<figure>

![](https://i.imgur.com/kilOSoK.png)

<figcaption>
dpr에 따른 차이를 나노바나나로 낋여봤습니다
</figcaption>
</figure>

`drawItemAreas`는 이제부터 알아봅시다

### 아이템 스팟에 마커 그리기

![아이템 위에 마커](https://i.imgur.com/HY98g2X.png)

이런 식으로 아이템 위에 저런 마커를 올리기 위해  
`drawItemAreas(ctx)`라는 함수를 만들어봅니다.

```tsx
const ITEM_SIZE_PIXEL = 30;
const drawItemAreas = useCallback(
  (ctx: CanvasRenderingContext2D) => {
    if (imageScale.width === 0) return;

    // 1. 각 아이템들의 상대좌표를 실제 캔버스 상의 좌표로 매핑합니다.
    items.forEach(item => {
      const pos = mapItemToViewportPosition({
        item,
        imageScale,
        canvasSize
      });
      if (!pos) return;

      // 2. 캔버스 상에 마커를 그립니다.
      drawMarker(ctx, pos.xPx, pos.yPx, ITEM_SIZE_PIXEL, ITEM_SIZE_PIXEL);
    });
  },
  [items, imageScale, canvasSize, viewOffsetX]
);
```

`items`는 `[{ x: 0.129, y: 0.718, name: "돼지고기" }, ...]` 이런 식으로 생기면 될 것 같아습니다.  
정규화된 상대 좌표를 가지도록 해서요

이런 각 상대 좌표를 실제 캔버스 상의 좌표로 매핑하는 `mapItemToViewportPosition`은

```ts
export function mapItemToViewportPosition({
  item,
  imageScale,
  canvasSize
}: MapItemToViewportPositionParams): ViewportPosition | null {
  if (imageScale.width === 0 || canvasSize.width === 0) return null;

  const baseX = item.x * imageScale.width;
  const xPx = baseX + imageScale.offsetX;
  const yPx = item.y * imageScale.height;

  return { xPx, yPx };
}
```

위에서 살펴봤듯이 `(상대좌표) * (이미지의 스케일)`로 절대좌표를 얻을 수 있었습니다.

실제로 마커 이미지를 그려내는 `drawMarker`함수는:

```ts
export function drawMarker(
  ctx: CanvasRenderingContext2D,
  x: number, // 마커 중심 x좌표
  y: number, // 마커 중심 y좌표
  width: number, // 마커 너비
  height: number // 마커 높이
): void {
  if (!markerImage) {
    return;
  }

  // 중심 좌표 기준으로 좌상단 좌표 계산 후 Canvas에 이미지 그리기
  const markerLeft = x - width / 2;
  const markerTop = y - height / 2;
  ctx.drawImage(markerImage, markerLeft, markerTop, width, height);
}
```

이제 마커 이미지가 필요한데요,  
`drawImage`에 넣을 `markerImage`는 게임 내내 변하지 않으므로  
마커 이미지는 미리 로드해서 런타임에 올려둔 다음(캐시) 계속 써먹는게 좋겠어요  
그래서 아래와 같이 `markerImage`를 프리로드하는 함수를 만듭니다.

```tsx
let markerImage: HTMLImageElement | null = null;
let imageLoadPromise: Promise<HTMLImageElement> | null = null;

/**
 * @returns {Promise<HTMLImageElement>} 로드된 이미지 엘리먼트를 반환하는 Promise.
 */
export function preloadMarkerImage(): Promise<HTMLImageElement> {
  // 이미 로드된 경우 즉시 반환
  if (markerImage) {
    return Promise.resolve(markerImage);
  }

  // 로딩 중인 경우 기존 Promise 반환
  if (imageLoadPromise) {
    return imageLoadPromise;
  }

  // 새로 로드 시작
  imageLoadPromise = new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      markerImage = img;
      resolve(img);
    };

    img.onerror = () => {};

    img.src = targetMarkerPng;
  });

  return imageLoadPromise;
}
```

이제 이걸 Canvas 컴포넌트에서 최초 마운트 시 1회 호출하여 로드합니다.

```tsx
// 마커 이미지 미리 로드
useEffect(() => {
  preloadMarkerImage();
}, []);
```

## 이미지가 긴 버전(횡스크롤) 구현

일단 횡스크롤은 개념 상으로는 간단하게도

```ts
const [viewOffsetX, setViewOffsetX] = useState(initialOffset);
```

이런 "횡스크롤로 뷰를 얼마나 옮겼는지" 상태값을 유지하고, 이걸 사용자 제스쳐에 따라 업데이트합니다.  
근데 이 "사용자 제스쳐에 따라 업데이트"하려면 로직 코드가 많아지니, `useCanvasSideScroll`이라는 이름으로 묶어보면 아래와 같습니다.

```tsx
export function useCanvasSideScroll({
  maxScrollWidth, // number - 어디까지 갈 수 있는지? == 이미지 width
  viewportWidth, // number - 뷰포트 너비 == 캔버스 width
  initialOffset = 0
}: UseCanvasSideScrollProps): UseCanvasSideScrollReturn {
  const [viewOffsetX, setViewOffsetX] = useState(initialOffset);

  const dragStateRef = useRef<{
    startX: number; // 드래그를 시작한 지점
    startOffsetX: number; // 드래그 시작 시점에서의 offsetX
    hasMoved: boolean; // 움직였나?
  } | null>(null);

  // 포인터 X 좌표 추출 (마우스/터치 공통)
  const getPointerX = useCallback(
    (e: React.MouseEvent | React.TouchEvent): number | null => {
      if ("touches" in e) {
        return e.touches[0]?.clientX ?? null;
      }
      return e.clientX;
    },
    []
  );

  // Pointer Down (마우스/터치 시작)
  const handlePointerDown = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      const x = getPointerX(e);
      if (x === null) return;

      dragStateRef.current = {
        startX: x,
        startOffsetX: viewOffsetX,
        hasMoved: false
      };
    },
    [viewOffsetX, getPointerX]
  );

  // Pointer Move (드래그)
  const handlePointerMove = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!dragStateRef.current) return;

      const x = getPointerX(e);
      if (x === null) return;

      const deltaX = x - dragStateRef.current.startX;

      // 약간이라도 움직였으면 표시 (3px 임계값)
      if (!dragStateRef.current.hasMoved && Math.abs(deltaX) > 3) {
        dragStateRef.current.hasMoved = true;
      }

      // 스크롤 계산
      const maxScroll = Math.max(0, maxScrollWidth - viewportWidth);
      const nextOffset = Math.min(
        Math.max(dragStateRef.current.startOffsetX - deltaX, 0),
        maxScroll
      );

      setViewOffsetX(nextOffset);
    },
    [maxScrollWidth, viewportWidth, getPointerX]
  );

  // Pointer Up (끝)
  const handlePointerUp = useCallback(() => {
    // 다음 프레임까지 유지 (onClick보다 먼저 실행되도록)
    setTimeout(() => {
      dragStateRef.current = null;
    }, 0);
  }, []);

  const isDragging = dragStateRef.current?.hasMoved ?? false;

  return {
    viewOffsetX,
    setViewOffsetX,
    isDragging,
    dragHandlers: {
      onMouseDown: handlePointerDown,
      onMouseMove: handlePointerMove,
      onMouseUp: handlePointerUp,
      onMouseLeave: handlePointerUp,
      onTouchStart: handlePointerDown,
      onTouchMove: handlePointerMove,
      onTouchEnd: handlePointerUp
    }
  };
}
```

<figure>

![viewOffsetX](https://i.imgur.com/hfMiJwA.png)

<figcaption>
점선 직사각형이 이미지, 붉은 둥근 직사각형이 화면
</figcaption>
</figure>

`viewOffsetX`는 이렇게 이미지의 좌측 맨 끝으로부터 화면 좌측 맨 끝이 얼마나 떨어져있는지 나타낼겁니다.

- 터치/클릭이 시작되면 그 지점과 그 때의 `viewOffsetX`값을 ref에 저장하고
- 3px 이상 움직이면 드래그로 간주
- 드래그 중에는 시작점보다 이동한 만큼 `viewOffsetX`를 업데이트
  - 이 때, 스크롤할 수 있는 최대치를 도달했으면 움직이지 못합니다.

![maxScroll 계산](https://i.imgur.com/BQBIZNC.png)

이제 이 횡스크롤 훅은 Canvas 컴포넌트에서

```tsx
const { viewOffsetX, setViewOffsetX, isDragging, dragHandlers } =
  useCanvasSideScroll({
    maxScrollWidth: imageScale.width,
    viewportWidth: canvasSize.width,
    initialOffset: 0
  });

return (
  <canvas
    ref={canvasRef}
    style={{
      width: `${canvasSize.width}px`,
      height: `${canvasSize.height}px`,
      touchAction: "none",
      cursor: isDragging ? "grabbing" : "grab"
    }}
    onClick={handleClick}
    {...dragHandlers}
  />
);
```

`<canvas {...dragHandlers}>`로 모든 이벤트리스너를 등록해줍니다.

그리고 `viewOffsetX`와 `setViewOffsetX`는 여기저기서 쓸 곳이 많은데요

```ts
function mapItemToViewportPosition({
  item,
  imageScale,
  canvasSize,
  viewOffsetX
}: MapItemToViewportPositionParams): ViewportPosition | null {
  if (imageScale.width === 0 || canvasSize.width === 0) return null;

  const isWide = imageScale.width > canvasSize.width;
  const baseX = item.x * imageScale.width;
  const xPx = isWide ? baseX - viewOffsetX : baseX + imageScale.offsetX;
  const yPx = item.y * imageScale.height;

  return { xPx, yPx };
}

// drawItemAreas
const drawItemAreas = useCallback(
  (ctx: CanvasRenderingContext2D) => {
    if (imageScale.width === 0) return;

    items.forEach(item => {
      const pos = mapItemToViewportPosition({
        item,
        imageScale,
        canvasSize,
        viewOffsetX
      });
      if (!pos) return;

      // 이제 동기적으로 즉시 그려짐
      drawMarker(ctx, pos.xPx, pos.yPx, ITEM_SIZE_PIXEL, ITEM_SIZE_PIXEL);
    });
  },
  [items, imageScale, canvasSize, viewOffsetX]
);
```

먼저, 횡스크롤하면 캔버스 상에 그려낼 아이템 스팟 위치도 달라지니  
이를 `mapItemToViewportPosition`에 반영해줘야 하고

```tsx
const handleResize = () => {
  const newSize = calculateCanvasSize();
  setCanvasSize(newSize);

  // 리사이즈 시 이미지 스케일도 재계산
  if (backgroundImg) {
    const newScale = calculateImageScale(
      backgroundImg.naturalWidth,
      backgroundImg.naturalHeight
    );
    setImageScale(newScale);

    // (new!) 리사이즈 시 현재 오프셋을 허용 범위로 클램프
    const maxScroll = Math.max(0, newScale.width - newSize.width);
    const clampedOffset = Math.min(Math.max(viewOffsetX, 0), maxScroll);
    setViewOffsetX(clampedOffset);
  }
};
```

리사이즈 시 캔버스 사이즈와 이미지 스케일을 재계산할 때,  
혹시나 `maxScroll`을 넘어가버릴 수도 있으니 클램프해줍니다.

마지막으로 canvas 렌더링 시 :

```tsx
useEffect(() => {
  // ...

  // 이미지 그리기 (항상 중앙 정렬 또는 크롭)
  if (imageScale.width <= canvasSize.width) {
    // 이미지가 화면보다 작거나 같은 경우 - 중앙에 배치하고 양쪽 여백
  } else {
    // 이미지가 화면보다 큰 경우 - 현재 뷰 시작점(viewOffsetX)을 기준으로 잘라서 표시
    const cropStartX = viewOffsetX;
    const sourceStartX =
      cropStartX * (backgroundImg.naturalWidth / imageScale.width);
    const sourceWidth =
      canvasSize.width * (backgroundImg.naturalWidth / imageScale.width);

    ctx.drawImage(
      backgroundImg,
      sourceStartX, // 소스 이미지에서 중앙 부분 시작점
      0, // 소스 Y (전체 높이 사용)
      sourceWidth, // 소스 너비 (화면 너비만큼)
      backgroundImg.naturalHeight, // 소스 높이 (전체 높이)
      0, // 캔버스 X
      0, // 캔버스 Y
      canvasSize.width, // 캔버스 너비
      canvasSize.height // 캔버스 높이
    );
  }

  drawItemAreas(ctx);
}, [canvasSize, backgroundImg, drawItemAreas, imageScale, viewOffsetX]);
```

TODO로 남겨뒀던 "이미지가 화면보다 큰 경우" 캔버스에 이미지를 렌더링하는 코드를 완성해줍니다.  
화면에 들어가는 만큼만 이미지를 잘라야 하니까,  
`viewOffsetX`부터 화면너비만큼만 이미지를 캔버스에 그려주면 될 것 같아요

## 스팟 클릭(터치)구현

이제 Canvas에서 클릭(마우스/터치 관계없이)했을 때,  
클릭한 지점이 스팟에 해당하는지, 어떤 아이템을 클릭했는지 알고 싶습니다  
이를 위해 클릭 이벤트 핸들러를 작성합시다.

```tsx
const handleClick = useCallback(
  (e: React.MouseEvent) => {
    if (isDragging) return;

    // 1. 클릭된 캔버스 상 좌표 --> 이미지 상의 좌표로 변환
    const imageCoords = getImageCoordinates(e.clientX, e.clientY);
    if (!imageCoords) return;

    // 2. 이미지 상의 좌표에 해당하는 아이템이 있는지 판별
    const item = detectItemSelection(imageCoords.x, imageCoords.y);
    if (item) {
      onClickItem(item);
    }
  },
  [getImageCoordinates, detectItemSelection, onClickItem, isDragging]
);
```

`getImageCoordinates`는 캔버스 상의 클릭 좌표를 이미지 상의 좌표계로 변환합니다.

```tsx
// 좌표계 변환: 캔버스 좌표 -> 이미지 내 절대 좌표
const getImageCoordinates = useCallback(
  (clientX: number, clientY: number) => {
    if (!canvasRef.current || imageScale.width === 0) return null;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    // 1. 캔버스 내부 좌표로 변환
    const canvasX = clientX - rect.left;
    const canvasY = clientY - rect.top;

    // 2. 이미지 좌표로 변환
    if (imageScale.width <= canvasSize.width) {
      // 2-1. 이미지가 작거나 같은 경우 - 오프셋 고려
      const imageX = canvasX - imageScale.offsetX;
      const imageY = canvasY;
      return { x: imageX, y: imageY };
    } else {
      // 2-2. 이미지가 큰 경우 - 현재 뷰 시작점(viewOffsetX) 고려
      const cropStartX = viewOffsetX;
      const imageX = canvasX + cropStartX;
      const imageY = canvasY;
      return { x: imageX, y: imageY };
    }
  },
  [canvasSize, imageScale, viewOffsetX]
);
```

`detectItemSelection`은 아이템 리스트를 순회하며 좌표에 해당하는 아이템이 있는지 확인합니다.

```ts
// 아이템 선택 감지
const detectItemSelection = useCallback(
  (imageX: number, imageY: number) => {
    if (imageScale.width === 0) return null;

    for (const item of items) {
      // 1. item.x는 상대좌표이므로 반정규화 --> 이미지 상의 좌표로 변환
      const itemX = item.x * imageScale.width;
      const itemY = item.y * imageScale.height;

      const halfSize = ITEM_SIZE_PIXEL / 2;

      // 2. 아이템 중점으로부터 마커 범위인 30px 정사각형 내에 좌표가 포함되는지 검사
      const isInXRange =
        imageX >= itemX - halfSize && imageX <= itemX + halfSize;
      const isInYRange =
        imageY >= itemY - halfSize && imageY <= itemY + halfSize;

      if (isInXRange && isInYRange) {
        return item;
      }
    }
    return null;
  },
  [items, imageScale]
);
```

이제 이 `handleClick` 클릭 이벤트 핸들러를 `<canvas>`에 등록만 해주면 됩니다.

## 결과

![짧은 배경](https://i.imgur.com/wjklfPr.gif)

![긴 배경](https://i.imgur.com/JNwaBDC.gif)

완성된 모습입니다  
위에가 배경이 짧은 경우에요 티가 잘 나지는 않지만..  
자세히 보면 양옆에 까만 부분이 조금 있습니다

아무튼 성공적이네요  
이만 마칩니다
