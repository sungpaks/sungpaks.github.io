---
title: "FSD Layer 의존성 규칙과 경로 별칭 설정하기"
date: 2025-12-27 20:24:43
description: "팀에서 정한 FSD룰을 더 엄격하게 지켜봐요"
tag: ["TIL", "ESLint", "Vite", "Development"]
---

> ! 주의 : TIL 게시글입니다. 다듬지 않고 올리거나 기록을 통째로 복붙했을 수 있는 뒷고기 포스팅입니다.

이 글에서는 [내 팀에 맞는 FSD 기반 폴더구조에 대한 고민과 경험을 이야기한 글](/customized-feature-sliced-design-architecture-for-my-team)에서 언급한, **ESLint 룰로 Layer 의존성 규칙 설정**과 **경로 별칭 설정**에 대한 실제 설정코드와 트러블 슈팅을 기록합니다.

# ESLint Rule로 Layer 의존성 규칙 강제하기

`eslint-plugin-boundaries` 플러그인을 준비합니다

```bash
npm install -D eslint-plugin-boundaries
```

```js
//eslint.config.js
import boundaries from 'eslint-plugin-boundaries';

export default tseslint.config([
  {
    ignores: []
  },
  {
    ...
    plugins: {
      ...
      boundaries,
    },
  }
])
```

이제 eslint config에서 `settings`를 다음과 같이 작성하여 각 Layer들을 `elements-type`으로 각각 정의합니다.

```js

export default tseslint.config([
  ...
  {
    settings: {
      // 레이어 정의
      'boundaries/elements': [
        { type: 'app', pattern: 'src/app/**' },
        { type: 'processes', pattern: 'src/processes/**' },
        { type: 'features', pattern: 'src/features/**' },
        { type: 'shared', pattern: 'src/shared/**' },
        { type: 'config', pattern: 'src/config/**' },
      ],
    },
  }
```

이제 `rules`를 다음과 같이 작성해주면!!

```js
export default tseslint.config([
  ...
  {
    settings: ...
    rules: {
      'boundaries/element-types': [
        'error',
        {
          default: 'disallow',
          rules: [
            {
              from: 'app',
              allow: [
                'processes',
                'features',
                'shared',
                'config',
                'api',
              ],
            },
            {
              from: 'processes',
              allow: ['features', 'shared', 'config', 'api'],
            },
            {
              from: 'features',
              allow: ['shared', 'config', 'api'],
            },

            { from: 'shared', allow: ['api', 'config'] },

            { from: 'api', allow: ['config'] },
          ],
        },
      ],
```

- `default: 'disallow'`로 기본적으로 금지하고, 허용할 의존성 관계만 `allow`합니다.
  - `app → processes → features → shared` 방향으로만 접근이 가능하도록 작성합니다.
  - `features → features`같은, 동일 Layer의 다른 Slice 끼리 의존 또한 막습니다
- env 등 configuration 관련 코드가 있는 `config/` Layer는 읽기 전용으로 어디서든 참조할 수 있도록 합니다.

이제 예를 들어, `app`하위 파일을 `features`가 import하려고 시도하면, 아래와 같이 Lint에러가 발생합니다.

![features -> app 린트에러 예시](https://i.imgur.com/TjcQzRh.png)

![거부](https://i.imgur.com/k10fCju.png)

# 경로 별칭 설정하기

`eslint-plugin-import`라는 ESLint 플러그인을 하나 더 설치하고,  
`eslint.config.js`에서 아까 직전에 설치했던 `boundaries` 밑에 추가해줍시다.

```bash
npm install -D eslint-plugin-import
```

```js
//eslint.config.js
import boundaries from 'eslint-plugin-boundaries';
import eslintPluginImport from 'eslint-plugin-import';

export default tseslint.config([
  {
    ignores: []
  },
  {
    ...
    plugins: {
      ...
      boundaries,
      import: eslintPluginImport,
    },
    settings: {
      // 레이어 정의
      'boundaries/elements': ...,
      // 경로 별칭
      'import/resolver': {
        typescript: { project: ['./tsconfig.json'] },
        node: { extensions: ['.js', '.jsx', '.ts', '.tsx'] },
      },
    },
  }
])
```

`tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`에 다음과 같이 설정해줬습니다

```json
{
  ...,
  "compilerOptions": {
    "paths": {
      "@app/*": ["./src/app/*"],
      "@processes/*": ["./src/processes/*"],
      "@features/*": ["./src/features/*"],
      "@api/*": ["./src/api/*"],
      "@api": ["./src/api"],
      "@shared/*": ["./src/shared/*"],
      "@config/*": ["./src/config/*"],
      "@entities/*": ["./src/entities/*"]
    }
  }
}
```

또한 `vite.config.ts`에서:

```ts
//vite.config.ts
import { fileURLToPath } from 'node:url';

export default defineConfig({
  ...,
  resolve: {
    alias: {
      '@app': fileURLToPath(new URL('./src/app', import.meta.url)),
      '@processes': fileURLToPath(new URL('./src/processes', import.meta.url)),
      '@features': fileURLToPath(new URL('./src/features', import.meta.url)),
      '@api': fileURLToPath(new URL('./src/api', import.meta.url)),
      '@shared': fileURLToPath(new URL('./src/shared', import.meta.url)),
      '@config': fileURLToPath(new URL('./src/config', import.meta.url)),
      '@entities': fileURLToPath(new URL('./src/entities', import.meta.url)),
    },
  },
});
```

이렇게 하면 이제 아래와 같이 import할 수 있습니다.

```ts
import Foo from "@shared/ui/Foo";
```

# 버그 : `<tsconfigRootDir>` 파싱에러

```
Parsing error: ESLint was configured to run on `<tsconfigRootDir>/src/shared/ui/Button.tsx` using `parserOptions.project`: `<tsconfigRootDir>/tsconfig.json`
```

![tsconfigRootDir 파싱에러](https://i.imgur.com/oRqq6YL.png)

이런 에러가 났었는데요 저는

```js
//eslint.config.js
const __dirname = import.meta.dirname;

export default tseslint.config([
  {},
  {
    ...
    languageOptions: {
      ...
      parserOptions: { project: './tsconfig.json', tsconfigRootDir: __dirname },
    }
  }
])
```

`tsconfigRootDir`를 이렇게 넣어줍시다.

---

\
위 설정들은 팀 프로젝트 내에서 쓰기 위한 정도의 설정 예시입니다.  
당연히 설정은 본인 팀, 본인 프로젝트에 맞게 적절히 쓰시면 되겠습니다  
[FSD 문서](https://feature-sliced.github.io/documentation/kr/docs/get-started/overview#is-it-right-for-me)에서도 언급하듯이 정답은 없습니다
