import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, Lightformer, Html, Sparkles, RoundedBox } from '@react-three/drei'
import { ACESFilmicToneMapping, AdditiveBlending, BufferAttribute, DoubleSide, LatheGeometry, Path, Shape, ShapeGeometry, Vector2, Vector3, type Group, type Mesh, type Points } from 'three'
import { saduTexture, latticeTexture, plasterTexture, windowViewTexture, bishtTexture, haloTexture } from './textures'
import type { MajlisSpot } from '../../content/majlis'
import { IconGlyph } from '../../ui/icons'

export type Quality = 'low' | 'mid' | 'high'
interface Props {
  spots: MajlisSpot[]
  focusId: string | null
  onSelect: (id: string) => void
  pouring: boolean
  quality: Quality
  reduced: boolean
  seen: string[]
}

const HOME = { pos: new Vector3(0, 1.35, 4.5), look: new Vector3(0, 0.95, -0.6) }
const focusFor = (p: [number, number, number]) => {
  const wall = p[2] < -0.8
  return wall
    ? { pos: new Vector3(p[0] * 0.5, p[1] * 0.85 + 0.35, p[2] + 2.7), look: new Vector3(p[0], p[1], p[2]) }
    : { pos: new Vector3(p[0] * 0.65, 0.95, p[2] + 1.9), look: new Vector3(p[0], 0.3, p[2]) }
}

function Rig({ focusId, spots, reduced }: { focusId: string | null; spots: MajlisSpot[]; reduced: boolean }) {
  const cam = useRef(HOME.pos.clone())
  const look = useRef(HOME.look.clone())
  useFrame((s, dt) => {
    const sp = focusId ? spots.find((x) => x.id === focusId) : null
    const t = sp ? focusFor(sp.pos) : HOME
    const k = reduced ? 1 : 1 - Math.exp(-dt * 2.4)
    cam.current.lerp(t.pos, k)
    look.current.lerp(t.look, k)
    const tt = s.clock.elapsedTime
    const px = reduced ? 0 : s.pointer.x * (sp ? 0.08 : 0.28)
    const py = reduced ? 0 : s.pointer.y * (sp ? 0.04 : 0.1)
    const drift = reduced ? 0 : Math.sin(tt * 0.22) * 0.06
    s.camera.position.set(cam.current.x + px + drift, cam.current.y + py, cam.current.z)
    s.camera.lookAt(look.current)
  })
  return null
}

const lathe = (pts: [number, number][], seg = 28) => new LatheGeometry(pts.map(([r, y]) => new Vector2(r, y)), seg)

