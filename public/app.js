var v="";var P=new TextEncoder;function _(t){return String(t??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function V(t){return t&&typeof t=="object"&&"value"in t?t:{value:t}}function B(t){let e=t+1,n="";for(;e>0;){let s=(e-1)%26;n=String.fromCharCode(65+s)+n,e=Math.floor((e-1)/26)}return n}function j(t,e,n){let s=V(t),r=`${B(n)}${e}`,a=s.style===void 0?"":` s="${s.style}"`;if(typeof s.value=="number"&&Number.isFinite(s.value))return`<c r="${r}"${a}><v>${s.value}</v></c>`;let i=s.value===null||s.value===""?"Not available":s.value;return`<c r="${r}" t="inlineStr"${a}><is><t>${_(i)}</t></is></c>`}function O(t){return`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetViews><sheetView workbookViewId="0"/></sheetViews>
  <sheetFormatPr defaultRowHeight="15"/>
  <cols><col min="1" max="8" width="22" customWidth="1"/></cols>
  <sheetData>${t.map((n,s)=>`<row r="${s+1}">${n.map((r,a)=>j(r,s+1,a)).join("")}</row>`).join("")}</sheetData>
</worksheet>`}function W(){return`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets><sheet name="Comps" sheetId="1" r:id="rId1"/></sheets>
</workbook>`}function z(){return`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`}function Y(){return`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`}function X(){return`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>`}function K(){return`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="2"><font><sz val="11"/><name val="Aptos"/></font><font><b/><sz val="11"/><name val="Aptos"/></font></fonts>
  <fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FFEFE3C1"/><bgColor indexed="64"/></patternFill></fill></fills>
  <borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>
  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
  <cellXfs count="3"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/><xf numFmtId="0" fontId="1" fillId="1" borderId="0" xfId="0" applyFont="1" applyFill="1"/></cellXfs>
  <cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>`}function G(t,e){let n=t.evidence.comparableAnalysis.profileKey;return n==="bor"||n==="ptab"?e.improvementAv:e.av}function Q(t){let e=t.case.parcel,n=t.evidence.comparableAnalysis,s=t.evidence.savingsAssumptions;return[[{value:"Subject Property Summary",style:1}],["PIN",e.pinFormatted],["Class / Township",`${e.propertyClass} / ${e.townshipName}`],["Building Sqft",e.buildingSqft],["Total AV",e.currentAv],["Improvement AV",e.currentImprovementAv],["Implied Market Value",t.evidence.impliedMarketValue],[],[{value:"Comparable Exhibit",style:1}],[{value:"PIN",style:2},{value:"Sqft",style:2},{value:"Built Year",style:2},{value:"Assessment Year",style:2},{value:"Metric",style:2},{value:"Metric/sqft",style:2},{value:"Distance km",style:2}],...n.exhibit.map(r=>[r.comparable.pinFormatted,r.comparable.buildingSqft,r.comparable.yearBuilt,r.comparable.assessmentYear,G(t,r.comparable),r.avPerSqft,r.distanceKm]),[],[{value:"Analysis Stats",style:1}],["Pool size",n.poolSize],["Median metric/sqft",n.medianAvPerSqft],["Percentile",n.percentile],["Gap %",n.gapPct],[],[{value:"Savings Calculation",style:1}],["State equalizer",s.stateEqualizer],["Assumed tax rate",s.taxRate],["Low estimate",s.low],["Point estimate",s.point],["High estimate",s.high],["Formula","estimated savings = Delta AV x E x r, shown as a +/-20% range; not a promise"]]}function J(){let t=new Uint32Array(256);for(let e=0;e<256;e+=1){let n=e;for(let s=0;s<8;s+=1)n=n&1?3988292384^n>>>1:n>>>1;t[e]=n>>>0}return t}var Z=J();function ee(t){let e=4294967295;for(let n of t)e=e>>>8^(Z[(e^n)&255]??0);return(e^4294967295)>>>0}function l(t,e){t.push(e&255,e>>>8&255)}function p(t,e){t.push(e&255,e>>>8&255,e>>>16&255,e>>>24&255)}function y(t,e){for(let n of e)t.push(n)}function te(t){let e=[],n=[],s=t.map(a=>{let i=P.encode(a.text);return{path:a.path,data:i,crc:ee(i)}});for(let a of s){let i=e.length,c=P.encode(a.path);p(e,67324752),l(e,20),l(e,0),l(e,0),l(e,0),l(e,0),p(e,a.crc),p(e,a.data.length),p(e,a.data.length),l(e,c.length),l(e,0),y(e,c),y(e,a.data),p(n,33639248),l(n,20),l(n,20),l(n,0),l(n,0),l(n,0),l(n,0),p(n,a.crc),p(n,a.data.length),p(n,a.data.length),l(n,c.length),l(n,0),l(n,0),l(n,0),l(n,0),p(n,0),p(n,i),y(n,c)}let r=e.length;return e.push(...n),p(e,101010256),l(e,0),l(e,0),l(e,s.length),l(e,s.length),p(e,n.length),p(e,r),l(e,0),new Uint8Array(e)}function I(t){return`appeal-compass-comps-${t.case.parcel.pin}.xlsx`}function q(t){return te([{path:"[Content_Types].xml",text:X()},{path:"_rels/.rels",text:Y()},{path:"xl/workbook.xml",text:W()},{path:"xl/_rels/workbook.xml.rels",text:z()},{path:"xl/styles.xml",text:K()},{path:"xl/worksheets/sheet1.xml",text:O(Q(t))}])}var R=document.querySelector("#app");if(!R)throw new Error("Missing app root.");var ne=R,se=new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}),re="Appeal Compass is designed only for individual residential homeowners appealing their own home; entity-owned, commercial, and association properties are not supported and generally require an attorney.",oe="Appeal Compass is busy helping other homeowners right now. You're in line \u2014 keep this page open and your assessment will start automatically.",ae="https://www.cookcountyassessoril.gov/exemptions",D="https://www.cookcountypropertyinfo.com/",b=v.length>0,C=0,d=null;function o(t){return String(t??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function A(t,e){return`<a href="${o(t)}" target="_blank" rel="noreferrer">${o(e)}<span class="sr-only"> (opens in new tab)</span></a>`}function g(t,e){C+=1;let n=`tooltip-${C}`;return`<span class="tooltip">
    <button class="tooltip-toggle" type="button" aria-label="${o(t)}" aria-expanded="false" aria-describedby="${n}">?</button>
    <span class="tooltip-bubble" id="${n}" role="tooltip" hidden>${o(e)}</span>
  </span>`}function T(t){let e=String(t??""),n=/https?:\/\/[^\s<>"']+/g,s="",r=0;for(let a of e.matchAll(n)){let i=a[0],c=a.index??0,E=i.match(/[.,;:)]+$/)?.[0]??"",L=i.slice(0,i.length-E.length);s+=o(e.slice(r,c)),s+=`<a href="${o(L)}" target="_blank" rel="noreferrer">${o(L)}<span class="sr-only"> (opens in new tab)</span></a>${o(E)}`,r=c+i.length}return s+o(e.slice(r))}function u(t){return t===null?"Not available":se.format(t)}function f(t,e=0){return t===null?"Not available":t.toLocaleString("en-US",{maximumFractionDigits:e})}async function U(t){let e=await fetch(t,{headers:{accept:"application/json"}}),n=await e.json();if(!e.ok||typeof n=="object"&&n&&"ok"in n&&n.ok===!1){let s=n.error?.message??"The request failed.";throw new Error(s)}return n}function k(t,e){let n=new FormData(t).get(e);return typeof n=="string"?n.trim():""}function ie(t,e){let n=["jurisdiction","venue","ownershipType","assessorAppealFiled","assessorDecisionReceived","borAppealFiled","borDecisionReceived","borDecisionDate","purchasePrice","purchaseDate","appraisalValue","appraisalDate","actualSqft","actualAv","actualImprovementAv"];for(let s of n){let r=k(e,s);r&&t.set(s,r)}}function M(t){return`<section class="progress" aria-live="polite"><p>${o(t)}</p></section>`}function N(){return`<svg aria-hidden="true" class="github-mark" viewBox="0 0 16 16" width="20" height="20">
    <path fill="currentColor" d="M8 0C3.58 0 0 3.67 0 8.2c0 3.62 2.29 6.69 5.47 7.78.4.08.55-.18.55-.39 0-.19-.01-.84-.01-1.53-2.01.38-2.53-.5-2.69-.96-.09-.24-.48-.96-.82-1.16-.28-.16-.68-.55-.01-.56.63-.01 1.08.59 1.23.84.72 1.24 1.87.89 2.33.68.07-.53.28-.89.51-1.09-1.78-.21-3.64-.91-3.64-4.04 0-.89.31-1.62.82-2.19-.08-.21-.36-1.04.08-2.16 0 0 .67-.22 2.2.84A7.43 7.43 0 0 1 8 3.98c.68 0 1.36.09 2 .28 1.53-1.06 2.2-.84 2.2-.84.44 1.12.16 1.95.08 2.16.51.57.82 1.3.82 2.19 0 3.14-1.87 3.83-3.65 4.04.29.26.54.76.54 1.54 0 1.11-.01 2-.01 2.27 0 .21.15.47.55.39A8.08 8.08 0 0 0 16 8.2C16 3.67 12.42 0 8 0Z"/>
  </svg>`}function le(){return`<footer class="site-footer">
    <p class="project-credit">Appeal Compass is an open-source project developed by <a href="https://github.com/tommasodesantis" target="_blank" rel="noreferrer">Tommaso De Santis<span class="sr-only"> (opens in new tab)</span></a> under GPLv3.</p>
    <a class="footer-icon-link" href="https://github.com/tommasodesantis/appealcompass" target="_blank" rel="noreferrer">${N()}<span>View on GitHub</span><span class="sr-only"> (opens in new tab)</span></a>
    <a href="https://ko-fi.com/tomdesantis" target="_blank" rel="noreferrer">Donations help the project grow and cover hosting and maintenance costs.<span class="sr-only"> (opens in new tab)</span></a>
    <button type="button" id="report-problem" class="link-button">Report a problem</button>
  </footer>`}function ce(){return`<a class="header-icon-link" href="https://github.com/tommasodesantis/appealcompass" target="_blank" rel="noreferrer">${N()}<span>View on GitHub</span><span class="sr-only"> (opens in new tab)</span></a>`}function pe(){let t=b?"":" disabled",e=b?`<div class="cf-turnstile" data-sitekey="${o(v)}"></div>`:'<p class="hint">Problem reporting is disabled until the Turnstile site key is configured.</p>';return`<section id="report-panel" class="report-panel" hidden>
    <div class="report-card" role="dialog" aria-modal="true" aria-labelledby="report-title">
      <button type="button" id="close-report" class="secondary close-button">Close</button>
      <h2 id="report-title">Report a problem</h2>
      <form id="report-form" class="stack">
        <label>
          <span>Category</span>
          <select name="category" required${t}>
            <option value="">Choose a category</option>
            <option value="wrong_deadline">Wrong deadline</option>
            <option value="wrong_jurisdiction">Wrong jurisdiction info</option>
            <option value="wrong_comparables">Wrong comparables</option>
            <option value="wrong_assessment_data">Wrong assessment data</option>
            <option value="feature_request">Feature request</option>
          </select>
        </label>
        <label>
          <span>Description</span>
          <textarea name="description" rows="5" maxlength="4000" required${t}></textarea>
        </label>
        <label>
          <span>Optional PIN/context</span>
          <input name="context" id="report-context" maxlength="2000"${t}>
        </label>
        ${e}
        <div id="report-status" aria-live="polite"></div>
        <button type="submit"${t}>Submit report</button>
      </form>
    </div>
  </section>`}function ue(t=null){let e=t?[t]:["Looking up your property...","Fetching assessment history...","Finding similar homes...","Building the evidence summary..."],n=0,s=e[0]??"",r=document.querySelector("#progress");r&&(r.innerHTML=M(e[n]??s));let a=window.setInterval(()=>{n=(n+1)%e.length;let i=document.querySelector("#progress");i&&(i.innerHTML=M(e[n]??s))},650);return()=>window.clearInterval(a)}async function de(){try{let t=await U("/api/queue");return t.busy?t.message??oe:null}catch{return null}}function me(){ne.innerHTML=`
    <header class="topline">
      <div class="topline-head">
        <h1>Appeal Compass</h1>
        ${ce()}
      </div>
      <details class="tool-description">
        <summary>What this tool does</summary>
        <p>Appeal Compass screens public data for residential property-tax appeal evidence. It is open-source and currently runs on donations. <a href="https://ko-fi.com/tomdesantis" target="_blank" rel="noreferrer">Support it on Ko-fi<span class="sr-only"> (opens in new tab)</span></a>.</p>
      </details>
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
        <p class="hint">More jurisdictions will be added.</p>
        <div class="lookup-grid">
          <label>
            <span>PIN</span>
            <input name="pin" autocomplete="off" inputmode="numeric" placeholder="03-00-000-000-0001" required>
          </label>
        </div>
        <p class="hint pin-help">Don't know your PIN? You can recover it from the ${A(D,"Cook County Property Tax Portal")}.</p>

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
    ${le()}
    ${pe()}
  `}function h(t){let e=document.querySelector("#form-error");e&&(e.innerHTML=t?`<section class="error inline-error" role="alert">${o(t)}</section>`:"")}function m(t,e=!1){let n=document.querySelector("#report-status");n&&(n.innerHTML=t?`<p class="${e?"error inline-error":"notice inline-error"}">${o(t)}</p>`:"")}function fe(){let t=document.querySelector("#report-panel"),e=document.querySelector("#report-context");if(!t)return;e&&d&&(e.value=`PIN ${d.case.parcel.pinFormatted}; venue ${d.routing.venue}; generated ${d.generatedAt}`),m(b?"":"Problem reporting is disabled until the Turnstile site key is configured.",!0),t.hidden=!1,t.querySelector("select, textarea, input, button")?.focus()}function ge(){let t=document.querySelector("#report-panel");t&&(t.hidden=!0)}function x(t,e){let n=new FormData(t).get(e);return typeof n=="string"?n:""}function w(t,e,n){let s=t.querySelector(`[data-conditional="${e}"]`);if(s){s.hidden=!n;for(let r of Array.from(s.querySelectorAll("input, select, textarea"))){if(!(r instanceof HTMLInputElement||r instanceof HTMLSelectElement||r instanceof HTMLTextAreaElement))continue;let a=r;a.disabled=!n,a.required=n,n||(a instanceof HTMLInputElement&&a.type==="radio"?a.checked=!1:a.value="")}}}function $(t){let e=x(t,"assessorAppealFiled")==="yes",n=x(t,"borAppealFiled")==="yes",s=x(t,"borDecisionReceived")==="yes";w(t,"assessorDecision",e),w(t,"borDecision",n),w(t,"borDecisionDate",n&&s)}function be(t){return h(""),$(t),t.reportValidity()?k(t,"ownershipType")!=="individual"?(h(re),!1):!0:!1}function he(t){return t.length===0?"":`<section class="warnings" aria-label="Warnings"><h2>Warnings</h2><ul>${t.map(e=>`<li>${T(e)}</li>`).join("")}</ul></section>`}function ve(){return`<section class="panel" aria-labelledby="exemptions">
    <h2 id="exemptions">Exemptions and past-year corrections</h2>
    <p>Exemptions are fixed reductions in taxable value for owner-occupants, seniors, veterans, people with disabilities, and some other homeowners. They can be worth more than an appeal.</p>
    <p>Check your exemptions on the ${A(ae,"Cook County Assessor exemptions page")} and the ${A(D,"Cook County Property Tax Portal")}. Bring documentation for any missing or incorrect exemption.</p>
    <p>A Certificate of Error is a Cook County process to fix past-year mistakes - like a missed exemption or wrong property facts - which can lead to a refund. Ask the Assessor's office about it.</p>
  </section>`}function ye(t){let e=t.routing,n=e.officialUrl?`<a href="${o(e.officialUrl)}" target="_blank" rel="noreferrer">Verify at the official source before filing</a>`:"";if(!e.deadline)return`<p>No computed deadline. ${n}</p>`;let s=e.daysRemaining===null?"":` ${e.daysRemaining>=0?`${e.daysRemaining} days remaining.`:`${Math.abs(e.daysRemaining)} days past the computed deadline.`}`;return`<p><strong>Deadline:</strong> ${o(e.deadline)}.${o(s)} ${n}</p>`}function xe(t){let e=t.evidence.comparableAnalysis,n=g("What comparable profile means",'A "profile" is the set of matching rules this tool uses to pick similar homes for the specific venue: size, age, neighborhood, and which assessment number is compared, because each venue weighs comparables differently.'),s=e.status==="ok"?`<p>Comparable analysis completed with the ${o(e.profileLabel)} profile using ${o(e.metricLabel)} per square foot. ${n}</p>`:`<p>${o(e.note)}</p>`,r=e.exhibit.map(i=>{let c=e.profileLabel.includes("Assessor")||t.routing.venue==="closed"?i.comparable.av:i.comparable.improvementAv;return`<tr>
        <td>${o(i.comparable.pinFormatted)}</td>
        <td>${f(i.comparable.buildingSqft)}</td>
        <td>${o(i.comparable.yearBuilt??"Not available")}</td>
        <td>${o(i.comparable.assessmentYear??"Not available")}</td>
        <td>${u(c)}</td>
        <td>${u(i.avPerSqft)}</td>
      </tr>`}).join(""),a=r.length===0?"<p>No lower-assessed comparable exhibit is available from the current public data.</p>":`<div class="table-wrap"><table>
          <thead><tr><th>PIN</th><th>Sqft</th><th>Built Year</th><th>Assessment Year</th><th>Metric</th><th>Metric/sqft</th></tr></thead>
          <tbody>${r}</tbody>
        </table></div>`;return`<section class="panel" aria-labelledby="step-four">
    <div class="step-label">Step 4</div>
    <h2 id="step-four">Evidence summary</h2>
    <p class="metric-line"><strong>Tier:</strong> ${o(t.evidence.tier)}. ${o(t.evidence.tierMessage)} ${g("What tier means","The tier is a rough screen of how much public data supports spending time on an appeal.")}</p>
    ${s}
    <p><strong>Pool:</strong> ${f(e.poolSize)} similar homes, ${o(e.scope??"no scope")}; subject ${o(e.metricLabel)}/sqft ${u(e.subjectAvPerSqft)}; median ${u(e.medianAvPerSqft)}; gap ${f(e.gapPct,1)}%.</p>
    ${a}
    <h3 class="heading-with-tooltip">Arguments ${g("What arguments mean","An argument is a distinct reason the assessment may be too high: uniformity, overvaluation, description error, or assessment shock. Strength labels are rough screens, not legal conclusions.")}</h3>
    ${t.evidence.arguments.length?`<ul>${t.evidence.arguments.map(i=>`<li><strong>${o(i.argumentType)}:</strong> ${o(i.text)}</li>`).join("")}</ul>`:"<p>No strong public-data argument was found. Add sale, appraisal, condition, or factual-error evidence if available.</p>"}
    <h3 class="heading-with-tooltip">Rough savings estimate ${g("How rough savings are estimated","Estimated savings = \u0394AV \xD7 E \xD7 r, where \u0394AV is the assessed-value reduction, E is the state equalizer, and r is the assumed tax rate. The range is shown as \xB120% and is not a promise.")}</h3>
    <p>${u(t.evidence.savingsAssumptions.low)} to ${u(t.evidence.savingsAssumptions.high)}, with point estimate ${u(t.evidence.savingsAssumptions.point)}.</p>
    <p class="hint">Assumes equalizer ${t.evidence.savingsAssumptions.stateEqualizer} and tax rate ${(t.evidence.savingsAssumptions.taxRate*100).toFixed(2)}%; this is a rough range, not a promise.</p>
  </section>`}function we(t,e){d=t;let n=t.case.parcel,s=[n.address,n.city,n.zipCode].filter(Boolean).join(", "),r=[t.case.userEvidence.actualSqft?`Actual sqft ${f(t.case.userEvidence.actualSqft)}`:"",t.case.userEvidence.actualAv?`Actual AV ${u(t.case.userEvidence.actualAv)}`:"",t.case.userEvidence.actualImprovementAv?`Actual improvement AV ${u(t.case.userEvidence.actualImprovementAv)}`:""].filter(Boolean),a=new URLSearchParams(e);a.set("pin",n.pin);let i=document.querySelector("#results");i&&(i.innerHTML=`
    <section class="notice"><strong>${o(t.evidence.disclaimers[0])}</strong></section>
    <section class="panel" aria-labelledby="step-three">
      <div class="step-label">Step 3</div>
      <h2 id="step-three">Routing decision</h2>
      <p class="headline">${o(t.routing.headline)}</p>
      ${ye(t)}
      <ul>${t.routing.reasoning.map(c=>`<li>${T(c)}</li>`).join("")}</ul>
    </section>

    <section class="subject panel">
      <h2>Subject property</h2>
      <dl>
        <div><dt>PIN</dt><dd>${o(n.pinFormatted)}</dd></div>
        ${s?`<div><dt>Address</dt><dd>${o(s)}</dd></div>`:""}
        <div><dt>Class / township</dt><dd>${o(n.propertyClass)} / ${o(n.townshipName)}</dd></div>
        <div><dt>Building sqft</dt><dd>${f(n.buildingSqft)}</dd></div>
        <div><dt>Total AV</dt><dd>${u(n.currentAv)}</dd></div>
        <div><dt>Improvement AV</dt><dd>${u(n.currentImprovementAv)}</dd></div>
      </dl>
      ${r.length?`<p class="tagline">${o(r.join("; "))} - user-supplied; documentation required.</p>`:""}
    </section>

    ${xe(t)}

    <section class="panel" aria-labelledby="step-five">
      <div class="step-label">Step 5</div>
      <h2 id="step-five">${o(t.venue.name)} checklist</h2>
      <p class="hint">Use this checklist to assemble documents before filing at the official venue.</p>
      <ul>${t.venue.checklist.map(c=>`<li>${T(c)}</li>`).join("")}</ul>
      <div class="actions">
        <a class="button-link" href="/print?${a.toString()}">Print / Save as PDF</a>
        <button type="button" id="download-comps" class="secondary">Download comps (.xlsx)</button>
      </div>
    </section>

    ${ve()}

    ${he(t.warnings)}
  `)}function F(){d=null,h("");for(let t of["#results","#address-results"]){let e=document.querySelector(t);e&&(e.innerHTML="")}}async function Ae(t){F();let e=ue(await de());try{let n=await U(`/api/case?${t.toString()}`);F(),we(n,t)}catch(n){let s=document.querySelector("#results");s&&(s.innerHTML=`<section class="error" role="alert">${o(n instanceof Error?n.message:"The case could not be loaded.")}</section>`)}finally{e();let n=document.querySelector("#progress");n&&(n.innerHTML="")}}async function Te(t){if(!be(t))return;let e=new URLSearchParams,n=k(t,"pin");if(ie(e,t),n){e.set("pin",n),await Ae(e);return}let s=document.querySelector("#results");s&&(s.innerHTML='<section class="error" role="alert">Enter a PIN.</section>')}async function ke(t){if(!b){m("Problem reporting is disabled until the Turnstile site key is configured.",!0);return}if(!t.reportValidity())return;let e=new FormData(t),n=e.get("cf-turnstile-response");m("Submitting report...");let s=await fetch("/api/report",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({category:e.get("category"),description:e.get("description"),context:e.get("context"),turnstileToken:typeof n=="string"?n:""})}),r=await s.json();if(!s.ok||!r.ok){m(r.ok?"The report could not be submitted.":r.error?.message??"The report could not be submitted.",!0);return}m(`Report submitted: ${r.issueUrl}`),t.reset()}function $e(){let t=document.querySelector("details.evidence");if(t)for(let e of Array.from(t.querySelectorAll("[data-evidence-input]")))(e instanceof HTMLInputElement||e instanceof HTMLTextAreaElement)&&(e.value="")}function S(t=null){for(let e of Array.from(document.querySelectorAll(".tooltip-toggle"))){if(e===t)continue;let n=e.getAttribute("aria-describedby"),s=n?document.getElementById(n):null;e.setAttribute("aria-expanded","false"),s&&(s.hidden=!0,s.removeAttribute("style"))}}function Se(t,e){if(e.removeAttribute("style"),!window.matchMedia("(max-width: 760px)").matches)return;let n=t.getBoundingClientRect(),s=16,r=n.bottom+8,a=window.innerHeight-e.offsetHeight-s,i=Math.max(s,Math.min(r,a));e.style.position="fixed",e.style.inset=`${i}px ${s}px auto ${s}px`,e.style.width="auto",e.style.transform="none"}function Ee(t){let e=t.getAttribute("aria-describedby"),n=e?document.getElementById(e):null;if(!n)return;let s=t.getAttribute("aria-expanded")!=="true";S(s?t:null),t.setAttribute("aria-expanded",String(s)),n.hidden=!s,s?Se(t,n):n.removeAttribute("style")}function Le(){if(!d)return;let t=q(d),e=new ArrayBuffer(t.byteLength);new Uint8Array(e).set(t);let n=new Blob([e],{type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}),s=URL.createObjectURL(n),r=document.createElement("a");r.href=s,r.download=I(d),document.body.appendChild(r),r.click(),r.remove(),URL.revokeObjectURL(s)}me();var H=document.querySelector("#case-form");H&&$(H);document.addEventListener("submit",t=>{let e=t.target;e instanceof HTMLFormElement&&e.id==="case-form"&&(t.preventDefault(),Te(e)),e instanceof HTMLFormElement&&e.id==="report-form"&&(t.preventDefault(),ke(e))});document.addEventListener("change",t=>{let e=t.target;if(e instanceof HTMLInputElement||e instanceof HTMLSelectElement||e instanceof HTMLTextAreaElement){let n=e.form;n?.id==="case-form"&&(h(""),$(n))}});document.addEventListener("click",t=>{let e=t.target;if(e instanceof HTMLElement){let n=e.closest(".tooltip-toggle");if(n){Ee(n);return}S()}e instanceof HTMLElement&&e.id==="clear-evidence"&&$e(),e instanceof HTMLElement&&e.id==="download-comps"&&Le(),e instanceof HTMLElement&&e.id==="report-problem"&&fe(),e instanceof HTMLElement&&(e.id==="close-report"||e.id==="report-panel")&&ge()});document.addEventListener("keydown",t=>{t.key==="Escape"&&S()});document.documentElement.dataset.enhanced="true";
