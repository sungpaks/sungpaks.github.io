---
title: "🚧 코드 한 줄로 Critical Section에 혼자 진입하기 : Mutual Exclusion Hardware Approach"
date: 2024-04-20 17:25:07
description: "Mutual Exclusion입니다.. 근데 이제 하드웨어를 곁들인"
tag: ["OS"]
---

저번 포스팅에서 Software 로직으로 Mutual Exclusion을 지키는 방법을 살펴봤습니다\
Dekker 선생님이나 Peterson 선생님께서 빈틈없는 알고리즘을 만들어 주셨지만\
여전히 문제가 존재했습니다..\

- `while`같은 반복문을 이용하여 가짜로 기다리기 때문에 busy-waiting 문제가 있고
- 프로세스가 세 개, 열 개, ... 이렇게 많아지면 이걸 다 막기 너무 복잡해지고
- 결국 닝겐의 손으로 매번 코드를 짜야하기 때문에 구멍이 날 수 있고

대충 이런 단점들이 있었는데요\
그래서, Mutual Exclusion을 위한 **Hardware Instruction**을 미리 정의해두고 사용한다는 발상이 나왔습니다\
이렇게 하면 매우 간단히, 진짜 한 줄 정도로 Mutual Exclusion을 보장할 수 있고,\
프로세스가 여럿 존재해도 끄떡없이 막아낼 수 있습니다.

그래서 어떻게 하는 것인지 이제부터 알아볼건데, 주의할 점은\
아래에서 설명할 instruction에 대한 코드는 실제로 어떤 함수같은 코드가 아니라,\
*이렇게 동작한다는 것을 나타내기 위한 것*일 뿐입니다.\
미리 정의되어 있는, 하나의 **atomic한 과정**이며,\
즉 중간에 interrupt를 받아 중단되거나 하지 않습니다.\
또한 어떤 메모리를 참조할 때도, 해당 메모리를 블락시킨 채로 접근하기 때문에,\
**hardware instruction은 진짜진짜 독립적**입니다.

![건드리지마](image.png)

아무튼 시작합시다.\
Instruction이 두 가지 나옵니다.

# 1. Compare & Swap Instruction

```c
int compare_and_swap (int *word, int testval, int newval) {
	int oldval;

	oldval = *word;
	if (oldval == testval) *word = newval;
	return oldval;
}
```

첫 번째 Instruction은 위와 같이 생겨먹었는데,\
`word`의 값이 `testval`와 같아야 `newval`로 값을 바꾸고, 이전의 `word`값을 반환합니다.\
당장 이것만 봐서는 어떻게 써먹는지 잘 모르겠으니, 실제로 어떻게 사용하여 Mutual Exclusion을 구현하는지 봅시다.

```c
int bolt;
void P(int i) { //i번째 프로세스의 작업
	while(ture) {
		while (compare_and_swap(&bolt, 0, 1) == 1)
			/* do nothing */;
		/* Critical Section */
		bolt = 0;
		/* remainder */
	}
}
void main(){
	bolt = 0;
	parbegin(P(1), P(2), ... , P(n));
}
```

- `bolt`값이 0이면, `compare_and_swap`은 bolt값을 1로 바꾸고 0을 반환합니다.
- `bolt`값이 1이면, `compare_and_swap`은 1이 반환됩니다.

이 `bolt`값은 사실상 C.S가 잠겨있는지 여부입니다.\
n개의 프로세스가 아무리 한꺼번에 `compare_and_swap`으로 도달하더라도,\
해당 instruction은 atomic하므로 단 하나의 프로세스만이 `bolt`값을 1로 바꾸고 0의 반환값을 얻는 데 성공합니다.\
그럼 나머지 프로세스들은 `bolt`값이 이미 1이므로 계속 기다릴 뿐입니다.

![선착순!!](image-1.png)

선착순 1명만 반환값 0을 받아서 C.S로 들어가겠네요\
당연히 끝나고 나면, `bolt = 0`으로 또 선착순 1명을 받도록 해줍니다.\
화장실 변기 칸 쓰고 다시 나올려면 잠갔던 문을 다시 열어야겠죠..\
나가면서 잠그고 나가는 사람은 아주 정신이 이상한 사람임에 논란의 여지가 없어보입니다.

