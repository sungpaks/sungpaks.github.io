---
title: "⏯️ 자바스크립트의 비동기 작업과 콜백함수"
date: 2024-03-03 21:56:13
description: "JavaScript 비동기 작업 1탄입니다"
tag: ["JavaScript"]
---

자바스크립트 하다보면 항상 등장하는 것이 비동기니 뭐니 하는 개념인데요

자바스크립트만의 특성때문에 생기는 자바스크립트 특유의 비동기 프로그래밍을 한번 들여다보고자 합니다

# 비동기와 동기

비동기적이라는 말은 무엇이고, 동기적이라는 말은 무엇일까요?

<img src="https://i.imgur.com/hvUyA1o.png" alt loading="lazy" width="80%"/>
출처 https://learnjs.vlpt.us/async/

> 비동기 프로그래밍은 작업이 완료될 때까지 기다리지 않고 잠재적으로 오래 실행되는 작업을 시작하여 해당 작업이 실행되는 동안에도 다른 이벤트에 응답할 수 있게 하는 기술입니다.

이 "동기"를 "대기"로 바꿔서 보면 이해하기 편한데요\
작업들이 동기적이라는 것은 다음 작업이 시작하려면 이전 작업이 끝나기를 대기한다는 의미입니다\
반대로 비동기적이라는 것은 이전 작업이 끝나든 말든 대기하지 않고 시작한다는 의미겠죠?

브라우저에서 제공하는 웹 API들은 시간이 오래걸릴 수 있으므로 비동기적입니다. 예를 들면..

- `fetch()`를 이용한 HTTP요청 전송
- DOM (document) 메서드
- `setTimeout()`으로 작업 스케줄링하기
- `showOpenFilePicker()`를 이용해 사용자에게 파일 선택 요청하기

작업들을 비동기적으로 처리하는 것은 물론 효율적이지만\
그 이점을 제대로 누리려면 비동기 지뢰들을 잘 피할 수 있도록 신경써야합니다..\
이에 대해 아래에서 자세히 알아보도록 하겠습니다

# 비동기처리와 콜백함수

간단한 예시로, src를 읽어오는 `loadScript`함수를 다음과 같이 작성했다고 생각해봅시다

```javascript
function loadScript(src) {
  let script = document.createElement("script")
  script.src = src
  document.head.append(script)
}
```

*script.js*에 작성된 함수인 newFuctnion()을 가져다 쓰려고 `loadScript` 메서드를 다음과 같이 쓰는 것을 생각해 볼 수 있는데

```javascript
loadScript("script.js") // 'script.js'를 로드해서

newFunction() // 'script.js'내에 정의된 newFunction을 호출해야지!!
```

주의할 점은, 스크립트가 실행되는 것은 비동기적이기 때문에,\
`newFunction()`의 실행 타이밍이 `loadScript()`가 끝난 타이밍임이 보장되지 않는다는 것입니다..\
따라서 이게 `loadScript()`가 완료되었는지, 아직인지, 알 수가 없습니다..

그래서 이를 해결하기 위해 간단히 콜백함수를 이용해볼 수 있습니다.
먼저 `loadScript()`의 인자에, 나중에 호출할 함수, 즉 `callback`함수를 추가합니다.

```javascript
function loadScript(src, callback) {
let script = document.createElement('script');
script.src = src;

script.onload() = ()=>callback(script); //추가 : script가 로드된 이후의 타이밍을 노림

document.head.append(script);
}
```

이제 콜백함수로 newFunction을 실행하도록 넘기려면

```javascript
loadScript("script.js", function () {
  newFunction()
})
```

이렇게 됩니다.\
그러니까 콜백함수는, "비동기 작업 끝나면 실행할 동작들을 함수로 묶어서 가져다 주는 것" 정도가 되겠네요..

