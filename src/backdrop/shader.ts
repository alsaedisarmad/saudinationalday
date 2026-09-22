// شادر السماء/الأفق/الجبال/الخيط — يُرسم كل قاعة بمعاملاتها (LightGrade). WebGL1 لأوسع توافق مع السبورات.
export const vert = `
attribute vec2 a;
void main(){ gl_Position = vec4(a, 0.0, 1.0); }
`

export const frag = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;
uniform vec3 uTop, uMid, uBot, uRidge, uHaze, uGlow;
uniform float uHorizon, uStars, uMoon, uRidges, uDust, uThread, uThreadY, uGrain, uPulse, uBright;

float hash(vec2 p){ p = fract(p*vec2(123.34, 456.21)); p += dot(p, p+45.32); return fract(p.x*p.y); }
vec2 hash2(vec2 p){ return vec2(hash(p), hash(p+19.19)); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  f = f*f*(3.0-2.0*f);
  return mix(mix(hash(i), hash(i+vec2(1,0)), f.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y);
}
float fbm(vec2 p){ float v = 0.0, a = 0.5; for(int i=0;i<4;i++){ v += a*noise(p); p = p*2.03+7.1; a *= 0.5; } return v; }

void main(){
  vec2 uv = gl_FragCoord.xy / uRes;
  float asp = uRes.x / uRes.y;
  float h = uHorizon;

  // تدرّج الضوء: أسفل ← أفق ← أعلى
  vec3 col = uv.y < h
    ? mix(uBot, uMid, smoothstep(0.0, h, uv.y))
    : mix(uMid, uTop, pow(smoothstep(h, 1.0, uv.y), 0.75));
  col += uGlow * exp(-abs(uv.y - h) * 15.0) * 0.10;

  // نجوم (طبقتان)
  float skyMask = smoothstep(h + 0.02, h + 0.35, uv.y);
  for(int L=0; L<2; L++){
    float sc = L==0 ? 70.0 : 130.0;
    vec2 sp = vec2(uv.x*asp, uv.y) * sc + vec2(float(L)*17.0, 0.0);
    sp.x += uMouse.x * (L==0 ? 1.4 : 0.7);
    vec2 id = floor(sp);
    vec2 f = fract(sp) - 0.5;
    float r = hash(id);
    float on = step(1.0 - 0.055*uStars, r);
    vec2 o = (hash2(id + 3.7) - 0.5) * 0.6;
    float d = length(f - o);
    float tw = 0.55 + 0.45 * sin(uTime * (0.8 + 3.0*r) + r*40.0);
    col += vec3(0.93, 0.9, 0.82) * on * smoothstep(L==0 ? 0.13 : 0.09, 0.0, d) * tw * skyMask * (L==0 ? 1.0 : 0.6);
  }

  // قمر (هلال) بتوهج
  if(uMoon > 0.001){
    vec2 m = vec2(0.24*asp, 0.74);
    vec2 p = vec2(uv.x*asp, uv.y);
    float r = 0.036;
    float d1 = length(p - m);
    float d2 = length(p - m - vec2(0.014, 0.008));
    float disc = smoothstep(r, r - 0.0025, d1) * (1.0 - smoothstep(r, r - 0.0025, d2) * 0.92);
    col += vec3(0.98, 0.94, 0.82) * disc * uMoon;
    col += vec3(0.9, 0.86, 0.7) * exp(-d1 * 11.0) * 0.16 * uMoon;
  }

  // طبقات الجبال بضباب جوي
  float total = max(uRidges, 1.0);
  for(int i=0; i<3; i++){
    if(float(i) < uRidges){
      float fi = float(i);
      float depth = fi / total;                       // 0 بعيد … 1 قريب
      float x = uv.x*asp*(1.6 + fi*0.7) + fi*11.3 + uMouse.x*(0.05 + fi*0.06);
      float n = fbm(vec2(x, fi*3.1));
      float ridge = abs(n - 0.5) * 2.0;                // قمم حادّة
      float base = h + 0.012 + fi*0.028;
      float top = base + (0.05 + 0.05*(1.0 - depth)) * (0.35 + 0.9*(1.0 - ridge));
      float m = smoothstep(top + 0.002, top - 0.002, uv.y);
      vec3 rc = mix(uHaze, uRidge, 0.25 + 0.75*depth);
      rc = mix(rc, uHaze, smoothstep(top - 0.09, top, uv.y) * 0.35);   // ضباب عند القمم
      col = mix(col, rc, m);
    }
  }

  // الخيط: خط ضوء ينبسط من اليمين إلى اليسار (RTL)
  if(uThread > 0.0005){
    float y = uThreadY + sin(uv.x*7.0 + uTime*0.6) * 0.0016 * uThread;
    float dy = abs(uv.y - y) * uRes.y;
    float head = 1.0 - uThread;                       // موضع الرأس
    float on = step(head, uv.x);
    float fadeHead = smoothstep(head, head + 0.06, uv.x);
    float core = smoothstep(1.6, 0.0, dy);
    float glow = exp(-dy / 22.0) * 0.55;
    float pulse = 0.6 + 0.4 * sin(uv.x * 26.0 - uTime * 2.4);
    float travel = exp(-pow((fract(uTime*0.09) - (1.0 - uv.x)) * 9.0, 2.0)) * uPulse;
    col += uGlow * on * fadeHead * (core * 1.25 + glow * (0.5 + 0.5*pulse)) * (1.0 + travel * 1.5);
    // رأس الخيط المتوهّج
    col += uGlow * exp(-pow((uv.x - head) * uRes.x / 36.0, 2.0)) * exp(-dy / 30.0) * 1.1;
  }

  // غبار/جسيمات ضوء بطيئة
  if(uDust > 0.001){
    for(int k=0; k<2; k++){
      float sc = k==0 ? 16.0 : 30.0;
      vec2 dp = vec2(uv.x*asp, uv.y) * sc;
      dp.y -= uTime * (k==0 ? 0.35 : 0.22);
      dp.x += sin(uTime*0.15 + float(k)*4.0) * 0.6 + uMouse.x * (k==0 ? 3.0 : 1.5);
      vec2 id = floor(dp);
      vec2 f = fract(dp) - 0.5;
      float r = hash(id + float(k)*31.0);
      float on = step(1.0 - 0.16*uDust, r);
      vec2 o = (hash2(id + 9.1) - 0.5) * 0.5;
      float d = length(f - o);
      float a = smoothstep(0.24, 0.0, d) * (0.4 + 0.6*sin(uTime*0.8 + r*20.0)) * on;
      col += uGlow * a * (k==0 ? 0.20 : 0.11);
    }
  }

  col *= uBright;
  // تظليل الحواف + حبيبات
  col *= 1.0 - 0.42 * smoothstep(0.35, 1.15, length((uv - 0.5) * vec2(1.05, 1.0)) * 1.25);
  float g = hash(gl_FragCoord.xy + fract(uTime) * 91.7);
  col += (g - 0.5) * uGrain;
  gl_FragColor = vec4(col, 1.0);
}
`
