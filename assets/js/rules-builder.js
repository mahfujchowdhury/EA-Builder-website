/* =====================================================
   rules-builder.js - Rule Modal, Indicators, Bot Builder & Init
   =====================================================
   PURPOSE:
     - ADVANCED_INDICATORS dictionary (19 technical indicators
       with their parameters and rule definitions).
     - Rule modal logic: addRule(), syncModalIndicator(),
       confirmAddRule(), closeModal(), deleteRule().
     - Money management validators: toggleDynamicLot(),
       validateMaxLoss(), validateFixedLot().
     - Build Bot: captureStepForm(), captureStep3Table(),
       buildBot() - serialises all form data to JSON and
       triggers a download.
     - DOMContentLoaded init.

   DEPENDENCIES: state.js, diagrams.js, templates.js, ui-controls.js
   Must load LAST.

   IMPORTANT NOTES:
     - ADVANCED_INDICATORS keys (e.g. 'rsi', 'macd') match the
       <option value="..."> in index.html's indicator dropdown.
     - buildBot() collects data from ALL 4 steps, including
       hidden fields. Fields inside .hide/.hidden containers
       are intentionally skipped by captureStepForm().
     - The downloaded JSON filename is derived from the bot name
       input, sanitised to lowercase alphanumeric + hyphens.
   ===================================================== */
/* =============================================================
   RULE MODAL (Upgraded with 31 Indicators)
   ============================================================= */

