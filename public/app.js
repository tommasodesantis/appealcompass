var S=new TextEncoder;function H(t){return String(t??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function D(t){return t&&typeof t=="object"&&"value"in t?t:{value:t}}function U(t){let e=t+1,n="";for(;e>0;){let s=(e-1)%26;n=String.fromCharCode(65+s)+n,e=Math.floor((e-1)/26)}return n}function N(t,e,n){let s=D(t),a=`${U(n)}${e}`,o=s.style===void 0?"":` s="${s.style}"`;if(typeof s.value=="number"&&Number.isFinite(s.value))return`<c r="${a}"${o}><v>${s.value}</v></c>`;let i=s.value===null||s.value===""?"Not available":s.value;return`<c r="${a}" t="inlineStr"${o}><is><t>${H(i)}</t></is></c>`}function V(t){return`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetViews><sheetView workbookViewId="0"/></sheetViews>
  <sheetFormatPr defaultRowHeight="15"/>
  <cols><col min="1" max="8" width="22" customWidth="1"/></cols>
  <sheetData>${t.map((n,s)=>`<row r="${s+1}">${n.map((a,o)=>N(a,s+1,o)).join("")}</row>`).join("")}</sheetData>
</worksheet>`}function B(){return`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets><sheet name="Comps" sheetId="1" r:id="rId1"/></sheets>
</workbook>`}function j(){return`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`}function _(){return`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`}function z(){return`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>`}function O(){return`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="2"><font><sz val="11"/><name val="Aptos"/></font><font><b/><sz val="11"/><name val="Aptos"/></font></fonts>
  <fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FFEFE3C1"/><bgColor indexed="64"/></patternFill></fill></fills>
  <borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>
  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
  <cellXfs count="3"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/><xf numFmtId="0" fontId="1" fillId="1" borderId="0" xfId="0" applyFont="1" applyFill="1"/></cellXfs>
  <cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>`}function W(t,e){let n=t.evidence.comparableAnalysis.profileKey;return n==="bor"||n==="ptab"?e.improvementAv:e.av}function Y(t){let e=t.case.parcel,n=t.evidence.comparableAnalysis,s=t.evidence.savingsAssumptions;return[[{value:"Subject Property Summary",style:1}],["PIN",e.pinFormatted],["Class / Township",`${e.propertyClass} / ${e.townshipName}`],["Building Sqft",e.buildingSqft],["Total AV",e.currentAv],["Improvement AV",e.currentImprovementAv],["Implied Market Value",t.evidence.impliedMarketValue],[],[{value:"Comparable Exhibit",style:1}],[{value:"PIN",style:2},{value:"Sqft",style:2},{value:"Built Year",style:2},{value:"Assessment Year",style:2},{value:"Metric",style:2},{value:"Metric/sqft",style:2},{value:"Distance km",style:2}],...n.exhibit.map(a=>[a.comparable.pinFormatted,a.comparable.buildingSqft,a.comparable.yearBuilt,a.comparable.assessmentYear,W(t,a.comparable),a.avPerSqft,a.distanceKm]),[],[{value:"Analysis Stats",style:1}],["Pool size",n.poolSize],["Median metric/sqft",n.medianAvPerSqft],["Percentile",n.percentile],["Gap %",n.gapPct],[],[{value:"Savings Calculation",style:1}],["State equalizer",s.stateEqualizer],["Assumed tax rate",s.taxRate],["Low estimate",s.low],["Point estimate",s.point],["High estimate",s.high],["Formula","estimated savings = Delta AV x E x r, shown as a +/-20% range; not a promise"]]}function X(){let t=new Uint32Array(256);for(let e=0;e<256;e+=1){let n=e;for(let s=0;s<8;s+=1)n=n&1?3988292384^n>>>1:n>>>1;t[e]=n>>>0}return t}var K=X();function G(t){let e=4294967295;for(let n of t)e=e>>>8^(K[(e^n)&255]??0);return(e^4294967295)>>>0}function l(t,e){t.push(e&255,e>>>8&255)}function u(t,e){t.push(e&255,e>>>8&255,e>>>16&255,e>>>24&255)}function g(t,e){for(let n of e)t.push(n)}function Q(t){let e=[],n=[],s=t.map(o=>{let i=S.encode(o.text);return{path:o.path,data:i,crc:G(i)}});for(let o of s){let i=e.length,c=S.encode(o.path);u(e,67324752),l(e,20),l(e,0),l(e,0),l(e,0),l(e,0),u(e,o.crc),u(e,o.data.length),u(e,o.data.length),l(e,c.length),l(e,0),g(e,c),g(e,o.data),u(n,33639248),l(n,20),l(n,20),l(n,0),l(n,0),l(n,0),l(n,0),u(n,o.crc),u(n,o.data.length),u(n,o.data.length),l(n,c.length),l(n,0),l(n,0),l(n,0),l(n,0),u(n,0),u(n,i),g(n,c)}let a=e.length;return e.push(...n),u(e,101010256),l(e,0),l(e,0),l(e,s.length),l(e,s.length),u(e,n.length),u(e,a),l(e,0),new Uint8Array(e)}function E(t){return`appeal-compass-comps-${t.case.parcel.pin}.xlsx`}function L(t){return Q([{path:"[Content_Types].xml",text:z()},{path:"_rels/.rels",text:_()},{path:"xl/workbook.xml",text:B()},{path:"xl/_rels/workbook.xml.rels",text:j()},{path:"xl/styles.xml",text:O()},{path:"xl/worksheets/sheet1.xml",text:V(Y(t))}])}var F=document.querySelector("#app");if(!F)throw new Error("Missing app root.");var Z=F,J=new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}),ee="Appeal Compass is designed only for individual residential homeowners appealing their own home; entity-owned, commercial, and association properties are not supported and generally require an attorney.",te="Appeal Compass is busy helping other homeowners right now. You're in line \u2014 keep this page open and your assessment will start automatically.",ne="https://www.cookcountyassessoril.gov/exemptions",M="https://www.cookcountypropertyinfo.com/",C=0,d=null;function r(t){return String(t??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function y(t,e){return`<a href="${r(t)}" target="_blank" rel="noreferrer">${r(e)}<span class="sr-only"> (opens in new tab)</span></a>`}function f(t,e){C+=1;let n=`tooltip-${C}`;return`<span class="tooltip">
    <button class="tooltip-toggle" type="button" aria-label="${r(t)}" aria-expanded="false" aria-describedby="${n}">?</button>
    <span class="tooltip-bubble" id="${n}" role="tooltip" hidden>${r(e)}</span>
  </span>`}function A(t){let e=String(t??""),n=/https?:\/\/[^\s<>"']+/g,s="",a=0;for(let o of e.matchAll(n)){let i=o[0],c=o.index??0,T=i.match(/[.,;:)]+$/)?.[0]??"",$=i.slice(0,i.length-T.length);s+=r(e.slice(a,c)),s+=`<a href="${r($)}" target="_blank" rel="noreferrer">${r($)}<span class="sr-only"> (opens in new tab)</span></a>${r(T)}`,a=c+i.length}return s+r(e.slice(a))}function p(t){return t===null?"Not available":J.format(t)}function m(t,e=0){return t===null?"Not available":t.toLocaleString("en-US",{maximumFractionDigits:e})}async function R(t){let e=await fetch(t,{headers:{accept:"application/json"}}),n=await e.json();if(!e.ok||typeof n=="object"&&n&&"ok"in n&&n.ok===!1){let s=n.error?.message??"The request failed.";throw new Error(s)}return n}function w(t,e){let n=new FormData(t).get(e);return typeof n=="string"?n.trim():""}function se(t,e){let n=["jurisdiction","venue","ownershipType","assessorAppealFiled","assessorDecisionReceived","borAppealFiled","borDecisionReceived","borDecisionDate","purchasePrice","purchaseDate","appraisalValue","appraisalDate","actualSqft","actualAv","actualImprovementAv"];for(let s of n){let a=w(e,s);a&&t.set(s,a)}}function q(t){return`<section class="progress" aria-live="polite"><p>${r(t)}</p></section>`}function ae(){return`<svg aria-hidden="true" class="github-mark" viewBox="0 0 16 16" width="20" height="20">
    <path fill="currentColor" d="M8 0C3.58 0 0 3.67 0 8.2c0 3.62 2.29 6.69 5.47 7.78.4.08.55-.18.55-.39 0-.19-.01-.84-.01-1.53-2.01.38-2.53-.5-2.69-.96-.09-.24-.48-.96-.82-1.16-.28-.16-.68-.55-.01-.56.63-.01 1.08.59 1.23.84.72 1.24 1.87.89 2.33.68.07-.53.28-.89.51-1.09-1.78-.21-3.64-.91-3.64-4.04 0-.89.31-1.62.82-2.19-.08-.21-.36-1.04.08-2.16 0 0 .67-.22 2.2.84A7.43 7.43 0 0 1 8 3.98c.68 0 1.36.09 2 .28 1.53-1.06 2.2-.84 2.2-.84.44 1.12.16 1.95.08 2.16.51.57.82 1.3.82 2.19 0 3.14-1.87 3.83-3.65 4.04.29.26.54.76.54 1.54 0 1.11-.01 2-.01 2.27 0 .21.15.47.55.39A8.08 8.08 0 0 0 16 8.2C16 3.67 12.42 0 8 0Z"/>
  </svg>`}function re(){return`<footer class="site-footer">
    <p>Appeal Compass is an open-source project developed by <a href="https://github.com/tommasodesantis" target="_blank" rel="noreferrer">Tommaso De Santis<span class="sr-only"> (opens in new tab)</span></a> under GPLv3.</p>
    <a class="footer-icon-link" href="https://github.com/tommasodesantis/appealcompass" target="_blank" rel="noreferrer">${ae()}<span>View on GitHub</span><span class="sr-only"> (opens in new tab)</span></a>
    <a href="https://ko-fi.com/tomdesantis" target="_blank" rel="noreferrer">Donations help the project grow and cover hosting and maintenance costs.<span class="sr-only"> (opens in new tab)</span></a>
  </footer>`}function oe(t=null){let e=t?[t]:["Looking up your property...","Fetching assessment history...","Finding similar homes...","Building the evidence summary..."],n=0,s=e[0]??"",a=document.querySelector("#progress");a&&(a.innerHTML=q(e[n]??s));let o=window.setInterval(()=>{n=(n+1)%e.length;let i=document.querySelector("#progress");i&&(i.innerHTML=q(e[n]??s))},650);return()=>window.clearInterval(o)}async function ie(){try{let t=await R("/api/queue");return t.busy?t.message??te:null}catch{return null}}function le(){Z.innerHTML=`
    <header class="topline">
      <h1>Appeal Compass</h1>
      <p class="lede">Enter a PIN. A PIN is the 14-digit parcel number on your assessment notice, tax bill, or property record card.</p>
    </header>

    <section class="panel" aria-labelledby="step-one">
      <div class="step-label">Step 1</div>
      <h2 id="step-one">Find the property</h2>
      <form id="case-form" class="stack">
        <div id="form-error" aria-live="polite"></div>
        <label>
          <span>Jurisdiction</span>
          <select name="jurisdiction" required>
            <option value="cook_county_il" selected>Cook County, Illinois</option>
          </select>
        </label>
        <p class="hint">More jurisdictions may be added - this is an open-source project.</p>
        <div class="lookup-grid">
          <label>
            <span>PIN</span>
            <input name="pin" autocomplete="off" inputmode="numeric" placeholder="03-00-000-000-0001" required>
          </label>
        </div>
        <p class="hint pin-help">Don't know your PIN? You can recover it from the ${y(M,"Cook County Property Tax Portal")}.</p>

        <fieldset class="question-group">
          <legend>Ownership type</legend>
          <label>
            <span>Who owns the property?</span>
            <select name="ownershipType" required>
              <option value="">Choose ownership type</option>
              <option value="individual">Individual</option>
              <option value="llc">LLC</option>
              <option value="corporation">Corporation</option>
              <option value="other">Other entity</option>
            </select>
          </label>
        </fieldset>

        <fieldset class="question-group">
          <legend>Assessor appeal status</legend>
          <p>Have you already filed an Assessor appeal for this year?</p>
          <div class="choice-row">
            <label><input type="radio" name="assessorAppealFiled" value="yes" required><span>Yes</span></label>
            <label><input type="radio" name="assessorAppealFiled" value="no" required><span>No</span></label>
          </div>
          <div class="conditional" data-conditional="assessorDecision" hidden>
            <p>Have you already received the Assessor decision?</p>
            <div class="choice-row">
              <label><input type="radio" name="assessorDecisionReceived" value="yes"><span>Yes</span></label>
              <label><input type="radio" name="assessorDecisionReceived" value="no"><span>No</span></label>
            </div>
          </div>
        </fieldset>

        <fieldset class="question-group">
          <legend>Board of Review appeal status</legend>
          <p>Have you already filed a Board of Review appeal for this year?</p>
          <div class="choice-row">
            <label><input type="radio" name="borAppealFiled" value="yes" required><span>Yes</span></label>
            <label><input type="radio" name="borAppealFiled" value="no" required><span>No</span></label>
          </div>
          <div class="conditional" data-conditional="borDecision" hidden>
            <p>Have you already received the BOR decision?</p>
            <div class="choice-row">
              <label><input type="radio" name="borDecisionReceived" value="yes"><span>Yes</span></label>
              <label><input type="radio" name="borDecisionReceived" value="no"><span>No</span></label>
            </div>
          </div>
          <div class="conditional" data-conditional="borDecisionDate" hidden>
            <label>
              <span>BOR decision date</span>
              <input name="borDecisionDate" type="date">
            </label>
          </div>
        </fieldset>

        <details class="evidence">
          <summary>Add your own evidence</summary>
          <div class="evidence-grid">
            <label>
              <span>Venue</span>
              <select name="venue">
                <option value="auto">Auto-route</option>
                <option value="assessor">Assessor</option>
                <option value="bor">Board of Review</option>
                <option value="ptab">PTAB</option>
              </select>
            </label>
            <label>
              <span>Purchase price</span>
              <input name="purchasePrice" inputmode="decimal" data-evidence-input>
            </label>
            <label>
              <span>Purchase date</span>
              <input name="purchaseDate" type="date" data-evidence-input>
            </label>
            <label>
              <span>Appraisal value</span>
              <input name="appraisalValue" inputmode="decimal" data-evidence-input>
            </label>
            <label>
              <span>Appraisal date</span>
              <input name="appraisalDate" type="date" data-evidence-input>
            </label>
            <label>
              <span>Actual sqft</span>
              <input name="actualSqft" inputmode="decimal" aria-describedby="actual-help" data-evidence-input>
            </label>
            <label>
              <span>Actual total AV</span>
              <input name="actualAv" inputmode="decimal" data-evidence-input>
            </label>
            <label>
              <span>Actual improvement AV</span>
              <input name="actualImprovementAv" inputmode="decimal" data-evidence-input>
            </label>
          </div>
          <p id="actual-help" class="hint">User-supplied values are labeled documentation-required and are used only when official public data is missing.</p>
          <button type="button" id="clear-evidence" class="secondary">Clear evidence</button>
        </details>

        <div class="actions">
          <button type="submit">Review my case</button>
        </div>
      </form>
    </section>

    <div id="progress"></div>
    <div id="results"></div>
    ${re()}
  `}function b(t){let e=document.querySelector("#form-error");e&&(e.innerHTML=t?`<section class="error inline-error" role="alert">${r(t)}</section>`:"")}function h(t,e){let n=new FormData(t).get(e);return typeof n=="string"?n:""}function v(t,e,n){let s=t.querySelector(`[data-conditional="${e}"]`);if(s){s.hidden=!n;for(let a of Array.from(s.querySelectorAll("input, select, textarea"))){if(!(a instanceof HTMLInputElement||a instanceof HTMLSelectElement||a instanceof HTMLTextAreaElement))continue;let o=a;o.disabled=!n,o.required=n,n||(o instanceof HTMLInputElement&&o.type==="radio"?o.checked=!1:o.value="")}}}function x(t){let e=h(t,"assessorAppealFiled")==="yes",n=h(t,"borAppealFiled")==="yes",s=h(t,"borDecisionReceived")==="yes";v(t,"assessorDecision",e),v(t,"borDecision",n),v(t,"borDecisionDate",n&&s)}function ce(t){return b(""),x(t),t.reportValidity()?w(t,"ownershipType")!=="individual"?(b(ee),!1):!0:!1}function ue(t){return t.length===0?"":`<section class="warnings" aria-label="Warnings"><h2>Warnings</h2><ul>${t.map(e=>`<li>${A(e)}</li>`).join("")}</ul></section>`}function pe(){return`<section class="panel" aria-labelledby="exemptions">
    <h2 id="exemptions">Exemptions and past-year corrections</h2>
    <p>Exemptions are fixed reductions in taxable value for owner-occupants, seniors, veterans, people with disabilities, and some other homeowners. They can be worth more than an appeal.</p>
    <p>Check your exemptions on the ${y(ne,"Cook County Assessor exemptions page")} and the ${y(M,"Cook County Property Tax Portal")}. Bring documentation for any missing or incorrect exemption.</p>
    <p>A Certificate of Error is a Cook County process to fix past-year mistakes - like a missed exemption or wrong property facts - which can lead to a refund. Ask the Assessor's office about it.</p>
  </section>`}function de(t){let e=t.routing,n=e.officialUrl?`<a href="${r(e.officialUrl)}" target="_blank" rel="noreferrer">Verify at the official source before filing</a>`:"";if(!e.deadline)return`<p>No computed deadline. ${n}</p>`;let s=e.daysRemaining===null?"":` ${e.daysRemaining>=0?`${e.daysRemaining} days remaining.`:`${Math.abs(e.daysRemaining)} days past the computed deadline.`}`;return`<p><strong>Deadline:</strong> ${r(e.deadline)}.${r(s)} ${n}</p>`}function me(t){let e=t.evidence.comparableAnalysis,n=f("What comparable profile means",'A "profile" is the set of matching rules this tool uses to pick similar homes for the specific venue: size, age, neighborhood, and which assessment number is compared, because each venue weighs comparables differently.'),s=e.status==="ok"?`<p>Comparable analysis completed with the ${r(e.profileLabel)} profile ${n} using ${r(e.metricLabel)} per square foot.</p>`:`<p>${r(e.note)}</p>`,a=e.exhibit.map(i=>{let c=e.profileLabel.includes("Assessor")||t.routing.venue==="closed"?i.comparable.av:i.comparable.improvementAv;return`<tr>
        <td>${r(i.comparable.pinFormatted)}</td>
        <td>${m(i.comparable.buildingSqft)}</td>
        <td>${r(i.comparable.yearBuilt??"Not available")}</td>
        <td>${r(i.comparable.assessmentYear??"Not available")}</td>
        <td>${p(c)}</td>
        <td>${p(i.avPerSqft)}</td>
      </tr>`}).join(""),o=a.length===0?"<p>No lower-assessed comparable exhibit is available from the current public data.</p>":`<div class="table-wrap"><table>
          <thead><tr><th>PIN</th><th>Sqft</th><th>Built Year</th><th>Assessment Year</th><th>Metric</th><th>Metric/sqft</th></tr></thead>
          <tbody>${a}</tbody>
        </table></div>`;return`<section class="panel" aria-labelledby="step-four">
    <div class="step-label">Step 4</div>
    <h2 id="step-four">Evidence summary</h2>
    <p class="metric-line"><strong>Tier:</strong> ${r(t.evidence.tier)} ${f("What tier means","The tier is a rough screen of how much public data supports spending time on an appeal.")}. ${r(t.evidence.tierMessage)}</p>
    ${s}
    <p><strong>Pool:</strong> ${m(e.poolSize)} similar homes, ${r(e.scope??"no scope")}; subject ${r(e.metricLabel)}/sqft ${p(e.subjectAvPerSqft)}; median ${p(e.medianAvPerSqft)}; gap ${m(e.gapPct,1)}%.</p>
    ${o}
    <h3 class="heading-with-tooltip">Arguments ${f("What arguments mean","An argument is a distinct reason the assessment may be too high: uniformity, overvaluation, description error, or assessment shock. Strength labels are rough screens, not legal conclusions.")}</h3>
    ${t.evidence.arguments.length?`<ul>${t.evidence.arguments.map(i=>`<li><strong>${r(i.argumentType)}:</strong> ${r(i.text)}</li>`).join("")}</ul>`:"<p>No strong public-data argument was found. Add sale, appraisal, condition, or factual-error evidence if available.</p>"}
    <h3 class="heading-with-tooltip">Rough savings estimate ${f("How rough savings are estimated","Estimated savings = \u0394AV \xD7 E \xD7 r, where \u0394AV is the assessed-value reduction, E is the state equalizer, and r is the assumed tax rate. The range is shown as \xB120% and is not a promise.")}</h3>
    <p>${p(t.evidence.savingsAssumptions.low)} to ${p(t.evidence.savingsAssumptions.high)}, with point estimate ${p(t.evidence.savingsAssumptions.point)}.</p>
    <p class="hint">Assumes equalizer ${t.evidence.savingsAssumptions.stateEqualizer} and tax rate ${(t.evidence.savingsAssumptions.taxRate*100).toFixed(2)}%; this is a rough range, not a promise.</p>
  </section>`}function fe(t,e){d=t;let n=t.case.parcel,s=[n.address,n.city,n.zipCode].filter(Boolean).join(", "),a=[t.case.userEvidence.actualSqft?`Actual sqft ${m(t.case.userEvidence.actualSqft)}`:"",t.case.userEvidence.actualAv?`Actual AV ${p(t.case.userEvidence.actualAv)}`:"",t.case.userEvidence.actualImprovementAv?`Actual improvement AV ${p(t.case.userEvidence.actualImprovementAv)}`:""].filter(Boolean),o=new URLSearchParams(e);o.set("pin",n.pin),t.demo&&o.set("demo","1");let i=document.querySelector("#results");i&&(i.innerHTML=`
    <section class="notice"><strong>${r(t.evidence.disclaimers[0])}</strong></section>
    <section class="panel" aria-labelledby="step-three">
      <div class="step-label">Step 3</div>
      <h2 id="step-three">Routing decision</h2>
      <p class="headline">${r(t.routing.headline)}</p>
      ${de(t)}
      <ul>${t.routing.reasoning.map(c=>`<li>${A(c)}</li>`).join("")}</ul>
    </section>

    <section class="subject panel">
      <h2>Subject property</h2>
      <dl>
        <div><dt>PIN</dt><dd>${r(n.pinFormatted)}</dd></div>
        ${s?`<div><dt>Address</dt><dd>${r(s)}</dd></div>`:""}
        <div><dt>Class / township</dt><dd>${r(n.propertyClass)} / ${r(n.townshipName)}</dd></div>
        <div><dt>Building sqft</dt><dd>${m(n.buildingSqft)}</dd></div>
        <div><dt>Total AV</dt><dd>${p(n.currentAv)}</dd></div>
        <div><dt>Improvement AV</dt><dd>${p(n.currentImprovementAv)}</dd></div>
      </dl>
      ${a.length?`<p class="tagline">${r(a.join("; "))} - user-supplied; documentation required.</p>`:""}
    </section>

    ${me(t)}

    <section class="panel" aria-labelledby="step-five">
      <div class="step-label">Step 5</div>
      <h2 id="step-five">${r(t.venue.name)} checklist</h2>
      <p class="hint">Use this checklist to assemble documents before filing at the official venue.</p>
      <ul>${t.venue.checklist.map(c=>`<li>${A(c)}</li>`).join("")}</ul>
      <div class="actions">
        <a class="button-link" href="/print?${o.toString()}">Print / Save as PDF</a>
        <button type="button" id="download-comps" class="secondary">Download comps (.xlsx)</button>
      </div>
    </section>

    ${pe()}

    ${ue(t.warnings)}
  `)}function I(){d=null,b("");for(let t of["#results","#address-results"]){let e=document.querySelector(t);e&&(e.innerHTML="")}}async function be(t){I();let e=oe(await ie());try{let n=await R(`/api/case?${t.toString()}`);I(),fe(n,t)}catch(n){let s=document.querySelector("#results");s&&(s.innerHTML=`<section class="error" role="alert">${r(n instanceof Error?n.message:"The case could not be loaded.")}</section>`)}finally{e();let n=document.querySelector("#progress");n&&(n.innerHTML="")}}async function ge(t){if(!ce(t))return;let e=new URLSearchParams,n=w(t,"pin");if(se(e,t),n){e.set("pin",n),await be(e);return}let s=document.querySelector("#results");s&&(s.innerHTML='<section class="error" role="alert">Enter a PIN.</section>')}function he(){let t=document.querySelector("details.evidence");if(t)for(let e of Array.from(t.querySelectorAll("[data-evidence-input]")))(e instanceof HTMLInputElement||e instanceof HTMLTextAreaElement)&&(e.value="")}function k(t=null){for(let e of Array.from(document.querySelectorAll(".tooltip-toggle"))){if(e===t)continue;let n=e.getAttribute("aria-describedby"),s=n?document.getElementById(n):null;e.setAttribute("aria-expanded","false"),s&&(s.hidden=!0)}}function ve(t){let e=t.getAttribute("aria-describedby"),n=e?document.getElementById(e):null;if(!n)return;let s=t.getAttribute("aria-expanded")!=="true";k(s?t:null),t.setAttribute("aria-expanded",String(s)),n.hidden=!s}function ye(){if(!d)return;let t=L(d),e=new ArrayBuffer(t.byteLength);new Uint8Array(e).set(t);let n=new Blob([e],{type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}),s=URL.createObjectURL(n),a=document.createElement("a");a.href=s,a.download=E(d),document.body.appendChild(a),a.click(),a.remove(),URL.revokeObjectURL(s)}le();var P=document.querySelector("#case-form");P&&x(P);document.addEventListener("submit",t=>{let e=t.target;e instanceof HTMLFormElement&&e.id==="case-form"&&(t.preventDefault(),ge(e))});document.addEventListener("change",t=>{let e=t.target;if(e instanceof HTMLInputElement||e instanceof HTMLSelectElement||e instanceof HTMLTextAreaElement){let n=e.form;n?.id==="case-form"&&(b(""),x(n))}});document.addEventListener("click",t=>{let e=t.target;if(e instanceof HTMLElement){let n=e.closest(".tooltip-toggle");if(n){ve(n);return}k()}e instanceof HTMLElement&&e.id==="clear-evidence"&&he(),e instanceof HTMLElement&&e.id==="download-comps"&&ye()});document.addEventListener("keydown",t=>{t.key==="Escape"&&k()});document.documentElement.dataset.enhanced="true";
