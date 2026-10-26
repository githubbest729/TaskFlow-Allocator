(()=>{const TF=window.TF=window.TF||{},$=s=>document.querySelector(s);let ev=null,n=0,shown=false;
TF.toast=(m,act,fn)=>{const t=$('#toast');t.innerHTML='';t.append(m);if(act){const b=document.createElement('button');b.textContent=act;b.onclick=fn;t.append(b)}t.classList.add('on');clearTimeout(TF._t);if(!act)TF._t=setTimeout(()=>t.classList.remove('on'),3500)};
addEventListener('beforeinstallprompt',e=>{e.preventDefault();ev=e;if(n>=2)reveal()});
const standalone=()=>matchMedia('(display-mode: standalone)').matches||navigator.standalone;
const ios=()=>/iphone|ipad|ipod/i.test(navigator.userAgent)&&!standalone();
function reveal(){try{if(localStorage.getItem('tf-nobanner'))return}catch(_){}if(shown||standalone())return;
 if(ev){shown=true;$('#bInstall').hidden=false;banner('Install TaskFlow for offline use and a home-screen icon.','Install',async()=>{ev.prompt();await ev.userChoice;ev=null;$('#bInstall').hidden=true;$('#banner').hidden=true})}
 else if(ios()){shown=true;banner('To install on iPhone or iPad: tap Share, then Add to Home Screen.','Got it',()=>{$('#banner').hidden=true})}}
function banner(msg,label,fn){const b=$('#banner');b.hidden=false;b.innerHTML=`<span>${msg}</span><span><button class="pri" id="bOk">${label}</button> <button id="bNo">Not now</button></span>`;$('#bOk').onclick=fn;$('#bNo').onclick=()=>{b.hidden=true;try{localStorage.setItem('tf-nobanner','1')}catch(_){}}}
TF.valueEvent=()=>{n++;if(n>=2)reveal()};
$('#bInstall').onclick=async()=>{if(ev){ev.prompt();await ev.userChoice;ev=null;$('#bInstall').hidden=true}};
TF.badge=async c=>{try{if(navigator.setAppBadge)c?await navigator.setAppBadge(c):await navigator.clearAppBadge()}catch(_){}};
$('#bBell').onclick=async()=>{if(!('Notification' in window))return TF.toast('Notifications are not supported here');const p=await Notification.requestPermission();TF.toast('Alerts '+p);
 try{const r=await navigator.serviceWorker.ready;if(r.periodicSync)await r.periodicSync.register('sla-check',{minInterval:6*3600*1000})}catch(_){}};
TF.registerSW=async()=>{if(!('serviceWorker' in navigator))return;try{const r=await navigator.serviceWorker.register('sw.js'),ask=w=>TF.toast('New version available','Refresh',()=>w.postMessage({type:'SKIP_WAITING'}));
 if(r.waiting&&navigator.serviceWorker.controller)ask(r.waiting);
 r.addEventListener('updatefound',()=>{const w=r.installing;w.addEventListener('statechange',()=>{if(w.state==='installed'&&navigator.serviceWorker.controller)ask(w)})});
 let re=false;navigator.serviceWorker.addEventListener('controllerchange',()=>{if(!re){re=true;location.reload()}});
 navigator.serviceWorker.addEventListener('message',e=>{if(e.data&&e.data.type==='OPEN')TF.deepLink(new URL(e.data.url).searchParams.get('task'))})}catch(_){}};
})();