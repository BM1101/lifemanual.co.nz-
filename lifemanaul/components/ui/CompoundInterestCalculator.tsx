'use client'

import { useState, useMemo } from 'react'

function fmt(n: number): string {
  if (n >= 1_000_000) return '$' + (n / 1_000_000).toFixed(2) + 'm'
  if (n >= 1_000) return '$' + Math.round(n / 1_000) + 'k'
  return '$' + Math.round(n).toLocaleString()
}

function buildSeries(startAge: number, monthly: number, rate: number, retireAge: number) {
  const r = rate / 100 / 12
  let bal = 0, contrib = 0
  const pts: { age: number; bal: number; contrib: number }[] = []
  for (let age = 18; age <= retireAge; age++) {
    if (age >= startAge) {
      for (let m = 0; m < 12; m++) {
        bal = bal * (1 + r) + monthly
        contrib += monthly
      }
    }
    pts.push({ age, bal, contrib })
  }
  return pts
}

export function CompoundInterestCalculator() {
  const [monthly, setMonthly] = useState(200)
  const [rate,    setRate]    = useState(7)
  const [retire,  setRetire]  = useState(65)

  const { earlyFinal, lateFinal, rule72 } = useMemo(() => {
    const early = buildSeries(18, monthly, rate, retire)
    const late  = buildSeries(28, monthly, rate, retire)
    return {
      earlyFinal: early[early.length - 1],
      lateFinal:  late[late.length - 1],
      rule72: (72 / rate).toFixed(1),
    }
  }, [monthly, rate, retire])

  const gap = earlyFinal.bal - lateFinal.bal
  const earlyInterestPct = Math.round((1 - earlyFinal.contrib / earlyFinal.bal) * 100)

  return (
    <div className="border border-gray-100 rounded-2xl p-5 my-6 space-y-4">
      <div className="text-sm font-medium text-gray-900">Early vs late starter</div>

      {[
        { label: 'Monthly',     min: 50,  max: 1000, step: 10,  value: monthly, set: setMonthly, fmt: (v: number) => '$' + v + '/mo' },
        { label: 'Return rate', min: 3,   max: 12,   step: 0.5, value: rate,    set: setRate,    fmt: (v: number) => v + '%' },
        { label: 'Until age',   min: 55,  max: 75,   step: 1,   value: retire,  set: setRetire,  fmt: (v: number) => v.toString() },
      ].map(s => (
        <div key={s.label} className="flex items-center gap-3">
          <span className="text-xs text-gray-500 w-24 flex-shrink-0">{s.label}</span>
          <input
            type="range" min={s.min} max={s.max} step={s.step} value={s.value}
            onChange={e => s.set(Number(e.target.value))}
            className="flex-1 h-1.5 rounded-full accent-brand-600"
          />
          <span className="text-xs font-medium text-gray-900 w-16 text-right">{s.fmt(s.value)}</span>
        </div>
      ))}

      <div className="grid grid-cols-3 gap-3 pt-2 border-t border-gray-100">
        <div className="bg-brand-50 rounded-xl p-3">
          <div className="text-xs text-brand-600 mb-1">Starts at 18</div>
          <div className="text-base font-medium text-brand-800">{fmt(earlyFinal.bal)}</div>
          <div className="text-xs text-brand-600 mt-0.5">invested {fmt(earlyFinal.contrib)}</div>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="text-xs text-gray-400 mb-1">Starts at 28</div>
          <div className="text-base font-medium text-gray-700">{fmt(lateFinal.bal)}</div>
          <div className="text-xs text-gray-400 mt-0.5">invested {fmt(lateFinal.contrib)}</div>
        </div>
        <div className="bg-red-50 rounded-xl p-3">
          <div className="text-xs text-red-400 mb-1">Difference</div>
          <div className="text-base font-medium text-red-600">{fmt(gap)}</div>
          <div className="text-xs text-red-400 mt-0.5">from 10 yrs earlier</div>
        </div>
      </div>

      <p className="text-xs text-gray-400 leading-relaxed">
        The early starter contributes {fmt(earlyFinal.contrib)} of real money — the other {earlyInterestPct}% ({fmt(earlyFinal.bal - earlyFinal.contrib)}) is pure compound growth.
        At {rate}%, money doubles every {rule72} years (Rule of 72).
      </p>
    </div>
  )
}
