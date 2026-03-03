"use strict";

const projects = [
    { title:"Temporary Removed", description:"Project has been temporarily removed due to issues with the code — last updated 14/02/26", tags:["HTML","CSS","JavaScript"], pageUrl:"404.html", imageUrl:"", year:"202?", index:"01" },
    { title:"Coming Soon", description:"A new project is currently in development. Something interesting is on the way — check back soon.", tags:["In Progress"], pageUrl:null, imageUrl:"", year:"202?", index:"02" },
    { title:"Coming Soon", description:"A new project is currently in development. Something interesting is on the way — check back soon.", tags:["Not Started"], pageUrl:null, imageUrl:"", year:"202?", index:"03" },
];

const dailyQuotes = [
    { text:"The only way to do great work is to love what you do.", author:"Steve Jobs" },
    { text:"Innovation distinguishes between a leader and a follower.", author:"Steve Jobs" },
    { text:"Code is like humor. When you have to explain it, it's bad.", author:"Cory House" },
    { text:"First, solve the problem. Then, write the code.", author:"John Johnson" },
    { text:"Any fool can write code that a computer can understand. Good programmers write code that humans can understand.", author:"Martin Fowler" },
    { text:"The best way to predict the future is to invent it.", author:"Alan Kay" },
    { text:"Simplicity is the soul of efficiency.", author:"Austin Freeman" },
    { text:"Make it work, make it right, make it fast.", author:"Kent Beck" },
    { text:"Technology is best when it brings people together.", author:"Matt Mullenweg" },
    { text:"The function of good software is to make the complex appear to be simple.", author:"Grady Booch" },
    { text:"Perfection is achieved not when there is nothing more to add, but rather when there is nothing more to take away.", author:"Antoine de Saint-Exupery" },
    { text:"I have no special talents. I am only passionately curious.", author:"Albert Einstein" },
    { text:"Continuous improvement is better than delayed perfection.", author:"Mark Twain" },
    { text:"Programs must be written for people to read, and only incidentally for machines to execute.", author:"Harold Abelson" },
    { text:"The most disastrous thing that you can ever learn is your first programming language.", author:"Alan Kay" },
    { text:"Software is a great combination between artistry and engineering.", author:"Bill Gates" },
    { text:"Good design is as little design as possible.", author:"Dieter Rams" },
    { text:"Debugging is twice as hard as writing the code in the first place.", author:"Brian Kernighan" },
    { text:"Every great developer you know got there by solving problems they were unqualified to solve until they actually did it.", author:"Patrick McKenzie" },
    { text:"Walking on water and developing software from a specification are easy if both are frozen.", author:"Edward V. Berard" },
    { text:"The best error message is the one that never shows up.", author:"Thomas Fuchs" },
    { text:"Don't comment bad code — rewrite it.", author:"Brian Kernighan" },
    { text:"Experience is the name everyone gives to their mistakes.", author:"Oscar Wilde" },
    { text:"Quality is not an act, it is a habit.", author:"Aristotle" },
    { text:"Design is not just what it looks like and feels like. Design is how it works.", author:"Steve Jobs" },
    { text:"The only impossible journey is the one you never begin.", author:"Tony Robbins" },
    { text:"It's not a bug - it's an undocumented feature.", author:"Anonymous" },
    { text:"Talk is cheap. Show me the code.", author:"Linus Torvalds" },
    { text:"Learning to write programs stretches your mind and helps you think better.", author:"Bill Gates" },
    { text:"The computer was born to solve problems that did not exist before.", author:"Bill Gates" },
];

/* ── SOUND ENGINE ─────────────────────────────────────────────────────── */
const SoundEngine = (() => {
    let ctx = null, _played = false, _queue = [], _listenersAdded = false;
    const _ctx = () => { if (!ctx) try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e){} return ctx; };
    const _unlock = () => {
        if (_listenersAdded) return; _listenersAdded = true;
        const h = () => { _ctx(); ctx?.resume().then(() => { _queue.splice(0).forEach(f => { try{f();}catch(e){} }); }); };
        ["mousedown","touchstart","keydown","pointerdown"].forEach(ev => document.addEventListener(ev, h, { once:true, passive:true }));
    };
    const _ready = fn => {
        _ctx(); if (!ctx) return;
        if (ctx.state === "running") { try{fn();}catch(e){} }
        else { _queue.push(fn); ctx.resume().then(() => { const i=_queue.indexOf(fn); if(i!==-1){_queue.splice(i,1);try{fn();}catch(e){}} }).catch(()=>{}); }
    };
    const _play = ac => {
        const t = ac.currentTime + 0.04;
        const master = ac.createGain(); master.gain.setValueAtTime(0.11, t);
        const comp = ac.createDynamicsCompressor();
        Object.assign(comp, { threshold:{value:-18}, knee:{value:10}, ratio:{value:3}, attack:{value:0.004}, release:{value:0.22} });
        comp.connect(ac.destination); master.connect(comp);
        const chime = (freq, start, vol, decay) => {
            [[1,1],[2,0.15],[3,0.04]].forEach(([m,r]) => {
                const o=ac.createOscillator(), g=ac.createGain(); o.type="sine"; o.frequency.value=freq*m;
                o.connect(g); g.connect(master);
                g.gain.setValueAtTime(0,start); g.gain.linearRampToValueAtTime(vol*r,start+0.007);
                g.gain.exponentialRampToValueAtTime(vol*r*0.35,start+0.14); g.gain.exponentialRampToValueAtTime(0.0001,start+decay);
                o.start(start); o.stop(start+decay+0.05);
            });
            [0.05,0.095].forEach((d,i) => {
                const o=ac.createOscillator(), dl=ac.createDelay(0.5), g=ac.createGain();
                o.type="sine"; o.frequency.value=freq; dl.delayTime.value=d;
                o.connect(dl); dl.connect(g); g.connect(master);
                const rv=vol*(i===0?0.14:0.07);
                g.gain.setValueAtTime(0,start); g.gain.linearRampToValueAtTime(rv,start+0.01);
                g.gain.exponentialRampToValueAtTime(0.0001,start+decay*0.7);
                o.start(start); o.stop(start+decay+0.05);
            });
        };
        chime(392, t, 1, 1.5); chime(587.33, t+0.19, 1.1, 1.9);
        const so=ac.createOscillator(), sg=ac.createGain(); so.type="sine";
        so.frequency.setValueAtTime(1174.66,t+0.19); so.frequency.exponentialRampToValueAtTime(1210,t+0.55);
        sg.gain.setValueAtTime(0,t+0.19); sg.gain.linearRampToValueAtTime(0.018,t+0.23); sg.gain.exponentialRampToValueAtTime(0.0001,t+1.15);
        so.connect(sg); sg.connect(master); so.start(t+0.19); so.stop(t+1.25);
    };
    _ctx(); _unlock();
    return {
        playAdminOpen() { if (_played) return; _played=true; _ready(() => { if(ctx) _play(ctx); }); },
        resetAdminSoundGuard() { _played=false; }
    };
})();