/** الدلّة: ملف تعريف Lathe (قاعدة عريضة، عنق، غطاء وحبّة) + بزبوز مائل + مقبض */
function Dallah({ pouring, quality }: { pouring: boolean; quality: Quality }) {
  const g = useRef<Group>(null)
  const stream = useRef<Mesh>(null)
  const body = useMemo(() => lathe([[0, 0], [0.085, 0], [0.1, 0.012], [0.128, 0.05], [0.13, 0.1], [0.108, 0.16], [0.07, 0.215], [0.046, 0.26], [0.042, 0.305], [0.05, 0.335], [0.062, 0.348]], quality === 'low' ? 18 : 32), [quality])
  const lid = useMemo(() => lathe([[0.0, 0.352], [0.05, 0.352], [0.04, 0.372], [0.02, 0.39], [0.0, 0.392]], 20), [])
  useFrame((_, dt) => {
    if (!g.current) return
    const tgt = pouring ? 0.62 : 0
    g.current.rotation.x += (tgt - g.current.rotation.x) * (1 - Math.exp(-dt * 4))
    if (stream.current) { stream.current.visible = pouring && g.current.rotation.x > 0.35 }
  })
  const metal = { color: '#C9A45C', metalness: 1, roughness: 0.26 } as const
  return (
    <group position={[1.0, 0.03, 0.15]}>
      <mesh position={[0, -0.02, 0]} receiveShadow><cylinderGeometry args={[0.34, 0.34, 0.02, 40]} /><meshStandardMaterial color="#8c5a2b" metalness={0.9} roughness={0.35} /></mesh>
      <group ref={g} rotation={[0, 0, 0]}>
        <mesh geometry={body}><meshStandardMaterial {...metal} /></mesh>
        <mesh geometry={lid}><meshStandardMaterial {...metal} /></mesh>
        <mesh position={[0, 0.405, 0]}><sphereGeometry args={[0.014, 12, 12]} /><meshStandardMaterial {...metal} /></mesh>
        <mesh position={[0, 0.16, 0.16]} rotation={[0.78, 0, 0]}><cylinderGeometry args={[0.012, 0.034, 0.27, 16]} /><meshStandardMaterial {...metal} /></mesh>
        <mesh position={[0, 0.24, -0.11]} rotation={[0, Math.PI / 2, 0]}><torusGeometry args={[0.1, 0.011, 8, 22, Math.PI]} /><meshStandardMaterial {...metal} /></mesh>
      </group>
      {[[-0.13, 0.22], [0, 0.29], [0.13, 0.22]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.006, z]} geometry={CUP}><meshStandardMaterial color="#f3ead6" roughness={0.35} /></mesh>
      ))}
      <mesh ref={stream} position={[0, 0.1, 0.27]} visible={false}><cylinderGeometry args={[0.004, 0.004, 0.18, 6]} /><meshStandardMaterial color="#5a2f12" emissive="#3a1c0a" /></mesh>
    </group>
  )
}
const CUP = lathe([[0, 0], [0.02, 0], [0.022, 0.008], [0.034, 0.04], [0.038, 0.06], [0.036, 0.06], [0.031, 0.04], [0.02, 0.012], [0, 0.01]], 20)

/** طاقة الضيافة: صينية ووعاء تمر (كرات) */
function Hospitality({ quality }: { quality: Quality }) {
  const bowl = useMemo(() => lathe([[0, 0], [0.1, 0], [0.16, 0.05], [0.2, 0.11], [0.19, 0.115], [0.15, 0.06], [0.09, 0.02], [0, 0.015]], 28), [])
  const dates = useMemo(() => Array.from({ length: quality === 'low' ? 14 : 30 }, (_, i) => { const a = i * 2.4, r = 0.03 + (i % 5) * 0.026; return [Math.cos(a) * r, 0.06 + (i % 4) * 0.012, Math.sin(a) * r] as [number, number, number] }), [quality])
  return (
    <group position={[0, 0.02, 0.9]}>
      <mesh><cylinderGeometry args={[0.4, 0.4, 0.02, 40]} /><meshStandardMaterial color="#8c5a2b" metalness={0.9} roughness={0.35} /></mesh>
      <mesh geometry={bowl} position={[0, 0.01, 0]}><meshStandardMaterial color="#3b2a1c" roughness={0.6} side={DoubleSide} /></mesh>
      {dates.map((p, i) => <mesh key={i} position={p} scale={[1, 0.7, 0.8]} rotation={[0, i, 0.4]}><sphereGeometry args={[0.028, 10, 8]} /><meshStandardMaterial color="#3a1d0d" roughness={0.45} /></mesh>)}
      {[-0.28, 0.28].map((x) => <mesh key={x} position={[x, 0.01, 0.12]} geometry={CUP}><meshStandardMaterial color="#f3ead6" roughness={0.35} /></mesh>)}
    </group>
  )
}

