var m=document.querySelector("#app");if(!m)throw new Error("Missing app root.");var f=m,h=new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0});function s(e){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function o(e){return e===null?"Not available":h.format(e)}function l(e,t=0){return e===null?"Not available":e.toLocaleString("en-US",{maximumFractionDigits:t})}async function g(e){let t=await fetch(e,{headers:{accept:"application/json"}}),n=await t.json();if(!t.ok||typeof n=="object"&&n&&"ok"in n&&n.ok===!1){let i=n.error?.message??"The request failed.";throw new Error(i)}return n}function p(e,t){let n=new FormData(e).get(t);return typeof n=="string"?n.trim():""}function b(e,t){let n=["venue","borDecisionDate","purchasePrice","purchaseDate","appraisalValue","appraisalDate","actualSqft","actualAv","actualImprovementAv","ownershipType"];for(let a of n){let r=p(t,a);r&&e.set(a,r)}for(let a of["ownerOccupied","age65Plus","seniorFreezeIncome","veteranDisabled","personDisabled","vacancyClaim","demolitionClaim","assessorAppealFiled"])t.elements.namedItem(a)?.checked&&e.set(a,"1");let i=p(t,"conditionIssue").split(`
`).map(a=>a.trim()).filter(Boolean);for(let a of i)e.append("conditionIssue",a)}function u(e){return`<section class="progress" aria-live="polite"><p>${s(e)}</p></section>`}function y(){return`<svg aria-hidden="true" class="github-mark" viewBox="0 0 16 16" width="20" height="20">
    <path fill="currentColor" d="M8 0C3.58 0 0 3.67 0 8.2c0 3.62 2.29 6.69 5.47 7.78.4.08.55-.18.55-.39 0-.19-.01-.84-.01-1.53-2.01.38-2.53-.5-2.69-.96-.09-.24-.48-.96-.82-1.16-.28-.16-.68-.55-.01-.56.63-.01 1.08.59 1.23.84.72 1.24 1.87.89 2.33.68.07-.53.28-.89.51-1.09-1.78-.21-3.64-.91-3.64-4.04 0-.89.31-1.62.82-2.19-.08-.21-.36-1.04.08-2.16 0 0 .67-.22 2.2.84A7.43 7.43 0 0 1 8 3.98c.68 0 1.36.09 2 .28 1.53-1.06 2.2-.84 2.2-.84.44 1.12.16 1.95.08 2.16.51.57.82 1.3.82 2.19 0 3.14-1.87 3.83-3.65 4.04.29.26.54.76.54 1.54 0 1.11-.01 2-.01 2.27 0 .21.15.47.55.39A8.08 8.08 0 0 0 16 8.2C16 3.67 12.42 0 8 0Z"/>
  </svg>`}function $(){return`<footer class="site-footer">
    <p>Appeal Compass is an open-source project developed by <a href="https://github.com/tommasodesantis" target="_blank" rel="noreferrer">Tommaso De Santis<span class="sr-only"> (opens in new tab)</span></a> under GPLv3.</p>
    <a class="footer-icon-link" href="https://github.com/tommasodesantis/appealcompass" target="_blank" rel="noreferrer">${y()}<span>View on GitHub</span><span class="sr-only"> (opens in new tab)</span></a>
    <a href="https://ko-fi.com/tomdesantis" target="_blank" rel="noreferrer">Donations help the project grow and cover hosting and maintenance costs.<span class="sr-only"> (opens in new tab)</span></a>
  </footer>`}function A(){let e=["Looking up your property...","Fetching assessment history...","Finding similar homes...","Building the evidence summary..."],t=0,n=e[0]??"",i=document.querySelector("#progress");i&&(i.innerHTML=u(e[t]??n));let a=window.setInterval(()=>{t=(t+1)%e.length;let r=document.querySelector("#progress");r&&(r.innerHTML=u(e[t]??n))},650);return()=>window.clearInterval(a)}function w(){f.innerHTML=`
    <header class="topline">
      <h1>Appeal Compass</h1>
      <p class="lede">Enter a PIN. A PIN is the 14-digit parcel number on your assessment notice, tax bill, or property record card.</p>
    </header>

    <section class="panel" aria-labelledby="step-one">
      <div class="step-label">Step 1</div>
      <h2 id="step-one">Find the property</h2>
      <form id="case-form" class="stack">
        <div class="lookup-grid">
          <label>
            <span>PIN</span>
            <input name="pin" autocomplete="off" inputmode="numeric" placeholder="03-00-000-000-0001">
          </label>
        </div>
        <p class="hint pin-help">Don't know your PIN? You can recover it from the <a href="https://www.cookcountypropertyinfo.com/" target="_blank" rel="noreferrer">Cook County Property Tax Portal<span class="sr-only"> (opens in new tab)</span></a>.</p>

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
              <span>BOR decision date for PTAB</span>
              <input name="borDecisionDate" type="date">
            </label>
            <label>
              <span>Purchase price</span>
              <input name="purchasePrice" inputmode="decimal">
            </label>
            <label>
              <span>Purchase date</span>
              <input name="purchaseDate" type="date">
            </label>
            <label>
              <span>Appraisal value</span>
              <input name="appraisalValue" inputmode="decimal">
            </label>
            <label>
              <span>Appraisal date</span>
              <input name="appraisalDate" type="date">
            </label>
            <label>
              <span>Actual sqft</span>
              <input name="actualSqft" inputmode="decimal" aria-describedby="actual-help">
            </label>
            <label>
              <span>Actual total AV</span>
              <input name="actualAv" inputmode="decimal">
            </label>
            <label>
              <span>Actual improvement AV</span>
              <input name="actualImprovementAv" inputmode="decimal">
            </label>
            <label>
              <span>Ownership</span>
              <select name="ownershipType">
                <option value="individual">Individual</option>
                <option value="llc">LLC</option>
                <option value="corporation">Corporation</option>
                <option value="other">Other entity</option>
              </select>
            </label>
          </div>
          <p id="actual-help" class="hint">User-supplied values are labeled documentation-required and are used only when official public data is missing.</p>
          <label>
            <span>Condition issues</span>
            <textarea name="conditionIssue" rows="3" placeholder="One issue per line"></textarea>
          </label>
          <div class="checks">
            ${[["ownerOccupied","Owner occupied"],["age65Plus","Age 65+"],["seniorFreezeIncome","Senior Freeze income screen"],["veteranDisabled","Disabled veteran"],["personDisabled","Person with disability"],["vacancyClaim","Vacancy claim"],["demolitionClaim","Demolition claim"],["assessorAppealFiled","Already filed Assessor appeal"]].map(([e,t])=>`<label><input type="checkbox" name="${e}"><span>${t}</span></label>`).join("")}
          </div>
        </details>

        <div class="actions">
          <button type="submit">Review my case</button>
          <button type="button" id="demo-button" class="secondary">Try a sample property</button>
        </div>
      </form>
      <div id="demo-list" class="demo-list" aria-live="polite"></div>
    </section>

    <div id="progress"></div>
    <div id="results"></div>
    ${$()}
  `}function S(e){return e.length===0?"":`<section class="warnings" aria-label="Warnings"><h2>Warnings</h2><ul>${e.map(t=>`<li>${s(t)}</li>`).join("")}</ul></section>`}function P(e){let t=e.routing,n=t.officialUrl?`<a href="${s(t.officialUrl)}" target="_blank" rel="noreferrer">Verify at the official source before filing</a>`:"";if(!t.deadline)return`<p>No computed deadline. ${n}</p>`;let i=t.daysRemaining===null?"":` ${t.daysRemaining>=0?`${t.daysRemaining} days remaining.`:`${Math.abs(t.daysRemaining)} days past the computed deadline.`}`;return`<p><strong>Deadline:</strong> ${s(t.deadline)}.${s(i)} ${n}</p>`}function L(e){let t=e.evidence.comparableAnalysis,n=t.exhibit.map(a=>{let r=t.profileLabel.includes("Assessor")||e.routing.venue==="closed"?a.comparable.av:a.comparable.improvementAv;return`<tr>
        <td>${s(a.comparable.pinFormatted)}</td>
        <td>${l(a.comparable.buildingSqft)}</td>
        <td>${s(a.comparable.yearBuilt??"Not available")}</td>
        <td>${o(r)}</td>
        <td>${o(a.avPerSqft)}</td>
      </tr>`}).join(""),i=n.length===0?"<p>No lower-assessed comparable exhibit is available from the current public data.</p>":`<div class="table-wrap"><table>
          <thead><tr><th>PIN</th><th>Sqft</th><th>Year</th><th>Metric</th><th>Metric/sqft</th></tr></thead>
          <tbody>${n}</tbody>
        </table></div>`;return`<section class="panel" aria-labelledby="step-four">
    <div class="step-label">Step 4</div>
    <h2 id="step-four">Evidence summary</h2>
    <p><strong>Tier:</strong> ${s(e.evidence.tier)}. ${s(e.evidence.tierMessage)}</p>
    <p class="hint">The tier is a rough screen of how much public data supports spending time on an appeal.</p>
    <p><strong>Comparable profile:</strong> ${s(t.profileLabel)} using ${s(t.metricLabel)}.</p>
    <p class="hint">Comparable analysis matters because uniformity appeals compare your assessment to similar homes.</p>
    <p>${s(t.note)}</p>
    <p><strong>Pool:</strong> ${l(t.poolSize)} similar homes, ${s(t.scope??"no scope")}; subject ${s(t.metricLabel)}/sqft ${o(t.subjectAvPerSqft)}; median ${o(t.medianAvPerSqft)}; gap ${l(t.gapPct,1)}%.</p>
    ${i}
    <h3>Arguments</h3>
    ${e.evidence.arguments.length?`<ul>${e.evidence.arguments.map(a=>`<li><strong>${s(a.argumentType)}:</strong> ${s(a.text)}</li>`).join("")}</ul>`:"<p>No strong public-data argument was found. Add sale, appraisal, condition, or factual-error evidence if available.</p>"}
    <h3>Rough savings estimate</h3>
    <p>${o(e.evidence.savingsAssumptions.low)} to ${o(e.evidence.savingsAssumptions.high)}, with point estimate ${o(e.evidence.savingsAssumptions.point)}.</p>
    <p class="hint">Assumes equalizer ${e.evidence.savingsAssumptions.stateEqualizer} and tax rate ${(e.evidence.savingsAssumptions.taxRate*100).toFixed(2)}%; this is a rough range, not a promise.</p>
  </section>`}function T(e,t){let n=e.case.parcel,i=[n.address,n.city,n.zipCode].filter(Boolean).join(", "),a=[e.case.userEvidence.actualSqft?`Actual sqft ${l(e.case.userEvidence.actualSqft)}`:"",e.case.userEvidence.actualAv?`Actual AV ${o(e.case.userEvidence.actualAv)}`:"",e.case.userEvidence.actualImprovementAv?`Actual improvement AV ${o(e.case.userEvidence.actualImprovementAv)}`:""].filter(Boolean),r=new URLSearchParams(t);r.set("pin",n.pin),e.demo&&r.set("demo","1");let d=document.querySelector("#results");d&&(d.innerHTML=`
    <section class="notice"><strong>${s(e.evidence.disclaimers[0])}</strong></section>
    <section class="panel" aria-labelledby="step-three">
      <div class="step-label">Step 3</div>
      <h2 id="step-three">Routing decision</h2>
      <p class="headline">${s(e.routing.headline)}</p>
      ${P(e)}
      <ul>${e.routing.reasoning.map(c=>`<li>${s(c)}</li>`).join("")}</ul>
    </section>

    <section class="subject panel">
      <h2>Subject property</h2>
      <dl>
        <div><dt>PIN</dt><dd>${s(n.pinFormatted)}</dd></div>
        ${i?`<div><dt>Address</dt><dd>${s(i)}</dd></div>`:""}
        <div><dt>Class / township</dt><dd>${s(n.propertyClass)} / ${s(n.townshipName)}</dd></div>
        <div><dt>Building sqft</dt><dd>${l(n.buildingSqft)}</dd></div>
        <div><dt>Total AV</dt><dd>${o(n.currentAv)}</dd></div>
        <div><dt>Improvement AV</dt><dd>${o(n.currentImprovementAv)}</dd></div>
      </dl>
      ${a.length?`<p class="tagline">${s(a.join("; "))} - user-supplied; documentation required.</p>`:""}
    </section>

    ${L(e)}

    <section class="panel" aria-labelledby="step-five">
      <div class="step-label">Step 5</div>
      <h2 id="step-five">${s(e.venue.name)} checklist</h2>
      <p class="hint">Use this checklist to assemble documents before filing at the official venue.</p>
      <ul>${e.venue.checklist.map(c=>`<li>${s(c)}</li>`).join("")}</ul>
      <a class="button-link" href="/print?${r.toString()}">Print / Save as PDF</a>
    </section>

    ${S(e.warnings)}
  `)}async function v(e){let t=A();try{let n=await g(`/api/case?${e.toString()}`);T(n,e)}catch(n){let i=document.querySelector("#results");i&&(i.innerHTML=`<section class="error" role="alert">${s(n instanceof Error?n.message:"The case could not be loaded.")}</section>`)}finally{t();let n=document.querySelector("#progress");n&&(n.innerHTML="")}}async function q(e){let t=new URLSearchParams,n=p(e,"pin");if(b(t,e),n){t.set("pin",n),await v(t);return}let i=document.querySelector("#results");i&&(i.innerHTML='<section class="error" role="alert">Enter a PIN.</section>')}async function E(){let e=document.querySelector("#demo-list");if(e){e.innerHTML=u("Loading sample properties...");try{let t=await g("/api/demo");e.innerHTML=`<h3>Sample properties</h3>${t.cases.map(n=>`<button class="candidate" type="button" data-demo-pin="${s(n.pin)}">${s(n.label)}: ${s(n.pinFormatted)} ${s(n.address)}</button>`).join("")}`}catch(t){e.innerHTML=`<section class="error" role="alert">${s(t instanceof Error?t.message:"Sample properties could not be loaded.")}</section>`}}}w();document.addEventListener("submit",e=>{let t=e.target;t instanceof HTMLFormElement&&t.id==="case-form"&&(e.preventDefault(),q(t))});document.addEventListener("click",e=>{let t=e.target;if(!(t instanceof HTMLElement))return;t.id==="demo-button"&&E();let n=t.getAttribute("data-demo-pin");if(n){let i=new URLSearchParams({demo:"1",pin:n}),a=document.querySelector("#case-form");a&&b(i,a),v(i)}});document.documentElement.dataset.enhanced="true";
