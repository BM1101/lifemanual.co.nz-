'use client'

import { useState, useEffect, useRef } from 'react'

function fmtMoney(n: number): string {
  if (n >= 1_000_000) return '$' + (n / 1_000_000).toFixed(2) + 'm'
  if (n >= 1_000) return '$' + Math.round(n / 1_000) + 'k'
  return '$' + Math.round(n).toLocaleString()
}

function buildSeries(start: number, monthly: number, rate: number, years: number) {
  const r = rate / 100 / 12
  let bal = start, contrib = start
  const pts: { y: number; bal: number; contrib: number }[] = []
  for (let y = 1; y <= years; y++) {
    for (let m = 0; m < 12; m++) {
      bal = bal * (1 + r) + monthly
      contrib += monthly
    }
    pts.push({ y, bal: Math.round(bal), contrib: Math.round(contrib) })
  }
  return pts
}

type Tab = 'growth' | 'delay'

export function CompoundInterestCalculator() {
  const [tab, setTab] = useState<Tab>('growth')
  const [start,   setStart]   = useState(1000)
  const [monthly, setMonthly] = useState(200)
  const [rate,    setRate]    = useState(7)
  const [years,   setYears]   = useState(20)
  const [dMonthly, setDMonthly] = useState(200)
  const [dRate,    setDRate]    = useState(7)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chartRef  = useRef<any>(null)

  const pts       = buildSeries(start, monthly, rate, years)
  const final     = pts[pts.length - 1]
  const growth    = final.bal - final.contrib
  const growthPct = Math.round(growth / final.bal * 100)
  const rule72    = (72 / rate).toFixed(1)

  useEffect(() => {
    if (tab !== 'growth') return
    import('chart.js/auto').then(({ default: Chart }) => {
      if (chartRef.current) chartRef.current.destroy()
      const canvas = canvasRef.current
      if (!canvas) return
      chartRef.current = new Chart(canvas, {
        type: 'line',
        data: {
          labels: pts.map(p => 'Yr ' + p.y),
          datasets: [
            { label: 'Portfolio', data: pts.map(p => p.bal), borderColor: '#1D9E75', backgroundColor: 'rgba(29,158,117,0.08)', fill: true, tension: 0.4, pointRadius: 0, borderWidth: 2 },
            { label: 'Contributed', data: pts.map(p => p.contrib), borderColor: '#B4B2A9', backgroundColor: 'transparent', borderDash: [4, 4], tension: 0.4, pointRadius: 0, borderWidth: 1.5 },
          ],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c: any) => c.dataset.label + ': ' + fmtMoney(c.parsed.y) } } },
          scales: {
            x: { grid: { color: 'rgba(128,128,128,0.08)' }, ticks: { color: '#888780', font: { size: 11 }, maxTicksLimit: 10 } },
            y: { grid: { color: 'rgba(128,128,128,0.08)' }, ticks: { color: '#888780', font: { size: 11 }, callback: (v: any) => fmtMoney(v) }, beginAtZero: true },
          },
        },
      })
    })
    return () => { if (chartRef.current) chartRef.current.destroy() }
  }, [tab, start, monthly, rate, years])

  const delayScenarios = [
    { age: 20, label: 'Start at 20' },
    { age: 25, label: 'Start at 25' },
    { age: 30, label: 'Start at 30' },
    { age: 35, label: 'Start at 35' },
    { age: 40, label: 'Start at 40' },
  ].map(s => ({ ...s, bal: buildSeries(0, dMonthly, dRate, 65 - s.age).at(-1)!.bal }))
  const delayMax  = delayScenarios[0].bal
  const delayGap  = delayScenarios[0].bal - delayScenarios[2].bal
  const barColors = ['#1D9E75', '#5DCAA5', '#9FE1CB', '#EF9F27', '#D85A30']

  const sliderRow = 'flex items-center gap-3 mb-3'
  const lbl = 'text-xs text-gray-500 w-36 flex-shrink-0'
  const val = 'text-xs font-medium text-gray-900 w-16 text-right flex-shrink-0'

  return (
    <div className="border border-gray-100 rounded-2xl overflow-hidden my-6">
      <div className="bg-gray-50 border-b border-gray-100 px-4 py-3 flex gap-2">
        {(['growth', 'delay'] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors cursor-pointer ${tab === t ? 'bg-gray-900 text-white border-gray-900 font-medium' : 'border-gray-200 text-gray-500 bg-white hover:bg-gray-50'}`}>
            {t === 'growth' ? 'Growth over time' : 'Cost of waiting'}
          </button>
        ))}
      </div>

      <div className="p-4">

        {tab === 'growth' && <>
          <div className="mb-4">
            {[
              { label: 'Starting amount',      min: 0, max: 50000, step: 500, value: start,   set: setStart,   display: '$' + start.toLocaleString() },
              { label: 'Monthly contribution', min: 0, max: 2000,  step: 25,  value: monthly, set: setMonthly, display: '$' + monthly + '/mo' },
              { label: 'Annual return',        min: 2, max: 15,    step: 0.5, value: rate,    set: setRate,    display: rate.toFixed(1) + '%' },
              { label: 'Years investing',      min: 1, max: 40,    step: 1,   value: years,   set: setYears,   display: years + ' yrs' },
            ].map(s => (
              <div key={s.label} className={sliderRow}>
                <span className={lbl}>{s.label}</span>
                <input type="range" min={s.min} max={s.max} step={s.step} value={s.value}
                  onChange={e => s.set(Number(e.target.value))} className="flex-1 accent-brand-600" />
                <span className={val}>{s.display}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="rounded-xl p-3 bg-brand-50">
              <div className="text-xs text-brand-600 mb-1">Final balance</div>
              <div className="text-lg font-medium text-brand-800">{fmtMoney(final.bal)}</div>
              <div className="text-xs text-brand-600 mt-0.5">after {years} years</div>
            </div>
            <div className="rounded-xl p-3 bg-gray-50">
              <div className="text-xs text-gray-400 mb-1">You contributed</div>
              <div className="text-lg font-medium text-gray-700">{fmtMoney(final.contrib)}</div>
              <div className="text-xs text-gray-400 mt-0.5">of your own money</div>
            </div>
            <div className="rounded-xl p-3 bg-gray-50">
              <div className="text-xs text-gray-400 mb-1">Compound growth</div>
              <div className="text-lg font-medium text-gray-700">{fmtMoney(growth)}</div>
              <div className="text-xs text-gray-400 mt-0.5">{growthPct}% of total</div>
            </div>
          </div>

          <div className="bg-brand-50 rounded-xl px-4 py-3 mb-4 text-sm text-brand-700 leading-relaxed">
            You invest {fmtMoney(final.contrib)} of real money. Compound growth adds {fmtMoney(growth)} on top — {growthPct}% of your final balance you never actually earned from your own pocket.
          </div>

          <div className="flex gap-4 mb-2">
            {[['#1D9E75', 'Portfolio value'], ['#B4B2A9', 'Money contributed']].map(([c, l]) => (
              <div key={l} className="flex items-center gap-1.5 text-xs text-gray-500">
                <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: c }} />{l}
              </div>
            ))}
          </div>

          <div className="relative w-full" style={{ height: 240 }}>
            <canvas ref={canvasRef} role="img"
              aria-label={`Line chart showing portfolio growing to ${fmtMoney(final.bal)} over ${years} years`} />
          </div>

          <p className="text-xs text-gray-400 mt-2">
            Rule of 72: at {rate.toFixed(1)}%, your money doubles every {rule72} years.
          </p>
        </>}

        {tab === 'delay' && <>
          <div className="mb-4">
            {[
              { label: 'Monthly amount', min: 25, max: 1000, step: 25,  value: dMonthly, set: setDMonthly, display: '$' + dMonthly + '/mo' },
              { label: 'Annual return',  min: 2,  max: 15,   step: 0.5, value: dRate,    set: setDRate,    display: dRate.toFixed(1) + '%' },
            ].map(s => (
              <div key={s.label} className={sliderRow}>
                <span className={lbl}>{s.label}</span>
                <input type="range" min={s.min} max={s.max} step={s.step} value={s.value}
                  onChange={e => s.set(Number(e.target.value))} className="flex-1 accent-brand-600" />
                <span className={val}>{s.display}</span>
              </div>
            ))}
          </div>

          <p className="text-xs text-gray-400 mb-4">All scenarios retire at age 65 with the same monthly contribution.</p>

          <div className="mb-4">
            {delayScenarios.map((s, i) => (
              <div key={s.age} className="mb-3">
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-sm text-gray-600">{s.label}</span>
                  <span className="text-sm font-medium text-gray-900">{fmtMoney(s.bal)}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-300"
                    style={{ width: Math.round(s.bal / delayMax * 100) + '%', background: barColors[i] }} />
                </div>
              </div>
            ))}
          </div>

          <div className="bg-brand-50 rounded-xl px-4 py-3 text-sm text-brand-700 leading-relaxed">
            Waiting until 30 instead of starting at 20 costs {fmtMoney(delayGap)} by retirement — on the exact same monthly contribution. That gap is the compound growth those early years would have generated.
          </div>
        </>}

      </div>
    </div>
  )
}
