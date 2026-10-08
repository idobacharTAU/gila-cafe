/* גילא — motion layer. Everything here is an enhancement: with JS off, with
   prefers-reduced-motion, or on a battery-saver phone the page is complete without it. */
(function(){
  "use strict";
  var root = document.documentElement;
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia && matchMedia("(pointer:fine)").matches;
  function $(s,c){ return (c||document).querySelector(s); }
  function $$(s,c){ return Array.prototype.slice.call((c||document).querySelectorAll(s)); }

  /* ── intro doors (home only, once per session) ───────────────────────── */
  var intro = $(".intro");
  function ready(){ root.classList.add("ready"); }
  if (intro && !reduce && !root.classList.contains("skip-intro")){
    var gone = false;
    var open = function(){
      if (gone) return; gone = true;
      try{ sessionStorage.setItem("gila-intro","1"); }catch(e){}
      intro.classList.add("go");
      setTimeout(ready, 380);
      setTimeout(function(){ intro.classList.add("done"); }, 1100);
    };
    setTimeout(open, 700);
    intro.addEventListener("click", open);
  } else {
    if (intro) intro.classList.add("done");
    ready();
  }

  /* ── time-aware hero ─────────────────────────────────────────────────── */
  var hero = $(".hero2");
  if (hero){
    var h = +new Intl.DateTimeFormat("en-GB",{timeZone:"Asia/Jerusalem",hour:"2-digit",hour12:false}).format(new Date());
    var tod = h<5 ? "night" : h<12 ? "morning" : h<17 ? "day" : h<21 ? "evening" : "night";
    var say = {
      morning:["בוקר טוב.","מה שותים?"],
      day:["צהריים טובים.","יש מה לאכול."],
      evening:["ערב טוב.","עוד קפה לפני שמסיימים?"],
      night:["לילה טוב.","נתראה מחר."]
    }[tod];
    hero.setAttribute("data-tod", tod);
    var g = $("#greet"); if (g) g.textContent = say[0] + " " + say[1];
  }

  /* ── nav: transparent over the hero, solid after; progress hairline ─── */
  var nav = $(".nav");
  var bar = nav && $(".progress", nav);
  var abar = $(".abar");
  var lastY = 0, ticking = false;
  function onScroll(){
    ticking = false;
    var y = window.scrollY || 0, max = Math.max(1, root.scrollHeight - innerHeight);
    if (nav && hero) nav.classList.toggle("nav--over", y < innerHeight*0.55);
    if (bar) bar.style.transform = "scaleX(" + Math.min(1, y/max) + ")";
    if (abar) abar.classList.toggle("hide", y > lastY + 6 && y > 400 ? true : y < lastY - 6 ? false : abar.classList.contains("hide"));
    story(y);
    velocity(y);
    lastY = y;
  }
  window.addEventListener("scroll", function(){ if(!ticking){ ticking = true; requestAnimationFrame(onScroll);} }, {passive:true});
  window.addEventListener("resize", onScroll);

  /* ── pinned story: step follows scroll progress ──────────────────────── */
  var st = $(".story");
  var shots = st ? $$(".shots img", st) : [];
  var steps = st ? $$(".st", st) : [];
  var dots = st ? $$(".dots2 b", st) : [];
  var cur = -1;
  function story(){
    if (!st || reduce) return;
    var r = st.getBoundingClientRect(), total = st.offsetHeight - innerHeight;
    var p = Math.min(0.999, Math.max(0, -r.top / total));
    var i = Math.min(steps.length-1, Math.floor(p * steps.length));
    if (i === cur) return; cur = i;
    shots.forEach(function(el,k){ el.classList.toggle("on", k===i); });
    steps.forEach(function(el,k){ el.classList.toggle("on", k===i); });
    dots.forEach(function(el,k){ el.classList.toggle("on", k===i); });
  }

  /* ── marquee speed follows scroll speed ──────────────────────────────── */
  var mq = $(".marquee .track"), vLast = 0, vT = 0, rate = 1;
  function velocity(y){
    if (!mq || reduce || !mq.getAnimations) return;
    var now = performance.now(), dv = Math.abs(y - vLast) / Math.max(16, now - vT);
    vLast = y; vT = now;
    var target = 1 + Math.min(5, dv * 3);
    rate += (target - rate) * 0.2;
    var a = mq.getAnimations()[0]; if (a) a.playbackRate = rate;
  }
  setInterval(function(){ rate += (1 - rate) * 0.25; var a = mq && mq.getAnimations && mq.getAnimations()[0]; if (a) a.playbackRate = rate; }, 120);

  /* ── drag-to-scroll rails (mouse only; touch already scrolls natively) ─ */
  $$(".rail").forEach(function(rail){
    if (!fine) return;
    rail.classList.add("drag");
    var down=false, sx=0, sl=0, moved=0, lx=0, v=0, raf=0;
    rail.addEventListener("pointerdown", function(e){ if(e.pointerType!=="mouse") return; down=true; moved=0; sx=lx=e.clientX; sl=rail.scrollLeft; cancelAnimationFrame(raf); });
    window.addEventListener("pointermove", function(e){
      if(!down) return; var dx=e.clientX-sx; moved=Math.max(moved,Math.abs(dx));
      if(moved>4) rail.classList.add("dragging");
      rail.scrollLeft = sl - dx; v = e.clientX - lx; lx = e.clientX;
    });
    window.addEventListener("pointerup", function(){
      if(!down) return; down=false; rail.classList.remove("dragging");
      (function glide(){ if(Math.abs(v)<.5) return; rail.scrollLeft -= v; v*=.94; raf=requestAnimationFrame(glide); })();
    });
  });

  /* ── magnetic buttons + tilt cards (desktop pointers only) ───────────── */
  if (fine && !reduce){
    $$(".btn-green,.btn-cream,.call").forEach(function(b){
      b.classList.add("mag");
      b.addEventListener("pointermove", function(e){
        var r=b.getBoundingClientRect(), x=(e.clientX-r.left-r.width/2)/r.width, y=(e.clientY-r.top-r.height/2)/r.height;
        b.style.transform="translate("+x*8+"px,"+y*6+"px)";
      });
      b.addEventListener("pointerleave", function(){ b.style.transform=""; });
    });
    $$(".door").forEach(function(c){
      c.classList.add("tilt");
      c.addEventListener("pointermove", function(e){
        var r=c.getBoundingClientRect(), x=(e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5;
        c.style.transform="perspective(900px) rotateY("+(-x*5)+"deg) rotateX("+(y*5)+"deg) translateY(-5px)";
      });
      c.addEventListener("pointerleave", function(){ c.style.transform=""; });
    });
  }

  /* ── lazy video: below-the-fold clips only play when near ────────────── */
  if ("IntersectionObserver" in window){
    var vio = new IntersectionObserver(function(es){
      es.forEach(function(e){
        var v = e.target;
        if (e.isIntersecting){ if (reduce) return; if(v.preload==="none") v.preload="auto"; var p=v.play(); if(p&&p.catch) p.catch(function(){}); }
        else v.pause();
      });
    },{rootMargin:"200px"});
    $$("video[preload=none]").forEach(function(v){ vio.observe(v); });
  }

  var hv = $(".hero-media video");
  if (hv && !reduce){ var pp = hv.play(); if (pp && pp.catch) pp.catch(function(){}); }
  onScroll();
})();
