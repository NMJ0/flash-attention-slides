"use strict";
/* Shared helpers for anim/ pages: seeded RNG, small matrix maths, a matrix
   renderer with hover-to-explain, and key forwarding to the parent deck. */

function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function makeRandn(seed){const r=mulberry32(seed);return()=>{let u=0,v=0;while(u===0)u=r();while(v===0)v=r();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v);};}
const matmul=(A,B)=>A.map(row=>B[0].map((_,j)=>row.reduce((s,a,k)=>s+a*B[k][j],0)));
const T=A=>A[0].map((_,j)=>A.map(r=>r[j]));
const mapM=(A,f)=>A.map((r,i)=>r.map((v,j)=>f(v,i,j)));
function softmaxRow(r){const m=Math.max(...r);const e=r.map(x=>x===-Infinity?0:Math.exp(x-m));const s=e.reduce((a,b)=>a+b,0);return e.map(x=>x/s);}
function fmt(v,d=2){if(v===-Infinity)return"−∞";if(v===Infinity)return"∞";let s=v.toFixed(d);if(/^-0\.0*$/.test(s))s=s.slice(1);return s.replace("-","−");}
const $=s=>document.querySelector(s);
const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
function el(tag,cls,html){const e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e;}
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

/* Matrix figure. o: {name, kind, rl, cl, prob, active, cellClass(i,j)} */
function matEl(M,o={}){
  const R=M.length,Cn=M[0].length;
  const fig=el("figure","mat"+(o.kind?" k-"+o.kind:""));
  fig.appendChild(el("div","",`<span class="nm">${o.name}</span><span class="shape">[${R} × ${Cn}]</span>`));
  const g=el("div","grid");
  g.style.gridTemplateColumns=`auto repeat(${Cn}, auto)`;
  let scale=0;for(const r of M)for(const v of r)if(isFinite(v))scale=Math.max(scale,Math.abs(v));
  if(o.prob)scale=1;if(!scale)scale=1;
  const rl=o.rl||M.map((_,i)=>i),cl=o.cl||M[0].map((_,j)=>j);
  g.appendChild(el("div","cl",""));
  cl.forEach(c=>g.appendChild(el("div","cl",esc(c))));
  M.forEach((row,i)=>{
    g.appendChild(el("div","rl",esc(rl[i])));
    row.forEach((v,j)=>{
      const c=el("div","cell",fmt(v));c.dataset.r=i;c.dataset.c=j;
      if(v===-Infinity)c.classList.add("inf");
      else{
        const a=Math.min(1,Math.abs(v)/scale),pct=Math.round(a*(o.prob?85:75));
        const col=o.prob?"var(--kc)":(v>=0?"var(--pos)":"var(--neg)");
        c.style.background=`color-mix(in srgb, ${col} ${pct}%, var(--cell))`;
        if(pct>52)c.classList.add("strong");
      }
      if(o.cellClass){const x=o.cellClass(i,j);if(x)c.className+=" "+x;}
      if(o.active){c.classList.add("act");c.tabIndex=0;}
      g.appendChild(c);
    });
  });
  fig.appendChild(g);
  return fig;
}
const cellsOf=f=>$$(".cell",f);
function clearHL(root){$$(".cell.sel,.cell.hl",root).forEach(c=>c.classList.remove("sel","hl"));}
function bindActive(fig,fn){
  const h=e=>{const c=e.target.closest(".cell");if(!c||!fig.contains(c))return;fn(+c.dataset.r,+c.dataset.c);};
  fig.addEventListener("mouseover",h);fig.addEventListener("focusin",h);fig.addEventListener("click",h);
}

/* Key forwarding: arrow keys, space and page keys move the deck even when
   the iframe has focus. Falls back to postMessage when the parent is
   cross-origin (e.g. opened from file://). */
(function(){
  if(window.parent===window)return;
  const map={ArrowRight:"right",ArrowLeft:"left",ArrowDown:"down",ArrowUp:"up",PageDown:"next",PageUp:"prev"," ":"next"};
  window.addEventListener("keydown",e=>{
    const m=map[e.key];if(!m)return;
    if(e.key===" "&&e.target.tagName==="BUTTON")return;
    e.preventDefault();
    try{window.parent.Reveal[m]();}
    catch(_){window.parent.postMessage(JSON.stringify({method:m,args:[]}),"*");}
  });
})();

/* Open a page part-way through: anim.html#s=3 presses the step button 3 times. */
function autoStep(btn){const m=location.hash.match(/s=(\d+)/);if(m)for(let i=0;i<+m[1];i++)btn.click();}
