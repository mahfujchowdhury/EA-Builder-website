/* =====================================================
   templates.js - Strategy Step Templates
   =====================================================
   PURPOSE:
     Contains all tpl*() functions that generate the HTML
     for Step 1 and Step 2 panels of each strategy type.
     Also contains shared step builders (tradeManagementStep2,
     gridStep2, hedgingStep2, getDynamicTradeManagement).

   DEPENDENCIES: state.js, diagrams.js (must load before this)

   NOTE: Each tpl function returns an object:
     { step1Title, step1HTML, step2Title, step2HTML }
   The render engine in ui-controls.js calls getTemplate()
   which dispatches to the correct tpl function based on state.
   ===================================================== */
function tradeManagementStep2(p, showDynamicTP = false) {
  let dtpHTML = '';
  if (showDynamicTP) {
    dtpHTML = `
      <div class="real-row tm2-row" style="border-top:1px dashed #eee; padding-top:12px; margin-top:12px;">
        <div class="real-label">Dynamic Take Profit</div>
        <div class="real-val tm2-val">
          <div class="tm2-controls">
            <select id="${p}_dtp_type" class="form-control tm2-select" onchange="syncDTP('${p}')">
              <option value="">&mdash; Disabled &mdash;</option>
              <option value="atr">Calculated from ATR Indicator</option>
              <option value="fixed">Fixed distance</option>
              <option value="sr">Support & Resistence base</option>
              <option value="time">Time base</option>
              <option value="partial">Partial percentage</option>
            </select>
            <select id="${p}_dtp_count" class="form-control tm2-sub" style="width:100px;" onchange="syncDTP('${p}')">
              <option value="1">1 Target</option>
              <option value="2">2 Targets</option>
              <option value="3">3 Targets</option>
              <option value="4">4 Targets</option>
              <option value="5">5 Targets</option>
            </select>
          </div>
          ${helpLink('Dynamic Take Profit')}
        </div>
      </div>
      
      <div id="${p}_dtp_params_container" class="hide" style="margin:10px 0 10px 20px; padding:12px; background:#fcfcfc; border-left:2px solid #ccc; border-radius:0 4px 4px 0;">
        ${['atr', 'fixed', 'sr', 'time', 'partial'].map(type => `
          <div class="${p}-dtp-group ${p}-dtp-group-${type} hide">
            ${[1, 2, 3, 4, 5].map(i => `
              <div class="${p}-dtp-row-${i} hide" style="margin-bottom:12px; border-bottom:1px solid #eee; padding-bottom:12px;">
                <div style="font-size:10px; color:#999; margin-bottom:6px; font-weight:700; letter-spacing:0.5px;">TARGET ${i}</div>
                ${type === 'atr' ? h('ATR Multiplier', numInput(`${p}_dtp_${i}_atr_mult`, '1.5', '0.1')) : ''}
                ${type === 'fixed' ? h('Distance (pips)', numInput(`${p}_dtp_${i}_pips`, '50')) : ''}
                ${type === 'sr' ? h('Lookback Bars', numInput(`${p}_dtp_${i}_sr_bars`, '20')) : ''}
                ${type === 'time' ? h('Minutes', numInput(`${p}_dtp_${i}_time_min`, '60')) : ''}
                ${type === 'partial' ? `
                  <div style="display:flex; gap:15px;">
                    <div style="flex:1;">
                       <div style="font-size:11px; color:#666; margin-bottom:4px;">Target Pips</div>
                       ${numInput(`${p}_dtp_${i}_partial_pips`, '20')}
                    </div>
                    <div style="flex:1;">
                       <div style="font-size:11px; color:#666; margin-bottom:4px;">% of Lot to Close</div>
                       ${numInput(`${p}_dtp_${i}_partial_pct`, '50')}
                    </div>
                  </div>
                ` : ''}
              </div>
            `).join('')}
          </div>
        `).join('')}
      </div>`;
  }

  return `
    <div class="real-form">
      <!-- Stop Loss -->
      <div class="real-row tm2-row">
        <div class="real-label">Stop Loss</div>
        <div class="real-val tm2-val">
          <div class="tm2-controls">
            <select id="${p}_stopLossType" class="form-control tm2-select" onchange="syncTM2Type(this,'${p}-sl')">
              <option value="4" data-id="${p}-sl-type-1">Calculated From ATR Indicator</option>
              <option value="5" data-id="${p}-sl-type-2">Fixed Distance (in pips)</option>
              <option value="6" data-id="${p}-sl-type-3">Fractal High/Low</option>
              <option value="16" data-id="${p}-sl-type-4">Fibonacci base</option>
              <option value="17" data-id="${p}-sl-type-5">Support & Resistance base</option>
              <option value="18" data-id="${p}-sl-type-6">Time base</option>
            </select>
            <select id="${p}_sl_atr" class="form-control tm2-sub ${p}-sl-sub ${p}-sl-type-1">
              <option value="">Coef x ATR</option>
              <option value="1.5">1.5 x ATR</option>
              <option value="2">2 x ATR</option>
              <option value="2.5">2.5 x ATR</option>
              <option value="3">3 x ATR</option>
              <option value="3.5">3.5 x ATR</option>
              <option value="4">4 x ATR</option>
              <option value="4.5">4.5 x ATR</option>
              <option value="5">5 x ATR</option>
              <option value="6">6 x ATR</option>
            </select>
            <input type="number" id="${p}_sl_pips" class="form-control tm2-sub ${p}-sl-sub ${p}-sl-type-2 hide" placeholder="No. pips" min="1">
            <select id="${p}_sl_fib" class="form-control tm2-sub ${p}-sl-sub ${p}-sl-type-4 hide">
              <option value="0.236">0.236</option>
              <option value="0.382">0.382</option>
              <option value="0.5" selected>0.500</option>
              <option value="0.618">0.618</option>
              <option value="0.786">0.786</option>
            </select>
            <input type="number" id="${p}_sl_sr_bars" class="form-control tm2-sub ${p}-sl-sub ${p}-sl-type-5 hide" placeholder="Lookback bars" min="1" value="20">
            <input type="number" id="${p}_sl_time_min" class="form-control tm2-sub ${p}-sl-sub ${p}-sl-type-6 hide" placeholder="Minutes" min="1" value="60">
          </div>
          ${helpLink('Stop Loss')}
        </div>
      </div>
      <!-- Take Profit -->
      <div class="real-row tm2-row">
        <div class="real-label">Take Profit</div>
        <div class="real-val tm2-val">
          <div class="tm2-controls">
            <select id="${p}_takeProfitType" class="form-control tm2-select" onchange="syncTM2Type(this,'${p}-tp')">
              <option value="8" data-id="${p}-tp-type-1">Risk/Reward Ratio (SL x Coef.)</option>
              <option value="9" data-id="${p}-tp-type-2">Calculated From ATR Indicator</option>
              <option value="10" data-id="${p}-tp-type-3">Fixed Distance (in pips)</option>
              <option value="16" data-id="${p}-tp-type-4">Fibonacci base</option>
              <option value="17" data-id="${p}-tp-type-5">Support & Resistance base</option>
              <option value="18" data-id="${p}-tp-type-6">Time base</option>
            </select>
            <select id="${p}_tp_rr" class="form-control tm2-sub ${p}-tp-sub ${p}-tp-type-1">
              <option value="">Coef x SL</option>
              <option value="1.5">1.5 x SL</option>
              <option value="2">2 x SL</option>
              <option value="2.5">2.5 x SL</option>
              <option value="3">3 x SL</option>
              <option value="3.5">3.5 x SL</option>
              <option value="4">4 x SL</option>
              <option value="4.5">4.5 x SL</option>
              <option value="5">5 x SL</option>
              <option value="6">6 x SL</option>
            </select>
            <select id="${p}_tp_atr" class="form-control tm2-sub ${p}-tp-sub ${p}-tp-type-2 hide">
              <option value="">Coef x ATR</option>
              <option value="2">2x</option>
              <option value="3">3x</option>
              <option value="4">4x</option>
              <option value="5">5x</option>
              <option value="6">6x</option>
            </select>
            <input type="number" id="${p}_tp_pips" class="form-control tm2-sub ${p}-tp-sub ${p}-tp-type-3 hide" placeholder="No. pips" min="1">
            <select id="${p}_tp_fib" class="form-control tm2-sub ${p}-tp-sub ${p}-tp-type-4 hide">
              <option value="1.618">1.618</option>
              <option value="2.618">2.618</option>
              <option value="3.618">3.618</option>
              <option value="4.236">4.236</option>
              <option value="4.618">4.618</option>
              <option value="5.618">5.618</option>
              <option value="6.618">6.618</option>
            </select>
            <input type="number" id="${p}_tp_sr_bars" class="form-control tm2-sub ${p}-tp-sub ${p}-tp-type-5 hide" placeholder="Lookback bars" min="1" value="20">
            <input type="number" id="${p}_tp_time_min" class="form-control tm2-sub ${p}-tp-sub ${p}-tp-type-6 hide" placeholder="Minutes" min="1" value="120">
          </div>
          ${helpLink('Take Profit')}
        </div>
      </div>
      <!-- Trailing Stop -->
      <div class="real-row tm2-row">
        <div class="real-label">Trailing Stop</div>
        <div class="real-val tm2-val">
          <div class="tm2-controls">
            <select id="${p}_trailingMode" class="form-control tm2-select" onchange="syncTM2Type(this,'${p}-tm')">
              <option value="">&mdash; None &mdash;</option>
              <option value="13" data-id="${p}-tm-type-1">Fixed Distance (in pips)</option>
              <option value="14" data-id="${p}-tm-type-2">Fractal High/Low</option>
              <option value="15" data-id="${p}-tm-type-3">Breakeven</option>
              <option value="19" data-id="${p}-tm-type-4">Calculated From ATR Indicator</option>
            </select>
            <input type="number" id="${p}_tm_pips" class="form-control tm2-sub ${p}-tm-sub ${p}-tm-type-1 hide" placeholder="No. pips" min="1">
            <select id="${p}_tm_be" class="form-control tm2-sub ${p}-tm-sub ${p}-tm-type-3 hide">
              <option value="">&mdash; % &mdash;</option>
              <option value="25">25 %</option>
              <option value="50">50 %</option>
              <option value="75">75 %</option>
            </select>
            <div class="tm2-sub ${p}-tm-sub ${p}-tm-type-4 hide" style="display:flex; gap:5px;">
              <select id="${p}_tm_atr_coef" class="form-control" style="width:90px;">
                <option value="1.5">1.5 x ATR</option>
                <option value="2" selected>2 x ATR</option>
                <option value="3">3 x ATR</option>
              </select>
              <select id="${p}_tm_atr_tf" class="form-control" style="width:70px;">
                <option>Current</option>
                <option>M15</option>
                <option>H1</option>
                <option>H4</option>
              </select>
            </div>
          </div>
          ${helpLink('Trailing Stop')}
        </div>
      </div>
      ${dtpHTML}
    </div>`;
}


