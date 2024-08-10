import os
import sys
from datetime import datetime

def create_index_md():
    # 폴더 생성
    folder_name = os.path.join("content", "blog", "til" , sys.argv[1])
    os.makedirs(folder_name, exist_ok=True)

    # index.md 파일 경로 생성
    file_path = os.path.join(folder_name, 'index.md')

    # front matter 작성
    front_matter = f'''---
title: "제목"
date: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}
description: "설명"
tag: ["TIL", ]
---

> ! 주의 : TIL 게시글입니다. 다듬지 않고 올리거나 기록을 통째로 복붙했을 수 있는 뒷고기 포스팅입니다.

'''

    # index.md 파일 생성 및 front matter 추가
    with open(file_path, 'w') as file:
        file.write(front_matter)

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("폴더 이름을 입력해주세요.")
        sys.exit(1)

    create_index_md()

# python frontmatter_script.py "생성할 폴더 이름"
# 위와 같이 명령어를 실행하여,
# content/blog/"생성할 폴더 이름" 폴더를 생성하고
# frontmatter가 미리 작성된 index.md 파일을 생성합니다.