/** مبخرة + دخان: جسيمات تصعد وتتلاشى */
function Mabkhara({ reduced }: { reduced: boolean }) {
  const pts = useRef<Points>(null)
  const N = 42
  const data = useMemo(() => Array.from({ length: N }, (_, i) => ({ t: i / N, x: (Math.random() - 0.5) * 0.05, z: (Math.random() - 0.5) * 0.05, sp: 0.08 + Math.random() * 0.05 })), [])
  const pos = useMemo(() => new BufferAttribute(new Float32Array(N * 3), 3), [])
  const halo = useMemo(() => haloTexture(), [])
  useEffect(() => () => halo.dispose(), [halo])
  useFrame((_, dt) => {
    for (let i = 0; i < N; i++) {
      const d = data[i]
      d.t = (d.t + dt * (reduced ? 0.02 : d.sp)) % 1
      pos.setXYZ(i, d.x + Math.sin(d.t * 7 + i) * 0.06 * d.t, 0.02 + d.t * 0.9, d.z + Math.cos(d.t * 5 + i) * 0.05 * d.t)
    }
    pos.needsUpdate = true
  })
  const base = useMemo(() => lathe([[0, 0], [0.07, 0], [0.09, 0.02], [0.05, 0.05], [0.04, 0.1], [0.075, 0.13], [0.09, 0.17], [0.07, 0.2], [0.03, 0.22], [0, 0.23]], 26), [])
  return (
    <group position={[-1.05, 0.02, -0.4]}>
      <mesh geometry={base}><meshStandardMaterial color="#b58a3d" metalness={1} roughness={0.32} /></mesh>
      <points ref={pts} position={[0, 0.2, 0]}>
        <bufferGeometry><primitive object={pos} attach="attributes-position" /></bufferGeometry>
        <pointsMaterial map={halo} size={0.16} transparent opacity={0.26} depthWrite={false} color="#e8d9c4" sizeAttenuation />
      </points>
    </group>
  )
}

function Lantern({ x, z, halo }: { x: number; z: number; halo: ReturnType<typeof haloTexture> }) {
  return (
    <group position={[x, 2.25, z]}>
      <mesh position={[0, 0.5, 0]}><cylinderGeometry args={[0.004, 0.004, 1, 6]} /><meshBasicMaterial color="#2a1a0e" /></mesh>
      <mesh><cylinderGeometry args={[0.1, 0.06, 0.28, 12, 1, true]} /><meshStandardMaterial color="#8c5a2b" metalness={0.9} roughness={0.4} side={DoubleSide} /></mesh>
      <mesh><sphereGeometry args={[0.07, 14, 14]} /><meshBasicMaterial color="#ffd58a" toneMapped={false} /></mesh>
      <sprite scale={[1.3, 1.3, 1]}><spriteMaterial map={halo} blending={AdditiveBlending} transparent opacity={0.55} depthWrite={false} /></sprite>
    </group>
  )
}

const archShape = (w: number, y0: number, yStraight: number) => {
  const s = new Shape()
  s.moveTo(-w, y0); s.lineTo(w, y0); s.lineTo(w, yStraight); s.absarc(0, yStraight, w, 0, Math.PI, false); s.lineTo(-w, y0)
  return s
}

