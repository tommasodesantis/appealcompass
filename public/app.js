function A(t){return"Improvement AV"}function w(t){let[e,n,s]=t.split("/"),o=Number(e),r=Number(n),i=Number(s);return Me(i,o,r)}function Me(t,e,n){return`${t.toString().padStart(4,"0")}-${e.toString().padStart(2,"0")}-${n.toString().padStart(2,"0")}`}var qe=2026,Ht=+"3.0300";var $="https://www.cookcountyassessoril.gov/assessment-calendar-and-deadlines";var x="https://www.cookcountyboardofreview.com/dates-and-deadlines";var E="https://ptab.illinois.gov/";function c(t,e,n=null){return{opens:w(t),closes:w(e),evidenceDeadline:n?w(n):null}}var Ut={assessmentYear:qe,published:!0,venueLabel:"Cook County Assessor",sessionLabel:"Tax Year 2026 Assessor Appeal Windows",sessionEnd:w("8/12/2026"),sourceUrl:$,sourceNote:"Manual authority file 'Assessment & Appeal Calendar _ Cook County Assessor's Office.pdf' extracted on 2026-07-06 from the official Assessor calendar page, which reported Last updated: 6/29/26. Direct shell automation still returned CloudFront 403, so manually verify at the official source before filing."},_={Barrington:[],Berwyn:[c("5/20/2026","7/6/2026")],Bloom:[],Bremen:[],Calumet:[],Cicero:[c("6/17/2026","7/31/2026")],"Elk Grove":[c("6/22/2026","8/4/2026")],Evanston:[c("4/22/2026","6/4/2026")],Hanover:[],"Hyde Park":[],Jefferson:[],Lake:[],Lakeview:[c("5/28/2026","7/13/2026")],Lemont:[],Leyden:[],Lyons:[],Maine:[c("6/5/2026","7/21/2026")],"New Trier":[c("5/7/2026","6/22/2026")],Niles:[],"North Chicago":[],Northfield:[],"Norwood Park":[c("4/13/2026","5/26/2026")],"Oak Park":[c("5/6/2026","6/18/2026")],Orland:[],Palatine:[],Palos:[c("6/3/2026","7/17/2026")],Proviso:[],Rich:[],"River Forest":[c("4/20/2026","6/2/2026")],Riverside:[c("4/24/2026","6/8/2026")],"Rogers Park":[c("4/17/2026","6/1/2026")],Schaumburg:[],"South Chicago":[],Stickney:[c("6/29/2026","8/12/2026")],Thornton:[],"West Chicago":[],Wheeling:[],Worth:[]},Ot={assessmentYear:2025,published:!1,venueLabel:"Cook County Board of Review",sessionLabel:"Tax Year 2025 - Cook County Board of Review 2025-26 Session",sessionEnd:w("6/3/2026"),sourceUrl:x,sourceNote:"The official Board of Review dates page still lists the 2025 tax-year schedule. Tax Year 2026 township filing dates have not been published."};var Ne={1:{townships:["Berwyn","Evanston","Norwood Park","River Forest","Riverside","Rogers Park"],windows:[c("7/7/2025","8/5/2025","8/15/2025"),c("12/3/2025","12/12/2025","12/22/2025")]},"2a":{townships:["Cicero","Oak Park","Palos"],windows:[c("7/21/2025","8/19/2025","8/29/2025"),c("12/3/2025","12/12/2025","12/22/2025")]},"2b":{townships:["Elk Grove","Lakeview","Lyons","New Trier"],windows:[c("8/18/2025","9/16/2025","9/26/2025"),c("12/3/2025","12/12/2025","12/22/2025")]},3:{townships:["Barrington","Maine","Northfield","Stickney","West Chicago"],windows:[c("9/22/2025","10/21/2025","10/31/2025"),c("12/3/2025","12/12/2025","12/22/2025")]},4:{townships:["Bremen","Calumet","Hyde Park","Lemont","Leyden","Worth"],windows:[c("10/23/2025","11/21/2025","12/1/2025"),c("12/3/2025","12/12/2025","12/22/2025")]},5:{townships:["Jefferson","Proviso","Wheeling"],windows:[c("11/20/2025","12/19/2025","12/29/2025")]},6:{townships:["Lake","Orland","Palatine","Schaumburg","Thornton"],windows:[c("1/5/2026","2/3/2026","2/13/2026")]},7:{townships:["Bloom","Hanover","Niles","Rich","North Chicago","South Chicago"],windows:[c("1/20/2026","2/18/2026","2/28/2026")]}};var Bt=Object.fromEntries(Object.entries(Ne).flatMap(([t,e])=>e.townships.map(n=>[n,t])));var P="0x4AAAAAADxp6hAzqJ2ZR8aE";var J=[{value:"all",max:null,label:"All selected comps",meaning:"Show the full generated exhibit, including questionable rows when alternatives are sparse."},{value:"0.10",max:.1,label:"Excellent (0.00-0.10)",meaning:"Excellent"},{value:"0.20",max:.2,label:"Good comp (0.00-0.20)",meaning:"Good comp"},{value:"0.35",max:.35,label:"Usable (0.00-0.35)",meaning:"Usable, but check the row carefully"},{value:"0.50",max:.5,label:"Broad match (0.00-0.50)",meaning:"Broad match; review the row carefully before using it"}];function D(t){if(!t||t==="all")return null;let e=Number(t);return Number.isFinite(e)&&e>=0?e:null}function H(t){return t===null?"all":t.toFixed(2)}function R(t,e){return e===null?t:t.filter(n=>n.similarity<=e)}var Q="appealcompass:lastAssessment";function Fe(t,e,n=new Date().toISOString()){return JSON.stringify({queryString:t.toString(),payload:e,savedAt:n})}function _e(t){if(!t)return null;try{let e=JSON.parse(t);return!e||typeof e!="object"||typeof e.queryString!="string"||typeof e.savedAt!="string"||!("payload"in e)?null:{query:new URLSearchParams(e.queryString),payload:e.payload,savedAt:e.savedAt}}catch{return null}}function Z(t,e,n){try{return t.setItem(Q,Fe(e,n)),!0}catch{return!1}}function ee(t){try{return _e(t.getItem(Q))}catch{return null}}var te=new TextEncoder;function De(t){return String(t??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function He(t){return t&&typeof t=="object"&&"value"in t?t:{value:t}}function Ue(t){let e=t+1,n="";for(;e>0;){let s=(e-1)%26;n=String.fromCharCode(65+s)+n,e=Math.floor((e-1)/26)}return n}function Oe(t,e,n){let s=He(t),o=`${Ue(n)}${e}`,r=s.style===void 0?"":` s="${s.style}"`;if(typeof s.value=="number"&&Number.isFinite(s.value))return`<c r="${o}"${r}><v>${s.value}</v></c>`;let i=s.value===null||s.value===""?"Not available":s.value;return`<c r="${o}" t="inlineStr"${r}><is><t>${De(i)}</t></is></c>`}function ne(t){return`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetViews><sheetView workbookViewId="0"/></sheetViews>
  <sheetFormatPr defaultRowHeight="15"/>
  <cols><col min="1" max="12" width="22" customWidth="1"/></cols>
  <sheetData>${t.map((n,s)=>`<row r="${s+1}">${n.map((o,r)=>Oe(o,s+1,r)).join("")}</row>`).join("")}</sheetData>
</worksheet>`}function Be(){return`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets><sheet name="Comps" sheetId="1" r:id="rId1"/><sheet name="Similar Homes" sheetId="2" r:id="rId2"/></sheets>
</workbook>`}function je(){return`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`}function We(){return`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`}function Ve(){return`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>`}function Ye(){return`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="2"><font><sz val="11"/><name val="Aptos"/></font><font><b/><sz val="11"/><name val="Aptos"/></font></fonts>
  <fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FFEFE3C1"/><bgColor indexed="64"/></patternFill></fill></fills>
  <borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>
  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
  <cellXfs count="3"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/><xf numFmtId="0" fontId="1" fillId="1" borderId="0" xfId="0" applyFont="1" applyFill="1"/></cellXfs>
  <cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>`}function se(){return[{value:"PIN",style:2},{value:"Distance km",style:2},{value:"Neighborhood",style:2},{value:"Property class",style:2},{value:"Building sqft",style:2},{value:"Year built",style:2},{value:"Sale date",style:2},{value:"Sale price",style:2},{value:"Assessment metric",style:2},{value:"Improvement AV/sqft",style:2},{value:"Compared with subject (%)",style:2},{value:"Similarity score",style:2}]}function ae(t,e,n){return t.map(s=>[s.comparable.pinFormatted,s.distanceKm,s.comparable.neighborhood,s.comparable.propertyClass,s.comparable.buildingSqft,s.comparable.yearBuilt,s.comparable.saleDate,s.comparable.salePrice,e,s.avPerSqft,n&&n>0?(s.avPerSqft-n)/n*100:null,s.similarity])}function ze(t,e){let n=t.case.parcel,s=t.evidence.comparableAnalysis,o=t.evidence.landAssessment,r=t.evidence.savingsAssumptions,i=t.case.userEvidence,l=A(s.profileKey),b=R(s.pool,e);return[[{value:"Subject Property Summary",style:1}],["PIN",n.pinFormatted],["Class / Township",`${n.propertyClass} / ${n.townshipName}`],["Assessment year",n.assessmentYear],["Building Sqft",n.buildingSqft??i.actualSqft],["Building Sqft source",n.buildingSqft!==null?"Public record":i.actualSqft!==null?"User-supplied":"Not available"],["Land Sqft",n.landSqft],["Total AV",n.currentAv??i.actualAv],["Total AV source",n.currentAv!==null?"Public record":i.actualAv!==null?"User-supplied":"Not available"],["Improvement AV",n.currentImprovementAv??i.actualImprovementAv],["Improvement AV source",n.currentImprovementAv!==null?"Public record":i.actualImprovementAv!==null?"User-supplied":"Not available"],["Land AV",n.currentLandAv],["Implied Market Value",t.evidence.impliedMarketValue],[],[{value:"Selected Comparable Homes",style:1}],["Includes selected homes assessed above the subject for transparent comparison."],se(),...ae(b,l,s.subjectAvPerSqft),[],[{value:"Analysis Stats",style:1}],["Pool size",s.poolSize],["Median Improvement AV/sqft",s.medianAvPerSqft],["Percentile",s.percentile],["Gap %",s.gapPct],["Land check",o.note],["Subject Land AV/sqft",o.subjectLandAvPerSqft],["Median comparable Land AV/sqft",o.medianLandAvPerSqft],["Land percentile",o.percentile],["Land gap %",o.gapPct],["Land issue flagged",o.flagged?"Yes":"No"],[],[{value:"Savings Calculation",style:1}],["State equalizer",r.stateEqualizer],["Assumed tax rate",r.taxRate],["Tax rate source",r.taxRateSource],["Low estimate",r.low],["Point estimate",r.point],["High estimate",r.high],["Formula","estimated savings = Delta AV x E x r, shown as a +/-20% range; not a promise"]]}function Ge(t){let e=t.evidence.comparableAnalysis,n=A(e.profileKey);return[[{value:"Similar Homes",style:1}],["This sheet lists the full selected comparable pool, including higher-assessed rows."],se(),...ae(e.pool,n,e.subjectAvPerSqft)]}function Xe(){let t=new Uint32Array(256);for(let e=0;e<256;e+=1){let n=e;for(let s=0;s<8;s+=1)n=n&1?3988292384^n>>>1:n>>>1;t[e]=n>>>0}return t}var Ke=Xe();function Je(t){let e=4294967295;for(let n of t)e=e>>>8^(Ke[(e^n)&255]??0);return(e^4294967295)>>>0}function u(t,e){t.push(e&255,e>>>8&255)}function f(t,e){t.push(e&255,e>>>8&255,e>>>16&255,e>>>24&255)}function U(t,e){for(let n of e)t.push(n)}function Qe(t){let e=[],n=[],s=t.map(r=>{let i=te.encode(r.text);return{path:r.path,data:i,crc:Je(i)}});for(let r of s){let i=e.length,l=te.encode(r.path);f(e,67324752),u(e,20),u(e,0),u(e,0),u(e,0),u(e,0),f(e,r.crc),f(e,r.data.length),f(e,r.data.length),u(e,l.length),u(e,0),U(e,l),U(e,r.data),f(n,33639248),u(n,20),u(n,20),u(n,0),u(n,0),u(n,0),u(n,0),f(n,r.crc),f(n,r.data.length),f(n,r.data.length),u(n,l.length),u(n,0),u(n,0),u(n,0),u(n,0),f(n,0),f(n,i),U(n,l)}let o=e.length;return e.push(...n),f(e,101010256),u(e,0),u(e,0),u(e,s.length),u(e,s.length),f(e,n.length),f(e,o),u(e,0),new Uint8Array(e)}function oe(t){return`appeal-compass-comps-${t.case.parcel.pin}.xlsx`}function re(t,e=null){return Qe([{path:"[Content_Types].xml",text:Ve()},{path:"_rels/.rels",text:We()},{path:"xl/workbook.xml",text:Be()},{path:"xl/_rels/workbook.xml.rels",text:je()},{path:"xl/styles.xml",text:Ye()},{path:"xl/worksheets/sheet1.xml",text:ne(ze(t,e))},{path:"xl/worksheets/sheet2.xml",text:ne(Ge(t))}])}var me=document.querySelector("#app");if(!me)throw new Error("Missing app root.");var fe=me,Ze=new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}),et="Appeal Compass is designed only for individual residential homeowners appealing their own home; if interested in a similar tool for commercial properties please reach out here.",tt="Appeal Compass is busy helping other homeowners right now. You're in line \u2014 keep this page open and your assessment will start automatically.",nt="https://www.cookcountyassessoril.gov/exemptions",st="https://www.cookcountypropertyinfo.com/",he=P.length>0,I=he,M=he,ie=0,g=null,v=null,q=null,V=window.location.pathname==="/methodology";function a(t){return String(t??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function p(t,e){return`<a href="${a(t)}" target="_blank" rel="noreferrer">${a(e)}<span class="sr-only"> (opens in new tab)</span></a>`}function ge(t,e,n="?",s=""){ie+=1;let o=`tooltip-${ie}`;return`<span class="${s?`tooltip ${s}`:"tooltip"}">
    <button class="tooltip-toggle" type="button" aria-label="${a(t)}" aria-expanded="false" aria-describedby="${o}">${a(n)}</button>
    <span class="tooltip-bubble" id="${o}" role="tooltip">${a(e)}</span>
  </span>`}function S(t,e){return ge(t,e)}function be(t,e){return ge(t,e,"!","warning-tooltip")}function j(t){let e=String(t??""),n=/https?:\/\/[^\s<>"']+/g,s="",o=0;for(let r of e.matchAll(n)){let i=r[0],l=r.index??0,b=i.match(/[.,;:)]+$/)?.[0]??"",y=i.slice(0,i.length-b.length);s+=a(e.slice(o,l)),s+=`<a href="${a(y)}" target="_blank" rel="noreferrer">${a(y)}<span class="sr-only"> (opens in new tab)</span></a>${a(b)}`,o=l+i.length}return s+a(e.slice(o))}function m(t){return t===null?"Not available":Ze.format(t)}function h(t,e=0){return t===null?"Not available":t.toLocaleString("en-US",{maximumFractionDigits:e})}function at(t){return t==="LIMITED"?"Limited public-data evidence":t==="STRONG"?"Strong":t==="MODERATE"?"Moderate":t}function ot(t){return t.split("_").filter(Boolean).map(e=>e.charAt(0).toUpperCase()+e.slice(1)).join(" ")}function rt(){let t=new Date,e=t.getFullYear(),n=String(t.getMonth()+1).padStart(2,"0"),s=String(t.getDate()).padStart(2,"0");return`${e}-${n}-${s}`}function T(t){let[e,n,s]=t.split("-"),o=Number(e),r=Number(n),i=Number(s);return!Number.isFinite(o)||!Number.isFinite(r)||!Number.isFinite(i)?t:new Date(Date.UTC(o,r-1,i)).toLocaleDateString("en-US",{year:"numeric",month:"short",day:"numeric",timeZone:"UTC"})}function it(t,e){return t.length>0&&t.every(n=>e>n.closes)}function lt(t){let e=t.evidenceDeadline?`; evidence due ${T(t.evidenceDeadline)}`:"";return`${T(t.opens)} to ${T(t.closes)}${e}`}function ct(){return Object.entries(_).flatMap(([e,n])=>n.map(s=>`<li>${a(e)}: ${a(lt(s))}</li>`)).join("")||"<li>No configured Assessor filing windows are available in the current data.</li>"}function dt(t){let e=Object.values(_).flat();return it(e,t)?be("Assessor calendar warning",`All configured deadlines for this venue appear to be past as of ${t}. The data may be stale; verify at the official source before filing. You can still select this venue to prepare for the next session.`):""}function O(t){return`<div class="venue-option">
    <div class="venue-choice-row">
      <label class="venue-choice">
        <input type="radio" name="venue" value="${t.value}" required>
        <span>${a(t.label)}</span>
      </label>
      ${t.warning??""}
    </div>
    ${t.details}
  </div>`}function ut(){let t=rt();return`<fieldset class="question-group venue-picker">
    <legend>Where do you want to appeal?</legend>
    <div class="venue-options">
      ${O({value:"assessor",label:"Cook County Assessor",warning:dt(t),details:`<details class="venue-details">
          <summary>About the Assessor path</summary>
          <p>The Assessor is the first-level Cook County appeal venue. Start here for current-year assessment challenges and documented property-description errors.</p>
          <p>Use this path if you are within the township filing window or preparing for the next Assessor session.</p>
          <p>Official source: ${p($,"Cook County Assessor calendar")}. Verify at the official source before filing.</p>
          <ul class="deadline-list">${ct()}</ul>
        </details>`})}
      ${O({value:"bor",label:"Cook County Board of Review",warning:be("Board of Review schedule status","Tax Year 2026 township filing dates have not been published. The official page still lists the prior 2025 schedule."),details:`<details class="venue-details">
          <summary>About the BOR path</summary>
          <p>The Board of Review is the second-level Cook County appeal venue and has its own township filing and evidence deadlines.</p>
          <p>Use this path if you are filing at BOR, preparing after an Assessor appeal, or checking BOR-specific comparable evidence.</p>
          <p>Tax Year 2026 township dates are not published yet. Do not use the expired 2025 schedule as a current deadline.</p>
          <p>Official source: ${p(x,"Cook County BOR dates and deadlines")}. Check the official page before filing.</p>
        </details>`})}
      ${O({value:"ptab",label:"Illinois PTAB",details:`<details class="venue-details">
          <summary>About the PTAB path</summary>
          <p>PTAB is the Illinois state appeal board available after a written BOR decision for the same tax year.</p>
          <p>Use this path only when you have, or are preparing for, a BOR decision notice. The deadline is generally 30 days from the date on the written notice; Appeal Compass will not guess that date.</p>
          <p>Official source: ${p(E,"Illinois PTAB")}. Verify at the official source before filing.</p>
        </details>`})}
    </div>
  </fieldset>`}async function ve(t){let e=await fetch(t,{headers:{accept:"application/json"}}),n=await e.json();if(!e.ok||typeof n=="object"&&n&&"ok"in n&&n.ok===!1){let s=n.error?.message??"The request failed.";throw new Error(s)}return n}function Y(t,e){let n=new FormData(t).get(e);return typeof n=="string"?n.trim():""}function pt(t,e){let n=["jurisdiction","venue","ownershipType","borNoticeReceived","borNoticeDate","purchasePrice","purchaseDate","appraisalValue","appraisalDate","actualSqft","actualAv","actualImprovementAv"];for(let s of n){let o=Y(e,s);o&&t.set(s,o)}}function le(t){return`<section class="progress" aria-live="polite"><p>${a(t)}</p></section>`}function ye(){return`<svg aria-hidden="true" class="github-mark" viewBox="0 0 16 16" width="20" height="20">
    <path fill="currentColor" d="M8 0C3.58 0 0 3.67 0 8.2c0 3.62 2.29 6.69 5.47 7.78.4.08.55-.18.55-.39 0-.19-.01-.84-.01-1.53-2.01.38-2.53-.5-2.69-.96-.09-.24-.48-.96-.82-1.16-.28-.16-.68-.55-.01-.56.63-.01 1.08.59 1.23.84.72 1.24 1.87.89 2.33.68.07-.53.28-.89.51-1.09-1.78-.21-3.64-.91-3.64-4.04 0-.89.31-1.62.82-2.19-.08-.21-.36-1.04.08-2.16 0 0 .67-.22 2.2.84A7.43 7.43 0 0 1 8 3.98c.68 0 1.36.09 2 .28 1.53-1.06 2.2-.84 2.2-.84.44 1.12.16 1.95.08 2.16.51.57.82 1.3.82 2.19 0 3.14-1.87 3.83-3.65 4.04.29.26.54.76.54 1.54 0 1.11-.01 2-.01 2.27 0 .21.15.47.55.39A8.08 8.08 0 0 0 16 8.2C16 3.67 12.42 0 8 0Z"/>
  </svg>`}function we(){return`<footer class="site-footer">
    <div class="footer-project">
      <strong>Appeal Compass</strong>
      <p class="project-credit">An open-source GPLv3 project developed by <a href="https://github.com/tommasodesantis" target="_blank" rel="noreferrer">Tommaso De Santis<span class="sr-only"> (opens in new tab)</span></a></p>
    </div>
    <nav class="footer-links" aria-label="Project links">
      <a class="footer-icon-link" href="https://github.com/tommasodesantis/appealcompass" target="_blank" rel="noreferrer">${ye()}<span>GitHub</span><span class="sr-only"> (opens in new tab)</span></a>
      <a href="https://ko-fi.com/tomdesantis" target="_blank" rel="noreferrer">Support the project<span class="sr-only"> (opens in new tab)</span></a>
      <button type="button" id="suggest-feature" class="link-button">Suggest a feature</button>
      <button type="button" id="report-problem" class="link-button">Report a problem</button>
    </nav>
  </footer>`}function Se(){return`<a class="header-icon-link" href="https://github.com/tommasodesantis/appealcompass" target="_blank" rel="noreferrer">${ye()}<span>View on GitHub</span><span class="sr-only"> (opens in new tab)</span></a>`}function Te(){let t=I?"":" disabled",e=I?`<div class="cf-turnstile" data-sitekey="${a(P)}"></div>`:'<p class="hint">Problem reporting is disabled until the Turnstile site key is configured.</p>';return`<section id="report-panel" class="report-panel" hidden>
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
  </section>`}function mt(){return`<section id="entity-refusal-panel" class="modal-panel" hidden>
    <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="entity-refusal-title">
      <button type="button" id="close-entity-refusal" class="secondary close-button">Close</button>
      <h2 id="entity-refusal-title">Residential homeowners only</h2>
      <p>${a(et).replace("here.",'<a href="#contact-panel" id="open-contact-from-refusal">here</a>.')}</p>
    </div>
  </section>`}function Ae(){let t=M?"":" disabled",e=M?`<div class="cf-turnstile" data-sitekey="${a(P)}"></div>`:'<p class="hint">Contact is disabled until the Turnstile site key is configured.</p>';return`<section id="contact-panel" class="modal-panel" hidden>
    <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="contact-title">
      <button type="button" id="close-contact" class="secondary close-button">Close</button>
      <h2 id="contact-title">Commercial-property interest</h2>
      <form id="contact-form" class="stack">
        <input type="hidden" name="topic" id="contact-topic" value="commercial_interest">
        <label>
          <span>Name (optional)</span>
          <input name="name" maxlength="120"${t}>
        </label>
        <label>
          <span>Email (optional)</span>
          <input name="email" type="email" maxlength="254"${t}>
        </label>
        <label>
          <span>Message</span>
          <textarea name="message" rows="5" maxlength="4000" required${t}></textarea>
        </label>
        ${e}
        <div id="contact-status" aria-live="polite"></div>
        <button type="submit"${t}>Send message</button>
      </form>
    </div>
  </section>`}function ft(t=null){let e=t?[t]:["Looking up your property...","Fetching assessment history...","Finding similar homes...","Building the evidence summary..."],n=0,s=e[0]??"",o=document.querySelector("#progress");o&&(o.innerHTML=le(e[n]??s));let r=window.setInterval(()=>{n=(n+1)%e.length;let i=document.querySelector("#progress");i&&(i.innerHTML=le(e[n]??s))},650);return()=>window.clearInterval(r)}async function ht(){try{let t=await ve("/api/queue");return t.busy?t.message??tt:null}catch{return null}}function gt(){fe.innerHTML=`
    <header class="topline">
      <div class="topline-head">
        <h1>Appeal Compass</h1>
        ${Se()}
      </div>
      <p class="tool-description">Appeal Compass screens public data for residential property-tax appeal evidence. It is open-source and currently runs on donations. <a href="https://ko-fi.com/tomdesantis" target="_blank" rel="noreferrer">Support it on Ko-fi<span class="sr-only"> (opens in new tab)</span></a>. If interested in a similar tool for commercial properties <a href="#contact-panel" id="open-commercial-interest">reach out here</a>.</p>
    </header>

    <section class="panel" aria-labelledby="step-one">
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
          <div class="lookup-field">
            <div class="field-label-row">
              <label for="pin-input">PIN</label>
              ${S("What is a PIN?","A PIN is the 14-digit parcel number on your assessment notice, tax bill, or property record card.")}
            </div>
            <input id="pin-input" name="pin" autocomplete="off" inputmode="numeric" placeholder="03-00-000-000-0001" required>
          </div>
        </div>
        <p class="hint pin-help">Don't know your PIN? You can recover it from the ${p(st,"Cook County Property Tax Portal")}.</p>

        ${ut()}

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

        <fieldset class="question-group conditional" data-conditional="ptabNotice" hidden>
          <legend>PTAB timing</legend>
          <p>Have you received the written Board of Review decision notice?</p>
          <div class="choice-row">
            <label><input type="radio" name="borNoticeReceived" value="yes"><span>Yes</span></label>
            <label><input type="radio" name="borNoticeReceived" value="no"><span>No</span></label>
          </div>
          <div class="conditional" data-conditional="ptabNoticeDate" hidden>
            <label>
              <span>Date on the written BOR decision notice</span>
              <input name="borNoticeDate" type="date">
            </label>
          </div>
        </fieldset>

        <div class="actions">
          <button type="submit">Review my case</button>
        </div>
      </form>
    </section>

    <div id="progress"></div>
    <div id="results"></div>
    ${we()}
    ${Te()}
    ${mt()}
    ${Ae()}
  `}function bt(){fe.innerHTML=`
    <header class="topline">
      <div class="topline-head">
        <h1>Methodology</h1>
        ${Se()}
      </div>
      <p class="lede">How Appeal Compass screens public data for residential property-tax appeal evidence.</p>
      <p><a href="/">Back to Appeal Compass</a></p>
    </header>

    <nav class="methodology-nav panel" aria-label="Methodology sections">
      <a href="#scope">Scope</a>
      <a href="#data-years">Data and years</a>
      <a href="#comparables">Comparables</a>
      <a href="#edge-cases">Edge cases</a>
      <a href="#deadlines">Deadlines</a>
      <a href="#savings">Savings</a>
    </nav>

    <section class="panel stack" id="scope">
      <p class="eyebrow">01 / Scope</p>
      <h2>What Appeal Compass does</h2>
      <p>Appeal Compass is a screening tool for individual Cook County homeowners. It uses a parcel PIN, the selected appeal venue, public property records, assessment values, sales, and residential characteristics to identify evidence worth reviewing.</p>
      <p>It does not file an appeal, decide legal eligibility, inspect the property, verify every reduction factor, or predict an official result. Every property fact, comparable, value, and deadline must be checked against the official source before filing.</p>
    </section>

    <section class="panel stack" id="data-years">
      <p class="eyebrow">02 / Data and years</p>
      <h2>How public rows are selected</h2>
      <p>The tool first requests the current assessment-year parcel, characteristic, and assessed-value rows. If a current row exists but has no usable assessed value, it uses the most recent value-bearing year and labels that limitation. Subject and comparable assessment years remain visible in the results and exports.</p>
      <p>If residential characteristics are missing, the tool may ask for only the field needed to continue, such as building area or Improvement AV. Values entered by a user are fallback inputs and are labeled user-supplied.</p>
      <p>Data notes combine related limitations, such as missing characteristics and older assessed values, so the same issue is not repeated several times.</p>
    </section>

    <section class="panel stack" id="comparables">
      <p class="eyebrow">03 / Comparable evidence</p>
      <h2>Selection, metrics, and interpretation</h2>
      <p>Residential uniformity evidence uses Improvement AV per building square foot. Total AV is shown for context, overvaluation checks, value breakdowns, and savings estimates, but Total AV alone does not generate a residential uniformity argument.</p>
      <p>The candidate pool starts with the same public property class and township. Venue-specific profiles apply building-size and year-built rules, prefer same-neighborhood homes when enough records exist, and compare known assessment years consistently. The selected-comparables table shows the full filtered pool, including rows assessed above the subject; a higher-assessed row is context, not support for a reduction.</p>
      <p>A lower similarity score means closer observable characteristics. Scores 0.00-0.10 are excellent, 0.10-0.20 are good, 0.20-0.35 are usable, 0.35-0.50 are broad matches that require careful review, and scores above 0.50 are questionable unless alternatives are sparse.</p>
      <p>The evidence level summarizes the available public-data support. It is a screening label, not a legal conclusion. A pool can contain several homes while producing no reduction argument when the subject is already assessed below the pool median.</p>
    </section>

    <section class="panel stack" id="edge-cases">
      <p class="eyebrow">04 / Property edge cases</p>
      <h2>What is included, limited, or blocked</h2>
      <dl class="methodology-cases">
        <div><dt>Residential condominiums</dt><dd>Class 299 is supported and compared with other Class 299 records. Condominium analysis is limited to public parcel-level fields and cannot evaluate unit condition, floor, view, parking, association finances, or other private attributes unless those appear in the source data.</dd></div>
        <div><dt>Small mixed-use homes</dt><dd>Supported Class 2 dwelling records, including Class 212, may be reviewed, but mixed residential and commercial use can make residential comparables less reliable. The result carries a caveat and should be checked manually.</dd></div>
        <div><dt>Multi-family and commercial</dt><dd>Class 3 multi-family property, Class 5 commercial or industrial property, and other non-Class-2 major classes are blocked before comparable analysis.</dd></div>
        <div><dt>Non-dwelling Class 2 records</dt><dd>Vacant land, cooperatives, buildings with more than six units, non-residential improvements, and special or atypical Class 2 codes are blocked. Current excluded codes are 200, 201, 213, 218, 219, 224, 225, 236, 239, 240, 241, 288, 290, 297, and 298.</dd></div>
        <div><dt>Unknown class</dt><dd>If the parcel class is missing or malformed, the tool stops rather than guessing that the property is a supported home.</dd></div>
        <div><dt>Missing or sparse comparables</dt><dd>The tool explains which data is missing. It does not create a favorable argument from a small pool or from higher-assessed homes. If selected rows exist, they remain visible for transparent review.</dd></div>
      </dl>
    </section>

    <section class="panel stack">
      <p class="eyebrow">05 / Land and arguments</p>
      <h2>Separate checks prevent misleading comparisons</h2>
      <p>The land-component check compares Land AV per land square foot. This helps distinguish lot-size differences from building uniformity evidence. A large lot or unusual land assessment may explain a Total AV difference without supporting a building-assessment reduction.</p>
      <p>Potential arguments are generated only when their underlying checks pass. These may include uniformity, overvaluation, description error, or assessment shock. \u201CNo strong public-data argument\u201D means only that this screen did not find one; condition, vacancy, demolition, exemptions, appraisal evidence, and other facts may still matter.</p>
    </section>

    <section class="panel stack" id="deadlines">
      <p class="eyebrow">06 / Deadlines</p>
      <h2>How dates and unavailable schedules are handled</h2>
      <p>Assessor dates come from the official Tax Year 2026 township calendar. Townships without published dates are labeled \u201Cdates not published yet\u201D; the tool does not invent a date.</p>
      <p>The official Board of Review dates page currently shows the prior Tax Year 2025 schedule, not a Tax Year 2026 township schedule. Appeal Compass therefore shows \u201C2026 BOR dates not published yet\u201D and links to the ${p(x,"official BOR dates page")} rather than reusing expired dates.</p>
      <p>PTAB generally requires filing within 30 days after the written BOR decision notice. The notice day is excluded and the last day is included. If the last day is a Saturday, Sunday, or Illinois legal holiday, the date moves to the next business day. For Cook County, a later statutory date tied to the township's final-action transmission may apply; that transmission is not observable in the public inputs, so the displayed date is conservative and must be verified with ${p(E,"PTAB")}.</p>
      <p>Official pages control. Check the ${p($,"Assessor calendar")}, ${p(x,"BOR dates page")}, or ${p(E,"PTAB site")} immediately before filing.</p>
    </section>

    <section class="panel stack" id="savings">
      <p class="eyebrow">07 / Savings and exports</p>
      <h2>Rough estimates, not promises</h2>
      <p>The point estimate applies the possible assessed-value reduction, state equalizer, and displayed tax-rate source. The range is shown around that point estimate. Missing current values or a default county tax-rate assumption reduces confidence.</p>
      <p>The print report and spreadsheet use the same selected comparable pool and similarity threshold as the screen. User-entered fallback values are labeled user-supplied. Taxes must still be paid on time while an appeal is pending.</p>
    </section>

    ${we()}
    ${Te()}
    ${Ae()}
  `}function z(t){let e=document.querySelector("#form-error");e&&(e.innerHTML=t?`<section class="error inline-error" role="alert">${a(t)}</section>`:"")}function L(t,e=!1){let n=document.querySelector("#report-status");n&&(n.innerHTML=t?`<p class="${e?"error inline-error":"notice inline-error"}">${a(t)}</p>`:"")}function k(t,e=!1){let n=document.querySelector("#contact-status");n&&(n.innerHTML=t?`<p class="${e?"error inline-error":"notice inline-error"}">${a(t)}</p>`:"")}function vt(){let t=document.querySelector("#report-panel"),e=document.querySelector("#report-context");if(!t)return;e&&g&&(e.value=`PIN ${g.case.parcel.pinFormatted}; venue ${g.routing.venue}; generated ${g.generatedAt}`),L(I?"":"Problem reporting is disabled until the Turnstile site key is configured.",!0),t.hidden=!1,t.querySelector("select, textarea, input, button")?.focus()}function xe(){let t=document.querySelector("#report-panel");t&&(t.hidden=!0)}function yt(){let t=document.querySelector("#entity-refusal-panel");if(!t)return;t.hidden=!1,t.querySelector("a, button")?.focus()}function W(){let t=document.querySelector("#entity-refusal-panel");t&&(t.hidden=!0)}function B(t="commercial_interest"){let e=document.querySelector("#contact-panel");if(!e)return;let n=document.querySelector("#contact-title"),s=document.querySelector("#contact-topic");n&&(n.textContent=t==="feature_suggestion"?"Suggest a feature":"Commercial-property interest"),s&&(s.value=t),k(M?"":"Contact is disabled until the Turnstile site key is configured.",!0),e.hidden=!1,e.querySelector("input, textarea, button")?.focus()}function Le(){let t=document.querySelector("#contact-panel");t&&(t.hidden=!0)}function ce(t,e){let n=new FormData(t).get(e);return typeof n=="string"?n:""}function de(t,e,n){let s=t.querySelector(`[data-conditional="${e}"]`);if(s){s.hidden=!n;for(let o of Array.from(s.querySelectorAll("input, select, textarea"))){if(!(o instanceof HTMLInputElement||o instanceof HTMLSelectElement||o instanceof HTMLTextAreaElement)||o.closest("[data-conditional]")!==s)continue;let r=o;r.disabled=!n,r.required=n,n||(r instanceof HTMLInputElement&&r.type==="radio"?r.checked=!1:r.value="")}}}function N(t){let e=ce(t,"venue")==="ptab";de(t,"ptabNotice",e);let n=e&&ce(t,"borNoticeReceived")==="yes";de(t,"ptabNoticeDate",n)}function wt(t){return z(""),N(t),t.reportValidity()?Y(t,"ownershipType")!=="individual"?(yt(),!1):!0:!1}function St(t){let e=t.notices??t.warnings.map((n,s)=>({code:`legacy_${s}`,severity:"caution",title:"Data limitation",summary:n,details:[]}));return e.length===0?"":`<section class="data-notices" aria-labelledby="data-notes-heading">
    <div class="section-heading-row">
      <h2 id="data-notes-heading">Data notes</h2>
      <span class="notice-count">${e.length}</span>
    </div>
    <div class="notice-grid">${e.map(n=>`<article class="data-note ${a(n.severity)}">
          <h3>${a(n.title)}</h3>
          <p>${j(n.summary)}</p>
          ${n.details.length>0?`<details><summary>Details and next check</summary><ul>${n.details.map(s=>`<li>${j(s)}</li>`).join("")}</ul></details>`:""}
        </article>`).join("")}</div>
  </section>`}function Tt(t){let e=t.routing,n=t.case.parcel,s=t.case.userEvidence.borNoticeDate??t.case.userEvidence.borDecisionDate,o=e.venue==="ptab"&&s?`Written BOR notice dated ${T(s)}`:`${n.townshipName} township`,r=l=>l===null?"":l===0?"Today":l>0?`${l} days away`:`${Math.abs(l)} days ago`,i=(e.deadlines??[]).map(l=>`<div class="deadline-card">
        <span>${a(l.label)}</span>
        <strong>${a(T(l.date))}</strong>
        ${l.daysRemaining===null?"":`<small>${a(r(l.daysRemaining))}</small>`}
      </div>`).join("");return`<section class="panel deadline-panel" aria-labelledby="deadline-info">
    <div class="section-heading-row">
      <div>
        <p class="eyebrow">Timing</p>
        <h2 id="deadline-info">Deadline status</h2>
      </div>
      <span class="status-pill status-${a(e.actionStatus)}">${a(e.deadlineLabel??e.actionStatus)}</span>
    </div>
    <p class="deadline-headline">${a(e.headline)}</p>
    ${i?`<div class="deadline-cards">${i}</div>`:`<div class="deadline-unavailable"><strong>${a(e.deadlineLabel??"Deadline unavailable")}</strong><span>Use the official source below for updates.</span></div>`}
    <dl class="compact-facts">
      <div><dt>Venue</dt><dd>${a(t.venue.name)}</dd></div>
      <div><dt>Basis</dt><dd>${a(o)}</dd></div>
      <div><dt>Official deadline source</dt><dd>${e.officialUrl?p(e.officialUrl,"Check official dates"):"Not available"}</dd></div>
      <div><dt>Filing rules</dt><dd>${p(t.venue.rulesUrl,"Review what to submit")}</dd></div>
    </dl>
    <details class="reasoning-details"><summary>How this status was determined</summary><ul>${e.reasoning.map(l=>`<li>${j(l)}</li>`).join("")}</ul></details>
  </section>`}function At(t){let e=t.evidence.comparableAnalysis.missingFields;return e.length===0?"":`<section class="panel" aria-labelledby="missing-public-data">
    <h2 id="missing-public-data">Missing public data</h2>
    <p>Some public fields needed for the comparable analysis were missing. If you have reliable values, add only those missing fields and rerun the review.</p>
    <form id="missing-evidence-form" class="stack">
      <div class="evidence-grid">
        ${e.map(n=>`<label>
              <span>${a(n.label)}</span>
              <input name="${a(n.name)}" inputmode="decimal" required>
              <span class="hint field-help-line">${a(n.helpText)}</span>
            </label>`).join("")}
      </div>
      <p class="hint">These values are used only as fallback inputs and will be labeled user-supplied.</p>
      <button type="submit">Rerun with fallback values</button>
    </form>
  </section>`}function xt(t){let e=t.evidence.comparableAnalysis,n=t.evidence.landAssessment,s=p(t.venue.rulesUrl,"See official rules"),o=S("What comparable profile means",'A "profile" is the set of matching rules this tool uses to pick similar homes for the specific venue: size, age, neighborhood, and which assessment number is compared, because each venue weighs comparables differently.'),r=S("What similarity score means","Lower similarity scores mean the comparable is more similar to the subject based on size, age, and distance."),i=A(e.profileKey),l=R(e.pool,q),b=H(q),y=e.pool.length>0?`<div class="filter-row">
        <label>
          <span>Similarity score threshold</span>
          <select id="similarity-filter">
            ${J.map(d=>`<option value="${a(d.value)}"${d.value===b?" selected":""}>${a(d.label)}</option>`).join("")}
          </select>
        </label>
        <p class="hint">0.00-0.10 excellent; 0.10-0.20 good; 0.20-0.35 usable; 0.35-0.50 broad match; above 0.50 questionable unless alternatives are sparse. Check every row before using it.</p>
      </div>`:"",F=d=>{if(e.subjectAvPerSqft===null||e.subjectAvPerSqft<=0)return'<span class="comparison neutral">Subject unavailable</span>';let C=(d-e.subjectAvPerSqft)/e.subjectAvPerSqft*100;return Math.abs(C)<.5?'<span class="comparison neutral">About the same</span>':C<0?`<span class="comparison lower">${h(Math.abs(C),1)}% lower</span>`:`<span class="comparison higher">${h(C,1)}% higher</span>`},K=l.map(d=>`<tr>
        <td>${a(d.comparable.pinFormatted)}</td>
        <td>${d.distanceKm===null?"Not available":h(d.distanceKm,2)}</td>
        <td>${a(d.comparable.neighborhood??"Not available")}</td>
        <td>${a(d.comparable.propertyClass??"Not available")}</td>
        <td>${h(d.comparable.buildingSqft)}</td>
        <td>${a(d.comparable.yearBuilt??"Not available")}</td>
        <td>${d.comparable.saleDate?a(T(d.comparable.saleDate)):"Not available"}</td>
        <td>${m(d.comparable.salePrice)}</td>
        <td>${a(i)}</td>
        <td>${m(d.avPerSqft)}</td>
        <td>${F(d.avPerSqft)}</td>
        <td>${h(d.similarity,3)}</td>
      </tr>`).join(""),Ee=K.length===0?`<p class="empty-state">${e.pool.length>0?"No selected homes meet the current similarity filter.":"No comparable rows could be selected from the available public data."}</p>`:`<div class="table-wrap"><table>
          <caption>${l.length} selected comparable ${l.length===1?"home":"homes"}; rows assessed above the subject are included for transparency.</caption>
          <thead><tr><th>PIN</th><th>Distance km</th><th>Neighborhood</th><th>Property class</th><th>Building sqft</th><th>Year built</th><th>Sale date</th><th>Sale price</th><th>Assessment metric</th><th>${a(e.metricLabel)}/sqft</th><th>Compared with subject</th><th>Similarity score ${r}</th></tr></thead>
          <tbody>${K}</tbody>
        </table></div>`,Pe=t.evidence.tier==="LIMITED"?`${a(t.evidence.tierMessage)} ${s}.`:a(t.evidence.tierMessage),Re=e.poolSize===0||e.gapPct===null?"The available public data is not sufficient to compare the subject with a selected residential pool.":e.gapPct>0?`The subject is assessed ${h(e.gapPct,1)}% above the selected-pool median on ${e.metricLabel}/sqft. That difference may support a closer uniformity review, but each row still needs verification.`:e.gapPct<0?`The subject is assessed ${h(Math.abs(e.gapPct),1)}% below the selected-pool median on ${e.metricLabel}/sqft. These public comparables do not support a lower residential uniformity assessment.`:`The subject is aligned with the selected-pool median on ${e.metricLabel}/sqft, so this screen does not show a residential uniformity gap.`,Ie=t.evidence.arguments.length?t.evidence.arguments.map(d=>`<article class="argument-card">
            <span class="argument-strength">${a(d.strength)}</span>
            <h4>${a(ot(d.argumentType))}</h4>
            <p>${a(d.text)}</p>
          </article>`).join(""):'<div class="empty-state"><strong>No strong public-data argument was found.</strong><span>This does not rule out condition, appraisal, exemption, or factual-error evidence that is not present in the public data.</span></div>';return`<section class="panel evidence-panel" aria-labelledby="evidence-summary">
    <div class="section-heading-row evidence-heading">
      <div>
        <p class="eyebrow">Public-data screen</p>
        <h2 id="evidence-summary">Evidence summary</h2>
      </div>
      <span class="evidence-level level-${a(t.evidence.tier.toLowerCase())}">${a(at(t.evidence.tier))}</span>
    </div>

    <div class="evidence-verdict">
      <h3>What the numbers say</h3>
      <p>${a(Re)}</p>
      <p class="hint">${Pe} ${S("What evidence level means","The evidence level is a rough screen of how much public data supports spending time on an appeal.")}</p>
    </div>

    <div class="metric-grid" aria-label="Comparable analysis key figures">
      <div><span>Selected homes</span><strong>${h(e.poolSize)}</strong><small>${a(e.scope??"Scope unavailable")}</small></div>
      <div><span>Subject ${a(e.metricLabel)}/sqft</span><strong>${m(e.subjectAvPerSqft)}</strong></div>
      <div><span>Pool median</span><strong>${m(e.medianAvPerSqft)}</strong></div>
      <div><span>Subject vs median</span><strong>${e.gapPct===null?"Not available":`${h(e.gapPct,1)}%`}</strong></div>
    </div>

    <details class="analysis-details">
      <summary>Analysis method and value context</summary>
      <p>${e.status==="ok"?`Comparable analysis completed with the ${a(e.profileLabel)} profile using ${a(e.metricLabel)}/sqft. ${o}`:a(e.note)}</p>
      <p><strong>Total AV:</strong> Shown for value context, overvaluation checks, and savings estimates. It is not used by itself to generate residential uniformity evidence.</p>
      <p><strong>Land check:</strong> ${a(n.note)} Subject Land AV/sqft ${m(n.subjectLandAvPerSqft)}; selected-pool median ${m(n.medianLandAvPerSqft)}.</p>
    </details>

    <div class="subsection-heading">
      <div><p class="eyebrow">Comparable detail</p><h3>Selected comparable homes</h3></div>
      <p>All selected rows are shown, not only homes assessed below the subject.</p>
    </div>
    ${y}
    ${Ee}

    <div class="subsection-heading"><div><p class="eyebrow">Assessment screen</p><h3 class="heading-with-tooltip">Potential appeal arguments ${S("What arguments mean","An argument is a distinct reason the assessment may be too high: uniformity, overvaluation, description error, or assessment shock. Strength labels are rough screens, not legal conclusions.")}</h3></div></div>
    <div class="argument-grid">${Ie}</div>

    <div class="savings-card">
      <div><p class="eyebrow">If a reduction is supported</p><h3 class="heading-with-tooltip">Rough savings estimate ${S("How rough savings are estimated","Estimated savings = \u0394AV \xD7 E \xD7 r, where \u0394AV is the assessed-value reduction, E is the state equalizer, and r is the assumed tax rate. The range is shown as \xB120% and is not a promise.")}</h3></div>
      <strong>${m(t.evidence.savingsAssumptions.low)} to ${m(t.evidence.savingsAssumptions.high)}</strong>
      <span>Point estimate ${m(t.evidence.savingsAssumptions.point)}</span>
    </div>
    <p class="hint">Assumes equalizer ${t.evidence.savingsAssumptions.stateEqualizer} and ${a(t.evidence.savingsAssumptions.taxRateSource)}; this is a rough range, not a promise.</p>
    <p><a href="/methodology">Read the methodology</a></p>
  </section>`}function Lt(t,e){let n=p(t.venue.submissionUrl,"official submission page"),s=p(t.venue.rulesUrl,"official rules and requirements");return`<section class="panel" aria-labelledby="whats-next">
    <h2 id="whats-next">What's Next?</h2>
    <p>You can download a PDF summary of the comparative analysis shown above. If you decide to appeal at ${a(t.venue.name)}, you can submit that PDF with the other documents the venue requires as part of your evidence.</p>
    <p>Double-check every Appeal Compass finding before filing. This evidence is not a guarantee that an appeal will succeed.</p>
    <p>Other documented factors may also support a property-tax reduction, including condition issues, vacancy, demolition, incorrect property characteristics, recent sale or appraisal evidence, and other factual errors.</p>
    <p>Some homeowners may qualify for exemptions, including homeowner, senior, senior freeze, disability, disabled veteran, returning veteran, home improvement, and long-time occupant exemptions. Verify eligibility on the ${p(nt,"Cook County Assessor exemptions page")}.</p>
    <p>Before filing, review the ${n} and ${s} for exactly what to submit.</p>
    <div class="actions">
      <a class="button-link" href="/print?${e.toString()}">Print / Save as PDF</a>
      <button type="button" id="download-comps" class="secondary">Download comps (.xlsx)</button>
    </div>
  </section>`}function G(t,e){g=t,v=new URLSearchParams(e),q=D(v.get("maxSimilarity"));let n=$e();n&&Z(n,e,t);let s=t.case.parcel,o=[s.address,s.city,s.zipCode].filter(Boolean).join(", "),r=[t.case.userEvidence.actualSqft?`Actual sqft ${h(t.case.userEvidence.actualSqft)}`:"",t.case.userEvidence.actualAv?`Actual AV ${m(t.case.userEvidence.actualAv)}`:"",t.case.userEvidence.actualImprovementAv?`Actual improvement AV ${m(t.case.userEvidence.actualImprovementAv)}`:""].filter(Boolean),i=new URLSearchParams(e);i.set("pin",s.pin);let l=document.querySelector("#results");l&&(l.innerHTML=`
    <section class="notice"><strong>${a(t.evidence.disclaimers[0])}</strong></section>
    ${Tt(t)}

    <section class="subject panel">
      <h2>Subject property</h2>
      <dl>
        <div><dt>PIN</dt><dd>${a(s.pinFormatted)}</dd></div>
        ${o?`<div><dt>Address</dt><dd>${a(o)}</dd></div>`:""}
        <div><dt>Class / township</dt><dd>${a(s.propertyClass)} / ${a(s.townshipName)}</dd></div>
        <div><dt>Building sqft</dt><dd>${h(s.buildingSqft)}</dd></div>
        <div><dt>Land sqft</dt><dd>${h(s.landSqft)}</dd></div>
        <div><dt>Assessment year</dt><dd>${h(s.assessmentYear)}</dd></div>
        <div><dt>Total AV</dt><dd>${m(s.currentAv)}</dd></div>
        <div><dt>Improvement AV</dt><dd>${m(s.currentImprovementAv)}</dd></div>
        <div><dt>Land AV</dt><dd>${m(s.currentLandAv)}</dd></div>
      </dl>
      <p class="hint">Total AV is context for value checks and savings estimates. Residential comparable evidence uses Improvement AV/sqft.</p>
      ${r.length?`<p class="tagline">${a(r.join("; "))} - user-supplied.</p>`:""}
    </section>

    ${St(t)}

    ${At(t)}

    ${xt(t)}

    ${Lt(t,i)}
  `)}function ue(){g=null,z("");for(let t of["#results","#address-results"]){let e=document.querySelector(t);e&&(e.innerHTML="")}}async function ke(t){ue();let e=ft(await ht());try{let n=await ve(`/api/case?${t.toString()}`);ue(),G(n,t)}catch(n){let s=document.querySelector("#results");s&&(s.innerHTML=`<section class="error" role="alert">${a(n instanceof Error?n.message:"The case could not be loaded.")}</section>`)}finally{e();let n=document.querySelector("#progress");n&&(n.innerHTML="")}}async function kt(t){if(!wt(t))return;let e=new URLSearchParams,n=Y(t,"pin");if(pt(e,t),n){e.set("pin",n),await ke(e);return}let s=document.querySelector("#results");s&&(s.innerHTML='<section class="error" role="alert">Enter a PIN.</section>')}function Ct(t,e){for(let n of Array.from(t.elements)){if(!(n instanceof HTMLInputElement||n instanceof HTMLSelectElement||n instanceof HTMLTextAreaElement)||!n.name)continue;let s=e.get(n.name);if(n instanceof HTMLInputElement&&n.type==="radio"){n.checked=s===n.value;continue}n.value=s??""}N(t)}function Ce(){let t=$e();if(!t)return;let e=ee(t);if(!e)return;let n=document.querySelector("#case-form");n&&Ct(n,e.query),G(e.payload,e.query)}function $e(){try{return window.sessionStorage}catch{return null}}async function $t(t){if(!I){L("Problem reporting is disabled until the Turnstile site key is configured.",!0);return}if(!t.reportValidity())return;let e=new FormData(t),n=e.get("cf-turnstile-response");L("Submitting report...");let s=await fetch("/api/report",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({category:e.get("category"),description:e.get("description"),context:e.get("context"),turnstileToken:typeof n=="string"?n:""})}),o=await s.json();if(!s.ok||!o.ok){L(o.ok?"The report could not be submitted.":o.error?.message??"The report could not be submitted.",!0);return}L(`Report submitted: ${o.issueUrl}`),t.reset()}async function Et(t){if(!M){k("Contact is disabled until the Turnstile site key is configured.",!0);return}if(!t.reportValidity())return;let e=new FormData(t),n=e.get("topic"),s=e.get("cf-turnstile-response");k("Sending message...");let o=await fetch("/api/contact",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({topic:e.get("topic"),name:e.get("name"),email:e.get("email"),message:e.get("message"),turnstileToken:typeof s=="string"?s:""})}),r=await o.json();if(!o.ok||!r.ok){k(r.ok?"The message could not be sent.":r.error?.message??"The message could not be sent.",!0);return}k(r.message??"Message sent."),t.reset();let i=t.querySelector("#contact-topic");i&&typeof n=="string"&&(i.value=n)}function Pt(t){if(!g||!v)return;let e=D(t);e===null?v.delete("maxSimilarity"):v.set("maxSimilarity",H(e)),G(g,v)}function Rt(t){if(!v||!t.reportValidity())return;let e=new URLSearchParams(v);for(let n of Array.from(t.elements)){if(!(n instanceof HTMLInputElement)||!n.name)continue;let s=n.value.trim();s&&e.set(n.name,s)}ke(e)}function X(t=null){for(let e of Array.from(document.querySelectorAll(".tooltip-toggle"))){if(e===t)continue;let n=e.getAttribute("aria-describedby"),s=n?document.getElementById(n):null;e.setAttribute("aria-expanded","false"),s&&s.removeAttribute("style")}}function It(t,e){e.removeAttribute("style");let n=t.getBoundingClientRect(),s=16,o=Math.min(304,window.innerWidth-s*2);e.style.position="fixed",e.style.width=`${o}px`,e.style.transform="none";let r=e.offsetHeight,i=n.top-r-8,l=n.bottom+8,b=i>=s?i:Math.min(l,window.innerHeight-r-s),y=n.left+n.width/2-o/2,F=Math.max(s,Math.min(y,window.innerWidth-o-s));e.style.position="fixed",e.style.inset=`${Math.max(s,b)}px auto auto ${F}px`}function Mt(t){let e=t.getAttribute("aria-describedby"),n=e?document.getElementById(e):null;if(!n)return;let s=t.getAttribute("aria-expanded")!=="true";X(s?t:null),t.setAttribute("aria-expanded",String(s)),s?It(t,n):n.removeAttribute("style")}function qt(){if(!g)return;let t=re(g,q),e=new ArrayBuffer(t.byteLength);new Uint8Array(e).set(t);let n=new Blob([e],{type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}),s=URL.createObjectURL(n),o=document.createElement("a");o.href=s,o.download=oe(g),document.body.appendChild(o),o.click(),o.remove(),URL.revokeObjectURL(s)}V?bt():gt();var pe=document.querySelector("#case-form");pe&&N(pe);document.addEventListener("submit",t=>{let e=t.target;e instanceof HTMLFormElement&&e.id==="case-form"&&(t.preventDefault(),kt(e)),e instanceof HTMLFormElement&&e.id==="report-form"&&(t.preventDefault(),$t(e)),e instanceof HTMLFormElement&&e.id==="contact-form"&&(t.preventDefault(),Et(e)),e instanceof HTMLFormElement&&e.id==="missing-evidence-form"&&(t.preventDefault(),Rt(e))});document.addEventListener("change",t=>{let e=t.target;if(e instanceof HTMLInputElement||e instanceof HTMLSelectElement||e instanceof HTMLTextAreaElement){let n=e.form;n?.id==="case-form"&&(z(""),N(n)),e instanceof HTMLSelectElement&&e.id==="similarity-filter"&&Pt(e.value)}});document.addEventListener("click",t=>{let e=t.target;if(e instanceof HTMLElement){let n=e.closest(".tooltip-toggle");if(n){Mt(n);return}X()}e instanceof HTMLElement&&e.id==="download-comps"&&qt(),e instanceof HTMLElement&&e.id==="report-problem"&&vt(),e instanceof HTMLElement&&(e.id==="close-report"||e.id==="report-panel")&&xe(),e instanceof HTMLElement&&e.id==="open-contact-from-refusal"&&(t.preventDefault(),W(),B("commercial_interest")),e instanceof HTMLElement&&e.id==="open-commercial-interest"&&(t.preventDefault(),B("commercial_interest")),e instanceof HTMLElement&&e.id==="suggest-feature"&&B("feature_suggestion"),e instanceof HTMLElement&&(e.id==="close-entity-refusal"||e.id==="entity-refusal-panel")&&W(),e instanceof HTMLElement&&(e.id==="close-contact"||e.id==="contact-panel")&&Le()});document.addEventListener("keydown",t=>{t.key==="Escape"&&(X(),xe(),W(),Le())});window.addEventListener("pageshow",t=>{t.persisted&&!V&&Ce()});V||Ce();document.documentElement.dataset.enhanced="true";
