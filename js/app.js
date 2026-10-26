(()=>{const TF=window.TF,$=s=>document.querySelector(s),E=TF.esc;
TF.state={team:[],clients:[],tasks:[],events:[],sat:false,theme:'dark',archiveDays:180};let view='kanban';
TF.savePrefs=()=>TF.db.put('settings_meta',{id:'prefs',sat:TF.state.sat,theme:TF.state.theme,archiveDays:TF.state.archiveDays,schema:1});
const load=async()=>{const s=TF.state;for(const[k,st]of[['team','team_members'],['clients','client_requirements'],['tasks','tasks'],['events','schedule_events']])s[k]=await TF.db.all(st)};
const kpis=()=>{const s=TF.state,act=s.tasks.filter(t=>t.status!=='closed'&&!t.archived),cl=s.tasks.filter(t=>t.status==='closed'&&t.closedAt),today=TF.ymd(0);
 const ut=s.team.length?Math.round(s.team.reduce((a,m)=>a+TF.util(m).pct,0)/s.team.length):0,ot=cl.length?Math.round(cl.filter(t=>t.closedAt.slice(0,10)<=t.dueDate).length/cl.length*100):100;
 s.clients.forEach(c=>c.slaStatus=TF.reqStats(c).st);const met=s.clients.length?Math.round(s.clients.filter(c=>c.slaStatus==='Fulfilled').length/s.clients.length*100):0,bl=act.filter(t=>t.blocker).length;
 const urgent=act.filter(t=>t.priority==='Critical'||t.dueDate<today).length+TF.conflicts().length;TF.badge(urgent);
 const k=(v,l,c,t)=>`<div class="kpi ${c||''}" title="${t||''}"><b>${v}</b><span>${l}</span></div>`;
 $('#kpis').innerHTML=k(act.length,'Active tasks','','Tasks not yet closed or archived')+k(ut+'%','Team utilisation',ut>100?'bad':ut>80?'warn':'','Average of open hours divided by weekly hours across engineers')+k(ot+'%','On-time adherence',ot<80?'warn':'','Share of closed tasks finished on or before their due date')+k(met+'%','Client requirements met','','Client projects where every linked task is closed')+k(bl,'Active blockers',bl?'bad':'','Open tasks flagged as blocked')};
TF.refresh=()=>{kpis();document.querySelectorAll('#tabs button').forEach(b=>b.setAttribute('aria-selected',b.dataset.v===view));
 ({kanban:TF.renderKanban,team:TF.renderTeam,schedule:TF.renderSchedule,clients:TF.renderClients})[view]()};
const go=v=>{view=v;TF.valueEvent();TF.refresh()};
TF.help=()=>{const d=$('#dlg');d.innerHTML=`<div class="help"><h3>How TaskFlow works</h3>
<h4>Where to start</h4><ol><li><button type="button" data-go="clients">Client needs</button> Add the client project the work belongs to.</li><li><button type="button" data-go="team">Team load</button> Check your engineers, skills and weekly hours.</li><li><button type="button" id="hn">Assign task</button> Create a task. Use Suggest best fit to pick an engineer.</li><li><button type="button" data-go="kanban">Kanban</button> Move the card right as the work progresses.</li><li><button type="button" data-go="schedule">Schedule</button> Check dates, clashes and site visits.</li></ol>
<h4>Kanban stages</h4><ul class="l">${TF.COLS.map(c=>`<li><b>${E(c[1])}</b>: ${E(c[3])}${c[2]?' Limit '+c[2]+' cards.':''}</li>`).join('')}</ul>
<h4>Colours and labels</h4><ul class="l"><li>Card edge: red is Critical, amber is High, blue is Standard, grey is Low.</li><li>Blocked: the task cannot move until the blocker is cleared.</li><li>Client req met: the client requirement behind the task is fulfilled.</li><li>A column outlined in red holds more cards than its work-in-progress limit.</li><li>Utilisation: open hours divided by weekly hours. Over 100% means more work than the week allows.</li><li>Schedule: the amber line is today, the green line is a client delivery date, a dashed outline is a clash between two high-priority tasks.</li><li>Client status: Fulfilled when every linked task is closed. Breached when the delivery date has passed. At Risk when a task is blocked, or delivery is within 7 days and the work is under 70% done.</li></ul>
<h4>Shortcuts</h4><p>N new task. 1 to 4 switch tabs. / search. ? this help.</p><p class="mu">Your data is stored on this device only. Use Menu, Storage and backup to export it.</p>
<form method="dialog"><button class="pri">Got it</button></form></div>`;
 d.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>{d.close();go(b.dataset.go)});$('#hn').onclick=()=>{d.close();TF.openTask()};d.showModal()};
TF.deepLink=id=>{if(id&&TF.state.tasks.some(t=>t.id===id))TF.openTask(id);else if(id)TF.openTask(null,{title:id.replace(/^web\+taskflow:/,'')})};
TF.drawer=async()=>{const d=$('#drawer'),t=await TF.telemetry(),u=t.e.usage||0,q=t.e.quota||0,n=Object.values(t.counts).reduce((a,b)=>a+b,0),proj=Math.max(u/1048576,n*0.002)+60*365*3*0.0015,pct=q?Math.min(100,proj/(q/1048576)*100):0;
 d.hidden=false;d.innerHTML=`<h3>Storage</h3><button id="dx">Close</button><p>Persistent storage: <b>${t.persisted?'Granted':'Best-Effort'}</b></p><p>Used ${(u/1048576).toFixed(2)} MB of ${(q/1073741824).toFixed(1)} GB quota</p>
 <p>3-year runway: projected ${proj.toFixed(0)} MB at 60 records a day, ${pct.toFixed(2)}% of quota</p><div class="bar"><i style="width:${Math.max(pct,1)}%"></i></div>
 <ul class="l">${Object.entries(t.counts).map(([k,v])=>`<li>${k}: ${v}</li>`).join('')}</ul><h4>Archive and search</h4>
 <div class="tools"><select id="ad">${[90,180,365].map(x=>`<option ${x===TF.state.archiveDays?'selected':''}>${x}</option>`).join('')}</select><button id="ab">Archive closed tasks older than days</button></div><div class="tools"><input id="as" type="search" placeholder="Search archive"><button id="asb">Search</button></div><ul class="l" id="ar"></ul>
 <h4>Backup</h4><div class="tools"><button id="bj">Export JSON</button><button id="bc">Export tasks CSV</button><button id="be">Export schedule CSV</button></div><div class="tools"><label>Import JSON <input type="file" id="bi" accept=".json,.taskflow"></label></div><div class="tools"><button id="bf">${TF.hasHandle()?'Save to bound file':'Bind local backup file'}</button></div>`;
 $('#dx').onclick=()=>d.hidden=true;
 $('#ab').onclick=async()=>{TF.state.archiveDays=+$('#ad').value;await TF.savePrefs();const n=await TF.archive(TF.state.archiveDays);await load();TF.refresh();TF.toast(n+' tasks archived');TF.drawer()};
 $('#asb').onclick=async()=>{const r=await TF.searchArchive($('#as').value);$('#ar').innerHTML=r.map(x=>`<li>${E(x.id)} ${E(x.title)}</li>`).join('')||'<li class="mu">No archived match.</li>'};
 $('#bj').onclick=async()=>TF.download('agac-'+TF.ymd(0)+'.taskflow.json',JSON.stringify(await TF.dump()));
 $('#bc').onclick=()=>TF.download('tasks.csv',TF.csv([['ID','Title','Client','Project','Engineer','Discipline','Priority','Status','Est h','Act h','Start','Due','Blocked']].concat(TF.state.tasks.map(x=>[x.id,x.title,TF.client(x.clientId).clientName,TF.client(x.clientId).projectCode,TF.member(x.assigneeId).name,x.discipline,x.priority,x.status,x.estH,x.actH,x.startDate,x.dueDate,x.blocker]))),'text/csv');
 $('#be').onclick=()=>TF.download('schedule.csv',TF.csv([['Date','Engineer','Location','Note']].concat(TF.state.events.map(x=>[x.date,TF.member(x.engineerId).name,x.siteLocation,x.note]))),'text/csv');
 $('#bi').onchange=async e=>{await TF.importFile(e.target.files[0])};
 $('#bf').onclick=async()=>{try{TF.hasHandle()?await TF.writeFile():await TF.bindFile();TF.toast('Backup saved');TF.drawer()}catch(x){TF.toast(x.message)}}};
TF.importFile=async f=>{try{const o=JSON.parse(await f.text());if(o.app!=='taskflow-allocator')throw 0;await TF.restore(o);await load();TF.refresh();TF.toast('Import complete')}catch(_){TF.toast('That file is not a TaskFlow backup')}};
const boot=async()=>{await TF.db.open();if(!(await TF.db.count('tasks'))&&!(await TF.db.count('archived_records'))){const d=TF.seed();for(const[k,s]of[['team','team_members'],['clients','client_requirements'],['tasks','tasks'],['events','schedule_events']])await TF.db.putMany(s,d[k])}
 await load();const p=await TF.db.get('settings_meta','prefs').catch(()=>null);if(p)Object.assign(TF.state,{sat:p.sat,theme:p.theme,archiveDays:p.archiveDays});document.documentElement.dataset.theme=TF.state.theme;
 await TF.loadHandle();TF.persist();TF.registerSW();
 document.querySelectorAll('#tabs button').forEach(b=>b.onclick=()=>go(b.dataset.v));$('#bNew').onclick=()=>TF.openTask();$('#bStore').onclick=TF.drawer;$('#mn .menu').addEventListener('click',()=>{$('#mn').open=false});$('#bHelp').onclick=TF.help;
 try{if(!localStorage.getItem('tf-welcome'))$('#welcome').hidden=false}catch(_){$('#welcome').hidden=false}
 $('#wTour').onclick=TF.help;$('#wNo').onclick=()=>{$('#welcome').hidden=true;try{localStorage.setItem('tf-welcome','1')}catch(_){}};
 $('#bTheme').onclick=async()=>{TF.state.theme=TF.state.theme==='dark'?'light':'dark';document.documentElement.dataset.theme=TF.state.theme;await TF.savePrefs()};
 addEventListener('keydown',e=>{if(e.ctrlKey||e.metaKey||e.altKey||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)||$('#dlg').open)return;
  if(e.key==='n'||e.key==='N'){e.preventDefault();TF.openTask()}else if('1234'.includes(e.key)&&e.key){go(['kanban','team','schedule','clients'][+e.key-1])}else if(e.key==='/'){e.preventDefault();go('kanban');$('#fq').focus()}else if(e.key==='?'){e.preventDefault();TF.help()}});
 const q=new URLSearchParams(location.search);if(q.get('view'))view=q.get('view');TF.refresh();
 if(q.get('action')==='new')TF.openTask();
 if(q.get('title')||q.get('text')||q.get('url'))TF.openTask(null,{title:q.get('title')||(q.get('text')||'').slice(0,80),notes:[q.get('text'),q.get('url')].filter(Boolean).join('\n')});
 if(q.get('task'))TF.deepLink(decodeURIComponent(q.get('task')));
 if('launchQueue' in window)launchQueue.setConsumer(async l=>{if(l.files&&l.files[0])TF.importFile(await l.files[0].getFile())});
 setInterval(()=>{if(!document.hidden)kpis()},6e4)};
boot();})();