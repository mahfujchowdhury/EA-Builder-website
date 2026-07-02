/* =====================================================
   ui-controls.js - UI Toggle Helpers, Render Engine,
                    Strategy Switchers & Help Modal
   =====================================================
   PURPOSE:
     - Toggle helpers (toggleSize, toggleSLTP, toggleTS, etc.)
       that show/hide sub-fields when dropdowns change.
     - The render engine (renderSteps) that injects template
       HTML into the DOM.
     - Strategy pill switchers (selectStrategy, selectGridType, etc.)
     - Step 2 sub-field sync (syncTM2Type).
     - Help modal logic (showHelp, closeTM2Help, helpContent).

   DEPENDENCIES: state.js, diagrams.js, templates.js
   Must load AFTER templates.js, BEFORE rules-builder.js.

   IMPORTANT NOTES:
     - renderSteps() is the core function called whenever
       the user changes strategy or sub-type. It rebuilds
       Step 1, 2, and 3 panels entirely from templates.
     - After injecting HTML, renderSteps() runs syncTM2Type()
       on all SL/TP/Trailing dropdowns to set initial visibility.
     - SVG diagram functions live in diagrams.js (loaded earlier).
   ===================================================== */
function toggleSize(prefix, val) {
  const fix = document.getElementById(prefix + '-fixed-wrap');
  const dyn = document.getElementById(prefix + '-dynamic-wrap');
  if (fix) fix.style.display = (val === 'fixed')   ? 'block' : 'none';
  if (dyn) dyn.style.display = (val === 'dynamic') ? 'block' : 'none';
}

function toggleSLTP(id) {
  const sel = document.querySelector(`select[name="${id}"]`);
  if (!sel) return;
  const val = sel.value;
  const atr  = document.getElementById(id + '-atr-wrap');
  const fix  = document.getElementById(id + '-fix-wrap');
  const frac = document.getElementById(id + '-frac-wrap');
  const rr   = document.getElementById(id + '-rr-wrap');
  const fib  = document.getElementById(id + '-fib-wrap');
  const sr   = document.getElementById(id + '-sr-wrap');
  const time = document.getElementById(id + '-time-wrap');

  if (atr)  atr.style.display  = val.includes('ATR')      ? 'block' : 'none';
  if (fix)  fix.style.display  = val.includes('Fix')      ? 'block' : 'none';
  if (frac) frac.style.display = val.includes('Fractal')  ? 'block' : 'none';
  if (rr)   rr.style.display   = val.includes('Risk')     ? 'block' : 'none';
  if (fib)  fib.style.display  = val.includes('Fibonacci') ? 'block' : 'none';
  if (sr)   sr.style.display   = val.includes('Support')   ? 'block' : 'none';
  if (time) time.style.display = val.includes('Time')      ? 'block' : 'none';
}

function toggleTS(id) {
  const sel = document.querySelector(`select[name="${id}"]`);
  if (!sel) return;
  const val = sel.value;
  const atr  = document.getElementById(id + '-atr-wrap');
  const fix  = document.getElementById(id + '-fix-wrap');
  const frac = document.getElementById(id + '-frac-wrap');
  if (atr)  atr.style.display  = (val.includes('ATR') || val.includes('Indicator')) ? 'block' : 'none';
  if (fix)  fix.style.display  = val.includes('Fix')                               ? 'block' : 'none';
  if (frac) frac.style.display = val.includes('Fractal')                           ? 'block' : 'none';
}

function toggleDaily(prefix, type, val) {
  const dyn = document.getElementById(prefix + '-' + type + '-dyn-wrap');
  const fix = document.getElementById(prefix + '-' + type + '-fix-wrap');
  if (dyn) dyn.style.display = (val === 'dynamic') ? 'block' : 'none';
  if (fix) fix.style.display = (val === 'fixed')   ? 'block' : 'none';
}

function toggleYesNo(id, val) {
  const wrap = document.getElementById(id + '-yes-wrap');
  if (wrap) wrap.style.display = (val === 'yes') ? 'block' : 'none';
}

function toggleGridSpacing(prefix, val) {
  const row = document.getElementById(prefix + '-spacing-row');
  if (!row) return;
  const label = row.querySelector('.real-label');
  const staticWrap = document.getElementById(prefix + '-spacing-static');
  const dynamicWrap = document.getElementById(prefix + '-spacing-dynamic');

  if (val === 'dynamic') {
    if (label) label.firstChild.textContent = 'Spacing (in ATR) ';
    if (staticWrap) staticWrap.style.display = 'none';
    if (dynamicWrap) dynamicWrap.style.display = 'block';
  } else {
    if (label) label.firstChild.textContent = 'Spacing (in pips) ';
    if (staticWrap) staticWrap.style.display = 'block';
    if (dynamicWrap) dynamicWrap.style.display = 'none';
  }
}


/* =============================================================
   RENDER ENGINE
   ============================================================= */

