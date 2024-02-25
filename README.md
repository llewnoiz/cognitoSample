
# 환경
  nodejs 20.9.0 버전 이상 설치 필요.
  vscode ide 사용

# 폴더
    - back
        .env             환경 설정 파일 
        app.js           back 서버 소스
        package.json     nodejs package 관리
    - front
        cognito.js       cognito sdk 를 이용하는 js 파일
        index.html       html ui 

# back

설치
```
cd back
npm i
```

환경 설정
```
1. .env 파일 생성
    PORT=9000
    REGION=aws region 정보 입력
    USERPOOLID=cognito userpoolid 입력
```

실행
```
npm run test
```


# front

설치 
```
1. vscode live server extension 반드시 필요
```

환경 설정
```
1. front/cognito.js 파일에 아래 내용 수정 필요

    var poolData = {
        UserPoolId: cognito userpoolid 입력
        ClientId:  cognito user Client ID 입력
    };

```

실행
```
2. index.html 오른쪽 클릭
3. live server 동작 실행
```