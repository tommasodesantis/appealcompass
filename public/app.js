function f(t){let[e,n,s]=t.split("/"),o=Number(e),i=Number(n),a=Number(s);return Q(a,o,i)}function Q(t,e,n){return`${t.toString().padStart(4,"0")}-${e.toString().padStart(2,"0")}-${n.toString().padStart(2,"0")}`}var A="https://www.cookcountyassessoril.gov/assessment-calendar-and-deadlines";var T="https://www.cookcountyboardofreview.com/sites/g/files/ywwepo261/files/document/file/2025-07/2025TOWNSHIPOPEN-CLOSE.pdf";var q="https://ptab.illinois.gov/";function l(t,e,n=null){return{opens:f(t),closes:f(e),evidenceDeadline:n?f(n):null}}var Je={venueLabel:"Cook County Assessor",sessionLabel:"Tax Year 2026 Assessor Appeal Windows",sessionEnd:f("8/12/2026"),sourceUrl:A,sourceNote:"Manual authority file 'Assessment & Appeal Calendar _ Cook County Assessor's Office.pdf' extracted on 2026-07-06 from the official Assessor calendar page, which reported Last updated: 6/29/26. Direct shell automation still returned CloudFront 403, so manually verify at the official source before filing."},k={Barrington:[],Berwyn:[l("5/20/2026","7/6/2026")],Bloom:[],Bremen:[],Calumet:[],Cicero:[l("6/17/2026","7/31/2026")],"Elk Grove":[l("6/22/2026","8/4/2026")],Evanston:[l("4/22/2026","6/4/2026")],Hanover:[],"Hyde Park":[],Jefferson:[],Lake:[],Lakeview:[l("5/28/2026","7/13/2026")],Lemont:[],Leyden:[],Lyons:[],Maine:[l("6/5/2026","7/21/2026")],"New Trier":[l("5/7/2026","6/22/2026")],Niles:[],"North Chicago":[],Northfield:[],"Norwood Park":[l("4/13/2026","5/26/2026")],"Oak Park":[l("5/6/2026","6/18/2026")],Orland:[],Palatine:[],Palos:[l("6/3/2026","7/17/2026")],Proviso:[],Rich:[],"River Forest":[l("4/20/2026","6/2/2026")],Riverside:[l("4/24/2026","6/8/2026")],"Rogers Park":[l("4/17/2026","6/1/2026")],Schaumburg:[],"South Chicago":[],Stickney:[l("6/29/2026","8/12/2026")],Thornton:[],"West Chicago":[],Wheeling:[],Worth:[]},Qe={venueLabel:"Cook County Board of Review",sessionLabel:"Tax Year 2025 - Cook County Board of Review 2025-26 Session",sessionEnd:f("6/3/2026"),sourceUrl:T,sourceNote:"BOR 2025 township date PDF linked from the official Board of Review site."},v={1:{townships:["Berwyn","Evanston","Norwood Park","River Forest","Riverside","Rogers Park"],windows:[l("7/7/2025","8/5/2025","8/15/2025"),l("12/3/2025","12/12/2025","12/22/2025")]},"2a":{townships:["Cicero","Oak Park","Palos"],windows:[l("7/21/2025","8/19/2025","8/29/2025"),l("12/3/2025","12/12/2025","12/22/2025")]},"2b":{townships:["Elk Grove","Lakeview","Lyons","New Trier"],windows:[l("8/18/2025","9/16/2025","9/26/2025"),l("12/3/2025","12/12/2025","12/22/2025")]},3:{townships:["Barrington","Maine","Northfield","Stickney","West Chicago"],windows:[l("9/22/2025","10/21/2025","10/31/2025"),l("12/3/2025","12/12/2025","12/22/2025")]},4:{townships:["Bremen","Calumet","Hyde Park","Lemont","Leyden","Worth"],windows:[l("10/23/2025","11/21/2025","12/1/2025"),l("12/3/2025","12/12/2025","12/22/2025")]},5:{townships:["Jefferson","Proviso","Wheeling"],windows:[l("11/20/2025","12/19/2025","12/29/2025")]},6:{townships:["Lake","Orland","Palatine","Schaumburg","Thornton"],windows:[l("1/5/2026","2/3/2026","2/13/2026")]},7:{townships:["Bloom","Hanover","Niles","Rich","North Chicago","South Chicago"],windows:[l("1/20/2026","2/18/2026","2/28/2026")]}};var Ze=Object.fromEntries(Object.entries(v).flatMap(([t,e])=>e.townships.map(n=>[n,t])));var S="";var _=new TextEncoder;function Z(t){return String(t??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function ee(t){return t&&typeof t=="object"&&"value"in t?t:{value:t}}function te(t){let e=t+1,n="";for(;e>0;){let s=(e-1)%26;n=String.fromCharCode(65+s)+n,e=Math.floor((e-1)/26)}return n}function ne(t,e,n){let s=ee(t),o=`${te(n)}${e}`,i=s.style===void 0?"":` s="${s.style}"`;if(typeof s.value=="number"&&Number.isFinite(s.value))return`<c r="${o}"${i}><v>${s.value}</v></c>`;let a=s.value===null||s.value===""?"Not available":s.value;return`<c r="${o}" t="inlineStr"${i}><is><t>${Z(a)}</t></is></c>`}function se(t){return`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetViews><sheetView workbookViewId="0"/></sheetViews>
  <sheetFormatPr defaultRowHeight="15"/>
  <cols><col min="1" max="8" width="22" customWidth="1"/></cols>
  <sheetData>${t.map((n,s)=>`<row r="${s+1}">${n.map((o,i)=>ne(o,s+1,i)).join("")}</row>`).join("")}</sheetData>
</worksheet>`}function oe(){return`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets><sheet name="Comps" sheetId="1" r:id="rId1"/></sheets>
</workbook>`}function re(){return`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`}function ie(){return`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`}function ae(){return`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>`}function le(){return`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="2"><font><sz val="11"/><name val="Aptos"/></font><font><b/><sz val="11"/><name val="Aptos"/></font></fonts>
  <fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FFEFE3C1"/><bgColor indexed="64"/></patternFill></fill></fills>
  <borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>
  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
  <cellXfs count="3"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/><xf numFmtId="0" fontId="1" fillId="1" borderId="0" xfId="0" applyFont="1" applyFill="1"/></cellXfs>
  <cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>`}function ce(t,e){let n=t.evidence.comparableAnalysis.profileKey;return n==="bor"||n==="ptab"?e.improvementAv:e.av}function pe(t){let e=t.case.parcel,n=t.evidence.comparableAnalysis,s=t.evidence.savingsAssumptions;return[[{value:"Subject Property Summary",style:1}],["PIN",e.pinFormatted],["Class / Township",`${e.propertyClass} / ${e.townshipName}`],["Building Sqft",e.buildingSqft],["Total AV",e.currentAv],["Improvement AV",e.currentImprovementAv],["Implied Market Value",t.evidence.impliedMarketValue],[],[{value:"Comparable Exhibit",style:1}],[{value:"PIN",style:2},{value:"Sqft",style:2},{value:"Built Year",style:2},{value:"Assessment Year",style:2},{value:"Metric",style:2},{value:"Metric/sqft",style:2},{value:"Distance km",style:2}],...n.exhibit.map(o=>[o.comparable.pinFormatted,o.comparable.buildingSqft,o.comparable.yearBuilt,o.comparable.assessmentYear,ce(t,o.comparable),o.avPerSqft,o.distanceKm]),[],[{value:"Analysis Stats",style:1}],["Pool size",n.poolSize],["Median metric/sqft",n.medianAvPerSqft],["Percentile",n.percentile],["Gap %",n.gapPct],[],[{value:"Savings Calculation",style:1}],["State equalizer",s.stateEqualizer],["Assumed tax rate",s.taxRate],["Low estimate",s.low],["Point estimate",s.point],["High estimate",s.high],["Formula","estimated savings = Delta AV x E x r, shown as a +/-20% range; not a promise"]]}function ue(){let t=new Uint32Array(256);for(let e=0;e<256;e+=1){let n=e;for(let s=0;s<8;s+=1)n=n&1?3988292384^n>>>1:n>>>1;t[e]=n>>>0}return t}var de=ue();function me(t){let e=4294967295;for(let n of t)e=e>>>8^(de[(e^n)&255]??0);return(e^4294967295)>>>0}function c(t,e){t.push(e&255,e>>>8&255)}function u(t,e){t.push(e&255,e>>>8&255,e>>>16&255,e>>>24&255)}function C(t,e){for(let n of e)t.push(n)}function fe(t){let e=[],n=[],s=t.map(i=>{let a=_.encode(i.text);return{path:i.path,data:a,crc:me(a)}});for(let i of s){let a=e.length,p=_.encode(i.path);u(e,67324752),c(e,20),c(e,0),c(e,0),c(e,0),c(e,0),u(e,i.crc),u(e,i.data.length),u(e,i.data.length),c(e,p.length),c(e,0),C(e,p),C(e,i.data),u(n,33639248),c(n,20),c(n,20),c(n,0),c(n,0),c(n,0),c(n,0),u(n,i.crc),u(n,i.data.length),u(n,i.data.length),c(n,p.length),c(n,0),c(n,0),c(n,0),c(n,0),u(n,0),u(n,a),C(n,p)}let o=e.length;return e.push(...n),u(e,101010256),c(e,0),c(e,0),c(e,s.length),c(e,s.length),u(e,n.length),u(e,o),c(e,0),new Uint8Array(e)}function N(t){return`appeal-compass-comps-${t.case.parcel.pin}.xlsx`}function H(t){return fe([{path:"[Content_Types].xml",text:ae()},{path:"_rels/.rels",text:ie()},{path:"xl/workbook.xml",text:oe()},{path:"xl/_rels/workbook.xml.rels",text:re()},{path:"xl/styles.xml",text:le()},{path:"xl/worksheets/sheet1.xml",text:se(pe(t))}])}var Y=document.querySelector("#app");if(!Y)throw new Error("Missing app root.");var ge=Y,he=new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}),be="Appeal Compass is designed only for individual residential homeowners appealing their own home; entity-owned, commercial, and association properties are not supported and generally require an attorney.",ve="Appeal Compass is busy helping other homeowners right now. You're in line \u2014 keep this page open and your assessment will start automatically.",ye="https://www.cookcountyassessoril.gov/exemptions",z="https://www.cookcountypropertyinfo.com/",w=S.length>0,U=0,m=null;function r(t){return String(t??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function g(t,e){return`<a href="${r(t)}" target="_blank" rel="noreferrer">${r(e)}<span class="sr-only"> (opens in new tab)</span></a>`}function G(t,e,n="?",s=""){U+=1;let o=`tooltip-${U}`;return`<span class="${s?`tooltip ${s}`:"tooltip"}">
    <button class="tooltip-toggle" type="button" aria-label="${r(t)}" aria-expanded="false" aria-describedby="${o}">${r(n)}</button>
    <span class="tooltip-bubble" id="${o}" role="tooltip">${r(e)}</span>
  </span>`}function y(t,e){return G(t,e)}function we(t,e){return G(t,e,"!","warning-tooltip")}function P(t){let e=String(t??""),n=/https?:\/\/[^\s<>"']+/g,s="",o=0;for(let i of e.matchAll(n)){let a=i[0],p=i.index??0,O=a.match(/[.,;:)]+$/)?.[0]??"",D=a.slice(0,a.length-O.length);s+=r(e.slice(o,p)),s+=`<a href="${r(D)}" target="_blank" rel="noreferrer">${r(D)}<span class="sr-only"> (opens in new tab)</span></a>${r(O)}`,o=p+a.length}return s+r(e.slice(o))}function d(t){return t===null?"Not available":he.format(t)}function b(t,e=0){return t===null?"Not available":t.toLocaleString("en-US",{maximumFractionDigits:e})}function xe(){let t=new Date,e=t.getFullYear(),n=String(t.getMonth()+1).padStart(2,"0"),s=String(t.getDate()).padStart(2,"0");return`${e}-${n}-${s}`}function $(t){let[e,n,s]=t.split("-"),o=Number(e),i=Number(n),a=Number(s);return!Number.isFinite(o)||!Number.isFinite(i)||!Number.isFinite(a)?t:new Date(Date.UTC(o,i-1,a)).toLocaleDateString("en-US",{year:"numeric",month:"short",day:"numeric",timeZone:"UTC"})}function Ae(t,e){return t.length>0&&t.every(n=>e>n.closes)}function X(t){let e=t.evidenceDeadline?`; evidence due ${$(t.evidenceDeadline)}`:"";return`${$(t.opens)} to ${$(t.closes)}${e}`}function Te(){return Object.entries(k).flatMap(([e,n])=>n.map(s=>`<li>${r(e)}: ${r(X(s))}</li>`)).join("")||"<li>No configured Assessor filing windows are available in the current data.</li>"}function ke(){return Object.entries(v).map(([t,e])=>{let n=e.windows.map(s=>X(s)).join("; ");return`<li>Group ${r(t)} (${r(e.townships.join(", "))}): ${r(n)}</li>`}).join("")}function B(t,e){let n=t==="assessor"?Object.values(k).flat():Object.values(v).flatMap(o=>o.windows);return Ae(n,e)?we(`${t==="assessor"?"Assessor":"Board of Review"} calendar warning`,`All configured deadlines for this venue appear to be past as of ${e}. The data may be stale; verify at the official source before filing. You can still select this venue to prepare for the next session.`):""}function E(t){return`<div class="venue-option">
    <label class="venue-choice">
      <input type="radio" name="venue" value="${t.value}" required>
      <span>${r(t.label)}</span>
      ${t.warning??""}
    </label>
    ${t.details}
  </div>`}function Se(){let t=xe();return`<fieldset class="question-group venue-picker">
    <legend>Where do you want to appeal?</legend>
    <div class="venue-options">
      ${E({value:"assessor",label:"Cook County Assessor",warning:B("assessor",t),details:`<details class="venue-details">
          <summary>About the Assessor path</summary>
          <p>The Assessor is the first-level Cook County appeal venue. Start here for current-year assessment challenges and documented property-description errors.</p>
          <p>Use this path if you are within the township filing window or preparing for the next Assessor session.</p>
          <p>Official source: ${g(A,"Cook County Assessor calendar")}. Verify at the official source before filing.</p>
          <ul class="deadline-list">${Te()}</ul>
        </details>`})}
      ${E({value:"bor",label:"Cook County Board of Review",warning:B("bor",t),details:`<details class="venue-details">
          <summary>About the BOR path</summary>
          <p>The Board of Review is the second-level Cook County appeal venue and has its own township filing and evidence deadlines.</p>
          <p>Use this path if you are filing at BOR, preparing after an Assessor appeal, or checking BOR-specific comparable evidence.</p>
          <p>Official source: ${g(T,"Cook County BOR township dates")}. Verify at the official source before filing.</p>
          <ul class="deadline-list">${ke()}</ul>
        </details>`})}
      ${E({value:"ptab",label:"Illinois PTAB",details:`<details class="venue-details">
          <summary>About the PTAB path</summary>
          <p>PTAB is the Illinois state appeal board available after a written BOR decision for the same tax year.</p>
          <p>Use this path only when you have, or are preparing for, a BOR decision notice. The deadline is generally 30 days from the written BOR decision date; Appeal Compass will not guess it without that date.</p>
          <p>Official source: ${g(q,"Illinois PTAB")}. Verify at the official source before filing.</p>
        </details>`})}
    </div>
  </fieldset>`}async function K(t){let e=await fetch(t,{headers:{accept:"application/json"}}),n=await e.json();if(!e.ok||typeof n=="object"&&n&&"ok"in n&&n.ok===!1){let s=n.error?.message??"The request failed.";throw new Error(s)}return n}function I(t,e){let n=new FormData(t).get(e);return typeof n=="string"?n.trim():""}function Ce(t,e){let n=["jurisdiction","venue","ownershipType","assessorAppealFiled","assessorDecisionReceived","borAppealFiled","borDecisionReceived","borDecisionDate","purchasePrice","purchaseDate","appraisalValue","appraisalDate","actualSqft","actualAv","actualImprovementAv"];for(let s of n){let o=I(e,s);o&&t.set(s,o)}}function W(t){return`<section class="progress" aria-live="polite"><p>${r(t)}</p></section>`}function J(){return`<svg aria-hidden="true" class="github-mark" viewBox="0 0 16 16" width="20" height="20">
    <path fill="currentColor" d="M8 0C3.58 0 0 3.67 0 8.2c0 3.62 2.29 6.69 5.47 7.78.4.08.55-.18.55-.39 0-.19-.01-.84-.01-1.53-2.01.38-2.53-.5-2.69-.96-.09-.24-.48-.96-.82-1.16-.28-.16-.68-.55-.01-.56.63-.01 1.08.59 1.23.84.72 1.24 1.87.89 2.33.68.07-.53.28-.89.51-1.09-1.78-.21-3.64-.91-3.64-4.04 0-.89.31-1.62.82-2.19-.08-.21-.36-1.04.08-2.16 0 0 .67-.22 2.2.84A7.43 7.43 0 0 1 8 3.98c.68 0 1.36.09 2 .28 1.53-1.06 2.2-.84 2.2-.84.44 1.12.16 1.95.08 2.16.51.57.82 1.3.82 2.19 0 3.14-1.87 3.83-3.65 4.04.29.26.54.76.54 1.54 0 1.11-.01 2-.01 2.27 0 .21.15.47.55.39A8.08 8.08 0 0 0 16 8.2C16 3.67 12.42 0 8 0Z"/>
  </svg>`}function $e(){return`<footer class="site-footer">
    <p class="project-credit">Appeal Compass is an open-source project developed by <a href="https://github.com/tommasodesantis" target="_blank" rel="noreferrer">Tommaso De Santis<span class="sr-only"> (opens in new tab)</span></a> under GPLv3.</p>
    <a class="footer-icon-link" href="https://github.com/tommasodesantis/appealcompass" target="_blank" rel="noreferrer">${J()}<span>View on GitHub</span><span class="sr-only"> (opens in new tab)</span></a>
    <a href="https://ko-fi.com/tomdesantis" target="_blank" rel="noreferrer">Donations help the project grow and cover hosting and maintenance costs.<span class="sr-only"> (opens in new tab)</span></a>
    <button type="button" id="report-problem" class="link-button">Report a problem</button>
  </footer>`}function Ee(){return`<a class="header-icon-link" href="https://github.com/tommasodesantis/appealcompass" target="_blank" rel="noreferrer">${J()}<span>View on GitHub</span><span class="sr-only"> (opens in new tab)</span></a>`}function Le(){let t=w?"":" disabled",e=w?`<div class="cf-turnstile" data-sitekey="${r(S)}"></div>`:'<p class="hint">Problem reporting is disabled until the Turnstile site key is configured.</p>';return`<section id="report-panel" class="report-panel" hidden>
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
  </section>`}function Re(t=null){let e=t?[t]:["Looking up your property...","Fetching assessment history...","Finding similar homes...","Building the evidence summary..."],n=0,s=e[0]??"",o=document.querySelector("#progress");o&&(o.innerHTML=W(e[n]??s));let i=window.setInterval(()=>{n=(n+1)%e.length;let a=document.querySelector("#progress");a&&(a.innerHTML=W(e[n]??s))},650);return()=>window.clearInterval(i)}async function Pe(){try{let t=await K("/api/queue");return t.busy?t.message??ve:null}catch{return null}}function Ie(){ge.innerHTML=`
    <header class="topline">
      <div class="topline-head">
        <h1>Appeal Compass</h1>
        ${Ee()}
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
        <p class="hint pin-help">Don't know your PIN? You can recover it from the ${g(z,"Cook County Property Tax Portal")}.</p>

        ${Se()}

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
    ${$e()}
    ${Le()}
  `}function x(t){let e=document.querySelector("#form-error");e&&(e.innerHTML=t?`<section class="error inline-error" role="alert">${r(t)}</section>`:"")}function h(t,e=!1){let n=document.querySelector("#report-status");n&&(n.innerHTML=t?`<p class="${e?"error inline-error":"notice inline-error"}">${r(t)}</p>`:"")}function Fe(){let t=document.querySelector("#report-panel"),e=document.querySelector("#report-context");if(!t)return;e&&m&&(e.value=`PIN ${m.case.parcel.pinFormatted}; venue ${m.routing.venue}; generated ${m.generatedAt}`),h(w?"":"Problem reporting is disabled until the Turnstile site key is configured.",!0),t.hidden=!1,t.querySelector("select, textarea, input, button")?.focus()}function Me(){let t=document.querySelector("#report-panel");t&&(t.hidden=!0)}function L(t,e){let n=new FormData(t).get(e);return typeof n=="string"?n:""}function R(t,e,n){let s=t.querySelector(`[data-conditional="${e}"]`);if(s){s.hidden=!n;for(let o of Array.from(s.querySelectorAll("input, select, textarea"))){if(!(o instanceof HTMLInputElement||o instanceof HTMLSelectElement||o instanceof HTMLTextAreaElement))continue;let i=o;i.disabled=!n,i.required=n,n||(i instanceof HTMLInputElement&&i.type==="radio"?i.checked=!1:i.value="")}}}function F(t){let e=L(t,"assessorAppealFiled")==="yes",n=L(t,"borAppealFiled")==="yes",s=L(t,"borDecisionReceived")==="yes";R(t,"assessorDecision",e),R(t,"borDecision",n),R(t,"borDecisionDate",n&&s)}function Oe(t){return x(""),F(t),t.reportValidity()?I(t,"ownershipType")!=="individual"?(x(be),!1):!0:!1}function De(t){return t.length===0?"":`<section class="warnings" aria-label="Warnings"><h2>Warnings</h2><ul>${t.map(e=>`<li>${P(e)}</li>`).join("")}</ul></section>`}function qe(){return`<section class="panel" aria-labelledby="exemptions">
    <h2 id="exemptions">Exemptions and past-year corrections</h2>
    <p>Exemptions are fixed reductions in taxable value for owner-occupants, seniors, veterans, people with disabilities, and some other homeowners. They can be worth more than an appeal.</p>
    <p>Check your exemptions on the ${g(ye,"Cook County Assessor exemptions page")} and the ${g(z,"Cook County Property Tax Portal")}. Bring documentation for any missing or incorrect exemption.</p>
    <p>A Certificate of Error is a Cook County process to fix past-year mistakes - like a missed exemption or wrong property facts - which can lead to a refund. Ask the Assessor's office about it.</p>
  </section>`}function _e(t){let e=t.routing,n=e.officialUrl?`<a href="${r(e.officialUrl)}" target="_blank" rel="noreferrer">Verify at the official source before filing</a>`:"";if(!e.deadline)return`<p>No computed deadline. ${n}</p>`;let s=e.daysRemaining===null?"":` ${e.daysRemaining>=0?`${e.daysRemaining} days remaining.`:`${Math.abs(e.daysRemaining)} days past the computed deadline.`}`;return`<p><strong>Deadline:</strong> ${r(e.deadline)}.${r(s)} ${n}</p>`}function Ne(t){let e=t.evidence.comparableAnalysis,n=y("What comparable profile means",'A "profile" is the set of matching rules this tool uses to pick similar homes for the specific venue: size, age, neighborhood, and which assessment number is compared, because each venue weighs comparables differently.'),s=e.status==="ok"?`<p>Comparable analysis completed with the ${r(e.profileLabel)} profile using ${r(e.metricLabel)} per square foot. ${n}</p>`:`<p>${r(e.note)}</p>`,o=e.exhibit.map(a=>{let p=e.profileLabel.includes("Assessor")||t.routing.venue==="assessor"?a.comparable.av:a.comparable.improvementAv;return`<tr>
        <td>${r(a.comparable.pinFormatted)}</td>
        <td>${b(a.comparable.buildingSqft)}</td>
        <td>${r(a.comparable.yearBuilt??"Not available")}</td>
        <td>${r(a.comparable.assessmentYear??"Not available")}</td>
        <td>${d(p)}</td>
        <td>${d(a.avPerSqft)}</td>
      </tr>`}).join(""),i=o.length===0?"<p>No lower-assessed comparable exhibit is available from the current public data.</p>":`<div class="table-wrap"><table>
          <thead><tr><th>PIN</th><th>Sqft</th><th>Built Year</th><th>Assessment Year</th><th>Metric</th><th>Metric/sqft</th></tr></thead>
          <tbody>${o}</tbody>
        </table></div>`;return`<section class="panel" aria-labelledby="step-four">
    <div class="step-label">Step 4</div>
    <h2 id="step-four">Evidence summary</h2>
    <p class="metric-line"><strong>Tier:</strong> ${r(t.evidence.tier)}. ${r(t.evidence.tierMessage)} ${y("What tier means","The tier is a rough screen of how much public data supports spending time on an appeal.")}</p>
    ${s}
    <p><strong>Pool:</strong> ${b(e.poolSize)} similar homes, ${r(e.scope??"no scope")}; subject ${r(e.metricLabel)}/sqft ${d(e.subjectAvPerSqft)}; median ${d(e.medianAvPerSqft)}; gap ${b(e.gapPct,1)}%.</p>
    ${i}
    <h3 class="heading-with-tooltip">Arguments ${y("What arguments mean","An argument is a distinct reason the assessment may be too high: uniformity, overvaluation, description error, or assessment shock. Strength labels are rough screens, not legal conclusions.")}</h3>
    ${t.evidence.arguments.length?`<ul>${t.evidence.arguments.map(a=>`<li><strong>${r(a.argumentType)}:</strong> ${r(a.text)}</li>`).join("")}</ul>`:"<p>No strong public-data argument was found. Add sale, appraisal, condition, or factual-error evidence if available.</p>"}
    <h3 class="heading-with-tooltip">Rough savings estimate ${y("How rough savings are estimated","Estimated savings = \u0394AV \xD7 E \xD7 r, where \u0394AV is the assessed-value reduction, E is the state equalizer, and r is the assumed tax rate. The range is shown as \xB120% and is not a promise.")}</h3>
    <p>${d(t.evidence.savingsAssumptions.low)} to ${d(t.evidence.savingsAssumptions.high)}, with point estimate ${d(t.evidence.savingsAssumptions.point)}.</p>
    <p class="hint">Assumes equalizer ${t.evidence.savingsAssumptions.stateEqualizer} and tax rate ${(t.evidence.savingsAssumptions.taxRate*100).toFixed(2)}%; this is a rough range, not a promise.</p>
  </section>`}function He(t,e){m=t;let n=t.case.parcel,s=[n.address,n.city,n.zipCode].filter(Boolean).join(", "),o=[t.case.userEvidence.actualSqft?`Actual sqft ${b(t.case.userEvidence.actualSqft)}`:"",t.case.userEvidence.actualAv?`Actual AV ${d(t.case.userEvidence.actualAv)}`:"",t.case.userEvidence.actualImprovementAv?`Actual improvement AV ${d(t.case.userEvidence.actualImprovementAv)}`:""].filter(Boolean),i=new URLSearchParams(e);i.set("pin",n.pin);let a=document.querySelector("#results");a&&(a.innerHTML=`
    <section class="notice"><strong>${r(t.evidence.disclaimers[0])}</strong></section>
    <section class="panel" aria-labelledby="step-three">
      <div class="step-label">Step 3</div>
      <h2 id="step-three">Routing decision</h2>
      <p class="headline">${r(t.routing.headline)}</p>
      ${_e(t)}
      <ul>${t.routing.reasoning.map(p=>`<li>${P(p)}</li>`).join("")}</ul>
    </section>

    <section class="subject panel">
      <h2>Subject property</h2>
      <dl>
        <div><dt>PIN</dt><dd>${r(n.pinFormatted)}</dd></div>
        ${s?`<div><dt>Address</dt><dd>${r(s)}</dd></div>`:""}
        <div><dt>Class / township</dt><dd>${r(n.propertyClass)} / ${r(n.townshipName)}</dd></div>
        <div><dt>Building sqft</dt><dd>${b(n.buildingSqft)}</dd></div>
        <div><dt>Total AV</dt><dd>${d(n.currentAv)}</dd></div>
        <div><dt>Improvement AV</dt><dd>${d(n.currentImprovementAv)}</dd></div>
      </dl>
      ${o.length?`<p class="tagline">${r(o.join("; "))} - user-supplied; documentation required.</p>`:""}
    </section>

    ${Ne(t)}

    <section class="panel" aria-labelledby="step-five">
      <div class="step-label">Step 5</div>
      <h2 id="step-five">${r(t.venue.name)} checklist</h2>
      <p class="hint">Use this checklist to assemble documents before filing at the official venue.</p>
      <ul>${t.venue.checklist.map(p=>`<li>${P(p)}</li>`).join("")}</ul>
      <div class="actions">
        <a class="button-link" href="/print?${i.toString()}">Print / Save as PDF</a>
        <button type="button" id="download-comps" class="secondary">Download comps (.xlsx)</button>
      </div>
    </section>

    ${qe()}

    ${De(t.warnings)}
  `)}function j(){m=null,x("");for(let t of["#results","#address-results"]){let e=document.querySelector(t);e&&(e.innerHTML="")}}async function Ue(t){j();let e=Re(await Pe());try{let n=await K(`/api/case?${t.toString()}`);j(),He(n,t)}catch(n){let s=document.querySelector("#results");s&&(s.innerHTML=`<section class="error" role="alert">${r(n instanceof Error?n.message:"The case could not be loaded.")}</section>`)}finally{e();let n=document.querySelector("#progress");n&&(n.innerHTML="")}}async function Be(t){if(!Oe(t))return;let e=new URLSearchParams,n=I(t,"pin");if(Ce(e,t),n){e.set("pin",n),await Ue(e);return}let s=document.querySelector("#results");s&&(s.innerHTML='<section class="error" role="alert">Enter a PIN.</section>')}async function We(t){if(!w){h("Problem reporting is disabled until the Turnstile site key is configured.",!0);return}if(!t.reportValidity())return;let e=new FormData(t),n=e.get("cf-turnstile-response");h("Submitting report...");let s=await fetch("/api/report",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({category:e.get("category"),description:e.get("description"),context:e.get("context"),turnstileToken:typeof n=="string"?n:""})}),o=await s.json();if(!s.ok||!o.ok){h(o.ok?"The report could not be submitted.":o.error?.message??"The report could not be submitted.",!0);return}h(`Report submitted: ${o.issueUrl}`),t.reset()}function je(){let t=document.querySelector("details.evidence");if(t)for(let e of Array.from(t.querySelectorAll("[data-evidence-input]")))(e instanceof HTMLInputElement||e instanceof HTMLTextAreaElement)&&(e.value="")}function M(t=null){for(let e of Array.from(document.querySelectorAll(".tooltip-toggle"))){if(e===t)continue;let n=e.getAttribute("aria-describedby"),s=n?document.getElementById(n):null;e.setAttribute("aria-expanded","false"),s&&s.removeAttribute("style")}}function Ve(t,e){if(e.removeAttribute("style"),!window.matchMedia("(max-width: 760px)").matches)return;let n=t.getBoundingClientRect(),s=16,o=n.bottom+8,i=window.innerHeight-e.offsetHeight-s,a=Math.max(s,Math.min(o,i));e.style.position="fixed",e.style.inset=`${a}px ${s}px auto ${s}px`,e.style.width="auto",e.style.transform="none"}function Ye(t){let e=t.getAttribute("aria-describedby"),n=e?document.getElementById(e):null;if(!n)return;let s=t.getAttribute("aria-expanded")!=="true";M(s?t:null),t.setAttribute("aria-expanded",String(s)),s?Ve(t,n):n.removeAttribute("style")}function ze(){if(!m)return;let t=H(m),e=new ArrayBuffer(t.byteLength);new Uint8Array(e).set(t);let n=new Blob([e],{type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}),s=URL.createObjectURL(n),o=document.createElement("a");o.href=s,o.download=N(m),document.body.appendChild(o),o.click(),o.remove(),URL.revokeObjectURL(s)}Ie();var V=document.querySelector("#case-form");V&&F(V);document.addEventListener("submit",t=>{let e=t.target;e instanceof HTMLFormElement&&e.id==="case-form"&&(t.preventDefault(),Be(e)),e instanceof HTMLFormElement&&e.id==="report-form"&&(t.preventDefault(),We(e))});document.addEventListener("change",t=>{let e=t.target;if(e instanceof HTMLInputElement||e instanceof HTMLSelectElement||e instanceof HTMLTextAreaElement){let n=e.form;n?.id==="case-form"&&(x(""),F(n))}});document.addEventListener("click",t=>{let e=t.target;if(e instanceof HTMLElement){let n=e.closest(".tooltip-toggle");if(n){Ye(n);return}M()}e instanceof HTMLElement&&e.id==="clear-evidence"&&je(),e instanceof HTMLElement&&e.id==="download-comps"&&ze(),e instanceof HTMLElement&&e.id==="report-problem"&&Fe(),e instanceof HTMLElement&&(e.id==="close-report"||e.id==="report-panel")&&Me()});document.addEventListener("keydown",t=>{t.key==="Escape"&&M()});document.documentElement.dataset.enhanced="true";