/* ── FLOATING IMAGE SYSTEM ────────────────────────────────────────────── */
const FloatingImageSystem = (() => {
    const floaters = new Map();
    let _db=null, _dragging=null, _handlersReady=false, _customSize=null;
    const getSize = () => _customSize !== null ? _customSize : (window.innerWidth <= 768 ? 180 : 340);

    const setupHandlers = () => {
        if (_handlersReady) return; _handlersReady=true;
        const move = (cx,cy) => {
            if (!_dragging) return; const f=_dragging, size=f._spawnSize||getSize();
            const now=performance.now(), dt=now-f._lastT;
            if (dt>0) { f._velX=(cx-f._lastX)/dt*16; f._velY=(cy-f._lastY)/dt*16; }
            f._lastX=cx; f._lastY=cy; f._lastT=now;
            f.x=Math.max(0,Math.min(window.innerWidth-size,cx-f._dragOffX));
            f.y=Math.max(0,Math.min(window.innerHeight-80,cy-f._dragOffY));
            f.el.style.transform=`translate(${f.x}px,${f.y}px) rotate(${Math.max(-18,Math.min(18,f._velX*0.35))}deg) scale(1.06)`;
        };
        const up = () => {
            if (!_dragging) return; const f=_dragging;
            f.vx=f._velX*0.65; f.vy=f._velY*0.65; f.dragging=false;
            f.el.style.cursor="grab"; f.el.style.filter="drop-shadow(0 10px 36px rgba(0,0,0,0.32))";
            f.el.style.zIndex="9999990"; _dragging=null;
        };
        document.addEventListener("mousemove", e => move(e.clientX,e.clientY));
        document.addEventListener("mouseup", up);
        document.addEventListener("touchmove", e => { if(!_dragging)return; e.preventDefault(); move(e.touches[0].clientX,e.touches[0].clientY); }, {passive:false});
        document.addEventListener("touchend", up); document.addEventListener("touchcancel", up);
    };

    const compress = (src, maxDim, q) => new Promise(res => {
        const img=new Image();
        img.onload=()=>{ try { const r=Math.min(1,maxDim/Math.max(img.width,img.height)), c=document.createElement("canvas"); c.width=Math.round(img.width*r); c.height=Math.round(img.height*r); c.getContext("2d").drawImage(img,0,0,c.width,c.height); res(c.toDataURL("image/jpeg",q)); } catch{ res(src); } };
        img.onerror=()=>res(src); img.src=src;
    });

    const spawnFloater = (key, src, sizePx) => {
        setupHandlers(); const size=sizePx||getSize();
        const el=document.createElement("div");
        el.style.cssText=`position:fixed;left:0;top:0;width:${size}px;z-index:9999990;pointer-events:none;cursor:grab;user-select:none;-webkit-user-select:none;touch-action:none;filter:drop-shadow(0 10px 36px rgba(0,0,0,0.32));will-change:transform;opacity:0;`;
        const img=document.createElement("img"); img.src=src; img.draggable=false;
        img.style.cssText="width:100%;height:auto;display:block;border-radius:16px;pointer-events:none;";
        el.appendChild(img); document.body.appendChild(el);
        if (!document.getElementById("fis-css")) {
            const s=document.createElement("style"); s.id="fis-css";
            s.textContent=`@keyframes fisBloomSpin{0%{transform:scale(0.05) rotate(-180deg);opacity:0}18%{opacity:1}55%{transform:scale(1.12) rotate(12deg)}75%{transform:scale(0.94) rotate(-4deg)}90%{transform:scale(1.04) rotate(2deg)}100%{transform:scale(1.00) rotate(0deg);opacity:1}}`;
            document.head.appendChild(s);
        }
        const f={key,el,x:0,y:0,vx:0,vy:0,dragging:false,alive:true,phase:"entry",floatT:0,_spawnSize:size,_dragOffX:0,_dragOffY:0,_velX:0,_velY:0,_lastX:0,_lastY:0,_lastT:0};
        floaters.set(key,f);
        const startDrag=(f,cx,cy)=>{ _dragging=f; f.dragging=true; f._dragOffX=cx-f.x; f._dragOffY=cy-f.y; f._lastX=cx; f._lastY=cy; f._lastT=performance.now(); f._velX=0; f._velY=0; f.el.style.cursor="grabbing"; f.el.style.filter="drop-shadow(0 20px 56px rgba(0,0,0,0.45))"; f.el.style.zIndex="9999996"; };
        el.addEventListener("mousedown", e => { if(f.phase!=="floating")return; e.preventDefault(); startDrag(f,e.clientX,e.clientY); });
        el.addEventListener("touchstart", e => { if(f.phase!=="floating")return; e.preventDefault(); startDrag(f,e.touches[0].clientX,e.touches[0].clientY); }, {passive:false});
        const vw=window.innerWidth, vh=window.innerHeight;
        const bloomX=vw*.5-size*.5+(Math.random()-.5)*vw*.18, bloomY=vh*.42-size*.5+(Math.random()-.5)*vh*.12;
        const pad=size*.15, finalX=pad+Math.random()*(vw-size-pad*2), finalY=90+Math.random()*(vh-size-200);
        const DURATION=2000, PHASE_SPLIT=0.42, start=performance.now();
        const easeOut=t=>1-Math.pow(1-t,3);
        const easeSpring=t=>{ if(t===0)return 0; if(t===1)return 1; return Math.pow(2,-9*t)*Math.sin((t*10-0.75)*(2*Math.PI/3))+1; };
        const lerp=(a,b,t)=>a+(b-a)*t;
        img.style.animation=`fisBloomSpin ${DURATION*PHASE_SPLIT}ms cubic-bezier(0.34,1.56,0.64,1) both`;
        el.style.opacity="1"; el.style.transform=`translate(${bloomX}px,${bloomY}px) scale(0.05)`;
        const tick=now=>{
            if(!f.alive)return; const prog=Math.min((now-start)/DURATION,1);
            if(prog<PHASE_SPLIT){ el.style.transform=`translate(${bloomX}px,${bloomY}px) scale(${easeOut(prog/PHASE_SPLIT)})`; }
            else {
                const sp=easeSpring((prog-PHASE_SPLIT)/(1-PHASE_SPLIT));
                el.style.transform=`translate(${lerp(bloomX,finalX,sp)}px,${lerp(bloomY,finalY,sp)}px) rotate(${lerp(0,finalX-bloomX>0?6:-6,Math.sin((prog-PHASE_SPLIT)/(1-PHASE_SPLIT)*Math.PI))}deg)`;
                if(img.style.animation) img.style.animation="";
            }
            if(prog<1){ requestAnimationFrame(tick); }
            else {
                f.x=finalX; f.y=finalY; f.vx=0; f.vy=0; f.phase="floating";
                el.style.pointerEvents="all"; img.style.animation="";
                el.style.transform=`translate(${finalX}px,${finalY}px) rotate(0deg)`;
                const DAMP=0.968,BOUNCE=0.38,BOB_AMP=8,BOB_SPD=0.0013,DRIFT_AMP=3.5;
                let lastT=performance.now();
                const loop=now=>{
                    if(!f.alive||f.phase!=="floating")return; requestAnimationFrame(loop);
                    if(f.dragging)return;
                    const dt=Math.min(now-lastT,33); lastT=now; f.floatT+=dt;
                    f.x+=f.vx; f.y+=f.vy; f.vx*=DAMP; f.vy*=DAMP;
                    const vw=window.innerWidth, vh=window.innerHeight;
                    if(f.x<0){f.x=0;f.vx=Math.abs(f.vx)*BOUNCE;} if(f.x>vw-size){f.x=vw-size;f.vx=-Math.abs(f.vx)*BOUNCE;}
                    if(f.y<0){f.y=0;f.vy=Math.abs(f.vy)*BOUNCE;} if(f.y>vh-80){f.y=vh-80;f.vy=-Math.abs(f.vy)*BOUNCE;}
                    const spd=Math.sqrt(f.vx*f.vx+f.vy*f.vy);
                    const bobY=spd<0.5?Math.sin(f.floatT*BOB_SPD)*BOB_AMP:0;
                    const bobX=spd<0.5?Math.sin(f.floatT*BOB_SPD*0.618+2.1)*DRIFT_AMP:0;
                    el.style.transform=`translate(${f.x+bobX}px,${f.y+bobY}px) rotate(${spd<0.5?0:Math.max(-12,Math.min(12,f.vx*1.4))}deg)`;
                };
                requestAnimationFrame(loop);
            }
        };
        requestAnimationFrame(tick);
    };

    const dismiss = key => {
        const f=floaters.get(key); if(!f)return; f.alive=false;
        if(_dragging===f)_dragging=null;
        f.el.style.transition="opacity 0.45s ease,transform 0.45s cubic-bezier(0.4,0,1,1)";
        f.el.style.opacity="0"; f.el.style.transform+=" scale(0.4) rotate(25deg)";
        setTimeout(()=>{ f.el.remove(); floaters.delete(key); },500);
    };

    return {
        init(db){ _db=db; if(!_db)return; _db.ref("funnyImages").on("child_added",s=>{ if(!floaters.has(s.key)){const v=s.val(); spawnFloater(s.key,v.src,v.size||null);} }); _db.ref("funnyImages").on("child_removed",s=>dismiss(s.key)); },
        async add(rawSrc,sizePx){ const s=sizePx||(_customSize!==null?_customSize:340), src=await compress(rawSrc,s,0.74); _db?_db.ref("funnyImages").push({src,size:s,ts:Date.now()}):spawnFloater("local_"+Date.now(),src,s); _customSize=null; },
        clearAll(){ _db?_db.ref("funnyImages").remove():[...floaters.keys()].forEach(dismiss); },
        setCustomSize(px){ _customSize=px; },
        clearCustomSize(){ _customSize=null; }
    };
})();

/* ── INIT ─────────────────────────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
    initDarkMode(); applyAllLocks(); initLoadingScreen(); initProjects();
    initScrollAnimations(); initSmoothScroll(); initHeroAnimation();
    initEmailForm(); initNavScroll(); initBurgerMenu(); initScrollIndicator();
    initQuoteOfTheDay(); initMobileSectionObserver(); initMobileScrollAnimations();
    initAdminPanel(); setTimeout(initInstantTapFeedback, 600);
});

/* ── DARK MODE ────────────────────────────────────────────────────────── */
function initDarkMode() {
    const saved=localStorage.getItem("darkMode");
    if(saved==="true") document.body.classList.add("dark-mode");
    else if(saved===null) { if(window.matchMedia("(prefers-color-scheme: dark)").matches){document.body.classList.add("dark-mode");localStorage.setItem("darkMode","true");}else{localStorage.setItem("darkMode","false");} }
    const toggle=()=>{ document.body.classList.toggle("dark-mode"); localStorage.setItem("darkMode",document.body.classList.contains("dark-mode").toString()); };
    document.getElementById("darkModeToggleDesktop")?.addEventListener("click",toggle);
}

/* ── LOADING SCREEN ───────────────────────────────────────────────────── */
function initLoadingScreen() {
    const loader=document.getElementById("loadingScreen"); if(!loader)return;
    document.body.style.overflow="hidden";
    setTimeout(()=>{ loader.classList.add("loader-exit"); setTimeout(()=>{ loader.style.display="none"; document.body.style.overflow=""; },900); },2300);
}

/* ── LOCK SYSTEM ──────────────────────────────────────────────────────── */
const LOCK_CONFIG = {
    projectsLocked:{ sectionId:"projects", overlayId:"projectsLockOverlay", interactiveSelectors:[".project-grid-card",".project-grid-link"] },
    aboutLocked:   { sectionId:"about",    overlayId:"aboutLockOverlay",    interactiveSelectors:[".feature-item",".about-text-block",".intro-paragraph"] },
    contactLocked: { sectionId:"contact",  overlayId:"contactLockOverlay",  interactiveSelectors:[".contact-link",".email-form-container","#emailButton"] },
};

function applyAllLocks() {
    let saved={}; try{ saved=JSON.parse(localStorage.getItem("siteConfig")||"{}"); }catch(e){}
    const merged={...(window.SiteConfig||{}),...saved};
    Object.entries(LOCK_CONFIG).forEach(([k,o])=>applySectionLock(merged[k]===true,o));
}

