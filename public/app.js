function y(e){return e==="assessor"?"Total AV":"Improvement AV"}function h(e){let[t,n,s]=e.split("/"),o=Number(t),a=Number(n),i=Number(s);return fe(i,o,a)}function fe(e,t,n){return`${e.toString().padStart(4,"0")}-${t.toString().padStart(2,"0")}-${n.toString().padStart(2,"0")}`}var wt=+"3.0300";var C="https://www.cookcountyassessoril.gov/assessment-calendar-and-deadlines";var $="https://www.cookcountyboardofreview.com/sites/g/files/ywwepo261/files/document/file/2025-07/2025TOWNSHIPOPEN-CLOSE.pdf";var U="https://ptab.illinois.gov/";function l(e,t,n=null){return{opens:h(e),closes:h(t),evidenceDeadline:n?h(n):null}}var Tt={venueLabel:"Cook County Assessor",sessionLabel:"Tax Year 2026 Assessor Appeal Windows",sessionEnd:h("8/12/2026"),sourceUrl:C,sourceNote:"Manual authority file 'Assessment & Appeal Calendar _ Cook County Assessor's Office.pdf' extracted on 2026-07-06 from the official Assessor calendar page, which reported Last updated: 6/29/26. Direct shell automation still returned CloudFront 403, so manually verify at the official source before filing."},R={Barrington:[],Berwyn:[l("5/20/2026","7/6/2026")],Bloom:[],Bremen:[],Calumet:[],Cicero:[l("6/17/2026","7/31/2026")],"Elk Grove":[l("6/22/2026","8/4/2026")],Evanston:[l("4/22/2026","6/4/2026")],Hanover:[],"Hyde Park":[],Jefferson:[],Lake:[],Lakeview:[l("5/28/2026","7/13/2026")],Lemont:[],Leyden:[],Lyons:[],Maine:[l("6/5/2026","7/21/2026")],"New Trier":[l("5/7/2026","6/22/2026")],Niles:[],"North Chicago":[],Northfield:[],"Norwood Park":[l("4/13/2026","5/26/2026")],"Oak Park":[l("5/6/2026","6/18/2026")],Orland:[],Palatine:[],Palos:[l("6/3/2026","7/17/2026")],Proviso:[],Rich:[],"River Forest":[l("4/20/2026","6/2/2026")],Riverside:[l("4/24/2026","6/8/2026")],"Rogers Park":[l("4/17/2026","6/1/2026")],Schaumburg:[],"South Chicago":[],Stickney:[l("6/29/2026","8/12/2026")],Thornton:[],"West Chicago":[],Wheeling:[],Worth:[]},At={venueLabel:"Cook County Board of Review",sessionLabel:"Tax Year 2025 - Cook County Board of Review 2025-26 Session",sessionEnd:h("6/3/2026"),sourceUrl:$,sourceNote:"BOR 2025 township date PDF linked from the official Board of Review site."},A={1:{townships:["Berwyn","Evanston","Norwood Park","River Forest","Riverside","Rogers Park"],windows:[l("7/7/2025","8/5/2025","8/15/2025"),l("12/3/2025","12/12/2025","12/22/2025")]},"2a":{townships:["Cicero","Oak Park","Palos"],windows:[l("7/21/2025","8/19/2025","8/29/2025"),l("12/3/2025","12/12/2025","12/22/2025")]},"2b":{townships:["Elk Grove","Lakeview","Lyons","New Trier"],windows:[l("8/18/2025","9/16/2025","9/26/2025"),l("12/3/2025","12/12/2025","12/22/2025")]},3:{townships:["Barrington","Maine","Northfield","Stickney","West Chicago"],windows:[l("9/22/2025","10/21/2025","10/31/2025"),l("12/3/2025","12/12/2025","12/22/2025")]},4:{townships:["Bremen","Calumet","Hyde Park","Lemont","Leyden","Worth"],windows:[l("10/23/2025","11/21/2025","12/1/2025"),l("12/3/2025","12/12/2025","12/22/2025")]},5:{townships:["Jefferson","Proviso","Wheeling"],windows:[l("11/20/2025","12/19/2025","12/29/2025")]},6:{townships:["Lake","Orland","Palatine","Schaumburg","Thornton"],windows:[l("1/5/2026","2/3/2026","2/13/2026")]},7:{townships:["Bloom","Hanover","Niles","Rich","North Chicago","South Chicago"],windows:[l("1/20/2026","2/18/2026","2/28/2026")]}};var St=Object.fromEntries(Object.entries(A).flatMap(([e,t])=>t.townships.map(n=>[n,e])));var S="";var B="appealcompass:lastAssessment";function ge(e,t,n=new Date().toISOString()){return JSON.stringify({queryString:e.toString(),payload:t,savedAt:n})}function he(e){if(!e)return null;try{let t=JSON.parse(e);return!t||typeof t!="object"||typeof t.queryString!="string"||typeof t.savedAt!="string"||!("payload"in t)?null:{query:new URLSearchParams(t.queryString),payload:t.payload,savedAt:t.savedAt}}catch{return null}}function W(e,t,n){try{return e.setItem(B,ge(t,n)),!0}catch{return!1}}function j(e){try{return he(e.getItem(B))}catch{return null}}var V=new TextEncoder;function be(e){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function ye(e){return e&&typeof e=="object"&&"value"in e?e:{value:e}}function ve(e){let t=e+1,n="";for(;t>0;){let s=(t-1)%26;n=String.fromCharCode(65+s)+n,t=Math.floor((t-1)/26)}return n}function we(e,t,n){let s=ye(e),o=`${ve(n)}${t}`,a=s.style===void 0?"":` s="${s.style}"`;if(typeof s.value=="number"&&Number.isFinite(s.value))return`<c r="${o}"${a}><v>${s.value}</v></c>`;let i=s.value===null||s.value===""?"Not available":s.value;return`<c r="${o}" t="inlineStr"${a}><is><t>${be(i)}</t></is></c>`}function Y(e){return`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetViews><sheetView workbookViewId="0"/></sheetViews>
  <sheetFormatPr defaultRowHeight="15"/>
  <cols><col min="1" max="11" width="22" customWidth="1"/></cols>
  <sheetData>${e.map((n,s)=>`<row r="${s+1}">${n.map((o,a)=>we(o,s+1,a)).join("")}</row>`).join("")}</sheetData>
</worksheet>`}function Te(){return`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets><sheet name="Comps" sheetId="1" r:id="rId1"/><sheet name="Similar Homes" sheetId="2" r:id="rId2"/></sheets>
</workbook>`}function Ae(){return`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`}function Se(){return`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`}function xe(){return`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>`}function ke(){return`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="2"><font><sz val="11"/><name val="Aptos"/></font><font><b/><sz val="11"/><name val="Aptos"/></font></fonts>
  <fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FFEFE3C1"/><bgColor indexed="64"/></patternFill></fill></fills>
  <borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>
  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
  <cellXfs count="3"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/><xf numFmtId="0" fontId="1" fillId="1" borderId="0" xfId="0" applyFont="1" applyFill="1"/></cellXfs>
  <cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>`}function z(){return[{value:"PIN",style:2},{value:"Distance km",style:2},{value:"Neighborhood",style:2},{value:"Property class",style:2},{value:"Building sqft",style:2},{value:"Year built",style:2},{value:"Sale date",style:2},{value:"Sale price",style:2},{value:"Assessment type",style:2},{value:"Assessment $/sqft",style:2},{value:"Similarity score",style:2}]}function G(e,t){return e.map(n=>[n.comparable.pinFormatted,n.distanceKm,n.comparable.neighborhood,n.comparable.propertyClass,n.comparable.buildingSqft,n.comparable.yearBuilt,n.comparable.saleDate,n.comparable.salePrice,t,n.avPerSqft,n.similarity])}function Le(e){let t=e.case.parcel,n=e.evidence.comparableAnalysis,s=e.evidence.savingsAssumptions,o=y(n.profileKey);return[[{value:"Subject Property Summary",style:1}],["PIN",t.pinFormatted],["Class / Township",`${t.propertyClass} / ${t.townshipName}`],["Building Sqft",t.buildingSqft],["Total AV",t.currentAv],["Improvement AV",t.currentImprovementAv],["Implied Market Value",e.evidence.impliedMarketValue],[],[{value:"Comparable Exhibit",style:1}],z(),...G(n.exhibit,o),[],[{value:"Analysis Stats",style:1}],["Pool size",n.poolSize],["Median assessment $/sqft",n.medianAvPerSqft],["Percentile",n.percentile],["Gap %",n.gapPct],[],[{value:"Savings Calculation",style:1}],["State equalizer",s.stateEqualizer],["Assumed tax rate",s.taxRate],["Tax rate source",s.taxRateSource],["Low estimate",s.low],["Point estimate",s.point],["High estimate",s.high],["Formula","estimated savings = Delta AV x E x r, shown as a +/-20% range; not a promise"]]}function Ee(e){let t=e.evidence.comparableAnalysis,n=y(t.profileKey);return[[{value:"Similar Homes",style:1}],["This sheet lists the full selected comparable pool, not only the lower-assessed exhibit."],z(),...G(t.pool,n)]}function Ce(){let e=new Uint32Array(256);for(let t=0;t<256;t+=1){let n=t;for(let s=0;s<8;s+=1)n=n&1?3988292384^n>>>1:n>>>1;e[t]=n>>>0}return e}var $e=Ce();function Re(e){let t=4294967295;for(let n of e)t=t>>>8^($e[(t^n)&255]??0);return(t^4294967295)>>>0}function c(e,t){e.push(t&255,t>>>8&255)}function p(e,t){e.push(t&255,t>>>8&255,t>>>16&255,t>>>24&255)}function P(e,t){for(let n of t)e.push(n)}function Pe(e){let t=[],n=[],s=e.map(a=>{let i=V.encode(a.text);return{path:a.path,data:i,crc:Re(i)}});for(let a of s){let i=t.length,d=V.encode(a.path);p(t,67324752),c(t,20),c(t,0),c(t,0),c(t,0),c(t,0),p(t,a.crc),p(t,a.data.length),p(t,a.data.length),c(t,d.length),c(t,0),P(t,d),P(t,a.data),p(n,33639248),c(n,20),c(n,20),c(n,0),c(n,0),c(n,0),c(n,0),p(n,a.crc),p(n,a.data.length),p(n,a.data.length),c(n,d.length),c(n,0),c(n,0),c(n,0),c(n,0),p(n,0),p(n,i),P(n,d)}let o=t.length;return t.push(...n),p(t,101010256),c(t,0),c(t,0),c(t,s.length),c(t,s.length),p(t,n.length),p(t,o),c(t,0),new Uint8Array(t)}function X(e){return`appeal-compass-comps-${e.case.parcel.pin}.xlsx`}function K(e){return Pe([{path:"[Content_Types].xml",text:xe()},{path:"_rels/.rels",text:Se()},{path:"xl/workbook.xml",text:Te()},{path:"xl/_rels/workbook.xml.rels",text:Ae()},{path:"xl/styles.xml",text:ke()},{path:"xl/worksheets/sheet1.xml",text:Y(Le(e))},{path:"xl/worksheets/sheet2.xml",text:Y(Ee(e))}])}var ne=document.querySelector("#app");if(!ne)throw new Error("Missing app root.");var Ie=ne,Fe=new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}),Me="Appeal Compass is designed only for individual residential homeowners appealing their own home; if interested in a similar tool for commercial properties please reach out here.",He="Appeal Compass is busy helping other homeowners right now. You're in line \u2014 keep this page open and your assessment will start automatically.",qe="https://www.cookcountyassessoril.gov/exemptions",se="https://www.cookcountypropertyinfo.com/",oe=S.length>0,k=oe,L=oe,J=0,f=null;function r(e){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function b(e,t){return`<a href="${r(e)}" target="_blank" rel="noreferrer">${r(t)}<span class="sr-only"> (opens in new tab)</span></a>`}function re(e,t,n="?",s=""){J+=1;let o=`tooltip-${J}`;return`<span class="${s?`tooltip ${s}`:"tooltip"}">
    <button class="tooltip-toggle" type="button" aria-label="${r(e)}" aria-expanded="false" aria-describedby="${o}">${r(n)}</button>
    <span class="tooltip-bubble" id="${o}" role="tooltip">${r(t)}</span>
  </span>`}function v(e,t){return re(e,t)}function De(e,t){return re(e,t,"!","warning-tooltip")}function H(e){let t=String(e??""),n=/https?:\/\/[^\s<>"']+/g,s="",o=0;for(let a of t.matchAll(n)){let i=a[0],d=a.index??0,u=i.match(/[.,;:)]+$/)?.[0]??"",_=i.slice(0,i.length-u.length);s+=r(t.slice(o,d)),s+=`<a href="${r(_)}" target="_blank" rel="noreferrer">${r(_)}<span class="sr-only"> (opens in new tab)</span></a>${r(u)}`,o=d+i.length}return s+r(t.slice(o))}function m(e){return e===null?"Not available":Fe.format(e)}function g(e,t=0){return e===null?"Not available":e.toLocaleString("en-US",{maximumFractionDigits:t})}function Ne(e){return e==="LIMITED"?"No evidence found":e==="STRONG"?"Strong":e==="MODERATE"?"Moderate":e}function Oe(){let e=new Date,t=e.getFullYear(),n=String(e.getMonth()+1).padStart(2,"0"),s=String(e.getDate()).padStart(2,"0");return`${t}-${n}-${s}`}function x(e){let[t,n,s]=e.split("-"),o=Number(t),a=Number(n),i=Number(s);return!Number.isFinite(o)||!Number.isFinite(a)||!Number.isFinite(i)?e:new Date(Date.UTC(o,a-1,i)).toLocaleDateString("en-US",{year:"numeric",month:"short",day:"numeric",timeZone:"UTC"})}function _e(e,t){return e.length>0&&e.every(n=>t>n.closes)}function ae(e){let t=e.evidenceDeadline?`; evidence due ${x(e.evidenceDeadline)}`:"";return`${x(e.opens)} to ${x(e.closes)}${t}`}function Ue(){return Object.entries(R).flatMap(([t,n])=>n.map(s=>`<li>${r(t)}: ${r(ae(s))}</li>`)).join("")||"<li>No configured Assessor filing windows are available in the current data.</li>"}function Be(){return Object.entries(A).map(([e,t])=>{let n=t.windows.map(s=>ae(s)).join("; ");return`<li>Group ${r(e)} (${r(t.townships.join(", "))}): ${r(n)}</li>`}).join("")}function Q(e,t){let n=e==="assessor"?Object.values(R).flat():Object.values(A).flatMap(o=>o.windows);return _e(n,t)?De(`${e==="assessor"?"Assessor":"Board of Review"} calendar warning`,`All configured deadlines for this venue appear to be past as of ${t}. The data may be stale; verify at the official source before filing. You can still select this venue to prepare for the next session.`):""}function I(e){return`<div class="venue-option">
    <label class="venue-choice">
      <input type="radio" name="venue" value="${e.value}" required>
      <span>${r(e.label)}</span>
      ${e.warning??""}
    </label>
    ${e.details}
  </div>`}function We(){let e=Oe();return`<fieldset class="question-group venue-picker">
    <legend>Where do you want to appeal?</legend>
    <div class="venue-options">
      ${I({value:"assessor",label:"Cook County Assessor",warning:Q("assessor",e),details:`<details class="venue-details">
          <summary>About the Assessor path</summary>
          <p>The Assessor is the first-level Cook County appeal venue. Start here for current-year assessment challenges and documented property-description errors.</p>
          <p>Use this path if you are within the township filing window or preparing for the next Assessor session.</p>
          <p>Official source: ${b(C,"Cook County Assessor calendar")}. Verify at the official source before filing.</p>
          <ul class="deadline-list">${Ue()}</ul>
        </details>`})}
      ${I({value:"bor",label:"Cook County Board of Review",warning:Q("bor",e),details:`<details class="venue-details">
          <summary>About the BOR path</summary>
          <p>The Board of Review is the second-level Cook County appeal venue and has its own township filing and evidence deadlines.</p>
          <p>Use this path if you are filing at BOR, preparing after an Assessor appeal, or checking BOR-specific comparable evidence.</p>
          <p>Official source: ${b($,"Cook County BOR township dates")}. Verify at the official source before filing.</p>
          <ul class="deadline-list">${Be()}</ul>
        </details>`})}
      ${I({value:"ptab",label:"Illinois PTAB",details:`<details class="venue-details">
          <summary>About the PTAB path</summary>
          <p>PTAB is the Illinois state appeal board available after a written BOR decision for the same tax year.</p>
          <p>Use this path only when you have, or are preparing for, a BOR decision notice. The deadline is generally 30 days from the written BOR decision date; Appeal Compass will not guess it without that date.</p>
          <p>Official source: ${b(U,"Illinois PTAB")}. Verify at the official source before filing.</p>
        </details>`})}
    </div>
  </fieldset>`}async function ie(e){let t=await fetch(e,{headers:{accept:"application/json"}}),n=await t.json();if(!t.ok||typeof n=="object"&&n&&"ok"in n&&n.ok===!1){let s=n.error?.message??"The request failed.";throw new Error(s)}return n}function D(e,t){let n=new FormData(e).get(t);return typeof n=="string"?n.trim():""}function je(e,t){let n=["jurisdiction","venue","ownershipType","assessorAppealFiled","assessorDecisionReceived","borAppealFiled","borDecisionReceived","borDecisionDate","purchasePrice","purchaseDate","appraisalValue","appraisalDate","actualSqft","actualAv","actualImprovementAv"];for(let s of n){let o=D(t,s);o&&e.set(s,o)}}function Z(e){return`<section class="progress" aria-live="polite"><p>${r(e)}</p></section>`}function le(){return`<svg aria-hidden="true" class="github-mark" viewBox="0 0 16 16" width="20" height="20">
    <path fill="currentColor" d="M8 0C3.58 0 0 3.67 0 8.2c0 3.62 2.29 6.69 5.47 7.78.4.08.55-.18.55-.39 0-.19-.01-.84-.01-1.53-2.01.38-2.53-.5-2.69-.96-.09-.24-.48-.96-.82-1.16-.28-.16-.68-.55-.01-.56.63-.01 1.08.59 1.23.84.72 1.24 1.87.89 2.33.68.07-.53.28-.89.51-1.09-1.78-.21-3.64-.91-3.64-4.04 0-.89.31-1.62.82-2.19-.08-.21-.36-1.04.08-2.16 0 0 .67-.22 2.2.84A7.43 7.43 0 0 1 8 3.98c.68 0 1.36.09 2 .28 1.53-1.06 2.2-.84 2.2-.84.44 1.12.16 1.95.08 2.16.51.57.82 1.3.82 2.19 0 3.14-1.87 3.83-3.65 4.04.29.26.54.76.54 1.54 0 1.11-.01 2-.01 2.27 0 .21.15.47.55.39A8.08 8.08 0 0 0 16 8.2C16 3.67 12.42 0 8 0Z"/>
  </svg>`}function Ve(){return`<footer class="site-footer">
    <p class="project-credit">Appeal Compass is an open-source project developed by <a href="https://github.com/tommasodesantis" target="_blank" rel="noreferrer">Tommaso De Santis<span class="sr-only"> (opens in new tab)</span></a> under GPLv3.</p>
    <a class="footer-icon-link" href="https://github.com/tommasodesantis/appealcompass" target="_blank" rel="noreferrer">${le()}<span>View on GitHub</span><span class="sr-only"> (opens in new tab)</span></a>
    <a href="https://ko-fi.com/tomdesantis" target="_blank" rel="noreferrer">Donations help the project grow and cover hosting and maintenance costs.<span class="sr-only"> (opens in new tab)</span></a>
    <button type="button" id="report-problem" class="link-button">Report a problem</button>
  </footer>`}function Ye(){return`<a class="header-icon-link" href="https://github.com/tommasodesantis/appealcompass" target="_blank" rel="noreferrer">${le()}<span>View on GitHub</span><span class="sr-only"> (opens in new tab)</span></a>`}function ze(){let e=k?"":" disabled",t=k?`<div class="cf-turnstile" data-sitekey="${r(S)}"></div>`:'<p class="hint">Problem reporting is disabled until the Turnstile site key is configured.</p>';return`<section id="report-panel" class="report-panel" hidden>
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
  </section>`}function Ge(){return`<section id="entity-refusal-panel" class="modal-panel" hidden>
    <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="entity-refusal-title">
      <button type="button" id="close-entity-refusal" class="secondary close-button">Close</button>
      <h2 id="entity-refusal-title">Residential homeowners only</h2>
      <p>${r(Me).replace("here.",'<a href="#contact-panel" id="open-contact-from-refusal">here</a>.')}</p>
    </div>
  </section>`}function Xe(){let e=L?"":" disabled",t=L?`<div class="cf-turnstile" data-sitekey="${r(S)}"></div>`:'<p class="hint">Contact is disabled until the Turnstile site key is configured.</p>';return`<section id="contact-panel" class="modal-panel" hidden>
    <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="contact-title">
      <button type="button" id="close-contact" class="secondary close-button">Close</button>
      <h2 id="contact-title">Commercial-property interest</h2>
      <form id="contact-form" class="stack">
        <label>
          <span>Name (optional)</span>
          <input name="name" maxlength="120"${e}>
        </label>
        <label>
          <span>Email (optional)</span>
          <input name="email" type="email" maxlength="254"${e}>
        </label>
        <label>
          <span>Message</span>
          <textarea name="message" rows="5" maxlength="4000" required${e}></textarea>
        </label>
        ${t}
        <div id="contact-status" aria-live="polite"></div>
        <button type="submit"${e}>Send message</button>
      </form>
    </div>
  </section>`}function Ke(e=null){let t=e?[e]:["Looking up your property...","Fetching assessment history...","Finding similar homes...","Building the evidence summary..."],n=0,s=t[0]??"",o=document.querySelector("#progress");o&&(o.innerHTML=Z(t[n]??s));let a=window.setInterval(()=>{n=(n+1)%t.length;let i=document.querySelector("#progress");i&&(i.innerHTML=Z(t[n]??s))},650);return()=>window.clearInterval(a)}async function Je(){try{let e=await ie("/api/queue");return e.busy?e.message??He:null}catch{return null}}function Qe(){Ie.innerHTML=`
    <header class="topline">
      <div class="topline-head">
        <h1>Appeal Compass</h1>
        ${Ye()}
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
        <p class="hint pin-help">Don't know your PIN? You can recover it from the ${b(se,"Cook County Property Tax Portal")}.</p>

        ${We()}

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
    ${Ve()}
    ${ze()}
    ${Ge()}
    ${Xe()}
  `}function N(e){let t=document.querySelector("#form-error");t&&(t.innerHTML=e?`<section class="error inline-error" role="alert">${r(e)}</section>`:"")}function w(e,t=!1){let n=document.querySelector("#report-status");n&&(n.innerHTML=e?`<p class="${t?"error inline-error":"notice inline-error"}">${r(e)}</p>`:"")}function T(e,t=!1){let n=document.querySelector("#contact-status");n&&(n.innerHTML=e?`<p class="${t?"error inline-error":"notice inline-error"}">${r(e)}</p>`:"")}function Ze(){let e=document.querySelector("#report-panel"),t=document.querySelector("#report-context");if(!e)return;t&&f&&(t.value=`PIN ${f.case.parcel.pinFormatted}; venue ${f.routing.venue}; generated ${f.generatedAt}`),w(k?"":"Problem reporting is disabled until the Turnstile site key is configured.",!0),e.hidden=!1,e.querySelector("select, textarea, input, button")?.focus()}function ce(){let e=document.querySelector("#report-panel");e&&(e.hidden=!0)}function et(){let e=document.querySelector("#entity-refusal-panel");if(!e)return;e.hidden=!1,e.querySelector("a, button")?.focus()}function q(){let e=document.querySelector("#entity-refusal-panel");e&&(e.hidden=!0)}function tt(){let e=document.querySelector("#contact-panel");if(!e)return;T(L?"":"Contact is disabled until the Turnstile site key is configured.",!0),e.hidden=!1,e.querySelector("input, textarea, button")?.focus()}function ue(){let e=document.querySelector("#contact-panel");e&&(e.hidden=!0)}function F(e,t){let n=new FormData(e).get(t);return typeof n=="string"?n:""}function M(e,t,n){let s=e.querySelector(`[data-conditional="${t}"]`);if(s){s.hidden=!n;for(let o of Array.from(s.querySelectorAll("input, select, textarea"))){if(!(o instanceof HTMLInputElement||o instanceof HTMLSelectElement||o instanceof HTMLTextAreaElement))continue;let a=o;a.disabled=!n,a.required=n,n||(a instanceof HTMLInputElement&&a.type==="radio"?a.checked=!1:a.value="")}}}function E(e){let t=F(e,"assessorAppealFiled")==="yes",n=F(e,"borAppealFiled")==="yes",s=F(e,"borDecisionReceived")==="yes";M(e,"assessorDecision",t),M(e,"borDecision",n),M(e,"borDecisionDate",n&&s)}function nt(e){return N(""),E(e),e.reportValidity()?D(e,"ownershipType")!=="individual"?(et(),!1):!0:!1}function st(e){return e.length===0?"":`<section class="warnings" aria-label="Warnings"><h2>Warnings</h2><ul>${e.map(t=>`<li>${H(t)}</li>`).join("")}</ul></section>`}function ot(){return`<section class="panel" aria-labelledby="exemptions">
    <h2 id="exemptions">Exemptions and past-year corrections</h2>
    <p>Exemptions are fixed reductions in taxable value for owner-occupants, seniors, veterans, people with disabilities, and some other homeowners. They can be worth more than an appeal.</p>
    <p>Check your exemptions on the ${b(qe,"Cook County Assessor exemptions page")} and the ${b(se,"Cook County Property Tax Portal")}. Bring documentation for any missing or incorrect exemption.</p>
    <p>A Certificate of Error is a Cook County process to fix past-year mistakes - like a missed exemption or wrong property facts - which can lead to a refund. Ask the Assessor's office about it.</p>
  </section>`}function rt(e){let t=e.routing,n=t.officialUrl?`<a href="${r(t.officialUrl)}" target="_blank" rel="noreferrer">Verify at the official source before filing</a>`:"";if(!t.deadline)return`<p>No computed deadline. ${n}</p>`;let s=t.daysRemaining===null?"":` ${t.daysRemaining>=0?`${t.daysRemaining} days remaining.`:`${Math.abs(t.daysRemaining)} days past the computed deadline.`}`;return`<p><strong>Deadline:</strong> ${r(t.deadline)}.${r(s)} ${n}</p>`}function at(e){let t=e.evidence.comparableAnalysis,n=v("What comparable profile means",'A "profile" is the set of matching rules this tool uses to pick similar homes for the specific venue: size, age, neighborhood, and which assessment number is compared, because each venue weighs comparables differently.'),s=t.status==="ok"?`<p>Comparable analysis completed with the ${r(t.profileLabel)} profile using ${r(t.metricLabel)} per square foot. ${n}</p>`:`<p>${r(t.note)}</p>`,o=v("What similarity score means","Lower similarity scores mean the comparable is more similar to the subject based on size, age, and distance."),a=y(t.profileKey),i=t.exhibit.map(u=>`<tr>
        <td>${r(u.comparable.pinFormatted)}</td>
        <td>${u.distanceKm===null?"Not available":g(u.distanceKm,2)}</td>
        <td>${r(u.comparable.neighborhood??"Not available")}</td>
        <td>${r(u.comparable.propertyClass??"Not available")}</td>
        <td>${g(u.comparable.buildingSqft)}</td>
        <td>${r(u.comparable.yearBuilt??"Not available")}</td>
        <td>${u.comparable.saleDate?r(x(u.comparable.saleDate)):"Not available"}</td>
        <td>${m(u.comparable.salePrice)}</td>
        <td>${r(a)}</td>
        <td>${m(u.avPerSqft)}</td>
        <td>${g(u.similarity,3)}</td>
      </tr>`).join(""),d=i.length===0?"<p>No lower-assessed comparable exhibit is available from the current public data.</p>":`<div class="table-wrap"><table>
          <thead><tr><th>PIN</th><th>Distance km</th><th>Neighborhood</th><th>Property class</th><th>Building sqft</th><th>Year built</th><th>Sale date</th><th>Sale price</th><th>Assessment type</th><th>Assessment $/sqft</th><th>Similarity score ${o}</th></tr></thead>
          <tbody>${i}</tbody>
        </table></div>`;return`<section class="panel" aria-labelledby="step-four">
    <div class="step-label">Step 4</div>
    <h2 id="step-four">Evidence summary</h2>
    <p class="metric-line"><strong>Evidence level:</strong> ${r(Ne(e.evidence.tier))}. ${r(e.evidence.tierMessage)} ${v("What evidence level means","The evidence level is a rough screen of how much public data supports spending time on an appeal.")}</p>
    ${s}
    <p><strong>Pool:</strong> ${g(t.poolSize)} similar homes, ${r(t.scope??"no scope")}; subject ${r(t.metricLabel)}/sqft ${m(t.subjectAvPerSqft)}; median ${m(t.medianAvPerSqft)}; gap ${g(t.gapPct,1)}%.</p>
    ${d}
    <h3 class="heading-with-tooltip">Arguments ${v("What arguments mean","An argument is a distinct reason the assessment may be too high: uniformity, overvaluation, description error, or assessment shock. Strength labels are rough screens, not legal conclusions.")}</h3>
    ${e.evidence.arguments.length?`<ul>${e.evidence.arguments.map(u=>`<li><strong>${r(u.argumentType)}:</strong> ${r(u.text)}</li>`).join("")}</ul>`:"<p>No strong public-data argument was found. Add sale, appraisal, condition, or factual-error evidence if available.</p>"}
    <h3 class="heading-with-tooltip">Rough savings estimate ${v("How rough savings are estimated","Estimated savings = \u0394AV \xD7 E \xD7 r, where \u0394AV is the assessed-value reduction, E is the state equalizer, and r is the assumed tax rate. The range is shown as \xB120% and is not a promise.")}</h3>
    <p>${m(e.evidence.savingsAssumptions.low)} to ${m(e.evidence.savingsAssumptions.high)}, with point estimate ${m(e.evidence.savingsAssumptions.point)}.</p>
    <p class="hint">Assumes equalizer ${e.evidence.savingsAssumptions.stateEqualizer} and ${r(e.evidence.savingsAssumptions.taxRateSource)}; this is a rough range, not a promise.</p>
  </section>`}function pe(e,t){f=e;let n=me();n&&W(n,t,e);let s=e.case.parcel,o=[s.address,s.city,s.zipCode].filter(Boolean).join(", "),a=[e.case.userEvidence.actualSqft?`Actual sqft ${g(e.case.userEvidence.actualSqft)}`:"",e.case.userEvidence.actualAv?`Actual AV ${m(e.case.userEvidence.actualAv)}`:"",e.case.userEvidence.actualImprovementAv?`Actual improvement AV ${m(e.case.userEvidence.actualImprovementAv)}`:""].filter(Boolean),i=new URLSearchParams(t);i.set("pin",s.pin);let d=document.querySelector("#results");d&&(d.innerHTML=`
    <section class="notice"><strong>${r(e.evidence.disclaimers[0])}</strong></section>
    <section class="panel" aria-labelledby="step-three">
      <div class="step-label">Step 3</div>
      <h2 id="step-three">Routing decision</h2>
      <p class="headline">${r(e.routing.headline)}</p>
      ${rt(e)}
      <ul>${e.routing.reasoning.map(u=>`<li>${H(u)}</li>`).join("")}</ul>
    </section>

    <section class="subject panel">
      <h2>Subject property</h2>
      <dl>
        <div><dt>PIN</dt><dd>${r(s.pinFormatted)}</dd></div>
        ${o?`<div><dt>Address</dt><dd>${r(o)}</dd></div>`:""}
        <div><dt>Class / township</dt><dd>${r(s.propertyClass)} / ${r(s.townshipName)}</dd></div>
        <div><dt>Building sqft</dt><dd>${g(s.buildingSqft)}</dd></div>
        <div><dt>Total AV</dt><dd>${m(s.currentAv)}</dd></div>
        <div><dt>Improvement AV</dt><dd>${m(s.currentImprovementAv)}</dd></div>
      </dl>
      ${a.length?`<p class="tagline">${r(a.join("; "))} - user-supplied; documentation required.</p>`:""}
    </section>

    ${at(e)}

    <section class="panel" aria-labelledby="step-five">
      <div class="step-label">Step 5</div>
      <h2 id="step-five">${r(e.venue.name)} checklist</h2>
      <p class="hint">Use this checklist to assemble documents before filing at the official venue.</p>
      <ul>${e.venue.checklist.map(u=>`<li>${H(u)}</li>`).join("")}</ul>
      <div class="actions">
        <a class="button-link" href="/print?${i.toString()}">Print / Save as PDF</a>
        <button type="button" id="download-comps" class="secondary">Download comps (.xlsx)</button>
      </div>
    </section>

    ${ot()}

    ${st(e.warnings)}
  `)}function ee(){f=null,N("");for(let e of["#results","#address-results"]){let t=document.querySelector(e);t&&(t.innerHTML="")}}async function it(e){ee();let t=Ke(await Je());try{let n=await ie(`/api/case?${e.toString()}`);ee(),pe(n,e)}catch(n){let s=document.querySelector("#results");s&&(s.innerHTML=`<section class="error" role="alert">${r(n instanceof Error?n.message:"The case could not be loaded.")}</section>`)}finally{t();let n=document.querySelector("#progress");n&&(n.innerHTML="")}}async function lt(e){if(!nt(e))return;let t=new URLSearchParams,n=D(e,"pin");if(je(t,e),n){t.set("pin",n),await it(t);return}let s=document.querySelector("#results");s&&(s.innerHTML='<section class="error" role="alert">Enter a PIN.</section>')}function ct(e,t){for(let n of Array.from(e.elements)){if(!(n instanceof HTMLInputElement||n instanceof HTMLSelectElement||n instanceof HTMLTextAreaElement)||!n.name)continue;let s=t.get(n.name);if(n instanceof HTMLInputElement&&n.type==="radio"){n.checked=s===n.value;continue}n.value=s??""}E(e)}function de(){let e=me();if(!e)return;let t=j(e);if(!t)return;let n=document.querySelector("#case-form");n&&ct(n,t.query),pe(t.payload,t.query)}function me(){try{return window.sessionStorage}catch{return null}}async function ut(e){if(!k){w("Problem reporting is disabled until the Turnstile site key is configured.",!0);return}if(!e.reportValidity())return;let t=new FormData(e),n=t.get("cf-turnstile-response");w("Submitting report...");let s=await fetch("/api/report",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({category:t.get("category"),description:t.get("description"),context:t.get("context"),turnstileToken:typeof n=="string"?n:""})}),o=await s.json();if(!s.ok||!o.ok){w(o.ok?"The report could not be submitted.":o.error?.message??"The report could not be submitted.",!0);return}w(`Report submitted: ${o.issueUrl}`),e.reset()}async function pt(e){if(!L){T("Contact is disabled until the Turnstile site key is configured.",!0);return}if(!e.reportValidity())return;let t=new FormData(e),n=t.get("cf-turnstile-response");T("Sending message...");let s=await fetch("/api/contact",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({name:t.get("name"),email:t.get("email"),message:t.get("message"),turnstileToken:typeof n=="string"?n:""})}),o=await s.json();if(!s.ok||!o.ok){T(o.ok?"The message could not be sent.":o.error?.message??"The message could not be sent.",!0);return}T(o.message??"Message sent."),e.reset()}function dt(){let e=document.querySelector("details.evidence");if(e)for(let t of Array.from(e.querySelectorAll("[data-evidence-input]")))(t instanceof HTMLInputElement||t instanceof HTMLTextAreaElement)&&(t.value="")}function O(e=null){for(let t of Array.from(document.querySelectorAll(".tooltip-toggle"))){if(t===e)continue;let n=t.getAttribute("aria-describedby"),s=n?document.getElementById(n):null;t.setAttribute("aria-expanded","false"),s&&s.removeAttribute("style")}}function mt(e,t){if(t.removeAttribute("style"),!window.matchMedia("(max-width: 760px)").matches)return;let n=e.getBoundingClientRect(),s=16,o=n.bottom+8,a=window.innerHeight-t.offsetHeight-s,i=Math.max(s,Math.min(o,a));t.style.position="fixed",t.style.inset=`${i}px ${s}px auto ${s}px`,t.style.width="auto",t.style.transform="none"}function ft(e){let t=e.getAttribute("aria-describedby"),n=t?document.getElementById(t):null;if(!n)return;let s=e.getAttribute("aria-expanded")!=="true";O(s?e:null),e.setAttribute("aria-expanded",String(s)),s?mt(e,n):n.removeAttribute("style")}function gt(){if(!f)return;let e=K(f),t=new ArrayBuffer(e.byteLength);new Uint8Array(t).set(e);let n=new Blob([t],{type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}),s=URL.createObjectURL(n),o=document.createElement("a");o.href=s,o.download=X(f),document.body.appendChild(o),o.click(),o.remove(),URL.revokeObjectURL(s)}Qe();var te=document.querySelector("#case-form");te&&E(te);document.addEventListener("submit",e=>{let t=e.target;t instanceof HTMLFormElement&&t.id==="case-form"&&(e.preventDefault(),lt(t)),t instanceof HTMLFormElement&&t.id==="report-form"&&(e.preventDefault(),ut(t)),t instanceof HTMLFormElement&&t.id==="contact-form"&&(e.preventDefault(),pt(t))});document.addEventListener("change",e=>{let t=e.target;if(t instanceof HTMLInputElement||t instanceof HTMLSelectElement||t instanceof HTMLTextAreaElement){let n=t.form;n?.id==="case-form"&&(N(""),E(n))}});document.addEventListener("click",e=>{let t=e.target;if(t instanceof HTMLElement){let n=t.closest(".tooltip-toggle");if(n){ft(n);return}O()}t instanceof HTMLElement&&t.id==="clear-evidence"&&dt(),t instanceof HTMLElement&&t.id==="download-comps"&&gt(),t instanceof HTMLElement&&t.id==="report-problem"&&Ze(),t instanceof HTMLElement&&(t.id==="close-report"||t.id==="report-panel")&&ce(),t instanceof HTMLElement&&t.id==="open-contact-from-refusal"&&(e.preventDefault(),q(),tt()),t instanceof HTMLElement&&(t.id==="close-entity-refusal"||t.id==="entity-refusal-panel")&&q(),t instanceof HTMLElement&&(t.id==="close-contact"||t.id==="contact-panel")&&ue()});document.addEventListener("keydown",e=>{e.key==="Escape"&&(O(),ce(),q(),ue())});window.addEventListener("pageshow",e=>{e.persisted&&de()});de();document.documentElement.dataset.enhanced="true";