const ADVANCED_INDICATORS = {
  ac: { name: "Accelerator Oscillator", params: [["Candle Shift", "0"]], rules: ["Histogram crosses Zero line Up / Down", "Two consecutive green bars above zero (acceleration long)", "Two consecutive red bars below zero (acceleration short)", "Color change (bar turns green / red)"] },
  adx: { name: "ADX", params: [["Period", "14"], ["Applied Price", "Close", ["Close", "Open", "High", "Low", "Median (HL/2)", "Typical (HLC/3)", "Weighted (HLCC/4)"]], ["Candle Shift", "0"], ["__SECTION__", "Signal level"], ["ADX Level", "25"]], rules: ["+DI & -DI crossover with ADX Confirmation", "+DI & -DI pure crossover"] },
  alligator: { name: "Alligator", params: [["Jaws Period", "13"], ["Teeth Period", "8"], ["Lips Period", "5"], ["Jaws Shift", "8"], ["Teeth Shift", "5"], ["Lips Shift", "3"], ["MA Method", "Smoothed", ["Simple", "Exponential", "Smoothed", "Linear-weighted"]], ["Applied Price", "Median (HL/2)", ["Close", "Open", "High", "Low", "Median (HL/2)", "Typical (HLC/3)", "Weighted (HLCC/4)"]], ["Candle Shift", "0"]], rules: ["Bullish or Bearish line Crossover", "Lips breakout with price closing above/below", "Lips rebound with trend alignment"] },
  atr: { name: "ATR (Average True Range)", params: [["Period", "14"], ["Applied price", "Close", ["Close", "Open", "High", "Low", "Median", "Typical", "Weighted"]], ["ATR Level", "0.001"], ["Consecutive candles", "3"], ["Candle shift", "0"]], rules: ["ATR crosses above a threshold (high volatility trigger)", "ATR crosses below a threshold (low volatility / avoid trading)", "ATR rising for N consecutive candles", "ATR falling for N consecutive candles"] },
  ao: { name: "Awesome Oscillator", params: [["Candle Shift", "0"]], rules: ["Histogram crosses Zero line Up / Down", "Twin Peaks setup (two consecutive peaks below zero = buy / two above zero = sell)", "Saucer setup (three bars, middle is lowest/highest, all same color)"] },
  bb: { name: "Bollinger Bands", params: [["Period", "20"], ["Deviations", "2.0"], ["Bands Shift", "0"], ["Applied Price", "Close", ["Close", "Open", "High", "Low", "Median (HL/2)", "Typical (HLC/3)", "Weighted (HLCC/4)"]], ["Candle Shift", "0"]], rules: ["Opens inside / Closes above upper", "Closes above midline", "Opens inside / Closes below lower", "Closes below midline"] },
  cci: { name: "CCI", params: [["Period", "14"], ["MA Method", "Simple", ["Simple", "Exponential", "Smoothed", "Linear-weighted"]], ["Applied Price", "Typical (HLC/3)", ["Close", "Open", "High", "Low", "Median (HL/2)", "Typical (HLC/3)", "Weighted (HLCC/4)"]], ["Candle Shift", "0"], ["__SECTION__", "Signal levels"], ["Sell Level", "100"], ["Buy Level", "-100"]], rules: ["Crossing UP", "Crossing DOWN"] },
  demarker: { name: "DeMarker", params: [["Period", "14"], ["Candle Shift", "0"], ["__SECTION__", "Signal levels"], ["Sell Level", "0.7"], ["Buy Level", "0.3"]], rules: ["Line crosses upward through 0.3", "Line crosses downward through 0.7"] },
  donchian: { name: "Donchian Channel", params: [["Period", "20"], ["Bands Shift", "0"], ["Applied Price", "Close", ["Close", "Open", "High", "Low", "Median (HL/2)", "Typical (HLC/3)", "Weighted (HLCC/4)"]], ["Candle Shift", "0"]], rules: ["Price crosses Upper Band (breakout long)", "Candle closes below Lower band (breakout short)", "Candle opens outside / closes inside (mean reversion)", "Price touches Midline from above / below"] },
  envelopes: { name: "Envelopes", params: [["Period", "14"], ["MA Method", "Simple", ["Simple", "Exponential", "Smoothed", "Linear-weighted"]], ["Applied Price", "Close", ["Close", "Open", "High", "Low", "Median (HL/2)", "Typical (HLC/3)", "Weighted (HLCC/4)"]], ["Deviation (%)", "0.1"], ["Candle Shift", "0"]], rules: ["Price crosses Upper Band", "Price crosses Lower Band", "Price crosses Midline"] },
  fractals: { name: "Fractals", params: [["Period", "14"], ["Confirmation candles", "2"]], rules: ["Price crosses highest and lowest", "New arrow higher lower appear"] },
  heiken: { name: "Heiken Ashi", params: [["Confirmation Candles", "1"]], rules: ["Candle changes to green", "Candle changes to red"] },
  hma: { name: "Hull Moving Average", params: [["__SECTION__", "HMA 1 (Shorter-term)"], ["Period (Short)", "20"], ["Applied Price (Short)", "Close", ["Close", "Open", "High", "Low", "Median (HL/2)", "Typical (HLC/3)", "Weighted (HLCC/4)"]], ["__SECTION__", "HMA 2 (Longer-term)"], ["Period (Long)", "50"], ["Applied Price (Long)", "Close", ["Close", "Open", "High", "Low", "Median (HL/2)", "Typical (HLC/3)", "Weighted (HLCC/4)"]], ["__SECTION__", "Options"], ["Candle Shift", "0"]], rules: ["Direction change Up / Down (slope reversal)", "Price closes above / below HMA", "Two HMA crossover (Short HMA crosses Long HMA)"] },
  ichimoku: { name: "Ichimoku", params: [["Tenkan Sen", "9"], ["Kijun Sen", "26"], ["Senkou Span B", "52"], ["Chikou Span Shift", "26"], ["Candle Shift", "0"]], rules: ["Candle closes Above or Below the cloud", "Candle close Above or Below the Tenkan", "Candle close Above or Below the Kijun", "Tenkan crosses the kijun UP/ Down", "Chikou Crosses the Candle UP/ Down", "Chikou Crosses the Tenkan UP/ Down", "Chikou Crosses the Kijun UP/ Down", "Chikou Crosses the Cloud UP/ Down"] },
  linreg: { name: "Linear Regression", params: [["Period", "14"], ["Applied price", "Close", ["Close", "Open", "High", "Low", "Median", "Typical", "Weighted"]], ["Deviation", "2.0"], ["Candle shift", "0"]], rules: ["Price crosses Linear Regression line Up / Down", "Price crosses Upper channel / Lower channel", "Slope direction changes (turns bullish / bearish)"] },
  macd: { name: "MACD", params: [["Fast Length", "12"], ["Slow Length", "26"], ["Signal Length", "9"], ["MA Type", "EMA", ["EMA", "SMA"]], ["Signal MA Type", "EMA", ["EMA", "SMA"]], ["Applied Price", "Close", ["Close", "Open", "High", "Low", "Median (HL/2)", "Typical (HLC/3)", "Weighted (HLCC/4)"]], ["Candle Shift", "0"]], rules: ["", "Histogram Crossing the Zero line", "Crossing MACD line with Signal line"] },
  momentum: { name: "Momentum", params: [["Period", "14"], ["Applied Price", "Close", ["Close", "Open", "High", "Low", "Median (HL/2)", "Typical (HLC/3)", "Weighted (HLCC/4)"]], ["Candle Shift", "0"], ["__SECTION__", "Signal levels"], ["Sell Level", "100"], ["Buy Level", "100"]], rules: ["Line crosses upward through 100", "Line crosses downward through 100"] },
  mfi: { name: "Money Flow Index (MFI)", params: [["Period", "14"], ["Volume Type", "Tick", ["Tick", "Real"]], ["Candle Shift", "0"], ["__SECTION__", "Signal levels"], ["Sell Level", "80"], ["Buy Level", "20"]], rules: ["MFI crosses upward through Buy Level", "MFI crosses downward through Sell Level", "MFI crosses upward through 50", "MFI crosses downward through 50"] },
  ma: { name: "Moving Average", params: [["__SECTION__", "MA 1 (Shorter-term)"], ["Period (Short)", "14"], ["MA Method (Short)", "Simple", ["Simple", "Exponential", "Smoothed", "Linear-weighted"]], ["Applied Price (Short)", "Close", ["Close", "Open", "High", "Low", "Median (HL/2)", "Typical (HLC/3)", "Weighted (HLCC/4)"]], ["__SECTION__", "MA 2 (Longer-term)"], ["Period (Long)", "50"], ["MA Method (Long)", "Simple", ["Simple", "Exponential", "Smoothed", "Linear-weighted"]], ["Applied Price (Long)", "Close", ["Close", "Open", "High", "Low", "Median (HL/2)", "Typical (HLC/3)", "Weighted (HLCC/4)"]], ["__SECTION__", "Options"], ["Candle Shift", "0"]], rules: ["Two Moving Averages Crossing", "Candle open Inside & Close outside", "Candle Retest the Moving Average"] },
  osma: { name: "OsMA", params: [["Fast", "12"], ["Slow", "26"], ["Signal", "9"], ["MA Method", "EMA", ["EMA", "SMA", "SMMA"]], ["Applied Price", "Close", ["Close", "Open", "High", "Low", "Median (HL/2)", "Typical (HLC/3)", "Weighted (HLCC/4)"]], ["Candle Shift", "0"]], rules: ["Histogram crosses above zero", "Histogram crosses below zero"] },
  sar: { name: "Parabolic SAR", params: [["Start", "0.02"], ["Step", "0.02"], ["Maximum", "0.2"], ["Candle Shift", "0"]], rules: ["Direction change UP", "Direction change DOWN"] },
  pivot: { name: "Pivot Points", params: [["Type", "Traditional", ["Traditional", "Fibonacci", "Woodie", "Classic", "DeMark", "Camarilla", "Floor"]], ["Pivots Lookback", "1"], ["Candle Shift", "0"]], rules: ["Candle close above or below the P", "Candle close above S1 or below R1", "Candle close below S1 or above R1", "Candle close above S2 or below R2", "Candle close below S2 or above R2", "Candle close above S3 or below R3", "Candle close below S3 or above R3"] },
  renko: { name: "Renko Charts", params: [["Box Size", "10"], ["X Bricks", "2"], ["y Bricks", "2"]], rules: ["Bricks color change"] },
  rsi: { name: "RSI", params: [["Length", "14"], ["Applied Price", "Close", ["Close", "Open", "High", "Low", "Median (HL/2)", "Typical (HLC/3)", "Weighted (HLCC/4)"]], ["MA Type", "SMA", ["SMA", "EMA"]], ["MA Length", "14"], ["Candle Shift", "0"], ["__SECTION__", "Signal levels"], ["Sell Level", "70"], ["Buy Level", "30"]], rules: ["Crossing up Down"] },
  stoch: { name: "Stochastic Oscillator", params: [["%K Period", "5"], ["%D Period", "3"], ["Slowing", "3"], ["Price Field", "Low/High", ["Low/High", "Close/Close"]], ["MA Method", "Simple", ["Simple", "Exponential", "Smoothed", "Linear-weighted"]], ["Candle Shift", "0"], ["__SECTION__", "Signal levels"], ["Sell Level", "80"], ["Buy Level", "20"]], rules: ["%K crosses above %D", "%K crosses upward through Buy Level", "%K crosses below %D", "%K crosses downward through Sell Level"] },
  supertrend: { name: "SuperTrend", params: [["ATR Length", "10"], ["Factor", "3.0"], ["Candle Shift", "0"]], rules: ["Direction change UP", "Direction change DOWN"] },
  supportresistance: { name: "Support and Resistance", params: [["Lookback period", "50"], ["Tolerance (pips)", "5"], ["Candle shift", "0"]], rules: ["Price closes above N-candle high (resistance broken)", "Price closes below N-candle low (support broken)", "Price retests the level and bounces"] },
  volume: { name: "Volume", params: [["MA Period", "20"], ["MA Method", "Simple", ["Simple", "Exponential", "Smoothed", "Linear-weighted"]], ["Volume threshold", "1000"], ["Consecutive candles", "3"], ["Candle Shift", "0"], ["Volume type", "Tick volume", ["Tick volume", "Real volume"]]], rules: ["Volume crosses above a threshold level", "Volume crosses above its MA (volume spike)", "Volume is rising for N consecutive candles", "Volume is falling for N consecutive candles"] },
  volprofile: { name: "Volume Profile", params: [["Lookback Period", "100"], ["Number of Rows", "24"], ["Value Area (%)", "70"]], rules: ["Price crosses POC (Point of Control)", "Price enters Value Area", "Price leaves Value Area"] },
  wpr: { name: "Williams %R", params: [["Period", "14"], ["Levels", "-20/-80"], ["Candle Shift", "0"], ["__SECTION__", "Signal level"], ["Sell level", "20"], ["Buy level", "80"]], rules: ["Line crosses upward through -80", "Line crosses downward through -20"] },
  zigzag: { name: "ZigZag", params: [["Depth", "12"], ["Deviation", "5"], ["Backstep", "3"]], rules: ["New High formed", "New Low formed"] }
};