function applySectionLock(isLocked, opts) {
    const section=document.getElementById(opts.sectionId), overlay=document.getElementById(opts.overlayId);
    if(!section||!overlay)return;
    const els=opts.interactiveSelectors?.flatMap(s=>[...document.querySelectorAll(s)])||[];
    if(isLocked){
        section.classList.add("is-locked");
        els.forEach(el=>{ el.setAttribute("tabindex","-1"); el.setAttribute("aria-hidden","true"); });
        if(!section._lockHandler){
            section._lockHandler=e=>{ if(!e.target.closest(".section-lock-overlay")){e.preventDefault();e.stopPropagation();} };
            ["click","touchstart","touchend"].forEach((ev,i)=>section.addEventListener(ev,section._lockHandler,i>0?{capture:true,passive:false}:true));
        }
    } else {
        section.classList.remove("is-locked");
        els.forEach(el=>{ el.removeAttribute("tabindex"); el.removeAttribute("aria-hidden"); });
        if(section._lockHandler){
            ["click","touchstart","touchend"].forEach(ev=>section.removeEventListener(ev,section._lockHandler,true));
            section._lockHandler=null;
        }
    }
}

/* ── PROJECT GRID ─────────────────────────────────────────────────────── */
function initProjects() {
    const grid=document.getElementById("projectGrid"); if(!grid)return;
    projects.forEach((p,i)=>grid.appendChild(createProjectCard(p,i)));
}
function createProjectCard(p, i) {
    const card=document.createElement("article");
    card.className="project-grid-card"; card.setAttribute("data-reveal",""); card.style.animationDelay=`${i*0.15}s`;
    const hasImg=p.imageUrl&&p.imageUrl.trim()!=="";
    const imgHtml=hasImg?`<div class="pgc-image"><img src="${p.imageUrl}" alt="${p.title}"/></div>`:`<div class="pgc-image pgc-image--empty"><div class="pgc-empty-grid"></div><span class="pgc-empty-label">${p.emptyLabel||"In Development"}</span></div>`;
    const tagsHtml=p.tags.map(t=>`<span class="pgc-tag">${t}</span>`).join("");
    const linkHtml=p.pageUrl&&p.pageUrl!=="#"?`<a href="${p.pageUrl}" class="pgc-link">View Project <span class="pgc-link-arrow">&#x2192;</span></a>`:`<span class="pgc-link pgc-link--disabled">Coming Soon <span class="pgc-link-arrow">&middot;</span></span>`;
    card.innerHTML=`<span class="pgc-corner pgc-corner--tl"></span><span class="pgc-corner pgc-corner--tr"></span><span class="pgc-corner pgc-corner--bl"></span><span class="pgc-corner pgc-corner--br"></span><div class="pgc-year">${p.year}</div>${imgHtml}<div class="pgc-body"><div class="pgc-title-row"><h3 class="pgc-title">${p.title}</h3><span class="pgc-title-line"></span></div><p class="pgc-desc">${p.description}</p><div class="pgc-tags">${tagsHtml}</div><div class="pgc-footer">${linkHtml}<span class="pgc-index-ghost">${p.index}</span></div></div>`;
    return card;
}

/* ── QUOTE OF THE DAY ─────────────────────────────────────────────────── */
function initQuoteOfTheDay() {
    const qText=document.getElementById("quoteText"), qAuth=document.getElementById("quoteAuthor"); if(!qText||!qAuth)return;
    const now=new Date(), day=Math.floor((now-new Date(now.getFullYear(),0,0))/86400000);
    const q=dailyQuotes[day%dailyQuotes.length];
    qText.textContent=q.text; qAuth.textContent=`\u2014 ${q.author}`;
}

/* ── SCROLL ANIMATIONS ────────────────────────────────────────────────── */
function initScrollAnimations() {
    const obs=new IntersectionObserver(entries=>entries.forEach(e=>{ if(e.isIntersecting){e.target.classList.add("revealed");obs.unobserve(e.target);} }),{threshold:0.1,rootMargin:"0px 0px -60px 0px"});
    document.querySelectorAll("[data-reveal]").forEach(el=>obs.observe(el));
}

function initMobileScrollAnimations() {
    if(window.innerWidth>768)return;
    if(!document.getElementById("mobile-scroll-anim-css")){
        const s=document.createElement("style"); s.id="mobile-scroll-anim-css";
        s.textContent=`@media(max-width:768px){.msa-fade-up{opacity:0;transform:translateY(28px);transition:opacity .55s cubic-bezier(.22,1,.36,1),transform .55s cubic-bezier(.22,1,.36,1)}.msa-fade-left{opacity:0;transform:translateX(-22px);transition:opacity .5s cubic-bezier(.22,1,.36,1),transform .5s cubic-bezier(.22,1,.36,1)}.msa-fade-right{opacity:0;transform:translateX(22px);transition:opacity .5s cubic-bezier(.22,1,.36,1),transform .5s cubic-bezier(.22,1,.36,1)}.msa-scale{opacity:0;transform:scale(.94);transition:opacity .5s cubic-bezier(.22,1,.36,1),transform .5s cubic-bezier(.22,1,.36,1)}.msa-visible{opacity:1!important;transform:none!important}}`;
        document.head.appendChild(s);
    }
    document.querySelectorAll(".feature-item").forEach((el,i)=>el.classList.add(i%2===0?"msa-fade-left":"msa-fade-right"));
    document.querySelectorAll(".project-grid-card,.contact-link,.section-title").forEach(el=>el.classList.add("msa-fade-up"));
    document.querySelector(".quote-content")?.classList.add("msa-scale");
    const obs=new IntersectionObserver(entries=>{
        entries.forEach(e=>{ if(e.isIntersecting){ const el=e.target,idx=[...(el.parentElement?.children||[])].indexOf(el); setTimeout(()=>el.classList.add("msa-visible"),idx>=0?idx*60:0); obs.unobserve(el); } });
    },{threshold:0.12,rootMargin:"0px 0px -30px 0px"});
    document.querySelectorAll(".msa-fade-up,.msa-fade-left,.msa-fade-right,.msa-scale").forEach(el=>obs.observe(el));
}

/* ── SMOOTH SCROLL ────────────────────────────────────────────────────── */
const isMobile = () => window.innerWidth <= 768;
function smoothScrollTo(targetY, dur) {
    document.documentElement.style.scrollBehavior=document.body.style.scrollBehavior="auto";
    const startY=window.pageYOffset, dist=targetY-startY; let t0=null;
    const ease=t=>t<0.5?2*t*t:-1+(4-2*t)*t;
    const step=now=>{ if(!t0)t0=now; const p=Math.min((now-t0)/dur,1); window.scrollTo(0,startY+dist*ease(p)); if(p<1)requestAnimationFrame(step); else{document.documentElement.style.scrollBehavior=document.body.style.scrollBehavior="";} };
    requestAnimationFrame(step);
}
function initSmoothScroll() {
    document.querySelectorAll("[data-nav]").forEach(link=>link.addEventListener("click",e=>{ e.preventDefault(); const tgt=document.querySelector(link.getAttribute("href")); if(!tgt)return; const y=tgt.offsetTop-80; isMobile()?closeBurgerMenu()||setTimeout(()=>smoothScrollTo(y,900),80):smoothScrollTo(y,1200); }));
}

/* ── HERO ─────────────────────────────────────────────────────────────── */
function initHeroAnimation() { setTimeout(()=>{ document.querySelector(".title-line")?.classList.add("revealed"); document.querySelector(".hero-subtitle")?.classList.add("revealed"); },300); }

/* ── SCROLL INDICATOR ─────────────────────────────────────────────────── */
function initScrollIndicator() {
    const el=document.getElementById("scrollIndicator"); if(!el||window.innerWidth<=768)return;
    let visible=true, timer=null;
    const hide=()=>{ if(!visible)return; visible=false; el.style.opacity="0"; el.style.transform="translateX(-50%) translateY(14px)"; clearTimeout(timer); timer=setTimeout(()=>el.style.visibility="hidden",900); };
    const show=()=>{ if(visible)return; visible=true; clearTimeout(timer); el.style.visibility="visible"; el.style.opacity="1"; el.style.transform="translateX(-50%) translateY(0)"; };
    setTimeout(()=>{ el.style.cssText="animation:none;transition:opacity .9s ease,transform .9s ease;opacity:1;transform:translateX(-50%) translateY(0)"; window.addEventListener("scroll",()=>window.pageYOffset>100?hide():show(),{passive:true}); },2800);
}

/* ── PARALLAX ─────────────────────────────────────────────────────────── */
let _ptick=false;
window.addEventListener("scroll",()=>{ if(_ptick)return; _ptick=true; requestAnimationFrame(()=>{ const s=window.pageYOffset; document.querySelectorAll(".shape").forEach((sh,i)=>sh.style.transform=`translateY(${s*(0.05+i*0.02)}px)`); document.querySelectorAll(".dot").forEach((d,i)=>d.style.transform=`translateY(${-s*(0.03+i*0.01)}px) scale(${1+s*0.0001})`); window.checkFormVisibility?.(); _ptick=false; }); },{passive:true});

