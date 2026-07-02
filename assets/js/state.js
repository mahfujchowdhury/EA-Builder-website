/* =====================================================
   state.js — Global State & Shared HTML Helpers
   =====================================================
   PURPOSE:
     - Holds the single shared `state` object used by all modules.
     - Provides low-level HTML-builder utility functions (h, radio,
       select, numInput, etc.) that every template depends on.

   DEPENDENCIES: None — this file must be loaded FIRST.
   ===================================================== */

'use strict';

/* ─── GLOBAL STATE ─────────────────────────────────────
   Tracks the currently selected strategy and sub-types.
   Modified only by functions in ui-controls.js.
   ───────────────────────────────────────────────────── */
const state = {
  strategy: 'simple',          // active top-level strategy pill
  gridType: 'classic',         // sub-type when strategy === 'grid'
  hedgingType: 'recovery',     // sub-type when strategy === 'hedging'
  martingaleType: 'classic',   // sub-type when strategy === 'martingale'
  rangeBreakoutType: 'classic',// sub-type when strategy === 'rangebreakout'
  ruleTarget: '',              // tbody id targeted by the rule modal
  ruleType: '',                // 'entry' | 'trend' | 'exit'
  counters: {}                 // per-tbody row counters for rule numbering
};

/* ─── SHARED HTML BUILDERS ──────────────────────────────
   These produce small HTML strings that are embedded
   inside the larger template strings in templates.js.
   ─────────────────────────────────────────────────────

   NOTE: `h()` is the most-used helper. It wraps a label +
   content pair in a `.real-row` so every form field is
   consistently laid out without repeating the wrapper div.
   ───────────────────────────────────────────────────── */

/**
 * h(label, content, helpText?)
 * Returns a labeled form row.
 * @param {string} label    - Left-column label text
 * @param {string} content  - Right-column HTML content
 * @param {string} helpText - Optional tooltip text (shows a "?" badge)
 */
function h(label, content, helpText) {
  const tip = helpText ? `<span class="help-icon" title="${helpText}">?</span>` : '';
  return `
    <div class="real-row">
      <div class="real-label">${label} ${tip}</div>
      <div class="real-val">${content}</div>
    </div>`;
}

/**
 * radio(name, val, label, checked, onchange?)
 * Returns a single radio button wrapped in a <label>.
 */
function radio(name, val, label, checked, onchange) {
  const oc = onchange ? ` onchange="${onchange}"` : '';
  return `<label class="radio-opt"><input type="radio" name="${name}" value="${val}"${checked ? ' checked' : ''}${oc}/> ${label}</label>`;
}

/**
 * select(name, options, selected, onchange?)
 * Returns a <select> with the matching option pre-selected.
 */
function select(name, options, selected, onchange) {
  const opts = options.map(o => `<option${o === selected ? ' selected' : ''}>${o}</option>`).join('');
  const oc = onchange ? ` onchange="${onchange}"` : '';
  return `<select class="form-control" name="${name}"${oc}>${opts}</select>`;
}

/**
 * select2(name, options)
 * Returns a <select> where the first option is pre-selected.
 * Use when there is no meaningful default to match by value.
 */
function select2(name, options) {
  const opts = options.map((o, i) => `<option${i === 0 ? ' selected' : ''}>${o}</option>`).join('');
  return `<select class="form-control" name="${name}">${opts}</select>`;
}

/**
 * numInput(name, val, step?)
 * Returns a numeric <input> with an optional step attribute.
 */
function numInput(name, val, step) {
  return `<input type="number" class="form-control sm" name="${name}" value="${val}"${step ? ` step="${step}"` : ''}/>`;
}

/**
 * helpLink(topic)
 * Returns a "? Help" anchor that opens the Step-2 help modal.
 * The `topic` string must match a key in helpContent (ui-controls.js).
 */
function helpLink(topic) {
  return `<a href="#" class="help-link" onclick="showHelp('${topic}');return false;"><span class="glyphicon-q">?</span> Help</a>`;
}

/**
 * timeBlock(prefix)
 * Returns the "Allowed Time for First Trade" hours + days row.
 * Used in grid Step-2 and hedging Step-2 via getDynamicTradeManagement().
 */
function timeBlock(prefix) {
  return `
    <div class="real-row" style="align-items:flex-start;">
      <div class="real-label" style="padding-top:8px;">Allowed Time for First Trade</div>
      <div class="real-val">
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">
          <span style="font-size:12px;color:#555;min-width:40px;">Hours :</span>
          <input type="text" class="form-control sm" placeholder=""/>
          <span class="to-sep">TO</span>
          <input type="text" class="form-control sm" placeholder=""/>
          <span class="not-req-hint">This line is not required.</span>
        </div>
        <div style="display:flex;align-items:center;gap:6px;">
          <span style="font-size:12px;color:#555;min-width:40px;">Days :</span>
          ${select2(prefix + '-days-from', ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'])}
          <span class="to-sep">TO</span>
          ${select2(prefix + '-days-to', ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'])}
          <span class="not-req-hint">This line is not required.</span>
        </div>
      </div>
    </div>`;
}
/**
 * getRiskOptions()
 * Returns shared <option> list for risk percentages.
 */
function getRiskOptions() {
  return ['0.125 %', '0.25 %', '0.5 %', '0.75 %', '1 %', '1.25 %', '1.5 %', '1.75 %', '2 %', '2.25 %', '2.5 %', '2.75 %', '3 %']
    .map(o => `<option value="${parseFloat(o)}"${o === '0.5 %' ? ' selected' : ''}>${o}</option>`)
    .join('');
}
