/* =====================================================
   diagrams.js — SVG Diagram & Recovery Zone HTML
   =====================================================
   PURPOSE:
     All visual diagram helpers live here. Each function
     returns an SVG string (or HTML string) that is
     embedded inside a template from templates.js.

   DEPENDENCIES: state.js (for h, numInput, select, etc.)
   Must be loaded AFTER state.js, BEFORE templates.js.
   ===================================================== */

/* ─── GRID DIAGRAMS ─────────────────────────────────── */

/**
 * gridClassicSVG()
 * Classic grid: buy orders below current price,
 * sell orders above, each with individual TPs.
 */
function gridClassicSVG() {
  return `<svg viewBox="0 0 320 210" style="width:100%;max-height:200px;font-family:Arial;font-size:8px;">
    <line x1="10" y1="195" x2="310" y2="195" stroke="#c0392b" stroke-dasharray="5,3" stroke-width="1.2"/>
    <line x1="10" y1="158" x2="310" y2="158" stroke="#bbb" stroke-dasharray="3,3" stroke-width="0.8"/>
    <line x1="10" y1="120" x2="310" y2="120" stroke="#bbb" stroke-dasharray="3,3" stroke-width="0.8"/>
    <line x1="10" y1="82"  x2="310" y2="82"  stroke="#bbb" stroke-dasharray="3,3" stroke-width="0.8"/>
    <line x1="10" y1="44"  x2="310" y2="44"  stroke="#bbb" stroke-dasharray="3,3" stroke-width="0.8"/>
    <line x1="10" y1="10"  x2="310" y2="10"  stroke="#c0392b" stroke-dasharray="5,3" stroke-width="1.2"/>
    <polyline points="10,170 60,90 110,140 170,55 230,110 280,48 310,80" fill="none" stroke="#5b2d8e" stroke-width="2"/>
    <text x="195" y="200" fill="#c0392b" font-size="7">Stop Loss for Buy Trades</text>
    <text x="195" y="8"   fill="#c0392b" font-size="7">Stop Loss for Sell Trades</text>
    <text x="12" y="42"  fill="#e74c3c">Sell 2</text>
    <text x="12" y="80"  fill="#e74c3c">Sell 1</text>
    <text x="12" y="118" fill="#27ae60">Buy 1</text>
    <text x="12" y="156" fill="#27ae60">Buy 2</text>
    <circle cx="85"  cy="115" r="3.5" fill="#f39c12"/>
    <text x="90"  y="112" fill="#c77d00" font-size="7">TP 1</text>
    <circle cx="140" cy="95"  r="3.5" fill="#f39c12"/>
    <text x="145" y="92"  fill="#c77d00" font-size="7">TP 2</text>
    <line x1="230" y1="82" x2="230" y2="120" stroke="#555" stroke-width="1" stroke-dasharray="2,2"/>
    <text x="234" y="103" fill="#555" font-size="7">Spacing~20p</text>
  </svg>`;
}

/**
 * gridReverseSVG()
 * Reverse grid: buy signal → sell orders; sell signal → buy orders.
 */
function gridReverseSVG() {
  return `<svg viewBox="0 0 320 210" style="width:100%;max-height:200px;font-family:Arial;font-size:8px;">
    <line x1="10" y1="195" x2="310" y2="195" stroke="#c0392b" stroke-dasharray="5,3" stroke-width="1.2"/>
    <line x1="10" y1="158" x2="310" y2="158" stroke="#bbb" stroke-dasharray="3,3" stroke-width="0.8"/>
    <line x1="10" y1="120" x2="310" y2="120" stroke="#bbb" stroke-dasharray="3,3" stroke-width="0.8"/>
    <line x1="10" y1="82"  x2="310" y2="82"  stroke="#bbb" stroke-dasharray="3,3" stroke-width="0.8"/>
    <line x1="10" y1="44"  x2="310" y2="44"  stroke="#bbb" stroke-dasharray="3,3" stroke-width="0.8"/>
    <line x1="10" y1="10"  x2="310" y2="10"  stroke="#c0392b" stroke-dasharray="5,3" stroke-width="1.2"/>
    <polyline points="10,90 60,160 110,70 170,150 230,60 280,140 310,100" fill="none" stroke="#5b2d8e" stroke-width="2"/>
    <text x="195" y="200" fill="#c0392b" font-size="7">Stop Loss for Sell Trades</text>
    <text x="195" y="8"   fill="#c0392b" font-size="7">Stop Loss for Buy Trades</text>
    <text x="12" y="42"  fill="#27ae60">Buy 2</text>
    <text x="12" y="80"  fill="#27ae60">Buy 1</text>
    <text x="12" y="118" fill="#e74c3c">Sell 1</text>
    <text x="12" y="156" fill="#e74c3c">Sell 2</text>
    <text x="60" y="25" fill="#555" font-size="7">Reverse direction</text>
  </svg>`;
}