function Room({ quality }: { quality: Quality }) {
  const T = useMemo(() => ({ sadu: saduTexture(), lat: latticeTexture(), latLight: latticeTexture(true), plaster: plasterTexture(), view: windowViewTexture(), bisht: bishtTexture(), halo: haloTexture() }), [])
  useEffect(() => () => Object.values(T).forEach((t) => t.dispose()), [T])
  useMemo(() => { T.plaster.repeat.set(0.28, 0.28); T.lat.repeat.set(1.1, 1.1); T.latLight.repeat.set(1.5, 1.5) }, [T])
  const wallGeo = useMemo(() => {
    const s = new Shape(); s.moveTo(-3.2, 0); s.lineTo(3.2, 0); s.lineTo(3.2, 3); s.lineTo(-3.2, 3); s.closePath()
    const h = new Path(); h.moveTo(-0.9, 0.8); h.lineTo(0.9, 0.8); h.lineTo(0.9, 1.75); h.absarc(0, 1.75, 0.9, 0, Math.PI, false); h.lineTo(-0.9, 0.8)
    s.holes.push(h)
    return new ShapeGeometry(s, 24)
  }, [])
  const winGeo = useMemo(() => new ShapeGeometry(archShape(0.9, 0.8, 1.75), 24), [])
  const niche = useMemo(() => new ShapeGeometry(archShape(0.34, 0.9, 1.5), 20), [])
  const pool = useRef<Mesh>(null)
  useFrame((s) => { if (pool.current) pool.current.position.x = Math.sin(s.clock.elapsedTime * 0.1) * 0.05 })
  return (
    <group>
      {/* الأرض */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[9, 9]} /><meshStandardMaterial color="#2c1c11" roughness={0.92} /></mesh>
      {/* الجدار الخلفي بفتحة النافذة */}
      <mesh geometry={wallGeo} position={[0, 0, -2.4]}><meshStandardMaterial map={T.plaster} roughness={0.95} /></mesh>
      <mesh position={[0, 1.6, -2.62]}><planeGeometry args={[2.4, 2.4]} /><meshBasicMaterial map={T.view} toneMapped={false} /></mesh>
      <mesh geometry={winGeo} position={[0, 0, -2.36]}><meshStandardMaterial color="#2f1b0d" roughness={0.7} alphaMap={T.lat} alphaTest={0.5} transparent side={DoubleSide} /></mesh>
      {/* جداران جانبيان */}
      <mesh position={[-3.2, 1.5, 0]} rotation={[0, Math.PI / 2, 0]}><planeGeometry args={[6, 3]} /><meshStandardMaterial map={T.plaster} roughness={0.95} /></mesh>
      <mesh position={[3.2, 1.5, 0]} rotation={[0, -Math.PI / 2, 0]}><planeGeometry args={[6, 3]} /><meshStandardMaterial map={T.plaster} roughness={0.95} /></mesh>
      {/* السقف والعوارض */}
      <mesh position={[0, 3, 0]} rotation={[Math.PI / 2, 0, 0]}><planeGeometry args={[7, 7]} /><meshStandardMaterial color="#1e120a" roughness={1} /></mesh>
      {[-1.8, -0.6, 0.6, 1.8].map((z) => <mesh key={z} position={[0, 2.9, z]}><boxGeometry args={[6.4, 0.16, 0.2]} /><meshStandardMaterial color="#3a2412" roughness={0.9} /></mesh>)}
      {/* السجادة (سدو) وبقعة الضوء المتسلّلة من المشربية */}
      <mesh position={[0, 0.012, 0.25]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[3.6, 2.7]} /><meshStandardMaterial map={T.sadu} roughness={0.95} /></mesh>
      <mesh ref={pool} position={[0, 0.02, -0.5]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[2.3, 2.9]} /><meshBasicMaterial map={T.latLight} color="#ffcf8a" transparent opacity={0.4} blending={AdditiveBlending} depthWrite={false} toneMapped={false} /></mesh>
      {/* المقاعد والوسائد */}
      {[[0, -1.95, 4.8, 0.9, 0], [-2.55, 0.1, 0.95, 4.3, 1], [2.55, 0.1, 0.95, 4.3, 1]].map(([x, z, w, d], i) => (
        <mesh key={i} position={[x as number, 0.08, z as number]}><boxGeometry args={[w as number, 0.16, d as number]} /><meshStandardMaterial color={i === 0 ? '#7a5a2e' : '#0f4a33'} roughness={0.95} /></mesh>
      ))}
      {[-1.9, -0.95, 0, 0.95, 1.9].map((x, i) => (
        <RoundedBox key={x} args={[0.7, 0.55, 0.16]} radius={0.06} smoothness={quality === 'low' ? 1 : 3} position={[x, 0.42, -2.2]} rotation={[-0.25, 0, (i - 2) * 0.03]}><meshStandardMaterial color={i % 2 ? '#7b1e22' : '#e9dcc0'} roughness={0.95} /></RoundedBox>
      ))}
      {[-1.4, -0.3, 0.8, 1.7].map((z, i) => (
        <group key={z}>
          <RoundedBox args={[0.16, 0.55, 0.7]} radius={0.06} smoothness={quality === 'low' ? 1 : 3} position={[-2.98 + 0.3, 0.42, z]} rotation={[0, 0, 0.2]}><meshStandardMaterial color={i % 2 ? '#e9dcc0' : '#7b1e22'} roughness={0.95} /></RoundedBox>
          <RoundedBox args={[0.16, 0.55, 0.7]} radius={0.06} smoothness={quality === 'low' ? 1 : 3} position={[2.98 - 0.3, 0.42, z]} rotation={[0, 0, -0.2]}><meshStandardMaterial color={i % 2 ? '#7b1e22' : '#e9dcc0'} roughness={0.95} /></RoundedBox>
        </group>
      ))}
      {/* بشت معلّق على الجدار الأيسر + كوّة مضيئة على الأيمن */}
      <mesh position={[-3.16, 1.55, -0.9]} rotation={[0, Math.PI / 2, 0]}><planeGeometry args={[0.8, 1.12]} /><meshStandardMaterial map={T.bisht} transparent alphaTest={0.3} roughness={0.9} side={DoubleSide} /></mesh>
      <mesh geometry={niche} position={[3.15, 0, -1.4]} rotation={[0, -Math.PI / 2, 0]} scale={[1, 1, 1]}><meshBasicMaterial color="#ffb45a" toneMapped={false} /></mesh>
      <sprite position={[3.0, 1.35, -1.4]} scale={[1.6, 1.6, 1]}><spriteMaterial map={T.halo} blending={AdditiveBlending} transparent opacity={0.5} depthWrite={false} /></sprite>
      <Lantern x={-1.3} z={-0.7} halo={T.halo} />
      <Lantern x={1.3} z={-0.7} halo={T.halo} />
    </group>
  )
}

