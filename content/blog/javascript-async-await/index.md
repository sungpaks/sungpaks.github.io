---
title: "🛑 자바스크립트의 비동기 작업과 Async/Await"
date: 2024-03-22 23:11:07
description: "JavaScript 비동기 작업 3탄입니다"
tag: ["JavaScript"]
---

Promise로 스마트한 비동기 처리를 살펴봤었는데요..\
괜찮은 것 같긴 한데.. 아래와 같은 경우에는 아직도 알아보기 힘든 것 같네요?

```javascript
function getJohnData() {
  //John의 데이터 가져오기
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ username: "John", email: "john@example.com" })
    }, 1000)
  })
}
function getSunghoData() {
  //Sungho의 데이터 가져오기
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ username: "Sungho", email: "Sungho@example.com" })
    }, 1000)
  })
}

//꼭 John, Sungho 순서로 데이터를 가져오려면..
function getJohnAndSunghoData() {
  getJohnData()
    .then(data => {
      console.log(data.email)
      return getSunghoData()
    })
    .then(data => {
      console.log(data.email)
      return Promise.resolve("John, Sungho Data 가져왔어용")
    })
    .then(res => {
      console.log(res)
    })
}
```

![실행결과 1](image.png)

더 좋아질 수는 없을까요?

![속닥속닥...](image-1.png)

속닥속닥...

```javascript
function getJohnData() {
  //John의 데이터 가져오기
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ username: "John", email: "john@example.com" })
    }, 1000)
  })
}
function getSunghoData() {
  //Sungho의 데이터 가져오기
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ username: "Sungho", email: "Sungho@example.com" })
    }, 1000)
  })
}

//이렇게 해보세요..
async function getJohnAndSunghoData() {
  const john = await getJohnData()
  console.log(john.email)
  const sungho = await getSunghoData()
  console.log(sungho.email)
  console.log("John, Sungho Data 가져왔어용")
}
```

헉 이렇게 해보라는데요?\
코드가 아주 절차적으로 보이고 아무튼 정갈해보입니다\
근데 처음보는 `async`와 `await` 키워드가 있죠?\
당장 알아보도록 합시다.

# Async와 Await

Promise를 더 잘 쓰기 위해 나온 특별한 친구들이 바로 `async`와 `await`입니다.\
사실 이름 안에 역할이 다 담겨있고, 사용하기도 쉽습니다.

## async

먼저, `async` 키워드는 함수를 비동기(_asynchronous_) 함수로 정의하기 위해 쓰입니다.\
`async function myAsyncrhonousFunction() {}`과 같이,\
그저 함수 선언 앞에 키워드를 갖다 붙이기만 하면 됩니다.\
이렇게 하면 해당 함수는 항상 `Promise`를 반환하며,\
함수가 명시적으로 `Promise`를 반환하지 않는 경우에도 묵시적으로 `Promise`객체로 감싸줍니다.

예를 들어, 아래 두 함수는 동등합니다 :

```javascript
async function fart() {
  return "BBOONG"
}
```

```javascript
function fart() {
  return Promise.resolve("BBOONG")
}
```

그렇습니다.

## await

`async`얘기에 `await`가 빠지면 섭합니다?

`await`는 `async` 함수 내에서 동작하는, 이름 그대로 _"기다려"_ 키워드입니다.\
`await`키워드를 붙이면 해당 줄에서 `Promise`가 처리될 때까지 함수 진행이 멈춥니다.
![기다린다](image-2.png)

아까 처음에 살펴봤던 코드를 다시 볼까요?

```javascript
//async function에서
const john = await getJohnData()
console.log(john.email)
```

await가 없었다면 getJohnData()가 1초 대기하는 것을 기다리지도 않고 `console.log`가 실행되기 때문에, 결과값은 `undefined`였을 것입니다.\
그러나 `await` 키워드를 붙여 기다리도록 했으므로, `Promise`가 이행되고 나서야 `console.log`가 실행됩니다.

우리는 `getJohnData()`같은 비동기함수 호출과 그 밑 줄을 차례대로 실행하기 위해\
콜백이니 `Promise.then()`이니.. 코드를 새로운 형태로 짜야 했는데\
그냥 `await` 딸깍으로 가능해졌습니다..\
펀하고 쿨한데요?

흠.. 그리고 `async`함수에서 에러를 반환하고 싶을 수도 있겠죠? `Promise`의 `reject`처럼요\
이 경우에도 그냥 아래와 같이 간단하게 할 수 있습니다.

```javascript
async function wannaReject() {
  return Promise.reject("No")
}
```

혹은 예외 `throw`로

```javascript
async function wannaReject() {
  throw new Error("NO")
}
```

이렇게 해서, 일상적으로 으레 하듯이 `try-catch`블록을 사용할 수 있습니다.

```javascript
async function foo() {
  try {
    const john = await getJohnData()
    const sungho = await getSunghoData()
  } catch (err) {
    /*두 썸띵*/
  }
}
```

### Ref

[모던 JavaScript 튜토리얼 - async와 await](https://ko.javascript.info/async-await)\
[MDN web docs - async function](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Statements/async_function)\
[토스 페이먼츠 - 예제로 이해하는 await async 문법](https://velog.io/@tosspayments/%EC%98%88%EC%A0%9C%EB%A1%9C-%EC%9D%B4%ED%95%B4%ED%95%98%EB%8A%94-awaitasync-%EB%AC%B8%EB%B2%95)

---

<br/>

이렇게 Javascript의 비동기 작업 관련해서 3번이나 포스팅을 뽑아냈네요\
아무튼 마칩니다
