---
title: "Spring Boot CRUD TIL기록 (1)"
date: 2024-08-10 21:52:15
description: "근데 이제 헥사고날 아키텍처를 곁들인"
tag: ["TIL", "Java", "Spring"]
---

> ! 주의 : TIL 게시글입니다. 다듬지 않고 올리거나 기록을 통째로 복붙했을 수 있는 뒷고기 포스팅입니다.

새로운 사이드 프로젝트를 시작했어요  
어렵고 오래 할 그런 건 아니고..  
그냥 적당히 연습해볼 수 있는 정도의 주제를 골랐습니다

저는 익숙하지 않은 백엔드 개발을 맡게 됐어요  
새로운 도전을 하고싶어서 그랬습니다  
전 항상 이것도 잘하고 저것도 잘하는 사람이 되고 싶어 하는데..  
이도저도 아닌 인간이 되고 마는 것이 아닌지? 푸하하

암튼.. 근데 제가 최근까지 바빴어서  
boilerplate를 만들고 소셜로그인 구현같은 초기 세팅 부분들을  
다른 백엔드 전문가인 지인이 좀 해줬습니다.  
앞으로도 좀 리뷰어를 부탁했어요. PR올리면 코드리뷰를 받기로 했습니다  
이제부터 제 백엔드 시니어인 것이애용  
거인의 어깨에서 성장하려니까 두근거리는데요? ㅋㅅㅋ

아무튼 이 말을 왜 하냐면  
**Hexagonal Architecture**를 적용해놨다고,  
설명을 좀 들어야 아마 이해가 갈 것이라고 해서  
특강을 들었었습니다.  
그 내용을 좀 정리한 기록으로 글을 시작하려고 합니다

# 헥사고날 아키텍처를 배웠어요

