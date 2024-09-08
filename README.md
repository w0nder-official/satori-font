## Satori font load from web

- vercel egde 에서 OG image를 생성할 때 폰트 사이즈가 크면 패키지 크기가 커져서 배포에 실패한다.
- 폰트를 비동기로 웹에서 로드해서 사용하면 패키지 크기를 줄일 수 있다.

```
yarn dev
open http://localhost:3000/api/image
```
