---
title: "🗳️ 리액트 사용자 입력 : onClick 🆚 onSubmit"
date: 2024-07-07 21:04:20
description: "어느것을고를까요알아맞춰보세요딩동댕동커피짠"
tag: ["React", "JavaScript"]
---

<figure>

![미안하다..이거보여주려고어그로끌었다](image.png)

<figcaption>

미안하다.. 이거 보여주려고 어그로 끌었다..  
onClick vs onSubmit 싸움수준 ㄹㅇ실화냐?  
진짜 리액트 최대의 고민이다.. 가슴이 웅장해진다  
...

</figcaption>
</figure>

리액트에서 사용자 입력 제출할 때 뭐 쓰시나요  
전 별 신경쓰지 않고 아무거나 생각나는거 쓰는 편이었는데  
막상.. 생각해보니 어라? 싶어서 그냥 써보는 글입니다  
[이런 글](https://medium.com/@edidee/using-onclick-vs-onsubmit-to-submit-a-form-in-react-c7e6dd318dce)을 좀 참고했을지도?

둘 다 React의 `useState`로 사용자의 입력을 관리하는 경우로 예시를 들었습니다

# onClick

```jsx
export default function UsingClick() {
  const [text, setText] = useState("")
  const [result, setResult] = useState("")
  const onClick = e => {
    setResult(text)
  }
  return (
    <div className="App">
      <div>
        <h3>Input Using onClick</h3>
        <input value={text} onChange={e => setText(e.target.value)} />
        <button onClick={onClick}>제출</button>
      </div>
      <h2>{result}</h2>
    </div>
  )
}
```

대충 이렇게 하겠죠?

![이게 클릭이야](image-1.png)

그냥 간단히 `<button onClick={}>` 이렇게 쓰는 것입니다  
어디서든 `<button>`을 적절한 `onClick`에만 연결해주면 후속처리를 진행할 수 있습니다.

그냥 이게 다인데..  
이 `onClick`은 버튼 뿐만 아니라 어디에도 **범용적**인 이벤트 핸들러라는 점이 특징이겠네요  
그리고 **클릭 핸들러**로 하기 때문에, **진짜 클릭해야 한다**는 점입니다

# onSubmit

![결재](image-2.png)

아시겠지만 `onSubmit`의 경우에는 꼭 `form`으로 감싸고  
버튼의 타입이 `type="submit"`이어야 합니다.

```jsx
export default function UsingSubmit() {
  const [text, setText] = useState("")
  const [result, setResult] = useState("")
  const onSubmit = e => {
    e.preventDefault()
    setResult(text)
  }
  return (
    <div className="App">
      <div>
        <h3>Input Using onSubmit</h3>
        <form onSubmit={onSubmit}>
          <input value={text} onChange={e => setText(e.target.value)} />
          <button type="submit">제출</button>
        </form>
      </div>
      <h2>{result}</h2>
    </div>
  )
}
```

이처럼 `onSubmit`을 써먹으려면 이를 통합 관리하는 `<form>`태그가 있어야 하고  
이 `<form>`태그에 `onSubmit`이 등록됩니다

그런데 `onClick`과는 좀 다른게  
이렇게 제출하면 기본적으로 **새로고침이 발생**합니다  
리액트 입장에서는 이게 state도 초기화되고 아주. 귀찮을 수 있습니다  
따라서 필요한 경우 `onSubmit`함수에 인자로 들어오는 이벤트 객체 `e`를 가져다가  
`e.preventDefault()`과 같이 작성하여 **새로고침을 방지**해줍시다  
그래야 `onClick`과 비슷하게 쓸 수 있습니다

그리고 한 가지 `onClick`과 비교되는 특징은  
`<form>` 내에 속한 입력란에 포커스가 있는 채로 **엔터를 눌러도 제출된다**는 점입니다  
이를 이용하여 굳이 클릭하지 않아도 엔터로 제출을 해결하게 할 수 있으므로  
조금의 UX 개선에 도움이 될지도?

# onClick vs. onSubmit 예제

위에서 쓴 예제 코드 허투루 쓴게 아닙니다  
오늘도 샌드박스로 좀 가져왔습니다

<iframe src="https://codesandbox.io/embed/4ks4yp?view=preview&module=%2Fsrc%2FUsingSubmit.jsx&hidenavigation=1"
     style="width:100%; height: 500px; border:0; border-radius: 4px; overflow:hidden;"
     title="onSubmit-vs-onClick"
     allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
     sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
   ></iframe>

위에서 살펴본 차이점(`onSubmit`은 엔터로 가능함 등..)을 한번 살펴보십쇼

---

# 끝

입니다. 진짜로  
알아서 상황에 맞게 쓰면 되겠습니다
