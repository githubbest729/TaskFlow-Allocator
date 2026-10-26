(()=>{const TF=window.TF,$=s=>document.querySelector(s),E=TF.esc,STG={backlog:0,assigned:15,progress:40,qa:70,sat:90,closed:100};
TF.editClient=id=>{const s=TF.state,ex=id&&s.clients.find(c=>c.id===id),c=ex?{...ex}:{id:'R'+TF.uid(),clientName:'',projectCode:'',scope:'',deliveryDate:TF.ymd(30),signoffs:[],slaStatus:'On Track'},d=$('#dlg');
 d.innerHTML=`<form method="dialog" id="cf"><h3>${ex?'Edit':'Add'} client project</h3><div class="f"><label>Client<input name="n" required value="${E(c.clientName)}"></label><label>Project code<input name="p" required value="${E(c.projectCode)}"></label>
 <label class="w">Scope objective<textarea name="s" rows="2">${E(c.scope)}</textarea></label><label>Target delivery<input type="date" name="d" required value="${c.deliveryDate}"></label></div>
 <div class="tools"><button class="pri" value="ok">Save project</button><button value="x" formnovalidate>Cancel</button>${ex?'<button type="button" id="cdel">Delete project</button>':''}</div></form>`;
 $('#cf').addEventListener('submit',async e=>{if(!e.submitter||e.submitter.value!=='ok')return;const fd=new FormData(e.target);Object.assign(c,{clientName:fd.get('n'),projectCode:fd.get('p'),scope:fd.get('s'),deliveryDate:fd.get('d')});
  const i=s.clients.findIndex(x=>x.id===c.id);i<0?s.clients.push(c):s.clients[i]=c;await TF.mutate('client_requirements',c,i<0?'create':'update');TF.refresh()});
 if(ex)$('#cdel').onclick=async()=>{const n=s.tasks.filter(t=>t.clientId===c.id).length;if(n){TF.toast('Delete or reassign the '+n+' linked task(s) first');return}if(!confirm('Delete '+c.projectCode+'?'))return;await TF.remove('client_requirements',c.id,'delete');s.clients=s.clients.filter(x=>x.id!==c.id);d.close();TF.refresh()};
 d.showModal()};
TF.reqStats=c=>{const ts=TF.state.tasks.filter(t=>t.clientId===c.id&&!t.archived),n=ts.length;
 const pr=n?Math.round(ts.reduce((a,t)=>a+(t.status==='closed'?100:STG[t.status]),0)/n):0,days=Math.round((new Date(c.deliveryDate)-new Date(TF.ymd(0)))/864e5);
 const st=n&&ts.every(t=>t.status==='closed')?'Fulfilled':days<0?'Breached':(ts.some(t=>t.blocker)||(days<=7&&pr<70))?'At Risk':'On Track';return{ts,pr,days,st}};
TF.renderClients=()=>{const s=TF.state;
 $('#view').innerHTML=`<div class="tools"><button class="pri" id="ac">Add client project</button></div><div class="grid">${s.clients.map(c=>{const r=TF.reqStats(c);c.slaStatus=r.st;return`<article class="box"><h3>${E(c.clientName)} <span class="mu">${E(c.projectCode)}</span></h3><p>${E(c.scope)}</p>
 <div class="bar" role="img" aria-label="${r.pr}% complete"><i style="width:${r.pr}%"></i></div><p><b>${r.pr}%</b> complete. Target ${TF.fmt(c.deliveryDate)} (${r.days<0?-r.days+'d past':r.days+'d left'}) <span class="pill s-${r.st.slice(0,2)}">${r.st}</span></p>
 <ul class="l">${r.ts.map(t=>`<li><a href="#" data-t="${t.id}">${t.id}</a> ${E(t.title)} <span class="mu">${E(TF.member(t.assigneeId).name)}, ${t.status}</span></li>`).join('')||'<li class="mu">No tasks linked. Assign a task to this requirement.</li>'}</ul>
 <h4>Acceptance sign-off log</h4><ul class="l">${c.signoffs.map(x=>`<li>${TF.fmt(x.date)}, ${E(x.by)}: ${E(x.note)}</li>`).join('')||'<li class="mu">No sign-offs yet.</li>'}</ul><div class="tools"><button data-so="${c.id}">Log client sign-off</button><button data-ec="${c.id}">Edit project</button></div></article>`}).join('')}</div>`;
 $('#ac').onclick=()=>TF.editClient();document.querySelectorAll('[data-ec]').forEach(b=>b.onclick=()=>TF.editClient(b.dataset.ec));
 document.querySelectorAll('[data-t]').forEach(a=>a.onclick=e=>{e.preventDefault();TF.openTask(a.dataset.t)});
 document.querySelectorAll('[data-so]').forEach(b=>b.onclick=async()=>{const by=prompt('Client representative name');if(!by)return;const c=s.clients.find(x=>x.id===b.dataset.so);c.signoffs.push({by,date:TF.ymd(0),note:prompt('Deliverable accepted')||'Accepted'});await TF.mutate('client_requirements',c,'signoff');TF.refresh()})};
})();