# 모든 웹사이트는 Gemini가 짜준 코드를 이용해 만들었습니다. 작성자는 코딩 알못입니다.


# 🎨 만화 제작기 (Comic Creator) - 사용 설명서

이 문서는 현재 웹 페이지에서 제공하는 "만화 제작기"의 주요 기능 및 사용 방법에 대한 설명입니다.

## 주요 기능

### 1. 이미지 라이브러리 (왼쪽 패널)

*   **이미지 업로드**:
    *   상단의 "이미지 업로드" 섹션에 있는 "파일 선택" 버튼을 클릭하여 컴퓨터에서 이미지 파일(PNG, JPG, GIF 등)을 선택할 수 있습니다.
    *   또는, 이미지 파일을 회색 점선으로 표시된 라이브러리 영역으로 직접 드래그 앤 드롭하여 추가할 수 있습니다.
    *   라이브러리가 비어있을 경우, "이미지 업로드 또는 이 곳으로 파일을 끌어오세요."라는 안내 문구가 표시됩니다.
*   **이미지 사용**:
    *   라이브러리에 추가된 이미지를 **더블클릭**하거나, 캔버스 영역으로 **드래그 앤 드롭**하면 캔버스에 해당 이미지가 추가됩니다.
*   **이미지 삭제 (라이브러리에서만)**:
    *   라이브러리의 이미지 위에서 **마우스 오른쪽 버튼을 클릭**하면 해당 이미지가 라이브러리 목록에서 삭제됩니다. (캔버스에 이미 추가된 객체는 삭제되지 않습니다.)
*   **썸네일 표시**:
    *   라이브러리의 이미지는 정사각형 형태로 표시됩니다.

### 2. 텍스트 도구 (왼쪽 패널)

*   **텍스트 추가**:
    *   "내용" 입력 필드에 원하는 텍스트를 입력합니다.
    *   "폰트", "크기", "색상"을 선택합니다. (나눔스퀘어, 나눔고딕 등 웹 폰트 지원)
    *   "텍스트 추가" 버튼을 클릭하면 캔버스 중앙 근처에 텍스트 객체가 생성됩니다.
*   **텍스트 편집**:
    *   캔버스 위의 텍스트 객체를 **더블클릭**하면 직접 내용을 수정할 수 있습니다.
    *   선택된 텍스트 객체는 왼쪽 텍스트 도구 패널의 설정(폰트, 크기, 색상)과 동기화되며, 패널에서 변경 시 즉시 반영됩니다.

### 3. 선 도구 (왼쪽 패널, 구 프레임 도구)

*   **선 그리기 (다각형 선)**:
    *   "선 이어서 그리기" 버튼을 클릭하여 그리기 모드를 시작합니다. (다른 그리기 도구 사용 중에는 비활성화)
    *   캔버스 위를 클릭하여 다각형 선의 꼭짓점을 순서대로 찍습니다.
    *   그리기를 마치려면 "그리기 완료" 버튼을 클릭하거나, 캔버스 위를 **더블클릭**합니다.
    *   그리는 도중 **ESC 키**를 누르면 취소됩니다.
    *   최소 2개 이상의 점을 찍어야 합니다.
*   **선 스타일 설정**:
    *   선을 새로 그릴 때, "선 색상"과 "선 굵기" UI를 통해 스타일을 변경할 수 있습니다. (선택된 객체에 실시간 반영은 현재 미구현, 새로 그릴 때 적용)

### 4. 브러시 도구 (왼쪽 패널)

*   **자유 그리기**:
    *   "그리기 모드 켜기" 버튼을 클릭하여 그리기 모드를 활성화/비활성화합니다. (다른 그리기 도구 사용 중에는 비활성화)
    *   그리기 모드가 활성화된 상태에서 캔버스 위를 마우스로 드래그하여 자유롭게 그림을 그릴 수 있습니다.
*   **브러시 설정**:
    *   "종류": 연필, 원형, 스프레이 브러시 중 선택합니다.
    *   "색상": 브러시 색상을 선택합니다.
    *   "두께": 브러시의 굵기를 슬라이더로 조절합니다.
*   **기타 사항**:
    *   그리기 모드가 켜져 있는 동안 마우스를 여러 번 떼었다가 다시 그려도, 해당 그리기 세션에서 생성된 모든 선들은 최종적으로 하나의 그림 객체(레이어)로 합쳐집니다.

### 5. 캔버스 객체 공통 기능

