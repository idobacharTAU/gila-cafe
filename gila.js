/* גילא — shared behaviour. HOURS is the single source of truth for the live pill,
   the highlighted row in the hours table and anything else that needs "is it open". */
(function(){
  "use strict";
  document.documentElement.classList.remove("no-js");

  // minutes from midnight, JS day index (0 = Sunday). null = closed.
  // Sun 12:00–19:30 · Mon–Thu 07:45–19:30 · Fri 07:45–16:00 · Sat closed
  var HOURS = [[720,1170],[465,1170],[465,1170],[465,1170],[465,1170],[465,960],null];
  var DAY_NAMES = ["ראשון","שני","שלישי","רביעי","חמישי","שישי","שבת"];
  window.GILA_HOURS = HOURS;

  function israelNow(){
    var p = new Intl.DateTimeFormat("en-GB",{timeZone:"Asia/Jerusalem",weekday:"short",hour:"2-digit",minute:"2-digit",hour12:false}).formatToParts(new Date());
    var g = function(t){ return p.find(function(x){return x.type===t;}).value; };
    var d = {Sun:0,Mon:1,Tue:2,Wed:3,Thu:4,Fri:5,Sat:6};
    var o = window.GILA_NOW_OVERRIDE;            // test hook: {day, mins}
    return o || { day:d[g("weekday")], mins:(+g("hour"))*60 + (+g("minute")) };
  }
  function hhmm(m){ return String(Math.floor(m/60)).padStart(2,"0")+":"+String(m%60).padStart(2,"0"); }
  function nextOpening(day){
    for (var i=1;i<=7;i++){ var d=(day+i)%7; if (HOURS[d]) return {day:d,at:HOURS[d][0],tomorrow:i===1}; }
    return null;
  }

  function render(){
    var now = israelNow(), today = HOURS[now.day], html, state;
    if (today && now.mins>=today[0] && now.mins<today[1]){
      state="open"; var left=today[1]-now.mins;
      html = left<=60 ? "פתוח · נסגר בעוד <b>"+left+"</b> דק׳" : "פתוח עכשיו · עד <b>"+hhmm(today[1])+"</b>";
    } else {
      state="closed";
      if (today && now.mins<today[0]) html = "סגור · נפתח היום ב־<b>"+hhmm(today[0])+"</b>";
      else { var nx=nextOpening(now.day);
        html = nx ? "סגור · נפתח "+(nx.tomorrow?"מחר":"ביום "+DAY_NAMES[nx.day])+" ב־<b>"+hhmm(nx.at)+"</b>" : "סגור"; }
    }
    Array.prototype.forEach.call(document.querySelectorAll("[data-status]"),function(el){
      el.setAttribute("data-state",state); var t=el.querySelector(".t"); if(t) t.innerHTML=html;
    });
    Array.prototype.forEach.call(document.querySelectorAll("#hours tr"),function(tr){ tr.removeAttribute("data-today"); });
    var row=document.querySelector('#hours tr[data-day="'+now.day+'"]'); if(row) row.setAttribute("data-today","1");
  }
  window.GILA_RENDER = render;
  render(); setInterval(render,30000);

  // reveal on scroll
  var els = document.querySelectorAll(".rv");
  if ("IntersectionObserver" in window){
    var io = new IntersectionObserver(function(es){
      es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add("in"); io.unobserve(e.target); } });
    },{rootMargin:"0px 0px -8% 0px",threshold:.08});
    Array.prototype.forEach.call(els,function(el){ io.observe(el); });
  } else Array.prototype.forEach.call(els,function(el){ el.classList.add("in"); });
})();

/* lightbox for any <button data-lb="big.webp"><img></button> — arrows, swipe, counter, Esc */
(function(){
  var rm = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  Array.prototype.forEach.call(document.querySelectorAll("video[autoplay]"),function(v){ if(rm){ v.removeAttribute("autoplay"); v.pause(); } });
  var btns = Array.prototype.slice.call(document.querySelectorAll("[data-lb]")); if(!btns.length) return;
  var lb=document.createElement("div"); lb.className="lb"; lb.hidden=true; lb.setAttribute("role","dialog"); lb.setAttribute("aria-modal","true");
  lb.innerHTML='<button class="x" type="button" aria-label="סגירה">&#10005;</button><button class="pv" type="button" aria-label="הקודמת">&#8250;</button><button class="nx" type="button" aria-label="הבאה">&#8249;</button><img alt=""><div class="ct"></div>';
  document.body.appendChild(lb);
  var im=lb.querySelector("img"), ct=lb.querySelector(".ct"), idx=0, last=null, sx=null;
  function show(i){
    idx=(i+btns.length)%btns.length; var b=btns[idx], t=b.querySelector("img");
    im.src=b.getAttribute("data-lb"); im.alt=t?t.alt:""; ct.textContent=(idx+1)+" / "+btns.length;
  }
  function open(i,from){ last=from; show(i); lb.hidden=false; document.documentElement.style.overflow="hidden"; lb.querySelector(".x").focus(); }
  function close(){ lb.hidden=true; im.src=""; document.documentElement.style.overflow=""; if(last) last.focus(); }
  btns.forEach(function(b,i){ b.addEventListener("click",function(){ open(i,b); }); });
  lb.addEventListener("click",function(e){ if(e.target===lb||e.target===im||e.target.classList.contains("x")) close(); });
  lb.querySelector(".nx").addEventListener("click",function(e){ e.stopPropagation(); show(idx+1); });
  lb.querySelector(".pv").addEventListener("click",function(e){ e.stopPropagation(); show(idx-1); });
  lb.addEventListener("touchstart",function(e){ sx=e.touches[0].clientX; },{passive:true});
  lb.addEventListener("touchend",function(e){ if(sx===null) return; var dx=e.changedTouches[0].clientX-sx; sx=null; if(Math.abs(dx)>50) show(idx+(dx<0?1:-1)); });
  document.addEventListener("keydown",function(e){
    if(lb.hidden) return;
    if(e.key==="Escape") close(); else if(e.key==="ArrowLeft") show(idx+1); else if(e.key==="ArrowRight") show(idx-1);
  });
})();