/* ─── SIMPLE ─── */
function tplSimple() {
  const riskOpts = ['0.125 %', '0.25 %', '0.5 %', '0.75 %', '1 %', '1.25 %', '1.5 %', '1.75 %', '2 %', '2.25 %', '2.5 %', '2.75 %', '3 %'].map(o => `<option value="${parseFloat(o)}"${o === '0.5 %' ? ' selected' : ''}>${o}</option>`).join('');
  const dailyOpts = ['— No limit —', '0.25 %', '0.5 %', '0.75 %', '1 %', '1.25 %', '1.5 %', '1.75 %', '2 %', '2.25 %', '2.5 %', '2.75 %', '3 %', '3.5 %', '4 %', '4.5 %', '5 %'].map(o => `<option value="${o === '— No limit —' ? '' : parseFloat(o)}"${o === '— No limit —' ? ' selected' : ''}>${o}</option>`).join('');
  const maxOrdersOpts = ['— No limit —', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '12', '15', '20', '25', '30'].map(o => `<option value="${o === '— No limit —' ? '' : o}"${o === '— No limit —' ? ' selected' : ''}>${o}</option>`).join('');

  return {
    step1Title: 'Step 1: Money Management',
    step1HTML: `
      <div class="real-form">
        ${h('Order Size', `
          <div class="radio-group" onchange="toggleDynamicLot(event)">
            <label class="radio-opt"><input type="radio" name="s-ordersize" value="1" checked/> Dynamic</label>
            <label class="radio-opt"><input type="radio" name="s-ordersize" value="2"/> Fixed</label>
          </div>`, 'Dynamic: the bot automatically calculates volume based on your account equity and risk %. Fixed: you set a constant lot size for every trade.')}
        
        <div id="wrap-dynamic-lot">
          ${h('Risk Per Order', `
            <select id="s-riskpertrade" class="form-control" name="s-risk" onchange="validateMaxLoss()">
              ${getRiskOptions()}
            </select>`, 'The percentage of your account balance you are comfortable risking on a single trade.')}
        </div>

        <div id="wrap-fixed-lot" class="hidden">
          ${h('Volume per Order', `
            <input type="text" id="s-lot" name="s-volume" class="form-control" value="0.01" placeholder="e.g. 0.01" oninput="validateFixedLot()"/>
            <div id="alert-fixed-lot" style="color:#c0392b;font-size:11.5px;margin-top:4px;" class="hidden">This field is required</div>
          `, 'The lot size (volume) to allocate per individual trade when using Fixed mode.')}
        </div>

        ${h('Max Orders / Day', `
          <select id="s-maxorders" class="form-control" name="s-maxorders">
            ${maxOrdersOpts}
          </select>`, 'Maximum number of trades the bot may open per day. Leave blank for no limit.')}

        ${h('Max Loss Daily', `
          <select id="s-maxloss" class="form-control" name="s-maxloss" onchange="validateMaxLoss()">
            ${dailyOpts}
          </select>
          <div id="alert-max-loss" style="color:#c0392b;font-size:11.5px;margin-top:4px;" class="hidden">"Max Loss Daily" must be greater than "Risk Per Order".</div>
        `, 'Maximum acceptable loss for a single trading day. The bot halts trading once this threshold is reached.')}

        ${h('Max Profit Daily', `
          <select id="s-maxprofit" class="form-control" name="s-maxprofit">
            ${dailyOpts}
          </select>`, 'Maximum profit target for a single trading day. The bot stops opening new trades once this is hit.')}
      </div>`,

    step2Title: 'Step 2: Trade Management',
    step2HTML: tradeManagementStep2('s', true)
  };
}


/* ─── GRID — CLASSIC ─── */
function tplGridClassic() {
  return {
    step1Title: 'Step 1: Grid Setup',
    step1HTML: `
      <div class="two-col">
        <div class="col-left">
          <div class="real-form">
            ${h('Grid Size', select('g-size', ['5', '8', '10', '15', '20'], '10'), 'Number of pending orders in the grid')}
            ${h('Spacing Type', `
              <div style="display:flex;flex-direction:column;gap:5px;">
                ${radio('g-spacingtype', 'static', 'Static', true, "toggleGridSpacing('g', 'static')")}
                ${radio('g-spacingtype', 'dynamic', 'Dynamic', false, "toggleGridSpacing('g', 'dynamic')")}
              </div>`, 'Static = fixed pips; Dynamic = ATR-based')}
            <div id="g-spacing-row" class="real-row">
              <div class="real-label">Spacing (in pips)</div>
              <div class="real-val">
                <div id="g-spacing-static">${numInput('g-spacing', '20')}</div>
                <div id="g-spacing-dynamic" style="display:none;">
                  <select id="g-spacing-atr-mult" class="form-control">
                    <option value="1.5">1.5 x ATR</option>
                    <option value="2" selected>2 x ATR</option>
                    <option value="2.5">2.5 x ATR</option>
                    <option value="3">3 x ATR</option>
                    <option value="3.5">3.5 x ATR</option>
                    <option value="4">4 x ATR</option>
                    <option value="5">5 x ATR</option>
                    <option value="6">6 x ATR</option>
                  </select>
                </div>
              </div>
            </div>
            ${h('Volume per Order', numInput('g-volume', '0.01', '0.01'), 'Lot size per grid order')}
            ${h('Move Grid', `
              <div class="radio-group">
                ${radio('g-movegrid', 'yes', 'Yes', true)}
                ${radio('g-movegrid', 'no', 'No', false)}
              </div>`, 'Shift the grid when price moves too far away')}
          </div>
          <div class="note-box" style="margin:0 0 0 0;">
            <strong>Note:</strong> This strategy places buy or sell orders at regular intervals after receiving an entry signal.<br>
            • <strong>Buy signal:</strong> only buy orders are placed below the current price.<br>
            • <strong>Sell signal:</strong> only sell orders are placed above the current price.
          </div>
        </div>
        <div class="col-right">
          <div class="diagram-wrap">${gridClassicSVG()}</div>
        </div>
      </div>`,

    step2Title: 'Step 2: Trade Management',
    step2HTML: gridStep2('gc')
  };
}