*   **선택 및 기본 변형**: 캔버스 위의 모든 객체(이미지, 텍스트, 선, 그림)는 클릭하여 선택할 수 있습니다. 선택된 객체는 조절점을 드래그하여 크기 변경, 회전이 가능하며, 객체 자체를 드래그하여 이동할 수 있습니다.
*   **객체 삭제 (캔버스)**:
    *   객체를 선택한 후, 왼쪽 패널 하단의 "선택된 객체 삭제" 버튼을 클릭합니다.
    *   또는, 객체 선택 후 키보드의 `Delete` 또는 `Backspace` 키를 눌러 삭제합니다.
*   **흑백 만화 필터 (이미지 전용)**:
    *   이미지 객체를 선택한 후, "흑백 만화 필터" 버튼을 클릭하면 해당 이미지가 명암 대비가 강조된 흑백으로 변경됩니다.
    *   "원본 이미지로" 버튼을 클릭하면 적용된 필터가 제거됩니다.

### 6. 레이어 편집기 (오른쪽 패널)

*   **레이어 목록**: 캔버스에 추가된 모든 객체는 레이어 목록에 순서대로 표시됩니다. 목록의 가장 위가 캔버스에서 가장 위에 있는 객체입니다.
*   **레이어 선택**: 목록에서 레이어 아이템을 클릭하면 캔버스에서 해당 객체가 선택됩니다. 반대로 캔버스에서 객체를 선택하면 목록에서도 해당 아이템이 강조 표시됩니다.
*   **이름 변경**: 레이어 아이템의 이름 부분을 **더블클릭**하여 사용자 정의 이름으로 수정할 수 있습니다.
*   **가시성 토글 (👁️/🙈)**: 각 레이어 옆의 눈 모양 아이콘을 클릭하여 해당 레이어를 캔버스에서 숨기거나 다시 보이게 할 수 있습니다.
*   **잠금 토글 (🔓/🔒)**: 자물쇠 모양 아이콘을 클릭하여 해당 레이어를 선택 불가능(잠금)하거나 선택 가능하게 만들 수 있습니다. 잠긴 레이어는 마우스 이벤트를 통과시켜 그 아래 있는 다른 레이어를 클릭하는 데 영향을 주지 않습니다.
*   **순서 변경 (🔼/🔽)**: 레이어를 선택하고, 패널 하단의 위/아래 화살표 버튼을 클릭하여 해당 레이어의 순서(위아래)를 변경할 수 있습니다. 모든 레이어는 동등하게 순서 변경이 가능합니다.
*   **삭제 (🗑️)**: 레이어를 선택하고, 패널 하단의 휴지통 버튼을 클릭하여 해당 레이어(및 캔버스 객체)를 삭제할 수 있습니다.

### 7. 실행 취소 / 다시 실행 (Undo / Redo)

*   캔버스 하단 왼쪽에 있는 "↩️ Undo" 및 "↪️ Redo" 버튼을 사용하여 이전 작업으로 되돌리거나 다시 실행할 수 있습니다.
*   키보드 단축키 `Ctrl+Z` (또는 Mac에서 `Cmd+Z`)로 실행 취소, `Ctrl+Y` (또는 Mac에서 `Cmd+Y`)로 다시 실행이 가능합니다.

### 8. 캔버스 관리

*   **캔버스 크기/방향 선택**: 캔버스 상단에서 "가로 넓게 (기본)" 또는 "세로 넓게 (만화 페이지)" 옵션을 선택하여 캔버스의 크기와 비율을 변경할 수 있습니다.
    *   **주의**: 캔버스 크기 변경 시, 현재 작업 중인 모든 수정 사항과 객체가 사라지며, 실행 기록도 삭제됩니다.
*   **캔버스 비우기**: 왼쪽 패널 하단의 "캔버스 비우기" 버튼을 클릭하면 현재 캔버스의 모든 내용을 삭제합니다. (경고창 표시)
*   **이미지로 저장**: 왼쪽 패널 하단의 "이미지로 저장" 버튼을 클릭하면 현재 캔버스 내용을 PNG 파일로 다운로드합니다. 이때 사용자에게 파일 이름을 입력받아 저장할 수 있습니다.

---

즐겁게 만화 제작기를 사용해주셔서 감사합니다! 지속적인 개선을 통해 더 편리한 도구가 될 수 있도록 노력하겠습니다.
(만약 버그를 발견하거나 개선 아이디어가 있다면 언제든지 알려주세요.)
