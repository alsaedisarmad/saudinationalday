/** أنماط قاعة «عزّنا بطبعنا»: الهيكل المشترك (العنوان، الأدوات، الخيط السفلي، المكافأة). أنماط كل مشهد داخل ملفه. */
export const css = `
@property --fill{syntax:'<percentage>';inherits:false;initial-value:0%}
.vals{position:absolute;inset:0;overflow:hidden;background:#04070a;isolation:isolate;
  --vs-bottom:calc(var(--s3) + 32px + var(--s1));
  --vs-h:calc(var(--target) + var(--s2));
  --vpad:var(--s6);
  --vtop:calc(var(--target) + var(--s3) * 2 + var(--s2))}
[data-mode=mobile] .vals{--vs-bottom:calc(var(--s2) + 32px + var(--s1));--vpad:var(--s3);--vtop:calc(var(--target) + var(--s3) * 2 + var(--s1))}
.vsc{position:absolute;inset:0;animation:vsIn 900ms var(--ease-cine) both}
@keyframes vsIn{from{opacity:0;filter:brightness(.5)}to{opacity:1;filter:none}}
.vsc-canvas{position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none;user-select:none;-webkit-user-select:none}
.vsc-press{cursor:pointer}
.vals__vig{position:absolute;inset:0;pointer-events:none;z-index:2;background:linear-gradient(to top,rgba(2,4,6,.82),rgba(2,4,6,.4) 9%,transparent 21%),radial-gradient(ellipse 80% 75% at 50% 48%,transparent 55%,rgba(2,4,6,.5) 100%)}
.vals__grain{opacity:.1;z-index:2}

/* عنوان المشهد */
.vt{position:absolute;z-index:3;inset-inline-start:var(--vpad);top:var(--vtop);width:min(30rem,42vw);display:grid;gap:.05em;justify-items:start;pointer-events:none}
.vt::before{content:'';position:absolute;z-index:-1;inset-block:-14vh -10vh;inset-inline-start:calc(var(--vpad) * -2);width:calc(100% + var(--vpad) * 3);background:linear-gradient(to left,rgba(3,6,8,.6),rgba(3,6,8,.32) 55%,transparent);-webkit-mask-image:linear-gradient(to bottom,transparent,#000 22%,#000 70%,transparent);mask-image:linear-gradient(to bottom,transparent,#000 22%,#000 70%,transparent);pointer-events:none}
.vt>*{pointer-events:auto}
.vt__kicker{display:flex;align-items:center;gap:.7em;color:var(--sand)}
.vt__kicker i{display:block;width:2.2em;height:1px;background:var(--gold);opacity:.7}
.vt__word{font-family:var(--font-display);font-weight:700;font-size:clamp(54px,10.5vmin,170px);line-height:1.02;padding-top:.34em;color:var(--museum-white);text-shadow:0 2px 30px rgba(0,0,0,.55)}
.vt__phrase{font-family:var(--font-kufi);font-weight:500;color:var(--gold);font-size:clamp(20px,3.3vmin,54px);letter-spacing:.03em;line-height:1.5;text-shadow:0 1px 18px rgba(0,0,0,.6)}
.vt__cue{margin-top:var(--s2);max-width:22em;color:rgba(245,240,230,.9);text-shadow:0 1px 16px rgba(0,0,0,.75)}
.vt__reveal{margin-top:var(--s3);padding-inline-start:var(--s3);border-inline-start:2px solid var(--gold);max-width:24em;display:grid;gap:.15em;animation:vtReveal 1.1s var(--ease-cine) both}
.vt__reveal .label{color:var(--gold);letter-spacing:.06em}
.vt__reveal p{font-size:1.02rem;line-height:1.8;color:var(--museum-white);text-shadow:0 1px 16px rgba(0,0,0,.8)}
@keyframes vtReveal{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
.vt__meaning{margin-top:var(--s3)}
.vt__badge{display:inline-flex;align-items:center;gap:.5em;margin-top:var(--s2);padding:.05em .9em;border:1px dashed var(--gold);color:var(--gold);font-size:.78rem;letter-spacing:.02em;background:rgba(3,6,8,.55)}

/* أدوات المشهد */
.vc{position:absolute;z-index:4;inset-inline:0;bottom:calc(var(--vs-bottom) + var(--vs-h) + var(--s2));display:grid;justify-items:center;gap:var(--s2);padding-inline:var(--s3);pointer-events:none}
.vc>*{pointer-events:auto}
.vc__hint{font-size:.95rem;color:var(--sand);text-align:center;text-shadow:0 1px 14px rgba(0,0,0,.9);max-width:32em;line-height:1.7}
.vc__row{display:flex;gap:var(--s2);align-items:center;justify-content:center;flex-wrap:wrap}
.vbtn{min-height:calc(var(--target) * 1.1);padding-inline:calc(var(--u) * 6);font-size:1.02rem;background:rgba(6,10,12,.6)}
.vbtn.is-on{background:rgba(201,164,92,.22);border-color:#FFD58A;color:#FFE2A6;box-shadow:0 0 30px rgba(231,176,74,.3)}
.vbtn:disabled{opacity:.35;pointer-events:none}

/* الخيط السفلي */
.vs{position:absolute;z-index:6;bottom:var(--vs-bottom);inset-inline:0;margin-inline:auto;width:min(94vw,64rem);height:var(--vs-h);display:flex;align-items:center;gap:var(--s3);pointer-events:none}
.vs>*{pointer-events:auto}
.vs__nav{flex:0 0 auto;width:calc(var(--target) * 1.05);min-height:calc(var(--target) * 1.05);background:rgba(6,10,12,.7)}
.vs__nav:disabled{opacity:.25;pointer-events:none}
.vs__nav::after{content:'';position:absolute;top:50%;height:1px;width:var(--s3);background:linear-gradient(to left,var(--gold),transparent);opacity:.6}
.vs__prev::after{inset-inline-start:100%}
.vs__next::after{inset-inline-end:100%;transform:scaleX(-1)}
.vs__mid{flex:1;min-width:0;display:grid;justify-items:center;gap:calc(var(--u) * .4)}
.vs__slogan{font-family:var(--font-kufi);font-weight:500;font-size:clamp(20px,3.4vmin,46px);letter-spacing:.06em;line-height:1.35;background:linear-gradient(to left,var(--gold) calc(var(--fill) - 1%),rgba(216,195,160,.5) calc(var(--fill) + 5%));filter:drop-shadow(0 1px 8px rgba(0,0,0,.8));-webkit-background-clip:text;background-clip:text;color:transparent;-webkit-text-fill-color:transparent;transition:--fill 1.4s var(--ease-cine);text-align:center;padding-inline:.4em}
.vs__slogan.is-full{filter:drop-shadow(0 0 16px rgba(231,176,74,.5))}
button.vs__slogan{cursor:pointer;min-height:calc(var(--target) * .7)}
.vs__dots{list-style:none;margin:0;padding:0;display:flex;width:100%;justify-content:space-between;position:relative}
.vs__dots::before{content:'';position:absolute;inset-inline:6%;top:calc(var(--u) * 1.15);height:1px;background:linear-gradient(to left,transparent,rgba(216,195,160,.5) 8%,rgba(216,195,160,.5) 92%,transparent)}
.vs__dot{position:relative;display:grid;justify-items:center;gap:calc(var(--u) * .35);min-width:calc(var(--target) * 1.15);min-height:calc(var(--target) * .8);padding:0 var(--u);color:var(--stone);font-size:.78rem;line-height:1.3}
.vs__dot i{display:block;width:calc(var(--u) * 2.3);height:calc(var(--u) * 2.3);border-radius:50%;border:1px solid rgba(216,195,160,.7);background:var(--night);transition:all 400ms var(--ease-cine)}
.vs__dot span{transition:color 400ms var(--ease-cine)}
.vs__dot.is-cur span{color:var(--museum-white)}
.vs__dot.is-cur i{border-color:var(--museum-white);transform:scale(1.15)}
.vs__dot.is-done i{background:var(--gold);border-color:var(--gold);box-shadow:0 0 14px rgba(231,176,74,.85)}
.vs__dot.is-done span{color:var(--gold)}
[data-mode=mobile] .vs{gap:var(--s2);width:calc(100vw - var(--s3) * 2)}
[data-mode=mobile] .vs__dots{pointer-events:none}
[data-mode=mobile] .vs__dot{min-width:0;padding:0;min-height:0}
[data-mode=mobile] .vs__dot span{display:none}
[data-mode=mobile] .vs__dot.is-cur span{display:block;position:absolute;top:100%;white-space:nowrap;margin-top:2px;color:var(--gold)}
[data-mode=mobile] .vs__nav::after{display:none}
[data-mode=mobile] .vs__mid{padding-bottom:var(--s2)}
[data-mode=mobile] .vs__slogan{font-size:1.15rem}

/* الدلالة */
.vd{display:grid;gap:var(--s2)}
.vd__fig{margin:0 0 var(--s1);border:1px solid var(--line)}
.vd__fig img{display:block;width:100%;height:auto}
.vd__fig figcaption{padding:var(--s1) var(--s2);background:rgba(11,18,16,.6);opacity:.85}
.vd__date{color:var(--gold)}
.vd__reading{border-inline-start:2px solid var(--gold);padding-inline-start:var(--s2);color:var(--sand)}
.vd__reading .label{display:block;color:var(--gold)}

/* مكافأة الست */
.rw{position:absolute;inset:0;z-index:8;display:grid;place-items:center;background:radial-gradient(ellipse at 50% 50%,rgba(10,20,16,.9),rgba(3,6,5,.96));animation:rwIn 1.2s var(--ease-cine) both;overflow:auto;padding:calc(var(--vtop)) var(--s3) calc(var(--vs-bottom) + var(--s3))}
@keyframes rwIn{from{opacity:0}to{opacity:1}}
.rw__in{display:grid;gap:var(--s4);justify-items:center;text-align:center;max-width:64rem}
.rw__list{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(3,auto);gap:var(--s2) var(--s6);justify-content:center}
.rw__list li{font-family:var(--font-display);font-size:clamp(22px,3.6vmin,52px);font-weight:700;color:rgba(216,195,160,.22);transition:color 900ms var(--ease-cine),text-shadow 900ms var(--ease-cine)}
.rw__list li.on{color:#FFE2A6;text-shadow:0 0 28px rgba(231,176,74,.55)}
.rw__slogan{font-family:var(--font-kufi);font-size:clamp(34px,7vmin,110px);line-height:1.2;color:var(--gold);opacity:0;transform:translateY(12px);transition:opacity 1.6s var(--ease-cine),transform 1.6s var(--ease-cine);letter-spacing:.05em;text-shadow:0 0 50px rgba(231,176,74,.35)}
.rw__slogan.on{opacity:1;transform:none}
.rw__actions{display:flex;gap:var(--s3);flex-wrap:wrap;justify-content:center;opacity:0;transition:opacity 1s var(--ease-cine)}
.rw__actions.on{opacity:1}
[data-mode=mobile] .rw__list{grid-template-columns:repeat(2,auto);gap:var(--s1) var(--s4)}

@media (max-aspect-ratio:1/1){
  .vt{width:calc(100% - var(--vpad) * 2);justify-items:start}
  .vt__word{font-size:clamp(46px,13vw,120px)}
  .vt__cue{max-width:none;font-size:.98rem}
  .vt__reveal p{font-size:.98rem}
  .vt::before{inset-block:-8vh -4vh;width:calc(100% + var(--vpad) * 3);background:linear-gradient(to bottom,rgba(3,6,8,.66),rgba(3,6,8,.42) 60%,transparent);-webkit-mask-image:none;mask-image:none}
}
[data-mode=mobile] .vt__meaning{position:absolute;inset-inline-end:0;top:0;margin:0}
`