/* ─── GRID — REVERSE ─── */
function tplGridReverse() {
  return {
    step1Title: 'Step 1: Grid Setup',
    step1HTML: `
      <div class="two-col">
        <div class="col-left">
          <div class="real-form">
            ${h('Grid Size', select('gr-size', ['5', '8', '10', '15', '20'], '10'), 'Number of pending orders')}
            ${h('Spacing Type', `
              <div style="display:flex;flex-direction:column;gap:5px;">
                ${radio('gr-spacingtype', 'static', 'Static', true, "toggleGridSpacing('gr', 'static')")}
                ${radio('gr-spacingtype', 'dynamic', 'Dynamic', false, "toggleGridSpacing('gr', 'dynamic')")}
              </div>`, 'Static = fixed pips; Dynamic = ATR-based')}
            <div id="gr-spacing-row" class="real-row">
              <div class="real-label">Spacing (in pips)</div>
              <div class="real-val">
                <div id="gr-spacing-static">${numInput('gr-spacing', '20')}</div>
                <div id="gr-spacing-dynamic" style="display:none;">
                  <select id="gr-spacing-atr-mult" class="form-control">
                    <option value="1.5">1.5 x ATR</option>
                    <option value="2" selected>2 x ATR</option>
                    <option value="2.5">2.5 x ATR</option>
                    <option value="3">3 x ATR</option>
                    <option value="3.5">3.5 x ATR</option>
                    <option value="4">4 x ATR</option>
                    <option value="5">5 x ATR</option>
                    <option value="6">6 x ATR</option>
                  </select>
                </div>
              </div>
            </div>
            ${h('Volume per Order', numInput('gr-volume', '0.01', '0.01'), 'Lot size per grid order')}
            ${h('Move Grid', `
              <div class="radio-group">
                ${radio('gr-movegrid', 'yes', 'Yes', true)}
                ${radio('gr-movegrid', 'no', 'No', false)}
              </div>`, 'Shift the grid when price moves too far away')}
          </div>
          <div class="note-box" style="margin:0;">
            <strong>Note:</strong> Reverse Grid works in the opposite direction.<br>
            • <strong>Buy signal:</strong> sell orders placed below current price.<br>
            • <strong>Sell signal:</strong> buy orders placed above current price.
          </div>
        </div>
        <div class="col-right">
          <div class="diagram-wrap">${gridReverseSVG()}</div>
        </div>
      </div>`,

    step2Title: 'Step 2: Trade Management',
    step2HTML: gridStep2('gr')
  };
}

/* ─── GRID — HEDGED ─── */
function tplGridHedged() {
  return {
    step1Title: 'Step 1: Grid Setup',
    step1HTML: `
      <div class="two-col">
        <div class="col-left">
          <div class="real-form">
            ${h('Grid Size', select('gh-size', ['4', '6', '8', '10', '12'], '8'), 'Number of orders per side (buy+sell)')}
            ${h('Spacing Type', `
              <div style="display:flex;flex-direction:column;gap:5px;">
                ${radio('gh-spacingtype', 'static', 'Static', true, "toggleGridSpacing('gh', 'static')")}
                ${radio('gh-spacingtype', 'dynamic', 'Dynamic', false, "toggleGridSpacing('gh', 'dynamic')")}
              </div>`, 'Static = fixed pips; Dynamic = ATR-based')}
            <div id="gh-spacing-row" class="real-row">
              <div class="real-label">Spacing (in pips)</div>
              <div class="real-val">
                <div id="gh-spacing-static">${numInput('gh-spacing', '20')}</div>
                <div id="gh-spacing-dynamic" style="display:none;">
                  <select id="gh-spacing-atr-mult" class="form-control">
                    <option value="1.5">1.5 x ATR</option>
                    <option value="2" selected>2 x ATR</option>
                    <option value="2.5">2.5 x ATR</option>
                    <option value="3">3 x ATR</option>
                    <option value="3.5">3.5 x ATR</option>
                    <option value="4">4 x ATR</option>
                    <option value="5">5 x ATR</option>
                    <option value="6">6 x ATR</option>
                  </select>
                </div>
              </div>
            </div>
            ${h('Volume per Order', numInput('gh-volume', '0.01', '0.01'), 'Lot size per order')}
            ${h('Hedge Ratio', select2('gh-ratio', ['1:1 (Equal)', '1:2', '2:1']), 'Size ratio of hedge vs initial order')}
          </div>
          <div class="note-box" style="margin:0;">
            <strong>Note:</strong> Opens both buy and sell grid orders simultaneously. Profits from price movement in both directions while the market ranges.
          </div>
        </div>
        <div class="col-right">
          <div class="diagram-wrap">${gridHedgedSVG()}</div>
        </div>
      </div>`,

    step2Title: 'Step 2: Trade Management',
    step2HTML: gridStep2('gh')
  };
}

function getDynamicTradeManagement(prefix) {
  return `
      <div class="real-form">
        ${h('Close Orders at Max Profit', `
          <div class="radio-group">
            ${radio(prefix + '-closeprofit', 'yes', 'Yes', false, "toggleYesNo('" + prefix + "-closeprofit', 'yes')")}
            ${radio(prefix + '-closeprofit', 'no', 'No', true, "toggleYesNo('" + prefix + "-closeprofit', 'no')")}
          </div>`)}
        <div id="${prefix}-closeprofit-yes-wrap" style="display:none;margin-left:20px;margin-bottom:10px;padding:10px;background:#f9f9f9;border-left:2px solid #ddd;">
            ${h('Combined Cycle Profit Limit', numInput(prefix + '-closeprofit-amt', '200'))}
        </div>

        ${h('Close Orders at Max Loss', `
          <div class="radio-group">
            ${radio(prefix + '-closeloss', 'yes', 'Yes', false, "toggleYesNo('" + prefix + "-closeloss', 'yes')")}
            ${radio(prefix + '-closeloss', 'no', 'No', true, "toggleYesNo('" + prefix + "-closeloss', 'no')")}
          </div>`)}
        <div id="${prefix}-closeloss-yes-wrap" style="display:none;margin-left:20px;margin-bottom:10px;padding:10px;background:#f9f9f9;border-left:2px solid #ddd;">
            ${h('Combined Cycle Loss Limit', numInput(prefix + '-closeloss-amt', '500'))}
        </div>

        ${h('Max Profit Daily', `
          <div class="radio-group">
            ${radio(prefix + '-maxprofit', 'no', 'No', true, "toggleDaily('" + prefix + "', 'profit', 'no')")}
            ${radio(prefix + '-maxprofit', 'dynamic', 'Dynamic', false, "toggleDaily('" + prefix + "', 'profit', 'dynamic')")}
            ${radio(prefix + '-maxprofit', 'fixed', 'Fixed', false, "toggleDaily('" + prefix + "', 'profit', 'fixed')")}
          </div>`)}
        <div id="${prefix}-profit-dyn-wrap" style="display:none;margin-left:20px;margin-bottom:10px;padding:10px;background:#f9f9f9;border-left:2px solid #ddd;">
            ${h('Account % Target', numInput(prefix + '-profit-dyn', '1.0', '0.1'))}
        </div>
        <div id="${prefix}-profit-fix-wrap" style="display:none;margin-left:20px;margin-bottom:10px;padding:10px;background:#f9f9f9;border-left:2px solid #ddd;">
            ${h('Target Amount ($)', numInput(prefix + '-profit-fix', '100'))}
        </div>

        ${h('Max Loss Daily', `
          <div class="radio-group">
            ${radio(prefix + '-maxloss', 'no', 'No', true, "toggleDaily('" + prefix + "', 'loss', 'no')")}
            ${radio(prefix + '-maxloss', 'dynamic', 'Dynamic', false, "toggleDaily('" + prefix + "', 'loss', 'dynamic')")}
            ${radio(prefix + '-maxloss', 'fixed', 'Fixed', false, "toggleDaily('" + prefix + "', 'loss', 'fixed')")}
          </div>`)}
        <div id="${prefix}-loss-dyn-wrap" style="display:none;margin-left:20px;margin-bottom:10px;padding:10px;background:#f9f9f9;border-left:2px solid #ddd;">
            ${h('Account % Limit', numInput(prefix + '-loss-dyn', '5.0', '0.1'))}
        </div>
        <div id="${prefix}-loss-fix-wrap" style="display:none;margin-left:20px;margin-bottom:10px;padding:10px;background:#f9f9f9;border-left:2px solid #ddd;">
            ${h('Loss Limit ($)', numInput(prefix + '-loss-fix', '500'))}
        </div>

        ${h('Max Cycles Per Day', select(prefix + '-cycles', ['0 (Unlimited)', '1', '2', '3', '4', '5'], '0 (Unlimited)'))}
        ${timeBlock(prefix)}
      </div>`;
}

