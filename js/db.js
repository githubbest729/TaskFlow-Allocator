(()=>{const TF=window.TF=window.TF||{};
const ST={tasks:['status','assigneeId','clientId','dueDate','priority','updatedAt','archived'],team_members:['teamDepartment','role','availability'],client_requirements:['clientName','projectCode','slaStatus','deliveryDate'],schedule_events:['date','engineerId','siteLocation'],audit_history:['timestamp','taskId','actionType'],archived_records:['archivedAt'],sync_queue:[],settings_meta:[]};
TF.STORES=Object.keys(ST);let d;
const p=r=>new Promise((a,b)=>{r.onsuccess=()=>a(r.result);r.onerror=()=>b(r.error)});
const os=(s,m)=>d.transaction(s,m||'readonly').objectStore(s);
TF.db={open:()=>new Promise((a,b)=>{const r=indexedDB.open('TaskFlowAllocatorDB',1);
 r.onupgradeneeded=()=>{for(const[s,ix]of Object.entries(ST)){const o=r.result.createObjectStore(s,{keyPath:'id'});ix.forEach(i=>o.createIndex(i,i))}};
 r.onsuccess=()=>{d=r.result;a()};r.onerror=()=>b(r.error)}),
 all:s=>p(os(s).getAll()),get:(s,k)=>p(os(s).get(k)),put:(s,v)=>p(os(s,'readwrite').put(v)),del:(s,k)=>p(os(s,'readwrite').delete(k)),count:s=>p(os(s).count()),clear:s=>p(os(s,'readwrite').clear()),
 putMany:(s,a)=>new Promise((ok,no)=>{const t=d.transaction(s,'readwrite'),o=t.objectStore(s);a.forEach(v=>o.put(v));t.oncomplete=ok;t.onerror=()=>no(t.error)})};
TF.uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);
TF.mutate=async(store,val,action,taskId)=>{await TF.db.put(store,val);
 await TF.db.put('audit_history',{id:TF.uid(),timestamp:new Date().toISOString(),taskId:taskId||val.id,actionType:action,store});
 await TF.db.put('sync_queue',{id:TF.uid(),store,key:val.id,action,at:Date.now()});
 try{const r=await navigator.serviceWorker.ready;if(r.sync)await r.sync.register('tf-sync')}catch(_){}
 TF.autoBackup()};
const gz=async s=>{if(!window.CompressionStream)return s;const b=new Blob([s]).stream().pipeThrough(new CompressionStream('gzip'));return new Response(b).blob()};
const ungz=async v=>{if(typeof v==='string')return v;return new Response(v.stream().pipeThrough(new DecompressionStream('gzip'))).text()};
TF.archive=async days=>{const lim=Date.now()-days*864e5,ts=await TF.db.all('tasks');let n=0;
 for(const t of ts){if(t.status==='closed'&&t.closedAt&&new Date(t.closedAt).getTime()<lim){
  await TF.db.put('archived_records',{id:t.id,archivedAt:new Date().toISOString(),title:t.title,clientId:t.clientId,blob:await gz(JSON.stringify(t))});await TF.db.del('tasks',t.id);n++}}return n};
TF.searchArchive=async q=>{q=q.toLowerCase();const out=[];for(const r of await TF.db.all('archived_records')){const t=JSON.parse(await ungz(r.blob));
 if((t.id+' '+t.title+' '+(t.discipline||'')).toLowerCase().includes(q))out.push(t)}return out};
TF.telemetry=async()=>{const e=navigator.storage&&navigator.storage.estimate?await navigator.storage.estimate():{usage:0,quota:0};
 const persisted=navigator.storage&&navigator.storage.persisted?await navigator.storage.persisted():false;const counts={};for(const s of TF.STORES)counts[s]=await TF.db.count(s);return{e,persisted,counts}};
TF.persist=async()=>{try{return navigator.storage.persist?await navigator.storage.persist():false}catch(_){return false}};
TF.dump=async()=>{const o={app:'taskflow-allocator',version:1,exported:new Date().toISOString()};for(const s of TF.STORES){if(s==='sync_queue'||s==='settings_meta')continue;
 o[s]=s==='archived_records'?await Promise.all((await TF.db.all(s)).map(async r=>({...r,blob:await ungz(r.blob)}))):await TF.db.all(s)}return o};
TF.restore=async o=>{for(const s of TF.STORES){if(!o[s])continue;await TF.db.putMany(s,o[s])}};
TF.download=(name,text,type)=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type:type||'application/json'}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1e3)};
TF.csv=rows=>rows.map(r=>r.map(c=>'"'+String(c??'').replace(/"/g,'""')+'"').join(',')).join('\n');
let fh=null,tm;
TF.bindFile=async()=>{if(!window.showSaveFilePicker)throw new Error('File System Access is not supported in this browser');
 fh=await showSaveFilePicker({suggestedName:'agac.taskflow.json',types:[{description:'TaskFlow backup',accept:{'application/json':['.taskflow.json','.json']}}]});await TF.db.put('settings_meta',{id:'fsHandle',handle:fh});await TF.writeFile()};
TF.writeFile=async()=>{if(!fh)return false;const w=await fh.createWritable();await w.write(JSON.stringify(await TF.dump()));await w.close();return true};
TF.loadHandle=async()=>{try{const r=await TF.db.get('settings_meta','fsHandle');if(r)fh=r.handle}catch(_){}};
TF.autoBackup=()=>{if(!fh)return;clearTimeout(tm);tm=setTimeout(async()=>{try{if(await fh.queryPermission({mode:'readwrite'})==='granted')await TF.writeFile()}catch(_){}},3000)};
TF.hasHandle=()=>!!fh;
})();