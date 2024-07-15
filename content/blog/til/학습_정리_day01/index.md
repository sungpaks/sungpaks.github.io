---
title: "제목"
date: 2024-07-15 22:05:46
description: "설명"
tag: ["TIL", "JavaScript", "Node.js"]
---

Day_01 기록..

## Node.js로 표준 입력 받고싶어요

```js
const readline = require("node:readline")
const { stdin: input, stdout: output } = require("node:process")
const rl = readline.createInterface({ input, output })

rl.on("line", function (line) {
  console.log(line)
  rl.close()
}).on("close", function () {
  process.exit()
})
```

이건 딱 한 줄 입력 받는 예제인데  
이걸 마개조해서  
원할 때마다 입력스트림을 시작하는 함수를 따로 만들어버리고 싶었는데  
이게 이벤트 리스너를 기반으로 하는거라 좀 쉽지 않았다  
`rl.prompt()`같은 것도 발견하긴 했는데  
결국에는 아래와 같이 했다

```js
const readline = require("node:readline")
const { stdin: input, stdout: output } = require("node:process")
const { fail } = require("node:assert")
const rl = readline.createInterface({ input, output })
const AM = "AM"
const PM = "PM"

//rl.prompt(); 굳이 없어도 되네
rl.on("line", function (line) {
  if (line === "") rl.close()
  reserve(line)
}).on("close", function () {
  process.exit()
})
```

[node.js documentation](https://nodejs.org/api/readline.html)에서 여기서 쓰인 이벤트나 `rl` 이런거에 대한 정보를 알 수 있다  
`rl.prompt()`로 입력 스트림을 재개하거나 어쩌구.. 할 수 있다는데  
그냥 없이, `""`(빈 문자열)이 입력될 때까지 계속 받게 했다. `close`하지 않고  
이렇게 하면 일단은 조건부로 무한정 받을 수 있는거시다 입력을

## JavaScript에서 클래스를 만들어요

```js
class MyClass {
  name //name이라는 멤버변수 미리 선언
  #password //#으로 private 설정 가능
  constructor(_name, _role) {
    this.name = _name //미리 선언한 name에 값 할당
    this.role = _role //미리 선언 안 했어도 그냥 이렇게 하면 생김
  }
  getName() {
    return this.name
  }
  setName(_name) {
    this.name = _name
  }
  static thisIsStaticFunction() {}
}
```

JavaScript에서 class는 속성(property)의 집합인 셈인데..

- `constructor`로 생성자를 명시할 수 있다
- `static` 붙이면 정적으로 선언할 수 있다
- 사실 함수도 JavaScript에서는 [일급객체](https://ko.wikipedia.org/wiki/%EC%9D%BC%EA%B8%89_%EA%B0%9D%EC%B2%B4)라서, 그냥 속성을 추가하듯이 작성하면 됨
- 기본적으로 모든 속성(property)들은 public인데..
  - [클래스 필드를 private으로](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Classes/Private_properties)해버릴 수 있는 방법이 **ES2019**부터 추가되었다
  - `#`(해쉬 라고 읽으면 됨) prefix를 추가하여 `private`으로 선언할 수 있는 거시다

## Factory Method Pattern?

그런데 하고 싶은 것이 있었는데  
[팩토리 메서드 패턴](https://refactoring.guru/ko/design-patterns/factory-method)이다

그러니까 이건..  
(1) 먼저 생성자를 `private`으로 제한  
(2) 생성자는 특별한 메서드 (ex: `getNewInstance()`)에서 호출  
(3) 이 특별한 객체 생성 메서드에서는 조건에 따라 객체 생성을 결정 (ex: 이미 객체가 10개 생성되었으면 객체 생성 하지 않는다, 등..)  
이런 식으로 해서 객체 생성을 한 층 더 캡슐화하고 제어하는 패턴이다

사실 이름이 **팩토리 메서드 패턴**이 맞는지 모르겠는데,  
전에 Java 수업 때 교수님께서 객체지향 패턴 중 하나로 알려주셨던 내용인데  
이름이 기억이 안 나서 GPT에게 설명을 주고 이거 이름 뭐냐고 물어봤더니 저거라고 답했다..  
근데 또 위 링크의 설명을 보면 살짝? 다른 것 같긴 하다

아무튼, 구체적으로 하고싶었던 것은  
입력된 값의 유효성 검사 ---> 유효한 값이면 객체 생성 / 아니면 예외처리  
이 과정을 아예 class 내에서 캡슐화하여 `getNewInstance(input)` 이런걸 넣으면,  
유효 값인 경우, 객체를 생성하여 리턴, 아니면 `null`이든 `false`든 예외 반환  
이렇게 하고 싶었다  
그런데 어라? JavaScript에서 생성자를 `private`으로 생성하는 방법은 없는 듯하다  
(`#`도 안 되고, 다른 방법을 검색해봐도 안 나오는데.. 방법을 아신다면 알려주세요)  
그래서 일단 생성자를 막지는 않고 그냥 원하는 대로 객체 생성 메서드를 따로 만들었을 뿐이었다
