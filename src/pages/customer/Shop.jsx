import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, X, SlidersHorizontal, Check, ShoppingBag } from 'lucide-react'
import { useProducts, useCategories } from '../../hooks/useProducts'
import ProductCard from '../../components/ProductCard'
import { SkeletonProductGrid } from '../../components/Skeleton'
import WhatsAppButton from '../../components/WhatsAppButton'
import { PageTopBar } from '../../components/TopBar'

const SORT_OPTIONS = [
  { value: 'default',    label: 'Default',           emoji: '✨', desc: 'Curated order' },
  { value: 'price_asc',  label: 'Price: Low → High', emoji: '📉', desc: 'Cheapest first' },
  { value: 'price_desc', label: 'Price: High → Low', emoji: '📈', desc: 'Premium first' },
  { value: 'offers',     label: 'Offers First',       emoji: '🏷️', desc: 'Best discounts' },
]

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '')
  const [sort, setSort] = useState(searchParams.get('sort') === 'offers' ? 'offers' : 'default')
  const [showSortSheet, setShowSortSheet] = useState(false)
  const searchRef = useRef(null)

  const { categories } = useCategories()
  const { products, loading } = useProducts({
    category_id: selectedCategory || undefined,
    search: search || undefined,
  })

  const sorted = [...products].sort((a, b) => {
    if (sort === 'price_asc')  return (a.offer_price || a.price) - (b.offer_price || b.price)
    if (sort === 'price_desc') return (b.offer_price || b.price) - (a.offer_price || a.price)
    if (sort === 'offers') {
      const aHas = a.offer_price ? 1 : 0
      const bHas = b.offer_price ? 1 : 0
      return bHas - aHas
    }
    return 0
  })

  useEffect(() => {
    const cat = searchParams.get('category')
    if (cat) setSelectedCategory(cat)
  }, [searchParams])

  const selectedCategoryName = categories.find((c) => c.id === selectedCategory)?.name

  return (
    <div className="pb-nav page-enter" style={{ background: 'var(--bg-base)', minHeight: '100dvh' }}>
      {/* Mobile topbar */}
      <PageTopBar title="Shop" showBack={false} />

      {/* Desktop heading */}
      <div className="hidden lg:flex items-center justify-between px-8 pt-8 pb-5">
        <div>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '2.2rem', fontWeight: 600,
              letterSpacing: '-.03em', color: 'var(--text-dark)', lineHeight: 1.1,
            }}
          >
            Browse All Products
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', marginTop: 4, color: 'var(--text-muted)' }}>
            Fresh · Daily · Delivered to your door
          </p>
        </div>
        {selectedCategory && (
          <button
            onClick={() => { setSelectedCategory(''); setSearchParams({}) }}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all"
            style={{ background: 'var(--red-50)', color: 'var(--red-600)', border: '1.5px solid var(--red-100)' }}
          >
            <X size={13} /> Clear filter
          </button>
        )}
      </div>

      {/* ─── Sticky search + filter block ─── */}
      <div
        className="sticky-top"
        style={{
          background: 'rgba(245,242,236,0.97)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--border-light)',
          paddingBottom: 10,
          boxShadow: '0 2px 16px rgba(28,26,23,.05)',
        }}
      >
        {/* Search */}
        <div className="px-4 lg:px-8 pt-3">
          <div className="search-bar">
            <Search size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <input
              ref={searchRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search vegetables, fruits…"
              className="flex-1 text-sm outline-none bg-transparent"
              style={{ color: 'var(--text-dark)', fontFamily: 'var(--font-body)' }}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center"
                style={{ background: 'var(--warm-100)', border: 'none', cursor: 'pointer' }}
              >
                <X size={13} style={{ color: 'var(--text-muted)' }} />
              </button>
            )}
          </div>
        </div>

        {/* Category pills + Sort */}
        <div className="flex items-center gap-2 px-4 lg:px-8 pt-2.5 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => { setSelectedCategory(''); setSearchParams({}) }}
            className={`filter-chip flex-shrink-0 ${!selectedCategory ? 'active' : ''}`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => { setSelectedCategory(cat.id); setSearchParams({ category: cat.id }) }}
              className={`filter-chip flex-shrink-0 ${selectedCategory === cat.id ? 'active' : ''}`}
            >
              {cat.emoji} {cat.name}
            </button>
          ))}
          <div className="flex-shrink-0 ml-auto pl-2">
            <button
              onClick={() => setShowSortSheet(true)}
              className={`filter-chip flex-shrink-0 gap-1.5 ${sort !== 'default' ? 'active' : ''}`}
            >
              <SlidersHorizontal size={12} />
              {sort !== 'default' ? SORT_OPTIONS.find(o => o.value === sort)?.label : 'Sort'}
            </button>
          </div>
        </div>
      </div>

      {/* Results summary */}
      {!loading && (
        <div className="px-4 lg:px-8 pt-3 pb-1 flex items-center justify-between">
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-muted)' }}>
            <span style={{ fontWeight: 700, color: 'var(--text-dark)' }}>{sorted.length}</span>
            {' '}item{sorted.length !== 1 ? 's' : ''}
            {selectedCategoryName ? (
              <> in <span style={{ fontWeight: 600, color: 'var(--brand-600)' }}>{selectedCategoryName}</span></>
            ) : ''}
            {search ? (
              <> for "<span style={{ fontWeight: 600, color: 'var(--brand-600)' }}>{search}</span>"</>
            ) : ''}
          </p>
          {sort !== 'default' && (
            <button
              onClick={() => setSort('default')}
              className="flex items-center gap-1"
              style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 600, color: 'var(--red-600)', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <X size={11} /> Clear sort
            </button>
          )}
        </div>
      )}

      {/* ─── Product Grid ─── */}
      <div className="px-4 lg:px-8 pt-2 pb-4">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i}>
                <div className="skeleton mb-2" style={{ height: 164, borderRadius: 18 }} />
                <div className="skeleton h-4 w-3/4 rounded mb-1.5" />
                <div className="skeleton h-5 w-1/2 rounded mb-2" />
                <div className="skeleton h-9 rounded-xl" />
              </div>
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-5">
            <div
              style={{
                width: 80, height: 80, borderRadius: '50%',
                background: 'var(--warm-100)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <ShoppingBag size={34} style={{ color: 'var(--text-light)' }} />
            </div>
            <div className="text-center">
              <p
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.5rem', fontWeight: 600,
                  color: 'var(--text-dark)', letterSpacing: '-.02em',
                  marginBottom: 6,
                }}
              >
                No products found
              </p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-muted)' }}>
                {search ? `No results for "${search}"` : 'No products in this category yet.'}
              </p>
            </div>
            {(search || selectedCategory) && (
              <button
                onClick={() => { setSearch(''); setSelectedCategory(''); setSearchParams({}) }}
                className="btn-primary px-6 py-2.5 text-sm font-semibold rounded-xl"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {sorted.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>

      {/* ─── Sort Bottom Sheet ─── */}
      {showSortSheet && (
        <>
          <div className="bottom-sheet-overlay" onClick={() => setShowSortSheet(false)} />
          <div className="bottom-sheet">
            <div className="flex items-center justify-between mb-5">
              <h3
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.5rem', fontWeight: 600,
                  letterSpacing: '-.02em', color: 'var(--text-dark)',
                }}
              >
                Sort By
              </h3>
              <button
                onClick={() => setShowSortSheet(false)}
                style={{
                  width: 34, height: 34, borderRadius: '50%',
                  background: 'var(--warm-100)', border: 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                }}
              >
                <X size={15} style={{ color: 'var(--text-muted)' }} />
              </button>
            </div>
            <div className="flex flex-col gap-2.5">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => { setSort(opt.value); setShowSortSheet(false) }}
                  className="flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all"
                  style={{
                    background: sort === opt.value ? 'var(--brand-50)' : 'var(--warm-50)',
                    border: sort === opt.value ? '1.5px solid var(--brand-200)' : '1.5px solid transparent',
                    cursor: 'pointer',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span style={{ fontSize: 24 }}>{opt.emoji}</span>
                    <div className="text-left">
                      <span
                        style={{
                          fontFamily: 'var(--font-body)', fontSize: '13.5px', fontWeight: 600,
                          color: sort === opt.value ? 'var(--brand-700)' : 'var(--text-dark)',
                          display: 'block',
                        }}
                      >
                        {opt.label}
                      </span>
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: '11.5px', color: 'var(--text-muted)' }}>
                        {opt.desc}
                      </span>
                    </div>
                  </div>
                  {sort === opt.value && (
                    <div
                      style={{
                        width: 24, height: 24, borderRadius: '50%',
                        background: 'var(--brand-700)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}
                    >
                      <Check size={13} color="#fff" strokeWidth={2.5} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      <WhatsAppButton />
    </div>
  )
}
