# 사람인 채용 검색 웹사이트

사람인 오픈 API를 사용하여 채용 정보를 검색하고 결과를 보여주는 웹 애플리케이션입니다.

## 기능

- 🔍 직무 키워드와 지역별 채용 정보 검색
- 📱 반응형 디자인으로 모바일에서도 사용 가능
- 🎨 모던하고 아름다운 UI/UX
- 📋 채용 정보 클립보드 복사 기능
- 🔗 원본 채용 공고 페이지로 이동
- ⚡ 실시간 검색 결과 표시

## 설치 및 실행

### 1. 필요한 패키지 설치

```bash
pip install -r requirements.txt
```

### 2. 사람인 API 키 설정

`app.py` 파일에서 다음 부분을 실제 API 키로 수정하세요:

```python
SARAMIN_API_KEY = "YOUR_API_KEY_HERE"  # 실제 API 키로 교체하세요
```

사람인 오픈 API 키는 [사람인 개발자 센터](https://openapi.saramin.co.kr/)에서 발급받을 수 있습니다.

### 3. 애플리케이션 실행

```bash
python app.py
```

### 4. 웹사이트 접속

브라우저에서 `http://localhost:5000`으로 접속하세요.

## 사용법

1. **검색**: 직무 키워드와 지역을 입력하고 검색 버튼을 클릭하세요.
2. **결과 확인**: 검색 결과가 카드 형태로 표시됩니다.
3. **상세보기**: "상세보기" 버튼을 클릭하여 원본 채용 공고 페이지로 이동할 수 있습니다.
4. **정보 복사**: "정보 복사" 버튼을 클릭하여 채용 정보를 클립보드에 복사할 수 있습니다.

## 프로젝트 구조

```
├── app.py              # Flask 메인 애플리케이션
├── requirements.txt     # Python 패키지 의존성
├── README.md          # 프로젝트 설명서
├── templates/
│   └── index.html     # 메인 HTML 템플릿
└── static/
    ├── style.css      # CSS 스타일시트
    └── script.js      # JavaScript 코드
```

## API 엔드포인트

- `GET /`: 메인 페이지
- `POST /search`: 채용 정보 검색
- `GET /api/test`: API 테스트 엔드포인트

## 기술 스택

- **Backend**: Flask (Python)
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **API**: 사람인 오픈 API
- **UI/UX**: Font Awesome, Google Fonts

## 주의사항

- 사람인 API 키가 필요합니다.
- API 호출 제한이 있을 수 있으니 과도한 요청을 피해주세요.
- 실제 운영 환경에서는 환경 변수를 사용하여 API 키를 관리하는 것을 권장합니다.

## 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 