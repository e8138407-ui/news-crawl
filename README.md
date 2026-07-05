# MU 뉴스 대시보드

Micron Technology(MU) 관련 뉴스를 매일 자동으로 수집하고, Claude API로 요약·투자 심리 분석을 제공하는 Next.js 웹앱입니다.

> ⚠️ 이 프로젝트는 주가를 예측하거나 투자를 자문하지 않습니다. Google News / Yahoo Finance RSS에서 수집한 뉴스를 AI로 요약·정리해 보여주는 **참고용 정보 서비스**입니다. 실제 투자 판단은 본인 책임하에 신중히 하시기 바랍니다.

## 주요 기능

- Google News, Yahoo Finance RSS에서 MU 관련 뉴스를 최근 24~48시간 기준으로 수집 (최대 18건)
- Claude API로 전체 요약, 주요 이슈 3~5개, 긍정/중립/부정 톤 분석(0~100점), 주가 영향 요인을 한국어로 정리
- Next.js ISR(12시간 캐시) + Vercel Cron으로 DB 없이 하루 1회 자동 갱신
- Claude API 호출이 실패해도 원본 뉴스 헤드라인은 항상 표시되는 graceful fallback

---

## a) 로컬 실행 방법

```bash
# 1. 이 폴더(mu-news-dashboard)로 이동
cd mu-news-dashboard

# 2. 의존성 설치
npm install

# 3. 환경변수 파일 생성 후 Anthropic API 키 입력
cp .env.example .env.local
# .env.local 파일을 열어 ANTHROPIC_API_KEY=sk-ant-... 형태로 입력

# 4. 개발 서버 실행
npm run dev
```

브라우저에서 http://localhost:3000 접속하면 대시보드를 확인할 수 있습니다.

프로덕션 빌드로 캐싱 동작까지 확인하려면:

```bash
npm run build
npm run start
# 다른 터미널에서 캐시 강제 갱신 라우트 확인
curl -i http://localhost:3000/api/refresh
```

---

## b) GitHub 저장소 생성 및 push 방법

이 앱은 `mu-news-dashboard/` 폴더 안에 완전히 독립적으로 구성되어 있어, 이 폴더 내용만 그대로 새 GitHub 저장소(예: `news-crawl`)로 옮겨 사용할 수 있습니다.

```bash
# 1. mu-news-dashboard 폴더 내용을 새 위치로 복사 (예: ~/news-crawl)
cp -r mu-news-dashboard ~/news-crawl
cd ~/news-crawl

# 2. git 저장소 초기화
git init
git add .
git commit -m "Initial commit: MU 뉴스 대시보드"

# 3. GitHub에서 새 저장소(news-crawl) 생성 후 (github.com에서 New repository, 이름: news-crawl)
git remote add origin https://github.com/<본인계정>/news-crawl.git

# 4. push
git branch -M main
git push -u origin main
```

> `.env.local` 파일은 `.gitignore`에 포함되어 있어 자동으로 커밋되지 않습니다. API 키가 저장소에 올라가지 않았는지 `git status`로 확인하세요.

---

## c) Vercel 배포 방법

1. [vercel.com](https://vercel.com)에 로그인 (GitHub 계정으로 로그인 가능)
2. 대시보드에서 **Add New → Project** 클릭
3. 방금 push한 `news-crawl` GitHub 저장소를 **Import**
4. Framework Preset은 Next.js가 자동 감지됩니다. Root Directory는 저장소 루트(기본값) 그대로 두면 됩니다.
5. **Environment Variables** 섹션에서 아래 항목 추가:
   - Key: `ANTHROPIC_API_KEY`
   - Value: 본인의 Anthropic API 키
   - Environment: Production, Preview, Development 모두 체크 권장
6. **Deploy** 클릭 → 몇 분 후 배포 완료, `https://news-crawl-xxxx.vercel.app` 형태의 URL 생성

이후 코드를 `main` 브랜치에 push할 때마다 Vercel이 자동으로 재배포합니다.

---

## d) Vercel Cron 설정 확인 방법

이 프로젝트의 `vercel.json`에는 다음과 같은 Cron 설정이 포함되어 있습니다.

```json
{
  "crons": [
    { "path": "/api/refresh", "schedule": "0 11 * * *" }
  ]
}
```

매일 UTC 11시(미국 동부 기준 여름 07시경, 정규 장 시작 전)에 `/api/refresh`를 호출해 뉴스 요약 캐시를 미리 갱신합니다.

확인 방법:

1. Vercel 대시보드 → 해당 프로젝트 → 상단 **Settings → Cron Jobs** 탭에서 등록된 스케줄 확인
2. 또는 **Deployments → Functions** 로그에서 `/api/refresh` 호출 기록 확인
3. 수동으로 즉시 테스트하려면 배포된 URL에 직접 접속: `https://<배포URL>/api/refresh` (브라우저 또는 `curl`로 호출 시 `{"ok":true, ...}` 응답이 오면 정상)

> Vercel Hobby(무료) 플랜은 Cron Job이 **하루 1회**로 제한되어 있어 위 설정이 그 한도에 맞춰져 있습니다.

(선택) Cron 엔드포인트를 외부에서 함부로 호출하지 못하도록 막고 싶다면, Vercel 프로젝트에 `CRON_SECRET` 환경변수를 추가하세요. 설정하면 `/api/refresh`는 `Authorization: Bearer <CRON_SECRET>` 헤더가 있는 요청만 허용합니다. (Vercel Cron은 이 헤더를 자동으로 붙여 호출합니다.)

---

## e) 배포된 링크 공유 방법

Vercel의 기본 배포 URL(`https://news-crawl-xxxx.vercel.app`)은 **별도 로그인 없이 누구나 접속 가능한 공개 URL**입니다. 배포가 완료되면:

1. Vercel 프로젝트 페이지 상단에 표시된 URL을 복사
2. 카카오톡/이메일/메신저 등으로 그 링크만 전달하면, 받은 사람은 로그인 없이 바로 대시보드를 볼 수 있습니다.
3. 커스텀 도메인을 연결하고 싶다면 Vercel 프로젝트 → Settings → Domains에서 본인 도메인을 추가할 수 있습니다 (선택 사항).

---

## 폴더 구조

```
mu-news-dashboard/
├── app/
│   ├── page.tsx           # 메인 대시보드 페이지 (ISR, revalidate 12시간)
│   └── api/refresh/       # Vercel Cron이 호출하는 캐시 갱신 라우트
├── components/            # UI 컴포넌트
├── lib/
│   ├── rss.ts              # RSS 수집/파싱
│   ├── claude.ts            # Claude API 요약/분석
│   ├── digest.ts             # 캐싱 오케스트레이터 (unstable_cache)
│   └── config.ts              # 피드 URL, 모델명 등 설정값
└── vercel.json             # Vercel Cron 스케줄 설정
```

## 환경 변수

`.env.example` 참고:

```
ANTHROPIC_API_KEY=
```

로컬 개발 시 `.env.local`에 실제 키를 입력하세요. `.env.local`은 git에 커밋되지 않습니다.
