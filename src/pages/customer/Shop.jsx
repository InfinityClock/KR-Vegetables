import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, X, SlidersHorizontal, Check } from 'lucide-react'
import { useProducts, useCategories } from '../../hooks/useProducts'
import ProductCard from '../../components/ProductCard'
import { SkeletonProductGrid } from '../../components/Skeleton'
import WhatsAppButton from '../../components/WhatsAppButton'
import { PageTopBar } from '../../components/TopBar'

const SORT_OPTIONS = [
  { value: 'default',    label: 'Default',       emoji: '✨' },
  { value: 'price_asc',  label: 'Price: Low → High', emoji: '📉' },
  { value: 'price_desc', label: 'Price: High → Low', emoji: '📈' },
  { value: 'offers',     label: 'Offers First',  emoji: '🏷️' },
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
      <div className="hidden lg:flex items-center justify-between px-8 pt-8 pb-2">
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'Playfair Display, serif', color: 'var(--text-dark)' }}>
          Browse All Products
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Fresh · Daily · Delivered</p>
      </div>

      {/* Sticky search + filter block */}
      <div
        className="sticky-top"
        style={{
          background: 'rgba(255,253,247,0.95)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--border-light)',
          paddingBottom: 10,
        }}
      >
        {/* Search */}
        <div className="px-4 lg:px-8 pt-3">
          <div className="search-bar">
            <Search size={17} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <input
              ref={searchRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search vegetables, fruits..."
              className="flex-1 text-sm outline-none bg-transparent"
              style={{ color: 'var(--text-dark)' }}
            />
            {search && (
              <button onClick={() => setSearch('')} className="flex-shrink-0">
                <X size={15} style={{ color: 'var(--text-muted)' }} />
              </button>
            )}
          </div>
        </div>

        {/* Category chips + sort */}
        <div className="flex items-center gap-2 px-4 lg:px-8 pt-2.5">
          <div className="flex-1 flex gap-2 overflow-x-auto scrollbar-hide">
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
          </div>

          <button
            onClick={() => setShowSortSheet(true)}
            className={`filter-chip flex-shrink-0 ${sort !== 'default' ? 'active' : ''}`}
            style={{ gap: 6 }}
          >
            <SlidersHorizontal size={13} />
            Sort
          </button>
        </div>
      </div>

      {/* Results summary */}
      {!loading && (
        <div className="px-4 lg:px-8 pt-3 pb-1 flex items-center justify-between">
          <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
            {sorted.length} item{sorted.length !== 1 ? 's' : ''}
            {selectedCategoryName ? ` in ${selectedCategoryName}` : ''}
            {search ? ` for "${search}"` : ''}
          </p>
          {sort !== 'default' && (
            <button
              onClick={() => setSort('default')}
              className="text-xs font-medium flex items-center gap-1"
              style={{ color: 'var(--orange-dark)' }}
            >
              <X size={12} /> Clear sort
            </button>
          )}
        </div>
      )}

      {/* Product Grid */}
      <div className="px-4 lg:px-8 pt-1 pb-4">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i}>
                <div className="skeleton rounded-2xl mb-2" style={{ height: 150 }} />
                <div className="skeleton h-4 w-3/4 rounded mb-1.5" />
                <div className="skeleton h-5 w-1/2 rounded mb-2" />
                <div className="skeleton h-8 rounded-xl" />
              </div>
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="text-5xl">🔍</div>
            <p className="font-semibold text-lg" style={{ color: 'var(--text-dark)', fontFamily: 'Playfair Display, serif' }}>
              No products found
            </p>
            <p className="text-sm text-center" style={{ color: 'var(--text-muted)' }}>
              {search ? `No results for "${search}"` : 'No products in this category yet.'}
            </p>
            {(search || selectedCategory) && (
              <button
                onClick={() => { setSearch(''); setSelectedCategory(''); setSearchParams({}) }}
                className="mt-1 px-5 py-2.5 rounded-full text-sm font-semibold text-white"
                style={{ background: 'var(--green-mid)' }}
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

      {/* Sort Bottom Sheet */}
      {showSortSheet && (
        <>
          <div className="bottom-sheet-overlay" onClick={() => setShowSortSheet(false)} />
          <div className="bottom-sheet">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold" style={{ fontFamily: 'Playfair Display, serif', color: 'var(--text-dark)' }}>
                Sort By
              </h3>
              <button onClick={() => setShowSortSheet(false)}>
                <X size={20} style={{ color: 'var(--text-muted)' }} />
              </button>
            </div>
            <div className="flex flex-col gap-1">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => { setSort(opt.value); setShowSortSheet(false) }}
                  className="flex items-center justify-between px-4 py-3.5 rounded-xl transition-colors"
                  style={{
                    background: sort === opt.value ? 'var(--green-tint)' : 'transparent',
                    border: sort === opt.value ? '1.5px solid var(--green-pale)' : '1.5px solid transparent',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{opt.emoji}</span>
                    <span
                      className="text-sm font-medium"
                      style={{ color: sort === opt.value ? 'var(--green-dark)' : 'var(--text-mid)' }}
                    >
                      {opt.label}
                    </span>
                  </div>
                  {sort === opt.value && <Check size={16} style={{ color: 'var(--green-mid)' }} />}
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
