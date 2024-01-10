---
title: 🔌옵시디언 플러그인 개발 이렇게 시작해보세요
date: "2024-01-07T21:45"
description: "옵시디언 플러그인 간단한거 하나 만들어봤습니다."
tag: ["Obsidian", "TypeScript"]
---

여러분은 노트 앱 뭐쓰시나요\
보통 노션 자주들 쓰시는데.. 저도 노션 썼었지만\
~~힙해보여서~~ 여러 이유로 옵시디언으로 갈아탄지 6개월? 됐습니다

블로그를 쓸 때도 어차피 블로그 글도 마크다운이니까\
옵시디언에 어느정도 써놓고 거의 그대로 옮기다시피 할 때도 많습니다.

그런데 불편한 점이 하나 있다면\
옵시디언은 이미지를 붙여넣으면 로컬 이미지파일을 새로 생성하고 `![[image.png]]` 이렇게 붙여넣습니다.\
이건 그냥 커뮤니티 플러그인인 imgur 플러그인을 씁니다\
이 친구는 `imgur.com`에 이미지를 업로드해주고 그 URL로 `![](URL)` 이렇게 붙여넣어주는 고마운 친구입니다\
이러면 로컬에 계속 이미지들이 주르륵 존재할 필요도 없고 편하죠

그런데 깃허브블로그를 시작하면서 느낀 문제점은..\
이렇게 `![](URL)` 형태로 붙여넣으면 크기 조절이 안 되기도 하고\
현재 브라우저의 폭 따위는 신경쓰지 않고 원본 크기로 존재하기 때문에\
가로 스크롤 바가 생겨버려서 매우 열받는 점이 있습니다

아무튼.. 그런 이유로 `![](URL)` 형태를 `<img src="URL"/>` 이렇게 바꿔서\
사이즈나 여타 옵션같은걸 마음대로 넣고 싶은데\
저렇게 이미지 태그로 바꾸는 과정이 상당히 귀찮습니다..\
그래서 버튼 하나로 저걸 모두 이미지태그로 바꿔주는 플러그인을 만들어버리자!\
라는 생각을 해서.. 실제로 만들어봤습니다.

# 시작하기