function getTemplate() {
  const s = state.strategy;
  if (s === 'simple') return tplSimple();
  if (s === 'grid') {
    if (state.gridType === 'classic') return tplGridClassic();
    if (state.gridType === 'reverse') return tplGridReverse();
    if (state.gridType === 'hedged') return tplGridHedged();
  }
  if (s === 'hedging') {
    if (state.hedgingType === 'recovery') return tplHedgingRecovery();
    if (state.hedgingType === 'trendfollowing') return tplHedgingTrendFollowing();
    if (state.hedgingType === 'range') return tplHedgingRange();
  }
  if (s === 'martingale') {
    if (state.martingaleType === 'classic') return tplMartingaleClassic();
    if (state.martingaleType === 'anti') return tplMartingaleAnti();
  }
  if (s === 'rangebreakout') {
    if (state.rangeBreakoutType === 'classic') return tplRangeBreakoutClassic();
    if (state.rangeBreakoutType === 'anti') return tplRangeBreakoutAnti();
  }
  return tplSimple();
}

function renderSteps() {
  const tpl = getTemplate();

  document.getElementById('step1-title').textContent = tpl.step1Title;
  document.getElementById('step1-body').innerHTML = tpl.step1HTML;
  document.getElementById('step2-title').textContent = tpl.step2Title;
  document.getElementById('step2-body').innerHTML = tpl.step2HTML;

  // Step 3 label & Hedge Rules visibility
  const s = state.strategy;
  const ht = state.hedgingType;
  const isSpecialHedge = (s === 'hedging' && (ht === 'trendfollowing' || ht === 'range'));

  const step3Title = document.getElementById('step3-title');
  if (step3Title) {
    step3Title.innerHTML = isSpecialHedge ? 'Step 3: Rules for Primary Orders' : 'Step 3: Entry &amp; Exit Rules';
  }

  // Step 4 (Hedge Rules) visibility
  const hedgeCard = document.getElementById('step-hedge-rules-card');
  if (hedgeCard) {
    hedgeCard.classList.toggle('hidden', !isSpecialHedge);
  }

  // Step 5 (Other Settings) visibility
  const otherSettings = document.getElementById('step-other-settings-card');
  if (otherSettings) {
    // Show for Simple, Martingale, Range Breakout
    otherSettings.classList.toggle('hidden', s !== 'simple' && s !== 'martingale' && s !== 'rangebreakout');
  }

  // Exit rules visibility
  const exitBox = document.getElementById('exit-rules-box');
  if (exitBox) exitBox.classList.remove('hidden');

  // Initialise Step 2 sub-field visibility after new HTML is injected
  document.querySelectorAll('[id$="_stopLossType"],[id$="_takeProfitType"],[id$="_trailingMode"]').forEach(function (el) {
    var id = el.id;  // e.g. "s_stopLossType"
    var p = id.replace(/_stopLossType$|_takeProfitType$|_trailingMode$/, '');
    var sfx = id.replace(p + '_', '');
    var prefix = p + '-' + (sfx === 'stopLossType' ? 'sl' : sfx === 'takeProfitType' ? 'tp' : 'tm');
    syncTM2Type(el, prefix);
  });

  // Initialize DTP (Dynamic Take Profit) if present
  document.querySelectorAll('[id$="_dtp_type"]').forEach(function (el) {
    syncDTP(el.id.replace('_dtp_type', ''));
  });
}



/* =============================================================
   STRATEGY SWITCHERS
   ============================================================= */

function selectStrategy(s) {
  state.strategy = s;
  ['simple', 'grid', 'hedging', 'martingale', 'rangebreakout'].forEach(n => {
    document.getElementById('pill-' + n).classList.toggle('selected', n === s);
  });
  document.getElementById('row-gridtype').classList.toggle('hidden', s !== 'grid');
  document.getElementById('row-hedgingtype').classList.toggle('hidden', s !== 'hedging');
  document.getElementById('row-martingaletype').classList.toggle('hidden', s !== 'martingale');
  document.getElementById('row-rangebreakouttype').classList.toggle('hidden', s !== 'rangebreakout');
  renderSteps();
}

function selectRangeBreakoutType(t) {
  state.rangeBreakoutType = t;
  ['classic', 'anti'].forEach(n => {
    document.getElementById('pill-rangebreakout-' + n).classList.toggle('selected', n === t);
  });
  renderSteps();
}

function selectGridType(t) {
  state.gridType = t;
  ['classic', 'reverse', 'hedged'].forEach(n => {
    document.getElementById('pill-grid-' + n).classList.toggle('selected', n === t);
  });
  renderSteps();
}

function selectHedgingType(t) {
  state.hedgingType = t;
  ['recovery', 'trendfollowing', 'range'].forEach(n => {
    document.getElementById('pill-hedging-' + n).classList.toggle('selected', n === t);
  });
  renderSteps();
}

function selectMartingaleType(t) {
  state.martingaleType = t;
  ['classic', 'anti'].forEach(n => {
    document.getElementById('pill-martingale-' + n).classList.toggle('selected', n === t);
  });
  renderSteps();
}

