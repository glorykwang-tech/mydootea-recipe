import { useState, useMemo } from "react";

// ── 데이터 ──────────────────────────────────────────
const STEPS = {
  당: {
    label: "당",
    icon: "🍬",
    color: "#E67E22",
    light: "#FEF5E7",
    border: "#F0A500",
    desc: "단맛의 종류와 강도를 결정합니다",
    options: [
      { id: "무가당",    label: "무가당",         pct: 0,    note: "당 성분 없음 / 다이어트·당뇨 타겟" },
      { id: "저당",      label: "저당",           pct: 30,   note: "정백당 15% + 결정과당 15%" },
      { id: "표준당",    label: "표준 (기본)",     pct: 45,   note: "정백당 25% + 결정과당 20%", default: true },
      { id: "달콤",      label: "달콤",           pct: 55,   note: "정백당 30% + 결정과당 25%" },
      { id: "고당",      label: "고당 (진한 맛)",  pct: 70,   note: "정백당 40% + 결정과당 30%" },
    ],
  },
  베이스: {
    label: "베이스",
    icon: "🥛",
    color: "#2471A3",
    light: "#EBF5FB",
    border: "#5DADE2",
    desc: "음료의 바디감과 질감을 결정합니다",
    options: [
      { id: "식물성_귀리",   label: "식물성 귀리",      pct: 40,  note: "귀리크리머 25% + 덱스트린 15% / 비건·유당불내증" },
      { id: "식물성_아몬드", label: "식물성 아몬드",    pct: 38,  note: "아몬드베이스 20% + 덱스트린 18% / 비건" },
      { id: "식물성_두유",   label: "식물성 두유",      pct: 42,  note: "두유분말 25% + 덱스트린 17% / 비건·단백질" },
      { id: "유제품_라이트", label: "유제품 라이트",    pct: 35,  note: "우유크리머 20% + 혼합탈지 15%", default: true },
      { id: "유제품_리치",   label: "유제품 리치",      pct: 45,  note: "우유크리머 28% + 혼합탈지 17% / 진한 밀크" },
      { id: "곡물단백질",    label: "곡물 단백질",      pct: 40,  note: "완두단백 20% + 쌀단백 10% + 귀리 10% / 기능성" },
    ],
  },
  티: {
    label: "티 (원료)",
    icon: "🍵",
    color: "#1E8449",
    light: "#EAFAF1",
    border: "#52BE80",
    desc: "음료의 핵심 맛과 개성을 결정합니다",
    options: [
      { id: "없음",        label: "없음 (순수 크리머)",  pct: 0,   note: "베이스 맛만 / 뉴바닐라 스타일" },
      { id: "말차",        label: "말차",               pct: 8,   note: "말차분말 8% / 녹차 풍미" },
      { id: "고구마",      label: "고구마",             pct: 10,  note: "고구마분말 10% / 달콤 고소", default: true },
      { id: "코코아",      label: "코코아·초콜렛",       pct: 20,  note: "코코아분말 20% / 진한 초코" },
      { id: "딸기",        label: "딸기",               pct: 8,   note: "딸기분말 8% / 상큼 과일" },
      { id: "블랙티",      label: "블랙티",             pct: 6,   note: "홍차분말 6% / 깔끔 티 베이스" },
      { id: "요거트",      label: "요거트",             pct: 5,   note: "요구르트분말 3.5% + 구연산 1.5% / 산뜻" },
      { id: "단호박",      label: "단호박",             pct: 10,  note: "단호박분말 10% / 부드러운 단맛" },
    ],
  },
  향: {
    label: "향",
    icon: "🌸",
    color: "#7D3C98",
    light: "#F5EEF8",
    border: "#AF7AC5",
    desc: "음료의 마지막 풍미 레이어를 결정합니다",
    options: [
      { id: "없음",        label: "없음",               pct: 0,   note: "향 미첨가 / 원료 본연의 향" },
      { id: "바닐라",      label: "바닐라",             pct: 1.5, note: "바닐라향 0.8% + 바닐란 0.7%", default: true },
      { id: "요거트향",    label: "요거트",             pct: 1.2, note: "요거트향 0.7% + 요거트향분말 0.5%" },
      { id: "초코향",      label: "초콜렛·모카",         pct: 0.55,note: "초코향 0.4% + 모카향 0.15%" },
      { id: "딸기향",      label: "딸기",               pct: 1.0, note: "딸기향 1.0%" },
      { id: "고구마향",    label: "고구마",             pct: 0.8, note: "고구마향 0.8%" },
      { id: "말차향",      label: "말차",               pct: 0.7, note: "말차향 0.7%" },
      { id: "카라멜향",    label: "카라멜",             pct: 1.0, note: "카라멜향 1.0%" },
    ],
  },
};

