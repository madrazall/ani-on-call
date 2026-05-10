export default function BackgroundSketches() {
  const ink = "#8C847E"
  const sw = "1.2"

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none"
      aria-hidden="true"
    >
      {/* ── Route network — top right ──────────────────────────────── */}
      <svg
        width="420"
        height="420"
        viewBox="0 0 420 420"
        fill="none"
        stroke={ink}
        strokeWidth={sw}
        style={{ opacity: 0.18, position: 'absolute', top: -30, right: -40, transform: 'rotate(5deg)' }}
      >
        {/* nodes */}
        {[
          [80, 70], [200, 40], [330, 110], [160, 210], [300, 260], [70, 310], [240, 360],
        ].map(([cx, cy], i) => (
          <g key={i}>
            <circle cx={cx} cy={cy} r={7} />
            <circle cx={cx} cy={cy} r={2} fill={ink} stroke="none" />
            <line x1={cx - 12} y1={cy} x2={cx + 12} y2={cy} />
            <line x1={cx} y1={cy - 12} x2={cx} y2={cy + 12} />
          </g>
        ))}
        {/* route lines */}
        <path d="M80,70 C130,55 170,45 200,40" strokeDasharray="5 4" />
        <path d="M200,40 C255,60 295,80 330,110" strokeDasharray="5 4" />
        <path d="M80,70 C100,130 130,170 160,210" strokeDasharray="5 4" />
        <path d="M330,110 C320,160 315,210 300,260" strokeDasharray="5 4" />
        <path d="M160,210 C220,230 265,250 300,260" strokeDasharray="5 4" />
        <path d="M160,210 C120,255 95,280 70,310" strokeDasharray="5 4" />
        <path d="M300,260 C280,300 265,330 240,360" strokeDasharray="5 4" />
        {/* main highlighted route */}
        <path d="M80,70 C130,55 170,45 200,40 C255,60 295,80 330,110 C320,160 315,210 300,260" strokeWidth="2" strokeDasharray="7 3" />
        {/* arrow heads on main route */}
        <path d="M326,95 L330,110 L318,108" strokeWidth="1.5" />
        <path d="M296,248 L300,260 L291,254" strokeWidth="1.5" />
        {/* distance labels (tick marks) */}
        <line x1="140" y1="50" x2="140" y2="58" />
        <line x1="265" y1="70" x2="265" y2="78" />
        <line x1="305" y1="190" x2="313" y2="190" />
      </svg>

      {/* ── Packing slip — left side ───────────────────────────────── */}
      <svg
        width="210"
        height="290"
        viewBox="0 0 210 290"
        fill="none"
        stroke={ink}
        strokeWidth={sw}
        style={{ opacity: 0.16, position: 'absolute', top: '28%', left: -18, transform: 'rotate(-4deg)' }}
      >
        {/* outer border */}
        <rect x="8" y="8" width="194" height="274" rx="3" />
        {/* header bar */}
        <rect x="8" y="8" width="194" height="30" rx="3" fill={ink} fillOpacity="0.15" stroke={ink} />
        <line x1="28" y1="27" x2="100" y2="27" strokeWidth="2" />
        <line x1="110" y1="27" x2="170" y2="27" strokeWidth="1" />
        {/* FROM section */}
        <text x="18" y="58" fill={ink} stroke="none" fontSize="7" fontFamily="monospace">FROM</text>
        <line x1="18" y1="70" x2="192" y2="70" />
        <line x1="18" y1="82" x2="160" y2="82" />
        <line x1="18" y1="94" x2="140" y2="94" />
        {/* divider */}
        <line x1="8" y1="108" x2="202" y2="108" strokeWidth="2" />
        {/* TO section */}
        <text x="18" y="126" fill={ink} stroke="none" fontSize="7" fontFamily="monospace">TO</text>
        <line x1="18" y1="138" x2="192" y2="138" />
        <line x1="18" y1="150" x2="192" y2="150" />
        <line x1="18" y1="162" x2="155" y2="162" />
        {/* weight / service row */}
        <line x1="8" y1="178" x2="202" y2="178" />
        <rect x="18" y="185" width="55" height="18" rx="2" />
        <line x1="25" y1="196" x2="65" y2="196" />
        <rect x="85" y="185" width="55" height="18" rx="2" />
        <line x1="92" y1="196" x2="132" y2="196" />
        {/* barcode */}
        <line x1="8" y1="215" x2="202" y2="215" />
        {[22,29,33,39,44,49,55,59,65,70,75,81,86,92,97,103,108,114,119,124,130,135,141,146,151,157,162,168,173,179,184].map((x, i) => (
          <line key={i} x1={x} y1="222" x2={x} y2="268"
            strokeWidth={i % 4 === 0 ? "3" : i % 3 === 0 ? "2" : i % 2 === 0 ? "1.5" : "1"} />
        ))}
        <line x1="18" y1="272" x2="192" y2="272" strokeWidth="0.5" />
        {/* fragile triangle */}
        <path d="M155,232 L175,265 L135,265 Z" strokeWidth="1" />
        <line x1="155" y1="240" x2="155" y2="256" strokeWidth="1.5" />
        <circle cx="155" cy="260" r="1.5" fill={ink} stroke="none" />
      </svg>

      {/* ── Isometric box — bottom right ──────────────────────────── */}
      <svg
        width="340"
        height="300"
        viewBox="0 0 340 300"
        fill="none"
        stroke={ink}
        strokeWidth={sw}
        style={{ opacity: 0.18, position: 'absolute', bottom: -20, right: -30, transform: 'rotate(8deg)' }}
      >
        {/* top face */}
        <path d="M170,30 L300,95 L170,160 L40,95 Z" />
        {/* front face */}
        <path d="M40,95 L170,160 L170,280 L40,215 Z" />
        {/* right face */}
        <path d="M170,160 L300,95 L300,215 L170,280 Z" />
        {/* inner fold lines on top */}
        <path d="M170,30 L170,160" strokeDasharray="6 3" strokeWidth="1" />
        <path d="M40,95 L300,95" strokeDasharray="6 3" strokeWidth="1" />
        {/* tape strips on top */}
        <path d="M170,30 L170,160" strokeWidth="5" strokeOpacity="0.4" />
        <path d="M105,62 L235,127" strokeWidth="5" strokeOpacity="0.4" />
        {/* shipping label on front face */}
        <rect x="65" y="170" width="75" height="55" rx="2" />
        <line x1="73" y1="184" x2="132" y2="184" strokeWidth="1" />
        <line x1="73" y1="193" x2="132" y2="193" strokeWidth="1" />
        <line x1="73" y1="202" x2="115" y2="202" strokeWidth="1" />
        <line x1="73" y1="211" x2="120" y2="211" strokeWidth="0.7" />
        {/* FRAGILE stamp on side */}
        <rect x="200" y="140" width="70" height="22" rx="2" strokeDasharray="2 2" />
        <line x1="209" y1="151" x2="261" y2="151" strokeWidth="2" />
        {/* corner wear marks */}
        <path d="M40,95 L30,88" strokeWidth="0.8" />
        <path d="M300,95 L308,90" strokeWidth="0.8" />
        <path d="M170,280 L170,290" strokeWidth="0.8" />
      </svg>

      {/* ── Barcode strip — bottom left ────────────────────────────── */}
      <svg
        width="300"
        height="90"
        viewBox="0 0 300 90"
        fill="none"
        stroke={ink}
        strokeWidth={sw}
        style={{ opacity: 0.15, position: 'absolute', bottom: 60, left: -10, transform: 'rotate(-2deg)' }}
      >
        <rect x="5" y="5" width="290" height="80" rx="2" />
        {[15,22,27,33,38,43,50,55,61,67,72,78,83,89,95,101,106,112,118,123,129,135,141,147,152,158,163,169,175,180,186,192,197,203,209,215,220,226,232,237,243,249,255,260,266,272,278,284].map((x, i) => (
          <line key={i} x1={x} y1="12" x2={x} y2="65"
            strokeWidth={i % 5 === 0 ? "3.5" : i % 3 === 0 ? "2" : i % 2 === 0 ? "1.5" : "1"} />
        ))}
        <line x1="15" y1="70" x2="285" y2="70" strokeWidth="0.5" />
        {/* number blocks below */}
        {[15, 65, 115, 165, 215, 265].map((x, i) => (
          <line key={i} x1={x} y1="76" x2={x + 35} y2="76" strokeWidth="2" />
        ))}
      </svg>

      {/* ── Location pins — scattered ──────────────────────────────── */}
      <svg width="26" height="36" viewBox="0 0 26 36" fill="none" stroke={ink} strokeWidth={sw}
        style={{ opacity: 0.20, position: 'absolute', top: '18%', right: '28%' }}>
        <path d="M13,2 C7.2,2 2.5,6.7 2.5,12.5 C2.5,20 13,34 13,34 C13,34 23.5,20 23.5,12.5 C23.5,6.7 18.8,2 13,2 Z" />
        <circle cx="13" cy="12.5" r="4" />
      </svg>

      <svg width="22" height="30" viewBox="0 0 22 30" fill="none" stroke={ink} strokeWidth={sw}
        style={{ opacity: 0.16, position: 'absolute', top: '55%', left: '18%' }}>
        <path d="M11,1.5 C5.7,1.5 1.5,5.7 1.5,11 C1.5,17.5 11,28.5 11,28.5 C11,28.5 20.5,17.5 20.5,11 C20.5,5.7 16.3,1.5 11,1.5 Z" />
        <circle cx="11" cy="11" r="3.5" />
      </svg>

      <svg width="18" height="24" viewBox="0 0 18 24" fill="none" stroke={ink} strokeWidth={sw}
        style={{ opacity: 0.14, position: 'absolute', bottom: '22%', right: '38%' }}>
        <path d="M9,1 C4.6,1 1,4.6 1,9 C1,14.5 9,23 9,23 C9,23 17,14.5 17,9 C17,4.6 13.4,1 9,1 Z" />
        <circle cx="9" cy="9" r="3" />
      </svg>

      {/* ── Weight scale marks — mid left ─────────────────────────── */}
      <svg width="120" height="60" viewBox="0 0 120 60" fill="none" stroke={ink} strokeWidth={sw}
        style={{ opacity: 0.15, position: 'absolute', top: '65%', left: '8%', transform: 'rotate(1deg)' }}>
        <line x1="5" y1="50" x2="115" y2="50" strokeWidth="1.5" />
        {[5, 15, 25, 35, 45, 55, 65, 75, 85, 95, 105, 115].map((x, i) => (
          <line key={i} x1={x} y1="50" x2={x} y2={i % 5 === 0 ? "34" : i % 2 === 0 ? "40" : "44"} />
        ))}
        <path d="M60,34 L60,10 L80,10" strokeWidth="1.2" />
        <rect x="76" y="6" width="38" height="18" rx="2" />
        <line x1="82" y1="15" x2="108" y2="15" strokeWidth="2" />
      </svg>
    </div>
  )
}