/* =============================================================
   SIDEBAR TOGGLE
   ============================================================= */

function toggleNav(id) {
  const el = document.getElementById(id);
  const toggle = document.getElementById(id + '-toggle');
  const hidden = el.classList.toggle('hidden');
  toggle.classList.toggle('open', !hidden);
}

/* =============================================================
   STEP 2 — TRADE MANAGEMENT DYNAMIC SUB-FIELDS
   ============================================================= */

function syncTM2Type(sel, prefix) {
  // Hide all sub-controls for this prefix
  document.querySelectorAll('.' + prefix + '-sub').forEach(function (el) {
    el.classList.add('hide');
  });
  var chosen = sel.options[sel.selectedIndex];
  var dataId = chosen ? chosen.getAttribute('data-id') : null;
  if (!dataId) return;
  var target = document.querySelector('.' + prefix + '-sub.' + dataId);
  if (target) target.classList.remove('hide');
}

function syncDTP(prefix) {
  const typeEl = document.getElementById(prefix + '_dtp_type');
  const countEl = document.getElementById(prefix + '_dtp_count');
  if (!typeEl || !countEl) return;

  const type = typeEl.value;
  const count = parseInt(countEl.value) || 1;
  const container = document.getElementById(prefix + '_dtp_params_container');

  if (!type) {
    if (container) container.classList.add('hide');
    return;
  }

  if (container) container.classList.remove('hide');

  // Hide all groups
  document.querySelectorAll('.' + prefix + '-dtp-group').forEach(el => el.classList.add('hide'));

  // Show active group
  const group = document.querySelector('.' + prefix + '-dtp-group-' + type);
  if (group) {
    group.classList.remove('hide');
    // Toggle rows within group
    for (let i = 1; i <= 5; i++) {
      const row = group.querySelector('.' + prefix + '-dtp-row-' + i);
      if (row) row.classList.toggle('hide', i > count);
    }
  }
}



/* Help content for Step 2 */
const helpContent = {
  'Stop Loss': {
    title: 'Stop Loss',
    body: '<b>Calculated From ATR Indicator</b>: Dynamically sets the stop loss based on a multiplier of the Average True Range (ATR), adapting to market volatility.<br><br><b>Fixed Distance (in pips)</b>: Sets a fixed stop loss at a specified number of pips from the entry price.<br><br><b>Fractal High/Low</b>: Places the stop loss at the most recent fractal high (for sell) or fractal low (for buy).<br><br><b>Fibonacci base</b>: Uses Fibonacci levels to determine optimal stop placement.<br><br><b>Support & Resistance base</b>: Sets stop loss based on key structural market levels.<br><br><b>time base</b>: Closes the position based on a defined time duration.'
  },
  'Take Profit': {
    title: 'Take Profit',
    body: '<b>Risk/Reward Ratio (SL x Coef.)</b>: Sets the take profit as a multiple of the stop loss distance, e.g. 2x SL means TP is twice the SL distance.<br><br><b>Calculated From ATR Indicator</b>: Dynamically sets the TP based on a multiplier of the ATR.<br><br><b>Fixed Distance (in pips)</b>: Sets a fixed take profit at a specified number of pips from entry.<br><br><b>Fibonacci base</b>: Targets specific Fibonacci extension levels for profit taking.<br><br><b>Support & Resistance base</b>: Sets profit targets near major resistance or support zones.<br><br><b>time base</b>: Closes the trade for profit after a specified duration.'
  },
  'Trailing Stop': {
    title: 'Trailing Stop',
    body: '<b>Fixed Distance (in pips)</b>: Trails the stop loss by a fixed number of pips as price moves in your favour.<br><br><b>Fractal High/Low</b>: Moves the stop loss to the most recent fractal level as price progresses.<br><br><b>Breakeven</b>: Moves the stop loss to breakeven once the trade reaches a specified % of the take profit distance.<br><br><b>ATR</b>: Dynamically trails the stop based on current market volatility.'
  },
  'Dynamic Take Profit': {
    title: 'Dynamic Take Profit',
    body: '<b>Calculated from ATR Indicator</b>: Sets a secondary target based on market volatility.<br><br><b>Fixed distance</b>: Sets a fixed secondary target at a specific pip distance.<br><br><b>Support & Resistance base</b>: Sets profit targets near major structural market zones.<br><br><b>Time base</b>: Closes the trade based on a defined time duration.<br><br><b>Partial percentage</b>: Closes a specific percentage of the position lot size when a target price is reached.'
  }
};


function showHelp(topic) {
  var modal = document.getElementById('tm2-help-modal');
  if (!modal) return;
  var info = helpContent[topic] || { title: topic, body: 'No further information.' };
  document.getElementById('tm2-help-title').textContent = info.title;
  document.getElementById('tm2-help-body').innerHTML = info.body;
  modal.style.display = 'flex';
}

function closeTM2Help() {
  var modal = document.getElementById('tm2-help-modal');
  if (modal) modal.style.display = 'none';
}