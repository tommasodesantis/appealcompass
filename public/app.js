var v=document.querySelector("#app");if(!v)throw new Error("Missing app root.");var f=v,h=new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0});function s(e){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function o(e){return e===null?"Not available":h.format(e)}function c(e,t=0){return e===null?"Not available":e.toLocaleString("en-US",{maximumFractionDigits:t})}async function b(e){let t=await fetch(e,{headers:{accept:"application/json"}}),n=await t.json();if(!t.ok||typeof n=="object"&&n&&"ok"in n&&n.ok===!1){let r=n.error?.message??"The request failed.";throw new Error(r)}return n}function u(e,t){let n=new FormData(e).get(t);return typeof n=="string"?n.trim():""}function m(e,t){let n=["venue","borDecisionDate","purchasePrice","purchaseDate","appraisalValue","appraisalDate","actualSqft","actualAv","actualImprovementAv","ownershipType"];for(let a of n){let i=u(t,a);i&&e.set(a,i)}for(let a of["ownerOccupied","age65Plus","seniorFreezeIncome","veteranDisabled","personDisabled","vacancyClaim","demolitionClaim","assessorAppealFiled"])t.elements.namedItem(a)?.checked&&e.set(a,"1");let r=u(t,"conditionIssue").split(`
`).map(a=>a.trim()).filter(Boolean);for(let a of r)e.append("conditionIssue",a)}function p(e){return`<section class="progress" aria-live="polite"><p>${s(e)}</p></section>`}function y(){let e=["Looking up your property...","Fetching assessment history...","Finding similar homes...","Building the evidence summary..."],t=0,n=e[0]??"",r=document.querySelector("#progress");r&&(r.innerHTML=p(e[t]??n));let a=window.setInterval(()=>{t=(t+1)%e.length;let i=document.querySelector("#progress");i&&(i.innerHTML=p(e[t]??n))},650);return()=>window.clearInterval(a)}function $(){f.innerHTML=`
    <header class="topline">
      <p class="eyebrow">Cook County residential appeals</p>
      <h1>Check whether your property-tax assessment is worth appealing.</h1>
      <p class="lede">Enter a PIN or search an address. A PIN is the 14-digit parcel number on your assessment notice, tax bill, or property record card.</p>
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
          <label>
            <span>Address search</span>
            <input name="address" autocomplete="street-address" placeholder="1000 N Mozart">
          </label>
        </div>

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
      <div id="address-results" class="address-results" aria-live="polite"></div>
    </section>

    <div id="progress"></div>
    <div id="results"></div>
  `}function A(e){return e.length===0?"":`<section class="warnings" aria-label="Warnings"><h2>Warnings</h2><ul>${e.map(t=>`<li>${s(t)}</li>`).join("")}</ul></section>`}function w(e){let t=e.routing,n=t.officialUrl?`<a href="${s(t.officialUrl)}" target="_blank" rel="noreferrer">Verify at the official source before filing</a>`:"";if(!t.deadline)return`<p>No computed deadline. ${n}</p>`;let r=t.daysRemaining===null?"":` ${t.daysRemaining>=0?`${t.daysRemaining} days remaining.`:`${Math.abs(t.daysRemaining)} days past the computed deadline.`}`;return`<p><strong>Deadline:</strong> ${s(t.deadline)}.${s(r)} ${n}</p>`}function S(e){let t=e.evidence.comparableAnalysis,n=t.exhibit.map(a=>{let i=t.profileLabel.includes("Assessor")||e.routing.venue==="closed"?a.comparable.av:a.comparable.improvementAv;return`<tr>
        <td>${s(a.comparable.pinFormatted)}</td>
        <td>${s(a.comparable.address)}</td>
        <td>${c(a.comparable.buildingSqft)}</td>
        <td>${s(a.comparable.yearBuilt??"Not available")}</td>
        <td>${o(i)}</td>
        <td>${o(a.avPerSqft)}</td>
      </tr>`}).join(""),r=n.length===0?"<p>No lower-assessed comparable exhibit is available from the current public data.</p>":`<div class="table-wrap"><table>
          <thead><tr><th>PIN</th><th>Address</th><th>Sqft</th><th>Year</th><th>Metric</th><th>Metric/sqft</th></tr></thead>
          <tbody>${n}</tbody>
        </table></div>`;return`<section class="panel" aria-labelledby="step-four">
    <div class="step-label">Step 4</div>
    <h2 id="step-four">Evidence summary</h2>
    <p><strong>Tier:</strong> ${s(e.evidence.tier)}. ${s(e.evidence.tierMessage)}</p>
    <p class="hint">The tier is a rough screen of how much public data supports spending time on an appeal.</p>
    <p><strong>Comparable profile:</strong> ${s(t.profileLabel)} using ${s(t.metricLabel)}.</p>
    <p class="hint">Comparable analysis matters because uniformity appeals compare your assessment to similar homes.</p>
    <p>${s(t.note)}</p>
    <p><strong>Pool:</strong> ${c(t.poolSize)} similar homes, ${s(t.scope??"no scope")}; subject ${s(t.metricLabel)}/sqft ${o(t.subjectAvPerSqft)}; median ${o(t.medianAvPerSqft)}; gap ${c(t.gapPct,1)}%.</p>
    ${r}
    <h3>Arguments</h3>
    ${e.evidence.arguments.length?`<ul>${e.evidence.arguments.map(a=>`<li><strong>${s(a.argumentType)}:</strong> ${s(a.text)}</li>`).join("")}</ul>`:"<p>No strong public-data argument was found. Add sale, appraisal, condition, or factual-error evidence if available.</p>"}
    <h3>Rough savings estimate</h3>
    <p>${o(e.evidence.savingsAssumptions.low)} to ${o(e.evidence.savingsAssumptions.high)}, with point estimate ${o(e.evidence.savingsAssumptions.point)}.</p>
    <p class="hint">Assumes equalizer ${e.evidence.savingsAssumptions.stateEqualizer} and tax rate ${(e.evidence.savingsAssumptions.taxRate*100).toFixed(2)}%; this is a rough range, not a promise.</p>
  </section>`}function L(e,t){let n=e.case.parcel,r=[e.case.userEvidence.actualSqft?`Actual sqft ${c(e.case.userEvidence.actualSqft)}`:"",e.case.userEvidence.actualAv?`Actual AV ${o(e.case.userEvidence.actualAv)}`:"",e.case.userEvidence.actualImprovementAv?`Actual improvement AV ${o(e.case.userEvidence.actualImprovementAv)}`:""].filter(Boolean),a=new URLSearchParams(t);a.set("pin",n.pin),e.demo&&a.set("demo","1");let i=document.querySelector("#results");i&&(i.innerHTML=`
    <section class="notice"><strong>${s(e.evidence.disclaimers[0])}</strong></section>
    <section class="panel" aria-labelledby="step-three">
      <div class="step-label">Step 3</div>
      <h2 id="step-three">Routing decision</h2>
      <p class="headline">${s(e.routing.headline)}</p>
      ${w(e)}
      <ul>${e.routing.reasoning.map(l=>`<li>${s(l)}</li>`).join("")}</ul>
    </section>

    <section class="subject panel">
      <h2>Subject property</h2>
      <dl>
        <div><dt>PIN</dt><dd>${s(n.pinFormatted)}</dd></div>
        <div><dt>Address</dt><dd>${s([n.address,n.city,n.zipCode].filter(Boolean).join(", ")||"Not available from public data")}</dd></div>
        <div><dt>Class / township</dt><dd>${s(n.propertyClass)} / ${s(n.townshipName)}</dd></div>
        <div><dt>Building sqft</dt><dd>${c(n.buildingSqft)}</dd></div>
        <div><dt>Total AV</dt><dd>${o(n.currentAv)}</dd></div>
        <div><dt>Improvement AV</dt><dd>${o(n.currentImprovementAv)}</dd></div>
      </dl>
      ${r.length?`<p class="tagline">${s(r.join("; "))} - user-supplied; documentation required.</p>`:""}
    </section>

    ${S(e)}

    <section class="panel" aria-labelledby="step-five">
      <div class="step-label">Step 5</div>
      <h2 id="step-five">${s(e.venue.name)} checklist</h2>
      <p class="hint">Use this checklist to assemble documents before filing at the official venue.</p>
      <ul>${e.venue.checklist.map(l=>`<li>${s(l)}</li>`).join("")}</ul>
      <a class="button-link" href="/print?${a.toString()}">Print / Save as PDF</a>
    </section>

    ${A(e.warnings)}
  `)}async function g(e){let t=y();try{let n=await b(`/api/case?${e.toString()}`);L(n,e)}catch(n){let r=document.querySelector("#results");r&&(r.innerHTML=`<section class="error" role="alert">${s(n instanceof Error?n.message:"The case could not be loaded.")}</section>`)}finally{t();let n=document.querySelector("#progress");n&&(n.innerHTML="")}}async function T(e){let t=new URLSearchParams,n=u(e,"pin"),r=u(e,"address");if(m(t,e),n){t.set("pin",n),await g(t);return}if(r){let i=document.querySelector("#address-results");i&&(i.innerHTML=p("Searching addresses..."));try{let l=await b(`/api/address?q=${encodeURIComponent(r)}`);i&&(i.innerHTML=l.candidates.length?`<h3>Choose a property</h3>${l.candidates.map(d=>`<button class="candidate" type="button" data-pin="${s(d.pin)}">${s(d.pinFormatted)} ${s(d.address)} ${s(d.townshipName)}</button>`).join("")}`:"<p>No address matches found. Try the PIN if you have it.</p>")}catch(l){i&&(i.innerHTML=`<section class="error" role="alert">${s(l instanceof Error?l.message:"Address search failed.")}</section>`)}return}let a=document.querySelector("#results");a&&(a.innerHTML='<section class="error" role="alert">Enter a PIN or address.</section>')}async function P(){let e=document.querySelector("#demo-list");if(e){e.innerHTML=p("Loading sample properties...");try{let t=await b("/api/demo");e.innerHTML=`<h3>Sample properties</h3>${t.cases.map(n=>`<button class="candidate" type="button" data-demo-pin="${s(n.pin)}">${s(n.label)}: ${s(n.pinFormatted)} ${s(n.address)}</button>`).join("")}`}catch(t){e.innerHTML=`<section class="error" role="alert">${s(t instanceof Error?t.message:"Sample properties could not be loaded.")}</section>`}}}$();document.addEventListener("submit",e=>{let t=e.target;t instanceof HTMLFormElement&&t.id==="case-form"&&(e.preventDefault(),T(t))});document.addEventListener("click",e=>{let t=e.target;if(!(t instanceof HTMLElement))return;t.id==="demo-button"&&P();let n=t.getAttribute("data-demo-pin");if(n){let a=new URLSearchParams({demo:"1",pin:n}),i=document.querySelector("#case-form");i&&m(a,i),g(a)}let r=t.getAttribute("data-pin");if(r){let a=new URLSearchParams({pin:r}),i=document.querySelector("#case-form");i&&m(a,i),g(a)}});document.documentElement.dataset.enhanced="true";
