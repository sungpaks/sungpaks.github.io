---
title: "🫸 [WSL] Proxy error : Could not proxy request"
date: "2024-02-18T21:37"
description: "또 너냐 윈트북?"
tag: ["wsl", "trouble shooting"]
---

<img src="https://i.imgur.com/coS9OXd.png" alt loading="lazy" width="100%"/>

이런 에러를 만났었는데요\
정적페이지는 띄워지지만 서버로의 요청이 전부 실패하는 상황이었습니다\
거두절미하고 **해결한 방법**부터 말씀드리고 시작하자면..

package.json에서 proxy 요청을 localhost가 아닌 **호스트 머신의 IP주소**로 보내도록 해야합니다\
`"proxy": "http://172.12.89.2:8080",` 이런식\
**호스트 머신의 IP주소**는 wsl터미널에서 `ip route show | grep -i default | awk '{ print $3}'` 명령으로 가져올 수 있습니다.

이게 제가 로컬에서 프론트를 여는 것은 wsl위에서 열고\
백엔드 서버를 여는 것은 wsl이 아닌 윈도우 터미널에서 열었기 때문으로 보이는데

[microsoft 설명서](https://learn.microsoft.com/ko-kr/windows/wsl/networking)에 이와 관련한 언급이 있습니다

> 기본적으로 WSL은 네트워킹에 NAT 기반 아키텍처를 사용합니다.

이에 따라 고려할 점이 있는데,\
windows -> linux 액세스 시 일반적인 방법과 같이 localhost를 사용하면 되는데\
linux -> windows 액세스 시 호스트 IP로 접근해야한다고 하네요\
제 상황이랑 딱 맞습니다

### NAT가 뭔데요?

NAT(Network Address Translation, 네트워크 주소 변환)은 컴퓨터 네트워크 개념인데요\
IPv4 주소 부족 문제를 해결하기 위한 어떤 잡기술 비슷하게 나온 방법입니다

10개의 호스트가 있는 경우 10개의 IP를 모두 할당하는 것이 아닌\
하나의 라우터에 한 개의 IP만 할당하고, 각 호스트들에게는 로컬 주소를 할당하는 방법입니다\
마치.. 콘센트가 2구 뿐인데 더 많은 사용이 필요한 경우\
멀티탭을 사와서 꽂는 것과 비슷합니다

이에 대해서 더 쓰려면 좀.. 깊어지니까\
이만 마칩니다
