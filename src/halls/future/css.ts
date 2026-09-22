/** أنماط قاعة «نحو المستقبل» — ليل نجوم بأخضر خافت وذهب دافئ (لا نيون): الحدود شعرية، الزوايا حادة، والضوء من نقاط لا من صناديق */
export const css = `
.fut{--g:#8FD0A9;--au:#E7B04A;position:absolute;inset:0;overflow:hidden}
.fut::before{content:'';position:absolute;inset:0;pointer-events:none;z-index:1;background:radial-gradient(ellipse at 38% 46%,transparent 28%,rgba(2,7,12,.58) 100%)}
.fut__sky{position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none;z-index:0}
.fut__body{position:absolute;inset:0;z-index:2;display:grid;grid-template-columns:minmax(21rem,35%) minmax(0,1fr);grid-template-rows:minmax(0,1fr);gap:var(--s4);padding:calc(var(--target) + var(--s6)) var(--s4) calc(var(--s8) + var(--s6))}

/* ——— المسرح: الخريطة + الكوكبات ——— */
.fut__stage{position:relative;min-height:0;min-width:0;display:flex;flex-direction:column}
.fut__fit{position:relative;flex:1 1 0;min-height:0;min-width:0}
.fut__frame{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%)}
.fut__svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible;pointer-events:none}
.fmap__r{fill:rgba(15,54,54,.5);stroke:rgba(143,208,169,.17);stroke-width:calc(1px * var(--k));stroke-linejoin:round;transition:fill 700ms var(--ease-cine),stroke 700ms var(--ease-cine)}
.fmap__r.has{fill:rgba(26,72,60,.72)}
.fmap__r.is-lit{fill:rgba(64,124,92,.42);stroke:rgba(231,176,74,.55)}
.fmap__line,.fmap__glow{fill:none;stroke-linejoin:round;stroke-dasharray:1;animation:fdraw 3.2s .2s var(--ease-cine) backwards}
.fmap__line{stroke:#8FD0A9;stroke-opacity:.8;stroke-width:calc(1.5px * var(--k))}
.fmap__glow{stroke:rgba(143,208,169,.16);stroke-width:calc(10px * var(--k))}
@keyframes fdraw{from{stroke-dashoffset:1}to{stroke-dashoffset:0}}

.fchain{fill:none;stroke:rgba(143,208,169,.32);stroke-width:calc(1.3px * var(--k));stroke-dasharray:calc(2px * var(--k)) calc(9px * var(--k));stroke-linecap:round}
.fthread{fill:none;stroke-dasharray:1;stroke-dashoffset:1;transition:stroke-dashoffset 1100ms var(--ease-cine) var(--d,0ms)}
.fthread.is-on{stroke-dashoffset:0}
.fthread--wide{stroke:rgba(143,208,169,.17);stroke-width:calc(8px * var(--k))}
.fthread--core{stroke:#c6ecd6;stroke-width:calc(1.7px * var(--k))}
.fthread--gold.fthread--wide{stroke:rgba(231,176,74,.15)}
.fthread--gold.fthread--core{stroke:#f2c96f;stroke-width:calc(1.4px * var(--k))}

/* ——— النجوم (أزرار DOM بهدف لمسي كامل، فوق الرسم) ——— */
.fstar{position:absolute;transform:translate(-50%,-50%);width:var(--target);height:var(--target);display:grid;place-items:center;border-radius:50%;color:var(--au);cursor:pointer;z-index:3;animation:fignite 1s var(--ease-cine) backwards;animation-delay:calc(var(--i,0) * 160ms + 900ms)}
.fstar::before{content:'';position:absolute;inset:6%;border-radius:50%;background:radial-gradient(circle,currentColor 0,transparent 66%);opacity:.2;transition:opacity 500ms var(--ease-cine)}
.fstar__g{position:relative;width:calc(var(--target) * .42);height:calc(var(--target) * .42);overflow:visible;transition:transform 500ms var(--ease-cine),filter 500ms var(--ease-cine),opacity 500ms}
.fstar--project .fstar__g,.fstar--head:not(.is-on) .fstar__g{animation:fbreathe 5s ease-in-out infinite;animation-delay:calc(var(--i,0) * -900ms)}
@keyframes fbreathe{0%,100%{transform:scale(1);opacity:.9}50%{transform:scale(1.16);opacity:1}}
@keyframes fignite{from{opacity:0;transform:translate(-50%,-50%) scale(.3)}}
.fstar--project{color:var(--au)}
.fstar--milestone{color:var(--starlight)}
.fstar--head{color:var(--g)}
.fstar--head .fstar__g{width:calc(var(--target) * .62);height:calc(var(--target) * .62)}
.fstar--theme{color:var(--g);opacity:.62;transition:opacity 500ms var(--ease-cine)}
.fstar--theme .fstar__g{width:calc(var(--target) * .34);height:calc(var(--target) * .34)}
.fstar--theme.is-on{opacity:1}
.fstar--origin{color:#fff0c8}
.fstar--origin .fstar__g{width:calc(var(--target) * .56);height:calc(var(--target) * .56);animation:fbreathe 6s ease-in-out infinite}
.fstar--head.is-on .fstar__g,.fstar--theme.is-on .fstar__g{filter:drop-shadow(0 0 9px currentColor)}
.fstar--head.is-on::before,.fstar--project.is-lit::before,.fstar--theme.is-on::before{opacity:.5}
.fstar--project.is-lit .fstar__g{filter:drop-shadow(0 0 12px var(--au));transform:scale(1.3)}
.fstar.is-dim{opacity:.34}
.fstar.is-seen .fstar__g{filter:drop-shadow(0 0 5px currentColor)}
@media (hover:hover){.fstar:hover::before{opacity:.5}.fstar:hover .fstar__g{transform:scale(1.22)}}
.fstar:active .fstar__g{transform:scale(.92)}
.fstar:focus-visible{outline-offset:-4px}

.fstar__label{position:absolute;display:flex;flex-direction:column;line-height:1.25;white-space:nowrap;text-shadow:0 0 10px rgba(3,10,12,.95),0 0 3px rgba(3,10,12,.95);transition:opacity 500ms var(--ease-cine)}
.fstar__label strong{font-family:var(--font-display);font-weight:700;font-size:1.02rem;color:var(--museum-white)}
.fstar__label small{font-size:.7rem;color:var(--sand);opacity:.9}
.fstar__label--r{left:calc(50% + var(--target) * .3);top:50%;transform:translateY(-50%);text-align:left;align-items:flex-start}
.fstar__label--l{right:calc(50% + var(--target) * .3);top:50%;transform:translateY(-50%);text-align:right;align-items:flex-end}
.fstar__label--t{bottom:calc(50% + var(--target) * .28);left:50%;transform:translateX(-50%);text-align:center;align-items:center}
.fstar__label--b{top:calc(50% + var(--target) * .28);left:50%;transform:translateX(-50%);text-align:center;align-items:center}
.fstar--theme .fstar__label{font-family:var(--font-display);font-weight:700;font-size:.96rem;color:#d9f0e2;opacity:0}
.fstar--theme.is-on .fstar__label,.fstar--theme:focus-visible .fstar__label{opacity:1}
.fstar--head .fstar__label strong{font-size:1.18rem;color:#d9f0e2}
.fstar--origin .fstar__label strong{font-size:1.5rem;color:#fff0c8;line-height:1}
.fstar--milestone .fstar__label strong{color:var(--starlight)}

.fut__creative{position:absolute;left:50%;top:0;transform:translateX(-50%);display:flex;align-items:center;gap:.6em;margin:0;white-space:nowrap;pointer-events:none;z-index:2}
.fut__notes{position:absolute;left:34%;bottom:0;width:31%;display:grid;gap:.15em;text-align:center;justify-items:center;pointer-events:none;z-index:2}
.fut__key{display:flex;gap:var(--s3);color:var(--sand)}
.fut__key span{display:inline-flex;align-items:center;gap:.4em}
.fut__keyi{width:1.15em;height:1.15em}.fut__keyi--gold{color:var(--au)}.fut__keyi--star{color:var(--starlight)}
.fut__attr{font-size:.62rem;opacity:.7;line-height:1.4}

/* ——— لوحة القراءة ——— */
.fpanel{display:flex;flex-direction:column;gap:var(--s2);min-height:0;overflow-y:auto;padding-inline-end:var(--s1);scrollbar-width:thin;scrollbar-color:rgba(216,195,160,.3) transparent}
.fpanel__title{margin-top:-.08em}
.fpillars{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:var(--s2)}
.fpillar{position:relative;display:grid;justify-items:center;align-content:center;gap:.1em;min-height:calc(var(--target) * 1.35);padding:var(--s1) var(--s1);border:1px solid var(--line);background:rgba(6,20,24,.55);text-align:center;transition:border-color 300ms var(--ease-cine),background 300ms var(--ease-cine)}
.fpillar__t{font-family:var(--font-display);font-weight:700;font-size:1.05rem;line-height:1.2}
.fpillar__n{position:absolute;top:.15em;inset-inline-start:.5em;font-size:.7rem;color:var(--sand);opacity:.7}
.fpillar.is-on{border-color:var(--gold);background:rgba(201,164,92,.1)}
.fpillar.is-seen:not(.is-on){border-color:rgba(143,208,169,.5)}
@media (hover:hover){.fpillar:hover{border-color:var(--gold)}}
.fmini{width:calc(var(--target) * .95);height:auto;overflow:visible}
.fmini__l{fill:none;stroke:rgba(143,208,169,.4);stroke-width:1}
.fmini__s{fill:rgba(237,230,211,.75)}
.fmini__h{fill:#8FD0A9}
.fmini.is-on .fmini__l{stroke:#c6ecd6}.fmini.is-on .fmini__h{filter:drop-shadow(0 0 3px #8FD0A9)}

.fpanel__body{display:grid;gap:var(--s2);align-content:start}
.fdetail{display:grid;gap:var(--s2);animation:ffade .8s var(--ease-cine) both}
@keyframes ffade{from{opacity:0;transform:translateY(10px)}}
.fdetail__head{display:flex;align-items:center;gap:var(--s3);flex-wrap:wrap}
.fdetail__text{font-size:.92rem;line-height:1.8;max-width:38rem}
.fdetail__k{margin-top:var(--s1)}
.fdetail .srcline{margin-top:0}
.fchips{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;gap:var(--s2)}
.fchip{min-height:var(--target);padding-inline:var(--s3);display:inline-flex;align-items:center;gap:.55em;border:1px solid var(--line);background:rgba(6,20,24,.55);font-size:.95rem;transition:border-color 200ms var(--ease-cine),background 200ms var(--ease-cine)}
.fchip:active{transform:scale(.98)}
.fchip__i{width:1.05em;height:1.05em;flex:0 0 auto;color:var(--g)}
.fchip--gold .fchip__i{color:var(--au)}
.fchip--origin{color:#fff0c8}.fchip--origin .fchip__i{color:#fff0c8}
.fchip.is-seen{border-color:rgba(143,208,169,.6)}
@media (hover:hover){.fchip:hover{border-color:var(--gold);background:rgba(201,164,92,.1)}}
.fchips--plain li{border:1px solid var(--line);padding:.2em .9em;font-size:.9rem;color:var(--sand)}
.fground{display:grid;gap:var(--s2)}
.fnote{margin:var(--s1) 0 0;padding-inline-start:var(--s3);border-inline-start:2px solid var(--gold);font-family:var(--font-display);font-size:1.04rem;line-height:1.7}
.fnote p{margin:0}
.fnote cite{display:block;font-style:normal;font-family:var(--font-ui);margin-top:.3em}
.fclose{margin-top:auto;padding-top:var(--s2);border-top:1px solid var(--line);display:grid;gap:.15em}
.fclose__row{display:flex;flex-wrap:wrap;align-items:baseline;gap:.5em}
.fclose__slogan{font-family:var(--font-display);font-weight:700;font-size:clamp(28px,3.6vmin,60px);color:var(--gold);line-height:1.2}
.fclose__dot{color:var(--gold);opacity:.7;font-size:clamp(22px,2.6vmin,40px)}
.fclose__line{font-family:var(--font-display);font-size:clamp(20px,2.5vmin,40px);color:var(--museum-white);opacity:.92;line-height:1.35}
.fclose__quote{margin:.3em 0 0;max-width:40rem}
.fclose--band{position:absolute;inset-inline:0;bottom:calc(var(--s6) + var(--s1));z-index:2;margin:0;padding:0 var(--s4);border:0;justify-items:center;text-align:center;pointer-events:none}
.fclose--band .fclose__row{justify-content:center}
.fclose--band .fclose__quote{max-width:none;margin:0}

/* ——— الشارات ——— */
.fbadge{display:inline-flex;align-items:center;gap:.4em;padding:0 .7em;font-size:.78rem;letter-spacing:.02em;border:1px solid;line-height:1.75;white-space:nowrap}
.fbadge--documented{color:var(--g);border-color:rgba(143,208,169,.55);background:rgba(143,208,169,.08)}
.fbadge--vision{color:#f2c96f;border:1px dashed var(--au);background:rgba(231,176,74,.08)}
.fbadge--creative{color:var(--museum-white);border:1px dashed var(--sand);background:rgba(216,195,160,.06)}
.fbadge--s{font-size:.7rem;padding:0 .55em}

/* ——— داخل الطبقة ——— */
.fbody{display:grid;gap:var(--s3)}
.ffig-photo{margin:0;border:1px solid var(--line)}
.ffig-photo img{display:block;width:100%;height:auto}
.ffig-photo figcaption{padding:var(--s1) var(--s2);background:rgba(11,18,16,.6);opacity:.85}
.fbody__meta{display:flex;align-items:center;flex-wrap:wrap;gap:var(--s2)}
.fbody__when{color:var(--sand)}
.fbody__block{display:grid;gap:var(--s1)}
.fbody__where{margin:0}
.ffacts{list-style:none;margin:0;padding:0;display:grid;gap:var(--s2)}
.ffacts__i{display:grid;grid-template-columns:auto 1fr;gap:var(--s2);align-items:start;border-inline-start:2px solid var(--line);padding-inline-start:var(--s2)}
.ffacts__i--vision{border-inline-start:2px dashed rgba(231,176,74,.7)}
.ffigs{display:grid;grid-template-columns:repeat(auto-fit,minmax(12rem,1fr));gap:var(--s2)}
.ffig{border:1px solid var(--line);padding:var(--s2) var(--s3);display:grid;gap:.2em;background:rgba(6,20,24,.55)}
.ffig__v{font-family:var(--font-display);font-weight:700;font-size:clamp(34px,5vmin,62px);color:#f2c96f;line-height:1.1}
.ffig__u{font-size:.4em;color:var(--sand);font-family:var(--font-ui);font-weight:500}
.ffig__l{font-size:.95rem}
.ffig__m{display:flex;flex-wrap:wrap;gap:.3em .8em;align-items:center}

/* ——— عمودي/هاتف: الخريطة فوق والكوكبات (أزرار الركائز) تحتها ——— */
@media (max-aspect-ratio:1/1),(max-width:820px){
  .fut__body{grid-template-columns:1fr;grid-template-rows:minmax(0,46dvh) minmax(0,1fr);gap:var(--s2);padding:calc(var(--target) + var(--s3)) var(--s2) calc(var(--s6) + var(--s3))}
  .fut__stage{order:1}.fpanel{order:2}
}
.is-stacked .fstar{width:36px;height:36px}
.is-stacked .fstar__g{width:20px;height:20px}
.is-stacked .fstar__label strong{font-size:.8rem}
.is-stacked .fstar__label small{font-size:.62rem}
.fut__creative.is-flow,.fut__notes.is-flow{position:static;transform:none;width:100%;justify-content:center;white-space:normal;text-align:center}
.fut__creative.is-flow{font-size:.68rem;flex-wrap:wrap;margin-top:2px}
.fut__notes.is-flow{margin-top:2px;font-size:.68rem}
.fut__notes.is-flow .fut__key{justify-content:center}
.is-stacked .fut__attr{font-size:.55rem}
.is-stacked .fpanel__title{font-size:clamp(34px,9vw,52px)}
[data-mode=mobile] .fut__body{grid-template-columns:1fr;grid-template-rows:minmax(0,46dvh) minmax(0,1fr);gap:var(--s2);padding:calc(var(--target) + var(--s3)) var(--s2) calc(var(--s6) + var(--s3))}
[data-mode=mobile] .fut__stage{order:1}[data-mode=mobile] .fpanel{order:2}

/* ——— حركة مخفّفة: لا لمعان ولا نبض مستمر، وتظهر الخيوط فورًا ——— */
.is-still *,.is-still *::before{animation:none!important}
.is-still .fthread{transition-duration:.001ms!important;transition-delay:0ms!important}
`
