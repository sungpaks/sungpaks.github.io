---
title: "🤙 자바스크립트의 비동기 작업과 Promise"
date: 2024-03-10 20:12:10
description: "JavaScript 비동기 작업 2탄입니다"
tag: ["JavaScript"]
---

저번 시간에는\
비동기 작업이 끝나는 타이밍을 외부에서는 알 방법이 마땅치 않기 때문에,\
콜백 함수, 즉 "그거 끝나면 할 일"를 넘겨주는 일련의 과정을 살펴봤었죠?

그런데 비동기 작업이 진행 중이거나, 완료되었다거나, 등의 상태를 알 수 있다면 해결되는 문제 아닐까요?\
그래서 자바스크립트에서 지원하게 된 것이\
**작업의 상태를 나타내는 객체**인 **Promise**입니다

# Promise란

> Promise 객체는 비동기 작업이 맞이할 미래의 완료 또는 실패와 그 결과 값을 나타냅니다.

Promise 객체의 상태는 아래와 같이 세 가지로 나뉩니다 :

- pending : 작업이 진행중..
- fulfilled : 작업이 성공적으로 완료됨
- rejected : 작업 중 오류 발생

<img src="https://i.imgur.com/4nXQXJY.png" alt loading="lazy" width="60%"/>

Promise 대충 아래와 같이, 생성자에 `executor`(실행자)를 전달하여 만듭니다

```javascript
const myPromise = new Promise((resolve, reject) => {
	if(/* 성공적 */) resolve("good!!");
	if(/* 예외 */) reject(new Error("bad.."));
});
```

실행함수인 `executor`에는 `resolve`와 `reject`를 인수로 넘겨야 하는데, 이는 JavaScript에서 제공하는 콜백함수입니다.

- resolve(value) : 작업이 성공적으로 완료된 경우, 그 결과인 `value`와 함께 호출합니다.
- reject(error) : 작업 도중 에러 발생 시, 에러 객체인 `error`와 함께 호출합니다.

개발자는 Promise 내에 일련의 작업들을 작성하고, 성공/실패 여부에 따라 `resolve/reject`를 호출하기만 하면 됩니다.

# Promise 활용

이제 사용을 해봅시다\
작업이 성공적으로 완료된 경우 `then`블록으로 넘어가며,\
오류가 발생한 경우 `catch`블록으로 넘어갑니다. \
마치 try-catch 구문 같네요

```javascript
myPromise
  .then(value => {
    //비동기작업 뒤에 와야 할 작업
    console.log(value)
  })
  .catch(error => {
    //오류 시 작업
    console.log(error.message)
  })
```

아까 Promise 생성자의 `executor`에서,\
`resolve`에서는 인자로 `value`를,\
`reject`에서는 인자로 `error`를 넘겼었죠?\
이 각각을 위와 같이 `then`과 `catch`블록의 첫 번째 인자로 받을 수 있습니다

다음과 같이 인자로 `time`을 전달하고, `time`만큼 기다린 후 `console.log`를 찍는 비동기 처리 과정 예제를 살펴보겠습니다 :

```javascript
function waitFunction(time) {
  return new Promise((resolve, reject) => {
    if (isNaN(time) || time < 0) {
      reject(new Error("양수를 넣어주세요 ㅜㅜㅜ"))
      return
    }
    setTimeout(() => {
      console.log(`${time}ms 기다렸습니다.`)
      resolve(`${time}ms 기다리기 성공!!!`)
    }, time)
  })
}

waitFunction(+10)
  .then(message => {
    console.log(message)
  })
  .catch(error => {
    console.log(error.message)
  })
```

waitFunction이 반환하는 Promise 객체는,\
유효하지 않은 값이라면 `reject`를 호출하기 때문에 `catch`블록으로,\
성공적으로 실행한 후에는 `then`블록으로 향합니다.

이 때, `then()`에서는 새로운 `Promise` 객체가 반환되므로, 연쇄으로 체이닝을 적용할 수 있습니다.\
또한 try-catch블럭에서 으레 하듯이, 성공/실패 여부에 관계없이 마지막에 무조건 실행할 작업이 있는 경우 `finally`블록을 사용할 수 있습니다.

```javascript
foo()
  .then(value => {
    /* ... */
  })
  .then(value => {
    /* ... */
  })
  .then(value => {
    /* ... */
  })
  .then(value => {
    /* ... */
  })
  .catch(error => {
    /* !!! */
  })
  .finally(() => {
    /* ~~~ */
  })
```

이렇게 `then()`에서 새로운 `Promise`객체가 반환됨을 이용한 체이닝은 비동기 작업 시 후속 작업들을 줄세우기 용이하게 해줍니다.

그런데 이것도 좀 100% 만족스럽지는 않아보이네요..\
어디에서 에러가 발생하여 `catch`문으로 넘어왔는지 알아채기 힘들다거나,\
scope가 각각 다르기 때문에 어떤 값을 공유하기도 애매할 수 있을 것 같고요

물론 `Promise`도 좋지만.. 이러한 이유로 이후에 새로운게 생겨났습니다\
`async/await`인데요\
다음에 알아보겠습니다

이만 마칩니다
