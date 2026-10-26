(()=>{const TF=window.TF,$=s=>document.querySelector(s),E=TF.esc,STG={backlog:0,assigned:15,progress:40,qa:70,sat:90,closed:100};
TF.reqStats=c=>{const ts=TF.state.tasks.filter(t=>t.clientId===c.id&&!t.archived),n=ts.length;
 const pr=n?Math.round(ts.reduce((a,t)=>a+(t.status==='closed'?100:STG[t.status]),0)/n):0,days=Math.round((new Date(c.deliveryDate)-new Date(TF.ymd(0)))/864e5);
 const st=n&&ts.every(t=>t.status==='closed')?'Fulfilled':days<0?'Breached':(ts.some(t=>t.blocker)||(days<=7&&pr<70))?'At Risk':'On Track';return{ts,pr,days,st}};
TF.renderClients=()=>{const s=TF.state;
 $('#view').innerHTML=`<div class="grid">${s.clients.map(c=>{const r=TF.reqStats(c);c.slaStatus=r.st;return`<article class="box"><h3>${E(c.clientName)} <span class="mu">${E(c.projectCode)}</span></h3><p>${E(c.scope)}</p>
 <div class="bar" role="img" aria-label="${r.pr}% complete"><i style="width:${r.pr}%"></i></div><p><b>${r.pr}%</b> complete. Target ${TF.fmt(c.deliveryDate)} (${r.days<0?-r.days+'d past':r.days+'d left'}) <span class="pill s-${r.st.slice(0,2)}">${r.st}</span></p>
 <ul class="l">${r.ts.map(t=>`<li><a href="#" data-t="${t.id}">${t.id}</a> ${E(t.title)} <span class="mu">${E(TF.member(t.assigneeId).name)}, ${t.status}</span></li>`).join('')||'<li class="mu">No tasks linked. Assign a task to this requirement.</li>'}</ul>
 <h4>Acceptance sign-off log</h4><ul class="l">${c.signoffs.map(x=>`<li>${TF.fmt(x.date)}, ${E(x.by)}: ${E(x.note)}</li>`).join('')||'<li class="mu">No sign-offs yet.</li>'}</ul><button data-so="${c.id}">Log client sign-off</button></article>`}).join('')}</div>`;
 document.querySelectorAll('[data-t]').forEach(a=>a.onclick=e=>{e.preventDefault();TF.openTask(a.dataset.t)});
 document.querySelectorAll('[data-so]').forEach(b=>b.onclick=async()=>{const by=prompt('Client representative name');if(!by)return;const c=s.clients.find(x=>x.id===b.dataset.so);c.signoffs.push({by,date:TF.ymd(0),note:prompt('Deliverable accepted')||'Accepted'});await TF.mutate('client_requirements',c,'signoff');TF.refresh()})};
})();