/* ── EMAIL FORM ───────────────────────────────────────────────────────── */
function initEmailForm() {
    const btn=document.getElementById("emailButton"), container=document.getElementById("emailFormContainer");
    const form=document.getElementById("emailForm"), confirm=document.getElementById("formConfirmation"), err=document.getElementById("formError");
    const submitBtn=form?.querySelector(".submit-button"); if(!btn||!form)return;
    let open=false;
    btn.addEventListener("click",e=>{ e.preventDefault(); open=!open; open?(container.classList.add("active"),setTimeout(()=>container.scrollIntoView({behavior:"smooth",block:"nearest"}),100)):(container.classList.remove("active"),confirm?.classList.remove("show"),err?.classList.remove("show")); });
    form.addEventListener("submit",async e=>{ e.preventDefault(); submitBtn.disabled=true; submitBtn.textContent="Sending..."; confirm?.classList.remove("show"); err?.classList.remove("show");
        try { const r=await fetch("https://api.web3forms.com/submit",{method:"POST",body:new FormData(form)}), d=await r.json();
            if(d.success){ confirm?.classList.add("show"); form.reset(); submitBtn.disabled=false; submitBtn.textContent="Send Message"; setTimeout(()=>{ confirm?.classList.remove("show"); setTimeout(()=>{ container.classList.remove("active"); open=false; document.getElementById("contact")?.scrollIntoView({behavior:"smooth",block:"start"}); },500); },3000); }
            else throw new Error(d.message||"Something went wrong."); }
        catch(e2){ if(err){err.textContent=`\u2717 ${e2.message||"Network error."}`; err.classList.add("show");} submitBtn.disabled=false; submitBtn.textContent="Send Message"; setTimeout(()=>err?.classList.remove("show"),5000); }
    });
    window.checkFormVisibility=()=>{ if(!open)return; const r=container.getBoundingClientRect(); if(r.bottom<0||r.top>window.innerHeight+200){container.classList.remove("active");confirm?.classList.remove("show");err?.classList.remove("show");open=false;} };
}

/* ── NAV SCROLL ───────────────────────────────────────────────────────── */
function initNavScroll() { const nav=document.querySelector(".main-nav"); if(!nav)return; window.addEventListener("scroll",()=>nav.classList.toggle("scrolled",window.scrollY>50),{passive:true}); }

/* ── BURGER MENU ──────────────────────────────────────────────────────── */
let _burgerClose=null;
const closeBurgerMenu=()=>_burgerClose?.();
let _burgerDecorated=false;
function injectBurgerMenuDecoration() {
    if(window.innerWidth>768||_burgerDecorated)return; _burgerDecorated=true;
    const navLinks=document.getElementById("navLinks"); if(!navLinks)return;
    navLinks.querySelectorAll("a[data-nav]").forEach((link,i)=>{ const t=link.textContent.trim(); link.innerHTML=`<span class="menu-index">${["01","02","03"][i]||"0"+(i+1)}</span><span class="menu-text">${t}</span><span class="menu-arrow">&#x2192;</span>`; });
    const top=document.createElement("div"); top.className="nav-menu-topbar"; top.innerHTML=`<span>Portfolio / 2026</span><span>Navigation</span>`; navLinks.appendChild(top);
    const bot=document.createElement("div"); bot.className="nav-menu-bottombar"; bot.innerHTML=`<span style="display:flex;align-items:center;gap:6px"><span class="nav-menu-statusdot"></span>Available for work</span><span>Based in Latvia</span>`; navLinks.appendChild(bot);
    ["tl","tr","bl","br"].forEach(p=>{ const c=document.createElement("div"); c.className=`nav-menu-corner nav-menu-corner--${p}`; navLinks.appendChild(c); });
    const line=document.createElement("div"); line.className="nav-menu-line"; navLinks.appendChild(line);
    const dots=document.createElement("div"); dots.className="nav-menu-dots"; dots.innerHTML=`<div class="nav-menu-dot"></div>`.repeat(4); navLinks.appendChild(dots);
    _injectLightSwitch(navLinks.querySelector("a[data-nav]:last-of-type")||navLinks);
}

/* ── LIGHT SWITCH ─────────────────────────────────────────────────────── */
function _bindLightSwitch() {
    const btn=document.getElementById("navLsBtn"); if(!btn||btn._lsBound)return; btn._lsBound=true;

    const onDown=()=>{
        if(typeof gsap==="undefined"||typeof MorphSVGPlugin==="undefined") return;
        gsap.registerPlugin(MorphSVGPlugin);
        const tl=gsap.timeline();
        // Pull: rope stretches down, tab drops
        tl.to("#ls-rope-end", { duration:0.2, y:20 }, "start");
        tl.to("#ls-rope",     { duration:0.2, morphSVG:"#ls-rope-extended" }, "start");
    };

    const onUp=()=>{
        if(typeof gsap==="undefined"||typeof MorphSVGPlugin==="undefined") return;
        gsap.registerPlugin(MorphSVGPlugin);
        const tl=gsap.timeline();
        // Release: rope curls up with bounce, then settles straight
        tl.to("#ls-rope",     { duration:0.4, morphSVG:"#ls-rope-compressed", ease:"bounce.out" }, "up");
        tl.to("#ls-rope",     { duration:0.3, morphSVG:"#ls-rope-original",   ease:"power2.out" }, "down");
        // Tab bounces back up in two stages
        tl.to("#ls-rope-end", { duration:0.4, y:-10, ease:"bounce.out" }, "up");
        tl.to("#ls-rope-end", { duration:0.2, y:0,   ease:"power2.out" }, "down");
        // Toggle theme
        document.body.classList.toggle("dark-mode");
        localStorage.setItem("darkMode",document.body.classList.contains("dark-mode").toString());
        _syncLightSwitchToTheme(true);
    };

    const onCancel=()=>{
        if(typeof gsap==="undefined"||typeof MorphSVGPlugin==="undefined") return;
        gsap.registerPlugin(MorphSVGPlugin);
        gsap.to("#ls-rope",     { duration:0.3, morphSVG:"#ls-rope-original", ease:"power2.out" });
        gsap.to("#ls-rope-end", { duration:0.3, y:0, ease:"power2.out" });
    };

    btn.addEventListener("mousedown",  onDown);
    btn.addEventListener("mouseup",    onUp);
    btn.addEventListener("mouseleave", onCancel);
    btn.addEventListener("touchstart", e=>{ e.preventDefault(); onDown();   }, {passive:false});
    btn.addEventListener("touchend",   e=>{ e.preventDefault(); onUp();     }, {passive:false});
    btn.addEventListener("touchcancel",e=>{ e.preventDefault(); onCancel(); }, {passive:false});
}

function _syncLightSwitchToTheme(animate) {
    const knob=document.getElementById("navLsKnob"), btn=document.getElementById("navLsBtn"); if(!knob)return;
    const isDark=document.body.classList.contains("dark-mode"), tx=isDark?0:62;
    btn?.classList.toggle("ls-is-light",!isDark);
    if(animate&&typeof gsap!=="undefined") gsap.to(knob,{x:tx,duration:.5,ease:"back.out(1.4)"});
    else knob.style.transform=`translateX(${tx}px)`;
}

function _bindLightSwitch() {
    const btn=document.getElementById("navLsBtn"); if(!btn||btn._lsBound)return; btn._lsBound=true;
    const ropeEl=document.getElementById("ls-rope"), tabEl=document.getElementById("ls-rope-end");

    // Cubic bezier states: [cx1, cy1, cx2, cy2, ex, ey, tx, ty]
    const IDLE = [20, 15, 20, 45,  20, 60,   0,  0];
    const PULL = [ 6, 18, -8, 50, -10, 64, -30,  4];

    const K=220, D=22, M=1;
    let cur=[...IDLE], vel=[0,0,0,0,0,0,0,0], tgt=[...IDLE];
    let _raf=null, _lt=null, _down=false;

    const draw=s=>{ ropeEl?.setAttribute("d",`M20 0 C ${s[0].toFixed(2)} ${s[1].toFixed(2)} ${s[2].toFixed(2)} ${s[3].toFixed(2)} ${s[4].toFixed(2)} ${s[5].toFixed(2)}`); tabEl?.setAttribute("transform",`translate(${s[6].toFixed(2)},${s[7].toFixed(2)})`); };

    const tick=ts=>{
        if(_lt===null)_lt=ts; const dt=Math.min((ts-_lt)/1000,.033); _lt=ts;
        let live=false;
        for(let i=0;i<cur.length;i++){ const f=-K*(cur[i]-tgt[i])-D*vel[i]; vel[i]+=(f/M)*dt; cur[i]+=vel[i]*dt; if(Math.abs(cur[i]-tgt[i])>.05||Math.abs(vel[i])>.05)live=true; }
        draw(cur); _raf=live?requestAnimationFrame(tick):(_lt=null,null);
    };
    const go=()=>{ if(_raf)return; _lt=null; _raf=requestAnimationFrame(tick); };

    draw(cur);

    const onDown=()=>{ _down=true; tgt=[...PULL]; go(); };
    const onUp=()=>{ if(!_down)return; _down=false; tgt=[...IDLE]; vel[0]+=40; vel[2]+=55; vel[4]+=25; vel[6]+=35; go(); document.body.classList.toggle("dark-mode"); localStorage.setItem("darkMode",document.body.classList.contains("dark-mode").toString()); _syncLightSwitchToTheme(true); };
    const onCancel=()=>{ if(!_down)return; _down=false; tgt=[...IDLE]; go(); };

    btn.addEventListener("mousedown",onDown); btn.addEventListener("mouseup",onUp); btn.addEventListener("mouseleave",onCancel);
    btn.addEventListener("touchstart",e=>{e.preventDefault();onDown();},{passive:false});
    btn.addEventListener("touchend",e=>{e.preventDefault();onUp();},{passive:false});
    btn.addEventListener("touchcancel",e=>{e.preventDefault();onCancel();},{passive:false});
}

function initBurgerMenu() {
    const burger=document.getElementById("burgerMenu"), links=document.getElementById("navLinks"), overlay=document.getElementById("navOverlay"); if(!burger)return;
    const open=()=>{ injectBurgerMenuDecoration(); burger.classList.add("active"); links.classList.add("active"); overlay.classList.add("active"); document.body.style.overflow="hidden"; setTimeout(()=>_syncLightSwitchToTheme(false),50); };
    const close=()=>{ burger.classList.remove("active"); links.classList.remove("active"); overlay.classList.remove("active"); document.body.style.overflow=""; };
    _burgerClose=close;
    burger.addEventListener("click",e=>{ e.stopPropagation(); burger.classList.contains("active")?close():open(); });
    overlay.addEventListener("click",close);
    links.querySelectorAll("a:not([data-nav])").forEach(a=>a.addEventListener("click",close));
    document.addEventListener("keydown",e=>{ if(e.key==="Escape"&&links.classList.contains("active"))close(); });
    let rt; window.addEventListener("resize",()=>{ clearTimeout(rt); rt=setTimeout(()=>{ if(window.innerWidth>768)close(); },50); });
}

