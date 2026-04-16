'use client'

import { useState, useEffect, useRef } from 'react'

function fmt(n: number): string {
  if (n >= 1_000_000) return '$' + (n / 1_000_000).toFixed(2) + 'm'
  if (n >= 1_000) return '$' + Math.round(n / 1_000) + 'k'
  return '$' + Math.round(n).toLocaleString()
}

function buildSeries(
  monthly: number,
  rate: number,
  startAge: number,
  retireAge: number
): { age: number; bal: number; contrib: number }[] {
  const r = rate / 100 / 12
  let bal = 0, contrib = 0
  const pts = []
  for (let age = startAge; age <= retireAge; age++) {
    for (let m = 0; m < 12; m++) {
      bal = bal * (1 + r) + monthly
      contrib += monthly
    }
    pts.push({ age, bal: Math.round(bal), contrib: Math.round(contrib) })
  }
  return pts
}

type Tab = 'growth' | 'delay' | 'platforms'

export function InvestmentCalculator() {
  const [tab, setTab] = useState<Tab>('growth')

  // Growth tab state
  const [monthly,   setMonthly]   = useState(200)
  const [startAge,  setStartAge]  = useState(28)
  const [retRate,   setRetRate]   = useState(7)
  const [retireAge, setRetireAge] = useState(65)

  // Delay tab state
  const [dMonthly, setDMonthly] = useState(200)
  const [dRate,    setDRate]    = useState(7)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chartRef  = useRef<any>(null)

  // Draw chart whenever growth inputs change
  useEffect(() => {
    if (tab !== 'growth') return
    if (typeof window === 'undefined') return

    import('chart.js/auto').then(({ default: Chart }) => {
      const canvas = canvasRef.current
      if (!canvas) return

      if (chartRef.current) chartRef.current.destroy()

      const pts = buildSeries(monthly, retRate, startAge, retireAge)

      chartRef.current = new Chart(canvas, {
        type: 'line',
        data: {
          labels: pts.map(p => p.age),
          datasets: [
            {
              label: 'Portfolio',
              data: pts.map(p => p.bal),
              borderColor: '#1D9E75',
              backgroundColor: 'rgba(29,158,117,0.08)',
              fill: true,
              tension: 0.4,
              pointRadius: 0,
              borderWidth: 2,
            },
            {
              label: 'Contributed',
              data: pts.map(p => p.contrib),
              borderColor: '#B4B2A9',
              backgroundColor: 'transparent',
              borderDash: [4, 4],
              tension: 0.4,
              pointRadius: 0,
              borderWidth: 1.5,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: { label: (c: any) => c.dataset.label + ': ' + fmt(c.parsed.y) },
            },
          },
          scales: {
            x: {
              grid: { color: 'rgba(128,128,128,0.08)' },
              ticks: { color: '#888780', font: { size: 11 }, maxTicksLimit: 8 },
            },
            y: {
              grid: { color: 'rgba(128,128,128,0.08)' },
              ticks: { color: '#888780', font: { size: 11 }, callback: (v: any) => fmt(v) },
              beginAtZero: true,
            },
          },
        },
      })
    })

    return () => { if (chartRef.current) chartRef.current.destroy() }
  }, [tab, monthly, retRate, startAge, retireAge])

  // ── Growth tab ──────────────────────────────────────────────────────────────

  const growthPts  = buildSeries(monthly, retRate, startAge, retireAge)
  const growthFinal = growthPts[growthPts.length - 1]
  const totalGrowth = growthFinal.bal - growthFinal.contrib
  const growthPct   = Math.round(totalGrowth / growthFinal.bal * 100)
  const years       = retireAge - startAge

  // ── Delay tab ───────────────────────────────────────────────────────────────

  const delayScenarios = [
    { label: 'Start at 20', start: 20 },
    { label: 'Start at 25', start: 25 },
    { label: 'Start at 30', start: 30 },
    { label: 'Start at 35', start: 35 },
    { label: 'Start at 40', start: 40 },
  ].map(s => {
    const pts = buildSeries(dMonthly, dRate, s.start, 65)
    return { ...s, bal: pts[pts.length - 1].bal }
  })
  const delayMax = delayScenarios[0].bal
  const delayGap = delayScenarios[0].bal - delayScenarios[2].bal
  const barColors = ['#1D9E75', '#5DCAA5', '#9FE1CB', '#EF9F27', '#D85A30']

  // ── Shared styles ───────────────────────────────────────────────────────────

  const tabBase  = 'text-xs px-3 py-1.5 rounded-full border cursor-pointer transition-colors'
  const tabOff   = 'border-gray-200 text-gray-500 bg-white hover:bg-gray-50'
  const tabOn    = 'border-gray-900 bg-gray-900 text-white font-medium'
  const sliderRow = 'flex items-center gap-3 mb-3'
  const metricBox = 'rounded-xl p-3'

  return (
    <div className="border border-gray-100 rounded-2xl overflow-hidden my-6">

      {/* Tab bar */}
      <div className="bg-gray-50 border-b border-gray-100 px-4 py-3 flex gap-2 flex-wrap">
        {(['growth', 'delay', 'platforms'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`${tabBase} ${tab === t ? tabOn : tabOff}`}
          >
            {t === 'growth' ? 'Growth calculator' : t === 'delay' ? 'Cost of waiting' : 'NZ platforms'}
          </button>
        ))}
      </div>

      <div className="p-4">

        {/* ── Growth tab ── */}
        {tab === 'growth' && (
          <>
            {/* Sliders */}
            <div className="mb-4">
              {[
                { label: 'Monthly contribution', min: 25,  max: 2000, step: 25,  value: monthly,   set: setMonthly,   display: `$${monthly}/mo` },
                { label: 'Starting age',          min: 18,  max: 50,  step: 1,   value: startAge,  set: setStartAge,  display: `${startAge}` },
                { label: 'Expected return',       min: 4,   max: 12,  step: 0.5, value: retRate,   set: setRetRate,   display: `${retRate.toFixed(1)}%` },
                { label: 'Retire at age',         min: 55,  max: 70,  step: 1,   value: retireAge, set: setRetireAge, display: `${retireAge}` },
              ].map(s => (
                <div key={s.label} className={sliderRow}>
                  <span className="text-xs text-gray-500 w-36 flex-shrink-0">{s.label}</span>
                  <input
                    type="range" min={s.min} max={s.max} step={s.step} value={s.value}
                    onChange={e => s.set(Number(e.target.value))}
                    className="flex-1 accent-brand-600"
                  />
                  <span className="text-xs font-medium text-gray-900 w-16 text-right">{s.display}</span>
                </div>
              ))}
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className={`${metricBox} bg-brand-50`}>
                <div className="text-xs text-brand-600 mb-1">Final balance</div>
                <div className="text-lg font-medium text-brand-800">{fmt(growthFinal.bal)}</div>
                <div className="text-xs text-brand-600 mt-0.5">at age {retireAge}</div>
              </div>
              <div className={`${metricBox} bg-gray-50`}>
                <div className="text-xs text-gray-400 mb-1">You put in</div>
                <div className="text-lg font-medium text-gray-700">{fmt(growthFinal.contrib)}</div>
                <div className="text-xs text-gray-400 mt-0.5">over {years} years</div>
              </div>
              <div className={`${metricBox} bg-gray-50`}>
                <div className="text-xs text-gray-400 mb-1">Compound growth</div>
                <div className="text-lg font-medium text-gray-700">{fmt(totalGrowth)}</div>
                <div className="text-xs text-gray-400 mt-0.5">{growthPct}% of total</div>
              </div>
            </div>

            {/* Insight */}
            <div className="bg-brand-50 rounded-xl px-4 py-3 mb-4 text-sm text-brand-700 leading-relaxed">
              You invest {fmt(growthFinal.contrib)} of your own money over {years} years.
              Compound growth adds {fmt(totalGrowth)} on top — {growthPct}% of your final balance
              that came from growth, not your own pocket.
            </div>

            {/* Legend */}
            <div className="flex gap-4 mb-2">
              {[['#1D9E75', 'Portfolio value'], ['#B4B2A9', 'Amount contributed']].map(([c, l]) => (
                <div key={l} className="flex items-center gap-1.5 text-xs text-gray-500">
                  <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: c }} />
                  {l}
                </div>
              ))}
            </div>

            {/* Chart */}
            <div className="relative w-full" style={{ height: 200 }}>
              <canvas
                ref={canvasRef}
                role="img"
                aria-label={`Line chart showing portfolio growing to ${fmt(growthFinal.bal)} by age ${retireAge}`}
              />
            </div>
          </>
        )}

        {/* ── Delay tab ── */}
        {tab === 'delay' && (
          <>
            <div className="mb-4">
              {[
                { label: 'Monthly contribution', min: 25, max: 1000, step: 25,  value: dMonthly, set: setDMonthly, display: `$${dMonthly}/mo` },
                { label: 'Expected return',       min: 4,  max: 12,  step: 0.5, value: dRate,    set: setDRate,    display: `${dRate.toFixed(1)}%` },
              ].map(s => (
                <div key={s.label} className={sliderRow}>
                  <span className="text-xs text-gray-500 w-36 flex-shrink-0">{s.label}</span>
                  <input
                    type="range" min={s.min} max={s.max} step={s.step} value={s.value}
                    onChange={e => s.set(Number(e.target.value))}
                    className="flex-1 accent-brand-600"
                  />
                  <span className="text-xs font-medium text-gray-900 w-16 text-right">{s.display}</span>
                </div>
              ))}
            </div>

            <div className="mb-4">
              {delayScenarios.map((s, i) => (
                <div key={s.label} className="mb-2.5">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="text-sm text-gray-600">{s.label}</span>
                    <span className="text-sm font-medium text-gray-900">{fmt(s.bal)}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.round(s.bal / delayMax * 100)}%`, background: barColors[i] }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-brand-50 rounded-xl px-4 py-3 text-sm text-brand-700 leading-relaxed">
              Waiting until 30 instead of starting at 20 costs {fmt(delayGap)} by retirement —
              on the exact same monthly contribution. That gap is the compound growth those
              early years would have generated.
            </div>
          </>
        )}

        {/* ── Platforms tab ── */}
        {tab === 'platforms' && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
              {[
                { badge: 'Beginner-friendly', name: 'Sharesies',  detail: 'Start with $1. Fractional shares and funds. Clean, well-designed app. Best for getting started.', fee: '$3/mo under $50k + small transaction fee' },
                { badge: 'No platform fees',  name: 'InvestNow',  detail: 'Invest directly with fund managers. Zero platform fees — great for long-term, set-and-forget investing.', fee: 'Free to use · $250 minimum per fund' },
                { badge: 'NZ-built',          name: 'Kernel',     detail: 'Simple index fund range, low annual fees, no transaction costs. Clean and easy to stick with.', fee: '~0.25%/yr · No transaction fees' },
              ].map(p => (
                <div key={p.name} className="border border-brand-200 rounded-xl p-3.5">
                  <div className="text-xs font-medium text-brand-700 bg-brand-50 rounded-lg px-2 py-0.5 inline-block mb-2">{p.badge}</div>
                  <div className="text-sm font-medium text-gray-900 mb-1.5">{p.name}</div>
                  <div className="text-xs text-gray-500 leading-relaxed mb-2">{p.detail}</div>
                  <div className="text-xs text-gray-400">{p.fee}</div>
                </div>
              ))}
            </div>
            <div className="bg-gray-50 rounded-xl px-4 py-3 text-xs text-gray-400 leading-relaxed">
              All three platforms are regulated by the Financial Markets Authority (FMA).
              Life Manual has no affiliation with any of these platforms — these recommendations
              are based on fees, usability, and regulatory standing only.
            </div>
          </>
        )}

      </div>
    </div>
  )
}
