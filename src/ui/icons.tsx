import type { ReactNode, SVGProps } from 'react'

/** لغة الأيقونات: مجموعة واحدة على شبكة 24px، خط 1.5، زوايا حادة (SAUDI_VISUAL_LANGUAGE §7) */
const I = ({ children, ...p }: SVGProps<SVGSVGElement> & { children: ReactNode }) => (
  <svg viewBox="0 0 24 24" width="1.4em" height="1.4em" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter" aria-hidden focusable="false" {...p}>
    {children}
  </svg>
)

export const IconSound = ({ on }: { on: boolean }) => (
  <I>
    <path d="M4 9.5v5h3.5L12 18V6L7.5 9.5H4Z" />
    {on ? <path d="M15.5 9c1.4 1.6 1.4 4.4 0 6M18.2 6.5c2.6 3 2.6 8 0 11" /> : <path d="M16 9.5l5 5M21 9.5l-5 5" />}
  </I>
)
export const IconMotion = ({ on }: { on: boolean }) => (
  <I>
    <path d="M3 12c2-4 4-4 6 0s4 4 6 0 4-4 6 0" />
    {!on && <path d="M4 20L20 4" />}
  </I>
)
export const IconText = () => (
  <I>
    <path d="M4 6h16M4 10h10M4 14h16M4 18h9" />
  </I>
)
export const IconFull = () => (
  <I>
    <path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5" />
  </I>
)
export const IconArch = () => (
  <I>
    <path d="M5 21V10c0-4 3-7 7-8 4 1 7 4 7 8v11M9 21v-8c0-2 1.5-3.5 3-4 1.5.5 3 2 3 4v8" />
  </I>
)
export const IconBack = () => (
  <I>
    <path d="M9 5l7 7-7 7" />
  </I>
)
export const IconNext = () => (
  <I>
    <path d="M15 5l-7 7 7 7" />
  </I>
)
export const IconClose = () => (
  <I>
    <path d="M5 5l14 14M19 5L5 19" />
  </I>
)
export const IconPlus = () => (
  <I>
    <path d="M12 5v14M5 12h14" />
  </I>
)
export const IconMinus = () => (
  <I>
    <path d="M5 12h14" />
  </I>
)
export const IconSource = () => (
  <I>
    <path d="M6 3h9l4 4v14H6V3ZM14 3v5h5M9 12h7M9 16h7" />
  </I>
)
export const IconThread = () => (
  <I>
    <path d="M3 12h18M3 12l3-3M3 12l3 3" />
  </I>
)
export const IconStamp = () => (
  <I>
    <path d="M12 3l2.5 5 5.5.8-4 3.9.9 5.5-4.9-2.6-4.9 2.6.9-5.5-4-3.9L9.5 8 12 3Z" />
  </I>
)
export const IconGlyph = ({ name }: { name: 'coffee' | 'majlis' | 'sadu' | 'palm' | 'bisht' | 'heritage' }) => {
  switch (name) {
    case 'coffee':
      return (
        <I>
          <path d="M8 4c0 3 2 4 4 4M10 20c-3 0-5-2-5-5 0-4 3-7 7-7s7 3 7 7c0 3-2 5-5 5h-4ZM17 12c2 0 3 1 3 2.5S19 17 17 17" />
        </I>
      )
    case 'majlis':
      return (
        <I>
          <path d="M3 19h18M5 19v-6a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v6M7 10V7a5 5 0 0 1 10 0v3" />
        </I>
      )
    case 'sadu':
      return (
        <I>
          <path d="M3 6l4 4-4 4M7 10l4-4 4 4-4 4M15 10l4-4v8l-4-4M3 18l4 3 4-3 4 3 4-3" />
        </I>
      )
    case 'palm':
      return (
        <I>
          <path d="M12 21V11M12 11c-3-4-7-3-9 0M12 11c3-4 7-3 9 0M12 11c-1-4 0-7 0-8M12 11c-2-2-6-1-7 3M12 11c2-2 6-1 7 3" />
        </I>
      )
    case 'bisht':
      return (
        <I>
          <path d="M9 3l-5 4 2 14h12l2-14-5-4M9 3c0 2 1.5 3 3 3s3-1 3-3M12 6v15" />
        </I>
      )
    default:
      return (
        <I>
          <path d="M4 20V9l8-5 8 5v11M9 20v-6h6v6M4 20h16" />
        </I>
      )
  }
}
