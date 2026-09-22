import { najdiBand, najdiBandDown, plasterGrain } from './motifs'

const up = najdiBand('rgba(201,164,92,.20)', 'rgba(0,0,0,.30)', 'rgba(201,164,92,.55)')
const down = najdiBandDown('rgba(201,164,92,.16)', 'rgba(0,0,0,.34)', 'rgba(201,164,92,.5)')

/** أنماط قاعة الجداريات كلها (الجدار، الهاتف، اللوحة، العارض، النص، QR) — تُحقن مرة واحدة من Murals.tsx */
export const css = `
.mhall{position:absolute;inset:0;--hud:calc(var(--target) + var(--s3)*2);--foot:calc(var(--target) + var(--s6) + var(--s1));color:var(--museum-white)}
.mhall__notice{position:absolute;z-index:7;top:calc(var(--hud) + var(--s2));inset-inline:0;margin-inline:auto;width:max-content;max-width:90vw;background:rgba(16,10,6,.92);border:1px solid var(--gold);padding:var(--s1) var(--s3);color:var(--museum-white);font-size:.9rem}

/* ===== الجدار الأفقي ===== */
.mw{position:absolute;inset:0;overflow:hidden;background:#20160f;
  --ph:min(calc((100dvh - var(--hud) - var(--foot) - 4.8rem) / 1.116),64dvh);--fw:calc(var(--ph)*.024);--mw:calc(var(--ph)*.034);--gap:clamp(2.6rem,6vw,7rem)}
.mw__scroller{position:absolute;inset:0;overflow-x:auto;overflow-y:hidden;scrollbar-width:none;overscroll-behavior-x:contain;cursor:grab;-webkit-overflow-scrolling:touch}
.mw__scroller:focus-visible{outline-offset:-6px}
.mw__scroller::-webkit-scrollbar{display:none}
.mw__scroller.is-drag{cursor:grabbing;scroll-snap-type:none;user-select:none}
@media (pointer:coarse){.mw__scroller{scroll-snap-type:x proximity}}
.mw__strip{position:relative;display:flex;align-items:center;gap:var(--gap);height:100%;width:max-content;min-width:100%;padding:var(--hud) 6vw var(--foot);
  background:radial-gradient(90% 62% at 50% 46%,rgba(255,206,140,.10),transparent 64%),linear-gradient(180deg,#2b1e15 0,#4d392a 28%,#5a412e 50%,#4a352a 74%,#2a1c14 100%)}
.mw__cornice{position:absolute;inset-inline:0;top:0;height:var(--hud);background:linear-gradient(180deg,#0e0805 0%,#221610 62%,#2e1f16 100%);border-bottom:2px solid rgba(201,164,92,.6);box-shadow:0 12px 30px rgba(0,0,0,.55);pointer-events:none}
.mw__cornice::after{content:'';position:absolute;inset-inline:0;bottom:7px;height:16px;background:${up} repeat-x;background-size:auto 100%}
.mw__dado{position:absolute;inset-inline:0;bottom:0;height:var(--foot);background:linear-gradient(180deg,#3a281b,#1b110b 70%);border-top:2px solid rgba(201,164,92,.55);box-shadow:0 -14px 34px rgba(0,0,0,.5);pointer-events:none}
.mw__dado::before{content:'';position:absolute;inset-inline:0;top:8px;height:16px;background:${down} repeat-x;background-size:auto 100%}
.mw__grain{position:absolute;inset:0;pointer-events:none;opacity:.55;mix-blend-mode:soft-light;background-image:${plasterGrain}}
.mw__vig{position:absolute;inset:0;pointer-events:none;z-index:4;background:radial-gradient(125% 95% at 50% 50%,transparent 55%,rgba(0,0,0,.52) 100%),linear-gradient(90deg,rgba(0,0,0,.4),transparent 9%,transparent 91%,rgba(0,0,0,.4))}

.mw__panel{flex:0 0 auto;position:relative;z-index:2;display:grid;align-content:center;gap:var(--s3);scroll-snap-align:center}
.mw__intro{width:min(36vw,40rem);padding-inline:var(--s3)}
.mw__outro{width:min(32vw,34rem);padding-inline:var(--s3)}
.mw__h1{font-size:clamp(56px,11vmin,200px);line-height:1;color:#ecd9ad;text-shadow:0 1px 0 rgba(255,255,255,.2),0 -1px 0 rgba(0,0,0,.7),0 10px 34px rgba(0,0,0,.55)}
.mw__h2{color:#ecd9ad;text-shadow:0 1px 0 rgba(255,255,255,.16),0 -1px 0 rgba(0,0,0,.7)}
.mw__lead{max-width:30rem;color:var(--museum-white);opacity:.94}
.mw__hint{max-width:28rem;color:var(--sand);opacity:.9}
.mw__tri{height:22px;width:min(15rem,100%);background:${up} repeat-x;background-size:auto 100%;opacity:.85}
.mw__outbtns{display:flex;flex-wrap:wrap;gap:var(--s2)}
.mw__list{list-style:none;margin:0;padding:0;display:flex;align-items:center;gap:var(--gap);position:relative;z-index:2}

.mw__nav{position:absolute;top:50%;translate:0 -50%;z-index:6;min-width:var(--target);min-height:calc(var(--target)*1.5);padding:0;border-color:rgba(201,164,92,.5);background:rgba(16,10,6,.62)}
.mw__nav--prev{inset-inline-start:var(--s2)}
.mw__nav--next{inset-inline-end:var(--s2)}
.mw__nav:disabled{opacity:.18;pointer-events:none}
.mw__rail{position:absolute;z-index:6;inset-inline:0;bottom:calc(var(--s3) + 22px);display:flex;justify-content:center;pointer-events:none}
.mw__rail ul{list-style:none;margin:0;padding:0;display:flex;pointer-events:auto;max-width:calc(100vw - var(--s6)*2)}
.mw__tick{min-width:var(--target);min-height:var(--target);display:grid;place-items:center;font-family:var(--font-display);font-size:1.1rem;color:#c9b48a;position:relative;transition:color 300ms var(--ease-cine)}
.mw__tick::after{content:'';position:absolute;bottom:9px;left:50%;translate:-50% 0;width:0;height:2px;background:var(--gold);box-shadow:0 0 10px rgba(231,176,74,.9);transition:width 300ms var(--ease-cine)}
.mw__tick.is-on{color:#ffe2a6}
.mw__tick.is-on::after{width:58%}
@media (hover:hover){.mw__tick:hover{color:#ffe2a6}}

/* ===== اللوحة المعلّقة ===== */
.pr{flex:0 0 auto;position:relative;scroll-snap-align:center}
.pr__btn{position:relative;display:grid;justify-items:center;gap:calc(var(--ph)*.03);padding:calc(var(--ph)*.085) calc(var(--ph)*.05) 0;cursor:pointer;color:inherit;isolation:isolate}
.pr__pool{position:absolute;z-index:-2;inset:-4% -60% 2% -60%;background:radial-gradient(closest-side at 50% 44%,rgba(255,214,150,.34),rgba(255,214,150,.12) 55%,transparent 100%);opacity:calc(var(--lit,1)*.9);pointer-events:none}
.pr__beam{position:absolute;z-index:-1;inset-inline:-18%;top:calc(var(--ph)*.075);height:calc(var(--ph)*1.1);background:linear-gradient(180deg,rgba(255,228,175,.36) 0,rgba(255,228,175,.11) 62%,transparent 100%);clip-path:polygon(33% 0,67% 0,112% 100%,-12% 100%);opacity:calc(var(--lit,1)*.85);filter:blur(7px);pointer-events:none;transition:filter 500ms var(--ease-cine)}
.pr__lamp{position:absolute;top:calc(var(--ph)*.03);inset-inline:0;margin-inline:auto;width:36%;height:max(6px,calc(var(--ph)*.014));background:linear-gradient(180deg,#eed29a,#9a7530 58%,#4d3a15);box-shadow:0 2px 6px rgba(0,0,0,.6),0 0 calc(var(--ph)*.06) rgba(255,222,150,calc(var(--lit,1)*.85));pointer-events:none}
.pr__lamp::before{content:'';position:absolute;left:50%;top:100%;translate:-50% 0;width:3px;height:calc(var(--ph)*.032);background:linear-gradient(180deg,#8a6a2b,#4d3a15)}
.fr{display:block;transition:transform 420ms var(--ease-cine)}
.fr__frame{position:relative;display:block;padding:var(--fw);background:linear-gradient(145deg,#7f5a37 0%,#40291a 36%,#5f4024 64%,#2a1b0e 100%);
  box-shadow:inset 0 1px 0 rgba(255,222,165,.38),0 0 0 1px rgba(0,0,0,.65),0 3px 5px rgba(0,0,0,.5),0 24px 36px -8px rgba(0,0,0,.66),0 50px 76px -24px rgba(0,0,0,.55)}
.fr__frame::before{content:'';position:absolute;inset:calc(var(--fw)*.42);border:1px solid rgba(231,176,74,.5);pointer-events:none;z-index:1}
.fr__mat{position:relative;display:block;padding:var(--mw);background:#efe6d2;box-shadow:inset 0 0 0 1px rgba(0,0,0,.22),inset 0 3px 9px rgba(0,0,0,.3)}
.fr__img{display:block;height:var(--ph);width:auto;aspect-ratio:1240/1753;background:#fffdf6;box-shadow:0 0 0 1px rgba(0,0,0,.24),0 1px 4px rgba(0,0,0,.32);user-select:none;-webkit-user-drag:none}
.fr__glass{position:absolute;inset:0;pointer-events:none;background:linear-gradient(118deg,rgba(255,255,255,.17) 0%,rgba(255,255,255,0) 30%,rgba(255,255,255,0) 66%,rgba(255,255,255,.07) 100%)}
.pr__plaque{position:relative;display:flex;align-items:center;gap:.7em;margin-top:calc(var(--ph)*.02);padding:.34em .9em .34em .6em;min-width:62%;max-width:calc(var(--ph)*.95);background:linear-gradient(180deg,#1f150e,#100a06);border:1px solid rgba(201,164,92,.55);box-shadow:0 10px 20px rgba(0,0,0,.5),inset 0 0 0 3px rgba(0,0,0,.35);transition:border-color 300ms,box-shadow 300ms}
.pr__no{flex:0 0 auto;display:grid;place-items:center;width:2.05em;height:2.05em;font-family:var(--font-display);font-weight:700;font-size:1.02em;color:#1a1208;background:linear-gradient(135deg,#efd394,#b08a3e);clip-path:polygon(50% 0,100% 50%,50% 100%,0 50%)}
.pr__lb{font-family:var(--font-display);font-weight:700;font-size:.98rem;line-height:1.3;color:#efdfb9;text-align:start}
.pr__btn[aria-current=true] .pr__plaque{border-color:var(--gold);box-shadow:0 10px 22px rgba(0,0,0,.5),0 0 20px rgba(231,176,74,.35),inset 0 0 0 3px rgba(0,0,0,.35)}
.pr__btn:focus-visible{outline-offset:4px}
.pr__btn:active .fr{transform:scale(.992)}
@media (hover:hover){.pr__btn:hover .fr{transform:translateY(-6px)}.pr__btn:hover .pr__beam{filter:blur(7px) brightness(1.5)}.pr__btn:hover .pr__plaque{border-color:var(--gold)}}

/* ===== الهاتف عموديًا: لوحة لوحة ===== */
.ml{position:absolute;inset:0;overflow:hidden;background:#20160f;
  --ph:min(calc((100dvh - var(--hud) - 10rem) / 1.116),calc((100vw - 4rem) / .8234));--fw:calc(var(--ph)*.024);--mw:calc(var(--ph)*.034)}
.ml__scroller{position:absolute;inset:0;overflow-y:auto;overflow-x:hidden;scroll-snap-type:y mandatory;overscroll-behavior:contain;padding-top:var(--hud);scrollbar-width:none;
  background:radial-gradient(90% 40% at 50% 50%,rgba(255,206,140,.10),transparent 70%),linear-gradient(180deg,#2b1e15 0,#4d392a 26%,#5a412e 50%,#4a352a 76%,#2a1c14 100%)}
.ml__scroller::-webkit-scrollbar{display:none}
.ml__cornice{position:fixed;inset-inline:0;top:0;height:var(--hud);z-index:3;background:linear-gradient(180deg,#0e0805,#221610 65%,#2e1f16);border-bottom:2px solid rgba(201,164,92,.6);pointer-events:none}
.ml__cornice::after{content:'';position:absolute;inset-inline:0;bottom:6px;height:14px;background:${up} repeat-x;background-size:auto 100%}
.ml__vig{position:absolute;inset:0;pointer-events:none;z-index:2;background:radial-gradient(130% 95% at 50% 50%,transparent 58%,rgba(0,0,0,.5) 100%)}
.ml__intro{min-height:calc(100dvh - var(--hud) - 1.5rem);display:grid;align-content:center;gap:var(--s2);padding:var(--s4);scroll-snap-align:center;text-align:start}
.ml__intro .display-l{color:#ecd9ad;text-shadow:0 1px 0 rgba(255,255,255,.2),0 -1px 0 rgba(0,0,0,.7);font-size:clamp(52px,17vw,88px)}
.ml__swipe{color:var(--gold);opacity:.9}
.ml__swipe span{display:inline-block;animation:mlbob 1.8s ease-in-out infinite}
@keyframes mlbob{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
.ml__list{list-style:none;margin:0;padding:0;display:grid}
.ml .pr{display:grid;place-items:center;min-height:calc(100dvh - var(--hud) - 1.5rem);scroll-snap-align:center;scroll-snap-stop:always}
.ml .pr__btn{padding-inline:0}
.ml .pr__pool{inset:-2% -30% 0 -30%}
.ml__count{position:absolute;z-index:3;bottom:calc(var(--s2) + 34px);inset-inline:0;text-align:center;pointer-events:none;color:#e8c880;font-family:var(--font-display);font-size:1rem;text-shadow:0 1px 6px rgba(0,0,0,.8)}
.ml .pr__lb{font-size:1rem}

/* ===== العارض الكبير ===== */
.layer:has(.mv) .layer__panel{background:linear-gradient(180deg,#1c1310,#110b08)}
.layer:has(.mv) .layer__body{padding-block:0 var(--s3)}
.layer:has(.mv--sheet) .layer__body{padding-inline:var(--s3)}
.mv{--ph:min(calc((100dvh - 14rem) / 1.116),60vw);--fw:calc(var(--ph)*.024);--mw:calc(var(--ph)*.034);height:100%;display:grid;grid-template-columns:minmax(0,.86fr) minmax(0,1.14fr);gap:var(--s6);min-height:0}
.mv__stage{position:relative;display:grid;grid-template-rows:minmax(0,1fr) auto;justify-items:center;min-height:0;padding-block:var(--s2)}
.mv__view{position:relative;display:grid;place-items:center;min-height:0;width:100%;height:100%;padding-top:calc(var(--s3) + 1.2vmin)}
.mv__view::before{content:'';position:absolute;inset:-6% -20% -8%;z-index:0;background:radial-gradient(closest-side at 50% 46%,rgba(255,214,150,.26),rgba(255,214,150,.08) 60%,transparent 100%);pointer-events:none}
.mv__beam{position:absolute;z-index:0;top:calc(var(--s2));inset-inline:-4%;bottom:0;background:linear-gradient(180deg,rgba(255,228,175,.22),rgba(255,228,175,.05) 60%,transparent);clip-path:polygon(34% 0,66% 0,108% 100%,-8% 100%);filter:blur(8px);pointer-events:none}
.mv__lamp{position:absolute;z-index:2;top:var(--s1);inset-inline:0;margin-inline:auto;width:min(36%,14rem);height:7px;background:linear-gradient(180deg,#eed29a,#9a7530 58%,#4d3a15);box-shadow:0 2px 6px rgba(0,0,0,.6),0 0 24px rgba(255,222,150,.7);pointer-events:none}
.mv .fr--big{position:relative;z-index:1;display:flex;height:100%;max-width:100%;transition:none}
.mv .fr--big .fr__frame{display:flex;height:100%;max-width:100%}
.mv .fr--big .fr__mat{display:flex;height:100%;max-width:100%}
.mv .fr--big .fr__img{height:100%;width:auto;max-width:100%;object-fit:contain}
.mv__text{min-height:0;overflow:auto;padding-inline:var(--s1) var(--s3);padding-block:var(--s2) var(--s6);overscroll-behavior:contain;scrollbar-width:thin;scrollbar-color:rgba(201,164,92,.5) transparent}
.mv__nav{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:var(--s2);width:100%;padding-top:var(--s2)}
.mv__step{min-height:var(--target);padding-inline:var(--s3);justify-self:center}
.mv__step:disabled{opacity:.25;pointer-events:none}
.mv__count{font-family:var(--font-display);font-size:1.1rem;color:#e8c880;text-align:center;white-space:nowrap}
.mv__actions{margin-top:var(--s4);display:grid;gap:.3rem;justify-items:start}
.mv__hall{min-height:calc(var(--target)*1.15);padding-inline:var(--s4);font-size:1.02rem}
.mv__hallnote{opacity:.85}
.mv__qrsum{min-height:var(--target);display:flex;align-items:center;color:var(--gold);cursor:pointer;font-family:var(--font-display);font-weight:700;font-size:1.15rem}
.mv__qrbox{margin-top:var(--s3);border-top:1px solid rgba(201,164,92,.3)}
.mv__review{margin-top:var(--s4);border:1px dashed #C58A3C;padding:var(--s2);display:grid;gap:.3rem}

/* الورقة السفلية (هاتف) */
.mv--sheet{display:block;height:auto;--fw:5px;--mw:9px}
.mv--sheet .mv__stage{display:block;padding:0}
.mv--sheet .mv__view{display:block;height:auto;padding:var(--s3) var(--s1) var(--s2)}
.mv--sheet .mv__beam{display:none}
.mv--sheet .mv__lamp{top:var(--s1);width:38%}
.mv--sheet .fr--big{display:block;width:min(100%,30rem);margin-inline:auto}
.mv--sheet .fr--big .fr__frame,.mv--sheet .fr--big .fr__mat{display:block;height:auto}
.mv--sheet .fr--big .fr__img{width:100%;height:auto}
.mv--sheet .mv__text{overflow:visible;padding:0}
.mv--sheet .mv__nav{position:sticky;bottom:0;z-index:3;margin-inline:calc(var(--s3)*-1);width:auto;padding:var(--s2) var(--s2) var(--s2);background:linear-gradient(180deg,rgba(17,11,8,0),rgba(17,11,8,.97) 34%);grid-template-columns:auto 1fr auto}
.mv--sheet .mv__step{padding-inline:var(--s2)}
.mv--sheet .mv__hall{width:100%;justify-content:space-between}

/* ===== نص الجدارية (HTML حقيقي) ===== */
.mt{display:grid;gap:var(--s2);max-width:44rem}
.mt__h{font-family:var(--font-display);font-weight:700;font-size:1.32rem;line-height:1.35;color:#e8c880;margin-top:var(--s2);display:flex;align-items:center;gap:.6em}
.mt__h::before{content:'';flex:0 0 auto;width:.62em;height:.62em;background:var(--gold);clip-path:polygon(50% 0,100% 100%,0 100%)}
.mt__p{font-size:1.06rem;line-height:1.95;color:#f3ecdc}
.mt__li strong{color:#e8c880;font-weight:600}
.mt__line{font-family:var(--font-display);font-size:1.28rem;line-height:1.6;padding-inline-start:.9em;border-inline-start:2px solid rgba(201,164,92,.55);color:#f3ecdc}
.mt__tags{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;gap:.3rem 1.1rem}
.mt__tags li{font-family:var(--font-display);font-size:1.18rem;color:#f3ecdc;border-bottom:1px solid rgba(201,164,92,.55);padding-bottom:.05em}
.mt__strong{font-family:var(--font-display);font-weight:700;font-size:1.4rem;line-height:1.5;color:#ffe2a6;padding-block:var(--s2);border-block:1px solid rgba(201,164,92,.35);text-align:center}
.mt__verse{margin:var(--s2) 0;padding:var(--s3);border-inline-start:3px solid var(--gold);background:rgba(201,164,92,.07)}
.mt__quran{margin:0;font-size:clamp(24px,3.1vmin,50px);line-height:2.25;text-align:center;text-shadow:0 0 30px rgba(231,176,74,.2)}
.mt__quoted{color:#ffe2a6}
.mt__rest{opacity:.55}
.mt__end{color:var(--gold);font-size:.7em}
.mt__vref{text-align:center;margin-top:.3rem}
.mt__vnote{opacity:.75}
.mt__ref{color:var(--sand)}

/* ===== رمز الجدارية (QR) ===== */
.mq{display:flex;gap:var(--s4);align-items:center;margin-top:var(--s4);padding:var(--s3);border:1px solid rgba(201,164,92,.4);background:linear-gradient(180deg,rgba(255,255,255,.05),rgba(255,255,255,.01));max-width:44rem}
.mq__code{flex:0 0 auto;width:max(calc(var(--target)*2.6),160px);aspect-ratio:1;background:#fff;box-shadow:0 0 0 3px #1a120c,0 0 0 4px rgba(201,164,92,.7),0 10px 24px rgba(0,0,0,.5)}
.mq__svg,.mq__svg svg,.mq__wait{display:block;width:100%;height:100%}
.mq__h{font-family:var(--font-display);font-weight:700;font-size:1.3rem;color:#e8c880}
.mq__p{font-size:.92rem;line-height:1.75;opacity:.9;margin-top:.2rem}
.mq__url{display:block;margin-top:.5rem;word-break:break-all;user-select:all}
[data-mode=mobile] .mq{flex-direction:column;align-items:flex-start;gap:var(--s2)}
[data-mode=mobile] .mq__code{width:min(70vw,15rem)}

@media (max-width:900px){.mv:not(.mv--sheet){grid-template-columns:1fr;gap:var(--s3);overflow:auto;height:auto}.mv:not(.mv--sheet) .mv__view{height:min(60dvh,34rem)}}
`
