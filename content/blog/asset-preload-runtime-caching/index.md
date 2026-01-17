---
title: "⏳ 게임의 로딩을 웹에서 따라하기"
date: 2026-01-11 17:05:36
description: "메모리에 미리 올려둔다는 속박으로 리소스를 지연 없이 사용한다"
tag: ["JavaScript", "React"]
ogImage: "https://i.imgur.com/xG96R4q.jpeg"
---

웹 게임을 만들다가 문제가 있었습니다.  
게임이다보니 이미지, 사운드같은 에셋들이 많았는데요

<figure>

![깜빡이는 UI](https://i.imgur.com/XHzrYUb.gif)

<figcaption>쓰로틀링 없이 풀 네트워크로 이정도의 깜빡임을..</figcaption>
</figure>

웹에서 그냥 하듯이 `<img src="foo.png">`처럼 하면 이렇게 유저 경험이 꽤 유쾌하지 못했는데

- 이미지가 준비되는 동안 화면이 깜빡이고
- 레이아웃 시프트가 발생하기도 하며
- 이미지가 한번에 도착하지 못하여 점진적으로 보이게 되기도 했습니다.

또한 사운드의 경우, 효과음은 어떤 액션에 대해 바로 소리가 나오기를 기대하지만  
재생해야 할 때가 되어서야 사운드 파일을 받아오기 시작한다면  
들려야 할 타이밍보다 3초가 더 지나서야 소리가 갑자기 재생되는 불상사가 발생하기도 합니다.

이러한 문제를 개선하고 더 게임스럽게 경험을 제공할 방법을 생각했고  
**로딩 시간을 두어 미리 에셋을 준비**하고 바로 쓸 수 있게 **메모리에 올려두는** 방법을 택했습니다.  
실제로 이를 통해 아래와 같이 좀 더 매끄러운 게임 경험을 줄 수 있었고요

![로딩 도입으로 개선된 gif]

# 게이머들이 기대하는 것

게임과 웹페이지는 로딩에 대한 기준이 좀 다르다고 느끼는데  
웹에서는 보통 페이지/화면 전환 간에 필요할 때마다 필요한 만큼 필요한 것을 로딩을 표현하는 것이 보통입니다.  
반면 게임은 본격적인 게임 시작에 앞서 **로딩 화면**을 지나는 것이 자연스럽게 납득됩니다.

<figure>

![게임 로딩화면 예시](https://i.imgur.com/HKiip5Y.png)

<figcaption>
스마일게이트의 게임 ≪로스트아크≫ 로딩화면 예시
</figcaption>
</figure>

게이머들도 이 로딩 단계를 자연스럽게 여기고 받아들이며,  
대신 로딩화면을 기다린 후에는 **지연을 느끼지 않는 경험**을 기대합니다.

<figure>

![백투더퓨처의 로딩화면](https://i.imgur.com/xG96R4q.jpeg)

<figcaption>
우리 게임의 로딩화면
</figcaption>

</figure>

그래서 우리 게임도 게임을 시작할 때 **로딩 화면**을 지나고,  
이 로딩화면에서 **에셋들을 미리 로드**해두기로 했습니다.

<figure>

![로딩-미리한 달걀](https://i.imgur.com/t2K0VDW.jpeg)</figure>

그러나 여기에는 별다른 딸깍이 있는게 아니고

- **당분간 사용할 에셋들**을 전부, 정적 파일이든 CDN에서 원격으로 받아오는 이미지든, 모두 리스트업
- 에셋들을 **미리 서버에서 가져와 브라우저 메모리에** 올린다. (`fetch` -> `blob` -> `createObjectUrl(blob)`)
- 각 애셋마다 생성한 `objectUrl`들을 value로, key는 원본 url로 하여, Map객체에 넣어두고 꺼내 쓴다.

이런 과정을 모두 구현하고, 특히 React 라이프사이클에서 편하게 쓸 수 있도록 구현해야 합니다.  
이번 글은 이러한 **에셋 프리로딩**을 구현한 과정을 다룹니다.

# 데이터를 미리 갖고있으려면?

고려해야 하는 리소스는 이미지, 사운드 등 여러 유형이 있지만, 이미지만 생각해봅시다.  
웹 브라우저에서 이미지를 보여줄 때는 `<img src="foo.png">`처럼 하기 마련입니다  
이 `<img src="foo.png">`는 네트워크 요청을 시작하고, `foo.png`에서 데이터를 받아오고, 화면에 보여줍니다.

![이미지 네트워크 요청](https://i.imgur.com/vk5PaVT.png)

`<img>`로 이미지를 받아오는 것은 "화면에 보여준다"를 전제로 합니다.

## fetch -> blob

화면에 보여주지 않을건데 이미지가 궁금하면 `fetch()`해봅니다.

```ts
const res = await fetch("foo.png");
const fooBlob = await res.blob();
```

받아온 결과물을 **Blob**으로 변환했습니다.  
[blob](https://developer.mozilla.org/ko/docs/Web/API/Blob)은 파일 같은 것들을 불변 바이너리 데이터로 나타낸 객체입니다.

## blob -> objectUrl

이 blob 객체 자체는 데이터와 그 데이터 타입(MIME Type), 사이즈 정도의 정보만 가집니다.  
또한 **blob 객체의 데이터는 밀봉**되어있어서, 이 상태로는 읽거나 수정할 수 없습니다.  
이 blob 객체를 `<img>`에 src로 넣고 싶어지면, **objectUrl**을 발급해줍니다.

```tsx
const fooObjectUrl = URL.createObjectUrl(fooBlob);
<img src={fooObjectUrl}>
```

`createObjectUrl`은 blob 그 데이터에 **접근할 수 있도록 허용된 키를 발급**합니다.  
이 키는 `blob:https://sugnpaks.github.io/...`와 같이 url처럼 생겼습니다.  
이제 앞으로 이 키(objectUrl)를 url대신 보여주면 브라우저 메모리로부터 데이터를 받을 수 있습니다.

이제 objectUrl을 사용하면 네트워크 요청을 갔다오지 않고,  
**메모리에서 바로 꺼낼 수 있으므로 요청 갭이 거의 1ms 수준**이 되어버립니다.  
물건 가지러 집까지 갔다올 필요 없이 주머니에서 꺼내는 셈입니다. 마치 **캐싱(caching)** 같네요!

<figure>

![url 네트워크 요청 vs. objectUrl 메모리에서 꺼내기](https://i.imgur.com/XRVKMxZ.png)

<figcaption>

이미지 url로 네트워크 요청 (좌) -> 약 351ms(네트워크 상황과 용량 등에 따라 변동),  
objectUrl로 메모리에서 꺼냄 (우) -> 약 1ms

</figcaption>
</figure>

주의할 점은 이 때부터 키에 대한 책임이 생깁니다.  
그 키에 대한 데이터가 **더 이상 필요없다면 폐기**해야 **메모리 누수를 방지**할 수 있습니다.  
다만 탭을 닫거나 새로고침할 때는 알아서 정리되니 (데이터를 저장한 보관함 자체가 없어짐) 그거까진 신경쓰지 않아도 됩니다.

## objectUrl -> decoding?

이제 url에 네트워크 요청해서 받아오는 것보다 objectUrl을 만들어두어  
마치 캐싱하듯이 아주 빨라질 수 있음을 보았는데요  
여기서 _"메모리를 더 많이 쓰는 대신 리소스를 진짜 바로 사용할 수 있다"_ 는 속박을 걸 수도 있습니다.

아까 살펴본 objectUrl, 그리고 이것으로 접근할 수 있는 blob데이터는 아직 포장된 상태입니다  
이것을 사용하려면 포장을 뜯는 과정이 필요한데 이것을 **디코딩(Decoding)** 이라고 부릅니다.  
예를 들어, 이미지는 아래와 같이 디코딩해둘 수 있습니다.

```ts
const img = new Image();
img.src = objectUrl;
await img.decode();
```

이제 사용할 때는 그냥 다시 objectUrl을 src로 넣으면 되는데,  
디코딩된 데이터가 이미 objectUrl과 매핑된 채로 메모리 캐시에 올라가있기 때문입니다.

```tsx
<img src={objectUrl} />
```

이렇게 디코딩까지 미리 해두었다면 이미지를 새로 넣을 타이밍에 **지연은 이론상 거의 0**에 가까워질 수 있습니다.  
그러나 이건 좀 **트레이드 오프**가 클 수 있어서 잘 결정하고 설계해야 하는데  
미리 압축을 풀어두는 거라서, **메모리 부담**이 매우 커집니다.

예를 들어 제가 1920x1080 이미지를 하나 랜덤픽해서 보니까 530KB였는데요  
이걸 만약 디코딩하여 비트맵으로 미리 만들어둔다고 해봅시다.  
비트맵 한 픽셀 당 4byte(rgba 하나씩 0~255 1byte 사용)이라고 생각해서 계산하면  
1920x1080x4 = 8MB를 넘어버립니다.

<figure>

![커지기 전후 비교 짤](https://i.imgur.com/Hpx5nnr.png)

<figcaption>

사진 출처 [SBS 뉴스](https://news.sbs.co.kr/news/endPage.do?news_id=N1002328322)

</figcaption>
</figure>

그러니 만약 디코딩까지 해서 캐싱한다면 정말 **곧 필요한 리소스**만 추려야겠습니다.  
또는 중요도를 나누거나, 등 세부적인 캐싱 전략을 잘 세워야 할 것 같아요

또 하나 디코딩까지 해서 관리하는 경우 귀찮아지는 점은,  
오디오 파일은 디코딩 후 objectUrl이 아닌  
디코딩 결과로 받은 arrayBuffer를 저장해두고 사용해야 한다는 점입니다

```ts
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const arrayBuffer = await blob.arrayBuffer();
const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
```

이런 식으로 **리소스 유형들을 한번에 objectUrl로 통일하여 관리할 수 없으므로**,  
관리포인트가 늘어난다는 점이 귀찮을 수도 있습니다.

## 오디오 파일은 decode까지, 이미지 파일은 objectUrl

디코딩까지 하면 정말 지연 없이 리소스를 사용할 수 있다는 점이 좋지만  
위에서 살펴봤던 그 속박의 단점으로 메모리 사용량이 크게 늘어난다는 점이 부담이었습니다.

이로 인해 **이미지들은 디코딩하지 않고 objectUrl**까지만 가기로 했습니다.  
사용되는 이미지가 꽤 많아서 디코딩까지 해둔다면 생각보다 큰 부담이 될 것 같다고 생각해서입니다.  
물론 사용처를 분류하고, 그에 따른 캐싱 전략을 잘 설계하여 이것을 컨트롤할 수도 있지만,  
이 작업을 할 때에는 이미 거기에 쏟을 시간적 여유가 없는 상태였습니다 ㅠㅠ

![씁, 어쩔 수 없지](https://i.imgur.com/FPrgjUM.png)

나중엔 게임 단계별로 사용되는 이미지들을 미리 분류해두고,  
이에 따라 로딩화면을 차등적으로 지나게 한다면,  
여기에 디코딩까지 추가하여 완전해질 수 있도록 개선할 수 있어보이네요

오디오의 경우, **BGM은 프리로딩하지 않고, 효과음만 프리로드**합니다.  
게다가 **효과음은 디코딩까지 선행**해두기로 했습니다.  
효과음은 매우 짧기 마련이고, 종류도 많지 않아서(5~10개) 큰 부담이 되지 않을거라 생각했어요  
또한 바빠지기 전에 GPT 5 Codex랑 범용 사운드 모듈을 만들어뒀었는데  
이 때 preload를 디코딩까지 다 포함해 구현해뒀어서 추가 작업이 필요없었습니다.

# 구현하기

이제부터 **리소스 목록을 가져다 미리 로딩**하고  
이를 **objectUrl로 저장**하며  
**저장소에서 objectUrl을 편하게 꺼내 쓸 수 있도록** 구현하고자 합니다.

## assetStore (with Zustand)

프리로드한 에셋들을 objectUrl형태로 저장하는 저장소를 만들건데요  
어디서든 글로벌 스코프에서 사용해야 하므로 zustand store로 구현해봅니다.

```tsx
import { create } from "zustand";

type AssetStatus = "idle" | "loading" | "loaded" | "error";
interface AssetEntry {
  status: AssetStatus;
  blob?: Blob;
  objectUrl?: string;
  error?: string;
}
interface AssetState {
  entries: Map<string, AssetEntry>;
  setLoading: (url: string) => void;
  setLoaded: (url: string, blob: Blob, objectUrl: string) => void;
  setError: (url: string, error: string) => void;
  getObjectUrl: (url: string) => string | undefined;
  revoke: (url: string) => void;
  revokeAll: () => void;
  getObjectUrl: (url: string) => string | undefined;
}

export const useAssetStore = create<AssetState>((set, get) => ({
  entries: new Map(),
  setLoading: url =>
    set(s => {
      const next = new Map(s.entries);
      next.set(url, { status: "loading" });
      return { entries: next };
    }),
  setLoaded: (url, blob, objectUrl) =>
    set(s => {
      const next = new Map(s.entries);
      next.set(url, { status: "loaded", blob, objectUrl });
      return { entries: next };
    }),
  setError: (url, error) =>
    set(s => {
      const next = new Map(s.entries);
      next.set(url, { status: "error", error });
      return { entries: next };
    }),
  revoke: url =>
    set(s => {
      const next = new Map(s.entries);
      const e = next.get(url);
      if (e?.objectUrl) URL.revokeObjectURL(e.objectUrl);
      next.delete(url);
      return { entries: next };
    }),
  revokeAll: () =>
    set(s => {
      for (const [, e] of s.entries)
        if (e.objectUrl) URL.revokeObjectURL(e.objectUrl);
      return { entries: new Map() };
    }),
  getObjectUrl: url => get().entries.get(url)?.objectUrl || url
}));
```

- 에셋들을 Map 객체에 key-value쌍으로 저장합니다.
  - key는 원본 url입니다.
  - value에는 objectUrl, blob(혹시 또 쓸 데가 있을 수도), status 등의 값들을 유지합니다.
- 로딩을 시작할 때 `setLoading(url)`로 "이 url은 현재 로딩중"표시합니다.
- 로딩이 끝났다면 `setLoaded(url, blob, objectUrl)`로 "로딩 완료" + "objectUrl/blob을 저장"합니다.
- 특정 url, 또는 모든 url을 메모리에서 폐기(revoke)하는 메서드도 만들어둡니다.
- url에 대응하는 objectUrl을 얻는 `getObjectUrl`메서드를 만들어 값에 접근할 수 있게 합니다.
  - 만약 해당 url이 캐싱되지 않았어도(objectUrl이 없어도) url을 그대로 반환합니다.

이렇게 해서 에셋 캐싱 저장소가 만들어졌습니다.

## usePreloadAsset

이제 url들을 프리로딩하고 objectUrl을 뽑아서, `assetStore`에 차곡차곡 넣어봅시다.

```ts
import { useEffect } from "react";
import { useAssetStore } from "./assetStore";

interface Options {
  concurrency?: number;
  onProgress?: (done: number, total: number) => void;
  signal?: AbortSignal;
  requestInit?: RequestInit;
}

/**
 * @description urls를 미리 받아 Blob/ObjectURL로 스토어에 저장
 * @param urls 미리 받을 파일 경로 배열
 * @param opts 옵션
 */
export function usePreloadAssets(urls: string[], opts: Options = {}) {
  const { setLoading, setLoaded, setError, entries } = useAssetStore();
  const { concurrency = 4, onProgress, signal, requestInit } = opts;

  useEffect(() => {
    if (!urls?.length) return;
    const uniq = Array.from(new Set(urls));
    const pending = uniq.filter(u => entries.get(u)?.status !== "loaded");

    if (!pending.length) return;

    let done = 0;
    let aborted = false;
    const ac = new AbortController();
    const sig = signal ?? ac.signal;

    const run = async () => {
      const queue = pending.slice();
      const workers = Array.from(
        { length: Math.min(concurrency, queue.length) },
        async () => {
          while (!aborted && queue.length) {
            const url = queue.shift()!;
            try {
              setLoading(url);
              const res = await fetch(url, {
                signal: sig,
                ...requestInit
              });
              if (!res.ok) throw new Error(`HTTP ${res.status}`);
              const blob = await res.blob();
              const objectUrl = URL.createObjectURL(blob);
              setLoaded(url, blob, objectUrl);
            } catch (e: unknown) {
              const error = e as Error;
              if (error?.name !== "AbortError")
                setError(url, error?.message ?? "fetch failed");
            } finally {
              done += 1;
              onProgress?.(done, pending.length);
            }
          }
        }
      );
      await Promise.all(workers);
    };

    run();
    return () => {
      aborted = true;
      ac.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(urls)]);
}
```

- url 배열을 받아서, 중복을 제거하고 pending배열을 만듭니다. 이제부터 pending배열에 있는 url모두를 preload
- concurrency(동시성)옵션에서 지정한 만큼 워커를 만들고 병렬처리합니다.
  - 각 워커들은 pending을 복사한 배열 queue에서 url을 꺼내 처리
  - 각 url을 fetch -> blob -> objectUrl
- `AbortController`를 두어, cleanup에서 네트워크 요청이 정리될 수 있게 준비
  - 또는 외부에서 `signal`을 옵션으로 전달받아 외부에서 중단 가능
- `done++`, `onProgress(done, pending.length)`로 "100개 중 15개 완료"처럼 표시할 수 있습니다.
- 의존성은 url의 실제 내용이 변해야만 반응하도록 stringify로 잡았고, 옵션은 처음 옵션에서 바뀌지 않는다고 생각했습니다.

## 오디오 파일 preload

오디오 시스템을 관장하는 싱글톤 클래스가 이미 있었는데요

```ts
export class AudioManager {
  private static instance: AudioManager | undefined;
  ...
}
```

대충 이렇게 생겼고, 여기에 BGM과 사운드의 채널 분리, 플레이와 전환 등의 메서드 등등을 포함합니다.  
또한 버퍼 캐시 해시맵도 포함하고 있고, 아래와 같이 `preload`라는 메서드가 구현됩니다.

```ts
async preload(url: string): Promise<AudioBuffer> {
  if (this.bufferCache.has(url)) {
    return this.bufferCache.get(url)!;
  }
  if (this.loadingBuffers.has(url)) {
    return this.loadingBuffers.get(url)!;
  }

  const job = (async () => {
    const response = await fetch(url, { mode: 'cors' });
    if (!response.ok) {
      throw new Error(`Failed to fetch audio: ${url}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await this.ctx.decodeAudioData(arrayBuffer.slice(0));
    this.bufferCache.set(url, audioBuffer);
    this.loadingBuffers.delete(url);
    return audioBuffer;
  })().catch(error => {
    this.loadingBuffers.delete(url);
    console.error(error);
    throw error;
  });

  this.loadingBuffers.set(url, job);
  return job;
}
```

1. url들을 가져다가 fetch하고, 이번엔 arrayBuffer로 변환합니다.
2. `ctx.decodeAudioData`로 arrayBuffer를 디코딩합니다. 이렇게 디코딩되면 바로 재생가능한 상태가 됩니다.
3. 나중에 어떤 url을 재생하는 메서드를 실행할 때, 여기에 있으면 그대로 가져다 사용하고 없으면 위 로딩 과정을 거쳐 재생합니다.

## 활용하기

이제 로딩 화면에서, 이렇게 한 줄만 추가하면 에셋 프리로딩을 시작합니다.

```ts
// assets = ["foo.cdn.com/1.png", "foo.cdn.com/2.webp", ..]
usePreloadAssets(assets, {});
```

주로 이미지들은 cdn에 등록되어 있으므로,  
백엔드에 **cdn 리소스 목록을 반환**하는 엔드포인트를 요청했습니다.  
지금은 이게 그냥 문자열의 배열인데, 게임 단계별로 분류되게 개선하거나  
에셋들에 우선순위를 표시하도록 개선하거나, 하면 효율적이겠네요.

로딩률은 아래와 같이 계산하면 될 것 같은데요

```ts
const assetEntries = useAssetStore(useShallow(state => state.entries));
const total = assets.length;
const loaded = Array.from(assetEntries.values()).filter(
  entry => entry.status === "loaded"
).length;
const progressPercent = (loaded / total) * 100;
```

생각해보면 assetStore의 헬퍼함수로 넣어버려도 괜찮을 듯.

이제 이미지를 사용할 때는요

```tsx
const { itemName, itemImageUrl } = item;
const getObjectUrl = useAssetStore(getObjectUrlSelector);

return <img alt={itemName} src={getObjectUrl(itemImageUrl)} />;
```

아주 쉽네요  
`itemImageUrl`이 캐시되지 않아 objectUrl이 없는 경우라도  
url 그대로 들어가기때문에 따로 신경쓸 필요가 없습니다.

# 끝

이렇게 완성한 로딩화면을 게임 시작 시 지나게 하고  
objectUrl을 사용하도록 적용하면 확실히 나아집니다.

![프리로딩/캐싱으로 부드럽게 전환](https://i.imgur.com/JSlr3BK.gif)

이만 마칩니다.