/**
 * gridHedgedSVG()
 * Hedged grid: buy AND sell orders placed simultaneously on both sides.
 */
function gridHedgedSVG() {
  return `<svg viewBox="0 0 320 210" style="width:100%;max-height:200px;font-family:Arial;font-size:8px;">
    <line x1="10" y1="170" x2="310" y2="170" stroke="#27ae60" stroke-dasharray="4,3" stroke-width="1.2"/>
    <line x1="10" y1="140" x2="310" y2="140" stroke="#27ae60" stroke-dasharray="2,3" stroke-width="0.8"/>
    <line x1="10" y1="105" x2="310" y2="105" stroke="#888" stroke-dasharray="3,3" stroke-width="1"/>
    <line x1="10" y1="70"  x2="310" y2="70"  stroke="#e74c3c" stroke-dasharray="2,3" stroke-width="0.8"/>
    <line x1="10" y1="40"  x2="310" y2="40"  stroke="#e74c3c" stroke-dasharray="4,3" stroke-width="1.2"/>
    <polyline points="10,105 70,70 130,140 190,50 250,130 310,80" fill="none" stroke="#5b2d8e" stroke-width="2"/>
    <text x="240" y="168" fill="#27ae60" font-size="7">Buy 2</text>
    <text x="240" y="138" fill="#27ae60" font-size="7">Buy 1</text>
    <text x="240" y="103" fill="#888"    font-size="7">Entry</text>
    <text x="240" y="68"  fill="#e74c3c" font-size="7">Sell 1</text>
    <text x="240" y="38"  fill="#e74c3c" font-size="7">Sell 2</text>
    <line x1="155" y1="40" x2="155" y2="170" stroke="#5b2d8e" stroke-dasharray="5,3" stroke-width="1"/>
    <text x="157" y="108" fill="#5b2d8e" font-size="7">Both sides</text>
  </svg>`;
}

/* ─── HEDGING DIAGRAMS ──────────────────────────────── */

/**
 * recoveryZoneSVG()
 * Shows the recovery zone concept with profit targets above/below.
 */
function recoveryZoneSVG() {
  return `<svg viewBox="0 0 260 180" style="width:100%;max-height:170px;font-family:Arial;font-size:8px;">
    <line x1="20" y1="55"  x2="240" y2="55"  stroke="#27ae60" stroke-dasharray="5,3" stroke-width="1.2"/>
    <line x1="20" y1="125" x2="240" y2="125" stroke="#e74c3c" stroke-dasharray="5,3" stroke-width="1.2"/>
    <rect x="80" y="55" width="100" height="70" fill="rgba(91,45,142,0.07)" stroke="#5b2d8e" stroke-width="1"/>
    <text x="112" y="90" fill="#5b2d8e" font-size="9" font-weight="bold">Recovery</text>
    <text x="117" y="102" fill="#5b2d8e" font-size="9" font-weight="bold">Zone</text>
    <text x="22" y="52"  fill="#27ae60">Profit Target = pips ▲</text>
    <text x="22" y="138" fill="#e74c3c">Profit Target = pips ▼</text>
    <line x1="130" y1="55" x2="130" y2="20" stroke="#27ae60" stroke-width="2"/>
    <polygon points="125,20 135,20 130,12" fill="#27ae60"/>
    <line x1="130" y1="125" x2="130" y2="160" stroke="#e74c3c" stroke-width="2"/>
    <polygon points="125,160 135,160 130,168" fill="#e74c3c"/>
  </svg>`;
}

