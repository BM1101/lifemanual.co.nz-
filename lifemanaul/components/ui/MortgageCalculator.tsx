'use client'

import { useState, useMemo } from 'react'

function fmt(n: number): string {
  if (n >= 1_000_000) return '$' + (n / 1_000_000).toFixed(2) + 'm'
  if (n >= 1_000) return '$' + Math.round(n / 1_000) + 'k'
  return '$' + Math.round(n).toLocaleString()
}

export function MortgageCalculator() {
  const [price, setPrice]   = useState(700_000)
  const [deposit, setDep]   = useState(20)
  const [rate, setRate]     = useState(6.5)
  const [years, setYears]   = useState(30)

  const { loan, monthly, totalInterest, totalPaid, yr1IntPct } = useMemo(() => {
    const loan = price * (1 - deposit / 100)
    const r = rate / 100 / 12
    const n = years * 12
    const monthly = (loan * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
    const totalPaid = monthly * n
    const totalInterest = totalPaid - loan
    const yr1IntPct = Math.round(((loan * rate) / 100) / (monthly * 12) * 100)
    return { loan, monthly, totalInterest, totalPaid, yr1IntPct }
  }, [price, deposit, rate, years])

  return (
    <div className="border border-gray-100 rounded-2xl p-5 my-6 space-y-4">
      <div className="text-sm font-medium text-gray-900 mb-2">Mortgage calculator</div>

      {[
        { label: 'Home price', min: 200_000, max: 1_500_000, step: 10_000, value: price, set: setPrice, fmt: (v: number) => fmt(v) },
        { label: 'Deposit',    min: 5,       max: 50,        step: 1,      value: deposit, set: setDep, fmt: (v: number) => v + '%' },
        { label: 'Rate',       min: 3,       max: 12,        step: 0.1,    value: rate,   set: setRate, fmt: (v: number) => v.toFixed(1) + '%' },
        { label: 'Term',       min: 10,      max: 30,        step: 1,      value: years,  set: setYears, fmt: (v: number) => v + ' yrs' },
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

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-gray-100">
        {[
          { label: 'Loan',           value: fmt(loan) },
          { label: 'Monthly',        value: '$' + Math.round(monthly).toLocaleString() },
          { label: 'Total interest', value: fmt(totalInterest) },
          { label: 'Total paid',     value: fmt(totalPaid) },
        ].map(m => (
          <div key={m.label} className="bg-gray-50 rounded-xl p-3">
            <div className="text-xs text-gray-400 mb-1">{m.label}</div>
            <div className="text-base font-medium text-gray-900">{m.value}</div>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-400 leading-relaxed pt-1">
        In year 1, about {yr1IntPct}% of every payment is pure interest. Over {years} years,
        you'll pay {fmt(totalInterest)} in interest on top of the {fmt(loan)} loan.
      </p>
    </div>
  )
}