[헥사고날 아키텍처란?](https://tech.osci.kr/hexagonal-architecture/)  
또는 포트와 어댑터 아키텍처라고도 부른다고 하네요  
이는 내부 비즈니스 로직을 외부와 단절시키고,  
외부와 연결하는 포트/어댑터를 따로 두어 유연성을 높입니다.  
또한 그 덕분에 테스트와 유지보수가 매우 용이하다고 하네요

백문이불여일견이니 직접 봅시다.  
백엔드 사수께서 짜주신 구조는 아래와 같습니다  
혹여나 잘못된 부분이 있으면 제가 잘못 쓴거니까.. 칼같이 지적해주십시요

```
page/
┠━ adapter/
┃   ┠━ in/
┃   ┃  ┠━ PageController (C)
┃   ┃  ┗━ dto/
┃   ┗━ out/
┃      ┠━ PageCommandAdapter (C)
┃      ┗━ PageQueryAdapter (C)
┠━ application/
┃   ┠━ port/
┃   ┃  ┠━ in/
┃   ┃  ┃  ┗━ GetPageUseCase (I)
┃   ┃  ┗━ out/
┃   ┃     ┠━ PageCommandPort (I)
┃   ┃     ┗━ PageQueryPort (I)
┃   ┃
┃   ┗━ service/
┃      ┗━ GetPageService (C)
┠━ domain/
┃   ┗━ entity/
┃      ┗━ Page (C)
┗━ infrastructure/
     ┗━ repository/
        ┗━ PageRepository (I)
```

Hexagonal Architecture를 적용한 Spring Boot 프로젝트 폴더구조.  
서비스 내에서 _자신의 페이지를 생성,수정,삭제,조회_ 하는 기능이 있는데  
해당 기능인 **Page**의 하위 구조입니다.  
`(I)`는 인터페이스, `(C)`는 클래스(구현체) 입니다.  
User, Auth, Page같은 feature? (단위를 이렇게 말해도 되는지 모르겠지만..) 별로 위와 같이 생긴 구조를 가집니다.

- `adapter` : 외부와 연결되는 어댑터
  - `in` : 외부(사용자)로부터 요청이 들어오는, 즉 Controller같은 것들
  - `out` : 외부(DB)로 요청이 나가는, 즉 DB로 가는 출구.
- `application` : 애플리케이션 로직 구현부
  - `port` : 여기에는 내부 로직인 `application`과 바깥 통로인 `adapter`를 연결하는 인터페이스가 자리합니다.
    - `in` : 외부(사용자)에서 내부로 들어오는, UseCase같은 친구들입니다.
    - `out` : 내부에서 외부(DB)로 나가는, 쿼리를 포함할 친구들입니다.
  - `service` : 여기에는 진짜 서비스 로직 구현체가 위치합니다. `~~UseCase`들의 구현체입니다.
- `domain` : 서비스 로직에서 쓰게 되는 객체들
  - `entity`
- `infrastructure` : 객체를 DB에 Mapping하고 영속화하는 레이어? 라고 해야할까요..
  - `repository`같은 애들이 들어갑니다. (`JpaRepository` 등.)

Query를 다시 한 번 Command와 Query로 나누었는데,  
CRUD작업 중 R(READ)만이 Query, 나머지는 Command로 나눕니다.  
이는 데이터베이스 관리를 Master-Slave로 사용하게 될 때를 대비하고자 하는 것이라고 해요.

[웹서비스에서 데이터베이스 작업은 읽기와 쓰기의 비율이 최소 100:1에서 최대 10000:1](https://multicoin.capital/ko/2021/07/30/scaling-reads-and-writes/)까지 간다고 합니다.  
따라서 읽기 부하는 매우 자주 일어난다는 점인데  
[Master-Slave 복제](https://mariadb.com/ja/resources/blog/database-master-slave-replication-in-the-cloud/)는 이러한 읽기 부하를 분산하기 위해 자주 사용됩니다  
이는 곧, Write(Create, Update, Delete)만 수행하는 Master 데이터베이스를 따로 두고  
이를 복제하여 Slave로 만들어 두고, Read작업은 이 Slave에서만 수행합니다.  
이제 Master-Slave 간의 데이터는 일정 주기마다 동기화하면 되겠죠?  
Write작업의 반영이 진짜 즉 시 반 영 되어야 하는 (금융처럼) 특별한 서비스가 아니라면 꽤 유용할 것 같아요  
Slave를 여럿 두면 비중이 높은 Read 부하를 분산시킬 수 있고,  
Slave를 하나만 두더라도, 트랜잭션으로 인한 lock같은 경우에 read는 방해받지 않으니 병목도 줄어들 것 같습니다  
또한 데이터를 복제해 두었으니, 문제가 생겨도 어느 정도는 안심이겠네요

아 그리고, `Service`는 `UseCase` 구현체고, `QueryPort`/`CommandPort`는 `QueryAdapter`/`CommandAdapter`의 구현체인데  
`Controller`나 `Service`같은 데서 이용할 때는 인터페이스인 `UseCase`, `Port`를 주입받게 해요. (빈으로 등록해뒀고, 인터페이스의 유일한 구현체가 `UseCase/Port`)  
구현체가 아닌 추상계층에 의존하게 하여 결합도를 낮추는 셈

## 이외 신경 쓸 것들

`Controller`만이 인터페이스 없이 바로 구현체인데,  
`Controller`는 개발 중에 그 구조의 수정이 매우 빈번한 편이고, 주입받아 사용하는 곳도 없으니 굳이 추상화를 하지 않았다고 하네요  
근데 예외로, Swagger 쓰려면 인터페이스를 만들어야 해요  
그래서 그냥 Swagger Interface는 나중에 Controller 거진 다 만들고 지피티한테 작성해달라고 하고 있습니다 ㅋㅋ

그리고 엔드포인트 작성 시 경로를 `/api/v1/` 꼭 이런 prefix를 붙이자고 했습니다  
일단 `/api/`를 붙여야 함은, 배포 시 어떤 경로에 대한 요청이 백엔드로 가는 것인지, 프론트로 가는 것인지 알아야 하겠죠?  
이는 [Vercel 배포](https://sungpaks.github.io/deploy-your-project-with-vercel/)할 때 매우 느꼈습니다
그리고 나중에 가면 기존 기능을 더욱 디벨롭하고싶거나, 뭐 그런 충동이 들게 될 수 있는데  
그렇다고 기존 기능을 바로 수정하거나 폐기해버리면 이전과 호환이 되지 않겠죠?  
레거시 기능들은 그대로 `/v1/`으로 두고, `/v2/`처럼 새로운 버전으로 만들면 되는 일이라서, 저런 prefix가 붙게 되었습니다

이외에도, `ResponseEntity<?>` 과 같이 응답용 Wrapper Class, `ApiResponse.ok()`와 같은 응답 상태 유틸, GlobalException 등을 구현해 놓았으니 적당히 이런걸 잘 사용하라는 전언이 있었습니다

# 이제 CRUD 만들어봐요

아키텍처는 알겠고, 이제 구현해봅시다.  
`id, userId, title` 이러한 간단한 내용만을 갖는 **페이지**를  
생성, 조회, 업데이트, 삭제, 모두 가능하게 CRUD를 구현하는 것이 목표입니다

## Controller

`@GetMapping("/{id}"), @PostMapping("/create")`와 같이 경로를 매핑하고, 메서드를 적절히 작성해줍니다  
`/{id}`와 같은 경로 변수는 인자에서 `@PathVariable`로 받아올 수 있고,  
인자에서 `@RequestBody`를 사용하여 Request Body의 JSON 데이터를 Java 객체에 매핑할 수 있습니다.  
아래처럼요

```java
@PutMapping("/{id}")
public ResponseEntity<?> updatePage(@PathVariable Long id, @RequestBody PageRequestDto pageRequest)
{
	/* TODO : 업데이트 로직을 추가 */
    return ResponseEntity.ok(ApiResponse.success());
}
```

근데 받아올 DTO 객체가 필요해서, Controller가 있는 패키지 하위에 `/dto` 패키지를 만들고, dto를 작성했습니다

```java
@Getter
@Setter
@RequiredArgsConstructor
public class PageRequestDto {

	@NotBlank(message = "User Id Is Required")
	String userId;

	@NotBlank(message = "Title Is Required")
	String title;
}
```

이런 식으로 했어요

## Entity와 Repository

이제 Page에 대한 객체 Entity와 이를 맵핑하는 Repository를 만들어봅시다

Repository는 간단히 아래처럼

```java
// page/infrastructure/repository/PageRepository.java
public interface PageRepository extends JpaRepository<Page, String> {}
```

이렇게만 해주면 JPA성님께서 다 해주십니다.  
그럼 아까부터 빨간 줄이 좍좍 그어지는 이 Page를 작성해주러 갑시다

```java
// page/domain/entity/Page.java

@Getter
@Entity
@Table(name="wai_page")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
public class Page {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column
	private String userId;

	@Column
	private String title;

	public static Page of(String userId, String title) {
		return new Page().builder().userId(userId).title(title).build();
	}
}
```

id는 `@GeneratedValue`로 적당히 생성하게 했습니다  
`IDENTITY`로 하면 PK생성을 데이터베이스에 위임하고 `AUTO_INCREMENT`(mysql기준)같은 기능으로 자동 생성하게 한다고 하네요

그리고 생성자를 직접 건드리지 않게 막고, 정적 메서드인 `.of()`로 가져오게 했습니다  
왜인지? 모르겠지만? 인자로 `id`를 요구하기에 `builder`로 생성했어요

## port와 adapter (out)

이제 Page 객체 클래스도 만들었고, DB와 맵핑하는 JpaRepository도 만들었으니  
out포트와 그 구현체인 adapter를 만들어봅시다

port는 적당히 아래와 같이 작성해요

```java
public interface PageQueryPort {

    Optional<Page> findById(Long pageId);

    List<Page> findAll();
}
```

`findById`, `findAll`같은 read작업은 `QueryPort`에  
`save, delete`같은 `write`작업은 `CommandPort`에 작성합시다

이제 구현체인 Adapter를 작성해보면

```java
@Repository
@RequiredArgsConstructor
public class PageQueryAdapter implements PageQueryPort {

	private final PageRepository pageRepository;

	@Override
	public Optional<Page> findById(Long pageId) {
		return pageRepository.findById(pageId);
	}

	@Override
	public List<Page> findAll() {
		return pageRepository.findAll();
	}
}

```

`QueryPort`를 구현하여 `QueryAdapter`를 만들었습니다  
이렇게 하면 나중에 `findById`를 jpa가 아닌 다른 방법으로 가져오게 되는 경우에도  
모든 코드의 `findById`를 바꾸는게 아닌, 여기 이 메서드만 바꿔주면 되겠죠?

# UseCase와 Service (in)

이제 DB와의 내통 준비가 끝났으니, 인바운드 작업을 작성해봅시다.

먼저 `/port/in` 에 UseCase를 작성해봅시다.

```java
public interface GetPageUseCase {
	Page getPage(Long id);

	List<Page> getAllPages();
}
```

이런 식으로요  
이제 이걸 Service에서 구현하게 되는데

```java
@Service
@RequiredArgsConstructor
public class GetPageService implements GetPageUseCase {
	private final PageQueryPort pageQueryPort;

	@Override
	public Page getPage(Long id) {
		return pageQueryPort.findById(id).orElseThrow(()-> new NotFoundException("해당 페이지를 찾을 수 없습니다."));
	}

	@Override
	public List<Page> getAllPages() {
		return pageQueryPort.findAll();
	}
}
```

간단히 이렇게 작성해볼 수 있겠습니다  
앗! 그런데 `getPage`에서, `pageQueryPort.findById()` 를 바로 뱉는게 아니라, `orElseThrow`가 있어요.  
`findById(id)`의 리턴값은 Optional이라서, 있으면 정상적으로 뱉고, 없다면 예외를 던집니다.  
따라서, `orElseThrow`를 더해서, 있으면 리턴, 없으면 `NotFoundException`을 던지게 했습니다.

## 해치웠나?

이렇게 했으면 이제 Controller의 TODO를 지울 때가 됐습니다

```java
@PutMapping("/{id}")
	public ResponseEntity<?> updatePage(@PathVariable Long id, @RequestBody PageRequestDto pageRequest) {
		updatePageUseCase.updatePage(id, pageRequest);
		return ResponseEntity.ok(ApiResponse.success());
	}
```

이런 식의 코드가 가능하겠죠?

이거 기록하면서 코드 보다보니 `update`로직이 찐 업데이트가 아닌 새 데이터를 생성하고 있더라구요??  
바로 고쳤습니다..  
이외에도 문득 눈에 들어온 게 있어서 두 가지 정도 수정을 좀 했네요  
기록과 리캡이 이렇게 중요합니다.