/* ─── HEDGING — RECOVERY ZONE ─── */
function tplHedgingRecovery() {
  return {
    step1Title: 'Step 1: Recovery Zone',
    step1HTML: `
      <div class="two-col">
        <div class="col-left">
          <div class="real-form">
            ${h('Max Orders', `<select class="form-control" name="hr-maxorders" id="hr-maxorders" onchange="document.getElementById('recovery-diagram-wrap').innerHTML=recoveryZoneHTML(this.value)">${Array.from({ length: 16 }, (_, i) => `<option${i + 1 === 14 ? ' selected' : ''}>${i + 1}</option>`).join('')}</select>`, 'Maximum number of recovery orders')}
            ${h('Zone (in pips)', numInput('hr-zone', '15'), 'Size of the recovery zone in pips')}
            ${h('Profit Target', numInput('hr-profit', '30'), 'Combined profit target in pips')}
          </div>
          <div class="note-box" style="margin:0;">
            <strong>Note:</strong> This strategy consists of opening a trade in one direction (buy or sell), then placing a hedge (an opposite position of equal or different size) if the market moves against the initial position.<br>
            👉 This strategy works with brokers that offer low fixed spreads.
          </div>
        </div>
        <div class="col-right">
          <div class="diagram-wrap" id="recovery-diagram-wrap" style="align-items:flex-start;padding-top:30px;border:none;background:transparent;">
            ${recoveryZoneHTML(14)}
          </div>
        </div>
      </div>`,

    step2Title: 'Step 2: Trade Management',
    step2HTML: getDynamicTradeManagement('hr') + `
      <div class="real-form" style="border-top:1px dashed #ddd;margin-top:10px;padding-top:10px;">
        ${h('Check Volatility', `
          <div class="radio-group">
            ${radio('hr-checkvol', 'no', 'No', false)}
            ${radio('hr-checkvol', 'yes', 'Yes', true)}
          </div>`, 'Assess market volatility before entry.')}
      </div>`
  };
}