[이 블로그 글](https://steemit.com/hive-137029/@anpigon/started-obsidian-plugin-development)을 참고했습니다. 감사합니다 \_ \_

링크에 아주 친절한 설명이 잘 나와있습니다

일단 꼭!! 다른 새로운 Vault를 생성하고 거기서 작업하도록 합시다

가장 먼저..\
기본적으로 Obsidian에서 제공하는 Example Plugin Template이 있습니다\
이걸 이용해 새 플러그인 레포지토리를 만들고,\
옵시디언 Vault의 `yourVault/.obsidian/plugin` 경로로 들어가서\
방금 만든 레포지토리를 클론합니다\
레포지토리 이름은, `obsidian-`으로 시작하는게 국룰인 것 같으니 따라해줍시다

그럼 이제 클론받은 폴더로 이동해서\
`npm i`로 의존성을 설치하고, `npm run dev`로 코드를 빌드합니다\
이제 옵시디언에서 설정->커뮤니티 플러그인->(먼저 커뮤니티 플러그인 사용을 활성화하고)->하단에 설치된 플러그인에서 새로고침을 누릅니다.\
이제 등장한 `Sample Plugin`을 활성화합니다\
<img src="https://i.imgur.com/WpFrrnP.png" alt loading="lazy" width=100% height=100%/>

이제 `manifest.json` 파일을 수정하여 `id`, `name`같은걸 적당히 바꿔보시고 진행하시면 됩니다..\
그리고 마지막에 나오는 `hot-reload`플러그인 받아서 켜놓고 하면 확실히 편합니다.\
링크에서 설명을 잘 해주셔서 세팅은 이정도로 하겠습니다

# 어떻게 개발합니까?

Obsidian Plugin 공식 Docs에서는 `main.ts` 또는 새로운 `.ts`파일을 만들어서 코드를 작성하라고 합니다.\
`main.js`에는 뭔가 작성하지 마세요.\
`main.ts`에 작성된 내용이 이곳에 자동으로 컴파일됩니다.

맞다! `npm run dev` 켜놓으셨죠?\
<img src="https://i.imgur.com/sX7r9nP.png" alt loading="lazy" width=100% height=100%/>\
대충 이런 상태여야 합니다

이제 `main.ts` 열어봅시다\
<img src="https://i.imgur.com/MHKQyIf.png" alt loading="lazy" width=100% height=100%/>\
뭐가 많네요... 쩝\
`const ribbonIconEl` 밑에 마우스 이벤트가 정의되어 있으니 여기를 한번 수정해볼까요??\
<img src="https://i.imgur.com/lMoVNKl.png" alt loading="lazy" width=100% height=100%/>
이렇게 바꿔봅시다\
저장하고 왼쪽 사이드바의 주사위모양 아이콘을 눌러봅시다\
<img src="https://i.imgur.com/UAIBAsX.png" alt loading="lazy" width=70% height=auto/>\
이거 눌러보면.. 짜잔\
<img src="https://i.imgur.com/Mff2C1t.png" alt loading="lazy" width=50% height=auto/>\
귀여운 Notice가 뜹니다!

오.. 그러면 저 부분을 적당히 작성하면 버튼 한번으로 전부 `<img>` 태그로 바꿔버릴 수 있겠죠??

# 데이터에 접근하기

그럼 이제 데이터를 가져오는 법이 궁금합니다?\
데이터를 가져와야 현재 열린 파일에서 `![]()`만 쏙 뽑아서 그 URL 그대로 `<img>`태그로 변환할 수 있겠죠?

처음엔 이게 제가 못 찾은건지.. 대충써놓은건지.. 잘 못찾다가\
[여기](https://forum.obsidian.md/t/how-to-get-current-file-content-without-yaml-frontmatter/26197)에서 데이터에 접근하는 적절한 방법을 찾을 수 있었습니다

일단 현재 앱에서 열린 워크스페이스를 가져오려면\
`this.app.workspace` 객체를 가져옵니다.\
만약 .. 현재 열린 파일을 가져오려면 `this.app.workspace.getActiveFile();` 이런식이겠고,\
현재 활성화된 에디터 객체는 `this.app.workspace.activeEditor.editor`로 가져올 수 있습니다.\
이 에디터 객체를 `const editor`로 유지해두고\
`editor.getDoc().getValue()`를 메소드를 사용하여 출력해보면..

```typescript
const f = this.app.workspace.getActiveFile()
const editor = this.app.workspace.activeEditor?.editor
if (editor !== undefined) {
  new Notice(editor.getDoc().getValue())
}
```

<img src="https://i.imgur.com/3VrfWm3.png" alt loading="lazy" width=100% height=auto/>\
오호...\
이제 값을 잘 변화시킬 수도 있는지 보기 위해\
`editor.getDoc().setLine(0, "Hello!!")` 줄을 추가해봅시다.\
`Notice` 밑에 추가하면 먼저 바뀌기 전 값들이 나오고 맨 윗줄이 바뀌어버리겠죠?\
<img src="https://i.imgur.com/tVt3PBH.png" alt loading="lazy" width=100% height=auto/>\
<img src="https://i.imgur.com/Eekqykt.png" alt loading="lazy" width=40% height=auto />\
와우. . 준비가 끝났습니다.

# 구현 ㄱ

흠.. 일단 `replace`나 `match`같은걸 이용해서\
`![](URL)`처럼 생긴 부분을 찾고\
`URL`만 뽑아다가 `<img>`태그를 만들어내면 될 것 같습니다

그럼 일단 정규표현식이 필요한데요\
GPT한테 물어보니\
`const regex = /!\[]\(([^)]+)\)/;`\
이런걸 뱉었습니다.\
이제 이 정규표현식으로 `const matchedStrings = content.match(regexByURL);`과 같이 쓰면\
`matchedStrings[1]`에 제가 원하던 URL이 추출되어있게 됩니다!!

이제 이 URL을 가지고 \
`const imgTag = '<img src="' + url + '" alt loading="lazy" />';`\
이렇게 써준다면 이미지 태그를 완성할 수 있습니다

사이즈나 다른 옵션같은거는 명령어 팔레트로 세팅을 미리 해놓도록 하면 좋겠는데,\
귀찮으니 나중에 또 업데이트하려고 합니다

아무튼.. 근데 그냥 이렇게 만든 `imgTag`를 반환하기에는 앞뒤로 다른 무고한 문자열이 있을 수도 있겠죠?\
`content.replace(regex, imgTag)` 이런식으로 써서 해당 부분만 쏙! 바꿔주도록 합시다\
그리고 한 라인 내에 여러 이미지가 있을 수도 있으니까\
이미지가 있었으면 바뀐 문자열이 나올거고,\
이미지가 없으면 `null`이 반환되도록 한 뒤\
`null`이 반환될 때까지 반복적으로 수행하도록 해줍니다

그럼 .. 짜잔 버튼만 누르면\
<img src="https://i.imgur.com/eAOkQe1.png" alt loading="lazy" width=50% height=auto/>\
이랬던게\
<img src="https://i.imgur.com/cfgIgZC.png" alt loading="lazy" width=100% height=auto/>\
요래 됩니다\
성공적이네요~

# 다른 곳에서 쓰려면

칼은 사용을 해야 칼이겠죠?\
마침 또 작업한건 다른 테스트용 Vault였으니\
이걸 원래 쓰던 Vault에 가져와보도록 합시다

일단 작업한 내용을 github 레포지토리에 푸시하고\
Release를 하나 만듭니다\
Release에는 세 가지 파일을 넣습니다:\
`manifest.json, main.js, style.css`\

이제 이 release된 세 파일을 다른 vault에서 쓰려면\
`yourAnotherVault/.obsidian/plugins`에 새로운 폴더를 만들고\
세 파일을 집어넣으면 됩니다\
이제 커뮤니티 플러그인 -> 설치된 플러그인 -> 새로고침 한번 해주면\
<img src="https://i.imgur.com/GyoeEBZ.png" alt loading="lazy" width=100% height=auto/>\
와 우! 이제 사용하면 됩니다!

깃허브의 obsidian-release 레포지토리에 PR등록하면 커뮤니티 플러그인으로 등록할 수 있는 것 같은데\
이런 너무 단순한 플러그인을 받아줄지? 도 의심스러울 뿐더러\
쫌.. 귀찮아서 나중에 하렵니다

---

<br/>
<br/>

시작할때는 꽤나 막막했는데\
막상 해보니까 별로 한 것도 없어보이네요\
쩝.. 인생이란 원래 그런게 아닐지~

전에 커리어리 눈팅하다가\
개발자 공부하고 취준하고 하는게 너무 막막하다 라는 글에\
원래 개발이라는게 막막하고 시니어도 그렇다. 그 막막함을 직시하는게 중요한 것 같다.\
이런 답변을 본 적 있습니다

저도 뭔가 새로 할 때마다 너무 막막한데\
지나고 보면.. 하면 되는구나 싶습니다\
아무튼 이런 것도 해보고\
재밌네요~

이만 마칩니다
