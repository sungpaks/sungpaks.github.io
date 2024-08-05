---
title: "📡 Vercel과 함께라면 배포도 두렵지 않아"
date: 2024-08-06 01:14:12
description: "이번엔 진짜 5초컷입니다"
tag: ["Deployment", "React"]
---

새로운 프로젝트를 개발하게 되었는데요  
응당 개발 후에는 배포를 해야겠죠?

지금 배포하려는 프로젝트는  
백엔드(Spring) + 프론트엔드(React)같은 국룰적인 조합이고  
프론트엔드에서 빌드 도구로 **Vite**를 사용했습니다  
매우 편하게도 백엔드는 이미 CI/CD 배포환경울 구축해놔서  
개발할 때도 배포된 백엔드 주소에 접근하면 되었습니다

이제 프론트엔드까지 배포할 시간이 되었는데  
**Vite** 공식 사이트를 보면 [빌드](https://vitejs.dev/guide/build)와 [배포](https://vitejs.dev/guide/static-deploy)가이드가 잘 되어 있습니다

저는 이 중에서도  
Vercel 배포가 해보고 싶었기도 하고  
적당히 빠르고 쉽게 할 수 있을 것 같고  
도메인 고민도 없이 그냥 `myProject.vercel.app` 이렇게 해버릴 수 있어서  
Vercel 배포를 하기로 마음먹었습니다.

![레츠고](image.png)

그만 떠들고 가봅시다.

# Vercel에서 배포해요

Vercel은 정적 사이트 배포를 쉽게 지원해줍니다  
마치 럭키 Github Pages인데요  
제 목표는 (1) 먼저 프론트엔드 프로젝트를 빌드해서 정적 파일들로 만들고  
(2) 이걸 Vercel에 호스팅하고, (3) 백엔드 작업은 원래 배포되어 있던 백엔드 서버에 다녀오게끔 하기  
입니다.

Vercel사이트에 들어가서 먼저 회원가입을 해주고, 로그인합시다  
이후 Github 연결하고, 레포지토리를 import합시다

![](https://i.imgur.com/JxUEFuX.png)

이렇게요  
근데 저는 별도 organization의 레포지토리를 배포하고 싶었던 건데  
이렇게 하려면 프로여야 한다고 하네요  
전 아마추어니까 fork떠서 여기를 배포해줍시다

![](https://i.imgur.com/jWgyMtM.png)

그럼 이런 화면으로 오는데  
딱히 건들 것은 없네요.. 적당히 괜찮으면 넘어가줍시다  
아 환경변수가 있었으면 잘 paste해주도록 합시다(`.env` 이런 데 있는 애들)

![](https://i.imgur.com/482IiZu.png)

??

![](https://i.imgur.com/92wwXmN.png)

끝났네요?

![해치웠나](image-1.png)

마칩니다.

# 404

이렇게 끝나면 말이 안 됩니다  
들어가보니 모든 api 호출이 404에러를 띄우네요

이건 결론부터 이야기하면

```json
//vercel.json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/" }]
}
```

프로젝트 루트 경로에 `vercel.json`파일을 만들고, 이렇게 써줍니다.  
출처와 근거가 확실하지 않지만.. 제가 알기로는?

이게 `vite`는 애초에 SPA 빌드 툴이기에 경로란게 사실 존재하지 않습니다  
제가 프로젝트에서 클라이언트 사이드에서 경로를 넣기 위해 React Router를 사용했지만  
이것도 가짜 경로를 만든거에 불과한 것인데  
vercel 배포는 정적 사이트 배포라서, 경로를 찾습니다  
여기서 간극이 발생하는데 이를 `rewrite`로 `/` 경로만 참조하게 덮어줍니다.

그럴싸한가요? 사실 맞는 소리인지 잘 모르겠어요.. 나중에 뭔가 발견하면 찾아오겠습니다.

# 405

![](https://i.imgur.com/dNkFNCr.png)

그 다음은 405 에러가 뜹니다  
음.. 진정하고 보니까 api의 `BASE_URL`이 프론트네요? 백으로 가야하는데..

알아보다가 [vite 환경변수와 모드](https://ko.vitejs.dev/guide/env-and-mode)이런 것도 한번 보고 그랬지만

그냥 아까 `rewrite` 작성했던 `vercel.json`에 새로 아래 내용을 추가하면 됩니다

```json
{
  "source": "/api/:path*",
  "destination": "http://백엔드_서버_IP/:path*"
}
```

백엔드로 보내는 api요청은 `/api/`를 붙여서 가는데  
그러니 이 `/api/`로 시작하는 애들은 전부 가로채서  
백엔드 서버로 가는 요청으로 바꿔치기 해줍니다.

![바꿔치기](image-2.png)

퍼엉~

저는 이렇게 하니까 잘 됐습니다

# 마치며

저는 클라우드나.. 데브옵스나.. 이런거 잘 모르고 너무 어려운데  
Vercel 선생님 덕분에 편하게 끝냈네요

![easy](image-3.png)

이만 마칩니다.
