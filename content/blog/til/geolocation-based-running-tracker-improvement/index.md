---
title: "위치 기반 러닝 트래커 고도화를 위한 고민들"
date: 2024-08-06 01:53:34
description: "아오.. 신경쓸게 많네요?"
tag: ["TIL", "React"]
---

! 주의 : TIL 게시글입니다. 다듬지 않고 올리거나 기록을 통째로 복붙했을 수 있는 뒷고기 포스팅입니다.

[이전 포스팅에서는 프로토타입을 개발해봤었습니다](https://sungpaks.github.io/til/geolocation-based-running-tracker-prototype/)

이제 진짜 서비스를 만들어야 하니, 신경쓸게 산더미입니다

# 정확도 향상

https://developer.mozilla.org/ko/docs/Web/API/Geolocation/getCurrentPosition
https://developer.mozilla.org/ko/docs/Web/API/Geolocation/getCurrentPosition
옵션에 highAccuracy를 강제하게 하거나, timeout을 정하거나 해서 정확도를 올릴 수 있다  
그리고 latitude, longitude 외에 accuracy도 있어서, 이게 일정 값을 벗어나면 계산에 포함하지 않게 하는 것도 방법인 듯.

그리고 현재 위치가 별로 정확하지 않다고 판단되면  
`getCurrentPosition`으로 위치를 갱신하게 할 수 있게 할까? 해서 넣어봤는데  
어차피 별 효과가 없다. 새로고침해도 그대로였음

근데 어차피 PC웹에서는 IP주소 기반 위치 인식이라.. 정확도가 떨어지는게 어쩔 수 없고  
모바일웹에서는 기기 특성 상 정확도가 좋고,  
테스트 결과 걱정하지 않아도 될 정도의 정확도가 나와서  
위에서 `accuracy` 관련 로직만 살짝 추가해주는 정도로 괜찮은 듯

어차피 PC를 들고 돌아다녀 볼 수도 없는 노릇이니  
개발환경 전용 테스트를 좀 만들었다  
테스트모드에서는 지도를 드래그해서 그 지도 중앙이 현재 위치가 되도록 하게끔.

그리고 이 과정에서.. 이제서야 정확히 알게 된 사실  
[**_setState는 비동기적이다_**](https://www.dhiwise.com/post/guide-to-state-management-with-react-setstate-callback)  
`setState`에 콜백함수를 넘기는 까닭이 바로.

# 이전 러닝 상태 복구

러닝 시, 불의의 사태로 서비스를 껐다가 켜게 될 수도 있고,  
사용자가 갑자기 다른 화면으로 넘어갈 수도 있고,  
또는 사용자가 갑자기 새로고침을 해버릴 수도 있고, ..

따라서 새로운 마운트 시 러닝 상태를 복구해야만 했다!  
이를 위해 백엔드에서는

- 러닝 상태를 업데이트하는 `post`
- 특정 러닝 상태 정보를 가져오는 `get`

이런 api를 만들어줬다

이제 러닝을 시작하면,

1. 시작할 때 러닝 정보 생성 요청(백엔드에 `post`)
2. `post` 결과로 백엔드에 러닝 정보가 생성되고, 응답으로 생성된 러닝 상태 id를 받는다.
3. 이 `runningId`는 로컬스토리지에 갖고있자.
   - 처음부터 여기서 Recoil같은 전역상태 라이브러리 써도 괜찮았을 것 같다.
   - 근데 `useContext`만으로 좀 해보고싶어서 욕심을 부렸다
   - 그냥 상태만으로는 마운트 시 값이 초기화되므로, 로컬스토리지에 저장해야만 했음
   - 로컬스토리지에 저장한다는 사실이 좀 찜찜했는데.. 쓰라고 만든건데 안 쓸 이유가?

이제 러닝 진행 시에는

1. 매 위치 변동마다 `post`요청의 requestBody로 이동한 거리, 페이스, 경도와 위도, ... 이런거를 보낸다
2. 새로고침같이 새로운 마운트가 발생하면?
3. 로컬스토리지에서 `runningId`를 가져오고
4. 해당 `runningId`로 서버에 `get`요청을 하여 이전 정보를 받아온다
5. 이를 바탕으로 이전 state들 복구
6. 타이머도 이어서 시작하게 해야 하는데, 이거는 서버 정보로부터 복원하기보다는 `setInterval` 시간을 계속 localStorage에 저장하고 이걸 다시 가져오는게 여러모로 용이했음

이제 러닝 종료 시에 이 localStorage 정보들을 삭제해주기만 하면 됨.

아예 화면을 나갔다가 다시 오면?

1. localStorage에 `runningId` 있는지, 있으면 유효하고 진행중이었는지 확인.
2. 진행중이었으면, 목표 페이스 설정 등을 건너뛰고 러닝을 바로 재개, 그렇지 않으면 localStorage에서 삭제
3. 이렇게 하면, 사용자가 임의로 (뒤로가기, 경로 직접 입력 등) 러닝 진행 페이지로 진입하려는 경우, 진행중인 러닝이 없으면 리다이렉션시킬 수 있음
