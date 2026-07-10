function R(e){switch(e){case"board":return"Board of Review";case"certified":return"Assessor certified";case"mailed":return"Assessor mailed";default:return"stage unavailable"}}function Ae(e){let t=[...new Set([e.total,e.improvement,e.land].filter(Boolean))];return t.length===0?"assessment stage unavailable":t.map(n=>R(n)).join(" / ")}function I(e){return"Improvement AV"}function L(e){let[t,n,s]=e.split("/"),a=Number(t),i=Number(n),o=Number(s);return J(o,a,i)}function J(e,t,n){return`${e.toString().padStart(4,"0")}-${t.toString().padStart(2,"0")}-${n.toString().padStart(2,"0")}`}function vt(e){let[t,n,s]=e.split("-");return{year:Number(t),month:Number(n),day:Number(s)}}function Z(e,t){let n=vt(e);if(n.month===2&&n.day===29){let s=n.year+t;if(!(s%4===0&&(s%100!==0||s%400===0)))return J(s,2,28)}return J(n.year+t,n.month,n.day)}function Q(e,t,n){return e>=Z(t,-n)&&e<=Z(t,n)}var M=2026,In=+"3.0300";var H="https://www.cookcountyassessoril.gov/assessment-calendar-and-deadlines";var Te="https://www.cookcountyassessoril.gov/appeals";var xe="https://www.cookcountyboardofreview.com/board-review-official-rules",_="https://www.cookcountyboardofreview.com/dates-and-deadlines";var U="https://ptab.illinois.gov/";var Ce="https://www.ilga.gov/commission/jcar/admincode/086/086019100B00250R.html";function d(e,t,n=null){return{opens:L(e),closes:L(t),evidenceDeadline:n?L(n):null}}var Mn={assessmentYear:M,published:!0,venueLabel:"Cook County Assessor",sessionLabel:"Tax Year 2026 Assessor Appeal Windows",sessionEnd:L("8/12/2026"),sourceUrl:H,sourceNote:"Manual authority file 'Assessment & Appeal Calendar _ Cook County Assessor's Office.pdf' extracted on 2026-07-06 from the official Assessor calendar page, which reported Last updated: 6/29/26. Direct shell automation still returned CloudFront 403, so manually verify at the official source before filing."},ee={Barrington:[],Berwyn:[d("5/20/2026","7/6/2026")],Bloom:[],Bremen:[],Calumet:[],Cicero:[d("6/17/2026","7/31/2026")],"Elk Grove":[d("6/22/2026","8/4/2026")],Evanston:[d("4/22/2026","6/4/2026")],Hanover:[],"Hyde Park":[],Jefferson:[],Lake:[],Lakeview:[d("5/28/2026","7/13/2026")],Lemont:[],Leyden:[],Lyons:[],Maine:[d("6/5/2026","7/21/2026")],"New Trier":[d("5/7/2026","6/22/2026")],Niles:[],"North Chicago":[],Northfield:[],"Norwood Park":[d("4/13/2026","5/26/2026")],"Oak Park":[d("5/6/2026","6/18/2026")],Orland:[],Palatine:[],Palos:[d("6/3/2026","7/17/2026")],Proviso:[],Rich:[],"River Forest":[d("4/20/2026","6/2/2026")],Riverside:[d("4/24/2026","6/8/2026")],"Rogers Park":[d("4/17/2026","6/1/2026")],Schaumburg:[],"South Chicago":[],Stickney:[d("6/29/2026","8/12/2026")],Thornton:[],"West Chicago":[],Wheeling:[],Worth:[]},_n={assessmentYear:2025,published:!1,venueLabel:"Cook County Board of Review",sessionLabel:"Tax Year 2025 - Cook County Board of Review 2025-26 Session",sessionEnd:L("6/3/2026"),sourceUrl:_,sourceNote:"The official Board of Review dates page still lists the 2025 tax-year schedule. Tax Year 2026 township filing dates have not been published."};var yt={1:{townships:["Berwyn","Evanston","Norwood Park","River Forest","Riverside","Rogers Park"],windows:[d("7/7/2025","8/5/2025","8/15/2025"),d("12/3/2025","12/12/2025","12/22/2025")]},"2a":{townships:["Cicero","Oak Park","Palos"],windows:[d("7/21/2025","8/19/2025","8/29/2025"),d("12/3/2025","12/12/2025","12/22/2025")]},"2b":{townships:["Elk Grove","Lakeview","Lyons","New Trier"],windows:[d("8/18/2025","9/16/2025","9/26/2025"),d("12/3/2025","12/12/2025","12/22/2025")]},3:{townships:["Barrington","Maine","Northfield","Stickney","West Chicago"],windows:[d("9/22/2025","10/21/2025","10/31/2025"),d("12/3/2025","12/12/2025","12/22/2025")]},4:{townships:["Bremen","Calumet","Hyde Park","Lemont","Leyden","Worth"],windows:[d("10/23/2025","11/21/2025","12/1/2025"),d("12/3/2025","12/12/2025","12/22/2025")]},5:{townships:["Jefferson","Proviso","Wheeling"],windows:[d("11/20/2025","12/19/2025","12/29/2025")]},6:{townships:["Lake","Orland","Palatine","Schaumburg","Thornton"],windows:[d("1/5/2026","2/3/2026","2/13/2026")]},7:{townships:["Bloom","Hanover","Niles","Rich","North Chicago","South Chicago"],windows:[d("1/20/2026","2/18/2026","2/28/2026")]}};var Nn=Object.fromEntries(Object.entries(yt).flatMap(([e,t])=>t.townships.map(n=>[n,e])));var wt=3;function St(e){return`${e??M}-01-01`}function te(e){return e==="recent"||e==="recorded"?e:"all"}function Le(e){return!!(e.comparable.saleDate&&e.comparable.salePrice!==null&&e.comparable.salePrice>0)}function ne(e,t=M,n=wt){let s=St(t);return!e||!/^\d{4}-\d{2}-\d{2}$/.test(e)||e>s?!1:Q(e,s,n)}function Pe(e,t,n=M){return t==="recent"?e.filter(s=>Le(s)&&ne(s.comparable.saleDate,n)):t==="recorded"?e.filter(Le):[...e]}var se=[3,5,10],ae=10;function re(e){let t=Number(e);return se.includes(t)?t:ae}function P(e){let t=String(e??"").trim();return/^\d{3}$/.test(t)?`${t.slice(0,1)}-${t.slice(1)}`:t}var j="0x4AAAAAADxp6hAzqJ2ZR8aE";var $e=[{value:"all",max:null,label:"All selected comps",meaning:"Show the full generated exhibit, including questionable rows when alternatives are sparse."},{value:"0.10",max:.1,label:"Excellent (0.00-0.10)",meaning:"Excellent"},{value:"0.20",max:.2,label:"Good comp (0.00-0.20)",meaning:"Good comp"},{value:"0.35",max:.35,label:"Usable (0.00-0.35)",meaning:"Usable, but check the row carefully"},{value:"0.50",max:.5,label:"Broad match (0.00-0.50)",meaning:"Broad match; review the row carefully before using it"}];function ie(e){if(!e||e==="all")return null;let t=Number(e);return Number.isFinite(t)&&t>=0?t:null}function oe(e){return e===null?"all":e.toFixed(2)}function V(e,t){return t===null?e:e.filter(n=>n.similarity<=t)}var le=[5,10,25,50],ce=10;function Ee(e){let t=Number(e);return le.includes(t)?t:ce}function ke(e,t,n){let s=Math.max(1,Math.ceil(e.length/n)),a=Math.min(Math.max(1,Math.floor(t)),s),i=(a-1)*n,o=e.slice(i,i+n);return{pageRows:o,currentPage:a,totalPages:s,startRow:e.length===0?0:i+1,endRow:Math.min(i+o.length,e.length),totalRows:e.length}}var Re="appealcompass:lastAssessment";function At(e,t,n=new Date().toISOString()){return JSON.stringify({schemaVersion:2,queryString:e.toString(),payload:t,savedAt:n})}function Tt(e){if(!e)return null;try{let t=JSON.parse(e);return!t||typeof t!="object"||t.schemaVersion!==2||typeof t.queryString!="string"||typeof t.savedAt!="string"||!("payload"in t)?null:{query:new URLSearchParams(t.queryString),payload:t.payload,savedAt:t.savedAt}}catch{return null}}function Ie(e,t,n){try{return e.setItem(Re,At(t,n)),!0}catch{return!1}}function Me(e){try{return Tt(e.getItem(Re))}catch{return null}}var _e=new TextEncoder;function xt(e){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function Ct(e){return e&&typeof e=="object"&&"value"in e?e:{value:e}}function Lt(e){let t=e+1,n="";for(;t>0;){let s=(t-1)%26;n=String.fromCharCode(65+s)+n,t=Math.floor((t-1)/26)}return n}function Pt(e,t,n){let s=Ct(e),a=`${Lt(n)}${t}`,i=s.style===void 0?"":` s="${s.style}"`;if(typeof s.value=="number"&&Number.isFinite(s.value))return`<c r="${a}"${i}><v>${s.value}</v></c>`;let o=s.value===null||s.value===""?"Not available":s.value;return`<c r="${a}" t="inlineStr"${i}><is><t>${xt(o)}</t></is></c>`}function Ne(e){return`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetViews><sheetView workbookViewId="0"/></sheetViews>
  <sheetFormatPr defaultRowHeight="15"/>
  <cols><col min="1" max="12" width="22" customWidth="1"/></cols>
  <sheetData>${e.map((n,s)=>`<row r="${s+1}">${n.map((a,i)=>Pt(a,s+1,i)).join("")}</row>`).join("")}</sheetData>
</worksheet>`}function $t(){return`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets><sheet name="Comps" sheetId="1" r:id="rId1"/><sheet name="Similar Homes" sheetId="2" r:id="rId2"/></sheets>
</workbook>`}function Et(){return`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`}function kt(){return`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`}function Rt(){return`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>`}function It(){return`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="2"><font><sz val="11"/><name val="Aptos"/></font><font><b/><sz val="11"/><name val="Aptos"/></font></fonts>
  <fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FFEFE3C1"/><bgColor indexed="64"/></patternFill></fill></fills>
  <borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>
  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
  <cellXfs count="3"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/><xf numFmtId="0" fontId="1" fillId="1" borderId="0" xfId="0" applyFont="1" applyFill="1"/></cellXfs>
  <cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>`}function qe(){return[{value:"PIN",style:2},{value:"Distance km",style:2},{value:"Neighborhood",style:2},{value:"Property class",style:2},{value:"Building sqft",style:2},{value:"Year built",style:2},{value:"Sale date",style:2},{value:"Sale price",style:2},{value:"Assessment metric",style:2},{value:"Improvement AV/sqft",style:2},{value:"Compared with subject (%)",style:2},{value:"Similarity score",style:2}]}function Fe(e,t,n){return e.map(s=>[s.comparable.pinFormatted,s.distanceKm,s.comparable.neighborhood,P(s.comparable.propertyClass),s.comparable.buildingSqft,s.comparable.yearBuilt,s.comparable.saleDate,s.comparable.salePrice,t,s.avPerSqft,n&&n>0?(s.avPerSqft-n)/n*100:null,s.similarity])}function Mt(e,t){let n=e.case.parcel,s=e.evidence.comparableAnalysis,a=e.evidence.landAssessment,i=e.evidence.savingsAssumptions,o=e.case.userEvidence,c=I(s.profileKey),v=V(s.pool,t);return[[{value:"Subject Property Summary",style:1}],["PIN",n.pinFormatted],["Class / Township",`${P(n.propertyClass)} / ${n.townshipName}`],["Assessment year",n.assessmentYear],["Building Sqft",n.buildingSqft??o.actualSqft],["Building Sqft source",n.buildingSqft!==null?"Public record":o.actualSqft!==null?"User-supplied":"Not available"],["Land Sqft",n.landSqft],["Total AV",n.currentAv??o.actualAv],["Total AV source",n.currentAv!==null?"Public record":o.actualAv!==null?"User-supplied":"Not available"],["Improvement AV",n.currentImprovementAv??o.actualImprovementAv],["Improvement AV source",n.currentImprovementAv!==null?"Public record":o.actualImprovementAv!==null?"User-supplied":"Not available"],["Land AV",n.currentLandAv],["Implied Market Value",e.evidence.impliedMarketValue],[],[{value:"Selected Comparable Homes",style:1}],["Includes selected homes assessed above the subject for transparent comparison."],qe(),...Fe(v,c,s.subjectAvPerSqft),[],[{value:"Analysis Stats",style:1}],["Pool size",s.poolSize],["Homes driving calculation",s.actionablePoolSize],["Median Improvement AV/sqft",s.medianAvPerSqft],["Percentile",s.percentile],["Gap %",s.gapPct],["Land check",a.note],["Subject Land AV/sqft",a.subjectLandAvPerSqft],["Median comparable Land AV/sqft",a.medianLandAvPerSqft],["Land percentile",a.percentile],["Land gap %",a.gapPct],["Land issue flagged",a.flagged?"Yes":"No"],[],[{value:"Savings Calculation",style:1}],["State equalizer",i.stateEqualizer],["Assumed tax rate",i.taxRate],["Tax rate source",i.taxRateSource],["Low estimate",i.low],["Point estimate",i.point],["High estimate",i.high],["Formula","estimated savings = Delta AV x E x r, shown as a +/-20% range; not a promise"]]}function _t(e){let t=e.evidence.comparableAnalysis,n=I(t.profileKey);return[[{value:"Similar Homes",style:1}],["This sheet lists the full selected comparable pool, including higher-assessed rows."],qe(),...Fe(t.pool,n,t.subjectAvPerSqft)]}function Nt(){let e=new Uint32Array(256);for(let t=0;t<256;t+=1){let n=t;for(let s=0;s<8;s+=1)n=n&1?3988292384^n>>>1:n>>>1;e[t]=n>>>0}return e}var qt=Nt();function Ft(e){let t=4294967295;for(let n of e)t=t>>>8^(qt[(t^n)&255]??0);return(t^4294967295)>>>0}function p(e,t){e.push(t&255,t>>>8&255)}function y(e,t){e.push(t&255,t>>>8&255,t>>>16&255,t>>>24&255)}function de(e,t){for(let n of t)e.push(n)}function Dt(e){let t=[],n=[],s=e.map(i=>{let o=_e.encode(i.text);return{path:i.path,data:o,crc:Ft(o)}});for(let i of s){let o=t.length,c=_e.encode(i.path);y(t,67324752),p(t,20),p(t,0),p(t,0),p(t,0),p(t,0),y(t,i.crc),y(t,i.data.length),y(t,i.data.length),p(t,c.length),p(t,0),de(t,c),de(t,i.data),y(n,33639248),p(n,20),p(n,20),p(n,0),p(n,0),p(n,0),p(n,0),y(n,i.crc),y(n,i.data.length),y(n,i.data.length),p(n,c.length),p(n,0),p(n,0),p(n,0),p(n,0),y(n,0),y(n,o),de(n,c)}let a=t.length;return t.push(...n),y(t,101010256),p(t,0),p(t,0),p(t,s.length),p(t,s.length),y(t,n.length),y(t,a),p(t,0),new Uint8Array(t)}function De(e){return`appeal-compass-comps-${e.case.parcel.pin}.xlsx`}function Oe(e,t=null){return Dt([{path:"[Content_Types].xml",text:Rt()},{path:"_rels/.rels",text:kt()},{path:"xl/workbook.xml",text:$t()},{path:"xl/_rels/workbook.xml.rels",text:Et()},{path:"xl/styles.xml",text:It()},{path:"xl/worksheets/sheet1.xml",text:Ne(Mt(e,t))},{path:"xl/worksheets/sheet2.xml",text:Ne(_t(e))}])}var W=class extends Error{constructor(n){super(n.message);this.detail=n;this.name="ApiRequestError"}},ze=document.querySelector("#app");if(!ze)throw new Error("Missing app root.");var Ge=ze,Ot=new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}),Bt="Appeal Compass is designed only for individual residential homeowners appealing their own home; if interested in a similar tool for commercial properties please reach out here.",Ht="Appeal Compass is busy helping other homeowners right now. You're in line \u2014 keep this page open and your assessment will start automatically.",Ut="https://www.cookcountyassessoril.gov/exemptions",jt="https://www.cookcountypropertyinfo.com/",Xe=j.length>0,Y=Xe,z=Xe,Be=0,m=null,u=null,G=null,S="all",me=ce,A=1,F=ae,ge=window.location.pathname==="/methodology";function r(e){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function h(e,t){return`<a href="${r(e)}" target="_blank" rel="noreferrer">${r(t)}<span class="sr-only"> (opens in new tab)</span></a>`}function Ke(e,t,n="?",s=""){Be+=1;let a=`tooltip-${Be}`;return`<span class="${s?`tooltip ${s}`:"tooltip"}">
    <button class="tooltip-toggle" type="button" aria-label="${r(e)}" aria-expanded="false" aria-describedby="${a}">${r(n)}</button>
    <span class="tooltip-bubble" id="${a}" role="tooltip">${r(t)}</span>
  </span>`}function w(e,t){return Ke(e,t)}function Je(e,t){return Ke(e,t,"!","warning-tooltip")}function fe(e){let t=String(e??""),n=/https?:\/\/[^\s<>"']+/g,s="",a=0;for(let i of t.matchAll(n)){let o=i[0],c=i.index??0,v=o.match(/[.,;:)]+$/)?.[0]??"",f=o.slice(0,o.length-v.length);s+=r(t.slice(a,c)),s+=`<a href="${r(f)}" target="_blank" rel="noreferrer">${r(f)}<span class="sr-only"> (opens in new tab)</span></a>${r(v)}`,a=c+o.length}return s+r(t.slice(a))}function g(e){return e===null?"Not available":Ot.format(e)}function b(e,t=0){return e===null?"Not available":e.toLocaleString("en-US",{maximumFractionDigits:t})}function be(e){return e===null?"Not available":String(Math.trunc(e))}function Vt(e){return e==="LIMITED"?"Limited public-data evidence":e==="STRONG"?"Strong":e==="MODERATE"?"Moderate":e}function Wt(e){return e.split("_").filter(Boolean).map(t=>t.charAt(0).toUpperCase()+t.slice(1)).join(" ")}function Yt(){let e=new Date,t=e.getFullYear(),n=String(e.getMonth()+1).padStart(2,"0"),s=String(e.getDate()).padStart(2,"0");return`${t}-${n}-${s}`}function $(e){let[t,n,s]=e.split("-"),a=Number(t),i=Number(n),o=Number(s);return!Number.isFinite(a)||!Number.isFinite(i)||!Number.isFinite(o)?e:new Date(Date.UTC(a,i-1,o)).toLocaleDateString("en-US",{year:"numeric",month:"short",day:"numeric",timeZone:"UTC"})}function zt(e,t){return e.length>0&&e.every(n=>t>n.closes)}function Gt(e){let t=e.evidenceDeadline?`; evidence due ${$(e.evidenceDeadline)}`:"";return`${$(e.opens)} to ${$(e.closes)}${t}`}function Xt(){return Object.entries(ee).flatMap(([t,n])=>n.map(s=>`<li>${r(t)}: ${r(Gt(s))}</li>`)).join("")||"<li>No configured Assessor filing windows are available in the current data.</li>"}function Kt(e){let t=Object.values(ee).flat();return zt(t,e)?Je("Assessor calendar warning",`All configured deadlines for this venue appear to be past as of ${e}. The data may be stale; verify at the official source before filing. You can still select this venue to prepare for the next session.`):""}function ue(e){return`<div class="venue-option">
    <div class="venue-choice-row">
      <label class="venue-choice">
        <input type="radio" name="venue" value="${e.value}" required>
        <span>${r(e.label)}</span>
      </label>
      ${e.warning??""}
    </div>
    ${e.details}
  </div>`}function Jt(){let e=Yt();return`<fieldset class="question-group venue-picker">
    <legend>Where do you want to appeal?</legend>
    <div class="venue-options">
      ${ue({value:"assessor",label:"Cook County Assessor",warning:Kt(e),details:`<details class="venue-details">
          <summary>About the Assessor path</summary>
          <p>The Assessor is the first-level Cook County appeal venue. Start here for current-year assessment challenges and documented property-description errors.</p>
          <p>Use this path if you are within the township filing window or preparing for the next Assessor session.</p>
          <p>Official source: ${h(H,"Cook County Assessor calendar")}. Verify at the official source before filing.</p>
          <ul class="deadline-list">${Xt()}</ul>
        </details>`})}
      ${ue({value:"bor",label:"Cook County Board of Review",warning:Je("Board of Review schedule status","Tax Year 2026 township filing dates have not been published. The official page still lists the prior 2025 schedule."),details:`<details class="venue-details">
          <summary>About the BOR path</summary>
          <p>The Board of Review is the second-level Cook County appeal venue and has its own township filing and evidence deadlines.</p>
          <p>Use this path if you are filing at BOR, preparing after an Assessor appeal, or checking BOR-specific comparable evidence.</p>
          <p>Tax Year 2026 township dates are not published yet. Do not use the expired 2025 schedule as a current deadline.</p>
          <p>Official source: ${h(_,"Cook County BOR dates and deadlines")}. Check the official page before filing.</p>
        </details>`})}
      ${ue({value:"ptab",label:"Illinois PTAB",details:`<details class="venue-details">
          <summary>About the PTAB path</summary>
          <p>PTAB is the Illinois state appeal board available after a written BOR decision for the same tax year.</p>
          <p>Use this path only when you have, or are preparing for, a BOR decision notice. The deadline is generally 30 days from the date on the written notice; Appeal Compass will not guess that date.</p>
          <p>Official source: ${h(U,"Illinois PTAB")}. Verify at the official source before filing.</p>
        </details>`})}
    </div>
  </fieldset>`}async function Ze(e){let t=await fetch(e,{headers:{accept:"application/json"}}),n=await t.json();if(!t.ok||typeof n=="object"&&n&&"ok"in n&&n.ok===!1){let s=n.error??{kind:"request",message:"The request failed."};throw new W(s)}return n}function E(e,t){let n=new FormData(e).get(t);return typeof n=="string"?n.trim():""}function Zt(e,t){let n=["jurisdiction","venue","ownershipType","borNoticeReceived","borNoticeDate","purchasePrice","purchaseDate","appraisalValue","appraisalDate","actualSqft","actualAv","actualImprovementAv"];for(let s of n){let a=E(t,s);a&&e.set(s,a)}}function He(e){return`<section class="progress" aria-live="polite"><p>${r(e)}</p></section>`}function Qe(){return`<svg aria-hidden="true" class="github-mark" viewBox="0 0 16 16" width="20" height="20">
    <path fill="currentColor" d="M8 0C3.58 0 0 3.67 0 8.2c0 3.62 2.29 6.69 5.47 7.78.4.08.55-.18.55-.39 0-.19-.01-.84-.01-1.53-2.01.38-2.53-.5-2.69-.96-.09-.24-.48-.96-.82-1.16-.28-.16-.68-.55-.01-.56.63-.01 1.08.59 1.23.84.72 1.24 1.87.89 2.33.68.07-.53.28-.89.51-1.09-1.78-.21-3.64-.91-3.64-4.04 0-.89.31-1.62.82-2.19-.08-.21-.36-1.04.08-2.16 0 0 .67-.22 2.2.84A7.43 7.43 0 0 1 8 3.98c.68 0 1.36.09 2 .28 1.53-1.06 2.2-.84 2.2-.84.44 1.12.16 1.95.08 2.16.51.57.82 1.3.82 2.19 0 3.14-1.87 3.83-3.65 4.04.29.26.54.76.54 1.54 0 1.11-.01 2-.01 2.27 0 .21.15.47.55.39A8.08 8.08 0 0 0 16 8.2C16 3.67 12.42 0 8 0Z"/>
  </svg>`}function et(){return`<footer class="site-footer">
    <div class="footer-project">
      <strong>Appeal Compass</strong>
      <p class="project-credit">An open-source GPLv3 project developed by <a href="https://github.com/tommasodesantis" target="_blank" rel="noreferrer">Tommaso De Santis<span class="sr-only"> (opens in new tab)</span></a></p>
    </div>
    <nav class="footer-links" aria-label="Project links">
      <a class="footer-icon-link" href="https://github.com/tommasodesantis/appealcompass" target="_blank" rel="noreferrer">${Qe()}<span>GitHub</span><span class="sr-only"> (opens in new tab)</span></a>
      <a href="https://ko-fi.com/tomdesantis" target="_blank" rel="noreferrer">Support the project<span class="sr-only"> (opens in new tab)</span></a>
      <button type="button" id="open-feedback" class="link-button">Suggest a feature or report a problem</button>
    </nav>
  </footer>`}function tt(){return`<a class="header-icon-link" href="https://github.com/tommasodesantis/appealcompass" target="_blank" rel="noreferrer">${Qe()}<span>View on GitHub</span><span class="sr-only"> (opens in new tab)</span></a>`}function nt(){let e=Y?"":" disabled",t=Y?`<div class="cf-turnstile" data-sitekey="${r(j)}" data-action="feedback"></div>`:'<p class="hint">Feedback is disabled until the Turnstile site key is configured.</p>';return`<section id="report-panel" class="report-panel" hidden>
    <div class="report-card" role="dialog" aria-modal="true" aria-labelledby="report-title">
      <button type="button" id="close-report" class="secondary close-button">Close</button>
      <h2 id="report-title">Report a problem or request a feature</h2>
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
        <button type="submit"${e}>Submit feedback</button>
      </form>
    </div>
  </section>`}function Qt(){return`<section id="entity-refusal-panel" class="modal-panel" hidden>
    <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="entity-refusal-title">
      <button type="button" id="close-entity-refusal" class="secondary close-button">Close</button>
      <h2 id="entity-refusal-title">Residential homeowners only</h2>
      <p>${r(Bt).replace("here.",'<a href="#contact-panel" id="open-contact-from-refusal">here</a>.')}</p>
    </div>
  </section>`}function st(){let e=z?"":" disabled",t=z?`<div class="cf-turnstile" data-sitekey="${r(j)}" data-action="commercial_interest"></div>`:'<p class="hint">Contact is disabled until the Turnstile site key is configured.</p>';return`<section id="contact-panel" class="modal-panel" hidden>
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
  </section>`}function en(e=null){let t=e?[e]:["Looking up your property...","Fetching assessment history...","Finding similar homes...","Building the evidence summary..."],n=0,s=t[0]??"",a=document.querySelector("#progress");a&&(a.innerHTML=He(t[n]??s));let i=window.setInterval(()=>{n=(n+1)%t.length;let o=document.querySelector("#progress");o&&(o.innerHTML=He(t[n]??s))},650);return()=>window.clearInterval(i)}async function tn(){try{let e=await Ze("/api/queue");return e.busy?e.message??Ht:null}catch{return null}}function nn(){Ge.innerHTML=`
    <header class="topline">
      <div class="topline-head">
        <h1>Appeal Compass</h1>
        ${tt()}
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
              ${w("What is a PIN?","A PIN is the 14-digit parcel number on your assessment notice, tax bill, or property record card.")}
            </div>
            <input id="pin-input" name="pin" autocomplete="off" inputmode="numeric" placeholder="03-00-000-000-0001" required>
          </div>
        </div>
        <p class="hint pin-help">Don't know your PIN? You can recover it from the ${h(jt,"Cook County Property Tax Portal")}.</p>

        ${Jt()}

        <fieldset class="question-group ownership-question">
          <legend>Who owns the property?</legend>
          <label>
            <span class="sr-only">Who owns the property?</span>
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
    ${et()}
    ${nt()}
    ${Qt()}
    ${st()}
  `}function sn(){Ge.innerHTML=`
    <header class="topline">
      <div class="topline-head">
        <h1>Methodology</h1>
        ${tt()}
      </div>
      <p class="lede">How Appeal Compass screens public data for residential property-tax appeal evidence.</p>
      <p><a href="/">Back to Appeal Compass</a></p>
    </header>

    <nav class="methodology-nav panel" aria-label="Methodology sections">
      <a href="#scope">Scope</a>
      <a href="#data-years">Data and years</a>
      <a href="#comparables">Comparables</a>
      <a href="#sales-evidence">Sales and venues</a>
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
      <p>The tool first requests the current assessment-year parcel, characteristic, and assessed-value rows. If a current row exists but has no usable assessed value, it uses the most recent value-bearing year and labels that limitation. For each assessed-value component, the selection order is Board of Review, Assessor certified, then Assessor mailed. Subject and comparable assessment years remain visible in the results and exports.</p>
      <p>On the county property-information portal, \u201CAssessment Information\u201D is the assessed value for the named year and stage. \u201CEstimated Property Value\u201D is generally that residential assessed value divided by the 10% assessment level. It is not an appraisal, sale price, or tax bill. A portal showing an older certified year can therefore differ from Appeal Compass when this tool has a newer complete Board, certified, or mailed row.</p>
      <p>When the residential-characteristics data identifies multiple property cards, Appeal Compass combines building square footage and other improvement facts across the cards while using the parcel land area once. If the expected cards, their classes, or assessed-value components cannot be reconciled, automated reduction and savings estimates are suppressed.</p>
      <p>If residential characteristics are missing, the tool may ask for only the field needed to continue, such as building area or Improvement AV. Values entered by a user are fallback inputs and are labeled user-supplied.</p>
      <p>Data notes combine related limitations, such as missing characteristics and older assessed values, so the same issue is not repeated several times.</p>
    </section>

    <section class="panel stack" id="comparables">
      <p class="eyebrow">03 / Comparable evidence</p>
      <h2>Selection, metrics, and interpretation</h2>
      <p>Residential uniformity evidence uses Improvement AV per building square foot. Total AV is shown for context, overvaluation checks, value breakdowns, and savings estimates, but Total AV alone does not generate a residential uniformity argument.</p>
      <p>The candidate pool starts with the same public property class and township. Venue-specific profiles apply building-size and year-built rules, prefer same-neighborhood homes when enough records exist, and require matching known assessment years. Multi-card subjects are compared only with reconciled parcels having the same number of residential property cards. The selected-comparables table shows the full filtered pool, including rows assessed above the subject; a higher-assessed row is context, not support for a reduction.</p>
      <p>A lower similarity score means closer observable characteristics. Scores 0.00-0.10 are excellent, 0.10-0.20 are good, and 0.20-0.35 are usable. Only scores at or below 0.35 can drive the median, evidence level, target assessment, or savings. Broader rows remain visible as context but cannot make an appeal look actionable.</p>
      <p>The evidence level summarizes the available public-data support. It is a screening label, not a legal conclusion. A pool can contain several homes while producing no reduction argument when the subject is already assessed below the pool median.</p>
    </section>

    <section class="panel stack" id="sales-evidence">
      <p class="eyebrow">04 / Sales, appraisals, and venues</p>
      <h2>Value evidence is separate from comparable assessment evidence</h2>
      <p>Sales in the comparable table describe other properties and are context only. Changing the sale filter never recalculates the uniformity comparison. A value check instead uses a qualifying sale, reported purchase, or appraisal for the subject property itself. The homeowner can add one documented subject purchase or appraisal in the collapsed value-evidence form.</p>
      <p>The date screen is tied to January 1 of the subject's assessment year and the selected venue. The ${h(Te,"Assessor appeal guidance")} uses a two-year window for subject purchase and appraisal evidence. ${h(xe,"BOR Rule 18")} identifies purchases within three years of the lien date; Appeal Compass uses the same conservative three-year screen for BOR appraisals. ${h(Ce,"PTAB guidance")} calls for value evidence as close as possible to January 1 rather than publishing the same fixed cutoff, so the app uses a conservative three-year screening window and labels it as a screen, not an official PTAB deadline.</p>
      <p>The evidence expected also differs by venue. The Assessor screen can identify current assessment uniformity, value, and factual-description issues. BOR has its own filing and evidence rules. PTAB generally requires stricter, verified property facts and adjustments in a residential comparison grid. Public data does not contain every PTAB adjustment field, so Appeal Compass does not fabricate a PTAB-ready conclusion when those facts are missing.</p>
    </section>

    <section class="panel stack" id="edge-cases">
      <p class="eyebrow">05 / Property edge cases</p>
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
      <p class="eyebrow">06 / Land and arguments</p>
      <h2>Separate checks prevent misleading comparisons</h2>
      <p>The land-component check compares Land AV per land square foot. This helps distinguish lot-size differences from building uniformity evidence. A large lot or unusual land assessment may explain a Total AV difference without supporting a building-assessment reduction.</p>
      <p>Potential arguments are generated only when their underlying checks pass. These may include uniformity, overvaluation, description error, or assessment shock. \u201CNo strong public-data argument\u201D means only that this screen did not find one; condition, vacancy, demolition, exemptions, appraisal evidence, and other facts may still matter.</p>
    </section>

    <section class="panel stack" id="deadlines">
      <p class="eyebrow">07 / Deadlines</p>
      <h2>How dates and unavailable schedules are handled</h2>
      <p>Assessor dates come from the official Tax Year 2026 township calendar. Townships without published dates are labeled \u201Cdates not published yet\u201D; the tool does not invent a date.</p>
      <p>The official Board of Review dates page currently shows the prior Tax Year 2025 schedule, not a Tax Year 2026 township schedule. Appeal Compass therefore shows \u201C2026 BOR dates not published yet\u201D and links to the ${h(_,"official BOR dates page")} rather than reusing expired dates.</p>
      <p>PTAB generally requires filing within 30 days after the written BOR decision notice. The notice day is excluded and the last day is included. If the last day is a Saturday, Sunday, or Illinois legal holiday, the date moves to the next business day. For Cook County, a later statutory date tied to the township's final-action transmission may apply; that transmission is not observable in the public inputs, so the displayed date is conservative and must be verified with ${h(U,"PTAB")}.</p>
      <p>Official pages control. Check the ${h(H,"Assessor calendar")}, ${h(_,"BOR dates page")}, or ${h(U,"PTAB site")} immediately before filing.</p>
    </section>

    <section class="panel stack" id="savings">
      <p class="eyebrow">08 / Savings and exports</p>
      <h2>Estimates, not promises</h2>
      <p>The point estimate applies the possible assessed-value reduction, state equalizer, and displayed tax-rate source. The range is shown around that point estimate. Missing current values or a default county tax-rate assumption reduces confidence.</p>
      <p>Third-party companies may show different potential savings because their quote models, private or user-supplied facts, comparable choices, target reductions, fee assumptions, and exemptions may differ. Appeal Compass does not reverse-engineer or calibrate its public-data screen to a proprietary quote. A difference by itself is not evidence that either estimate is a promised result.</p>
      <p>The print report uses the current similarity and sale-information filters and the selected 3, 5, or 10-row limit. The spreadsheet preserves the broader comparable evidence for review. User-entered fallback values are labeled user-supplied. Taxes must still be paid on time while an appeal is pending.</p>
    </section>

    ${et()}
    ${nt()}
    ${st()}
  `}function ve(e){let t=document.querySelector("#form-error");t&&(t.innerHTML=e?`<section class="error inline-error" role="alert">${r(e)}</section>`:"")}function N(e,t=!1){let n=document.querySelector("#report-status");n&&(n.innerHTML=e?`<p class="${t?"error inline-error":"notice inline-error"}">${r(e)}</p>`:"")}function q(e,t=!1){let n=document.querySelector("#contact-status");n&&(n.innerHTML=e?`<p class="${t?"error inline-error":"notice inline-error"}">${r(e)}</p>`:"")}function an(){let e=document.querySelector("#report-panel"),t=document.querySelector("#report-context"),n=document.querySelector('#report-form select[name="category"]');if(!e)return;t&&m&&(t.value=`PIN ${m.case.parcel.pinFormatted}; venue ${m.routing.venue}; generated ${m.generatedAt}`),n instanceof HTMLSelectElement&&(n.value=""),N(Y?"":"Feedback is disabled until the Turnstile site key is configured.",!0),e.hidden=!1,e.querySelector("select, textarea, input, button")?.focus()}function at(){let e=document.querySelector("#report-panel");e&&(e.hidden=!0)}function rn(){let e=document.querySelector("#entity-refusal-panel");if(!e)return;e.hidden=!1,e.querySelector("a, button")?.focus()}function he(){let e=document.querySelector("#entity-refusal-panel");e&&(e.hidden=!0)}function pe(){let e=document.querySelector("#contact-panel");if(!e)return;q(z?"":"Contact is disabled until the Turnstile site key is configured.",!0),e.hidden=!1,e.querySelector("input, textarea, button")?.focus()}function rt(){let e=document.querySelector("#contact-panel");e&&(e.hidden=!0)}function Ue(e,t){let n=new FormData(e).get(t);return typeof n=="string"?n:""}function je(e,t,n){let s=e.querySelector(`[data-conditional="${t}"]`);if(s){s.hidden=!n;for(let a of Array.from(s.querySelectorAll("input, select, textarea"))){if(!(a instanceof HTMLInputElement||a instanceof HTMLSelectElement||a instanceof HTMLTextAreaElement)||a.closest("[data-conditional]")!==s)continue;let i=a;i.disabled=!n,i.required=n,n||(i instanceof HTMLInputElement&&i.type==="radio"?i.checked=!1:i.value="")}}}function X(e){let t=Ue(e,"venue")==="ptab";je(e,"ptabNotice",t);let n=t&&Ue(e,"borNoticeReceived")==="yes";je(e,"ptabNoticeDate",n)}function on(e){return ve(""),X(e),e.reportValidity()?E(e,"ownershipType")!=="individual"?(rn(),!1):!0:!1}function ln(e){let t=e.notices;return t.length===0?"":`<section class="data-notices" aria-labelledby="data-notes-heading">
    <div class="section-heading-row">
      <h2 id="data-notes-heading">Data notes</h2>
      <span class="notice-count">${t.length}</span>
    </div>
    <div class="notice-grid">${t.map(n=>`<article class="data-note ${r(n.severity)}">
          <h3>${r(n.title)}</h3>
          <p>${fe(n.summary)}</p>
          ${n.details.length>0?`<details><summary>Details and next check</summary><ul>${n.details.map(s=>`<li>${fe(s)}</li>`).join("")}</ul></details>`:""}
        </article>`).join("")}</div>
  </section>`}function cn(e){let t=e.routing,n=e.case.parcel,s=e.case.userEvidence.borNoticeDate,a=t.venue==="ptab"&&s?`Written BOR notice dated ${$(s)}`:`${n.townshipName} township`,i=c=>c===null?"":c===0?"Today":c>0?`${c} days away`:`${Math.abs(c)} days ago`,o=(t.deadlines??[]).map(c=>`<div class="deadline-card">
        <span>${r(c.label)}</span>
        <strong>${r($(c.date))}</strong>
        ${c.daysRemaining===null?"":`<small>${r(i(c.daysRemaining))}</small>`}
      </div>`).join("");return`<section class="panel deadline-panel" aria-labelledby="deadline-info">
    <div class="section-heading-row">
      <h2 id="deadline-info">Deadline status</h2>
    </div>
    <p class="deadline-headline">${r(t.headline)}</p>
    ${o?`<div class="deadline-cards">${o}</div>`:""}
    <dl class="compact-facts">
      <div><dt>Venue</dt><dd>${r(e.venue.name)}</dd></div>
      <div><dt>Basis</dt><dd>${r(a)}</dd></div>
      <div><dt>Official deadline source</dt><dd>${t.officialUrl?h(t.officialUrl,"Check official dates"):"Not available"}</dd></div>
      <div><dt>Filing rules</dt><dd>${h(e.venue.rulesUrl,"Review what to submit")}</dd></div>
    </dl>
    <details class="reasoning-details"><summary>How this status was determined</summary><ul>${t.reasoning.map(c=>`<li>${fe(c)}</li>`).join("")}</ul></details>
  </section>`}function dn(e){let t=e.evidence.comparableAnalysis.missingFields;return t.length===0?"":`<section class="panel" aria-labelledby="missing-public-data">
    <h2 id="missing-public-data">Missing public data</h2>
    <p>Some public fields needed for the comparable analysis were missing. If you have reliable values, add only those missing fields and rerun the review.</p>
    <form id="missing-evidence-form" class="stack">
      <div class="evidence-grid">
        ${t.map(n=>`<label>
              <span>${r(n.label)}</span>
              <input name="${r(n.name)}" inputmode="decimal" required>
              <span class="hint field-help-line">${r(n.helpText)}</span>
            </label>`).join("")}
      </div>
      <p class="hint">These values are used only as fallback inputs and will be labeled user-supplied.</p>
      <button type="submit">Rerun with fallback values</button>
    </form>
  </section>`}function un(e){let t=e.case.userEvidence,n=t.purchasePrice?"purchase":t.appraisalValue?"appraisal":"",s=t.purchasePrice??t.appraisalValue,a=t.purchaseDate??t.appraisalDate;return`<details class="value-evidence-details">
    <summary>Add optional subject sale or appraisal evidence</summary>
    <div class="value-evidence-content">
      <h3 class="heading-with-tooltip">Subject-property value check ${w("What value evidence is used here","Enter only a purchase or appraisal for the subject property. Comparable-property sales remain context only. The selected venue and assessment year determine whether the date is recent enough to support an automated value check.")}</h3>
      <p>Use this only if you can document the subject property's arm's-length purchase or an appraisal. Do not enter a comparable property's sale.</p>
      <form id="value-evidence-form" class="stack">
        <div class="evidence-grid">
          <label>
            <span>Evidence type</span>
            <select name="valueEvidenceType" required>
              <option value="">Choose one</option>
              <option value="purchase"${n==="purchase"?" selected":""}>Subject purchase</option>
              <option value="appraisal"${n==="appraisal"?" selected":""}>Subject appraisal</option>
            </select>
          </label>
          <label>
            <span>Price or appraised value</span>
            <input name="valueAmount" type="number" inputmode="decimal" min="1" step="1" value="${r(s??"")}" required>
          </label>
          <label>
            <span>Purchase or appraisal date</span>
            <input name="valueDate" type="date" value="${r(a??"")}" required>
          </label>
        </div>
        <p class="hint">The date is screened against January 1 of assessment year ${be(e.case.parcel.assessmentYear)} and the selected venue's rules. Evidence outside that window is shown only as context and cannot create savings.</p>
        <button type="submit">Rerun value check</button>
      </form>
    </div>
  </details>`}function pn(e){let t=e.evidence.comparableAnalysis,n=e.evidence.landAssessment,s=e.evidence.valueEvidence,a=h(e.venue.rulesUrl,"See official rules"),i=w("What similarity score means","Lower similarity scores mean the comparable is more similar to the subject based on size, age, and distance."),o=I(t.profileKey),c=V(t.pool,G),v=Pe(c,S,e.case.parcel.assessmentYear),f=ke(v,A,me);A=f.currentPage;let x=oe(G),D=t.pool.length>0?`<div class="filter-row">
        <div class="filter-grid">
          <label>
            <span>Similarity score threshold</span>
            <select id="similarity-filter">
              ${$e.map(l=>`<option value="${r(l.value)}"${l.value===x?" selected":""}>${r(l.label)}</option>`).join("")}
            </select>
          </label>
          <label>
            <span>Sale information</span>
            <select id="sale-filter">
              <option value="all"${S==="all"?" selected":""}>All assessment comps</option>
              <option value="recent"${S==="recent"?" selected":""}>Recent 3-year sales</option>
              <option value="recorded"${S==="recorded"?" selected":""}>Sale on record</option>
            </select>
          </label>
        </div>
        <p class="hint">Sale information is context only. This filter changes the rows shown on screen and in the PDF; it does not recalculate the assessment comparison.</p>
      </div>`:"",K=l=>{if(t.subjectAvPerSqft===null||t.subjectAvPerSqft<=0)return'<span class="comparison neutral">Cannot compare \u2014 subject value missing</span>';let k=(l-t.subjectAvPerSqft)/t.subjectAvPerSqft*100;return Math.abs(k)<.5?'<span class="comparison neutral">About the same</span>':k<0?`<span class="comparison lower">${b(Math.abs(k),1)}% lower</span>`:`<span class="comparison higher">${b(k,1)}% higher</span>`},O=f.pageRows.map(l=>{let Se=l.comparable.saleDate&&l.comparable.salePrice&&!ne(l.comparable.saleDate,e.case.parcel.assessmentYear),ht=l.similarity>t.maxActionableSimilarity,gt=l.comparable.saleDate?`${r($(l.comparable.saleDate))}${Se?'<small class="stale-sale">Older sale \u2014 context only</small>':""}`:"Not available",bt=`${g(l.comparable.salePrice)}${Se?'<small class="stale-sale">Context only</small>':""}`;return`<tr>
        <td>${r(l.comparable.pinFormatted)}</td>
        <td>${l.distanceKm===null?"Not available":b(l.distanceKm,2)}</td>
        <td>${r(l.comparable.neighborhood??"Not available")}</td>
        <td>${r(P(l.comparable.propertyClass)||"Not available")}</td>
        <td>${b(l.comparable.buildingSqft)}</td>
        <td>${be(l.comparable.yearBuilt)}</td>
        <td>${gt}</td>
        <td>${bt}</td>
        <td>${r(o)}</td>
        <td>${g(l.avPerSqft)}</td>
        <td>${K(l.avPerSqft)}</td>
        <td>${b(l.similarity,3)}${ht?'<small class="stale-sale">Broader match \u2014 context only</small>':""}</td>
      </tr>`}).join(""),B=v.length>0?`<div class="table-pagination" aria-label="Comparable table pagination">
          <label><span>Rows per page</span><select id="comps-page-size">${le.map(l=>`<option value="${l}"${l===me?" selected":""}>${l}</option>`).join("")}</select></label>
          <p class="table-page-status" aria-live="polite">Rows ${f.startRow}\u2013${f.endRow} of ${f.totalRows}; page ${f.currentPage} of ${f.totalPages}</p>
          <div class="table-page-actions">
            <button type="button" id="comps-prev" class="secondary"${f.currentPage<=1?" disabled":""}>Previous</button>
            <button type="button" id="comps-next" class="secondary"${f.currentPage>=f.totalPages?" disabled":""}>Next</button>
          </div>
        </div>`:"",lt=O.length===0?`<p class="empty-state">${t.pool.length>0?"No selected homes meet the current display filters.":"No comparable rows could be selected from the available public data."}</p>`:`<div class="table-wrap"><table>
          <caption>${v.length} selected comparable ${v.length===1?"home":"homes"}</caption>
          <thead><tr><th>PIN</th><th>Distance km</th><th>Neighborhood</th><th>Property class</th><th>Building sqft</th><th>Year built</th><th>Sale date</th><th>Sale price</th><th>Assessment metric</th><th>${r(t.metricLabel)}/sqft</th><th>Compared with subject</th><th>Similarity score ${i}</th></tr></thead>
          <tbody>${O}</tbody>
        </table></div>${B}`,ct=e.evidence.tier==="LIMITED"?`${r(e.evidence.tierMessage)} ${a}.`:r(e.evidence.tierMessage),dt=t.status!=="ok"?`${t.note} No uniformity conclusion is shown until the required subject fields and at least three suitable homes are available.`:t.gapPct===null?"The selected homes did not produce a usable uniformity gap.":t.gapPct>0?`The subject is assessed ${b(t.gapPct,1)}% above the median of ${t.actionablePoolSize} sufficiently similar homes on ${t.metricLabel}/sqft. That difference may support a closer uniformity review, but each row still needs verification.`:t.gapPct<0?`The subject is assessed ${b(Math.abs(t.gapPct),1)}% below the median of ${t.actionablePoolSize} sufficiently similar homes on ${t.metricLabel}/sqft. These public comparables do not support a lower residential uniformity assessment.`:`The subject is aligned with the median of sufficiently similar homes on ${t.metricLabel}/sqft, so this screen does not show a residential uniformity gap.`,ut=e.evidence.arguments.length?e.evidence.arguments.map(l=>`<article class="argument-card">
            <span class="argument-strength">${r(l.strength)}</span>
            <h4>${r(Wt(l.argumentType))}</h4>
            <p>${r(l.text)}</p>
          </article>`).join(""):'<div class="empty-state"><strong>No actionable public-data argument was found.</strong><span>This does not rule out condition, appraisal, exemption, or factual-error evidence that is not present in the public data.</span></div>',pt=e.case.parcel.currentAv??e.case.userEvidence.actualAv??null,mt=s.sourceLabel&&s.value!==null?`<strong>Sale or appraisal evidence:</strong> Implied market value ${g(s.impliedMarketValue)} = Total AV ${g(pt)} \xF7 10% residential assessment level. Compared with the ${r(s.sourceLabel)} of ${g(s.value)}, the difference is ${s.gapPct===null?"not available":`${b(Math.abs(s.gapPct),1)}% ${s.gapPct>=0?"above":"below"}`}. ${r(s.explanation)}`:`<strong>Sale or appraisal evidence:</strong> ${r(s.explanation)}`,C=e.evidence.savingsAssumptions,ft=C.point>0?`<div class="savings-card">
          <div><h3 class="heading-with-tooltip">Savings estimate ${w("How savings are estimated","Estimated savings = \u0394AV \xD7 E \xD7 r, where \u0394AV is the assessed-value reduction, E is the state equalizer, and r is the assumed tax rate. The range is shown as \xB120% and is not a promise.")}</h3></div>
          <strong>${g(C.low)} to ${g(C.high)}</strong>
          <span>Point estimate ${g(C.point)}</span>
        </div>
        <p class="hint">Assumes equalizer ${C.stateEqualizer} and ${r(C.taxRateSource)}; this is an estimate, not a promise.</p>`:`<div class="savings-card savings-unavailable">
          <div><h3>Savings estimate unavailable</h3><p>No actionable public-data reduction amount passed the current evidence checks.</p></div>
        </div>`;return`<section class="panel evidence-panel" aria-labelledby="evidence-summary">
    <div class="section-heading-row evidence-heading">
      <h2 id="evidence-summary">Evidence summary</h2>
      <span class="evidence-level level-${r(e.evidence.tier.toLowerCase())}">${r(Vt(e.evidence.tier))}</span>
    </div>

    <div class="evidence-verdict">
      <p><strong>Uniformity evidence:</strong> ${r(dt)}</p>
      <p>${mt}</p>
      <p class="hint">${ct} ${w("What evidence level means","The evidence level is a screen of how much public data supports spending time on an appeal.")}</p>
    </div>

    ${un(e)}

    <div class="metric-grid" aria-label="Comparable analysis key figures">
      <div><span>Selected homes</span><strong>${b(t.poolSize)}</strong><small>${b(t.actionablePoolSize)} drive the calculation \xB7 ${r(t.scope??"Scope unavailable")}</small></div>
      <div><span>Subject ${r(t.metricLabel)}/sqft</span><strong>${g(t.subjectAvPerSqft)}</strong></div>
      <div><span>Calculation median</span><strong>${g(t.medianAvPerSqft)}</strong></div>
      <div><span>Subject vs median</span><strong>${t.gapPct===null?"Not available":`${b(t.gapPct,1)}%`}</strong></div>
    </div>

    <details class="analysis-details">
      <summary>Analysis method and value context</summary>
      <p>${t.status==="ok"?`The ${r(t.profileLabel)} matching method compared ${r(t.metricLabel)}/sqft for same-class homes and used the ${r(t.scope??"available")} scope for this case.`:r(t.note)}</p>
      <p><strong>Total AV:</strong> Shown for value context, overvaluation checks, and savings estimates. It is not used by itself to generate residential uniformity evidence.</p>
      <p><strong>Land check:</strong> ${r(n.note)} Subject Land AV/sqft ${g(n.subjectLandAvPerSqft)}; sufficiently-similar-pool median ${g(n.medianLandAvPerSqft)}.</p>
    </details>

    <div class="subsection-heading">
      <h3>Selected comparable homes</h3>
    </div>
    ${D}
    ${lt}

    <div class="subsection-heading"><h3 class="heading-with-tooltip">Potential appeal arguments ${w("What arguments mean","An argument is a distinct reason the assessment may be too high: uniformity, overvaluation, description error, or assessment shock. Strength labels are screening indicators, not legal conclusions.")}</h3></div>
    <div class="argument-grid">${ut}</div>

    ${ft}
    <p><a href="/methodology">Read the methodology</a></p>
  </section>`}function mn(e,t){let n=h(e.venue.submissionUrl,"official submission page"),s=h(e.venue.rulesUrl,"official rules and requirements");return`<section class="panel" aria-labelledby="whats-next">
    <h2 id="whats-next">What's Next?</h2>
    <p>You can download a PDF summary of the comparative analysis shown above. If you decide to appeal at ${r(e.venue.name)}, you can submit that PDF with the other documents the venue requires as part of your evidence.</p>
    <p>Double-check every Appeal Compass finding before filing. This evidence is not a guarantee that an appeal will succeed.</p>
    <p>Other documented factors may also support a property-tax reduction, including condition issues, vacancy, demolition, incorrect property characteristics, recent sale or appraisal evidence, and other factual errors.</p>
    <p>Some homeowners may qualify for exemptions, including homeowner, senior, senior freeze, disability, disabled veteran, returning veteran, home improvement, and long-time occupant exemptions. Verify eligibility on the ${h(Ut,"Cook County Assessor exemptions page")}.</p>
    <p>Before filing, review the ${n} and ${s} for exactly what to submit.</p>
    <div class="export-settings">
      <label><span>Comparable homes in PDF</span><select id="pdf-comps-limit">${se.map(a=>`<option value="${a}"${a===F?" selected":""}>${a}</option>`).join("")}</select></label>
      <p class="hint">The PDF uses the current similarity and sale-information filters, then includes the most similar homes up to this limit.</p>
    </div>
    <div class="actions">
      <a class="button-link" href="/print?${t.toString()}">Print / Save as PDF</a>
      <button type="button" id="download-comps" class="secondary">Download comps (.xlsx)</button>
    </div>
  </section>`}function T(e,t){let n=m!==e;m=e,u=new URLSearchParams(t),G=ie(u.get("maxSimilarity")),S=te(u.get("saleFilter")),F=re(u.get("maxComps")),u.set("saleFilter",S),u.set("maxComps",String(F)),n&&(A=1);let s=ot();s&&Ie(s,u,e);let a=e.case.parcel,i=a.address.trim().length>0,o=i?[a.address,a.city,a.zipCode].filter(Boolean).join(", "):"",c=i?"":[a.city,a.zipCode].filter(Boolean).join(", "),v=a.city?"City / ZIP":"ZIP code",f=[e.case.userEvidence.actualSqft?`Actual sqft ${b(e.case.userEvidence.actualSqft)}`:"",e.case.userEvidence.actualAv?`Actual AV ${g(e.case.userEvidence.actualAv)}`:"",e.case.userEvidence.actualImprovementAv?`Actual improvement AV ${g(e.case.userEvidence.actualImprovementAv)}`:""].filter(Boolean),x=new URLSearchParams(u);x.set("pin",a.pin);let D=P(a.propertyClass)||"Not available",K=Ae(a.assessmentStages),O=`<section class="subject panel">
    <h2>Subject property</h2>
    <dl>
      <div><dt>PIN</dt><dd>${r(a.pinFormatted)}</dd></div>
      ${o?`<div><dt>Address</dt><dd>${r(o)}</dd></div>`:""}
      ${c?`<div><dt>${v}</dt><dd>${r(c)}</dd></div>`:""}
      <div><dt class="heading-with-tooltip">Class / township ${w("What class and township mean",`Property class ${D} identifies the Assessor's property type and assessment classification. ${a.townshipName} is the Cook County assessment district used for comparable searches and filing schedules.`)}</dt><dd>${r(D)} / ${r(a.townshipName)}</dd></div>
      <div><dt>Building sqft</dt><dd>${b(a.buildingSqft)}</dd></div>
      <div><dt>Land sqft</dt><dd>${b(a.landSqft)}</dd></div>
      <div><dt class="heading-with-tooltip">Assessment year ${w("What assessment year means",`This is the latest year with usable assessed values selected for the review. The displayed components use ${K}. It may differ from a county page that is showing an older certified year.`)}</dt><dd>${be(a.assessmentYear)}</dd></div>
      <div><dt class="heading-with-tooltip">Total AV ${w("What Total AV means",`Total assessed value is the parcel's Land AV plus Improvement AV. It is not estimated market value or the tax bill. This value uses the ${R(a.assessmentStages.total)} stage.`)}</dt><dd>${g(a.currentAv)}</dd></div>
      <div><dt class="heading-with-tooltip">Improvement AV ${w("What Improvement AV means",`Improvement assessed value is the portion assigned to buildings and other improvements, excluding land. Appeal Compass divides it by ${a.isMulticard?`the combined building area from ${a.cardCount} reconciled property cards`:"building square footage"} for the uniformity screen. This value uses the ${R(a.assessmentStages.improvement)} stage.`)}</dt><dd>${g(a.currentImprovementAv)}</dd></div>
      <div><dt class="heading-with-tooltip">Land AV ${w("What Land AV means",`Land assessed value is the portion assigned to the parcel's land, separate from buildings. Appeal Compass checks it per land square foot as a separate diagnostic. This value uses the ${R(a.assessmentStages.land)} stage.`)}</dt><dd>${g(a.currentLandAv)}</dd></div>
    </dl>
    ${f.length?`<p class="tagline">${r(f.join("; "))} - user-supplied.</p>`:""}
  </section>`,B=document.querySelector("#results");B&&(B.innerHTML=`
    ${dn(e)}

    <section class="notice"><strong>${r(e.evidence.disclaimers[0])}</strong></section>

    ${pn(e)}

    ${O}

    ${ln(e)}

    ${cn(e)}

    ${mn(e,x)}
  `)}function Ve(){m=null,ve("");for(let e of["#results","#address-results"]){let t=document.querySelector(e);t&&(t.innerHTML="")}}async function ye(e){Ve();let t=en(await tn());try{let n=await Ze(`/api/case?${e.toString()}`);Ve(),T(n,e)}catch(n){let s=document.querySelector("#results");if(s){let a=n instanceof Error?n.message:"The case could not be loaded.",i=n instanceof W&&n.detail.kind==="unsupported_property"?r(a).replace("reach out here.",'<button type="button" id="open-contact-from-unsupported" class="link-button">reach out here</button>.'):r(a);s.innerHTML=`<section class="error" role="alert">${i}</section>`}}finally{t();let n=document.querySelector("#progress");n&&(n.innerHTML="")}}async function fn(e){if(!on(e))return;let t=new URLSearchParams,n=E(e,"pin");if(Zt(t,e),n){t.set("pin",n),await ye(t);return}let s=document.querySelector("#results");s&&(s.innerHTML='<section class="error" role="alert">Enter a PIN.</section>')}function hn(e,t){for(let n of Array.from(e.elements)){if(!(n instanceof HTMLInputElement||n instanceof HTMLSelectElement||n instanceof HTMLTextAreaElement)||!n.name)continue;let s=t.get(n.name);if(n instanceof HTMLInputElement&&n.type==="radio"){n.checked=s===n.value;continue}n.value=s??""}X(e)}function it(){let e=ot();if(!e)return;let t=Me(e);if(!t)return;let n=document.querySelector("#case-form");n&&hn(n,t.query),T(t.payload,t.query)}function ot(){try{return window.sessionStorage}catch{return null}}async function gn(e){if(!Y){N("Feedback is disabled until the Turnstile site key is configured.",!0);return}if(!e.reportValidity())return;let t=new FormData(e),n=t.get("cf-turnstile-response");N("Submitting feedback...");let s=await fetch("/api/report",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({category:t.get("category"),description:t.get("description"),context:t.get("context"),turnstileToken:typeof n=="string"?n:""})}),a=await s.json();if(!s.ok||!a.ok){N(a.ok?"The feedback could not be submitted.":a.error?.message??"The feedback could not be submitted.",!0);return}N(`Feedback submitted: ${a.issueUrl}`),e.reset()}async function bn(e){if(!z){q("Contact is disabled until the Turnstile site key is configured.",!0);return}if(!e.reportValidity())return;let t=new FormData(e),n=t.get("cf-turnstile-response");q("Sending message...");let s=await fetch("/api/contact",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({name:t.get("name"),email:t.get("email"),message:t.get("message"),turnstileToken:typeof n=="string"?n:""})}),a=await s.json();if(!s.ok||!a.ok){q(a.ok?"The message could not be sent.":a.error?.message??"The message could not be sent.",!0);return}q(a.message??"Message sent."),e.reset()}function vn(e){if(!m||!u)return;let t=ie(e);t===null?u.delete("maxSimilarity"):u.set("maxSimilarity",oe(t)),A=1,T(m,u)}function yn(e){!m||!u||(S=te(e),u.set("saleFilter",S),A=1,T(m,u))}function wn(e){!m||!u||(me=Ee(e),A=1,T(m,u))}function Sn(e){!m||!u||(F=re(e),u.set("maxComps",String(F)),T(m,u))}function We(e){!m||!u||(A+=e,T(m,u))}function An(e){if(!u||!e.reportValidity())return;let t=new URLSearchParams(u);for(let n of Array.from(e.elements)){if(!(n instanceof HTMLInputElement)||!n.name)continue;let s=n.value.trim();s&&t.set(n.name,s)}ye(t)}function Tn(e){if(!u||!e.reportValidity())return;let t=E(e,"valueEvidenceType"),n=E(e,"valueAmount"),s=E(e,"valueDate"),a=new URLSearchParams(u);for(let i of["purchasePrice","purchaseDate","appraisalValue","appraisalDate"])a.delete(i);t==="purchase"?(a.set("purchasePrice",n),a.set("purchaseDate",s)):t==="appraisal"&&(a.set("appraisalValue",n),a.set("appraisalDate",s)),ye(a)}function we(e=null){for(let t of Array.from(document.querySelectorAll(".tooltip-toggle"))){if(t===e)continue;let n=t.getAttribute("aria-describedby"),s=n?document.getElementById(n):null;t.setAttribute("aria-expanded","false"),s&&s.removeAttribute("style")}}function xn(e,t){t.removeAttribute("style");let n=e.getBoundingClientRect(),s=16,a=Math.min(304,window.innerWidth-s*2);t.style.position="fixed",t.style.width=`${a}px`,t.style.transform="none";let i=t.offsetHeight,o=n.top-i-8,c=n.bottom+8,v=o>=s?o:Math.min(c,window.innerHeight-i-s),f=n.left+n.width/2-a/2,x=Math.max(s,Math.min(f,window.innerWidth-a-s));t.style.position="fixed",t.style.inset=`${Math.max(s,v)}px auto auto ${x}px`}function Cn(e){let t=e.getAttribute("aria-describedby"),n=t?document.getElementById(t):null;if(!n)return;let s=e.getAttribute("aria-expanded")!=="true";we(s?e:null),e.setAttribute("aria-expanded",String(s)),s?xn(e,n):n.removeAttribute("style")}function Ln(){if(!m)return;let e=Oe(m,G),t=new ArrayBuffer(e.byteLength);new Uint8Array(t).set(e);let n=new Blob([t],{type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}),s=URL.createObjectURL(n),a=document.createElement("a");a.href=s,a.download=De(m),document.body.appendChild(a),a.click(),a.remove(),URL.revokeObjectURL(s)}ge?sn():nn();var Ye=document.querySelector("#case-form");Ye&&X(Ye);document.addEventListener("submit",e=>{let t=e.target;t instanceof HTMLFormElement&&t.id==="case-form"&&(e.preventDefault(),fn(t)),t instanceof HTMLFormElement&&t.id==="report-form"&&(e.preventDefault(),gn(t)),t instanceof HTMLFormElement&&t.id==="contact-form"&&(e.preventDefault(),bn(t)),t instanceof HTMLFormElement&&t.id==="missing-evidence-form"&&(e.preventDefault(),An(t)),t instanceof HTMLFormElement&&t.id==="value-evidence-form"&&(e.preventDefault(),Tn(t))});document.addEventListener("change",e=>{let t=e.target;if(t instanceof HTMLInputElement||t instanceof HTMLSelectElement||t instanceof HTMLTextAreaElement){let n=t.form;n?.id==="case-form"&&(ve(""),X(n)),t instanceof HTMLSelectElement&&t.id==="similarity-filter"&&vn(t.value),t instanceof HTMLSelectElement&&t.id==="sale-filter"&&yn(t.value),t instanceof HTMLSelectElement&&t.id==="comps-page-size"&&wn(t.value),t instanceof HTMLSelectElement&&t.id==="pdf-comps-limit"&&Sn(t.value)}});document.addEventListener("click",e=>{let t=e.target;if(t instanceof HTMLElement){let n=t.closest(".tooltip-toggle");if(n){Cn(n);return}we()}t instanceof HTMLElement&&t.id==="download-comps"&&Ln(),t instanceof HTMLElement&&t.id==="comps-prev"&&We(-1),t instanceof HTMLElement&&t.id==="comps-next"&&We(1),t instanceof HTMLElement&&t.id==="open-feedback"&&an(),t instanceof HTMLElement&&(t.id==="close-report"||t.id==="report-panel")&&at(),t instanceof HTMLElement&&t.id==="open-contact-from-refusal"&&(e.preventDefault(),he(),pe()),t instanceof HTMLElement&&t.id==="open-contact-from-unsupported"&&pe(),t instanceof HTMLElement&&t.id==="open-commercial-interest"&&(e.preventDefault(),pe()),t instanceof HTMLElement&&(t.id==="close-entity-refusal"||t.id==="entity-refusal-panel")&&he(),t instanceof HTMLElement&&(t.id==="close-contact"||t.id==="contact-panel")&&rt()});document.addEventListener("keydown",e=>{e.key==="Escape"&&(we(),at(),he(),rt())});window.addEventListener("pageshow",e=>{e.persisted&&!ge&&it()});ge||it();document.documentElement.dataset.enhanced="true";