const STEP_ORDER = ["당", "베이스", "티", "향"];

// 기준 레시피 사례
const EXAMPLES = [
  { name: "플레인 요거트", 당: "고당",      베이스: "유제품_라이트", 티: "요거트",   향: "요거트향" },
  { name: "고구마라떼",    당: "표준당",    베이스: "유제품_라이트", 티: "고구마",   향: "고구마향" },
  { name: "초콜렛 모카",   당: "표준당",    베이스: "유제품_리치",   티: "코코아",   향: "초코향" },
  { name: "뉴바닐라",      당: "달콤",      베이스: "유제품_리치",   티: "없음",     향: "바닐라" },
  { name: "비건 말차",     당: "저당",      베이스: "식물성_귀리",   티: "말차",     향: "말차향" },
  { name: "단백질 쉐이크", 당: "무가당",    베이스: "곡물단백질",   티: "고구마",   향: "바닐라" },
];

export default function App() {
  const defaultSel = {
    당: "표준당",
    베이스: "유제품_라이트",
    티: "고구마",
    향: "바닐라",
  };
  const [sel, setSel] = useState(defaultSel);
  const [step, setStep] = useState(0); // 현재 활성 스텝 (0~3)
  const [copied, setCopied] = useState(false);

  // 선택값 → 퍼센트 계산
  const recipe = useMemo(() => {
    let result = {};
    let total = 0;
    STEP_ORDER.forEach((k) => {
      const opt = STEPS[k].options.find((o) => o.id === sel[k]);
      const pct = opt ? opt.pct : 0;
      result[k] = pct;
      total += pct;
    });
    // 나머지 조정 (부형제/덱스트린으로 100% 맞춤)
    const filler = Math.max(0, 100 - total);
    return { ...result, 부형제: filler, total };
  }, [sel]);

  const getOpt = (k) => STEPS[k].options.find((o) => o.id === sel[k]);

  function applyExample(ex) {
    setSel({ 당: ex.당, 베이스: ex.베이스, 티: ex.티, 향: ex.향 });
    setStep(0);
  }

  function copyRecipe() {
    const lines = [
      `[MY DOOTEA 4Step 레시피]`,
      ...STEP_ORDER.map((k) => {
        const opt = getOpt(k);
        return `${STEPS[k].icon} ${STEPS[k].label}: ${opt?.label} (${recipe[k]}%)  → ${opt?.note}`;
      }),
      recipe.부형제 > 0 ? `⚗️  부형제(덱스트린): ${recipe.부형제.toFixed(2)}%` : "",
      `━━━━━━━━━━━━━━`,
      `합계: 100%`,
    ].filter(Boolean);
    navigator.clipboard?.writeText(lines.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const activeStep = STEP_ORDER[step];
  const S = STEPS[activeStep];

  return (
    <div style={{ minHeight: "100vh", background: "#F7F9FC", fontFamily: "system-ui,'Malgun Gothic','Apple SD Gothic Neo',sans-serif" }}>

      {/* ── 헤더 ── */}
      <div style={{ background: "linear-gradient(135deg,#1A5276 0%,#2E86C1 100%)", padding: "28px 20px 22px", textAlign: "center" }}>
        <div style={{ fontSize: 13, color: "#AED6F1", letterSpacing: 3, marginBottom: 6 }}>MY DOOTEA</div>
        <div style={{ fontSize: 26, fontWeight: 900, color: "#fff", lineHeight: 1.2 }}>4Step 레시피 알고리즘</div>
        <div style={{ fontSize: 12, color: "#AED6F1", marginTop: 6 }}>당 → 베이스 → 티 → 향 순서로 선택하면 배합비가 자동 계산됩니다</div>
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "20px 16px" }}>

        {/* ── 예시 레시피 버튼 ── */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#888", marginBottom: 8, letterSpacing: 1 }}>실험 레시피 불러오기</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {EXAMPLES.map((ex) => (
              <button key={ex.name} onClick={() => applyExample(ex)}
                style={{ background: "#fff", border: "1.5px solid #D5D8DC", borderRadius: 20, padding: "6px 14px", fontSize: 12, fontWeight: 600, color: "#1A5276", cursor: "pointer" }}>
                {ex.name}
              </button>
            ))}
          </div>
        </div>

        {/* ── Step 탭 네비 ── */}
        <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
          {STEP_ORDER.map((k, i) => {
            const done = i < step;
            const active = i === step;
            const s = STEPS[k];
            return (
              <button key={k} onClick={() => setStep(i)}
                style={{
                  flex: 1, padding: "10px 4px", borderRadius: 12, border: "none", cursor: "pointer",
                  background: active ? s.color : done ? "#EBF5FB" : "#fff",
                  color: active ? "#fff" : done ? s.color : "#888",
                  fontWeight: active ? 800 : 600, fontSize: 12,
                  boxShadow: active ? `0 4px 12px ${s.color}44` : "0 1px 4px #00000010",
                  transition: "all 0.2s",
                }}>
                <div style={{ fontSize: 18 }}>{s.icon}</div>
                <div>{s.label}</div>
                {sel[k] && (
                  <div style={{ fontSize: 10, opacity: 0.85, marginTop: 2 }}>
                    {STEPS[k].options.find(o => o.id === sel[k])?.label}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* ── 현재 Step 선택 패널 ── */}
        <div style={{ background: "#fff", borderRadius: 16, padding: "18px 16px", marginBottom: 16, boxShadow: "0 2px 12px #00000012", border: `2px solid ${S.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <span style={{ fontSize: 24 }}>{S.icon}</span>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: S.color }}>Step {step + 1} — {S.label}</div>
              <div style={{ fontSize: 11, color: "#888" }}>{S.desc}</div>
            </div>
          </div>
          <div style={{ height: 1, background: S.border + "33", margin: "12px 0" }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {S.options.map((opt) => {
              const isSelected = sel[activeStep] === opt.id;
              return (
                <button key={opt.id} onClick={() => setSel(p => ({ ...p, [activeStep]: opt.id }))}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "11px 14px", borderRadius: 10, border: `2px solid ${isSelected ? S.color : "#E8E8E8"}`,
                    background: isSelected ? S.light : "#FAFAFA",
                    cursor: "pointer", textAlign: "left", transition: "all 0.15s",
                  }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: isSelected ? 800 : 600, color: isSelected ? S.color : "#333" }}>
                      {opt.label}
                    </div>
                    <div style={{ fontSize: 10.5, color: "#777", marginTop: 2 }}>{opt.note}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                    <div style={{
                      background: isSelected ? S.color : "#E8E8E8",
                      color: isSelected ? "#fff" : "#888",
                      borderRadius: 20, padding: "3px 10px", fontSize: 12, fontWeight: 700
                    }}>
                      {opt.pct}%
                    </div>
                    {isSelected && <span style={{ color: S.color, fontSize: 16 }}>✓</span>}
                  </div>
                </button>
              );
            })}
          </div>
          {/* 다음 스텝 버튼 */}
          {step < 3 && (
            <button onClick={() => setStep(s => s + 1)}
              style={{ width: "100%", marginTop: 14, padding: "12px", borderRadius: 10, border: "none", background: S.color, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
              다음 → {STEPS[STEP_ORDER[step + 1]].icon} {STEPS[STEP_ORDER[step + 1]].label} 선택
            </button>
          )}
        </div>

        {/* ── 배합비 결과 ── */}
        <div style={{ background: "#fff", borderRadius: 16, padding: "18px 16px", boxShadow: "0 2px 12px #00000012", border: "2px solid #1A5276" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#1A5276" }}>📋 배합비 결과</div>
            <button onClick={copyRecipe}
              style={{ background: copied ? "#1E8449" : "#1A5276", color: "#fff", border: "none", borderRadius: 8, padding: "6px 14px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
              {copied ? "✓ 복사됨" : "클립보드 복사"}
            </button>
          </div>

          {/* 바 차트 */}
          {[...STEP_ORDER, recipe.부형제 > 0 ? "부형제" : null].filter(Boolean).map((k) => {
            const isExtra = k === "부형제";
            const s = isExtra ? { color: "#AAB7B8", light: "#F2F3F4", icon: "⚗️", label: "부형제(덱스트린)" } : STEPS[k];
            const opt = isExtra ? null : getOpt(k);
            const pct = isExtra ? recipe.부형제 : recipe[k];
            if (pct === 0 && k !== "부형제") return null;
            return (
              <div key={k} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 14 }}>{s.icon}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: s.color }}>{s.label}</span>
                    {opt && <span style={{ fontSize: 10, color: "#888", background: "#F0F0F0", borderRadius: 10, padding: "1px 7px" }}>{opt.label}</span>}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 800, color: s.color }}>{pct.toFixed(2)}%</span>
                </div>
                <div style={{ height: 10, background: "#F0F0F0", borderRadius: 6, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: s.color, borderRadius: 6, transition: "width 0.5s ease" }} />
                </div>
                {opt && <div style={{ fontSize: 10, color: "#999", marginTop: 2 }}>{opt.note}</div>}
              </div>
            );
          })}

          {/* 파이 요약 */}
          <div style={{ display: "flex", gap: 6, marginTop: 16, flexWrap: "wrap" }}>
            {STEP_ORDER.map((k) => {
              const pct = recipe[k];
              if (pct === 0) return null;
              return (
                <div key={k} style={{ flex: "1 1 80px", background: STEPS[k].light, borderRadius: 10, padding: "10px 8px", textAlign: "center", border: `1.5px solid ${STEPS[k].border}` }}>
                  <div style={{ fontSize: 16 }}>{STEPS[k].icon}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: STEPS[k].color, marginTop: 2 }}>{STEPS[k].label}</div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: STEPS[k].color }}>{pct}%</div>
                </div>
              );
            })}
            {recipe.부형제 > 0 && (
              <div style={{ flex: "1 1 80px", background: "#F2F3F4", borderRadius: 10, padding: "10px 8px", textAlign: "center", border: "1.5px solid #D5D8DC" }}>
                <div style={{ fontSize: 16 }}>⚗️</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#888", marginTop: 2 }}>부형제</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: "#AAB7B8" }}>{recipe.부형제.toFixed(1)}%</div>
              </div>
            )}
          </div>

          {/* 합계 */}
          <div style={{ marginTop: 14, padding: "10px 14px", background: "#EBF5FB", borderRadius: 10, display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#1A5276" }}>합계</span>
            <span style={{ fontSize: 15, fontWeight: 900, color: "#1A5276" }}>100.00%</span>
          </div>

          {/* 권장 메모 */}
          <div style={{ marginTop: 12, padding: "10px 14px", background: "#FFFBF0", borderRadius: 10, border: "1.5px solid #F0A500" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#E67E22", marginBottom: 4 }}>💡 제조 메모</div>
            <div style={{ fontSize: 11, color: "#555", lineHeight: 1.6 }}>
              • 배합 순서: 베이스 → 당 → 티 → 향 순으로 혼합<br/>
              • 24kg 기준 소량 OEM 생산 가능<br/>
              • Zero-Emission 클린 공정 (건식 배합)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