export default function MajlisScene({ spots, focusId, onSelect, pouring, quality, reduced, seen }: Props) {
  return (
    <Canvas
      dpr={quality === 'high' ? [1, 2] : quality === 'mid' ? [1, 1.5] : [1, 1.2]}
      camera={{ position: HOME.pos.toArray(), fov: 48, near: 0.1, far: 40 }}
      gl={{ antialias: quality !== 'low', powerPreference: 'high-performance' }}
      onCreated={({ gl }) => { gl.toneMapping = ACESFilmicToneMapping; gl.toneMappingExposure = 1.15 }}
      style={{ position: 'absolute', inset: 0 }}
    >
      <color attach="background" args={['#1a1108']} />
      <fog attach="fog" args={['#2a190a', 7, 15]} />
      <ambientLight intensity={0.42} color="#ffd9a8" />
      <hemisphereLight args={['#ffd9a0', '#3a2410', 0.6]} />
      <directionalLight position={[0, 2.6, -2]} intensity={1.7} color="#ffcf8a" />
      <pointLight position={[0, 2.2, 0.4]} intensity={7} distance={7} decay={2} color="#ffb45a" />
      <Environment resolution={quality === 'low' ? 64 : 128} frames={1}>
        <Lightformer form="rect" intensity={4} color="#ffd9a0" position={[0, 2, -4]} scale={[6, 3, 1]} />
        <Lightformer form="rect" intensity={1.6} color="#ffb060" position={[-4, 1.5, 1]} rotation={[0, Math.PI / 2, 0]} scale={[4, 2, 1]} />
        <Lightformer form="rect" intensity={1.2} color="#ffe6c0" position={[4, 2, 2]} rotation={[0, -Math.PI / 2, 0]} scale={[4, 2, 1]} />
      </Environment>
      <Rig focusId={focusId} spots={spots} reduced={reduced} />
      <Room quality={quality} />
      <Dallah pouring={pouring} quality={quality} />
      <Hospitality quality={quality} />
      <Mabkhara reduced={reduced} />
      {!reduced && <Sparkles count={quality === 'low' ? 24 : 70} scale={[2.6, 2.6, 3]} position={[0, 1.4, -0.7]} size={2.6} speed={0.12} opacity={0.5} color="#ffd9a0" />}
      {spots.map((s) => (
        <Html key={s.id} position={s.pos} center zIndexRange={[20, 0]} style={{ pointerEvents: focusId === s.id ? 'none' : 'auto', opacity: focusId && focusId !== s.id ? 0.35 : 1, transition: 'opacity .4s' }}>
          <button className={`mj-spot ${seen.includes(s.id) ? 'mj-spot--seen' : ''}`} onClick={() => onSelect(s.id)} aria-label={`${s.label}: ${s.title}`}>
            <span className="mj-spot__ring" aria-hidden />
            <span className="mj-spot__core" aria-hidden><IconGlyph name={s.icon} /></span>
            <span className="mj-spot__label">{s.label}</span>
          </button>
        </Html>
      ))}
    </Canvas>
  )
}