/**
 * trendFollowingSVG()
 * Shows a primary buy entry with a hedge order and final profit target.
 */
function trendFollowingSVG() {
  return `<svg viewBox="0 0 260 180" style="width:100%;max-height:170px;font-family:Arial;font-size:8px;">
    <polyline points="20,145 80,85 140,110 200,40" fill="none" stroke="#5b2d8e" stroke-width="2"/>
    <text x="22" y="142" fill="#27ae60">Entry Buy →</text>
    <line x1="80" y1="85" x2="80" y2="115"  stroke="#e74c3c" stroke-width="1.5" stroke-dasharray="3,2"/>
    <text x="84" y="103" fill="#e74c3c" font-size="8">Hedge</text>
    <line x1="200" y1="40" x2="200" y2="15"  stroke="#27ae60" stroke-width="1.5"/>
    <polygon points="196,15 204,15 200,8" fill="#27ae60"/>
    <text x="170" y="13" fill="#27ae60">Profit Target</text>
    <line x1="20" y1="135" x2="240" y2="135" stroke="#27ae60" stroke-dasharray="4,3" stroke-width="1"/>
  </svg>`;
}

/**
 * rangeHedgingSVG()
 * Shows a price range with sell limit at top and buy limit at bottom.
 */
function rangeHedgingSVG() {
  return `<svg viewBox="0 0 260 180" style="width:100%;max-height:170px;font-family:Arial;font-size:8px;">
    <line x1="20" y1="35"  x2="240" y2="35"  stroke="#e74c3c" stroke-width="1.5" stroke-dasharray="5,3"/>
    <line x1="20" y1="145" x2="240" y2="145" stroke="#27ae60" stroke-width="1.5" stroke-dasharray="5,3"/>
    <rect x="20" y="35" width="220" height="110" fill="rgba(91,45,142,0.04)" stroke="#5b2d8e" stroke-width="1"/>
    <polyline points="20,90 55,55 95,125 140,45 185,130 220,60" fill="none" stroke="#5b2d8e" stroke-width="2"/>
    <text x="22" y="30"  fill="#e74c3c">Sell Limit — Range Top</text>
    <text x="22" y="158" fill="#27ae60">Buy Limit — Range Bottom</text>
    <text x="100" y="93" fill="#5b2d8e" font-size="9" font-weight="bold">Range</text>
  </svg>`;
}

/* ─── RANGE BREAKOUT DIAGRAM ────────────────────────── */

/**
 * rangeBreakoutSVG()
 * Illustrates a time-based range with a breakout to the upside.
 */
function rangeBreakoutSVG() {
  return `<svg viewBox="0 0 260 180" style="width:100%;max-height:170px;font-family:Arial;font-size:8px;">
    <rect x="60" y="50" width="80" height="80" fill="rgba(91,45,142,0.1)" stroke="#5b2d8e" stroke-width="1" stroke-dasharray="2,2"/>
    <text x="65" y="45" fill="#5b2d8e">Start Time</text>
    <text x="120" y="45" fill="#5b2d8e">+ Duration</text>
    <line x1="20" y1="50" x2="240" y2="50" stroke="#27ae60" stroke-width="1.5" stroke-dasharray="4,2"/>
    <line x1="20" y1="130" x2="240" y2="130" stroke="#e74c3c" stroke-width="1.5" stroke-dasharray="4,2"/>
    <polyline points="20,90 40,70 60,110 80,60 100,120 120,80 140,80 160,30 200,15" fill="none" stroke="#5b2d8e" stroke-width="2"/>
    <polygon points="196,15 204,15 200,8" fill="#5b2d8e"/>
    <text x="145" y="25" fill="#5b2d8e" font-weight="bold">Breakout</text>
    <text x="22" y="142" fill="#e74c3c">Range Low</text>
    <text x="22" y="62" fill="#27ae60">Range High</text>
  </svg>`;
}

