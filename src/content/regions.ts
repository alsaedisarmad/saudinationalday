import mapJson from './generated/map.json'
import type { Gated } from './types'
import { whcSites } from './heritage'

export interface Region extends Gated {
  id: string
  nameAr: string
  capitalAr: string
  d: string // مسار SVG (geoBoundaries — للتوضيح فقط)
  c: [number, number] // مركز تقريبي في إحداثيات الخريطة
}

const names: Record<string, [string, string]> = {
  riyadh: ['منطقة الرياض', 'الرياض'],
  makkah: ['منطقة مكة المكرمة', 'مكة المكرمة'],
  madinah: ['منطقة المدينة المنورة', 'المدينة المنورة'],
  qassim: ['منطقة القصيم', 'بريدة'],
  eastern: ['المنطقة الشرقية', 'الدمام'],
  asir: ['منطقة عسير', 'أبها'],
  tabuk: ['منطقة تبوك', 'تبوك'],
  hail: ['منطقة حائل', 'حائل'],
  'northern-borders': ['منطقة الحدود الشمالية', 'عرعر'],
  jazan: ['منطقة جازان', 'جازان'],
  najran: ['منطقة نجران', 'نجران'],
  bahah: ['منطقة الباحة', 'الباحة'],
  jawf: ['منطقة الجوف', 'سكاكا'],
}

export const regions: Region[] = (mapJson.regions as unknown as Array<{ id: string; d: string; c: [number, number] }>).map((r) => ({
  id: r.id,
  nameAr: names[r.id][0],
  capitalAr: names[r.id][1],
  d: r.d,
  c: r.c,
  status: 'verified',
  sourceIds: ['saudipedia-provinces', 'geoboundaries'],
}))

export const mapGeometry = {
  viewBox: mapJson.viewBox as unknown as [number, number, number, number],
  outline: mapJson.outline,
  points96: mapJson.points96 as unknown as [number, number][],
  attribution: '© مساهمو OpenStreetMap (ODbL) عبر geoBoundaries — الحدود للتوضيح فقط وليست رسمية',
}

export const regionById = (id: string) => regions.find((r) => r.id === id)!
export const sitesOfRegion = (id: string) => whcSites.filter((s) => s.regionId === id)