/* ─── HEDGING — TREND FOLLOWING ─── */
function tplHedgingTrendFollowing() {
  return {
    step1Title: 'Step 1: Trend-Following Setup',
    step1HTML: `
      <div class="two-col">
        <div class="col-left">
          <div style="color:#c79400;font-weight:700;margin-bottom:12px;font-size:13px;">Primary Order:</div>
          <div class="real-form" style="margin-left:15px;border-left:2px solid #eee;padding-left:15px;margin-bottom:15px;">
            ${h('Trades Size', `
              <div class="radio-group">
                ${radio('htf-p-size', 'fixed', 'Fixed', true, "toggleSize('htf-p', 'fixed')")}
                ${radio('htf-p-size', 'dynamic', 'Dynamic', false, "toggleSize('htf-p', 'dynamic')")}
              </div>`)}
            <div id="htf-p-fixed-wrap">${h('Order Volume', numInput('htf-p-vol', '0.01', '0.01'))}</div>
            <div id="htf-p-dynamic-wrap" style="display:none;">${h('Risk per Trade (%)', numInput('htf-p-risk', '1.0', '0.1'))}</div>

            ${h('Stop Loss', select('htf-p-sl', ['Calculated from ATR Indicator', 'Fix distance', 'Fractal high low', 'Fibonacci base', 'Support & Resistence base', 'Time base'], '', "toggleSLTP('htf-p-sl')"), '')}
            <div id="htf-p-sl-atr-wrap" style="display:block;margin-left:20px;margin-bottom:10px;padding:10px;background:#fcfcfc;border-left:2px solid #ccc;">${h('ATR Multiplier', numInput('htf-p-sl-atr', '1.5', '0.1'))}${h('ATR Timeframe', select('htf-p-sl-atr-tf', ['Current', 'M1', 'M5', 'M15', 'M30', 'H1', 'H4', 'D1']), '')}${h('ATR Period', numInput('htf-p-sl-atr-pd', '14'))}</div>
            <div id="htf-p-sl-fix-wrap"  style="display:none;margin-left:20px;margin-bottom:10px;padding:10px;background:#fcfcfc;border-left:2px solid #ccc;">${h('Distance (in pips)', numInput('htf-p-sl-fix', '50'))}</div>
            <div id="htf-p-sl-frac-wrap" style="display:none;margin-left:20px;margin-bottom:10px;padding:10px;background:#fcfcfc;border-left:2px solid #ccc;">${h('Time Frame', select('htf-p-sl-frac-tf', ['Current', 'M1', 'M5', 'M15', 'M30', 'H1', 'H4', 'D1']), '')}</div>
            <div id="htf-p-sl-fib-wrap"  style="display:none;margin-left:20px;margin-bottom:10px;padding:10px;background:#fcfcfc;border-left:2px solid #ccc;">${h('Fib. Level', select('htf-p-sl-fib', ['0.236', '0.382', '0.5', '0.618', '0.786'], '0.5'))}</div>
            <div id="htf-p-sl-sr-wrap"   style="display:none;margin-left:20px;margin-bottom:10px;padding:10px;background:#fcfcfc;border-left:2px solid #ccc;">${h('Lookback Bars', numInput('htf-p-sl-sr-bars', '20'))}</div>
            <div id="htf-p-sl-time-wrap" style="display:none;margin-left:20px;margin-bottom:10px;padding:10px;background:#fcfcfc;border-left:2px solid #ccc;">${h('Minutes', numInput('htf-p-sl-time-min', '60'))}</div>

            ${h('Take Profit', select('htf-p-tp', ['Calculated from ATR Indicator', 'Risk reward ratio', 'Fix distance', 'Fibonacci base', 'Support & Resistence base', 'Time base'], '', "toggleSLTP('htf-p-tp')"), '')}
            <div id="htf-p-tp-atr-wrap" style="display:block;margin-left:20px;margin-bottom:10px;padding:10px;background:#fcfcfc;border-left:2px solid #ccc;">${h('ATR Multiplier', numInput('htf-p-tp-atr', '1.5', '0.1'))}${h('ATR Timeframe', select('htf-p-tp-atr-tf', ['Current', 'M1', 'M5', 'M15', 'M30', 'H1', 'H4', 'D1']), '')}${h('ATR Period', numInput('htf-p-tp-atr-pd', '14'))}</div>
            <div id="htf-p-tp-rr-wrap"  style="display:none;margin-left:20px;margin-bottom:10px;padding:10px;background:#fcfcfc;border-left:2px solid #ccc;">${h('Risk/Reward Coef.', numInput('htf-p-tp-rr', '2.0', '0.1'))}</div>
            <div id="htf-p-tp-fix-wrap" style="display:none;margin-left:20px;margin-bottom:10px;padding:10px;background:#fcfcfc;border-left:2px solid #ccc;">${h('Distance (in pips)', numInput('htf-p-tp-fix', '100'))}</div>
            <div id="htf-p-tp-fib-wrap"  style="display:none;margin-left:20px;margin-bottom:10px;padding:10px;background:#fcfcfc;border-left:2px solid #ccc;">${h('Fib. Level', select('htf-p-tp-fib', ['1.618', '2.618', '3.618', '4.236'], '1.618'))}</div>
            <div id="htf-p-tp-sr-wrap"   style="display:none;margin-left:20px;margin-bottom:10px;padding:10px;background:#fcfcfc;border-left:2px solid #ccc;">${h('Lookback Bars', numInput('htf-p-tp-sr-bars', '20'))}</div>
            <div id="htf-p-tp-time-wrap" style="display:none;margin-left:20px;margin-bottom:10px;padding:10px;background:#fcfcfc;border-left:2px solid #ccc;">${h('Minutes', numInput('htf-p-tp-time-min', '120'))}</div>

            ${h('Trailing Stop', select('htf-p-ts', ['Disabled', 'Calculated from ATR Indicator', 'Fix distance', 'Fractal high low'], '', "toggleTS('htf-p-ts')"), '')}
            <div id="htf-p-ts-atr-wrap"  style="display:none;margin-left:20px;margin-bottom:10px;padding:10px;background:#fcfcfc;border-left:2px solid #ccc;">${h('ATR Multiplier', numInput('htf-p-ts-atr', '1.5', '0.1'))}${h('ATR Timeframe', select('htf-p-ts-atr-tf', ['Current', 'M1', 'M5', 'M15', 'M30', 'H1', 'H4', 'D1']), '')}${h('ATR Period', numInput('htf-p-ts-atr-pd', '14'))}</div>
            <div id="htf-p-ts-fix-wrap"  style="display:none;margin-left:20px;margin-bottom:10px;padding:10px;background:#fcfcfc;border-left:2px solid #ccc;">${h('Trailing Distance', numInput('htf-p-ts-dist', '20'))}${h('Activation Distance', numInput('htf-p-ts-act', '20'))}</div>
            <div id="htf-p-ts-frac-wrap" style="display:none;margin-left:20px;margin-bottom:10px;padding:10px;background:#fcfcfc;border-left:2px solid #ccc;">${h('Time Frame', select('htf-p-ts-frac-tf', ['Current', 'M1', 'M5', 'M15', 'M30', 'H1', 'H4', 'D1']), '')}</div>
          </div>

          <div style="color:#c79400;font-weight:700;margin-bottom:12px;font-size:13px;">Hedge Orders:</div>
          <div class="real-form" style="margin-left:15px;border-left:2px solid #eee;padding-left:15px;">
            ${h('Max Orders', select('htf-h-max', Array.from({ length: 10 }, (_, i) => String(i + 1)), '10'), '')}
            ${h('Trades Size', `
              <div class="radio-group">
                ${radio('htf-h-size', 'fixed', 'Fixed', true, "toggleSize('htf-h', 'fixed')")}
                ${radio('htf-h-size', 'dynamic', 'Dynamic', false, "toggleSize('htf-h', 'dynamic')")}
              </div>`)}
            <div id="htf-h-fixed-wrap">${h('Order Volume', numInput('htf-h-vol', '0.01', '0.01'))}</div>
            <div id="htf-h-dynamic-wrap" style="display:none;">${h('Risk per Trade (%)', numInput('htf-h-risk', '1.0', '0.1'))}</div>

            ${h('Stop Loss', select('htf-h-sl', ['Calculated from ATR Indicator', 'Fix distance', 'Fractal high low', 'Fibonacci base', 'Support & Resistence base', 'Time base'], '', "toggleSLTP('htf-h-sl')"), '')}
            <div id="htf-h-sl-atr-wrap" style="display:block;margin-left:20px;margin-bottom:10px;padding:10px;background:#fcfcfc;border-left:2px solid #ccc;">${h('ATR Multiplier', numInput('htf-h-sl-atr', '1.5', '0.1'))}${h('ATR Timeframe', select('htf-h-sl-atr-tf', ['Current', 'M1', 'M5', 'M15', 'M30', 'H1', 'H4', 'D1']), '')}${h('ATR Period', numInput('htf-h-sl-atr-pd', '14'))}</div>
            <div id="htf-h-sl-fix-wrap"  style="display:none;margin-left:20px;margin-bottom:10px;padding:10px;background:#fcfcfc;border-left:2px solid #ccc;">${h('Distance (in pips)', numInput('htf-h-sl-fix', '50'))}</div>
            <div id="htf-h-sl-frac-wrap" style="display:none;margin-left:20px;margin-bottom:10px;padding:10px;background:#fcfcfc;border-left:2px solid #ccc;">${h('Time Frame', select('htf-h-sl-frac-tf', ['Current', 'M1', 'M5', 'M15', 'M30', 'H1', 'H4', 'D1']), '')}</div>
            <div id="htf-h-sl-fib-wrap"  style="display:none;margin-left:20px;margin-bottom:10px;padding:10px;background:#fcfcfc;border-left:2px solid #ccc;">${h('Fib. Level', select('htf-h-sl-fib', ['0.236', '0.382', '0.5', '0.618', '0.786'], '0.5'))}</div>
            <div id="htf-h-sl-sr-wrap"   style="display:none;margin-left:20px;margin-bottom:10px;padding:10px;background:#fcfcfc;border-left:2px solid #ccc;">${h('Lookback Bars', numInput('htf-h-sl-sr-bars', '20'))}</div>
            <div id="htf-h-sl-time-wrap" style="display:none;margin-left:20px;margin-bottom:10px;padding:10px;background:#fcfcfc;border-left:2px solid #ccc;">${h('Minutes', numInput('htf-h-sl-time-min', '60'))}</div>

            ${h('Take Profit', select('htf-h-tp', ['Calculated from ATR Indicator', 'Risk reward ratio', 'Fix distance', 'Fibonacci base', 'Support & Resistence base', 'Time base'], '', "toggleSLTP('htf-h-tp')"), '')}
            <div id="htf-h-tp-atr-wrap" style="display:block;margin-left:20px;margin-bottom:10px;padding:10px;background:#fcfcfc;border-left:2px solid #ccc;">${h('ATR Multiplier', numInput('htf-h-tp-atr', '1.5', '0.1'))}${h('ATR Timeframe', select('htf-h-tp-atr-tf', ['Current', 'M1', 'M5', 'M15', 'M30', 'H1', 'H4', 'D1']), '')}${h('ATR Period', numInput('htf-h-tp-atr-pd', '14'))}</div>
            <div id="htf-h-tp-rr-wrap"  style="display:none;margin-left:20px;margin-bottom:10px;padding:10px;background:#fcfcfc;border-left:2px solid #ccc;">${h('Risk/Reward Coef.', numInput('htf-h-tp-rr', '2.0', '0.1'))}</div>
            <div id="htf-h-tp-fix-wrap" style="display:none;margin-left:20px;margin-bottom:10px;padding:10px;background:#fcfcfc;border-left:2px solid #ccc;">${h('Distance (in pips)', numInput('htf-h-tp-fix', '100'))}</div>
            <div id="htf-h-tp-fib-wrap"  style="display:none;margin-left:20px;margin-bottom:10px;padding:10px;background:#fcfcfc;border-left:2px solid #ccc;">${h('Fib. Level', select('htf-h-tp-fib', ['1.618', '2.618', '3.618', '4.236'], '1.618'))}</div>
            <div id="htf-h-tp-sr-wrap"   style="display:none;margin-left:20px;margin-bottom:10px;padding:10px;background:#fcfcfc;border-left:2px solid #ccc;">${h('Lookback Bars', numInput('htf-h-tp-sr-bars', '20'))}</div>
            <div id="htf-h-tp-time-wrap" style="display:none;margin-left:20px;margin-bottom:10px;padding:10px;background:#fcfcfc;border-left:2px solid #ccc;">${h('Minutes', numInput('htf-h-tp-time-min', '120'))}</div>

            ${h('Trailing Stop', select('htf-h-ts', ['Disabled', 'Calculated from ATR Indicator', 'Fix distance', 'Fractal high low'], '', "toggleTS('htf-h-ts')"), '')}
            <div id="htf-h-ts-atr-wrap"  style="display:none;margin-left:20px;margin-bottom:10px;padding:10px;background:#fcfcfc;border-left:2px solid #ccc;">${h('ATR Multiplier', numInput('htf-h-ts-atr', '1.5', '0.1'))}${h('ATR Timeframe', select('htf-h-ts-atr-tf', ['Current', 'M1', 'M5', 'M15', 'M30', 'H1', 'H4', 'D1']), '')}${h('ATR Period', numInput('htf-h-ts-atr-pd', '14'))}</div>
            <div id="htf-h-ts-fix-wrap"  style="display:none;margin-left:20px;margin-bottom:10px;padding:10px;background:#fcfcfc;border-left:2px solid #ccc;">${h('Trailing Distance', numInput('htf-h-ts-dist', '20'))}${h('Activation Distance', numInput('htf-h-ts-act', '20'))}</div>
            <div id="htf-h-ts-frac-wrap" style="display:none;margin-left:20px;margin-bottom:10px;padding:10px;background:#fcfcfc;border-left:2px solid #ccc;">${h('Time Frame', select('htf-h-ts-frac-tf', ['Current', 'M1', 'M5', 'M15', 'M30', 'H1', 'H4', 'D1']), '')}</div>
          </div>
          <div class="note-box" style="margin-top:15px;">
            <strong>Note:</strong> The bot places a primary order when it detects an entry signal defined in the 'Rules for Primary Orders' section. It then opens a hedge order based on a signal from the 'Rules for Hedge Orders' section.<br>After that, the bot continues to alternate between primary and hedge signals in opposite directions, opening new trades accordingly.
          </div>
        </div>
        <div class="col-right" style="justify-content:center;">
          <div class="diagram-wrap" style="border:none;background:transparent;">
            ${trendFollowingSVG()}
          </div>
        </div>
      </div>`,

    step2Title: 'Step 2: Trade Management',
    step2HTML: getDynamicTradeManagement('htf')
  };
}

