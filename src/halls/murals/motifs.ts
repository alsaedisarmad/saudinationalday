/**
 * زخارف إجرائية مقتصدة: الشريط المثلثي النجدي (مثلثات صاعدة تتخللها مثلثات مقلوبة) + حبيبات الجص.
 * أُعدّت كصور SVG مضمّنة (data URI) لتتكرر أفقيًا على طول الجدار بلا أصول خارجية.
 */
const url = (svg: string) => `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`

/** شريط مثلثات: صاعدة بلون a، ومقلوبة بينها بلون b، وخط أساس ذهبي رفيع */
export const najdiBand = (a: string, b: string, line: string) =>
  url(
    `<svg xmlns='http://www.w3.org/2000/svg' width='56' height='34' viewBox='0 0 56 34'>` +
      `<path d='M0 30 L14 4 L28 30Z' fill='${a}'/><path d='M28 30 L42 4 L56 30Z' fill='${a}'/>` +
      `<path d='M14 4 L28 30 L42 4Z' fill='${b}'/>` +
      `<path d='M0 30.5 H56' stroke='${line}' stroke-width='1'/></svg>`,
  )

/** المثلثات مقلوبة (لحافة الجدار السفلية) */
export const najdiBandDown = (a: string, b: string, line: string) =>
  url(
    `<svg xmlns='http://www.w3.org/2000/svg' width='56' height='34' viewBox='0 0 56 34'>` +
      `<path d='M0 4 L14 30 L28 4Z' fill='${a}'/><path d='M28 4 L42 30 L56 4Z' fill='${a}'/>` +
      `<path d='M14 30 L28 4 L42 30Z' fill='${b}'/>` +
      `<path d='M0 3.5 H56' stroke='${line}' stroke-width='1'/></svg>`,
  )

export const plasterGrain = url(
  `<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.62' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .5  0 0 0 0 .4  0 0 0 0 .3  0 0 0 .9 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>`,
)
