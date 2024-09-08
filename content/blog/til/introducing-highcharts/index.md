---
title: "React에 차트 넣기 개쉬움 (HighCharts)"
date: 2024-09-05 21:28:49
description: "HighCharts로 리액트에서 차트 생성해보기"
tag: ["TIL", "React"]
---

> ! 주의 : TIL 게시글입니다. 다듬지 않고 올리거나 기록을 통째로 복붙했을 수 있는 뒷고기 포스팅입니다.

프론트엔드 작업 시 뭔가 해야 하는 일이 생겼는데  
어라? 좀.. 귀찮거나, 어려운데? 싶으면  
다 라이브러리가 있습니다.  
저는 [HighCharts](https://www.highcharts.com/docs/getting-started/install-from-npm)써서 해보겠스니다

# installation : npm

[사실 위 링크가 설치링크임](https://www.highcharts.com/docs/getting-started/install-from-npm)  
`npm install highcharts --save`  
`npm install highcharts-react-official --save`  

# 이제 사용

전역에서 가져와봅시다

먼저 아래와 같이  
`<div id="chart-container">여기에 차트 표시</div>`  
chart를 담을 컨테이너 div를 생성해주고
```javascript

var Highcharts = require("highcharts");
require("highcharts/modules/exporting")(Highcharts); //highcharts와 module을 load하고,
Highcharts.chart("chart-container", {/*여기에 옵션이 들어갑니다.*/}); //chart를 생성합니다.
```
이렇게 해주면
![](https://i.imgur.com/kxxp5Yk.png)
이렇게 차트 뼈다구가 나옵니다?

근데 이렇게 vanilla js에서 하는 방법 말고  
react에서 하려면  
그냥  

```jsx
import HighchartsReact from "highcharts-react-official";
import Highcharts from "highcharts";
// import로 가져오고

function MyChart() {
	const [options, setOptions] = useState({
		chart: { type: "spline" },
	    title: { text: "차트입니다?", align: "left" },
	    series: [{ data: [1, 2, 1, 4, 3, 6] }],
	})
	// 대충 적당히 예제 하나 만들고
	return (
      <div id="chart-container">
        <HighchartsReact highcharts={Highcharts} options={options} />
      </div>
      //props로 `highcharts={Highcharts}`와 `options={options}` 넣고 렌더링해주기만 하면 된다
	)
}
```

![](https://i.imgur.com/w4Oetct.png)

아주 쉽습니다 ㄷㄷ

이제 먼가 더 원하는게 생긴다면...  
[역시 공식문서](https://api.highcharts.com/highcharts/)

---

사실 그냥 옵시디언 정리하다가 이런 기록이 있길래 올립니다  

끗