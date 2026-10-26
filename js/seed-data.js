(()=>{const TF=window.TF=window.TF||{};
TF.ymd=o=>{const x=new Date();x.setDate(x.getDate()+o);return x.toISOString().slice(0,10)};
TF.esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
TF.DISC=['Wonderware HMI','PLC Integration','OPC/Modbus Comms','SQL Historian','Site Survey/BOM','FAT/SAT QA','HSE Annexure-SCT-HR-001'];
TF.PRI=['Critical','High','Standard','Low'];
TF.COLS=[['backlog','Client Spec & Backlog',0],['assigned','Assigned & Scheduled',8],['progress','In Progress (SCADA / PLC / SQL)',6],['qa','QA / FAT Testing',4],['sat','Site Commissioning (SAT)',4],['closed','Client Handover & Closed',0]];
TF.TEAMS=['SCADA & Wonderware HMI Team','PLC & Field Comms Team (OPC / Modbus / Telemetry)','Database & SQL Historian Team','Site Survey, Estimation & Commissioning Team','QA, Documentation & HSE Compliance Team'];
TF.SITES=['Dubai Office','Jebel Ali','DEWA','ADNOC','Dubai Municipality'];
TF.seed=()=>{const D=TF.DISC;
 const M=(i,n,t,role,sk)=>({id:'E'+i,name:n,teamDepartment:t,role,skills:sk,hours:40,availability:'available'});
 const team=[M(1,'Omar Haddad',0,'Senior SCADA Engineer',[D[0],D[3]]),M(2,'Priya Nair',0,'HMI Developer',[D[0]]),M(3,'Khalid Mansoori',1,'PLC Lead',[D[1],D[2]]),M(4,'Sara Iqbal',1,'Telemetry Engineer',[D[2],D[1]]),
  M(5,'Rahul Menon',2,'SQL Historian Engineer',[D[3]]),M(6,'Layla Farouk',2,'Reporting Developer',[D[3],D[0]]),M(7,'Tariq Aziz',3,'Commissioning Engineer',[D[4],D[5]]),M(8,'Meera Joseph',3,'Estimation Engineer',[D[4]]),
  M(9,'Yousef Karim',4,'QA Lead',[D[5],D[6]]),M(10,'Anita DSouza',4,'HSE and Documentation',[D[6],D[5]])];
 const C=(i,c,pc,sc,dl)=>({id:'R'+i,clientName:c,projectCode:pc,scope:sc,deliveryDate:TF.ymd(dl),signoffs:[],slaStatus:'On Track'});
 const clients=[C(1,'DEWA','DEWA-SUB-26','Substation SCADA HMI upgrade with alarm rationalisation',21),C(2,'ADNOC','ADNOC-TEL-26','Pipeline telemetry gateway over Modbus TCP and OPC UA',12),C(3,'Jebel Ali Free Zone','JAFZ-PMP-26','Pump station PLC integration and remote monitoring',35),
  C(4,'Dubai Municipality','DM-STP-26','STP historian, daily compliance reports',5),C(5,'Dubai Municipality','DM-LFT-25','Lift station SAT and handover',-3)];
 const sub=(n)=>['HMI graphic review','Alarm tag validation','SQL query optimization','Client sign-off'].map((t,i)=>({t,done:i<n}));
 const T=(n,title,r,e,disc,pri,st,est,act,s,du,blk,sd)=>({id:'AGAC-TSK-'+(1040+n),title,clientId:'R'+r,assigneeId:'E'+e,discipline:D[disc],priority:pri,status:st,estH:est,actH:act,startDate:TF.ymd(s),dueDate:TF.ymd(du),blocker:!!blk,reqMet:st==='closed',subtasks:sub(sd),notes:'',archived:false,updatedAt:new Date().toISOString(),closedAt:st==='closed'?new Date(Date.now()-864e5*(n+2)).toISOString():null});
 const tasks=[T(1,'Rebuild substation overview graphics',1,1,0,'High','progress',40,22,-6,8,0,2),T(2,'Alarm tag validation for 33kV feeders',1,2,0,'Critical','assigned',24,0,-1,6,0,0),T(3,'Historian tags and retention policy',1,5,3,'Standard','progress',30,12,-4,12,0,1),
  T(4,'Modbus TCP map for RTU gateway',2,4,2,'Critical','progress',36,20,-5,5,1,1),T(5,'OPC UA server configuration',2,3,2,'High','progress',32,10,-3,7,0,1),T(6,'Telemetry FAT procedure',2,9,5,'High','qa',16,9,-8,3,0,3),
  T(7,'Pump station PLC logic review',3,3,1,'Standard','assigned',48,0,2,20,0,0),T(8,'Site survey and BOM for pumps',3,8,4,'Low','backlog',20,0,5,18,0,0),T(9,'Compliance report SQL optimisation',4,6,3,'High','progress',18,15,-9,2,0,3),
  T(10,'HSE annexure review for STP works',4,10,6,'High','qa',10,6,-6,1,0,2),T(11,'STP site acceptance test',4,7,5,'Critical','sat',24,14,-3,3,1,2),T(12,'Lift station SAT report',5,9,5,'Standard','closed',14,16,-20,-3,0,4),
  T(13,'Lift station handover pack',5,10,6,'Standard','closed',12,11,-18,-4,0,4),T(14,'Alarm philosophy workshop prep',1,1,0,'Standard','backlog',12,0,8,26,0,0),T(15,'Historian backup test',4,5,3,'Low','assigned',8,0,0,9,0,0)];
 const events=[{id:'S1',date:TF.ymd(1),engineerId:'E7',siteLocation:'Dubai Municipality',note:'STP SAT witness'},{id:'S2',date:TF.ymd(2),engineerId:'E3',siteLocation:'ADNOC',note:'Gateway site visit'},{id:'S3',date:TF.ymd(3),engineerId:'E4',siteLocation:'DEWA',note:'RTU wiring check'}];
 return{team,clients,tasks,events}};
})();