function addRule(targetId, type) {
  state.ruleTarget = targetId;
  state.ruleType = type;
  const titles = { entry: 'Add Entry Signal', trend: 'Add Trend Filter', exit: 'Add Exit Signal' };
  const ruleLabels = { entry: 'Buy & Sell Rule', trend: 'Filter Rule', exit: 'Exit Rule' };
  document.getElementById('modal-title').textContent = titles[type];
  document.getElementById('modal-rule-label').textContent = ruleLabels[type];
  document.getElementById('modal-indicator').value = '';
  document.getElementById('modal-rule').innerHTML = '<option value="" disabled selected>— Select Rule —</option>';
  document.getElementById('modal-dynamic-params').style.display = 'none';
  document.getElementById('modal-dynamic-params').innerHTML = '';
  document.getElementById('rule-modal').classList.add('active');
}

function syncModalIndicator() {
  const code = document.getElementById('modal-indicator').value;
  const ruleDrop = document.getElementById('modal-rule');
  const paramsBox = document.getElementById('modal-dynamic-params');
  const imgEL = document.getElementById('modal-preview-img');
  const txtEL = document.getElementById('modal-preview-text');

  if (!code) {
    ruleDrop.innerHTML = '<option value="" disabled selected>— Select Rule —</option>';
    paramsBox.style.display = 'none';
    imgEL.style.display = 'none';
    txtEL.innerText = 'Select an indicator to see the configuration preview.';
    return;
  }

  const ind = ADVANCED_INDICATORS[code];

  // Populate Rules
  let rulesHTML = "";
  ind.rules.forEach(r => rulesHTML += '<option>' + r + '</option>');
  ruleDrop.innerHTML = rulesHTML;

  // Populate Params matching index.html aesthetics (form-row)
  let paramsHTML = '<div style="font-weight:600;font-size:13px;color:#333;margin-bottom:4px;">Input Parameters</div>';
  ind.params.forEach(p => {
    let inputHTML = '';
    if (p[0] === '__SECTION__') {
      paramsHTML += `<div style="font-weight:600;font-size:13px;color:#333;margin:12px 0 4px;">${p[1]}</div>`;
      return;
    }

    if (p.length > 2 && Array.isArray(p[2])) {
      inputHTML = `<select class="form-control" style="flex:1;" data-paramname="${p[0]}">`;
      p[2].forEach(opt => {
        inputHTML += `<option value="${opt}" ${opt === p[1] ? 'selected' : ''}>${opt}</option>`;
      });
      inputHTML += `</select>`;
    } else {
      inputHTML = `<input type="text" class="form-control" style="flex:1;" value="${p[1]}" data-paramname="${p[0]}"/>`;
    }

    paramsHTML += `
      <div class="form-row" style="margin-bottom:8px;">
        <span class="form-label" style="min-width:110px;font-size:12px;">${p[0]}</span>
        ${inputHTML}
      </div>
    `;
  });

  paramsBox.innerHTML = paramsHTML;
  paramsBox.style.display = 'flex';

  // Update Preview Image
  let imgStr = '';
  if (code === 'macd' || code === 'rsi' || code === 'bb' || code === 'ma') {
    const key = code === 'ma' ? 'moving_average' : (code === 'bb' ? 'bollinger_bands' : code);
    imgStr = 'assets/images/indicators/' + key + '.png';
  }
  if (imgStr) {
    imgEL.src = imgStr;
    imgEL.style.display = 'block';
    txtEL.innerText = ind.name + ' Preview';
  } else {
    imgEL.style.display = 'none';
    txtEL.innerText = ind.name + ' selected. Parameter preview live.';
  }
}

