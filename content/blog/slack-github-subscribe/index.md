---
title: "🖇️ 슬랙에서 깃허브 연동하기"
date: 2024-03-31 13:46:58
description: "깃허브의 이슈나 풀 리퀘스트 등을 슬랙에서 받아봅시다"
tag: ["Slack", "Github"]
---

팀 내 소통을 위한 툴로 슬랙이 요새 인기인 것 같은데요\
보면 볼수록 뭔가 신기하고 편한 기능이 많습니다.\
또한 개발자들은 팀 프로젝트같은 것을 할 때면 깃허브를 빼놓을 수 없죠??\
Organization이나 Repository를 만들고, Issue나 PR을 올리고, .. 등등\
근데 개발자들은 게으르기 때문에 저런 Issue나 PR 확인하러 깃허브 켜기도 귀찮습니다..

![슬랙](image-1.png)

따라서 슬랙에서 간단히 깃허브를 연동하여 원하는 레포지토리나 조직의 풀리퀘, 이슈 등을 확인하고\
코멘트를 달고 경우에 따라서는 이슈를 닫는 등의 마무리까지 가능하게 할 수 있습니다.\
매우 간단하니 바로 시작해봅시다\
참고로 Windows 11 기준입니다

---

# 슬랙 워크스페이스에 깃허브 앱 추가

먼저 원하는 슬랙 워크스페이스에서\
Slack App Directory로 들어갑시다.\
아래와 같이 들어갈 수 있습니다

<img src="https://i.imgur.com/JX2g6n8.png" alt loading="lazy" width="80%"/>

그 다음 검색으로 Github를 입력하고 **"Slack에 추가"** 버튼을 클릭합니다.

<img src="https://i.imgur.com/LmBYGWr.png" alt loading="lazy" width="80%"/>

그럼 아래와 같이 앱이 추가됩니다!

<img src="https://i.imgur.com/fnCOL1B.png" alt loading="lazy" width="80%"/>

**"Connect Github account"** 를 눌러 깃허브 계정을 연결하고, 무슨 코드를 주는데 그거 갖다가 **"Enter code"** 에 집어넣어줍시다.\
그럼 이렇게 됩니다
<img src="https://i.imgur.com/V1eBBVn.png" alt loading="lazy" width="80%"/>

# 깃허브 앱을 원하는 채널에 추가하기

이제 슬랙의 원하는 채널(제 경우 `#issues`)에 가서, 해당 채널 상단의 세부정보를 열어봅니다.

<img src="https://i.imgur.com/ZzedSp8.png" alt loading="lazy" width="50%"/>

세부정보를 열었다면 **통합 - 앱 - 앱 추가 - 깃허브 선택**

<img src="https://i.imgur.com/NPO41Um.png" alt loading="lazy" width="60%"/>

짜잔

# 슬랙 채널에서 Github organization/repo 구독하기

이제 해당 채널에서 `/github subscribe owner/repo`와 같이 입력해줍시다.\
`owner`에는 연결하려는 레포지토리를 가지고 있는 organization이나 유저 이름을\
`repo`에는 레포지토리 이름을 써줍시다

그럼 일단 아래와 같은게 나옵니다

<img src="https://i.imgur.com/DfPC9Oq.png" alt loading="lazy" width="80%"/>

원하는 `owner`를 선택하면, 아래와 같이 나오는데

<img src="https://i.imgur.com/XU5dlIA.png" alt loading="lazy" width="80%"/>

여기서 레포지토리를 고를 수도 있는데,\
방금 만든 organization이라 레포가 없어서 저는 All 선택지밖에 없네요\
사실 제가 원하는게 All이긴 합니다

이제 다시 슬랙으로 돌아와서, 커맨드를 다시 입력하면 끝!!\
`/github subscribe owner/repo`

<img src="https://i.imgur.com/CYbtw1s.png" alt loading="lazy" width="80%"/>

이 경우 repository를 한정시켜서 테스트했는데\
저처럼 organization 자체를 구독시키고자 하는 경우\
`github subscribe organization`과 같이 그냥 repo를 쓰지 않으면 됩니다

# 이제 써봅시다

해치웠나? 한 번 이슈를 열어봅시다

<img src="https://i.imgur.com/HiAOmbW.png" alt loading="lazy" width="80%"/>

이렇게 깃허브에서 이슈를 열고 슬랙에 가보면..

<img src="https://i.imgur.com/kGT8vGF.png" alt loading="lazy" width="80%"/>

이렇게 알림도 받아볼 수 있고 코멘트도 달고.. `Close`도 할 수 있습니다!\
사실 위 화면은 제가 이미 슬랙에서 이슈를 닫아버린 후입니다 ㅋㅋ ㅈㅅ

---

이렇게 마법의 슬랙고둥님을 만들었습니다

![마법의 소라고둥님!](image.png)

간편한데요?

이만 마칩니다