/* ── MOBILE SECTION OBSERVER ─────────────────────────────────────────── */
function initMobileSectionObserver() {
    if(window.innerWidth>768)return;
    const obs=new IntersectionObserver(entries=>entries.forEach(e=>{ const el=e.target; if(e.isIntersecting){el.classList.add("section-visible");el.classList.remove("section-above");}else{el.classList.toggle("section-above",el.getBoundingClientRect().top<0);el.classList.remove("section-visible");} }),{threshold:.08,rootMargin:"0px 0px -40px 0px"});
    document.querySelectorAll(".about-section,.projects-section,.quote-section,.contact-section").forEach(s=>obs.observe(s));
}

/* ── INSTANT TAP FEEDBACK ─────────────────────────────────────────────── */
function initInstantTapFeedback() {
    if(window.innerWidth>768)return;
    const flash=(el,inStyles,dur=150)=>{ el.addEventListener("touchstart",()=>Object.assign(el.style,{transition:"all .1s ease",...inStyles}),{passive:true}); const reset=()=>setTimeout(()=>{Object.keys(inStyles).forEach(k=>el.style[k]="");setTimeout(()=>el.style.transition="",300)},dur); el.addEventListener("touchend",reset,{passive:true}); el.addEventListener("touchcancel",reset,{passive:true}); };
    document.querySelector(".logo")&&flash(document.querySelector(".logo"),{color:"var(--color-accent)",transform:"scale(1.08) rotate(-4deg)"});
    document.querySelectorAll(".contact-link").forEach(el=>flash(el,{borderColor:"var(--color-accent)",transform:"translateX(5px)"}));
    document.querySelectorAll(".feature-item").forEach(el=>flash(el,{borderLeftWidth:"6px",transform:"translateX(5px)"},200));
    document.querySelectorAll(".project-grid-card").forEach(el=>flash(el,{borderColor:"var(--color-accent)"}));
    document.querySelector(".submit-button")&&flash(document.querySelector(".submit-button"),{opacity:".78",transform:"scale(.98)"});
}

