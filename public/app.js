function w(e){return e==="assessor"?"Total AV":"Improvement AV"}function h(e){let[t,n,s]=e.split("/"),r=Number(t),o=Number(n),a=Number(s);return Z(a,r,o)}function Z(e,t,n){return`${e.toString().padStart(4,"0")}-${t.toString().padStart(2,"0")}-${n.toString().padStart(2,"0")}`}var Ze=+"3.0300";var k="https://www.cookcountyassessoril.gov/assessment-calendar-and-deadlines";var C="https://www.cookcountyboardofreview.com/sites/g/files/ywwepo261/files/document/file/2025-07/2025TOWNSHIPOPEN-CLOSE.pdf";var q="https://ptab.illinois.gov/";function l(e,t,n=null){return{opens:h(e),closes:h(t),evidenceDeadline:n?h(n):null}}var et={venueLabel:"Cook County Assessor",sessionLabel:"Tax Year 2026 Assessor Appeal Windows",sessionEnd:h("8/12/2026"),sourceUrl:k,sourceNote:"Manual authority file 'Assessment & Appeal Calendar _ Cook County Assessor's Office.pdf' extracted on 2026-07-06 from the official Assessor calendar page, which reported Last updated: 6/29/26. Direct shell automation still returned CloudFront 403, so manually verify at the official source before filing."},$={Barrington:[],Berwyn:[l("5/20/2026","7/6/2026")],Bloom:[],Bremen:[],Calumet:[],Cicero:[l("6/17/2026","7/31/2026")],"Elk Grove":[l("6/22/2026","8/4/2026")],Evanston:[l("4/22/2026","6/4/2026")],Hanover:[],"Hyde Park":[],Jefferson:[],Lake:[],Lakeview:[l("5/28/2026","7/13/2026")],Lemont:[],Leyden:[],Lyons:[],Maine:[l("6/5/2026","7/21/2026")],"New Trier":[l("5/7/2026","6/22/2026")],Niles:[],"North Chicago":[],Northfield:[],"Norwood Park":[l("4/13/2026","5/26/2026")],"Oak Park":[l("5/6/2026","6/18/2026")],Orland:[],Palatine:[],Palos:[l("6/3/2026","7/17/2026")],Proviso:[],Rich:[],"River Forest":[l("4/20/2026","6/2/2026")],Riverside:[l("4/24/2026","6/8/2026")],"Rogers Park":[l("4/17/2026","6/1/2026")],Schaumburg:[],"South Chicago":[],Stickney:[l("6/29/2026","8/12/2026")],Thornton:[],"West Chicago":[],Wheeling:[],Worth:[]},tt={venueLabel:"Cook County Board of Review",sessionLabel:"Tax Year 2025 - Cook County Board of Review 2025-26 Session",sessionEnd:h("6/3/2026"),sourceUrl:C,sourceNote:"BOR 2025 township date PDF linked from the official Board of Review site."},A={1:{townships:["Berwyn","Evanston","Norwood Park","River Forest","Riverside","Rogers Park"],windows:[l("7/7/2025","8/5/2025","8/15/2025"),l("12/3/2025","12/12/2025","12/22/2025")]},"2a":{townships:["Cicero","Oak Park","Palos"],windows:[l("7/21/2025","8/19/2025","8/29/2025"),l("12/3/2025","12/12/2025","12/22/2025")]},"2b":{townships:["Elk Grove","Lakeview","Lyons","New Trier"],windows:[l("8/18/2025","9/16/2025","9/26/2025"),l("12/3/2025","12/12/2025","12/22/2025")]},3:{townships:["Barrington","Maine","Northfield","Stickney","West Chicago"],windows:[l("9/22/2025","10/21/2025","10/31/2025"),l("12/3/2025","12/12/2025","12/22/2025")]},4:{townships:["Bremen","Calumet","Hyde Park","Lemont","Leyden","Worth"],windows:[l("10/23/2025","11/21/2025","12/1/2025"),l("12/3/2025","12/12/2025","12/22/2025")]},5:{townships:["Jefferson","Proviso","Wheeling"],windows:[l("11/20/2025","12/19/2025","12/29/2025")]},6:{townships:["Lake","Orland","Palatine","Schaumburg","Thornton"],windows:[l("1/5/2026","2/3/2026","2/13/2026")]},7:{townships:["Bloom","Hanover","Niles","Rich","North Chicago","South Chicago"],windows:[l("1/20/2026","2/18/2026","2/28/2026")]}};var nt=Object.fromEntries(Object.entries(A).flatMap(([e,t])=>t.townships.map(n=>[n,e])));var L="";var _=new TextEncoder;function ee(e){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function te(e){return e&&typeof e=="object"&&"value"in e?e:{value:e}}function ne(e){let t=e+1,n="";for(;t>0;){let s=(t-1)%26;n=String.fromCharCode(65+s)+n,t=Math.floor((t-1)/26)}return n}function se(e,t,n){let s=te(e),r=`${ne(n)}${t}`,o=s.style===void 0?"":` s="${s.style}"`;if(typeof s.value=="number"&&Number.isFinite(s.value))return`<c r="${r}"${o}><v>${s.value}</v></c>`;let a=s.value===null||s.value===""?"Not available":s.value;return`<c r="${r}" t="inlineStr"${o}><is><t>${ee(a)}</t></is></c>`}function oe(e){return`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetViews><sheetView workbookViewId="0"/></sheetViews>
  <sheetFormatPr defaultRowHeight="15"/>
  <cols><col min="1" max="11" width="22" customWidth="1"/></cols>
  <sheetData>${e.map((n,s)=>`<row r="${s+1}">${n.map((r,o)=>se(r,s+1,o)).join("")}</row>`).join("")}</sheetData>
</worksheet>`}function re(){return`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets><sheet name="Comps" sheetId="1" r:id="rId1"/></sheets>
</workbook>`}function ie(){return`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`}function ae(){return`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`}function le(){return`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>`}function ce(){return`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="2"><font><sz val="11"/><name val="Aptos"/></font><font><b/><sz val="11"/><name val="Aptos"/></font></fonts>
  <fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FFEFE3C1"/><bgColor indexed="64"/></patternFill></fill></fills>
  <borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>
  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
  <cellXfs count="3"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/><xf numFmtId="0" fontId="1" fillId="1" borderId="0" xfId="0" applyFont="1" applyFill="1"/></cellXfs>
  <cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>`}function pe(e){let t=e.case.parcel,n=e.evidence.comparableAnalysis,s=e.evidence.savingsAssumptions,r=w(n.profileKey);return[[{value:"Subject Property Summary",style:1}],["PIN",t.pinFormatted],["Class / Township",`${t.propertyClass} / ${t.townshipName}`],["Building Sqft",t.buildingSqft],["Total AV",t.currentAv],["Improvement AV",t.currentImprovementAv],["Implied Market Value",e.evidence.impliedMarketValue],[],[{value:"Comparable Exhibit",style:1}],[{value:"PIN",style:2},{value:"Distance km",style:2},{value:"Neighborhood",style:2},{value:"Property class",style:2},{value:"Building sqft",style:2},{value:"Year built",style:2},{value:"Sale date",style:2},{value:"Sale price",style:2},{value:"Assessment type",style:2},{value:"Assessment $/sqft",style:2},{value:"Similarity score",style:2}],...n.exhibit.map(o=>[o.comparable.pinFormatted,o.distanceKm,o.comparable.neighborhood,o.comparable.propertyClass,o.comparable.buildingSqft,o.comparable.yearBuilt,o.comparable.saleDate,o.comparable.salePrice,r,o.avPerSqft,o.similarity]),[],[{value:"Analysis Stats",style:1}],["Pool size",n.poolSize],["Median metric/sqft",n.medianAvPerSqft],["Percentile",n.percentile],["Gap %",n.gapPct],[],[{value:"Savings Calculation",style:1}],["State equalizer",s.stateEqualizer],["Assumed tax rate",s.taxRate],["Tax rate source",s.taxRateSource],["Low estimate",s.low],["Point estimate",s.point],["High estimate",s.high],["Formula","estimated savings = Delta AV x E x r, shown as a +/-20% range; not a promise"]]}function ue(){let e=new Uint32Array(256);for(let t=0;t<256;t+=1){let n=t;for(let s=0;s<8;s+=1)n=n&1?3988292384^n>>>1:n>>>1;e[t]=n>>>0}return e}var de=ue();function me(e){let t=4294967295;for(let n of e)t=t>>>8^(de[(t^n)&255]??0);return(t^4294967295)>>>0}function c(e,t){e.push(t&255,t>>>8&255)}function d(e,t){e.push(t&255,t>>>8&255,t>>>16&255,t>>>24&255)}function E(e,t){for(let n of t)e.push(n)}function fe(e){let t=[],n=[],s=e.map(o=>{let a=_.encode(o.text);return{path:o.path,data:a,crc:me(a)}});for(let o of s){let a=t.length,u=_.encode(o.path);d(t,67324752),c(t,20),c(t,0),c(t,0),c(t,0),c(t,0),d(t,o.crc),d(t,o.data.length),d(t,o.data.length),c(t,u.length),c(t,0),E(t,u),E(t,o.data),d(n,33639248),c(n,20),c(n,20),c(n,0),c(n,0),c(n,0),c(n,0),d(n,o.crc),d(n,o.data.length),d(n,o.data.length),c(n,u.length),c(n,0),c(n,0),c(n,0),c(n,0),d(n,0),d(n,a),E(n,u)}let r=t.length;return t.push(...n),d(t,101010256),c(t,0),c(t,0),c(t,s.length),c(t,s.length),d(t,n.length),d(t,r),c(t,0),new Uint8Array(t)}function H(e){return`appeal-compass-comps-${e.case.parcel.pin}.xlsx`}function U(e){return fe([{path:"[Content_Types].xml",text:le()},{path:"_rels/.rels",text:ae()},{path:"xl/workbook.xml",text:re()},{path:"xl/_rels/workbook.xml.rels",text:ie()},{path:"xl/styles.xml",text:ce()},{path:"xl/worksheets/sheet1.xml",text:oe(pe(e))}])}var z=document.querySelector("#app");if(!z)throw new Error("Missing app root.");var ge=z,he=new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}),be="Appeal Compass is designed only for individual residential homeowners appealing their own home; entity-owned, commercial, and association properties are not supported and generally require an attorney.",ve="Appeal Compass is busy helping other homeowners right now. You're in line \u2014 keep this page open and your assessment will start automatically.",ye="https://www.cookcountyassessoril.gov/exemptions",G="https://www.cookcountypropertyinfo.com/",T=L.length>0,B=0,f=null;function i(e){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function b(e,t){return`<a href="${i(e)}" target="_blank" rel="noreferrer">${i(t)}<span class="sr-only"> (opens in new tab)</span></a>`}function X(e,t,n="?",s=""){B+=1;let r=`tooltip-${B}`;return`<span class="${s?`tooltip ${s}`:"tooltip"}">
    <button class="tooltip-toggle" type="button" aria-label="${i(e)}" aria-expanded="false" aria-describedby="${r}">${i(n)}</button>
    <span class="tooltip-bubble" id="${r}" role="tooltip">${i(t)}</span>
  </span>`}function v(e,t){return X(e,t)}function we(e,t){return X(e,t,"!","warning-tooltip")}function F(e){let t=String(e??""),n=/https?:\/\/[^\s<>"']+/g,s="",r=0;for(let o of t.matchAll(n)){let a=o[0],u=o.index??0,p=a.match(/[.,;:)]+$/)?.[0]??"",O=a.slice(0,a.length-p.length);s+=i(t.slice(r,u)),s+=`<a href="${i(O)}" target="_blank" rel="noreferrer">${i(O)}<span class="sr-only"> (opens in new tab)</span></a>${i(p)}`,r=u+a.length}return s+i(t.slice(r))}function m(e){return e===null?"Not available":he.format(e)}function g(e,t=0){return e===null?"Not available":e.toLocaleString("en-US",{maximumFractionDigits:t})}function Ae(e){return e==="LIMITED"?"No evidence found":e==="STRONG"?"Strong":e==="MODERATE"?"Moderate":e}function xe(){let e=new Date,t=e.getFullYear(),n=String(e.getMonth()+1).padStart(2,"0"),s=String(e.getDate()).padStart(2,"0");return`${t}-${n}-${s}`}function x(e){let[t,n,s]=e.split("-"),r=Number(t),o=Number(n),a=Number(s);return!Number.isFinite(r)||!Number.isFinite(o)||!Number.isFinite(a)?e:new Date(Date.UTC(r,o-1,a)).toLocaleDateString("en-US",{year:"numeric",month:"short",day:"numeric",timeZone:"UTC"})}function Te(e,t){return e.length>0&&e.every(n=>t>n.closes)}function K(e){let t=e.evidenceDeadline?`; evidence due ${x(e.evidenceDeadline)}`:"";return`${x(e.opens)} to ${x(e.closes)}${t}`}function Se(){return Object.entries($).flatMap(([t,n])=>n.map(s=>`<li>${i(t)}: ${i(K(s))}</li>`)).join("")||"<li>No configured Assessor filing windows are available in the current data.</li>"}function ke(){return Object.entries(A).map(([e,t])=>{let n=t.windows.map(s=>K(s)).join("; ");return`<li>Group ${i(e)} (${i(t.townships.join(", "))}): ${i(n)}</li>`}).join("")}function W(e,t){let n=e==="assessor"?Object.values($).flat():Object.values(A).flatMap(r=>r.windows);return Te(n,t)?we(`${e==="assessor"?"Assessor":"Board of Review"} calendar warning`,`All configured deadlines for this venue appear to be past as of ${t}. The data may be stale; verify at the official source before filing. You can still select this venue to prepare for the next session.`):""}function R(e){return`<div class="venue-option">
    <label class="venue-choice">
      <input type="radio" name="venue" value="${e.value}" required>
      <span>${i(e.label)}</span>
      ${e.warning??""}
    </label>
    ${e.details}
  </div>`}function Ce(){let e=xe();return`<fieldset class="question-group venue-picker">
    <legend>Where do you want to appeal?</legend>
    <div class="venue-options">
      ${R({value:"assessor",label:"Cook County Assessor",warning:W("assessor",e),details:`<details class="venue-details">
          <summary>About the Assessor path</summary>
          <p>The Assessor is the first-level Cook County appeal venue. Start here for current-year assessment challenges and documented property-description errors.</p>
          <p>Use this path if you are within the township filing window or preparing for the next Assessor session.</p>
          <p>Official source: ${b(k,"Cook County Assessor calendar")}. Verify at the official source before filing.</p>
          <ul class="deadline-list">${Se()}</ul>
        </details>`})}
      ${R({value:"bor",label:"Cook County Board of Review",warning:W("bor",e),details:`<details class="venue-details">
          <summary>About the BOR path</summary>
          <p>The Board of Review is the second-level Cook County appeal venue and has its own township filing and evidence deadlines.</p>
          <p>Use this path if you are filing at BOR, preparing after an Assessor appeal, or checking BOR-specific comparable evidence.</p>
          <p>Official source: ${b(C,"Cook County BOR township dates")}. Verify at the official source before filing.</p>
          <ul class="deadline-list">${ke()}</ul>
        </details>`})}
      ${R({value:"ptab",label:"Illinois PTAB",details:`<details class="venue-details">
          <summary>About the PTAB path</summary>
          <p>PTAB is the Illinois state appeal board available after a written BOR decision for the same tax year.</p>
          <p>Use this path only when you have, or are preparing for, a BOR decision notice. The deadline is generally 30 days from the written BOR decision date; Appeal Compass will not guess it without that date.</p>
          <p>Official source: ${b(q,"Illinois PTAB")}. Verify at the official source before filing.</p>
        </details>`})}
    </div>
  </fieldset>`}async function J(e){let t=await fetch(e,{headers:{accept:"application/json"}}),n=await t.json();if(!t.ok||typeof n=="object"&&n&&"ok"in n&&n.ok===!1){let s=n.error?.message??"The request failed.";throw new Error(s)}return n}function D(e,t){let n=new FormData(e).get(t);return typeof n=="string"?n.trim():""}function $e(e,t){let n=["jurisdiction","venue","ownershipType","assessorAppealFiled","assessorDecisionReceived","borAppealFiled","borDecisionReceived","borDecisionDate","purchasePrice","purchaseDate","appraisalValue","appraisalDate","actualSqft","actualAv","actualImprovementAv"];for(let s of n){let r=D(t,s);r&&e.set(s,r)}}function V(e){return`<section class="progress" aria-live="polite"><p>${i(e)}</p></section>`}function Q(){return`<svg aria-hidden="true" class="github-mark" viewBox="0 0 16 16" width="20" height="20">
    <path fill="currentColor" d="M8 0C3.58 0 0 3.67 0 8.2c0 3.62 2.29 6.69 5.47 7.78.4.08.55-.18.55-.39 0-.19-.01-.84-.01-1.53-2.01.38-2.53-.5-2.69-.96-.09-.24-.48-.96-.82-1.16-.28-.16-.68-.55-.01-.56.63-.01 1.08.59 1.23.84.72 1.24 1.87.89 2.33.68.07-.53.28-.89.51-1.09-1.78-.21-3.64-.91-3.64-4.04 0-.89.31-1.62.82-2.19-.08-.21-.36-1.04.08-2.16 0 0 .67-.22 2.2.84A7.43 7.43 0 0 1 8 3.98c.68 0 1.36.09 2 .28 1.53-1.06 2.2-.84 2.2-.84.44 1.12.16 1.95.08 2.16.51.57.82 1.3.82 2.19 0 3.14-1.87 3.83-3.65 4.04.29.26.54.76.54 1.54 0 1.11-.01 2-.01 2.27 0 .21.15.47.55.39A8.08 8.08 0 0 0 16 8.2C16 3.67 12.42 0 8 0Z"/>
  </svg>`}function Le(){return`<footer class="site-footer">
    <p class="project-credit">Appeal Compass is an open-source project developed by <a href="https://github.com/tommasodesantis" target="_blank" rel="noreferrer">Tommaso De Santis<span class="sr-only"> (opens in new tab)</span></a> under GPLv3.</p>
    <a class="footer-icon-link" href="https://github.com/tommasodesantis/appealcompass" target="_blank" rel="noreferrer">${Q()}<span>View on GitHub</span><span class="sr-only"> (opens in new tab)</span></a>
    <a href="https://ko-fi.com/tomdesantis" target="_blank" rel="noreferrer">Donations help the project grow and cover hosting and maintenance costs.<span class="sr-only"> (opens in new tab)</span></a>
    <button type="button" id="report-problem" class="link-button">Report a problem</button>
  </footer>`}function Ee(){return`<a class="header-icon-link" href="https://github.com/tommasodesantis/appealcompass" target="_blank" rel="noreferrer">${Q()}<span>View on GitHub</span><span class="sr-only"> (opens in new tab)</span></a>`}function Re(){let e=T?"":" disabled",t=T?`<div class="cf-turnstile" data-sitekey="${i(L)}"></div>`:'<p class="hint">Problem reporting is disabled until the Turnstile site key is configured.</p>';return`<section id="report-panel" class="report-panel" hidden>
    <div class="report-card" role="dialog" aria-modal="true" aria-labelledby="report-title">
      <button type="button" id="close-report" class="secondary close-button">Close</button>
      <h2 id="report-title">Report a problem</h2>
      <form id="report-form" class="stack">
        <label>
          <span>Category</span>
          <select name="category" required${e}>
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
          <textarea name="description" rows="5" maxlength="4000" required${e}></textarea>
        </label>
        <label>
          <span>Optional PIN/context</span>
          <input name="context" id="report-context" maxlength="2000"${e}>
        </label>
        ${t}
        <div id="report-status" aria-live="polite"></div>
        <button type="submit"${e}>Submit report</button>
      </form>
    </div>
  </section>`}function Pe(e=null){let t=e?[e]:["Looking up your property...","Fetching assessment history...","Finding similar homes...","Building the evidence summary..."],n=0,s=t[0]??"",r=document.querySelector("#progress");r&&(r.innerHTML=V(t[n]??s));let o=window.setInterval(()=>{n=(n+1)%t.length;let a=document.querySelector("#progress");a&&(a.innerHTML=V(t[n]??s))},650);return()=>window.clearInterval(o)}async function Ie(){try{let e=await J("/api/queue");return e.busy?e.message??ve:null}catch{return null}}function Fe(){ge.innerHTML=`
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
        <p class="hint pin-help">Don't know your PIN? You can recover it from the ${b(G,"Cook County Property Tax Portal")}.</p>

        ${Ce()}

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
    ${Le()}
    ${Re()}
  `}function S(e){let t=document.querySelector("#form-error");t&&(t.innerHTML=e?`<section class="error inline-error" role="alert">${i(e)}</section>`:"")}function y(e,t=!1){let n=document.querySelector("#report-status");n&&(n.innerHTML=e?`<p class="${t?"error inline-error":"notice inline-error"}">${i(e)}</p>`:"")}function De(){let e=document.querySelector("#report-panel"),t=document.querySelector("#report-context");if(!e)return;t&&f&&(t.value=`PIN ${f.case.parcel.pinFormatted}; venue ${f.routing.venue}; generated ${f.generatedAt}`),y(T?"":"Problem reporting is disabled until the Turnstile site key is configured.",!0),e.hidden=!1,e.querySelector("select, textarea, input, button")?.focus()}function Me(){let e=document.querySelector("#report-panel");e&&(e.hidden=!0)}function P(e,t){let n=new FormData(e).get(t);return typeof n=="string"?n:""}function I(e,t,n){let s=e.querySelector(`[data-conditional="${t}"]`);if(s){s.hidden=!n;for(let r of Array.from(s.querySelectorAll("input, select, textarea"))){if(!(r instanceof HTMLInputElement||r instanceof HTMLSelectElement||r instanceof HTMLTextAreaElement))continue;let o=r;o.disabled=!n,o.required=n,n||(o instanceof HTMLInputElement&&o.type==="radio"?o.checked=!1:o.value="")}}}function M(e){let t=P(e,"assessorAppealFiled")==="yes",n=P(e,"borAppealFiled")==="yes",s=P(e,"borDecisionReceived")==="yes";I(e,"assessorDecision",t),I(e,"borDecision",n),I(e,"borDecisionDate",n&&s)}function Ne(e){return S(""),M(e),e.reportValidity()?D(e,"ownershipType")!=="individual"?(S(be),!1):!0:!1}function Oe(e){return e.length===0?"":`<section class="warnings" aria-label="Warnings"><h2>Warnings</h2><ul>${e.map(t=>`<li>${F(t)}</li>`).join("")}</ul></section>`}function qe(){return`<section class="panel" aria-labelledby="exemptions">
    <h2 id="exemptions">Exemptions and past-year corrections</h2>
    <p>Exemptions are fixed reductions in taxable value for owner-occupants, seniors, veterans, people with disabilities, and some other homeowners. They can be worth more than an appeal.</p>
    <p>Check your exemptions on the ${b(ye,"Cook County Assessor exemptions page")} and the ${b(G,"Cook County Property Tax Portal")}. Bring documentation for any missing or incorrect exemption.</p>
    <p>A Certificate of Error is a Cook County process to fix past-year mistakes - like a missed exemption or wrong property facts - which can lead to a refund. Ask the Assessor's office about it.</p>
  </section>`}function _e(e){let t=e.routing,n=t.officialUrl?`<a href="${i(t.officialUrl)}" target="_blank" rel="noreferrer">Verify at the official source before filing</a>`:"";if(!t.deadline)return`<p>No computed deadline. ${n}</p>`;let s=t.daysRemaining===null?"":` ${t.daysRemaining>=0?`${t.daysRemaining} days remaining.`:`${Math.abs(t.daysRemaining)} days past the computed deadline.`}`;return`<p><strong>Deadline:</strong> ${i(t.deadline)}.${i(s)} ${n}</p>`}function He(e){let t=e.evidence.comparableAnalysis,n=v("What comparable profile means",'A "profile" is the set of matching rules this tool uses to pick similar homes for the specific venue: size, age, neighborhood, and which assessment number is compared, because each venue weighs comparables differently.'),s=t.status==="ok"?`<p>Comparable analysis completed with the ${i(t.profileLabel)} profile using ${i(t.metricLabel)} per square foot. ${n}</p>`:`<p>${i(t.note)}</p>`,r=v("What similarity score means","Lower similarity scores mean the comparable is more similar to the subject based on size, age, and distance."),o=w(t.profileKey),a=t.exhibit.map(p=>`<tr>
        <td>${i(p.comparable.pinFormatted)}</td>
        <td>${p.distanceKm===null?"Not available":g(p.distanceKm,2)}</td>
        <td>${i(p.comparable.neighborhood??"Not available")}</td>
        <td>${i(p.comparable.propertyClass??"Not available")}</td>
        <td>${g(p.comparable.buildingSqft)}</td>
        <td>${i(p.comparable.yearBuilt??"Not available")}</td>
        <td>${p.comparable.saleDate?i(x(p.comparable.saleDate)):"Not available"}</td>
        <td>${m(p.comparable.salePrice)}</td>
        <td>${i(o)}</td>
        <td>${m(p.avPerSqft)}</td>
        <td>${g(p.similarity,3)}</td>
      </tr>`).join(""),u=a.length===0?"<p>No lower-assessed comparable exhibit is available from the current public data.</p>":`<div class="table-wrap"><table>
          <thead><tr><th>PIN</th><th>Distance km</th><th>Neighborhood</th><th>Property class</th><th>Building sqft</th><th>Year built</th><th>Sale date</th><th>Sale price</th><th>Assessment type</th><th>Assessment $/sqft</th><th>Similarity score ${r}</th></tr></thead>
          <tbody>${a}</tbody>
        </table></div>`;return`<section class="panel" aria-labelledby="step-four">
    <div class="step-label">Step 4</div>
    <h2 id="step-four">Evidence summary</h2>
    <p class="metric-line"><strong>Evidence level:</strong> ${i(Ae(e.evidence.tier))}. ${i(e.evidence.tierMessage)} ${v("What evidence level means","The evidence level is a rough screen of how much public data supports spending time on an appeal.")}</p>
    ${s}
    <p><strong>Pool:</strong> ${g(t.poolSize)} similar homes, ${i(t.scope??"no scope")}; subject ${i(t.metricLabel)}/sqft ${m(t.subjectAvPerSqft)}; median ${m(t.medianAvPerSqft)}; gap ${g(t.gapPct,1)}%.</p>
    ${u}
    <h3 class="heading-with-tooltip">Arguments ${v("What arguments mean","An argument is a distinct reason the assessment may be too high: uniformity, overvaluation, description error, or assessment shock. Strength labels are rough screens, not legal conclusions.")}</h3>
    ${e.evidence.arguments.length?`<ul>${e.evidence.arguments.map(p=>`<li><strong>${i(p.argumentType)}:</strong> ${i(p.text)}</li>`).join("")}</ul>`:"<p>No strong public-data argument was found. Add sale, appraisal, condition, or factual-error evidence if available.</p>"}
    <h3 class="heading-with-tooltip">Rough savings estimate ${v("How rough savings are estimated","Estimated savings = \u0394AV \xD7 E \xD7 r, where \u0394AV is the assessed-value reduction, E is the state equalizer, and r is the assumed tax rate. The range is shown as \xB120% and is not a promise.")}</h3>
    <p>${m(e.evidence.savingsAssumptions.low)} to ${m(e.evidence.savingsAssumptions.high)}, with point estimate ${m(e.evidence.savingsAssumptions.point)}.</p>
    <p class="hint">Assumes equalizer ${e.evidence.savingsAssumptions.stateEqualizer} and ${i(e.evidence.savingsAssumptions.taxRateSource)}; this is a rough range, not a promise.</p>
  </section>`}function Ue(e,t){f=e;let n=e.case.parcel,s=[n.address,n.city,n.zipCode].filter(Boolean).join(", "),r=[e.case.userEvidence.actualSqft?`Actual sqft ${g(e.case.userEvidence.actualSqft)}`:"",e.case.userEvidence.actualAv?`Actual AV ${m(e.case.userEvidence.actualAv)}`:"",e.case.userEvidence.actualImprovementAv?`Actual improvement AV ${m(e.case.userEvidence.actualImprovementAv)}`:""].filter(Boolean),o=new URLSearchParams(t);o.set("pin",n.pin);let a=document.querySelector("#results");a&&(a.innerHTML=`
    <section class="notice"><strong>${i(e.evidence.disclaimers[0])}</strong></section>
    <section class="panel" aria-labelledby="step-three">
      <div class="step-label">Step 3</div>
      <h2 id="step-three">Routing decision</h2>
      <p class="headline">${i(e.routing.headline)}</p>
      ${_e(e)}
      <ul>${e.routing.reasoning.map(u=>`<li>${F(u)}</li>`).join("")}</ul>
    </section>

    <section class="subject panel">
      <h2>Subject property</h2>
      <dl>
        <div><dt>PIN</dt><dd>${i(n.pinFormatted)}</dd></div>
        ${s?`<div><dt>Address</dt><dd>${i(s)}</dd></div>`:""}
        <div><dt>Class / township</dt><dd>${i(n.propertyClass)} / ${i(n.townshipName)}</dd></div>
        <div><dt>Building sqft</dt><dd>${g(n.buildingSqft)}</dd></div>
        <div><dt>Total AV</dt><dd>${m(n.currentAv)}</dd></div>
        <div><dt>Improvement AV</dt><dd>${m(n.currentImprovementAv)}</dd></div>
      </dl>
      ${r.length?`<p class="tagline">${i(r.join("; "))} - user-supplied; documentation required.</p>`:""}
    </section>

    ${He(e)}

    <section class="panel" aria-labelledby="step-five">
      <div class="step-label">Step 5</div>
      <h2 id="step-five">${i(e.venue.name)} checklist</h2>
      <p class="hint">Use this checklist to assemble documents before filing at the official venue.</p>
      <ul>${e.venue.checklist.map(u=>`<li>${F(u)}</li>`).join("")}</ul>
      <div class="actions">
        <a class="button-link" href="/print?${o.toString()}">Print / Save as PDF</a>
        <button type="button" id="download-comps" class="secondary">Download comps (.xlsx)</button>
      </div>
    </section>

    ${qe()}

    ${Oe(e.warnings)}
  `)}function j(){f=null,S("");for(let e of["#results","#address-results"]){let t=document.querySelector(e);t&&(t.innerHTML="")}}async function Be(e){j();let t=Pe(await Ie());try{let n=await J(`/api/case?${e.toString()}`);j(),Ue(n,e)}catch(n){let s=document.querySelector("#results");s&&(s.innerHTML=`<section class="error" role="alert">${i(n instanceof Error?n.message:"The case could not be loaded.")}</section>`)}finally{t();let n=document.querySelector("#progress");n&&(n.innerHTML="")}}async function We(e){if(!Ne(e))return;let t=new URLSearchParams,n=D(e,"pin");if($e(t,e),n){t.set("pin",n),await Be(t);return}let s=document.querySelector("#results");s&&(s.innerHTML='<section class="error" role="alert">Enter a PIN.</section>')}async function Ve(e){if(!T){y("Problem reporting is disabled until the Turnstile site key is configured.",!0);return}if(!e.reportValidity())return;let t=new FormData(e),n=t.get("cf-turnstile-response");y("Submitting report...");let s=await fetch("/api/report",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({category:t.get("category"),description:t.get("description"),context:t.get("context"),turnstileToken:typeof n=="string"?n:""})}),r=await s.json();if(!s.ok||!r.ok){y(r.ok?"The report could not be submitted.":r.error?.message??"The report could not be submitted.",!0);return}y(`Report submitted: ${r.issueUrl}`),e.reset()}function je(){let e=document.querySelector("details.evidence");if(e)for(let t of Array.from(e.querySelectorAll("[data-evidence-input]")))(t instanceof HTMLInputElement||t instanceof HTMLTextAreaElement)&&(t.value="")}function N(e=null){for(let t of Array.from(document.querySelectorAll(".tooltip-toggle"))){if(t===e)continue;let n=t.getAttribute("aria-describedby"),s=n?document.getElementById(n):null;t.setAttribute("aria-expanded","false"),s&&s.removeAttribute("style")}}function Ye(e,t){if(t.removeAttribute("style"),!window.matchMedia("(max-width: 760px)").matches)return;let n=e.getBoundingClientRect(),s=16,r=n.bottom+8,o=window.innerHeight-t.offsetHeight-s,a=Math.max(s,Math.min(r,o));t.style.position="fixed",t.style.inset=`${a}px ${s}px auto ${s}px`,t.style.width="auto",t.style.transform="none"}function ze(e){let t=e.getAttribute("aria-describedby"),n=t?document.getElementById(t):null;if(!n)return;let s=e.getAttribute("aria-expanded")!=="true";N(s?e:null),e.setAttribute("aria-expanded",String(s)),s?Ye(e,n):n.removeAttribute("style")}function Ge(){if(!f)return;let e=U(f),t=new ArrayBuffer(e.byteLength);new Uint8Array(t).set(e);let n=new Blob([t],{type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}),s=URL.createObjectURL(n),r=document.createElement("a");r.href=s,r.download=H(f),document.body.appendChild(r),r.click(),r.remove(),URL.revokeObjectURL(s)}Fe();var Y=document.querySelector("#case-form");Y&&M(Y);document.addEventListener("submit",e=>{let t=e.target;t instanceof HTMLFormElement&&t.id==="case-form"&&(e.preventDefault(),We(t)),t instanceof HTMLFormElement&&t.id==="report-form"&&(e.preventDefault(),Ve(t))});document.addEventListener("change",e=>{let t=e.target;if(t instanceof HTMLInputElement||t instanceof HTMLSelectElement||t instanceof HTMLTextAreaElement){let n=t.form;n?.id==="case-form"&&(S(""),M(n))}});document.addEventListener("click",e=>{let t=e.target;if(t instanceof HTMLElement){let n=t.closest(".tooltip-toggle");if(n){ze(n);return}N()}t instanceof HTMLElement&&t.id==="clear-evidence"&&je(),t instanceof HTMLElement&&t.id==="download-comps"&&Ge(),t instanceof HTMLElement&&t.id==="report-problem"&&De(),t instanceof HTMLElement&&(t.id==="close-report"||t.id==="report-panel")&&Me()});document.addEventListener("keydown",e=>{e.key==="Escape"&&N()});document.documentElement.dataset.enhanced="true";
