# 인수인계의 전설 · QR 홍보물

- [공유용 PNG](handover-legend-qr-poster.png): 2150 × 3041px
- [A4 인쇄용 PDF](handover-legend-qr-poster.pdf): 세로형, 벡터 QR 및 윤곽선 한글
- [캐릭터 원본 PNG](handover-characters.png): 투명 배경의 신입·팀장 일러스트
- QR 연결 주소: https://handover-legend.s2airsystems2.chatgpt.site

QR은 오류 정정 H와 4모듈 여백을 사용하며, 캐릭터가 코드를 덮지 않습니다. PDF에서는 QR을 클릭해서 게임을 열 수도 있습니다. PNG 원본·1080px·540px 너비에서 주소가 정상 해독되는 것을 확인했습니다.

## 다시 만들기

Python 3.11 이상과 Noto Sans CJK Regular/Bold TTC 글꼴이 필요합니다. Debian/Ubuntu에서는 `fonts-noto-cjk` 패키지를 사용합니다.

```sh
python -m venv /tmp/handover-poster-venv
/tmp/handover-poster-venv/bin/python -m pip install -r scripts/requirements-poster.txt
/tmp/handover-poster-venv/bin/python scripts/build-qr-poster.py
```

다른 글꼴 설치 위치는 `--font-dir /path/to/noto`로 지정합니다. `NotoSansCJK-Regular.ttc`와 `NotoSansCJK-Bold.ttc`를 해당 폴더에 두세요. 다른 출력 폴더는 `--output-dir /path/to/output`으로 지정합니다. 생성 스크립트는 PDF와 PNG를 만들고, 세 가지 크기의 PNG에서 QR 연결 주소를 검증합니다.

생성 일러스트는 게임의 `public/art/retro-v5/arrival.webp` 속 인물을 참고했습니다. 홍보용 자세는 신입이 서류를 안고 팀장이 빨간 펜을 든 모습이며, 기존 복고 셀 애니 스타일을 유지했습니다.