function closeModal() {
  document.getElementById('rule-modal').classList.remove('active');
}

function confirmAddRule() {
  const indicatorDrop = document.getElementById('modal-indicator');
  const indicatorCode = indicatorDrop.value;
  if (!indicatorCode) { alert('Please select an indicator.'); return; }

  const indicatorName = indicatorDrop.options[indicatorDrop.selectedIndex].text;
  const tf = document.getElementById('modal-tf').value;
  const rule = document.getElementById('modal-rule').value;

  // Compile parameters dynamically
  let paramStrings = [];
  const inputs = document.getElementById('modal-dynamic-params').querySelectorAll('input[data-paramname], select[data-paramname]');
  inputs.forEach(inp => {
    paramStrings.push(`${inp.getAttribute('data-paramname')}=${inp.value}`);
  });
  const paramVal = paramStrings.length > 0 ? paramStrings.join(', ') : '—';

  const tbody = document.getElementById(state.ruleTarget);
  const placeholder = tbody.querySelector('tr[data-empty]');
  if (placeholder) placeholder.remove();

  if (!state.counters[state.ruleTarget]) state.counters[state.ruleTarget] = 0;
  state.counters[state.ruleTarget]++;
  const i = state.counters[state.ruleTarget];

  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td>${i}</td>
    <td><strong>${indicatorName}</strong></td>
    <td>${tf}</td>
    <td>${rule}</td>
    <td>${paramVal}</td>
    <td style="text-align:center;">
      <button class="btn-icon-del" onclick="deleteRule(this,'${state.ruleTarget}')" title="Delete">🗑</button>
    </td>`;
  tbody.appendChild(tr);
  closeModal();
}

/* =============================================================
   CANDLESTICK PATTERN LOGIC
   ============================================================= */

const CANDLE_PATTERNS = [
  { id: 'hammer', name: 'Hammer', category: 'single', type: 'bullish', desc: 'A bullish reversal pattern that forms during a downtrend. It has a small body at the top and a long lower wick.', svg: `<svg width="100" height="150" viewBox="0 0 100 150"><line x1="50" y1="40" x2="50" y2="120" class="wick" stroke="#28a745" /><rect x="35" y="40" width="30" height="20" class="candle-body" fill="#28a745" stroke="#28a745" /></svg>` },
  { id: 'inverted-hammer', name: 'Inverted Hammer', category: 'single', type: 'bullish', desc: 'A bullish reversal pattern with a small body at the bottom and a long upper wick, occurring at the bottom of a downtrend.', svg: `<svg width="100" height="150" viewBox="0 0 100 150"><line x1="50" y1="30" x2="50" y2="110" class="wick" stroke="#28a745" /><rect x="35" y="90" width="30" height="20" class="candle-body" fill="#28a745" stroke="#28a745" /></svg>` },
  { id: 'dragonfly-doji', name: 'Dragonfly Doji', category: 'single', type: 'bullish', desc: 'A bullish reversal pattern where the open, high, and close are at the same level, with a long lower wick.', svg: `<svg width="100" height="150" viewBox="0 0 100 150"><line x1="50" y1="30" x2="50" y2="120" class="wick" stroke="#28a745" /><rect x="30" y="30" width="40" height="4" class="candle-body" fill="#28a745" stroke="#28a745" /></svg>` },
  { id: 'bullish-spinning-top', name: 'Bullish Spinning Top', category: 'single', type: 'bullish', desc: 'A small green body with long upper and lower wicks, indicating indecision but with a bullish bias.', svg: `<svg width="100" height="150" viewBox="0 0 100 150"><line x1="50" y1="30" x2="50" y2="120" class="wick" stroke="#28a745" /><rect x="35" y="65" width="30" height="20" class="candle-body" fill="#28a745" stroke="#28a745" /></svg>` },
  { id: 'hanging-man', name: 'Hanging Man', category: 'single', type: 'bearish', desc: 'A bearish reversal pattern that looks like a hammer but forms at the top of an uptrend.', svg: `<svg width="100" height="150" viewBox="0 0 100 150"><line x1="50" y1="40" x2="50" y2="120" class="wick" stroke="#dc3545" /><rect x="35" y="40" width="30" height="20" class="candle-body" fill="#dc3545" stroke="#dc3545" /></svg>` },
  { id: 'shooting-star', name: 'Shooting Star', category: 'single', type: 'bearish', desc: 'A bearish reversal pattern with a small body at the bottom and a long upper wick, occurring at the top of an uptrend.', svg: `<svg width="100" height="150" viewBox="0 0 100 150"><line x1="50" y1="30" x2="50" y2="110" class="wick" stroke="#dc3545" /><rect x="35" y="90" width="30" height="20" class="candle-body" fill="#dc3545" stroke="#dc3545" /></svg>` },
  { id: 'gravestone-doji', name: 'Gravestone Doji', category: 'single', type: 'bearish', desc: 'A bearish reversal pattern where the open, low, and close are at the same level, with a long upper wick.', svg: `<svg width="100" height="150" viewBox="0 0 100 150"><line x1="50" y1="30" x2="50" y2="120" class="wick" stroke="#dc3545" /><rect x="30" y="116" width="40" height="4" class="candle-body" fill="#dc3545" stroke="#dc3545" /></svg>` },
  { id: 'bearish-spinning-top', name: 'Bearish Spinning Top', category: 'single', type: 'bearish', desc: 'A small red body with long upper and lower wicks, indicating indecision with a bearish bias.', svg: `<svg width="100" height="150" viewBox="0 0 100 150"><line x1="50" y1="30" x2="50" y2="120" class="wick" stroke="#dc3545" /><rect x="35" y="65" width="30" height="20" class="candle-body" fill="#dc3545" stroke="#dc3545" /></svg>` },
  { id: 'bullish-kicker', name: 'Bullish Kicker', category: 'double', type: 'bullish', desc: 'A sharp reversal pattern where a bearish candle is followed by a bullish candle that gaps up and continues higher.', svg: `<svg width="140" height="150" viewBox="0 0 140 150"><rect x="30" y="80" width="20" height="40" fill="#dc3545" opacity="0.5" /><rect x="80" y="30" width="20" height="40" fill="#28a745" /></svg>` },
  { id: 'bullish-engulfing', name: 'Bullish Engulfing', category: 'double', type: 'bullish', desc: 'A large green candle completely overlaps the previous small red candle, signaling a bullish reversal.', svg: `<svg width="140" height="150" viewBox="0 0 140 150"><rect x="30" y="70" width="20" height="20" fill="#dc3545" opacity="0.5" /><rect x="75" y="40" width="30" height="80" fill="#28a745" /></svg>` },
  { id: 'bullish-harami', name: 'Bullish Harami', category: 'double', type: 'bullish', desc: 'A small green candle forms within the body of the previous large red candle, indicating a potential reversal.', svg: `<svg width="140" height="150" viewBox="0 0 140 150"><rect x="30" y="40" width="30" height="80" fill="#dc3545" opacity="0.5" /><rect x="85" y="70" width="20" height="20" fill="#28a745" /></svg>` },
  { id: 'piercing-line', name: 'Piercing Line', category: 'double', type: 'bullish', desc: 'A green candle opens lower than the previous red candle but closes above its midpoint.', svg: `<svg width="140" height="150" viewBox="0 0 140 150"><rect x="30" y="40" width="20" height="60" fill="#dc3545" opacity="0.5" /><rect x="80" y="75" width="20" height="50" fill="#28a745" /></svg>` },
  { id: 'tweezer-bottom', name: 'Tweezer Bottom', category: 'double', type: 'bullish', desc: 'Two candles with identical lows, indicating strong support and a potential bullish reversal.', svg: `<svg width="140" height="150" viewBox="0 0 140 150"><rect x="30" y="60" width="20" height="60" fill="#dc3545" /><rect x="80" y="60" width="20" height="60" fill="#28a745" /><line x1="30" y1="120" x2="110" y2="120" stroke="#333" stroke-width="1" stroke-dasharray="2,2" /></svg>` },
  { id: 'bearish-kicker', name: 'Bearish Kicker', category: 'double', type: 'bearish', desc: 'The bearish equivalent of the kicker, where a bullish candle is followed by a bearish candle that gaps down.', svg: `<svg width="140" height="150" viewBox="0 0 140 150"><rect x="30" y="30" width="20" height="40" fill="#28a745" opacity="0.5" /><rect x="80" y="80" width="20" height="40" fill="#dc3545" /></svg>` },
  { id: 'bearish-engulfing', name: 'Bearish Engulfing', category: 'double', type: 'bearish', desc: 'A large red candle completely overlaps the previous small green candle, signaling a bearish reversal.', svg: `<svg width="140" height="150" viewBox="0 0 140 150"><rect x="30" y="70" width="20" height="20" fill="#28a745" opacity="0.5" /><rect x="75" y="40" width="30" height="80" fill="#dc3545" /></svg>` },
  { id: 'bearish-harami', name: 'Bearish Harami', category: 'double', type: 'bearish', desc: 'A small red candle forms within the body of the previous large green candle.', svg: `<svg width="140" height="150" viewBox="0 0 140 150"><rect x="30" y="40" width="30" height="80" fill="#28a745" opacity="0.5" /><rect x="85" y="70" width="20" height="20" fill="#dc3545" /></svg>` },
  { id: 'dark-cloud-cover', name: 'Dark Cloud Cover', category: 'double', type: 'bearish', desc: 'A red candle opens higher than the previous green candle but closes below its midpoint.', svg: `<svg width="140" height="150" viewBox="0 0 140 150"><rect x="30" y="60" width="20" height="60" fill="#28a745" opacity="0.5" /><rect x="80" y="35" width="20" height="55" fill="#dc3545" /></svg>` },
  { id: 'tweezer-top', name: 'Tweezer Top', category: 'double', type: 'bearish', desc: 'Two candles with identical highs, indicating strong resistance and a potential bearish reversal.', svg: `<svg width="140" height="150" viewBox="0 0 140 150"><rect x="30" y="60" width="20" height="60" fill="#28a745" /><rect x="80" y="60" width="20" height="60" fill="#dc3545" /><line x1="30" y1="60" x2="110" y2="60" stroke="#333" stroke-width="1" stroke-dasharray="2,2" /></svg>` },
  { id: 'morning-star', name: 'Morning Star', category: 'triple', type: 'bullish', desc: 'A three-candle bullish reversal pattern: long red, short middle, and long green candle.', svg: `<svg width="180" height="150" viewBox="0 0 180 150"><rect x="30" y="40" width="20" height="60" fill="#dc3545" opacity="0.4" /><rect x="75" y="105" width="20" height="10" fill="#333" /><rect x="120" y="50" width="20" height="50" fill="#28a745" /></svg>` },
  { id: 'morning-doji-star', name: 'Morning Doji Star', category: 'triple', type: 'bullish', desc: 'Similar to the Morning Star, but the middle candle is a Doji, indicating even greater indecision before the reversal.', svg: `<svg width="180" height="150" viewBox="0 0 180 150"><rect x="30" y="40" width="20" height="60" fill="#dc3545" opacity="0.4" /><line x1="75" y1="110" x2="95" y2="110" stroke="#333" stroke-width="3" /><line x1="85" y1="100" x2="85" y2="120" stroke="#333" stroke-width="1.5" /><rect x="120" y="50" width="20" height="50" fill="#28a745" /></svg>` },
  { id: 'bullish-abandoned-baby', name: 'Bullish Abandoned Baby', category: 'triple', type: 'bullish', desc: 'A rare reversal pattern where a Doji gaps down from the first candle and the third candle gaps up from the Doji.', svg: `<svg width="180" height="150" viewBox="0 0 180 150"><rect x="30" y="30" width="20" height="50" fill="#dc3545" opacity="0.4" /><line x1="75" y1="110" x2="95" y2="110" stroke="#333" stroke-width="3" /><rect x="120" y="40" width="20" height="50" fill="#28a745" /></svg>` },
  { id: 'three-white-soldiers', name: 'Three White Soldiers', category: 'triple', type: 'bullish', desc: 'Three consecutive long green candles with higher closes, signaling a strong reversal of a downtrend.', svg: `<svg width="180" height="150" viewBox="0 0 180 150"><rect x="30" y="90" width="20" height="40" fill="#28a745" /><rect x="75" y="65" width="20" height="40" fill="#28a745" /><rect x="120" y="40" width="20" height="40" fill="#28a745" /></svg>` },
  { id: 'three-line-strike-bullish', name: 'Three Line Strike (Bullish)', category: 'triple', type: 'bullish', desc: 'Three small red candles followed by one large green candle that strikes lower and closes above the first candle.', svg: `<svg width="200" height="150" viewBox="0 0 200 150"><rect x="20" y="40" width="15" height="20" fill="#dc3545" opacity="0.4" /><rect x="45" y="50" width="15" height="20" fill="#dc3545" opacity="0.4" /><rect x="70" y="60" width="15" height="20" fill="#dc3545" opacity="0.4" /><rect x="95" y="30" width="20" height="80" fill="#28a745" /></svg>` },
  { id: 'three-inside-up', name: 'Three Inside Up', category: 'triple', type: 'bullish', desc: 'A Bullish Harami followed by a green candle that closes above the high of the first red candle.', svg: `<svg width="180" height="150" viewBox="0 0 180 150"><rect x="30" y="40" width="20" height="70" fill="#dc3545" opacity="0.4" /><rect x="75" y="65" width="20" height="25" fill="#28a745" /><rect x="120" y="30" width="20" height="60" fill="#28a745" /></svg>` },
  { id: 'three-outside-up', name: 'Three Outside Up', category: 'triple', type: 'bullish', desc: 'A Bullish Engulfing pattern followed by a green candle that confirms the reversal.', svg: `<svg width="180" height="150" viewBox="0 0 180 150"><rect x="30" y="70" width="20" height="20" fill="#dc3545" opacity="0.4" /><rect x="75" y="40" width="25" height="70" fill="#28a745" /><rect x="125" y="30" width="20" height="60" fill="#28a745" /></svg>` },
  { id: 'evening-star', name: 'Evening Star', category: 'triple', type: 'bearish', desc: 'A three-candle bearish reversal pattern: long green, short middle, and long red candle.', svg: `<svg width="180" height="150" viewBox="0 0 180 150"><rect x="30" y="50" width="20" height="50" fill="#28a745" opacity="0.4" /><rect x="75" y="35" width="20" height="10" fill="#333" /><rect x="120" y="40" width="20" height="60" fill="#dc3545" /></svg>` },
  { id: 'evening-doji-star', name: 'Evening Doji Star', category: 'triple', type: 'bearish', desc: 'Similar to the Evening Star, but the middle candle is a Doji.', svg: `<svg width="180" height="150" viewBox="0 0 180 150"><rect x="30" y="50" width="20" height="50" fill="#28a745" opacity="0.4" /><line x1="75" y1="40" x2="95" y2="40" stroke="#333" stroke-width="3" /><line x1="85" y1="30" x2="85" y2="50" stroke="#333" stroke-width="1.5" /><rect x="120" y="40" width="20" height="60" fill="#dc3545" /></svg>` },
  { id: 'bearish-abandoned-baby', name: 'Bearish Abandoned Baby', category: 'triple', type: 'bearish', desc: 'The bearish equivalent of the abandoned baby, where a Doji gaps up from the first green candle.', svg: `<svg width="180" height="150" viewBox="0 0 180 150"><rect x="30" y="60" width="20" height="50" fill="#28a745" opacity="0.4" /><line x1="75" y1="30" x2="95" y2="30" stroke="#333" stroke-width="3" /><rect x="120" y="70" width="20" height="50" fill="#dc3545" /></svg>` },
  { id: 'three-black-crows', name: 'Three Black Crows', category: 'triple', type: 'bearish', desc: 'Three consecutive long red candles with lower closes, signaling a strong bearish reversal.', svg: `<svg width="180" height="150" viewBox="0 0 180 150"><rect x="30" y="30" width="20" height="40" fill="#dc3545" /><rect x="75" y="55" width="20" height="40" fill="#dc3545" /><rect x="120" y="80" width="20" height="40" fill="#dc3545" /></svg>` },
  { id: 'three-line-strike-bearish', name: 'Three Line Strike (Bearish)', category: 'triple', type: 'bearish', desc: 'Three small green candles followed by one large red candle that strikes higher and closes below the first candle.', svg: `<svg width="200" height="150" viewBox="0 0 200 150"><rect x="20" y="80" width="15" height="20" fill="#28a745" opacity="0.4" /><rect x="45" y="70" width="15" height="20" fill="#28a745" opacity="0.4" /><rect x="70" y="60" width="15" height="20" fill="#28a745" opacity="0.4" /><rect x="95" y="40" width="20" height="80" fill="#dc3545" /></svg>` },
  { id: 'three-inside-down', name: 'Three Inside Down', category: 'triple', type: 'bearish', desc: 'A Bearish Harami followed by a red candle that closes below the low of the first green candle.', svg: `<svg width="180" height="150" viewBox="0 0 180 150"><rect x="30" y="30" width="20" height="70" fill="#28a745" opacity="0.4" /><rect x="75" y="50" width="20" height="25" fill="#dc3545" /><rect x="120" y="60" width="20" height="60" fill="#dc3545" /></svg>` },
  { id: 'three-outside-down', name: 'Three Outside Down', category: 'triple', type: 'bearish', desc: 'A Bearish Engulfing pattern followed by a red candle that confirms the reversal.', svg: `<svg width="180" height="150" viewBox="0 0 180 150"><rect x="30" y="50" width="20" height="20" fill="#28a745" opacity="0.4" /><rect x="75" y="30" width="25" height="70" fill="#dc3545" /><rect x="125" y="60" width="20" height="60" fill="#dc3545" /></svg>` }
];

let selectedCandleId = null;

function openCandleModal(targetId) {
  state.ruleTarget = targetId;
  document.getElementById('candle-modal').classList.add('active');
  if (!selectedCandleId && CANDLE_PATTERNS.length > 0) {
    selectCandlePattern(CANDLE_PATTERNS[0].id);
  }
}

function closeCandleModal() {
  document.getElementById('candle-modal').classList.remove('active');
}

function selectCandlePattern(id) {
  const pattern = CANDLE_PATTERNS.find(p => p.id === id);
  if (!pattern) return;
  selectedCandleId = id;

  // Update UI
  document.querySelectorAll('.pattern-item').forEach(el => el.classList.remove('active'));
  const activeItem = document.querySelector(`.pattern-item[data-id="${id}"]`);
  if (activeItem) activeItem.classList.add('active');

  document.getElementById('candle-detail-name').innerText = pattern.name;
  document.getElementById('candle-detail-category').innerText = pattern.category;
  document.getElementById('candle-detail-type').innerText = pattern.type;
  document.getElementById('candle-detail-type').className = `pattern-type type-${pattern.type}`;
  document.getElementById('candle-detail-desc').innerText = pattern.desc;
  document.getElementById('candle-visual-preview').innerHTML = pattern.svg;
}

function filterCandleCategory(cat) {
  document.querySelectorAll('.candle-tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.innerText.toLowerCase() === cat);
  });

  const items = document.querySelectorAll('.pattern-item');
  let firstVisible = null;
  items.forEach(item => {
    const itemCat = item.dataset.category;
    if (cat === 'all' || itemCat === cat) {
      item.classList.remove('hidden');
      if (!firstVisible) firstVisible = item.dataset.id;
    } else {
      item.classList.add('hidden');
    }
  });

  if (firstVisible) selectCandlePattern(firstVisible);
}

function confirmAddCandleRule() {
  const pattern = CANDLE_PATTERNS.find(p => p.id === selectedCandleId);
  if (!pattern) return;

  const conf = document.getElementById('candle-conf').value;
  const size = document.getElementById('candle-size').value;

  const tbody = document.getElementById(state.ruleTarget);
  const placeholder = tbody.querySelector('tr[data-empty]');
  if (placeholder) placeholder.remove();

  if (!state.counters[state.ruleTarget]) state.counters[state.ruleTarget] = 0;
  state.counters[state.ruleTarget]++;
  const i = state.counters[state.ruleTarget];

  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td>${i}</td>
    <td><strong>${pattern.name}</strong></td>
    <td>Current</td>
    <td>${pattern.type.toUpperCase()} Signal</td>
    <td>Confirmation=${conf}, MinBody=${size}pips</td>
    <td style="text-align:center;">
      <button class="btn-icon-del" onclick="deleteRule(this,'${state.ruleTarget}')" title="Delete">🗑</button>
    </td>`;
  tbody.appendChild(tr);
  closeCandleModal();
}