/* ─── HEDGING — RANGE ─── */
function tplHedgingRange() {
  return {
    step1Title: 'Step 1: Range Hedging Setup',
    step1HTML: `
      <div class="two-col">
        <div class="col-left">
          <div class="real-form" style="margin-bottom:15px;">
            ${h('Max Orders', select('hrg-maxorders', Array.from({ length: 20 }, (_, i) => String(i + 1)), '6'), 'Max simultaneous orders')}
          </div>
          <div style="color:#c79400;font-weight:700;margin-bottom:12px;font-size:13px;">Primary / Hedge Orders:</div>
          <div class="real-form" style="margin-left:15px;border-left:2px solid #eee;padding-left:15px;">
            ${h('Trades Size', `
              <div class="radio-group">
                ${radio('hrg-p-size', 'fixed', 'Fixed', true, "toggleSize('hrg-p', 'fixed')")}
                ${radio('hrg-p-size', 'dynamic', 'Dynamic', false, "toggleSize('hrg-p', 'dynamic')")}
              </div>`)}
            <div id="hrg-p-fixed-wrap">${h('Order Volume', numInput('hrg-p-vol', '0.01', '0.01'))}</div>
            <div id="hrg-p-dynamic-wrap" style="display:none;">${h('Risk per Trade (%)', numInput('hrg-p-risk', '1.0', '0.1'))}</div>

            ${h('Stop Loss', select('hrg-p-sl', ['Calculated from ATR Indicator', 'Fix distance', 'Fractal high low', 'Fibonacci base', 'Support & Resistence base', 'Time base'], '', "toggleSLTP('hrg-p-sl')"), '')}
            <div id="hrg-p-sl-atr-wrap" style="display:block;margin-left:20px;margin-bottom:10px;padding:10px;background:#fcfcfc;border-left:2px solid #ccc;">${h('ATR Multiplier', numInput('hrg-p-sl-atr', '1.5', '0.1'))}${h('ATR Timeframe', select('hrg-p-sl-atr-tf', ['Current', 'M1', 'M5', 'M15', 'M30', 'H1', 'H4', 'D1']), '')}${h('ATR Period', numInput('hrg-p-sl-atr-pd', '14'))}</div>
            <div id="hrg-p-sl-fix-wrap"  style="display:none;margin-left:20px;margin-bottom:10px;padding:10px;background:#fcfcfc;border-left:2px solid #ccc;">${h('Distance (in pips)', numInput('hrg-p-sl-fix', '50'))}</div>
            <div id="hrg-p-sl-frac-wrap" style="display:none;margin-left:20px;margin-bottom:10px;padding:10px;background:#fcfcfc;border-left:2px solid #ccc;">${h('Time Frame', select('hrg-p-sl-frac-tf', ['Current', 'M1', 'M5', 'M15', 'M30', 'H1', 'H4', 'D1']), '')}</div>
            <div id="hrg-p-sl-fib-wrap"  style="display:none;margin-left:20px;margin-bottom:10px;padding:10px;background:#fcfcfc;border-left:2px solid #ccc;">${h('Fib. Level', select('hrg-p-sl-fib', ['0.236', '0.382', '0.5', '0.618', '0.786'], '0.5'))}</div>
            <div id="hrg-p-sl-sr-wrap"   style="display:none;margin-left:20px;margin-bottom:10px;padding:10px;background:#fcfcfc;border-left:2px solid #ccc;">${h('Lookback Bars', numInput('hrg-p-sl-sr-bars', '20'))}</div>
            <div id="hrg-p-sl-time-wrap" style="display:none;margin-left:20px;margin-bottom:10px;padding:10px;background:#fcfcfc;border-left:2px solid #ccc;">${h('Minutes', numInput('hrg-p-sl-time-min', '60'))}</div>

            ${h('Take Profit', select('hrg-p-tp', ['Calculated from ATR Indicator', 'Risk reward ratio', 'Fix distance', 'Fibonacci base', 'Support & Resistence base', 'Time base'], '', "toggleSLTP('hrg-p-tp')"), '')}
            <div id="hrg-p-tp-atr-wrap" style="display:block;margin-left:20px;margin-bottom:10px;padding:10px;background:#fcfcfc;border-left:2px solid #ccc;">${h('ATR Multiplier', numInput('hrg-p-tp-atr', '1.5', '0.1'))}${h('ATR Timeframe', select('hrg-p-tp-atr-tf', ['Current', 'M1', 'M5', 'M15', 'M30', 'H1', 'H4', 'D1']), '')}${h('ATR Period', numInput('hrg-p-tp-atr-pd', '14'))}</div>
            <div id="hrg-p-tp-rr-wrap"  style="display:none;margin-left:20px;margin-bottom:10px;padding:10px;background:#fcfcfc;border-left:2px solid #ccc;">${h('Risk/Reward Coef.', numInput('hrg-p-tp-rr', '2.0', '0.1'))}</div>
            <div id="hrg-p-tp-fix-wrap" style="display:none;margin-left:20px;margin-bottom:10px;padding:10px;background:#fcfcfc;border-left:2px solid #ccc;">${h('Distance (in pips)', numInput('hrg-p-tp-fix', '100'))}</div>
            <div id="hrg-p-tp-fib-wrap"  style="display:none;margin-left:20px;margin-bottom:10px;padding:10px;background:#fcfcfc;border-left:2px solid #ccc;">${h('Fib. Level', select('hrg-p-tp-fib', ['1.618', '2.618', '3.618', '4.236'], '1.618'))}</div>
            <div id="hrg-p-tp-sr-wrap"   style="display:none;margin-left:20px;margin-bottom:10px;padding:10px;background:#fcfcfc;border-left:2px solid #ccc;">${h('Lookback Bars', numInput('hrg-p-tp-sr-bars', '20'))}</div>
            <div id="hrg-p-tp-time-wrap" style="display:none;margin-left:20px;margin-bottom:10px;padding:10px;background:#fcfcfc;border-left:2px solid #ccc;">${h('Minutes', numInput('hrg-p-tp-time-min', '120'))}</div>

            ${h('Trailing Stop', select('hrg-p-ts', ['Disabled', 'Calculated from ATR Indicator', 'Fix distance', 'Fractal high low'], '', "toggleTS('hrg-p-ts')"), '')}
            <div id="hrg-p-ts-atr-wrap"  style="display:none;margin-left:20px;margin-bottom:10px;padding:10px;background:#fcfcfc;border-left:2px solid #ccc;">${h('ATR Multiplier', numInput('hrg-p-ts-atr', '1.5', '0.1'))}${h('ATR Timeframe', select('hrg-p-ts-atr-tf', ['Current', 'M1', 'M5', 'M15', 'M30', 'H1', 'H4', 'D1']), '')}${h('ATR Period', numInput('hrg-p-ts-atr-pd', '14'))}</div>
            <div id="hrg-p-ts-fix-wrap"  style="display:none;margin-left:20px;margin-bottom:10px;padding:10px;background:#fcfcfc;border-left:2px solid #ccc;">${h('Trailing Distance', numInput('hrg-p-ts-dist', '20'))}${h('Activation Distance', numInput('hrg-p-ts-act', '20'))}</div>
            <div id="hrg-p-ts-frac-wrap" style="display:none;margin-left:20px;margin-bottom:10px;padding:10px;background:#fcfcfc;border-left:2px solid #ccc;">${h('Time Frame', select('hrg-p-ts-frac-tf', ['Current', 'M1', 'M5', 'M15', 'M30', 'H1', 'H4', 'D1']), '')}</div>
          </div>
          <div class="note-box" style="margin-top:15px;">
            <strong>Note:</strong> Places both buy and sell limit orders at the boundaries of a defined price range. Profits when price bounces between the range boundaries.
          </div>
        </div>
        <div class="col-right" style="justify-content:center;">
          <div class="diagram-wrap" style="border:none;background:transparent;">
            ${rangeHedgingSVG()}
          </div>
        </div>
      </div>`,

    step2Title: 'Step 2: Trade Management',
    step2HTML: getDynamicTradeManagement('hrg')
  };
}

