---
title: "📜 Gemini CLI에게 주간 업무 요약 Github Action 만들어달라 하기"
date: 2025-09-07 16:24:10
description: "기록을 요약해라 마이 잼민아~"
tag: ["Github Action", "AI Tools"]
---

저는 [Obsidian](https://obsidian.md/)에 회사 업무기록을 남기는데  
문제는 제가 기록한 것 그대로의 메모들은 되게 날 것이라, 어디 내놓을 수도 없고 나중에 찾아보기도 힘듭니다.  
또 문제는 이렇게 메모만 해놓고 거의 잊혀진다는 것인데요  
이게 언젠가는 "아!!이거 저번에 얘기 나눈거 적어놨는데, 어디에 있더라??"가 됩니다  
그리고 가끔, "TODO"로 적어두고도 까먹고 넘어가는 경우도 있고요..  
그래서 생각한 것은 ~~

어차피 [obsidian-git](https://github.com/Vinzent03/obsidian-git)플러그인으로 메모들을 비공개 레포지토리에 자동으로 올리고 있고,  
그럼 **Github Action + Gemini CLI로 주기적인 요약 워크플로우**를 돌리면 어떨까?? 를 떠올렸습니다!  
그리고 이런 작업을 Gemini CLI와 함께 하면 뚝딱 만들 수 있을 것 같았어요

바로 시작해봅시다.

# Gemini CLI ?

[Gemini CLI](https://github.com/google-gemini/gemini-cli)는 **CLI 환경에서 곧바로 Google Gemini를 사용해볼 수 있는 오픈소스 AI 에이전트**입니다.  
개인 Google 계정을 등록만 하면 무료 티어에서도 분당 60회 & 일 1,000회 이내의 요청을 사용할 수 있고  
또한 Gemini 2.5 Pro 모델, 구글 검색, 파일 시스템 작업, 쉘 커맨드 실행, MCP 등 많은 기능을 제공합니다

![대만족](https://i.imgur.com/0mAyZ8U.png)

아래 방법 중 하나로 시작해볼 수 있습니다

```bash
npx https://github.com/google-gemini/gemini-cli
npm install -g @google/gemini-cli
brew install gemini-cli
```

설치하고나면, `gemini` 명령으로 채팅 모드에 들어갈 수 있구요

![gemini cli 챗모드](https://i.imgur.com/Ars2RQq.png)

또는 `gemini -p "현재 코드베이스에 대해 설명해줘"` 와 같이 프롬프트를 바로 전달할 수도 있습니다.

# 시작하기 전에, Github Action을 로컬에서 실행할 수 있게 세팅하기 (`act`)

Github Action 초짜인 저로서는 이게 잘 돌아가는지 확인하는 과정 자체가 스트레스인데요  
workflow 파일을 수정하고, push해서, 잘 돌아가는지 확인하는게 굉장히 귀찮습니다

![불편..](https://i.imgur.com/GCxiVzN.png)

이럴 때 유용한게, **Github Action을 로컬에서 구동해주는 툴인 [act](https://github.com/nektos/act)** 입니다.  
act를 사용하여 Github Action을 로컬에서 구동하면  
(1) 피드백도 빠르게 받을 수 있고, (2) 오프라인 환경에서도 개발할 수 있으며 (3) 디버깅하기 좋은 등등.. 효능이 아주 많습니다

![편안-](https://i.imgur.com/o6qIoqj.png)

그래서 [`act`를 사용하여 깃허브 액션을 로컬에서 실행하기](https://apidog.com/kr/blog/how-to-run-your-github-actions-locally-a-comprehensive-guide-kr/)라는 Apidog 글을 참고해서 act를 먼저 준비해보기로 했습니다.

참고로 **act는 Docker가 있어야만 사용할 수 있습니다**.  
Github Action처럼 워크플로우 실행을 위해 격리된 환경을 생성할 때 Docker를 사용하기 때문임다  
그러니 [Docker를 먼저 준비](https://docs.docker.com/get-started/get-docker/)해주세요.

Docker가 준비되었다면, 맥에서는 `brew install act` 로 act를 설치하고  
`act` 명령을 터미널에서 입력하여 실행할 수 있습니다  
또한 워킹 디렉토리에 실행가능한 workflow나 job이 뭐가 있나 확인하려면  
`act -l`로 그 목록을 볼 수 있습니다

![act -l](https://i.imgur.com/OnT949q.png)

`-j` 옵션으로 job을 명시해 실행할 수도 있습니다

```
act -j summarize
```

![is docker deamon running?](https://i.imgur.com/JEUzquE.png)

이러고 끝난다면 Docker 안켜신거니까 켜주시구요

![Docker Pull에서 무한대기](https://i.imgur.com/2lPMOSk.png)

이러고 뭔가 반응이 없어서 찜찜하시면 `--verbose` 옵션을 켜주세요. 말이 많아져서 뭔가 하고있는게 느껴지고 안심됩니다

# Github Action Workflow 작성하기

먼저 이름을 대충 지어서 `.yaml`파일을 `.github/workflows/` 폴더 밑에 만들어주고, 워크플로우 작성을 시작합시다

## workflow `.yaml`파일 작성

저는 이 요약 워크플로우를 **주기적으로 실행하게 스케줄링** 할건데,  
매주 토요일 06:00 KST(금요일 21:00 UTC)로 정했습니다.

```yaml
name: Weekly Notes Summary

permissions:
  contents: write

on:
  schedule:
    - cron: "0 21 * * 5"
  workflow_dispatch:
```

`workflow_dispatch` 또한 추가해주어서 Github Actions 탭에서 수동으로 실행할 수 있게 했습니다.  
이제 요약을 진행하는 job을 만들어볼건데

1. 레포지토리 파일들을 읽어야 하니 `checkout`
2. node.js 20 이상(gemini-cli는 최소한 20버전 이상이 필요합니다) + gemini-cli를 설치
3. 이제 gemini-cli에게 요약을 시킵니다.

3번 단계는 별도의 스크립트로 빼서 편하게 작성해볼게요.

```yaml
jobs:
  summarize:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"

      - name: Install Gemini CLI
        run: npm install -g @google/gemini-cli

      - name: Run Summary Script
        env:
          GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
        run: ./scripts/generate_summary.sh
```

다만 스크립트에서, Gemini API Key를 사용해야 하니, **Github Repository Secrets에 등록한 `GEMINI_API_KEY`를 환경변수로** 넣어줍시다.

![Repository secrets](https://i.imgur.com/0FRoOa0.png)

당연히 여기에 미리 준비를 해주셔야 하구요  
이거는 [Google AI Studio](https://aistudio.google.com/)가셔서, 본인 계정 로그인하신 다음, 좌측 하단 `Get API Key`에서 키를 하나 발급받으셔서 넣으면 됩니다

그리고 레포지토리 Settings에 들어오신 김에 해야할 일이 하나 더 있는데  
좌측 메뉴에서 Actions - General에 가셔서

![Workflow Permissions](https://i.imgur.com/6hmQ3Iv.png)

**워크플로우 권한을 `Read and write permissions`** 로 허용해줍시다.  
이 권한이 있어야 워크플로우가 요약 결과 파일을 만들어줄 수 있어요

## 주간 기록을 모아 요약하는 스크립트 작성하기

이제 workflow의 `Run Summary Script` 단계에서 실행하는 `generate_summary.sh` 스크립트를 작성해야 하는데요  
저는 매주 토요일 실행이니, **그 주 월요일부터 생성된 모든 기록들을 요약**할 수 있도록 스크립트를 짜달라고 했습니다.

![해줭](https://i.imgur.com/Ds3v5pF.png)

```sh
#!/bin/bash
set -e

# 1. 지난 월요일 구하기
LAST_MONDAY=$(date -d "last monday" +%F)
echo "Searching for files created since last Monday: $LAST_MONDAY"

# 2. Git을 사용하여 새로 생성된 .md 파일 찾기
FILES_TO_SUMMARIZE=$(git log --diff-filter=A --name-only --pretty=format:"" --since="$LAST_MONDAY" -- "*.md")

# 빈 줄 제거
FILES_TO_SUMMARIZE=$(echo "$FILES_TO_SUMMARIZE" | sed '/^\s*$/d')

if [ -z "$FILES_TO_SUMMARIZE" ]; then
  echo "No new markdown files have been created this week. Skipping."
  exit 0
fi

echo "--- Found files to summarize ---"
echo "$FILES_TO_SUMMARIZE"
echo "--------------------------------"

# 3. 프롬프트 정의
PROMPT=$(cat <<'EOF'
...대충 기록 요약 해달라는 프롬프트 ...
EOF
)

# 4. Gemini CLI로 요약 생성 및 파일에 저장
mkdir -p ./summaries

SUMMARY_FILE_PATH="./summaries/weekly_summary_$(date +%Y-%m-%d_%H-%M-%S).md"
echo "Generating summary and saving to $SUMMARY_FILE_PATH"

FILES=()
while IFS= read -r line; do
  if [[ -f "$line" ]]; then
    FILES+=("$line")
  fi
done <<< "$FILES_TO_SUMMARIZE"
cat "${FILES[@]}" | gemini -y -p "$PROMPT" > "$SUMMARY_FILE_PATH"

echo "Summary generated successfully and saved to $SUMMARY_FILE_PATH"
```

근데 프롬프트가 길어지니까 스크립트에서 인라인으로 관리하기 빡세더라구요  
그래서 `# 3. 프롬프트 정의`를 아래와 같이 바꿨습니다

```sh
# 3. 프롬프트 정의
echo "Get Prompts from TXT"
PROMPT=$(cat ./scripts/prompt.txt)
```

그리고 `prompt.txt`를 만들어서 여기에 프롬프트를 작성해줬어요  
대충 `너는 이런 능력이 있는 짱멋있는 프로젝트 관리 비서입니다.` ..와 같은 롤 부여부터 시작해서  
액션 아이템을 요약하고, 주제별 상세 보고서, TODO라고 해놓고 안한 것 같은거 있는지, ... 등등 필요한 내용을 작성했습니다

`gemini`로 gemini-cli를 부를 때, 대화모드를 켜는게 아닌 **프롬프트만 실행하려면 `-p "$PROMPT"`** 와 같이 옵션을 주어 프롬프트를 전달해줍니다.  
`-y` 옵션 또한 줘야하는데, 이건 **YOLO모드**라고 gemini가 `이거 해도 되나요?`할 때 그냥 모두 OK해버리는 옵션입니다

![진행시켜.](https://i.imgur.com/CF1kPd4.png)

아차, 그리고 **요약 파일을 생성하고 나면, git commit & push**까지 해줘야 합니다.  
안그러면 그냥 요약 파일을 생성하고 읽지도 않고 버린 사람이 되는겁니다~

```sh
# 5.  Git 자동 커밋 및 푸시
git config --global user.name "github-actions[bot]" # github action bot 예시 프로필
git config --global user.email "123456+github-actions[bot]@users.noreply.github.com"

git add "$SUMMARY_FILE_PATH"
git commit -m "chore(summary): weekly summary generated at $(date +%Y-%m-%d_%H:%M:%S)"
git push
```

이를 스크립트의 맨 마지막에 추가해줍니다.

# 해치웠나?

이제 `act -j summarize`로 워크플로우가 잘 만들어졌는지 확인해봅시다.

## GEMINI API KEY를 넣어요

![GEMINI API KEY를 안넣으면 실패~](https://i.imgur.com/EzOHX5k.png)

앗! Gemini API Key를 넣어줘야하네요~  
아까 발급한 Gemini Api Key를 다시 복사해오고요  
**act에서는 `-s FOO=""` 옵션으로 `secret.FOO` 환경변수를 주입**할 수 있으니  
이제 `act` 실행할 때 아래와 같이 하여 GEMINI API KEY를 환경변수로 넣어줍시다.

```sh
act -j summarize -s GEMINI_API_KEY="YOUR_API_KEY"
```

## GITHUB TOKEN도 넣어요 (로컬 실행 시)

![Git Push에서 무한대기](https://i.imgur.com/EA64sM0.png)

이번에는 `git push ...`차례에서 무한대기에 빠져버렸는데요

![로딩중..](https://i.imgur.com/O4upNY5.png)

생각해보니 GITHUB TOKEN을 넣었어야하는게 아닌가? 싶었습니다  
다만 진짜 github action에서는 GITHUB TOKEN을 따로 넣을 필요는 없은께.. 로컬에서 스크립트를 살짝 고쳐서 확인해보려구요

```yaml
 - name: Run Summary Script
        env:
          GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: ./scripts/generate_summary.sh
```

워크플로우 yml에서 env로 `GITHUB_TOKEN`을 script에 주입해줍니다. 그리고

```sh
# 5. Git 자동 커밋 및 푸시

git remote set-url origin https://github-actions[bot]:${GITHUB_TOKEN}@github.com/sunghoon/memo-repository.git
```

원격저장소 주소를 이렇게 시크릿 토큰을 넣은 주소로 바꿔서 이 토큰을 쓰게 합니다  
이제 아래와 같이 (GEMINI API KEY 했던 것처럼) GITHUB TOKEN을 넣어서 실행하면 끗

```sh
act -j summarize -s GEMINI_API_KEY="" -s GITHUB_TOKEN=""
```

이제 요약파일이 잘 생성됐네요~

![요약 잘 됐습니다~](https://i.imgur.com/tNTh7HW.png)

지난 몇 주간 작동하는걸 지켜봤는데, 주기적으로 잘 생성해주더라구요

![주기적 요약 결과](https://i.imgur.com/d8VyyJ5.png)

---

\
이제 이 요약 워크플로우 덕분에 월요일에 우두커니 앉아서 "저번주에 뭐했더라?" 생각하며 멍때리는 일은 없네요

![멍때리기](https://i.imgur.com/FIJBgEv.png)

나중에도 아 저번주에 뭐 했는데 뭐였지? 하면 찾아보기도 편하구요.  
시간될 때 MCP같은 것도 붙여서 Jira, Slack에서 주간 업무 정보들을 더 받아와서 요약에 포함하면 좋을 듯 합니다?  
예를 들어, 일주일 간 Jira 티켓 완료로 넘긴게 뭐 있는지, Slack에서 무슨 논의 했던게 있었는지, ..  
나중에 그런거 하게되면 다시 갖고 돌아오겠습니다.

이만 마칩니다~
