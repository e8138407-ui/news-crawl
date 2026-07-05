# 아이폰만으로 GitHub + Vercel 배포하기 (실제 성공한 방법)

컴퓨터 없이 아이폰(iOS)만으로 이 프로젝트를 GitHub에 올리고 Vercel로 배포하는 데 성공한 실제 과정을 정리한 문서입니다. 시행착오까지 포함해 정리했으니, 같은 상황이면 그대로 따라 하면 됩니다.

---

## 0. 준비물

- 아이폰
- GitHub 계정 (이 코드가 이미 올라가 있는 저장소에 접근 권한 있는 계정)
- Vercel 계정 (GitHub 계정으로 로그인 가능)
- Anthropic API 키 (`sk-ant-`로 시작)

---

## 1. 터미널 앱 설치: iSH Shell

아이폰에서 git 명령어를 쓰려면 터미널 앱이 필요합니다.

**시도했지만 안 됐던 것들:**
- `Working Copy` 앱 — 앱스토어에서 검색이 안 됨 (지역/계정에 따라 다를 수 있음)
- `a-Shell` — 설치는 됐지만 `git: command not found` 에러 발생 (버전에 따라 git이 기본 포함 안 될 수 있음)

**실제로 성공한 방법:**

1. App Store에서 **"iSH Shell"** 검색 후 설치 (무료, Alpine Linux 기반 터미널)
2. 앱 실행 → 아래 명령어로 git 설치:
   ```
   apk add git
   ```
3. 설치 완료 메시지(`OK: 21 MiB in 21 packages` 등)가 뜨면 준비 끝.

---

## 2. GitHub 새 저장소 만들기 (앱 사용)

1. GitHub 공식 앱(App Store에서 "GitHub" 검색) 설치 및 로그인
2. 앱에서 `+` 버튼 → New repository
3. 이름 입력 (예: `news-crawl`), Public/Private 선택 → Create
4. **주의**: 이 공식 앱은 "새 저장소 생성"까지만 가능하고, 로컬 폴더를 통째로 업로드하는 기능은 없습니다. 실제 코드 push는 iSH(터미널)에서 진행합니다.

---

## 3. Personal Access Token 발급

GitHub은 2021년부터 git push/clone 시 계정 비밀번호를 허용하지 않고, 토큰만 허용합니다.

1. Safari로 `github.com/settings/tokens` 접속
   - "Confirm access" 같은 재인증(sudo mode) 화면이 뜨면, **"Use GitHub Mobile"** 버튼 탭 → GitHub 앱에서 알림 승인 (또는 "Send a code via email"로 이메일 인증)
2. **Generate new token → Generate new token (classic)**
3. Note: 아무 이름 (예: `news-crawl-push`)
4. Expiration: 30 days 정도
5. 권한(scope): **`repo`** 전체 체크
6. **Generate token** 클릭
7. `ghp_`로 시작하는 토큰이 화면에 나오면 **길게 눌러 Copy** (이 화면을 벗어나면 다시 볼 수 없음)

⚠️ 토큰은 비밀번호와 같습니다. 스크린샷 등으로 노출됐다면, 사용 후 반드시 같은 페이지에서 **Delete**(삭제)하고 새로 발급하세요.

---

## 4. iSH에서 git clone / push

토큰 프롬프트(Username/Password 별도 입력)가 계속 인증 실패를 일으켜서, **토큰을 URL에 직접 포함시키는 방식**으로 해결했습니다. 아래처럼 한 줄 전체를 입력한 뒤 엔터를 누릅니다.

```bash
# 1) 기존 코드가 있는 저장소를 clone
git clone https://<토큰>@github.com/<계정>/<기존저장소>.git

# 2) 원하는 브랜치로 전환
cd <기존저장소>
git checkout <브랜치명>

# 3) 필요한 폴더만 새 위치로 복사
cp -R <복사할폴더> /root/<새폴더명>
cd /root/<새폴더명>

# 4) 새 로컬 git 저장소로 초기화
git init
git add .
git commit -m "Initial commit"
```

> 커밋 시 "Please tell me who you are" 에러가 뜨면 먼저 아래 실행 후 다시 commit:
> ```
> git config --global user.email "본인이메일"
> git config --global user.name "본인이름"
> ```

```bash
# 5) 새로 만든 GitHub 저장소로 push (토큰을 URL에 포함)
git remote add origin https://<토큰>@github.com/<계정>/<새저장소>.git
git branch -M main
git push -u origin main
```

성공하면 아래와 같은 메시지가 나옵니다:
```
* [new branch]      main -> main
Branch 'main' set up to track remote branch 'main' from 'origin'.
```

**push가 끝나면 사용한 토큰은 바로 삭제(revoke)하고, 필요하면 새로 발급하세요.**

---

## 5. Vercel 배포

1. [vercel.com](https://vercel.com) 접속 → GitHub 계정으로 로그인
2. **Add New → Project**
3. 방금 push한 저장소 선택 → **Import**
   (처음이면 Vercel이 어떤 저장소에 접근 가능한지 GitHub 권한 승인 화면이 뜸)
4. Framework는 Next.js 자동 인식, Root Directory는 그대로
5. **Deploy** 클릭 → 1~2분 대기 → `https://<프로젝트명>-xxxx.vercel.app` 형태의 URL 생성

---

## 6. 환경변수(ANTHROPIC_API_KEY) 설정

가장 헷갈렸던 부분입니다. **Environment Variables는 "Project Settings"의 General 탭 안에 없고, 별도의 탭입니다.**

1. Vercel 프로젝트 페이지 → 프로젝트 길게 누르기(또는 프로젝트 열기) → **Settings**
2. Settings 화면 **맨 위로 스크롤** (Project Name보다 위) → 가로로 나열된 탭 메뉴에서 **"Environment Variables"** 탭 선택
   - (General 탭 안을 아무리 스크롤해도 안 나옵니다 — 반드시 별도 탭으로 이동해야 함)
3. Key: `ANTHROPIC_API_KEY` (정확히 이 철자, 대문자)
4. Value: 본인의 Anthropic API 키 (`sk-ant-...`)
5. Production / Preview / Development 모두 체크 → **Save**
6. **Deployments** 탭 → 최근 배포 → `...` 메뉴 → **Redeploy**
   (환경변수는 재배포해야 반영됩니다. 자동 적용 안 됨!)

재배포 후 사이트 새로고침하면 AI 요약(한국어 톤 게이지, 요약, 주요 이슈)이 정상적으로 표시됩니다.

---

## 최종 체크리스트

- [ ] iSH Shell 설치 + `apk add git`
- [ ] GitHub 앱으로 새 저장소 생성
- [ ] Personal Access Token 발급 (`repo` 권한)
- [ ] iSH에서 clone → 브랜치 전환 → 폴더 복사 → init/commit → push (토큰은 URL에 포함)
- [ ] 사용한 토큰 삭제(revoke)
- [ ] Vercel에서 저장소 Import → Deploy
- [ ] Settings 맨 위 탭에서 **Environment Variables** 탭으로 이동 → `ANTHROPIC_API_KEY` 추가
- [ ] Redeploy
- [ ] 배포된 URL에서 한국어 AI 요약이 정상 표시되는지 확인
