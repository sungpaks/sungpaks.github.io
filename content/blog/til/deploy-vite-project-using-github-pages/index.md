---
title: "머쓱할 정도로 쉬운, Vite 프로젝트를 Github Page에 배포하는 방법. + Routing 버그 해결"
date: 2025-07-27 23:09:04
description: "블로그 글이랍시고 써올리기도 좀 머쓱할정도"
tag: ["TIL", "Deployment", "Vite"]
---

> ! 주의 : TIL 게시글입니다. 다듬지 않고 올리거나 기록을 통째로 복붙했을 수 있는 뒷고기 포스팅입니다.

지금 후딱 배포해보고 싶은데  
마침 당신의 프로젝트가 **Vite**로 되어있고  
Github 계정과 레포지토리도 준비되어 있다면..  
양치하는 것보다 빠르게 배포 끝낼 수 있습니다.

# Github Action을 추가합니다.

[vite-deploy-demo](https://github.com/sitek94/vite-deploy-demo)라는, 어떤 현인이 올려주신 Github Action을 가져다 씁시다.

먼저 프로젝트 루트를 기준으로, `.github/workflows/deploy.yml` 라는 파일을 만듭니다.  
`.github` 폴더와, `.github/workflows` 폴더 없으면 만드세요

```yml
name: Deploy

on:
  push:
    branches:
      - main

jobs:
  build:
    name: Build
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repo
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4

      - name: Install dependencies
        uses: bahmutov/npm-install@v1

      - name: Build project
        run: npm run build

      - name: Upload production-ready build files
        uses: actions/upload-artifact@v4
        with:
          name: production-files
          path: ./dist

  deploy:
    name: Deploy
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - name: Download artifact
        uses: actions/download-artifact@v4
        with:
          name: production-files
          path: ./dist

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

그리고 이것을 망설임없이 Ctrl+C Ctrl+V합시다.  
이 워크플로우는

- 당신의 vite프로젝트를 빌드하고
- 그 빌드 결과물을 `gh-pages` 브랜치에 푸시해줍니다.

이제 워크플로우 파일을 추가하셨다면

```
git add .
git commit -m '배포 워크플로우 추가'
```

이런 식으로 유식해보이게 커밋을 찍고, `git push origin main`을 하든가 어쩌든가 해서 원격 저장소에 올려줍니다.  
이 워크플로우가 올라가고 나면, github action이 레포지토리의 `Actions` 탭에서 돌아갈텐데

십중팔구 처음에는 실패할것이애요.

![Github Action에게 write권한이 없어서 실패함](https://i.imgur.com/YN524jI.png)

이렇게 뜨면 안심하세요. 당신의 Github Action이 아직 쓰기 권한이 없어서 그럽니다.  
빠르게 레포지토리의 `Settings`로 들어가줍니다.

![Settings - Actions - general 선택](https://i.imgur.com/E21yYvO.png)

왼쪽 탭에서, `Actions > General`을 선택합니다.  
스크롤을 내리면 `Workflow permissions`라고 있는데,  
`Read and write permissions`를 선택해줍니다. 기존에는 `Read repository contents and packages permissions`였을거예요

![Write 권한을 켜기](https://i.imgur.com/SmZcedU.png)

이제 다시 액션을 실행하면 잘 될겁니다

# Github Pages 설정하기

이제 `Settings`에서, `Pages`로 이동합니다.

![Pages로 ㄱㄱ](https://i.imgur.com/3PVMbu1.png)

여기에서, `Build and deployment`를 봅시다

- "Source"는 `Deploy from a branch`
- "Branch"는 `gh-pages`, 디렉토리는 `/(root)`

![](https://i.imgur.com/KVh3oYK.png)

이렇게요. 이제 `Save`하시면 됩니다.  
진짜 끝났어요.  
`<깃허브이름>.github.io/<레포지토리이름>` 으로 들어가시면 배포가 된 모습을 보실 수 있습니다  
[sungpaks.github.io/atomic-slash](https://sungpaks.github.io/atomic-slash) 이런식으로여  
액션이 정상적으로 돌았으면요. 그리고 한 1분정도 기다려야할 수도 있음

# React Router, TanStack Router같은거 쓰시면

## Base Path를 설정하세요.

당신 프로젝트가 진짜 철저한 SPA고 라우팅은 하나도 없으면 이것으로 되었습니다  
근데 라우터를 달고계시거나 한다면 추가적인 설정이 필요할텐데:

- 배포된 URL의 루트는 `foo.github.io/`가 아니라 `foo.github.io/bar` 인데
- 라우터들은 `foo.github.io/bar`를 만나면 기본적으로 "`foo.github.io`의 `/bar` 라우트인가보다! 라고 생각합니다

그래서 `vite.config.js`에 아래와 같은 설정을 해줍시다.

```js
export default defineConfig({
  plugins: [TanStackRouterVite(), viteReact(), tailwindcss()],
  base: "/<repo-name>/", // 이거 추가
```

예를 들어, `foo.github.io/bar`면 `base: "/bar/"` 이렇게요.  
그리고 저같은 경우에는 TanStack Router를 썼었는데, TanStack Query 기준으로는 아래와 같이 `main.tsx`에서 `basepath`를 지정해줍니다.

```tsx
// src/main.tsx
const router = createRouter({
  ...
  basepath: "/micro-state-management-example",
});
```

## 루트 Route가 아닌 경로에서 새로고침하거나 URL로 접근하면 Not Found래요

예를 들어, `foo.github.io/bar/`가 기본 루트고  
`foo.github.io/bar/first-route` 이런 Route가 있을 때  
여기에서 새로고침하거나, URL로 직접 접근하거나, 하면 Not Found가 뜰 수도 있는데  
루트 Route에 방문하지 않고 저런 경로에 접근하면 `index.html`을 받아오지 못해서 그렇습니다

이거 해결도 되게 간단한데 `package.json`에서 빌드 스크립트를 조금 바꿔주면 됩니다.

```json
{
  "scripts": {
    "build": "vite build && tsc && cp dist/index.html dist/404.html"
  }
}
```

이렇게 Vite build할 때, `index.html`을 `404.html`에 덮어쓰게 만들어주면 됩니다

---

\
이게 끝입니다.

![내가 배포한거 1](https://i.imgur.com/AbGV9GJ.png)
![내가 배포한거 2](https://i.imgur.com/UBpu30t.png)

빠르고 간단한 배포가 필요할때 아주 좋아요.
