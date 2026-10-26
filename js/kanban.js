(()=>{const TF=window.TF,$=s=>document.querySelector(s),E=TF.esc;
const F=TF.filters={q:'',who:'',disc:'',cli:'',pri:'',blk:false,from:'',to:''};
TF.client=id=>TF.state.clients.find(c=>c.id===id)||{clientName:'?',projectCode:'?'};
TF.member=id=>TF.state.team.find(m=>m.id===id)||{name:'Unassigned',skills:[]};
TF.countdown=t=>{if(t.status==='closed')return['Closed',''];const n=Math.round((new Date(t.dueDate)-new Date(TF.ymd(0)))/864e5);return n<0?['Overdue '+(-n)+'d','late']:n===0?['Due today','late']:[n+'d left','']};
TF.match=t=>{const c=TF.client(t.clientId),m=TF.member(t.assigneeId);
 if(F.q&&!(t.id+t.title+c.clientName+c.projectCode+m.name+t.discipline).toLowerCase().includes(F.q.toLowerCase()))return false;
 return(!F.who||t.assigneeId===F.who)&&(!F.disc||t.discipline===F.disc)&&(!F.cli||t.clientId===F.cli)&&(!F.pri||t.priority===F.pri)&&(!F.blk||t.blocker)&&(!F.from||t.dueDate>=F.from)&&(!F.to||t.dueDate<=F.to)};
TF.move=async(id,st)=>{const t=TF.state.tasks.find(x=>x.id===id);if(!t||t.status===st)return;t.status=st;t.updatedAt=new Date().toISOString();t.closedAt=st==='closed'?new Date().toISOString():null;if(st==='closed')t.reqMet=true;
 await TF.mutate('tasks',t,'move:'+st,t.id);TF.valueEvent();TF.refresh()};
TF.saveTask=async t=>{t.updatedAt=new Date().toISOString();if(t.status==='closed'&&!t.closedAt)t.closedAt=t.updatedAt;
 const i=TF.state.tasks.findIndex(x=>x.id===t.id);i<0?TF.state.tasks.push(t):TF.state.tasks[i]=t;await TF.mutate('tasks',t,i<0?'create':'update',t.id);TF.refresh()};
TF.deleteTask=async id=>{const t=TF.state.tasks.find(x=>x.id===id);if(!t||!confirm('Delete '+t.id+' "'+t.title+'"? This cannot be undone.'))return false;await TF.remove('tasks',id,'delete');TF.state.tasks=TF.state.tasks.filter(x=>x.id!==id);TF.refresh();TF.toast('Deleted '+id);return true};
TF.archiveTask=async id=>{const t=TF.state.tasks.find(x=>x.id===id);if(!t)return;await TF.archiveOne(t);TF.state.tasks=TF.state.tasks.filter(x=>x.id!==id);TF.refresh();TF.toast(id+' archived. Find it under Menu, Storage and backup, Search archive.')};
TF.suggest=t=>{const hi=t.priority==='Critical'||t.priority==='High';
 const rows=TF.state.team.filter(m=>m.availability!=='away').map(m=>{const mine=TF.state.tasks.filter(x=>x.assigneeId===m.id&&x.id!==t.id&&x.status!=='closed'&&!x.archived),cap=m.hours+(TF.state.sat?8:0),a=mine.reduce((z,x)=>z+Math.max(x.estH-x.actH,0),0),cur=Math.round(a/cap*100),proj=Math.round((a+Math.max(t.estH-t.actH,0))/cap*100),
  cf=hi?mine.filter(x=>(x.priority==='Critical'||x.priority==='High')&&x.startDate<=t.dueDate&&t.startDate<=x.dueDate).length:0,sk=m.skills.includes(t.discipline)?0:1;
  return{m,cur,proj,cf,sk,score:sk*1000+cf*300+Math.max(proj-100,0)*5+proj}}).sort((a,b)=>a.score-b.score);
 const r=rows[0];r.why=(r.sk?'no skill match':'skill match')+', load '+r.cur+'% to '+r.proj+'%'+(r.cf?', '+r.cf+' overlapping high-priority task(s)':', no schedule clash');return r};
const board=()=>{const s=TF.state,el=$('#board');if(!el)return;const act=!!(F.q||F.who||F.disc||F.cli||F.pri||F.blk||F.from||F.to);const list=s.tasks.filter(t=>!t.archived&&TF.match(t));
 el.innerHTML=TF.COLS.map(([k,n,lim,ds],ci)=>{const ts=list.filter(t=>t.status===k),warn=lim&&ts.length>lim;
 return`<section class="col${warn?' wip':''}" data-s="${k}" aria-label="${E(n)}"><h3><span>${E(n)}<small class="mu" style="display:block;font-weight:400">${E(ds)}</small></span><span title="Cards in this stage${lim?' of '+lim+' allowed':''}">${ts.length}${lim?'/'+lim:''}${warn?' over WIP limit':''}<button data-add="${k}" aria-label="Add task to ${E(n)}">+</button></span></h3><div class="cards">`+ts.map(t=>{const c=TF.client(t.clientId),m=TF.member(t.assigneeId),[cd,cc]=TF.countdown(t);
 return`<article class="card ${t.priority}" draggable="true" data-id="${t.id}"><span class="id">${t.id} | ${E(c.projectCode)}</span><h4 tabindex="0" role="button" data-open="${t.id}">${E(t.title)}</h4>
 <div class="row"><span class="tag">${E(t.discipline)}</span><span class="tag">${t.priority}</span>${t.blocker?'<span class="blk" title="This task cannot move forward until the blocker is cleared">Blocked</span>':''}</div>
 <div class="row"><span>${E(m.name)}, ${E((TF.TEAMS[m.teamDepartment]||'').split(' (')[0])}</span></div>
 <div class="row"><span>${t.actH}/${t.estH} h</span><span class="${cc}">${cd}</span><span class="${t.reqMet?'okc':''}">Client req: ${t.reqMet?'met':'open'}</span></div>
 <div class="mv"><button data-mv="${t.id}" data-d="-1" ${ci===0?'disabled':''} aria-label="Move back">&lt;</button><span>${t.status==='closed'?`<button data-arc="${t.id}">Archive</button> `:''}<button data-del="${t.id}">Delete</button></span><button data-mv="${t.id}" data-d="1" ${ci===5?'disabled':''} aria-label="Move forward">&gt;</button></div></article>`}).join('')+(ts.length?'':`<p class="mu" style="margin:6px">${act?'No tasks match the filters.':'No tasks here. Press + to add one.'}</p>`)+`</div></section>`}).join('');const fs=$('#fs');if(fs){fs.innerHTML=act?`<span class="pill s-At">Filters active: showing ${list.length} of ${s.tasks.filter(t=>!t.archived).length} <button id="fclr">Clear filters</button></span>`:'';const c=$('#fclr');if(c)c.onclick=()=>{Object.assign(F,{q:'',who:'',disc:'',cli:'',pri:'',blk:false,from:'',to:''});TF.renderKanban()}}};
TF.renderKanban=()=>{const s=TF.state,o=(a,v,all)=>`<option value="">${all}</option>`+a.map(([x,l])=>`<option value="${E(x)}"${x===v?' selected':''}>${E(l)}</option>`).join('');
 $('#view').innerHTML=`<div class="tools"><input id="fq" type="search" placeholder="Search tasks ( / )" value="${E(F.q)}" aria-label="Search tasks">
 <select id="fwho" aria-label="Engineer">${o(s.team.map(m=>[m.id,m.name]),F.who,'All engineers')}</select><select id="fdisc" aria-label="Discipline">${o(TF.DISC.map(d=>[d,d]),F.disc,'All disciplines')}</select>
 <select id="fcli" aria-label="Client">${o(s.clients.map(c=>[c.id,c.clientName+' '+c.projectCode]),F.cli,'All clients')}</select><select id="fpri" aria-label="Priority">${o(TF.PRI.map(d=>[d,d]),F.pri,'All priorities')}</select>
 <label><input id="fblk" type="checkbox" ${F.blk?'checked':''}> Blocked only</label><label>Due from <input id="ffrom" data-date type="text" inputmode="numeric" placeholder="dd/mm/yyyy" maxlength="10" size="10" value="${TF.fmt(F.from)}"></label><label>to <input id="fto" data-date type="text" inputmode="numeric" placeholder="dd/mm/yyyy" maxlength="10" size="10" value="${TF.fmt(F.to)}"></label><span id="fs"></span></div><div id="board" class="board"></div>`;
 const bind=(id,k,ev)=>$(id).addEventListener(ev||'input',e=>{F[k]=e.target.type==='checkbox'?e.target.checked:(k==='from'||k==='to'?TF.parseDate(e.target.value):e.target.value);board()});
 bind('#fq','q');bind('#fwho','who','change');bind('#fdisc','disc','change');bind('#fcli','cli','change');bind('#fpri','pri','change');bind('#fblk','blk','change');bind('#ffrom','from','change');bind('#fto','to','change');
 TF.bindDates($('#view'));const b=$('#board');board();
 b.addEventListener('dragstart',e=>{const c=e.target.closest('.card');if(c)e.dataTransfer.setData('text/plain',c.dataset.id)});
 b.addEventListener('dragover',e=>{const c=e.target.closest('.col');if(c){e.preventDefault();c.classList.add('over')}});
 b.addEventListener('dragleave',e=>{const c=e.target.closest('.col');if(c)c.classList.remove('over')});
 b.addEventListener('drop',e=>{const c=e.target.closest('.col');if(c){e.preventDefault();TF.move(e.dataTransfer.getData('text/plain'),c.dataset.s)}});
 b.addEventListener('click',e=>{const m=e.target.closest('[data-mv]');if(m){const t=s.tasks.find(x=>x.id===m.dataset.mv),i=TF.COLS.findIndex(c=>c[0]===t.status)+ +m.dataset.d;TF.move(t.id,TF.COLS[i][0]);return}
  const dl=e.target.closest('[data-del]');if(dl){TF.deleteTask(dl.dataset.del);return}const ar=e.target.closest('[data-arc]');if(ar){TF.archiveTask(ar.dataset.arc);return}const ad=e.target.closest('[data-add]');if(ad){TF.openTask(null,{status:ad.dataset.add});return}
  const o=e.target.closest('.card');if(o)TF.openTask(o.dataset.id)});
 b.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.dataset.open)TF.openTask(e.target.dataset.open)})};