/* =============================================================
   MONEY MANAGEMENT STEP 1 LOGIC
   ============================================================= */

function toggleDynamicLot(e) {
  var isDynamic = (e.target.value === '1');
  var dWrap = document.getElementById('wrap-dynamic-lot');
  var fWrap = document.getElementById('wrap-fixed-lot');
  var fAlert = document.getElementById('alert-fixed-lot');
  if (dWrap) dWrap.classList.toggle('hidden', !isDynamic);
  if (fWrap) fWrap.classList.toggle('hidden', isDynamic);
  if (isDynamic && fAlert) fAlert.classList.add('hidden');
}

function validateMaxLoss() {
  var riskSel = document.getElementById('s-riskpertrade');
  var maxLSel = document.getElementById('s-maxloss');
  var alertEl = document.getElementById('alert-max-loss');
  if (!riskSel || !maxLSel || !alertEl) return;

  var risk = parseFloat(riskSel.value) || 0;
  var maxL = parseFloat(maxLSel.value);

  if (!isNaN(maxL) && maxL <= risk) {
    alertEl.classList.remove('hidden');
  } else {
    alertEl.classList.add('hidden');
  }
}

function validateFixedLot() {
  var lotInp = document.getElementById('s-lot');
  var alertEl = document.getElementById('alert-fixed-lot');
  if (!lotInp || !alertEl) return;

  var val = lotInp.value;
  if (val === '' || isNaN(parseFloat(val)) || parseFloat(val) <= 0) {
    alertEl.classList.remove('hidden');
  } else {
    alertEl.classList.add('hidden');
  }
}

