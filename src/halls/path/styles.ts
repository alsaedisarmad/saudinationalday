/** أنماط «طريق الحكاية». الألوان والخطوط من المتغيّرات المحقونة؛ الوضع بحسب [data-mode]. */
export const css = `
.path{position:absolute;inset:0;overflow:clip;--ground:.685;color:var(--museum-white)}
.path__canvas{position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none;animation:pathIn 1.6s var(--ease-cine) both}
@keyframes pathIn{from{opacity:0}to{opacity:1}}
.path__kicker{position:absolute;z-index:4;inset-inline:0;top:calc(var(--s3) + var(--target) * .5 - .7em);text-align:center;pointer-events:none;letter-spacing:.14em;text-shadow:0 1px 12px rgba(20,10,12,.7)}
.path__vp{position:absolute;inset:0;z-index:3;touch-action:pan-y;cursor:grab;user-select:none;-webkit-user-select:none}
.path__vp:active{cursor:grabbing}
.pt{list-style:none;margin:0;padding:0;position:absolute;inset:0}
.pt__item{position:absolute;inset:0;will-change:transform,opacity}
.path__marks{position:absolute;inset:0;z-index:2;pointer-events:none}
.mk{position:absolute;left:50%;line-height:1;top:calc(var(--ty,74%) + 1.55rem);font-family:var(--font-display);font-size:1.2rem;color:var(--sand);opacity:.72;white-space:nowrap;will-change:transform;text-shadow:0 1px 8px rgba(0,0,0,.6)}
.mk.is-cur{color:#FFD58A;opacity:1;font-size:1.55rem}
.path__scenenote{position:absolute;z-index:4;inset-inline-end:var(--s3);bottom:var(--s2);opacity:.55;pointer-events:none;font-size:.62rem}

/* بطاقة المحطة */
.pc{position:absolute;inset:0 0 auto 0;height:calc(var(--ground) * 100%);padding:calc(var(--target) + var(--s4)) 6vw var(--s2);display:grid;grid-template-columns:minmax(0,1.12fr) minmax(0,.88fr);gap:5vw;align-content:start;align-items:start;outline-offset:-8px}
.pc__text{display:grid;gap:.5em;justify-items:start;align-content:center;min-width:0}
.pc__h{display:grid;gap:.18em;margin:0}
.pc__year{white-space:nowrap;padding-bottom:.02em;font-family:var(--font-display);font-weight:400;font-size:clamp(4.2rem,15.5vmin,13rem);line-height:.95;color:#FFE7B8;text-shadow:0 2px 0 rgba(20,10,10,.4),0 0 70px rgba(255,180,100,.4);letter-spacing:-.01em}
.pc__unit{font-size:.36em;margin-inline-start:.1em;letter-spacing:0;opacity:.9}
.pc__year.is-long{font-size:clamp(3rem,min(10.5vmin,7.2vw),8.6rem)}
.pc__title{font-size:clamp(1.8rem,4vmin,3.6rem);text-wrap:balance;color:var(--museum-white);text-shadow:0 2px 24px rgba(15,8,10,.7)}
.pc__dates{display:flex;flex-wrap:wrap;align-items:center;gap:.25em .9em;color:var(--sand)}
.pc__date{font-size:.86rem;letter-spacing:.02em}
.pc__side{color:#FFD58A;border:1px solid rgba(255,213,138,.55);padding:.05em .8em;font-size:.86rem}
.tri{width:9rem;height:.7rem;fill:none;stroke:var(--gold);stroke-width:1.1;opacity:.75;overflow:visible}
.pc__body{max-width:32em;color:var(--museum-white);text-shadow:0 1px 16px rgba(15,8,10,.85);font-size:.94rem;line-height:1.8}
.pc__actions{display:flex;align-items:center;flex-wrap:wrap;gap:var(--s2);margin-top:.3em}
.pc__more{min-height:var(--target);padding-inline:calc(var(--u) * 5);font-size:1rem;color:#FFD58A;border-color:rgba(255,213,138,.7);background:rgba(20,12,14,.72)}
.pc__fig{margin:0;display:grid;gap:.55em;justify-items:center;align-self:start;min-width:0}
.pc__frame{border:1px solid rgba(255,213,138,.6);padding:.45rem;background:rgba(20,12,14,.6);box-shadow:0 30px 60px -20px rgba(10,5,8,.7);max-width:100%}
.pc__frame img{display:block;max-width:100%;max-height:min(33vh,28rem);width:auto;height:auto;object-fit:cover;filter:saturate(.92) contrast(1.02)}
.pc__cap{display:grid;gap:.1em;text-align:center;max-width:30em}
.pc__capt{color:var(--museum-white);opacity:.92;font-size:.78rem}
.pc__credit{color:var(--sand);opacity:.9;font-size:.64rem}

/* شريط التحكم: السابق · عمود التقدّم · التالي */
.path__bar{position:absolute;z-index:6;inset-inline:5vw;bottom:calc(var(--s3) + var(--s3) + 10px);display:flex;align-items:flex-end;gap:var(--s3)}
.path__nav{flex:0 0 auto;background:rgba(20,12,14,.7);border-color:rgba(255,213,138,.5);color:#FFD58A;width:calc(var(--target) * 1.15);min-height:calc(var(--target) * 1.15)}
.path__nav[aria-disabled=true]{opacity:.3}
.sp{position:relative;flex:1;min-width:0}
.sp__eras{display:flex;align-items:flex-end}
.sp__era{display:grid;justify-items:stretch;min-width:0}
.sp__era + .sp__era{border-inline-start:1px solid rgba(216,195,160,.28)}
.sp__eraName{text-align:center;font-size:.72rem;color:var(--sand);opacity:.7;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding-inline:.4em;line-height:1.6}
.sp__era.is-cur .sp__eraName{color:#FFD58A;opacity:1}
.sp__ticks{display:flex}
.sp__tick{flex:1 1 0;min-width:0;min-height:var(--target);display:grid;place-items:center;position:relative;z-index:1}
.sp__tick i{display:block;width:13px;height:13px;transform:rotate(45deg);border:1.5px solid rgba(255,213,138,.75);background:#170e0f;transition:all 300ms var(--ease-cine)}
.sp__tick.is-past i{background:rgba(255,213,138,.55)}
.sp__tick.is-seen i{border-color:#FFE7B8}
.sp__tick.is-cur i{background:#FFD58A;transform:rotate(45deg) scale(1.55);box-shadow:0 0 16px rgba(255,213,138,.85)}
.sp__rail{position:absolute;inset-inline:calc(50% / var(--n));bottom:calc(var(--target) / 2);height:2px;background:rgba(255,213,138,.28);pointer-events:none}
.sp__fill{position:absolute;inset:0;background:#FFD58A;box-shadow:0 0 10px rgba(255,213,138,.7);transform-origin:100% 50%;transform:scaleX(var(--prog))}
.sp--compact{flex:1;display:flex;align-items:center;gap:var(--s2);min-height:var(--target)}
.sp--compact .sp__rail{position:relative;inset:auto;flex:1;bottom:auto}
.sp__era.label,.sp--compact .sp__era{color:var(--sand)}
.sp--compact .sp__count{white-space:nowrap}

/* تخطيط الجهاز اللوحي العمودي والشاشات الضيقة */
@media (max-width:1000px){
  .pc{grid-template-columns:1fr;gap:var(--s2);align-content:start;padding-top:calc(var(--target) * 2 + var(--s2))}
  .pc__year{font-size:clamp(3.4rem,11vmin,8rem)}
  .pc__year.is-long{font-size:clamp(2.8rem,8vmin,6rem)}
  .pc__title{font-size:clamp(1.6rem,3.6vmin,3rem)}
  .pc__frame img{max-height:16vh}
  .pc__fig{justify-items:start}
}

/* الهاتف: تمرير عمودي بين محطات ملء الشاشة */
.pv{position:absolute;inset:0;z-index:3;overflow-y:auto;overflow-x:hidden;scroll-snap-type:y mandatory;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;scrollbar-width:none}
.pv::-webkit-scrollbar{display:none}
.pv__list{list-style:none;margin:0;padding:0}
.pv__item{height:var(--H,100dvh);scroll-snap-align:start;scroll-snap-stop:always;position:relative}
[data-mode=mobile] .path{--ground:.8}
[data-mode=mobile] .pc{grid-template-columns:1fr;gap:var(--s2);padding:calc(var(--target) + var(--s3)) var(--s3) 0;align-content:start;height:calc(var(--ground) * 100%)}
[data-mode=mobile] .pc__year{font-size:clamp(3.4rem,12.5dvh,6rem)}
[data-mode=mobile] .pc__year.is-long{font-size:clamp(2.6rem,9dvh,4.2rem)}
[data-mode=mobile] .pc__title{font-size:clamp(1.5rem,3.6dvh,2.1rem)}
[data-mode=mobile] .pc__body{font-size:.98rem;line-height:1.7}
[data-mode=mobile] .pc__frame img{max-height:15dvh}
[data-mode=mobile] .pc__more{min-height:var(--target);padding-inline:var(--s4)}
[data-mode=mobile] .tri{width:6rem}
[data-mode=mobile] .path__bar{inset-inline:var(--s2);bottom:calc(var(--s2) + 34px);align-items:center;gap:var(--s2)}
[data-mode=mobile] .path__nav{width:var(--target);min-height:var(--target)}
[data-mode=mobile] .path__scenenote{display:none}
[data-mode=mobile] .path__kicker{display:none}
@media (max-height:700px){[data-mode=mobile] .pc__fig{display:none}}
@media (max-width:1100px){.path__kicker{display:none}}
@media (prefers-reduced-motion:reduce){.path__canvas{animation:none}}
`
