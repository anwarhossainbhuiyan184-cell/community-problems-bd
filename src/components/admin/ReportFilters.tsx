import { CalendarDays, FilterX, Search } from 'lucide-react'
import { REPORT_CATEGORIES, REPORT_STATUSES, type ReportFilters } from '@/types/report'

interface ReportFiltersProps {
  filters: ReportFilters
  onChange: (key: keyof ReportFilters, value: string) => void
  onReset: () => void
}

export function ReportFilters({ filters, onChange, onReset }: ReportFiltersProps) {
  return (
    <div className="card p-4 sm:p-5">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="md:col-span-2">
          <label htmlFor="filter-search" className="field-label">
            খুঁজুন
          </label>
          <div className="relative">
            <Search
              size={17}
              className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-muted"
              aria-hidden="true"
            />
            <input
              id="filter-search"
              type="search"
              value={filters.search}
              onChange={(event) => onChange('search', event.target.value)}
              className="field-input pl-4 pr-10"
              placeholder="শিরোনাম, বিবরণ বা এলাকা"
            />
          </div>
        </div>

        <div>
          <label htmlFor="filter-category" className="field-label">
            ধরন
          </label>
          <select
            id="filter-category"
            value={filters.category}
            onChange={(event) => onChange('category', event.target.value)}
            className="field-select"
          >
            <option value="">সব ধরন</option>
            {REPORT_CATEGORIES.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="filter-status" className="field-label">
            স্ট্যাটাস
          </label>
          <select
            id="filter-status"
            value={filters.status}
            onChange={(event) => onChange('status', event.target.value)}
            className="field-select"
          >
            <option value="">সব স্ট্যাটাস</option>
            {REPORT_STATUSES.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="filter-area" className="field-label">
            এলাকা
          </label>
          <input
            id="filter-area"
            type="text"
            value={filters.area}
            onChange={(event) => onChange('area', event.target.value)}
            className="field-input"
            placeholder="এলাকার নাম"
          />
        </div>

        <div>
          <label htmlFor="filter-from" className="field-label">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays size={14} aria-hidden="true" />
              থেকে
            </span>
          </label>
          <input
            id="filter-from"
            type="date"
            value={filters.dateFrom}
            onChange={(event) => onChange('dateFrom', event.target.value)}
            className="field-input"
          />
        </div>

        <div>
          <label htmlFor="filter-to" className="field-label">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays size={14} aria-hidden="true" />
              পর্যন্ত
            </span>
          </label>
          <input
            id="filter-to"
            type="date"
            value={filters.dateTo}
            onChange={(event) => onChange('dateTo', event.target.value)}
            className="field-input"
          />
        </div>

        <div className="flex items-end">
          <button type="button" onClick={onReset} className="btn-secondary w-full min-h-12 px-4 text-sm">
            <FilterX size={16} aria-hidden="true" />
            ফিল্টার মুছুন
          </button>
        </div>
      </div>
    </div>
  )
}