/* ── ADMIN PANEL ──────────────────────────────────────────────────────── */
function initAdminPanel() {
    const PIN="2604", WORD=["h","i","t","m","a","n","2"];
    const DEFAULTS={projectsLocked:false,aboutLocked:false,contactLocked:false,accentColor:"#c17a5a",secondaryColor:"#7a8e7e",heroStatus:"Online",heroSubtext:"Currently, working on project",maintenanceMode:false,footerNote:"Designed & developed with care."};
    let keyBuf=[],panelOpen=false,pinOK=false,db=null,log=[],pinIn="",_stagedSrc=null,_stagedSize=340;

    const $ = id => document.getElementById(id);
    const getConf=()=>{ try{return JSON.parse(localStorage.getItem("siteConfig")||"{}");}catch{return{};} };
    const saveConf=u=>{ const n={...DEFAULTS,...getConf(),...u,_lastUpdated:Date.now()}; localStorage.setItem("siteConfig",JSON.stringify(n)); applyToSite(n); pushFB(n); logAct("Updated: "+Object.keys(u).join(", ")); return n; };

    const initFB=()=>{
        if(!window.FIREBASE_ENABLED||typeof firebase==="undefined")return;
        try { if(!firebase.apps.length)firebase.initializeApp(window.firebaseConfig); db=firebase.database(); FloatingImageSystem.init(db); db.ref("siteConfig").on("value",snap=>{ const d=snap.val(); if(!d)return; applyToSite(d); if(panelOpen&&pinOK)loadMain(); }); } catch(e){console.warn("[Admin] Firebase:",e.message);}
    };
    const pushFB=c=>db?.ref("siteConfig").set({...c,_lastUpdated:Date.now()});

    const applyToSite=config=>{
        const c={...DEFAULTS,...config};
        applySectionLock(c.aboutLocked,LOCK_CONFIG.aboutLocked); applySectionLock(c.projectsLocked,LOCK_CONFIG.projectsLocked); applySectionLock(c.contactLocked,LOCK_CONFIG.contactLocked);
        let ov=$("adminColorOverride"); if(!ov){ov=document.createElement("style");ov.id="adminColorOverride";document.head.appendChild(ov);}
        ov.textContent=`:root{--color-accent:${c.accentColor}!important;--color-secondary:${c.secondaryColor}!important}body.dark-mode{--color-accent:${c.accentColor}!important;--color-secondary:${c.secondaryColor}!important}`;
        document.documentElement.style.setProperty("--color-accent",c.accentColor); document.documentElement.style.setProperty("--color-secondary",c.secondaryColor);
        const sEl=document.querySelector(".hero-status"); if(sEl){const dot=sEl.querySelector(".hero-status-dot");sEl.innerHTML="";if(dot)sEl.appendChild(dot);sEl.appendChild(document.createTextNode(" "+(c.heroStatus||"Online")));}
        const mEl=document.querySelector(".hero-meta-item"); if(mEl)mEl.textContent=c.heroSubtext||DEFAULTS.heroSubtext;
        const fEl=document.querySelector(".footer-note"); if(fEl)fEl.textContent=c.footerNote||DEFAULTS.footerNote;
        document.querySelectorAll(".nav-menu-statusdot").forEach(d=>d.style.background="var(--color-accent)");
        let ban=$("adminMaintenanceBanner");
        if(c.maintenanceMode){if(!ban){ban=document.createElement("div");ban.id="adminMaintenanceBanner";ban.style.cssText="position:fixed;top:0;left:0;right:0;z-index:99998;background:var(--color-accent);color:#fff;text-align:center;padding:8px 16px;font-family:var(--font-mono);font-size:11px;letter-spacing:.1em;text-transform:uppercase;";ban.textContent="\u26a0 Site under maintenance \u2014 some features may be unavailable";document.body.prepend(ban);}}else ban?.remove();
    };

    const logAct=msg=>{ const e={msg,ts:Date.now()}; log.unshift(e); if(log.length>20)log.pop(); db?.ref("adminLog").push(e); renderLog(); };
    const renderLog=()=>{ const el=$("adminActivityLog"); if(!el)return; el.innerHTML=log.slice(0,8).map(e=>`<div class="adm-log-item"><span class="adm-log-time">${new Date(e.ts).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</span><span class="adm-log-msg">${e.msg}</span></div>`).join('')||'<span class="adm-log-empty">No activity yet</span>'; };
    const fetchLog=()=>{ if(!db)return; db.ref("adminLog").orderByChild("ts").limitToLast(20).once("value",snap=>{ const d=snap.val(); if(!d)return; log=Object.values(d).sort((a,b)=>b.ts-a.ts); renderLog(); }); };

    document.addEventListener("keydown",e=>{ if(["INPUT","TEXTAREA"].includes(document.activeElement?.tagName))return; keyBuf.push(e.key.toLowerCase()); if(keyBuf.length>WORD.length)keyBuf.shift(); if(keyBuf.join("")===WORD.join("")){keyBuf=[];openPanel();} });
    let taps=0,tapT=null;
    document.addEventListener("touchend",e=>{ if(!e.target.closest(".main-footer"))return; taps++; clearTimeout(tapT); tapT=setTimeout(()=>taps=0,800); if(taps>=3){taps=0;openPanel();} });

    const openPanel=()=>{ if(panelOpen)return; panelOpen=true; SoundEngine.playAdminOpen(); injectPanel(); requestAnimationFrame(()=>{ $("adminPanel")?.classList.add("adm--visible"); pinOK?showMain():showPin(); }); };
    const closePanel=()=>{ panelOpen=false; resetStage(); const p=$("adminPanel"); if(p){p.classList.remove("adm--visible");setTimeout(()=>p.remove(),500);} };

    const resetStage=()=>{ _stagedSrc=null; _stagedSize=340; FloatingImageSystem.clearCustomSize(); const st=$("admImgStaging"),btn=$("admFunnyBtn"),fi=$("admFunnyFileInput"),lb=$("admLaunchBtn"),sl=$("admImgSizeSlider"),sl2=$("admSizeLabel"),prev=$("admImgPreview"); if(st)st.style.display="none"; if(btn)btn.style.display=""; if(fi)fi.value=""; if(lb){lb.disabled=false;lb.textContent="\uD83D\uDE80 \u00A0Launch Image!";} if(sl)sl.value=340; if(sl2)sl2.textContent="340px"; if(prev)prev.src=""; };

    const showPin=()=>{ $("admPinScreen")?.classList.remove("adm-screen--off"); $("admMainScreen")?.classList.add("adm-screen--off"); pinIn=""; updateDots(); };
    const showMain=()=>{ $("admPinScreen")?.classList.add("adm-screen--off"); $("admMainScreen")?.classList.remove("adm-screen--off"); loadMain(); fetchLog(); };
    const updateDots=()=>document.querySelectorAll(".adm-pin-dot").forEach((d,i)=>d.classList.toggle("adm-pin-dot--on",i<pinIn.length));

    const handlePin=k=>{ if(k==="\u232b"){pinIn=pinIn.slice(0,-1);updateDots();return;} if(pinIn.length>=4)return; pinIn+=k; updateDots(); if(pinIn.length===4){ if(pinIn===PIN){pinOK=true;$("admPinDots")?.classList.add("adm-pin-dots--ok");setTimeout(showMain,380);logAct("Panel unlocked");}else{$("admPinDots")?.classList.add("adm-pin-dots--err");if($("admPinErr"))$("admPinErr").textContent="Incorrect PIN";setTimeout(()=>{$("admPinDots")?.classList.remove("adm-pin-dots--err");if($("admPinErr"))$("admPinErr").textContent="";pinIn="";updateDots();},750);} } };

    const setChk=(id,v)=>{ const e=$(id);if(e)e.checked=!!v; };
    const setVal=(id,v)=>{ const e=$(id);if(e&&v!==undefined)e.value=v; };

    const loadMain=()=>{
        const load=data=>{ const c={...DEFAULTS,...data}; setChk("admLockAbout",c.aboutLocked); setChk("admLockProjects",c.projectsLocked); setChk("admLockContact",c.contactLocked); setChk("admMaintenance",c.maintenanceMode); setVal("admColorAccent",c.accentColor); setVal("admColorSecondary",c.secondaryColor); if($("admAccentHex"))$("admAccentHex").textContent=c.accentColor; if($("admSecHex"))$("admSecHex").textContent=c.secondaryColor; setVal("admHeroStatus",c.heroStatus); setVal("admHeroSub",c.heroSubtext); setVal("admFooterNote",c.footerNote); if(c._lastUpdated){const d=new Date(c._lastUpdated);if($("admStatTime"))$("admStatTime").textContent=d.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});if($("admStatDate"))$("admStatDate").textContent=d.toLocaleDateString([],{month:"short",day:"numeric"});}else if($("admStatDate"))$("admStatDate").textContent=new Date().toLocaleDateString([],{month:"short",day:"numeric"}); };
        if(db){if($("admStatSync"))$("admStatSync").textContent="\u2713 Live";db.ref("siteConfig").once("value").then(snap=>load({...getConf(),...(snap.val()||{})}));}else{if($("admStatSync"))$("admStatSync").textContent="Local";load(getConf());if($("admStatDate"))$("admStatDate").textContent=new Date().toLocaleDateString([],{month:"short",day:"numeric"});}
    };

    const injectPanel=()=>{
        if($("adminPanel"))return;
        if(!$("adminPanelStyles")){
            const s=document.createElement("style"); s.id="adminPanelStyles";
            s.textContent=`#adminPanel{position:fixed;inset:0;z-index:999999;pointer-events:none;font-family:var(--font-mono,'IBM Plex Mono',monospace)}#adminPanel.adm--visible{pointer-events:all}.adm-backdrop{position:absolute;inset:0;background:rgba(0,0,0,0);backdrop-filter:blur(0);-webkit-backdrop-filter:blur(0);transition:all .4s ease}.adm--visible .adm-backdrop{background:rgba(0,0,0,.55);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)}.adm-drawer{position:absolute;bottom:0;left:0;right:0;max-height:92vh;background:var(--color-bg);border-top:3px solid var(--color-accent);border-radius:20px 20px 0 0;box-shadow:0 -24px 80px rgba(0,0,0,.22);transform:translateY(100%);transition:transform .45s cubic-bezier(.22,1,.36,1);display:flex;flex-direction:column;overflow:hidden}.adm--visible .adm-drawer{transform:translateY(0)}@media(min-width:769px){.adm-drawer{left:auto;right:0;top:0;bottom:0;width:480px;max-height:100vh;border-radius:0;border-top:none;border-left:3px solid var(--color-accent);transform:translateX(100%)}.adm--visible .adm-drawer{transform:translateX(0)}}.adm-handle{width:44px;height:5px;background:var(--color-border);border-radius:3px;margin:14px auto 0;flex-shrink:0;cursor:grab}@media(min-width:769px){.adm-handle{display:none}}.adm-screen{display:flex;flex-direction:column;flex:1;overflow:hidden}.adm-screen--off{display:none!important}.adm-mobile-close{display:flex;width:calc(100% - 2.5rem);margin:.75rem 1.25rem 0;padding:13px;background:var(--color-light);border:1px solid var(--color-border);color:var(--color-text);font-family:var(--font-mono);font-size:13px;letter-spacing:.06em;text-transform:uppercase;cursor:pointer;border-radius:8px;align-items:center;justify-content:center;gap:8px;transition:all .2s ease;-webkit-tap-highlight-color:transparent;flex-shrink:0}.adm-mobile-close:active{background:var(--color-accent);color:#fff;border-color:var(--color-accent)}@media(min-width:769px){.adm-mobile-close{display:none}}.adm-pin-wrap{display:flex;flex-direction:column;flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch}.adm-pin-head{text-align:center;padding:2rem 1.5rem .75rem}.adm-pin-icon{width:58px;height:58px;border-radius:50%;background:rgba(193,122,90,.1);border:1px solid rgba(193,122,90,.2);display:flex;align-items:center;justify-content:center;margin:0 auto 1rem;color:var(--color-accent)}.adm-pin-title{font-family:var(--font-display,cursive);font-size:1.6rem;font-weight:400;color:var(--color-text);margin-bottom:.3rem}.adm-pin-sub{font-size:13px;color:var(--color-secondary);letter-spacing:.04em}.adm-pin-dots{display:flex;justify-content:center;gap:18px;padding:1.25rem 1.5rem}.adm-pin-dot{width:15px;height:15px;border-radius:50%;border:2px solid var(--color-border);background:transparent;transition:all .2s cubic-bezier(.34,1.56,.64,1)}.adm-pin-dot--on{background:var(--color-accent);border-color:var(--color-accent);transform:scale(1.12)}.adm-pin-dots--err .adm-pin-dot{border-color:#e05555;background:#e05555;animation:admShake .4s ease}.adm-pin-dots--ok .adm-pin-dot{border-color:var(--color-secondary);background:var(--color-secondary)}@keyframes admShake{0%,100%{transform:translateX(0)}25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}.adm-pin-err{text-align:center;font-size:13px;color:#e05555;letter-spacing:.05em;min-height:18px;margin-bottom:.5rem}.adm-pin-pad{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;padding:0 1.25rem}.adm-key{height:64px;background:var(--color-light);border:1px solid var(--color-border);color:var(--color-text);font-family:var(--font-display,cursive);font-size:1.6rem;cursor:pointer;border-radius:10px;transition:all .15s ease;-webkit-tap-highlight-color:transparent}.adm-key:active{transform:scale(.9);background:var(--color-accent);color:#fff;border-color:var(--color-accent)}@media(min-width:769px){.adm-key:hover{background:var(--color-accent);color:#fff;border-color:var(--color-accent)}}.adm-key--blank{background:transparent;border-color:transparent;pointer-events:none}.adm-pin-cancel{display:block;width:calc(100% - 2.5rem);margin:1rem 1.25rem 1.5rem;padding:13px;background:transparent;border:1px solid var(--color-border);color:var(--color-secondary);font-family:var(--font-mono);font-size:13px;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;border-radius:6px;transition:all .2s ease;-webkit-tap-highlight-color:transparent}.adm-pin-cancel:hover{border-color:var(--color-accent);color:var(--color-accent)}.adm-header{display:flex;justify-content:space-between;align-items:center;padding:1.1rem 1.5rem 1rem;border-bottom:1px solid var(--color-border);flex-shrink:0;background:var(--color-bg);position:sticky;top:0;z-index:2}.adm-header-l{display:flex;align-items:center;gap:10px}.adm-live-dot{width:9px;height:9px;border-radius:50%;background:var(--color-accent);animation:admPulse 2s ease-in-out infinite;flex-shrink:0}@keyframes admPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.7)}}.adm-title{font-family:var(--font-display,cursive);font-size:1.25rem;font-weight:400;color:var(--color-text);letter-spacing:-.01em}.adm-ver{font-size:12px;letter-spacing:.1em;color:var(--color-secondary);opacity:.5}.adm-close{width:34px;height:34px;border-radius:50%;border:1px solid var(--color-border);background:transparent;color:var(--color-secondary);cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;transition:all .2s ease;-webkit-tap-highlight-color:transparent}.adm-close:hover{border-color:var(--color-accent);color:var(--color-accent);background:rgba(193,122,90,.08)}.adm-body{overflow-y:auto;flex:1;-webkit-overflow-scrolling:touch;padding-bottom:calc(1.5rem + env(safe-area-inset-bottom,0))}.adm-sec{padding:1rem 1.5rem;border-bottom:1px solid var(--color-border)}.adm-sec:last-child{border-bottom:none}.adm-sec--danger{background:rgba(224,85,85,.04)}.adm-sec-lbl{font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--color-secondary);opacity:.6;margin-bottom:.875rem}.adm-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.adm-stat{background:var(--color-light);border:1px solid var(--color-border);padding:10px 8px;text-align:center;border-radius:6px}.adm-stat-v{font-family:var(--font-display,cursive);font-size:1rem;color:var(--color-text);margin-bottom:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.adm-stat-l{font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:var(--color-secondary);opacity:.6}.adm-toggles{display:flex;flex-direction:column}.adm-trow{display:flex;justify-content:space-between;align-items:center;padding:11px 0;border-bottom:1px solid var(--color-border);font-size:15px;color:var(--color-text)}.adm-trow:last-child{border-bottom:none}.adm-sw{position:relative;display:inline-flex;align-items:center;cursor:pointer}.adm-sw input{position:absolute;opacity:0;width:0;height:0}.adm-sw-track{width:44px;height:24px;background:var(--color-border);border-radius:12px;position:relative;transition:background .25s ease;border:1px solid var(--color-border)}.adm-sw input:checked+.adm-sw-track{background:var(--color-accent)}.adm-sw-thumb{position:absolute;top:3px;left:3px;width:16px;height:16px;background:#fff;border-radius:50%;box-shadow:0 1px 4px rgba(0,0,0,.15);transition:transform .25s cubic-bezier(.34,1.56,.64,1)}.adm-sw input:checked+.adm-sw-track .adm-sw-thumb{transform:translateX(20px)}.adm-colors{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px}.adm-clr-item{display:flex;flex-direction:column;gap:6px;font-size:12px;color:var(--color-secondary);letter-spacing:.04em;cursor:pointer}.adm-clr-row{display:flex;align-items:center;gap:10px;background:var(--color-light);border:1px solid var(--color-border);border-radius:6px;padding:8px 12px;transition:border-color .2s}.adm-clr-row:hover{border-color:var(--color-accent)}.adm-clr-item input[type=color]{width:28px;height:28px;border:none;border-radius:4px;cursor:pointer;padding:0;background:none;-webkit-appearance:none;flex-shrink:0}.adm-clr-item input[type=color]::-webkit-color-swatch-wrapper{padding:0;border-radius:4px}.adm-clr-item input[type=color]::-webkit-color-swatch{border:none;border-radius:4px}.adm-clr-hex{font-family:var(--font-mono);font-size:12px;color:var(--color-text);letter-spacing:.04em}.adm-field{margin-bottom:10px}.adm-field label{display:block;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--color-secondary);margin-bottom:5px}.adm-input{width:100%;background:var(--color-light);border:1px solid var(--color-border);color:var(--color-text);font-family:var(--font-mono);font-size:14px;padding:10px 12px;border-radius:6px;transition:border-color .2s;-webkit-appearance:none}.adm-input:focus{border-color:var(--color-accent);outline:none}.adm-btn{display:block;width:100%;padding:12px;background:var(--color-accent);color:#fff;border:none;font-family:var(--font-mono);font-size:13px;letter-spacing:.1em;text-transform:uppercase;cursor:pointer;border-radius:6px;transition:all .2s ease;margin-top:6px;-webkit-tap-highlight-color:transparent}.adm-btn:hover{opacity:.85;transform:translateY(-1px)}.adm-btn:active{transform:scale(.98)}.adm-btn--ghost{background:transparent;color:var(--color-secondary);border:1px solid var(--color-border);margin-top:8px}.adm-btn--ghost:hover{border-color:var(--color-accent);color:var(--color-accent)}.adm-btn--danger{background:rgba(224,85,85,.1);color:#e05555;border:1px solid rgba(224,85,85,.2)}.adm-btn--danger:hover{background:#e05555;color:#fff}.adm-funny-btn{display:flex;align-items:center;justify-content:center;gap:10px;width:100%;padding:13px;background:linear-gradient(135deg,rgba(193,122,90,.12),rgba(122,142,126,.08));border:1px dashed var(--color-accent);color:var(--color-text);font-family:var(--font-mono);font-size:13px;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;border-radius:8px;transition:all .2s ease;-webkit-tap-highlight-color:transparent}.adm-funny-btn:hover{background:linear-gradient(135deg,rgba(193,122,90,.22),rgba(122,142,126,.14));transform:translateY(-1px);box-shadow:0 4px 16px rgba(193,122,90,.2)}.adm-funny-btn:active{transform:scale(.97)}.adm-funny-btn .funny-icon{font-size:18px;line-height:1;flex-shrink:0}.adm-clear-images-btn{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;padding:11px;margin-top:10px;background:transparent;border:1px solid rgba(224,85,85,.25);color:#e05555;font-family:var(--font-mono);font-size:12px;letter-spacing:.09em;text-transform:uppercase;cursor:pointer;border-radius:8px;transition:all .2s ease;-webkit-tap-highlight-color:transparent}.adm-clear-images-btn:hover{background:rgba(224,85,85,.08);border-color:#e05555}.adm-clear-images-btn:active{transform:scale(.97)}.adm-img-count{display:inline-block;font-size:10px;letter-spacing:.1em;background:rgba(193,122,90,.12);border:1px solid rgba(193,122,90,.2);color:var(--color-accent);padding:2px 8px;border-radius:12px;margin-left:6px}.adm-img-staging{margin-top:0;padding:12px;background:rgba(193,122,90,.06);border:1px solid rgba(193,122,90,.18);border-radius:8px;animation:admStageFadeIn .3s ease both}@keyframes admStageFadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}.adm-img-staging .adm-btn{margin-top:0!important}.adm-range-input{-webkit-appearance:none;appearance:none;width:100%;height:4px;background:var(--color-border);border-radius:2px;outline:none;cursor:pointer;margin-top:6px}.adm-range-input::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:18px;height:18px;border-radius:50%;background:var(--color-accent);cursor:pointer;box-shadow:0 2px 6px rgba(0,0,0,.2);transition:transform .15s ease}.adm-range-input::-webkit-slider-thumb:hover{transform:scale(1.2)}.adm-range-input::-moz-range-thumb{width:18px;height:18px;border-radius:50%;background:var(--color-accent);cursor:pointer;border:none;box-shadow:0 2px 6px rgba(0,0,0,.2)}.adm-log{max-height:160px;overflow-y:auto;-webkit-overflow-scrolling:touch}.adm-log-item{display:flex;gap:10px;align-items:baseline;padding:6px 0;border-bottom:1px solid var(--color-border);font-size:12px}.adm-log-item:last-child{border-bottom:none}.adm-log-time{color:var(--color-accent);flex-shrink:0;opacity:.75}.adm-log-msg{color:var(--color-text);opacity:.7}.adm-log-empty{font-size:12px;color:var(--color-secondary);opacity:.5;padding:6px 0;display:block}body.dark-mode .adm-key{background:rgba(255,255,255,.05);border-color:rgba(255,255,255,.07)}body.dark-mode .adm-stat{background:rgba(255,255,255,.04)}body.dark-mode .adm-input{background:rgba(255,255,255,.05)}body.dark-mode .adm-mobile-close{background:rgba(255,255,255,.05)}body.dark-mode .adm-img-staging{background:rgba(193,122,90,.08);border-color:rgba(193,122,90,.22)}#admFunnyFileInput{position:absolute;opacity:0;pointer-events:none;width:0;height:0}`;
            document.head.appendChild(s);
        }
        const el=document.createElement("div"); el.id="adminPanel";
        el.innerHTML=`<div class="adm-backdrop" id="admBackdrop"></div><div class="adm-drawer" id="admDrawer"><div class="adm-handle" id="admHandle"></div><div class="adm-screen" id="admPinScreen"><button class="adm-mobile-close" id="admPinMobileClose">&#x2715; &nbsp;Close</button><div class="adm-pin-wrap"><div class="adm-pin-head"><div class="adm-pin-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></div><h2 class="adm-pin-title">Admin Access</h2><p class="adm-pin-sub">Enter PIN to continue</p></div><div class="adm-pin-dots" id="admPinDots"><div class="adm-pin-dot"></div><div class="adm-pin-dot"></div><div class="adm-pin-dot"></div><div class="adm-pin-dot"></div></div><div class="adm-pin-err" id="admPinErr"></div><div class="adm-pin-pad">${[1,2,3,4,5,6,7,8,9,"",0,"\u232b"].map(k=>`<button class="adm-key ${k===''?'adm-key--blank':''}" data-k="${k}">${k}</button>`).join("")}</div><button class="adm-pin-cancel" id="admPinCancel">Cancel</button></div></div><div class="adm-screen adm-screen--off" id="admMainScreen"><button class="adm-mobile-close" id="admMainMobileClose">&#x2715; &nbsp;Close Panel</button><div class="adm-header"><div class="adm-header-l"><div class="adm-live-dot"></div><span class="adm-title">Control Panel</span></div><div style="display:flex;align-items:center;gap:10px"><span class="adm-ver">AJ / 2026</span><button class="adm-close" id="admClose">&#x2715;</button></div></div><div class="adm-body"><div class="adm-sec"><div class="adm-sec-lbl">Site Status</div><div class="adm-stats"><div class="adm-stat"><div class="adm-stat-v" id="admStatSync">&#x2014;</div><div class="adm-stat-l">Firebase</div></div><div class="adm-stat"><div class="adm-stat-v" id="admStatTime">&#x2014;</div><div class="adm-stat-l">Last Edit</div></div><div class="adm-stat"><div class="adm-stat-v" id="admStatDate">&#x2014;</div><div class="adm-stat-l">Date</div></div></div></div><div class="adm-sec"><div class="adm-sec-lbl">Section Locks</div><div class="adm-toggles"><div class="adm-trow"><span>About</span><label class="adm-sw"><input type="checkbox" id="admLockAbout"><span class="adm-sw-track"><span class="adm-sw-thumb"></span></span></label></div><div class="adm-trow"><span>Projects</span><label class="adm-sw"><input type="checkbox" id="admLockProjects"><span class="adm-sw-track"><span class="adm-sw-thumb"></span></span></label></div><div class="adm-trow"><span>Contact</span><label class="adm-sw"><input type="checkbox" id="admLockContact"><span class="adm-sw-track"><span class="adm-sw-thumb"></span></span></label></div><div class="adm-trow"><span>Maintenance Banner</span><label class="adm-sw"><input type="checkbox" id="admMaintenance"><span class="adm-sw-track"><span class="adm-sw-thumb"></span></span></label></div></div></div><div class="adm-sec"><div class="adm-sec-lbl">Theme Colors</div><div class="adm-colors"><label class="adm-clr-item"><span>Accent</span><div class="adm-clr-row"><input type="color" id="admColorAccent" value="#c17a5a"><span class="adm-clr-hex" id="admAccentHex">#c17a5a</span></div></label><label class="adm-clr-item"><span>Secondary</span><div class="adm-clr-row"><input type="color" id="admColorSecondary" value="#7a8e7e"><span class="adm-clr-hex" id="admSecHex">#7a8e7e</span></div></label></div><button class="adm-btn adm-btn--ghost" id="admResetColors">Reset Colors</button></div><div class="adm-sec"><div class="adm-sec-lbl">Hero &amp; Footer Text</div><div class="adm-field"><label>Status Label</label><input class="adm-input" id="admHeroStatus" type="text" maxlength="30" placeholder="Online"></div><div class="adm-field"><label>Subtext</label><input class="adm-input" id="admHeroSub" type="text" maxlength="60" placeholder="Currently, working on project"></div><div class="adm-field"><label>Footer Note</label><input class="adm-input" id="admFooterNote" type="text" maxlength="80" placeholder="Designed &amp; developed with care."></div><button class="adm-btn" id="admSaveText">Save Text</button></div><div class="adm-sec"><div class="adm-sec-lbl">Floating Images</div><input type="file" id="admFunnyFileInput" accept="image/*"/><button class="adm-funny-btn" id="admFunnyBtn"><span class="funny-icon">&#x1F4F8;</span><span class="adm-funny-label">Select Image</span></button><div class="adm-img-staging" id="admImgStaging" style="display:none"><img id="admImgPreview" src="" alt="Preview" style="width:100%;border-radius:8px;display:block;margin-bottom:12px;max-height:200px;object-fit:contain;background:var(--color-light);border:1px solid var(--color-border);"/><div class="adm-field" style="margin-bottom:14px"><label style="display:flex;justify-content:space-between;align-items:center;"><span>Image Size</span><span id="admSizeLabel" style="color:var(--color-accent);font-weight:700;">340px</span></label><input type="range" id="admImgSizeSlider" min="80" max="700" value="340" step="10" class="adm-range-input" style="margin-top:8px;"/><div style="display:flex;justify-content:space-between;font-size:10px;color:var(--color-secondary);opacity:.5;margin-top:4px;letter-spacing:.06em;"><span>80px — tiny</span><span>700px — huge</span></div></div><button class="adm-btn" id="admLaunchBtn">&#x1F680; &nbsp;Launch Image!</button><button class="adm-btn adm-btn--ghost" id="admCancelStaging">&#x2715; &nbsp;Cancel</button></div><button class="adm-clear-images-btn" id="admClearImages" style="margin-top:12px">&#x2715; &nbsp;Clear All Images<span class="adm-img-count" id="admImgCount" style="display:none">0</span></button><p style="font-size:11px;color:var(--color-secondary);opacity:.5;margin-top:10px;text-align:center;letter-spacing:.04em;">Select an image, adjust size, then launch &#x2014; grab &amp; toss it around!</p></div><div class="adm-sec"><div class="adm-sec-lbl">Recent Activity</div><div class="adm-log" id="adminActivityLog"><span class="adm-log-empty">Loading...</span></div></div><div class="adm-sec adm-sec--danger"><div class="adm-sec-lbl">Danger Zone</div><button class="adm-btn adm-btn--danger" id="admResetAll">Reset All Settings</button><button class="adm-btn adm-btn--ghost" id="admLockPanel">Lock Panel</button></div></div></div></div>`;
        document.body.appendChild(el);
        bindEvents();
    };

    const bindEvents=()=>{
        $("admBackdrop")?.addEventListener("click",closePanel); $("admClose")?.addEventListener("click",closePanel);
        $("admPinCancel")?.addEventListener("click",closePanel); $("admPinMobileClose")?.addEventListener("click",closePanel);
        $("admMainMobileClose")?.addEventListener("click",closePanel);
        $("admLockPanel")?.addEventListener("click",()=>{ pinOK=false; showPin(); });
        document.querySelectorAll(".adm-key:not(.adm-key--blank)").forEach(b=>b.addEventListener("click",()=>handlePin(b.dataset.k)));

        const toggleMap={admLockAbout:"aboutLocked",admLockProjects:"projectsLocked",admLockContact:"contactLocked",admMaintenance:"maintenanceMode"};
        Object.entries(toggleMap).forEach(([id,k])=>$(id)?.addEventListener("change",e=>saveConf({[k]:e.target.checked})));

        const mkColorBind=(inputId,hexId,otherInputId,cssVar)=>{
            let t=null;
            const getOther=()=>$(otherInputId)?.value;
            $(inputId)?.addEventListener("input",e=>{ document.documentElement.style.setProperty(cssVar,e.target.value); if($(hexId))$(hexId).textContent=e.target.value; clearTimeout(t); t=setTimeout(()=>saveConf({[inputId==="admColorAccent"?"accentColor":"secondaryColor"]:e.target.value}),300); });
            $(inputId)?.addEventListener("change",e=>{ document.documentElement.style.setProperty(cssVar,e.target.value); if($(hexId))$(hexId).textContent=e.target.value; clearTimeout(t); saveConf({[inputId==="admColorAccent"?"accentColor":"secondaryColor"]:e.target.value}); });
        };
        mkColorBind("admColorAccent","admAccentHex","admColorSecondary","--color-accent");
        mkColorBind("admColorSecondary","admSecHex","admColorAccent","--color-secondary");

        $("admResetColors")?.addEventListener("click",()=>{ saveConf({accentColor:DEFAULTS.accentColor,secondaryColor:DEFAULTS.secondaryColor}); setVal("admColorAccent",DEFAULTS.accentColor); setVal("admColorSecondary",DEFAULTS.secondaryColor); if($("admAccentHex"))$("admAccentHex").textContent=DEFAULTS.accentColor; if($("admSecHex"))$("admSecHex").textContent=DEFAULTS.secondaryColor; });
        $("admSaveText")?.addEventListener("click",()=>{ saveConf({heroStatus:$("admHeroStatus")?.value||DEFAULTS.heroStatus,heroSubtext:$("admHeroSub")?.value||DEFAULTS.heroSubtext,footerNote:$("admFooterNote")?.value||DEFAULTS.footerNote}); const b=$("admSaveText"); if(b){const o=b.textContent;b.textContent="Saved \u2713";b.style.background="var(--color-secondary)";setTimeout(()=>{b.textContent=o;b.style.background="";},1500);} });

        const funnyBtn=$("admFunnyBtn"),fi=$("admFunnyFileInput"),staging=$("admImgStaging"),prev=$("admImgPreview"),slider=$("admImgSizeSlider"),slLabel=$("admSizeLabel"),launchBtn=$("admLaunchBtn"),cancelBtn=$("admCancelStaging"),imgCount=$("admImgCount");
        let cnt=0;
        const updCnt=n=>{ cnt=Math.max(0,n); if(imgCount){imgCount.textContent=String(cnt);imgCount.style.display=cnt>0?"inline-block":"none";} };
        if(db)db.ref("funnyImages").on("value",snap=>updCnt(snap.numChildren?snap.numChildren():0));

        funnyBtn?.addEventListener("click",()=>{ fi.value=""; fi.click(); });
        fi?.addEventListener("change",e=>{ const f=e.target.files?.[0]; if(!f)return; const r=new FileReader(); r.onload=ev=>{ _stagedSrc=ev.target.result; if(prev)prev.src=_stagedSrc; if(slider)slider.value=340; if(slLabel)slLabel.textContent="340px"; _stagedSize=340; if(launchBtn){launchBtn.disabled=false;launchBtn.textContent="\uD83D\uDE80 \u00A0Launch Image!";} if(staging)staging.style.display="block"; if(funnyBtn)funnyBtn.style.display="none"; setTimeout(()=>staging?.scrollIntoView({behavior:"smooth",block:"nearest"}),60); }; r.onerror=()=>resetStage(); r.readAsDataURL(f); });
        slider?.addEventListener("input",e=>{ _stagedSize=parseInt(e.target.value,10); if(slLabel)slLabel.textContent=`${_stagedSize}px`; });
        launchBtn?.addEventListener("click",async()=>{ if(!_stagedSrc)return; const src=_stagedSrc,sz=_stagedSize; launchBtn.disabled=true; launchBtn.textContent="Launching... \uD83D\uDE80"; try{await FloatingImageSystem.add(src,sz);if(!db)updCnt(cnt+1);logAct(`Floating image launched (${sz}px) \uD83D\uDE80`);}catch(e){console.warn("[Admin] Launch failed:",e);} resetStage(); });
        cancelBtn?.addEventListener("click",resetStage);
        $("admClearImages")?.addEventListener("click",()=>{ FloatingImageSystem.clearAll(); if(!db)updCnt(0); logAct("Cleared all floating images"); const b=$("admClearImages"); if(b){const o=b.innerHTML;b.innerHTML="\u2713 &nbsp;Cleared!";b.style.color="var(--color-secondary)";setTimeout(()=>{b.innerHTML=o;b.style.color="";},1500);} });
        $("admResetAll")?.addEventListener("click",()=>{ if(!confirm("Reset all settings to defaults?"))return; localStorage.removeItem("siteConfig"); pushFB({...DEFAULTS,_lastUpdated:Date.now()}); applyToSite(DEFAULTS); loadMain(); SoundEngine.resetAdminSoundGuard(); logAct("Reset all settings to defaults"); });

        const drawer=$("admDrawer"), handle=$("admHandle");
        if(drawer&&handle){ let sy=0,cy=0,drag=false; handle.addEventListener("touchstart",e=>{sy=e.touches[0].clientY;drag=true;drawer.style.transition="none";},{passive:true}); document.addEventListener("touchmove",e=>{if(!drag)return;cy=e.touches[0].clientY;drawer.style.transform=`translateY(${Math.max(0,cy-sy)}px)`;},{passive:true}); document.addEventListener("touchend",()=>{if(!drag)return;drag=false;drawer.style.transition="";cy-sy>120?closePanel():drawer.style.transform="";}); }
    };

    initFB();
    const saved=getConf(); if(Object.keys(saved).length>0)applyToSite(saved);
}