# 2. Exchange Instruction

```c
void exchange (int* register, int* memory) {
	int temp;

	temp = *memory;
	*memory = *register;
	*register = temp;
}
```

두 번째 Instruction은 너무 친근하게 생겨먹었습니다\
코딩 처음 배울 때 이런거 자주 하셨죠?

<iframe width="50%" src="https://www.youtube.com/embed/vpQUw8MQ3c4?si=7H7YgNLTojpf00-k" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

<span style="font-size:70%">from. 유튜브 채널 [유준호]</span>

~**_나랑 차 바꾸자!!!_**~

아.. 그리고 쓰는건

```c
int bolt;
void P(int i) {
	int keyi = 1;
	do exchange(&keyi, &bolt) while (keyi != 0);
	/* critical section */;
	bolt = 0;
	/* remainder */;
}
void main() {
	bolt = 0;
	parbegin(P(1), P(2), ..., P(n));
}
```

- C.S에 들어가려는 프로세스들은 각자의 `key`를 가집니다. 잠긴 방 문을 열기 위한 키라고 생각합시다.
- `do-while`로 프로세스들은 `exchange`를 계----속 시도하며 `bolt`와 `keyi`값을 교체합니다.
- 단 하나의 프로세스만이 `bolt`값이 0일 때 `exchange`에 성공하고, `keyi`가 1이 아닌 0이 되어 C.S에 진입합니다

잠긴 방 문을 열기 위해 모든 프로세스가 자물쇠 키인 `keyi`를 가지고 있지만, 이 값이 1이면 키가 가짜 키입니다 ㅜㅜ\
여러 프로세스들이 이 가짜 키를 진짜 키로 바꾸기 위해 `bolt`와 `keyi`를 바꿔먹지만,\
단 하나의 프로세스만이 `bolt==0`일 때 키를 바꾸는데 성공하여 C.S로 진입합니다.\
그럼 프로세스가 C.S를 빠져나오기 전까지는 모든 프로세스가 본인의 열쇠를 진짜 열쇠로 바꿀 수 없고,\
C.S를 빠져나온 프로세스가 진짜 열쇠를 두고 가면(`bolt=0`) 다시 또 선착순으로 진짜 열쇠를 누군가 얻게 됩니다.

# 장점과 단점

Hardware Instruction을 통해 Mutual Exclusion을 구현하는 두 가지 방법을 알아보았습니다\

Software Approach로 구현할 때와 비교해보면

- process가 많아도 간단히 적용할 수 있다
- C.S가 여러번 반복되어도 여전히 강력하다

라는 장점이 존재합니다\
그러나..

- 여전히 `while`과 같이 가짜로 기다리기 때문에, *busy-waiting*문제가 여전히 존재한다
- starvation을 막을 방법이 없다..
  - 어떤 프로세스가 C.S를 빠져나와 다시 줄을 서고는, 대기중인 프로세스를 제끼고 또 C.S에 들어가버릴 수 있다는 뜻
  - {`bolt=0` --> non-CS구간 지나서 --> 다시 C.S 직전의 hardware instruction 실행 --> 바로 C.S로 재진입 성공}과 같은 과정을 timeout 되기 전에 반복해버릴 수 있습니다
    ![무한으로 즐겨요](image-4.png)
    <span style="font-size:70%">from. 명륜진사갈비</span>\
    무한으로 즐겨요~

와 같은 단점이 존재합니다.
또한 deadlock 발생 가능성이 존재하지만,\
이건 C.S를 다중으로 구현하여 `while`(또는 `do-while`)문을 여러 개 쓰게 되면 발생하는 문제라서\
hardware instruction 방법 자체의 문제라기에는 좀 .. 애매하네요

---

\
이런 노력에도 불구하고 문제를 완전히 해결할 수는 없었네요..

![역시 형이야](image-3.png)

결국 우리의 친구 OS가 도와줘야겠습니다..\
OS는 `while`로 가짜로 기다린다거나 그러지 않습니다.\
_그냥 블락시켜버리면 그만이야~_ 거든요\
다음 포스팅에서는 OS가 제공하는 툴로 Mutual Exclusion을 구현하는 방법에 대해 알아보겠습니더

이만 마칩니다
