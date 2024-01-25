---
title: 💾 직렬화.. 라고 아시나요?
date: "2024-01-25T20:02"
description: "저는 당연히 몰랐습니다"
tag: ["Java"]
---

여전히 스프링 공부중입니다\
로그인 구현 파트인데요,\
세션에 유저 정보를 저장하려고 **SessionUser** 클래스를 따로 만들었습니다\
이미 **User** 엔티티 클래스가 존재하는데도 말이죠??\
그 이유를.. **직렬화**를 언급하시며 설명해주셨습니다

이 **직렬화**라는 용어는 며칠 전에 디자인패턴 책을 보다가 잠깐 언급된걸 봤었는데\
스프링 공부하다가 **직렬화**를 또 만나고나서 그날 밤\
디자인패턴 책의 **커맨드 패턴** 부분에서 **직렬화**가 또! 나와버렸습니다???

흠..

# 직렬화(Serialization)란?

> serialization은 지속시키거나 전송할 수 있는 형태로 개체 상태를 변환하는 프로세스입니다.

마이크로소프트 .NET docs에서 가져왔습니다

여러 글들을 뒤적뒤적해본 결과.. 직렬화는 사실상\
어떤 객체나 데이터를 **박제**한다고 보면 편한 것 같습니다

**직렬화**는 어떤 객체나 데이터를 어떤 일관적인 포맷으로 변환하여, 파일이나 데이터베이스 또는 메모리 등에 저장하거나 다른 시스템 환경으로 전송할 수 있도록 하는 과정이며\
또한 **역직렬화**는 이렇게 변환되었던 포맷을 원래의 객체나 데이터로 다시 원상복구하는 과정입니다

# 커맨드 패턴에서 만난 직렬화