function toggleTradeCloseTime(prefix, e) {
  var show = (e.target.value === 'yes');
  var wrap = document.getElementById(prefix + '-wrap-closetime');
  if (wrap) wrap.classList.toggle('hidden', !show);
}

/* =============================================================
   BUILD BOT
   ============================================================= */

function captureStepForm(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return {};
  const data = {};

  // Inputs (Text, Number, Selects)
  const inputs = container.querySelectorAll('input:not([type="radio"]):not([type="checkbox"]), select');
  inputs.forEach(inp => {
    if (inp.closest('.hide') || inp.closest('.hidden')) return;
    let key = inp.id || inp.name || 'field_' + Math.floor(Math.random() * 1000);
    data[key] = inp.value;
  });

  // Radios
  const radios = container.querySelectorAll('input[type="radio"]:checked');
  radios.forEach(r => {
    if (r.closest('.hide') || r.closest('.hidden')) return;
    data[r.name] = r.value;
  });

  // Checkboxes
  const checks = container.querySelectorAll('input[type="checkbox"]');
  checks.forEach(c => {
    if (c.closest('.hide') || c.closest('.hidden')) return;
    let key = c.name || 'checkbox_' + Math.floor(Math.random() * 1000);
    data[key] = c.checked;
  });

  return data;
}