/* ─── RECOVERY ZONE HTML DIAGRAM ────────────────────── */

/**
 * recoveryZoneHTML(maxOrdersStr)
 * Generates the interactive grid of editable volume inputs
 * displayed in the Recovery Zone strategy Step-1 panel.
 *
 * @param {string|number} maxOrdersStr - Total number of recovery orders.
 *   Orders are split evenly: odd-indexed (top row) and even-indexed (bottom row).
 *
 * NOTE: Called on load AND on change of the Max Orders dropdown
 *   via onchange="document.getElementById('recovery-diagram-wrap').innerHTML=recoveryZoneHTML(this.value)"
 */
function recoveryZoneHTML(maxOrdersStr) {
  let maxOrders = parseInt(maxOrdersStr) || 14;
  // Default lot sizes increasing non-linearly (Martingale-style)
  const defaults = [0.01, 0.02, 0.03, 0.05, 0.07, 0.1, 0.15, 0.2, 0.3, 0.5, 0.7, 1, 1.5, 2, 3, 5, 8, 12, 18, 25];
  let topRows = '';
  let bottomRows = '';
  let topCount = Math.ceil(maxOrders / 2);
  let bottomCount = Math.floor(maxOrders / 2);

  // Odd orders (1, 3, 5…) go on the top row (above the zone)
  for (let i = 0; i < topCount; i++) {
    topRows += `<div style="text-align:center;font-size:11px;font-weight:600;"><div style="margin-bottom:12px;">Order (${i*2+1}) <br><span style="position:relative;top:8px;">↑</span></div><div style="font-size:9.5px;border:1px solid #c7c7c7;padding:3px;background:#f5faec;">V (${i*2+1}): <br><input type="text" style="width:34px;font-size:10px;text-align:center;border:1px solid #ccc;border-radius:2px;" value="${defaults[i*2] || 0.01}"/></div></div>`;
  }
  // Even orders (2, 4, 6…) go on the bottom row (below the zone)
  for (let i = 0; i < bottomCount; i++) {
    bottomRows += `<div style="text-align:center;font-size:11px;font-weight:600;"><div style="font-size:9.5px;margin-bottom:12px;border:1px solid #c7c7c7;padding:3px;background:#fcf6e3;">V (${i*2+2}): <br><input type="text" style="width:34px;font-size:10px;text-align:center;border:1px solid #ccc;border-radius:2px;" value="${defaults[i*2+1] || 0.01}"/></div><div><span style="position:relative;bottom:8px;">↓</span><br>Order (${i*2+2})</div></div>`;
  }
  if (topRows === '') topRows = '<div></div>';
  if (bottomRows === '') bottomRows = '<div></div>';

  return `
    <div style="width:100%;display:flex;flex-direction:column;gap:10px;position:relative;min-width:400px;padding:10px 0;overflow-x:auto;">
      <div style="position:absolute;right:0;top:-12px;font-size:11px;font-weight:bold;">Profit Target = 30 pips</div>
      <div style="border-top:1.5px dashed #222;padding-top:20px;">
        <div style="display:flex;justify-content:space-between;margin-bottom:5px;border-bottom:1.5px dashed #28a745;padding-bottom:5px;">
           ${topRows}
        </div>
        <div style="display:flex;justify-content:space-between;border-top:1.5px dashed #dc3545;padding-top:5px;position:relative;margin-top:-5.5px;">
           <div style="position:absolute;right:-25px;top:-12px;font-size:11px;font-weight:bold;color:red;background:#fff;padding:0 4px;z-index:2;">↑<br>THE ZONE = 15 pips<br>↓</div>
           ${bottomRows}
        </div>
      </div>
      <div style="border-bottom:1.5px dashed #222;margin-top:20px;position:relative;">
        <div style="position:absolute;right:0;bottom:-18px;font-size:11px;font-weight:bold;">Profit Target = 30 pips</div>
      </div>
    </div>
  `;
}
