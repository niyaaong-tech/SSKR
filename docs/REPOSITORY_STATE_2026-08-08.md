# SSKR Git 저장소 상태 — 2026-08-08

## 목적

기존 SSKR GitHub Pages 실험 프로젝트를 제거하고, 현재 확보된 기획·비주얼·Scene 05 제작 자료를 이후 로컬 개발로 이어갈 수 있는 보존 지점으로 재구성한다.

## 완료된 초기화

기존 저장소에서 사용하던 다음 항목은 현재 `main` 기준 작업 트리에서 제거했다.

- 기존 `index.html`
- 기존 `.github/workflows/pages.yml`
- 기존 `.nojekyll`
- GitHub Pages 실험용 README 구조

과거 커밋 히스토리는 Git 객체상 남을 수 있지만, **현재 main 작업 트리에서는 더 이상 프로젝트 소스로 사용하지 않는다.**

## 현재 보존 단위

`snapshot/`은 현재 SSKR 작업공간을 tar.gz로 묶고 Base64 chunk로 저장한 clone-safe archive다.

- Archive SHA256: `88f9e32b3fcd0b590f1b6a541c4cc0423e35928149c0cde70c91c29dcc7566bc`
- Restore: `python snapshot/unpack_snapshot.py`
- Restore output: `workspace/`

스냅샷에는 다음이 포함된다.

1. 서비스·사업·비주얼·HTML PT 관련 현재 자료
2. 정밀 한반도 SVG와 지도 제작 자료
3. 현재 컨셉 비주얼의 압축 개발 레퍼런스
4. Scene 05 Real Terrain Asset Kit
5. DEM 재확보 manifest/downloader
6. 지오리퍼런싱·Route terrain sampling 도구
7. Dawn / Daylight / Sunset 라이팅 preset과 runtime helper

## Raw DEM 정책

Copernicus GLO-30/GLO-90 등의 원본 GeoTIFF는 Git에 고정 저장하지 않는다.

이유:

- 공개 원천에서 재확보 가능
- 저장소 용량 증가 방지
- LOD/범위별로 필요한 타일만 다시 받을 수 있음

대신 manifest, URL 목록, downloader, build script를 보존한다.

## Scene 05 정확도 게이트

최종 지형 제작에서 다음을 지켜야 한다.

- 프로젝트 정밀 SVG = 해안선/국토 Shape 정본
- 실제 DEM = 산맥·계곡·평야 고도 정본
- SVG ↔ WGS84 정렬에는 검증된 control point 사용
- 추정 좌표로 georeference를 확정하지 않음
- Start는 남한 동해·남동해안의 실제 육지 좌표
- Route는 지표면을 따라 이동하며 병합·분기·재합류 구조를 가짐
- 라이팅은 동틀녘 → 한낮 → 해질녘으로 이동하고 지형 그림자도 동기화

## 로컬 작업 재개 순서

```bash
git clone https://github.com/niyaaong-tech/SSKR.git
cd SSKR
python snapshot/unpack_snapshot.py
```

그 후 `workspace/` 안의 Scene 05 terrain kit README를 기준으로 Python/GDAL 계열 의존성을 준비하고 실제 DEM을 내려받는다.

## 문서 정본 역할 분리

- **Notion:** 최신 서비스/발표 기획과 의사결정 정본
- **GitHub:** 코드·자산·실행 도구·복원 가능한 작업 스냅샷

Notion 기준 페이지:

- SSKR HTML 웹 프레젠테이션 개발 계획 v0.1  
  https://app.notion.com/p/3b54b875815381ff9de6d15112818607
- Scene 05 — 한반도 리얼 지형·시간 라이팅 제작 전략 v0.1  
  https://app.notion.com/p/3b54b8758153817bb555f572653528e8