function captureStep3Table(tbodyId) {
  const tbody = document.getElementById(tbodyId);
  if (!tbody) return [];
  const rules = [];
  tbody.querySelectorAll('tr:not([data-empty])').forEach(tr => {
    const tds = tr.querySelectorAll('td');
    if (tds.length >= 5) {
      rules.push({
        indicator: tds[1].innerText.trim(),
        timeFrame: tds[2].innerText.trim(),
        rule: tds[3].innerText.trim(),
        parameters: tds[4].innerText.trim()
      });
    }
  });
  return rules;
}


function deleteRule(btn, tableTarget) {
  const tr = btn.closest('tr');
  if (tr) tr.remove();

  const tbody = document.getElementById(tableTarget);
  if (tbody && tbody.querySelectorAll('tr:not([data-empty])').length === 0) {
    if (!tbody.querySelector('tr[data-empty]')) {
      const emptyRow = document.createElement('tr');
      emptyRow.setAttribute('data-empty', '1');
      emptyRow.innerHTML = '<td colspan="6" style="text-align:center;color:#bbb;font-size:12px;padding:18px;">No rules added yet</td>';
      tbody.appendChild(emptyRow);
    }
  }
}

function buildBot() {
  const botName = document.getElementById('bot-name').value || 'My Strategy';

  const botConfig = {
    metadata: {
      name: botName,
      createdAt: new Date().toISOString()
    },
    strategyConfig: {
      baseStrategy: state.strategy,
      gridType: state.gridType,
      hedgingType: state.hedgingType,
      martingaleType: state.martingaleType,
      rangeBreakoutType: state.rangeBreakoutType
    },
    step1_MoneyManagement: captureStepForm('step1-card'),
    step2_TradeManagement: captureStepForm('step2-card'),
    step3_PrimaryRules: {
      entrySignals: captureStep3Table('tbody-entry'),
      trendFilters: captureStep3Table('tbody-trend'),
      exitSignals: captureStep3Table('tbody-exit'),
      authorizedTypes: document.querySelector('input[name="ordertype"]:checked') ? document.querySelector('input[name="ordertype"]:checked').value : 'all',
      closeOnTrendChange: document.querySelector('input[name="trendclose"]:checked') ? document.querySelector('input[name="trendclose"]:checked').value : 'no'
    },
    step4_HedgeRules: {
      entrySignals: captureStep3Table('tbody-hedge-entry'),
      trendFilters: captureStep3Table('tbody-hedge-trend'),
      exitSignals: captureStep3Table('tbody-hedge-exit'),
      authorizedTypes: document.querySelector('input[name="hedgeordertype"]:checked') ? document.querySelector('input[name="hedgeordertype"]:checked').value : 'all',
      closeOnTrendChange: document.querySelector('input[name="hedgetrendclose"]:checked') ? document.querySelector('input[name="hedgetrendclose"]:checked').value : 'no'
    },
    step5_OtherSettings: captureStepForm('step-other-settings-card')
  };

  const jsonStr = JSON.stringify(botConfig, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const safeName = botName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  const a = document.createElement('a');
  a.href = url;
  a.download = (safeName || 'dexter-strategy') + '-config.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  const toast = document.getElementById('toast');
  if (toast) {
    toast.style.display = 'block';
    setTimeout(() => { toast.style.display = 'none'; }, 3200);
  }
}

/* =============================================================
   INIT
   ============================================================= */

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('rule-modal').addEventListener('click', e => {
    if (e.target === document.getElementById('rule-modal')) closeModal();
  });
  document.getElementById('candle-modal').addEventListener('click', e => {
    if (e.target === document.getElementById('candle-modal')) closeCandleModal();
  });

  // Initialize Candlestick List
  const listContainer = document.getElementById('candle-pattern-list');
  if (listContainer) {
    CANDLE_PATTERNS.forEach(p => {
      const item = document.createElement('div');
      item.className = 'pattern-item';
      item.dataset.id = p.id;
      item.dataset.category = p.category;
      item.onclick = () => selectCandlePattern(p.id);

      const miniIcon = p.svg.replace(/width="\d+"/, 'width="24"').replace(/height="\d+"/, 'height="24"').replace(/viewBox="[^"]+"/, 'viewBox="0 0 100 150"');
      item.innerHTML = `
        <div class="pattern-icon">${miniIcon}</div>
        <div class="pattern-info">
          <div class="pattern-name">${p.name}</div>
          <div class="pattern-type type-${p.type}">${p.type}</div>
        </div>
      `;
      listContainer.appendChild(item);
    });
  }

  selectStrategy('simple');
});