여담이지만 이렇게 자바스크립트에서 함수를 인자로 넘기는 것은\
자바스크립트에서는 함수가 *일급 객체*로 취급받기 때문인데\
[위키피디아 : 일급 객체](https://ko.wikipedia.org/wiki/%EC%9D%BC%EA%B8%89_%EA%B0%9D%EC%B2%B4)를 살펴보면 일급 객체는 딱히 대단한 의미는 아니고\
그냥 이리보고 저리봐도 보통의 객체처럼 다루어질 수 있다면 일급객체라고 합니다\
저도 이 글 준비하면서 새로 알게 된 개념인데 한번 읽어보면 꽤나 흥미롭습니다

아무튼.. 위에서 살펴본 예시와 비슷하게 실제 코드를 작성해서 한번 테스트해보고 싶은데요\
범용적인 JavaScript 라이브러리인 lodash.js 스크립트를 가져다가 좀 해보겠습니다

똑같은 동작을 콜백함수로도 넘겨보고, 그냥 `loadScript`밑에서 실행도 해보면

```html
<!DOCTYPE html>
<script>
  "use strict"

  function loadScript(src, callback) {
    let script = document.createElement("script")
    script.src = src

    script.onload = () => callback()

    document.head.append(script)
  }

  loadScript(
    "https://cdnjs.cloudflare.com/ajax/libs/lodash.js/3.2.0/lodash.js",
    () => {
      console.log(_)
    }
  )
  console.log(_)
</script>
```

결과 :
<img src="https://i.imgur.com/2079HQ6.png" alt loading="lazy" width="100%"/>

`loadScript` 아래의 `console.log`는 `loadScript` 동작이 끝나든 말든 일단 실행되고,\
아직 로드가 끝나지 않았기 때문에 정의되지 않았다고 출력됩니다..\
그러나 콜백함수로 넘긴 경우 로드가 끝난 이후 **나중에 호출(callback)** 했으므로, 출력이 되는 것을 확인할 수 있습니다.

# 콜백의 콜백의 콜백의 콜백의..

그런데 만약.. 스크립트를 여러 개 불러오고, 각 스크립트들은 이전 스크립트 로드가 끝난 후 로드를 시작하고 싶다면 어떡하죠? 아래와 같이 하면 될까요?

```javascript
loadScript('script1.js', function(script) {
	loadScript('script2.js'), function(script) {
		loadScript('script3.js', function(script)) {
			//악! 콜백콜백콜백해병님!
		}
	}
})
```

게다가 여기에서 에러를 처리하기 위해 오류 우선 콜백을 적용한다면?

- 여기서 잠깐, 오류 우선 콜백 :
  - callback의 첫 번째 인자는 에러가 차지하도록 하고, 에러가 발생하면 `callback(err)`와 같이 호출
  - 두 번째(또는 그 뒤의) 인자는 에러가 발생하지 않았을 때를 위한 인자들.. `callback(null, result1, result2, ...)`와 같이 쓴다

`loadScript`를 오류 우선 콜백으로 만들고, 아래와 같이 사용한다고 해봅시다.

```javascript
loadScript("script.js", function (err, script) {
  if (err) {
    // 에러 처리
  } else {
    //로딩 성공적
  }
})
```

그럼 이제 더 끔찍해집니다 :

```javascript
loadScript("script1.js", function (err, script) {
  if (err) {
    // 에러 처리
  } else {
    loadScript("script2.js", function (err, script) {
      if (err) {
        //에러 처리
      } else {
        loadScript("script3.js", function (err, script) {
          if (err) {
            //에러 처리
          } else {
            // 악! 오류우선오류우선오류우선콜백콜백콜백 해병님!
          }
        })
      }
    })
  }
})
```

피라미드는 사람이 만들었음을 몸소 증명해버렸습니다..\
게다가 예시에서는 피라미드가 단 3층이지만\
필요에 따라서는 4층 5층 ... 잠실타워까지 닿을지도 모릅니다

이런 형태의 코드는 그 흐름을 파악하기도, 디버깅하기도 매우 힘들어보입니다.\
이런 사태를 피하려면 어떻게 할까요?\
앗! 좋은 생각이 난 것 같습니다. 이렇게 해보면 안될까요?

```javascript
loadScript("script1.js", step1)

function step1(err, script) {
  if (err) {
    // 에러 처리
  } else {
    loadScript("script2.js", step2)
  }
}

function step2(err, script) {
  if (err) {
    // 에러 처리
  } else {
    loadScript("script3.js", step3)
  }
}

function step3(err, script) {
  if (err) {
    // 에러 처리
  } else {
    //모든 스크립트 로딩 끝!!
  }
}
```

흠.. 근데 이러면 코드를 갈갈이 찢어놓은 셈이 되어버려서, 가독성도 갈갈이 찢겨져버립니다..\
또한 해당 step함수들은 그저 loadScript에 종속된, 재사용 불가한 매립쓰레기가 되어버립니다.

그래서 이런 콜백지옥을 해결하기 위해 **Promise**가 등장하는데\
앞서 문제를 일으켰던, **비동기 작업이 끝났는지를 모른다**를 해결하며 등장한 방법입니다.\
비동기 작업이 **끝난 상태인지** 확인할 방법이 있으면 되겠죠?

---

\
근데..\
다음 포스트에서 알아보도록 하겠습니다.\
최근 "사람들은 글이 길면 읽지 않는다"는 말을 봐버렸기 때문인데요..\
딱히 보는 사람도 없지만 그냥 끊어쓰겠습니다.

이만 마칩니다
