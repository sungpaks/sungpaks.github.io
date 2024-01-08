---
title: ✒️ 내 동년배들 다 깃허브 블로그 운영한다
date: "2024-01-03T15:30"
description: "Gatsby로 Github 블로그 만들어봤습니다"
slug: building-github-blog-using-gatsby
category: ["Gatsby", "Blog"]
---

여러분 새해 복 많이 받으십시오\
저는 미루고 미뤄왔던 깃허브 블로그를 드디어 만들었습니다\
새해 시작이 좋네요

원래 Jeykll로 한번 시도를 했었는데\
쩝.. Ruby인 것도 맘에 안 들고 어디서 막혔는지 기억도 안 나네요\
대신 React 기반인 Gatsby를 썼습니다

제 지인 블로그인 [여기(klloo 블로그)](https://klloo.github.io/make-blog/)를 좀 참고했는데요..\
질투와 시기심. 그로 인한 동기부여. 가장 큰 도움. 내가 받은.\
설치와 프로젝트 구성 과정은 저 안에 있는 [링크](https://devfoxstar.github.io/web/github-pages-gatsby/)를 많이 참고했습니다.\
감사의 인사 드리며..

## 설치와 프로젝트 생성

링크에 자세한 설명이 있으니 저는 대략적으로만 쓰겠습니다\
설치는 `npm install -g gatsby-cli`\
테마는 [여기에서](https://www.gatsbyjs.com/starters/) 골라보시면 되는데요\
테마를 고르고 해당 깃허브 주소를 가져다가\
`gatsby new 프로젝트명 깃허브URL`\
이런식으로 명령줄을 입력하시면 되겠습니다

근데 저같은 경우\
<img src="https://i.imgur.com/F5qObnj.png" width=100% height=100%/>\
이런 문제가 나타났는데..\
찾아보고 찾아보다가 모르겠어서 테마를 그냥 바꿔봤는데 됐습니다..\
테마의 문제인가?\
아무튼 저는 그냥 그래서 `Gatsby Starter Blog` 테마를 썼습니다.\
쩝.. Gatsby 만든 사람이 만드신 스타터팩인가봅니다

이제 프로젝트 폴더에서 `gatsby develop`을 입력하여 로컬 개발환경을 열고\
브라우저에서 `localhost:8000`에 가면

<img src="https://i.imgur.com/OOqFGw3.png" width=100%/>
이렇게 되어있습니다.

## Github Page와 연동

이제 *(본인의 깃허브 이름).github.io*라는 이름의 레포지토리를 만듭시다.\
전 이미 있어서 그냥\
`git remote add origin REPO_URL` 이런식으로 프로젝트 폴더에 원격 저장소를 연결하고\
쓸데없는 것들이 있었어서.. `--force` 옵션을 붙여서 `push`해주어 덮어씌워버렸습니다

이제 레포지토리의 `master`브랜치에 프로젝트가 올라가있을건데요\
저는 배포를 따로 다른 브랜치에서 하고싶기 때문에 로컬 `deploy` 브랜치를 먼저 생성합니다 : \
`git branch deploy`\
그리고 **package.json** 파일 보시면 맨 아래쪽에 `"scripts"` 룰이 있는데

```json
"scripts": {
    "deploy": "gatsby build && gh-pages -d public -b deploy",
```

이렇게 `deploy`를 추가해줍니다

그런 다음 `npm run deploy` 입력해주면 알아서 배포파일을 만들고 원격 `deploy`브랜치에 올라가기까지 합니다

마지막으로.. Github 레포지토리에서 **Settings** - **pages** - **Build and deployment** 로 가서 브랜치를 deploy로 설정해줍니다\
이렇게 하면 deploy를 기준으로 Github Page를 호스팅해줍니다
<img src="https://i.imgur.com/MGNEGYR.png" width=100%/>

## 초기 작업

### 1. 프로필

지금은 Gatsby 개발해주신 Kyle Methews 선생님께서 인사를 하고계시니까.. 먼저 프로필을 바꿔봅시다?

**bio.js**를 보면 "siteMetadata"를 가져와서 `author`와 `social`을 가져오도록 되어 있다고 친절하게도 주석으로 써주셨습니다.\
따라서 **gatsby-config.js** 파일로 가서 적당히 `Title, author, social` 이런 데이터들을 본인 것으로 바꿔주도록 합시다.

### 2. 폰트

[여기](<https://0andme.github.io/blog/gatsby%EB%A1%9C-%EB%B8%94%EB%A1%9C%EA%B7%B8-%EB%A7%8C%EB%93%A4%EA%B8%B0-(4)-%ED%8F%B0%ED%8A%B8-%EB%B0%94%EA%BE%B8%EA%B8%B0/>)를 좀 참고했습니다.\
이미 Gatsby Starter Blog 테마는 Fontsource를 이용하고 있습니다.\
저는 **IBM** 폰트를 사용하기 위해
`npm install @fontsource/ibm-plex-sans`와 같이 입력하여 받아와서\
**gatsby-browser.js**에 `import "@fontsource/ibm-plex-sans"`라고 써줬습니다.\
그 다음 **style.css**에서 `body { font-family: "ibm-plex-sans"; }`라고 써주면..

<img src="https://i.imgur.com/kPO51P6.png" width=50%>

잘 되네요~

### 3. 상단바

그 왜 있잖아요 상단에 고정되어서 따라다니는데 반투명하고
버튼같은거 있어서 블로그 홈으로 가거나 그럴 수 있는 상단 메뉴 UI\
그런거를 만들어보겠습니다\
이미 테마에서 스타일이 많이 적용되어있고 `wrapper`스타일도 존재하니 적당히 살펴보고 겹치지 않게 잘 해주도록 합시다

일단 `TopUI` 컴포넌트를 만들어주고

```js
<div className="top-ui">
   {" "}
  <h4>
        <Link to="/">성훈 블로그</Link> {" "}
  </h4>
</div>
```

저는 대충 이런식으로 썼습니다\
고맙게도 `Link`컴포넌트가 이미 있는데요\
`to="/"`와 같이 쓰면 블로그 홈으로 가도록 해줄 수 있네요

이제 이 컴포넌트를 이미 있는 **layout.js**의 `Layout` 컴포넌트에서 함께 뱉어내도록 합시다\
이미 최상위 `div`가 `global-wrapper`스타일로 적용되어있는데요\
이 스타일에 구애받지 않고 따로 `top-ui` 스타일을 만들어주고 싶으니 이 `div`의 바깥에 작성하고 새로운 `div`로 감싸줬습니다
<img src="https://i.imgur.com/0HjPPVL.png" width=100%/>

이제 **style.css**에 가서 스타일 클래스를 만들어줍시다\
`.top-ui {}`와 같이 쓰고 이 안에다 CSS style을 작성하면 되겠습니다\
상단에 고정할거니까 `position: fixed`라고 쓰고\
투명도를 조절하려면 `opacity`\
가 아닌.. 배경색만 반투명하게 하고싶으니\ `background-color`를 `rgba(255,255,255,0.8)`와 같이 써줍니다.\
`width: 100%`라고 적어주고 적당히 높이와 여백을 써주면??
<img src="https://i.imgur.com/Um9EDUg.png" width=100%/>
좋네요 나중에 적당히 다른 버튼들을 만들어주면 있어보일 것 같습니다

## 글 작성하기

블로그라면 응당 글을 써야겠죠?\
프로젝트 폴더에 보면 **content/blog** 밑에 이미 세 개의 글이 기본적으로 있습니다.\
이거 다 지워주고..\
새 글을 쓰려면 폴더를 하나 만들고 그 밑에 마크다운 파일을 생성하여 여기에 글을 작성합니다. 이미지같은거 넣으려면 또한 같이 넣으시구요.\
이런식으로

<img src="https://i.imgur.com/uZfUuLc.png" width=100%/>

글의 제목과 날짜, 설명은
마크다운 파일 가장 상단에

```
---
title: 내 동년배들 다 깃허브 블로그 운영한다
date: "2024-01-03T15:30"
description: "Gatsby로 Github 블로그 만들어봤습니다"
---
```

이렇게 쓰시면 알아서 아래와 같이 됩니다
<img src="https://i.imgur.com/oVOck6K.png" width=100%/>

쩝.. 이정도면 준비는 얼추 된 것 같네요.
스타일도 좀 만지고 완성도도 높이고 하는건 천천히 하겠습니다
이만 마칩니다
