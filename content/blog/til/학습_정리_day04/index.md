---
title: "메모리 공간을 효율적으로 쓰고 싶어요"
date: 2024-07-19 01:52:28
description: "메모리 공간을 자르니까 자꾸 빈 공간이 남는데.."
tag: ["TIL", "OS"]
---

## Partitioning

### Fixed Partitioning

**처음부터** 조각을 잘라두자.

- Equal-size : 모두 같은 사이즈로
  - 컴파일 할 때도, "나 여기서부터 시작한다!!"를 미리 정하고 들어갈 수 있어서, Relocation 문제를 걱정할 필요가 없다
  - 그런데, 조각들이 프로크램 사이즈에 딱 맞을 수는 없다. 공간 낭비가 생김
- Unequal-size : 다양한 크기의 조각으로 나누자.
  - 딱히 Equal-size보다 효율적이진 않음.
- 두 방식 모두, 어떤 식으로든, **공간의 낭비**가 생긴다 => **Internal Fragmentation**

### Dynamic Partitioning

**필요한 만큼** 그때그때 잘라주자.

- 미리 나눠두지 않는다 : 만약 56M만큼 빈공간이 있었는데,
  - 20M 프로그램이 도착? 준다 => P1
  - 14M 프로그램이 도착? 준다 => P2
  - 18M 프로그램이 도착? 준다 => P3
  - P2가 만약 Suspend되어 Swap-out : 중간에 14M 비었고, 밑에는 4M 비었다
  - 8M 프로그램 도착 ? 준다 => P4, 중간에 6M 구멍이 생겼다
- 위와 같이, 중간에 구멍이 나고, 구멍이 나고, => **External Fragmentation** 발생.
- **Compaction**으로 해결 : 프로그램들을 위로 다 밀어붙이고, 공간을 병합한다
  - Dynamic Partitioning 쓰려면 주기적으로 이거 해줘야 한다
  - 근데 이거 하려면 각 프로세스가 차지하는 메모리를 한 줄 한 줄 주르륵.. 써야한다 : 메모리 **읽기/쓰기**를 엄청나게 하므로, 시간이 매우 오래걸리는 동작임

#### Placement를 잘해봐요

![](https://i.imgur.com/2h3dWaR.png)

- **_Best-fit_** : 위에서부터 **가장 잘 맞는 공간** 찾기. 16Mbyte면, 16Mbyte 이상이면서, 빈 공간을 최소로 하는 공간을 찾자.
  - 근데 찾으려면, 모든 공간을 들춰봐야 함.. **시간이 걸린다**
- **_First-fit_** : 가장 먼저 만나는 **가능한 빈 공간**에 넣자. 다 찾지 말고
  - 빈 공간들을 링크드리스트로 연결해서 => 넣을 수 있는 공간을 탐색하기.
  - 공간을 찾는데 **시간이 더 줄었으나, 빈 공간이 더 생긴다**
  - 또한, 앞에서부터 탐색하므로, **앞쪽만 계속 조각나는 경향**이 발생
- **_Next-fit_** : first-fit처럼 가능한 공간을 찾으면 끝이지만, 앞에서부터가 아니라 **마지막으로 할당한 공간 다음부터 검색**
  - 앞쪽만 조각난다는 단점을 해결하고, 공간을 전체적으로 사용 => . first-fit에 비해 괜찮은 공간을 더 빨리 찾을 확률이 높다.
- **Worst-fit** : **가장 큰 공간**을 찾는다.
  - 가장 큰 공간이므로, 프로세스 넣고도 충분히 큰 공간이겠지?
  - 이러면 오히려 external fragmentation을 줄이는 방법이 될 수 있겠지?

근데 당연히 이렇게 발버둥쳐도 external-fragmentation은 여전히 발생하고, compaction을 안 할 수는 없다

## Buddy System

$\approx$ Lazy Segment Tree?

fixed에서, 미리 잘라둔 공간에 프로세스를 넣고 남는 공간이 생김 : **Internal Fragmentation**
dynamic에서, 프로세스 넣고 사이사이 남은 공간이 생김 : **External Fragmentation**

**_Buddy System_** : 공간이 필요할 때마다 적당한 크기의 공간을 나눠줄건데(dynamic처럼), 프로세스가 요구하는 만큼 딱 맞추는게 아닌 정해진 규칙을 따른다 (fixed처럼)

- ![](https://i.imgur.com/dockjk4.png)
- 전체 공간을 $2^U$
- 어떤 프로세서가 공간을 $S$만큼 요구하면, $2^n-1 < S <= 2^n$ 일거고, 이 경우 $2^n$을 준다
- 공간을 나눠주려면, 전체 메모리를 반으로, 반으로, 반으로, ... 자르다가 더 자르면 요구치보다 작아진다? 그러면 멈추고 현재 조각을 준다
- 나눌 때마다, 나눈 결과인 두 조각은 **버디**가 된다. 공간을 병합할 때는 반드시 버디끼리.
- 공간과 공간 사이의 External Fragmentation은 없고, 따라서 Compaction은 하지 않는다
- Internal Fragmentation은 발생할 수도 있긴 함