/* ─── MARTINGALE — CLASSIC ─── */
function tplMartingaleClassic() {
  return {
    step1Title: 'Step 1: Classic Martingale',
    step1HTML: `
      <div class="real-form">
        ${h('Order Size', `
          <div class="radio-group" onchange="toggleDynamicLot(event)">
            <label class="radio-opt"><input type="radio" name="mc-ordersize" value="1" checked/> Dynamic</label>
            <label class="radio-opt"><input type="radio" name="mc-ordersize" value="2"/> Fixed</label>
          </div>`, 'Dynamic: the bot automatically calculates volume based on your account equity and risk %. Fixed: you set a constant lot size for every trade.')}
        
        <div id="wrap-dynamic-lot">
          ${h('Risk Per Order', `
            <select id="mc-riskpertrade" class="form-control" name="mc-risk">
              ${getRiskOptions()}
            </select>`, 'The percentage of your account balance you are comfortable risking on a single trade.')}
        </div>

        <div id="wrap-fixed-lot" class="hidden">
          ${h('Volume per Order', `
            <input type="text" id="mc-lot" name="mc-volume" class="form-control" value="0.01" placeholder="e.g. 0.01"/>
          `, 'The lot size (volume) to allocate per individual trade when using Fixed mode.')}
        </div>

        ${h('Max Orders', select('mc-maxorders', ['4', '6', '8', '10', '12'], '8'), 'Maximum number of martingale levels')}
      </div>`,

    step2Title: 'Step 2: Trade Management',
    step2HTML: tradeManagementStep2('mc')
  };
}

/* ─── MARTINGALE — ANTI ─── */
function tplMartingaleAnti() {
  return {
    step1Title: 'Step 1: Anti-Martingale',
    step1HTML: `
      <div class="real-form">
        ${h('Order Size', `
          <div class="radio-group" onchange="toggleDynamicLot(event)">
            <label class="radio-opt"><input type="radio" name="am-ordersize" value="1" checked/> Dynamic</label>
            <label class="radio-opt"><input type="radio" name="am-ordersize" value="2"/> Fixed</label>
          </div>`, 'Dynamic: the bot automatically calculates volume based on your account equity and risk %. Fixed: you set a constant lot size for every trade.')}
        
        <div id="wrap-dynamic-lot">
          ${h('Risk Per Order', `
            <select id="am-riskpertrade" class="form-control" name="am-risk">
              ${getRiskOptions()}
            </select>`, 'The percentage of your account balance you are comfortable risking on a single trade.')}
        </div>

        <div id="wrap-fixed-lot" class="hidden">
          ${h('Volume per Order', `
            <input type="text" id="am-lot" name="am-volume" class="form-control" value="0.01" placeholder="e.g. 0.01"/>
          `, 'The lot size (volume) to allocate per individual trade when using Fixed mode.')}
        </div>

        ${h('Max Orders', select('am-maxorders', ['4', '6', '8', '10', '12'], '8'), 'Maximum consecutive winning orders to scale')}
      </div>
      <div class="note-box" style="margin:0 24px 16px;">
        <strong>Note:</strong> Unlike Classic Martingale, Anti-Martingale increases position size after a <em>winning</em> trade. After a loss, the lot resets to the initial value.
      </div>`,

    step2Title: 'Step 2: Trade Management',
    step2HTML: tradeManagementStep2('am')
  };
}

/* ─── RANGE BREAKOUT ─── */
function rangeBreakoutStep1(prefix, title, noteText) {
  return {
    step1Title: title,
    step1HTML: `
      <div class="two-col">
        <div class="col-left">
          <div class="real-form">
            ${h('Order Size', `
              <div class="radio-group" onchange="toggleDynamicLot(event)">
                <label class="radio-opt"><input type="radio" name="${prefix}-ordersize" value="1" checked/> Dynamic</label>
                <label class="radio-opt"><input type="radio" name="${prefix}-ordersize" value="2"/> Fixed</label>
              </div>`, 'Dynamic: the bot automatically calculates volume based on your account equity and risk %. Fixed: you set a constant lot size for every trade.')}
            
            <div id="wrap-dynamic-lot">
              ${h('Risk Per Order', `
                <select id="${prefix}-riskpertrade" class="form-control" name="${prefix}-risk">
                  ${getRiskOptions()}
                </select>`, 'The percentage of your account balance you are comfortable risking on a single trade.')}
            </div>

            <div id="wrap-fixed-lot" class="hidden">
              ${h('Volume per Order', `
                <input type="text" id="${prefix}-lot" name="${prefix}-volume" class="form-control" value="0.01" placeholder="e.g. 0.01"/>
              `, 'The lot size (volume) to allocate per individual trade when using Fixed mode.')}
            </div>

            <div style="margin-top:15px; border-top:1px solid #eee; padding-top:15px;"></div>

            ${h('Start Time', `
              <input type="time" class="form-control" name="${prefix}-starttime" value="08:00" />
            `, 'Time the range calculation begins.')}
            ${h('Duration (Minutes)', `
              <input type="number" class="form-control sm" name="${prefix}-duration" value="4" min="1" />
            `, 'How long the range is calculated.')}
            ${h('Trade Close Time', `
              <div class="radio-group" onchange="toggleTradeCloseTime('${prefix}', event)">
                <label class="radio-opt"><input type="radio" name="${prefix}-closetime-en" value="yes" /> Yes</label>
                <label class="radio-opt"><input type="radio" name="${prefix}-closetime-en" value="no" checked /> No</label>
              </div>
            `, 'Should open trades or pending orders be closed at a specific time?')}
            
            <div id="${prefix}-wrap-closetime" class="hidden">
              ${h('Close Time', `
                <input type="time" class="form-control" name="${prefix}-closetime" value="20:00" />
              `, 'Time to close all trades and delete pending orders.')}
            </div>
            
            <div class="note-box" style="margin-top:12px;"><strong>Note:</strong> All times are about UTC time. Please adjust according to your broker's server time.</div>
          </div>
          <div class="note-box" style="margin:0;">
            <strong>Note:</strong> ${noteText}
          </div>
        </div>
        <div class="col-right">
          <div class="diagram-wrap">${rangeBreakoutSVG()}</div>
        </div>
      </div>`,
    step2Title: 'Step 2: Trade Management',
    step2HTML: tradeManagementStep2(prefix, true)
  };
}