TF.openTask=(id,pre)=>{if(!TF.state.clients.length){TF.toast('Add a client project first');TF.editClient();return}TF.valueEvent();const s=TF.state,ex=id&&s.tasks.find(x=>x.id===id);const n=s.tasks.reduce((a,t)=>Math.max(a,+t.id.split('-')[2]||0),1040)+1;
 const t=ex?JSON.parse(JSON.stringify(ex)):{id:'AGAC-TSK-'+n,title:'',clientId:s.clients[0].id,assigneeId:'',discipline:TF.DISC[0],priority:'Standard',status:'backlog',estH:8,actH:0,startDate:TF.ymd(0),dueDate:TF.ymd(7),blocker:false,reqMet:false,subtasks:[],notes:'',archived:false,...(pre||{})};
 const d=$('#dlg'),sel=(a,v)=>a.map(([x,l])=>`<option value="${E(x)}"${x===v?' selected':''}>${E(l)}</option>`).join('');
 const draw=()=>{d.innerHTML=`<form method="dialog" id="tf"><h3>${ex?E(t.id):'Assign new task '+E(t.id)}</h3><div class="f">
 <label class="w">Title<input name="title" required value="${E(t.title)}"></label>
 <label>Client requirement<select name="clientId">${sel(s.clients.map(c=>[c.id,c.clientName+' '+c.projectCode]),t.clientId)}</select></label>
 <label>Discipline<select name="discipline">${sel(TF.DISC.map(x=>[x,x]),t.discipline)}</select></label>
 <label>Engineer<select name="assigneeId"><option value="">Unassigned</option>${sel(s.team.map(m=>[m.id,m.name+' ('+TF.util(m).pct+'%)']),t.assigneeId)}</select></label>
 <label>Smart allocator<button type="button" id="sg" title="Picks the engineer with matching skills, the lightest load and no schedule clash">Suggest best fit</button></label>
 <label>Priority<select name="priority">${sel(TF.PRI.map(x=>[x,x]),t.priority)}</select></label><label>Status<select name="status">${sel(TF.COLS.map(c=>[c[0],c[1]]),t.status)}</select></label>
 <label>Estimated hours<input type="number" min="0" name="estH" value="${t.estH}"></label><label>Actual hours<input type="number" min="0" name="actH" value="${t.actH}"></label>
 <label>Start${TF.dateField('startDate',t.startDate,'required')}</label><label>Due${TF.dateField('dueDate',t.dueDate,'required')}</label>
 <label><span><input type="checkbox" name="blocker" ${t.blocker?'checked':''}> Blocked</span></label><label><span><input type="checkbox" name="reqMet" ${t.reqMet?'checked':''}> Client requirement fulfilled</span></label>
 <label class="w">Notes<textarea name="notes" rows="2">${E(t.notes)}</textarea></label></div>
 <h4>Sub-tasks</h4><ul class="l">${t.subtasks.map((x,i)=>`<li><label><input type="checkbox" data-st="${i}" ${x.done?'checked':''}> ${E(x.t)}</label></li>`).join('')}</ul>
 <div class="tools"><input id="nst" placeholder="Add sub-task" aria-label="New sub-task"><button type="button" id="ast">Add</button></div>
 <div class="tools"><button class="pri" value="ok">Save task</button><button value="x" formnovalidate>Cancel</button>${ex?'<button type="button" id="del">Delete</button>':''}</div></form>`;
 const f=$('#tf');TF.bindDates(f);const sync=()=>{const fd=new FormData(f);for(const k of['title','clientId','discipline','assigneeId','priority','status','notes'])t[k]=fd.get(k);t.startDate=TF.parseDate(fd.get('startDate'))||t.startDate;t.dueDate=TF.parseDate(fd.get('dueDate'))||t.dueDate;t.estH=+fd.get('estH')||0;t.actH=+fd.get('actH')||0;t.blocker=fd.get('blocker')==='on';t.reqMet=fd.get('reqMet')==='on'};
 f.querySelectorAll('[data-st]').forEach(c=>c.addEventListener('change',()=>t.subtasks[c.dataset.st].done=c.checked));
 $('#sg').onclick=()=>{sync();const r=TF.suggest(t);t.assigneeId=r.m.id;draw();TF.toast('Suggested '+r.m.name+': '+r.why)};
 $('#ast').onclick=()=>{const v=$('#nst').value.trim();if(!v)return;sync();t.subtasks.push({t:v,done:false});draw()};
 if(ex)$('#del').onclick=async()=>{if(await TF.deleteTask(t.id))d.close()};
 f.addEventListener('submit',async e=>{if(e.submitter&&e.submitter.value==='ok'){sync();await TF.saveTask(t)}})};
 draw();d.showModal()};
})();