커맨드 패턴의 자세한 설명은 거두절미하겠습니다\
[여기](https://refactoring.guru/ko/design-patterns/command)에 꽤 설명이 잘 되어 있습니다.\
대충.. 어떤 일련의 동작들이나 요청들을 객체의 형태로 캡슐화하는 셈인데요\
이렇게 만들어진 커맨드 객체는 다른 여느 객체와 마찬가지로 직렬화될 수 있다는 특징을 가집니다.\
그 덕분에 커맨드 패턴을 이용하면 작업들을 대기열에 넣거나, 실행을 지연 또는 예약하거나, ... 할 수 있습니다.

예를 들어.. 유튜브를 틀어놓고, 파일을 다운로드받으면서, 동시에 이메일을 쓴다고 해봅시다.\
공통점 하나 없는 작업들이지만, 커맨드 패턴을 사용한다면

- 영상 재생
- 파일 다운로드
- 키보드 입력

이 세 가지의 서로 다른 작업들은 커맨드 객체로 캡슐화하고, 각 커맨드 객체의 실행 메서드를 트리거하기만 하면 됩니다.\
<img src="https://i.imgur.com/EriLecS.png" alt loading="lazy" width="40%" height=auto />\
이제 작업의 수행은 객체를 트리거하며 통과시키는 것으로 이루어지게 되었으므로,\
커맨드 객체들이 지나간 로그를 찍어두면 상태를 저장하고 나아가 복원해버릴 수 있습니다.**직렬화**되었네요!

# JAVA에서의 직렬화

자바에서는 **직렬화**가 이렇게 통합니다.

> 자바 시스템에서 사용되는 객체 또는 데이터를 바이트 스트림 형태의 연속적 데이터로 변환하는 과정

늘 그렇듯이, 객체는 힙 또는 스택 메모리에 존재했다가 프로그램이 종료되면 사라집니다.\
이 때 객체를 직렬화하여 **박제**해버리면 JVM 메모리에 존재하던 객체를 *영속화(Persistence)*하여 휘발성 데이터를 지속적으로 저장하게 됩니다.

이러한 특징 덕분에, 자바에서는 직렬화를 사용하는 경우가 더러 있는데요, 대표적으로

- 세션 : 톰캣 세션 클러스터링을 수행하거나 세션 데이터를 DB에 저장하고자 하는 경우 등
- 캐시 : DB에서 조회한 객체를 직렬화하여 따로 뒀다가, 또 필요할 때 재조회보다는 역직렬화하여 가져다 쓰도록 함

직렬화를 구현하려면 클래스 선언 시 `Serializable` 인터페이스를 구현합니다.\
이 인터페이스는 따로 구현해야할 추상메서드가 없는 **마커 인터페이스**입니다.\
이제 직렬화하려면 `ObjectOutputStream` 스트림에 객체를 출력합니다 : `.writeObject()` 메서드 호출\
또한 역직렬화하려면 `ObjectInputStream` 스트림으로부터 객체를 입력받습니다 : `.readObject()`메서드 호출\
역직렬화할 때는 원본 클래스로 캐스팅해줘야 합니다.

한번 해볼까요?\
먼저 대충 `Foo` 클래스를 아무렇게나 만들어봅시다

```java
public class Foo implements Serializable {
	public static int staticField = 10;
	public String email = "sungho@example.com";
	private String name = "sungho";
	private int password = 1234;

	public String getName() {
		return this.name;
	}
	public void setName(String name) {
		this.name = name;
	}
}
```

그런 다음 직렬화하는 테스트 코드를 작성해봅시다 :

```java
public class SerializationTest {
	public static void main(String[] args) {
		// 객체 생성
		Foo foo = new Foo();
		// 직렬화된 데이터를 저장할 파일 이름
		String fileName = "foo.ser";

		// 직렬화
		try (ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream(fileName))) {
			oos.writeObject(foo);
			System.out.println("직렬화 완료");
		} catch (IOException e) {
			e.printStackTrace();
		}
	}
}
```

자바에서 직렬화된 데이터 파일은 `.ser`, `.obj`등을 사용한다고 하네요. 그냥 바이트의 연속체라서 `.txt`도 무방하긴합니다
아무튼 실행하고 한번 열어보면\
<img src="https://i.imgur.com/5gw7b3T.png" alt loading="lazy" width="50%" height=auto/>\
헉 알아볼 수 없는 문자들이 가득하죠?

이제 역직렬화를 해봅시다

```java
public class DeserializationTest {
	public static void main(String[] args) {
		String fileName = "foo.ser";
		// 역직렬화
		try (ObjectInputStream ois = new ObjectInputStream(new FileInputStream(fileName))) {
			Foo deserializedFoo = (Foo) ois.readObject();
			System.out.println("역직렬화 완료");

			// 역직렬화된 객체의 정보 출력
			System.out.println("Name: " + deserializedFoo.getName());
			System.out.println("Email: " + deserializedFoo.email);
		} catch (IOException | ClassNotFoundException e) {
			e.printStackTrace();
		}
	}
}
```

이렇게 해서 실행해보면\
<img src="https://i.imgur.com/fp430FX.png" alt loading="lazy" width="40%" height=auto/>\
헉?? **생성자 없이도 객체가 생겨버렸습니다** !!

주의할 점이 몇 가지 있는데요

- 직렬화 대상은 인스턴스 필드이며, 메소드나 `static` 필드 등은 제외입니다.
- 여러 객체를 직렬화하는 경우, 순서에 유의합니다 :\
  obj1, obj2, obj3 순서로 직렬화했다면, 동일하게 obj1, obj2, obj3 순서로 역직렬화해야합니다. 이는 사실 직렬화 순서대로 바이트문자가 기록되니 그래야만 하겠죠?
  직렬화 대상 객체가 많다면 대신 `ArrayList`같은 컬렉션에 넣고 직렬화합시다. 이렇게 하면 역직렬화 순서를 신경쓰지 않아도 됩니다.
- `private` 필드까지도 직렬화에 포함됩니다. 만약 직렬화에서 제외시키고자 한다면 필드 선언 시 `transient` 키워드를 붙이면 됩니다.
- (당연한 듯 하지만) 부모클래스가 `Serializable` 구현체이면 자식클래스 또한 직렬화 대상입니다. 반대로 자식클래스가 직렬화여도 부모의 인스턴스 필드는 포함되지 않습니다.

# JSON 쓰면 안될까요?

JSON으로 데이터를 주고받는 것도 직렬화/역직렬화의 일종입니다. 그냥 JSON써서 데이터를 주고받으면 안될까요? 아니면 XML이라거나..

물론 JSON도 좋지만 자바에서 자바 직렬화를 사용하는 이유는, 자바 맞춤형이라 자바 시스템끼리의 상호작용에 상당히 효율적입니다.\
이는 직렬화된 자바 바이트스트림은 단순 데이터만 포함하는 것이 아닌, 타입 정보, 클래스 메타 데이터 등까지도 포함하기 때문인데요\
같은 자바 시스템끼리라는 전제가 있다면 사실상 그대로 갖다 이식해버리는 수준이 되어버립니다.\
JSON이었다면 파싱해서 인스턴스화하고, 등등... 귀찮은 일을 더 했어야겠죠?

물론 이 특징으로 인해 JSON보다 무거워진다거나, 이외에도 다른 단점들이 존재합니다.

# JAVA 직렬화의 단점 ㅜㅜ

일단 직렬화를 구현하기로 하면 신경써야 할 점들이 많습니다..

- 직렬화하여 일단 한번 배포하고 나면, 이 직렬화된 바이트 스트림 인코딩이 사실상 하나의 공개API가 되어버립니다.\
  이로 인해 클래스 내부 구현을 수정하기 껄끄러워질 수 있겠죠?
- 아까 살펴본 바와 같이, `private`멤버까지도 `transient`가 없다면 그대로 직렬화되므로 캡슐화가 깨진다는 문제가 있습니다.
- 객체를 생성자를 통해 생성했던 기존의 방식을 우회하여 제약없이 객체를 생성한다는 특징때문에 버그나 보안에 취약할 수 있습니다.
- 역직렬화 과정에서 공격당할 위험이 존재합니다. 역직렬화 시 호출되어 위험한 동작을 수행하는 메서드를 *가젯(gadget)*이라고 합니다.
- 직렬화를 지원하는 클래스를 상속받게 된다면 이렇게 신경써야할 문제들 또한 떠안게 되어버립니다..

등등 ... 여러가지가 있으니\
꽤나 잘 생각해서 적재적소에 써야 하겠습니다

---

# REFERENCE

- https://inpa.tistory.com/entry/JAVA-%E2%98%95-%EC%A7%81%EB%A0%AC%ED%99%94Serializable-%EC%99%84%EB%B2%BD-%EB%A7%88%EC%8A%A4%ED%84%B0%ED%95%98%EA%B8%B0
- https://refactoring.guru/ko/design-patterns/command
- https://namu.wiki/w/%EB%8D%B0%EC%9D%B4%ED%84%B0%20%EC%A7%81%EB%A0%AC%ED%99%94%20%ED%98%95%EC%8B%9D
- https://learn.microsoft.com/ko-kr/dotnet/standard/serialization/
- https://ko.wikipedia.org/wiki/%EC%A7%81%EB%A0%AC%ED%99%94

---

이거 쓰다가 집에 늦게 갑니다..\
이만 마칩니다