function tplRangeBreakoutClassic() {
  return rangeBreakoutStep1('rbc', 'Step 1: Classic Range Breakout', 'Places pending orders outside the defined time range to catch a breakout.');
}

function tplRangeBreakoutAnti() {
  return rangeBreakoutStep1('rba', 'Step 1: Anti-Range Breakout', 'Places pending orders inside the defined time range, expecting the price to bounce back.');
}

/* =============================================================
   SHARED STEP 2 BODIES
   ============================================================= */

function gridStep2(p) {
  return `
    <div class="real-form">
      ${h('Take Profit per Trade', `
        <div class="radio-group">
          ${radio(p + '-tptrade', 'yes', 'Yes', true, "toggleYesNo('" + p + "-tptrade', 'yes')")}
          ${radio(p + '-tptrade', 'no', 'No', false, "toggleYesNo('" + p + "-tptrade', 'no')")}
        </div>`, 'Set individual TP for each grid order')}
      <div id="${p}-tptrade-yes-wrap">
        ${h('Take Profit', select2(p + '-tp', ['1 x Spacing', '2 x Spacing', '3 x Spacing', 'Fixed (pips)']), 'TP size relative to spacing')}
      </div>

      ${h('Close Grid at Max Profit', `
        <div class="radio-group">
          ${radio(p + '-closeatmax', 'yes', 'Yes', false, "toggleYesNo('" + p + "-closeatmax', 'yes')")}
          ${radio(p + '-closeatmax', 'no', 'No', true, "toggleYesNo('" + p + "-closeatmax', 'no')")}
        </div>`, 'Close entire grid when combined profit target is reached')}
      <div id="${p}-closeatmax-yes-wrap" style="display:none;margin-left:20px;margin-bottom:10px;padding:10px;background:#fcfcfc;border-left:2px solid #ccc;">
        ${h('Max Profit (Equity %)', `
          <select id="${p}-closeatmax-equity" class="form-control">
            <option value="0.25">0.25 %</option>
            <option value="0.5" selected>0.5 %</option>
            <option value="0.75">0.75 %</option>
            <option value="1.0">1.0 %</option>
            <option value="1.25">1.25 %</option>
            <option value="1.5">1.5 %</option>
            <option value="1.75">1.75 %</option>
            <option value="2.0">2.0 %</option>
            <option value="2.5">2.5 %</option>
            <option value="3.0">3.0 %</option>
            <option value="4.0">4.0 %</option>
            <option value="5.0">5.0 %</option>
          </select>`)}
      </div>

      ${h('Grid Stop Loss', select2(p + '-gsl', ['5 x Spacing', '8 x Spacing', '10 x Spacing', '15 x Spacing', 'Fixed (pips)']), 'Close entire grid at this total loss')}
      
      ${h('Max Profit Daily', `
        <div class="radio-group">
          ${radio(p + '-maxprofit', 'no', 'No', true, "toggleDaily('" + p + "', 'profit', 'no')")}
          ${radio(p + '-maxprofit', 'dynamic', 'Dynamic', false, "toggleDaily('" + p + "', 'profit', 'dynamic')")}
          ${radio(p + '-maxprofit', 'fixed', 'Fixed', false, "toggleDaily('" + p + "', 'profit', 'fixed')")}
        </div>`, 'Stop opening new grids after this profit')}
      <div id="${p}-profit-dyn-wrap" style="display:none;margin-left:20px;margin-bottom:10px;padding:10px;background:#fcfcfc;border-left:2px solid #ccc;">
        ${h('Target (%)', numInput(p + '-profit-dyn', '2.0', '0.1'))}
      </div>
      <div id="${p}-profit-fix-wrap" style="display:none;margin-left:20px;margin-bottom:10px;padding:10px;background:#fcfcfc;border-left:2px solid #ccc;">
        ${h('Target (Amount)', numInput(p + '-profit-fix', '100'))}
      </div>

      ${h('Max Loss Daily', `
        <div class="radio-group">
          ${radio(p + '-maxloss', 'no', 'No', true, "toggleDaily('" + p + "', 'loss', 'no')")}
          ${radio(p + '-maxloss', 'dynamic', 'Dynamic', false, "toggleDaily('" + p + "', 'loss', 'dynamic')")}
          ${radio(p + '-maxloss', 'fixed', 'Fixed', false, "toggleDaily('" + p + "', 'loss', 'fixed')")}
        </div>`, 'Stop opening new grids after this loss')}
      <div id="${p}-loss-dyn-wrap" style="display:none;margin-left:20px;margin-bottom:10px;padding:10px;background:#fcfcfc;border-left:2px solid #ccc;">
        ${h('Limit (%)', numInput(p + '-loss-dyn', '5.0', '0.1'))}
      </div>
      <div id="${p}-loss-fix-wrap" style="display:none;margin-left:20px;margin-bottom:10px;padding:10px;background:#fcfcfc;border-left:2px solid #ccc;">
        ${h('Limit (Amount)', numInput(p + '-loss-fix', '500'))}
      </div>

      ${h('Max grids cycle open per day', select(p + '-maxgrids', ['', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15']), 'Maximum number of grid cycles allowed per day.')}
      ${timeBlock(p)}
    </div>`;
}

function hedgingStep2(p) {
  return `
    <div class="real-form">
      ${h('Max Profit Daily', `
        <div class="radio-group">
          ${radio(p + '-maxprofit', 'no', 'No', true, "toggleDaily('" + p + "', 'profit', 'no')")}
          ${radio(p + '-maxprofit', 'dynamic', 'Dynamic', false, "toggleDaily('" + p + "', 'profit', 'dynamic')")}
          ${radio(p + '-maxprofit', 'fixed', 'Fixed', false, "toggleDaily('" + p + "', 'profit', 'fixed')")}
        </div>`, 'Stop trading after this profit')}
      <div id="${p}-profit-dyn-wrap" style="display:none;margin-left:20px;margin-bottom:10px;padding:10px;background:#fcfcfc;border-left:2px solid #ccc;">
        ${h('Target (%)', numInput(p + '-profit-dyn', '2.0', '0.1'))}
      </div>
      <div id="${p}-profit-fix-wrap" style="display:none;margin-left:20px;margin-bottom:10px;padding:10px;background:#fcfcfc;border-left:2px solid #ccc;">
        ${h('Target (Amount)', numInput(p + '-profit-fix', '100'))}
      </div>

      ${h('Max Loss Daily', `
        <div class="radio-group">
          ${radio(p + '-maxloss', 'no', 'No', true, "toggleDaily('" + p + "', 'loss', 'no')")}
          ${radio(p + '-maxloss', 'dynamic', 'Dynamic', false, "toggleDaily('" + p + "', 'loss', 'dynamic')")}
          ${radio(p + '-maxloss', 'fixed', 'Fixed', false, "toggleDaily('" + p + "', 'loss', 'fixed')")}
        </div>`, 'Stop trading after this loss')}
      <div id="${p}-loss-dyn-wrap" style="display:none;margin-left:20px;margin-bottom:10px;padding:10px;background:#fcfcfc;border-left:2px solid #ccc;">
        ${h('Limit (%)', numInput(p + '-loss-dyn', '5.0', '0.1'))}
      </div>
      <div id="${p}-loss-fix-wrap" style="display:none;margin-left:20px;margin-bottom:10px;padding:10px;background:#fcfcfc;border-left:2px solid #ccc;">
        ${h('Limit (Amount)', numInput(p + '-loss-fix', '500'))}
      </div>

      ${timeBlock(p)}
    </div>`;
}