import { useSeo } from '../../hooks/useSeo'
import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, X, SlidersHorizontal, Check, ShoppingBag } from 'lucide-react'
import { useAllProducts, useCategories } from '../../hooks/useProducts'
import { smartSearch } from '../../utils/search'
import ProductCard from '../../components/ProductCard'
import WhatsAppButton from '../../components/WhatsAppButton'
import { PageTopBar } from '../../components/TopBar'
import { t } from '../../i18n/index'

const SORT_OPTIONS = [
  { value: 'default',    label: 'Default',           emoji: '✨', desc: 'Curated order' },
  { value: 'price_asc',  label: 'Price: Low → High', emoji: '📉', desc: 'Cheapest first' },
  { value: 'price_desc', label: 'Price: High → Low', emoji: '📈', desc: 'Premium first' },
  { value: 'offers',     label: 'Offers First',       emoji: '🏷️', desc: 'Best discounts' },
]

// ── Primary tabs — bilingual (English + Tamil) ─────────────────────────────
// 'type' maps to the category.type column ('vegetable' | 'fruit').
// 'offers' is a special filter — products with offer_price set.
const PRIMARY_TABS = [
  { key: 'all',       label: 'All',        labelTa: t('category.all'),       emoji: '🛒' },
  { key: 'vegetable', label: 'Vegetables', labelTa: t('category.vegetable'), emoji: '🥬' },
  { key: 'fruit',     label: 'Fruits',     labelTa: t('category.fruit'),     emoji: '🍎' },
  { key: 'offers',    label: 'Offers',     labelTa: t('category.offers'),    emoji: '🏷️' },
]

export default function Shop() {
  useSeo({
    title: 'Shop Fresh Vegetables & Fruits',
    description: 'Browse 100+ fresh vegetables, fruits and herbs. Daily stock, farm-fresh quality. Order online for same-day delivery in Chennai.',
  })
  const [searchParams, setSearchParams] = useSearchParams()
  const [search,       setSearch]       = useState('')
  const [activeTab,    setActiveTab]    = useState(() => {
    // Restore tab from URL: ?type=vegetable|fruit|offers
    const t = searchParams.get('type')
    return PRIMARY_TABS.find(tb => tb.key === t) ? t : 'all'
  })
  const [sort,         setSort]         = useState(searchParams.get('sort') === 'offers' ? 'offers' : 'default')
  const [showSortSheet, setShowSortSheet] = useState(false)
  const searchRef = useRef(null)

  const { categories } = useCategories()
  const { products: allProducts, loading } = useAllProducts()

  // Build a set of category IDs for each type (populated once categories load)
  const catIdsByType = { vegetable: new Set(), fruit: new Set() }
  categories.forEach(c => {
    if (c.type === 'vegetable') catIdsByType.vegetable.add(c.id)
    if (c.type === 'fruit')     catIdsByType.fruit.add(c.id)
  })

  // 1. Primary tab filter
  const byTab = (() => {
    if (activeTab === 'vegetable') return allProducts.filter(p => catIdsByType.vegetable.has(p.category_id))
    if (activeTab === 'fruit')     return allProducts.filter(p => catIdsByType.fruit.has(p.category_id))
    if (activeTab === 'offers')    return allProducts.filter(p => p.offer_price !== null && p.offer_price < p.price)
    return allProducts  // 'all'
  })()

  // 2. Smart search (Tanglish + fuzzy) — client-side
  const searched = search.trim() ? smartSearch(byTab, search) : byTab

  // 3. Sort — OOS products always go to the bottom (regardless of other sort criteria)
  const stockOrder = { in_stock: 0, limited: 1, out_of_stock: 2 }
  const sorted = [...searched].sort((a, b) => {
    // Always push out-of-stock to end
    const stockDiff = (stockOrder[a.stock_status] ?? 0) - (stockOrder[b.stock_status] ?? 0)
    if (stockDiff !== 0) return stockDiff
    // Then apply user's sort within each availability group
    if (sort === 'price_asc')  return (a.offer_price || a.price) - (b.offer_price || b.price)
    if (sort === 'price_desc') return (b.offer_price || b.price) - (a.offer_price || a.price)
    if (sort === 'offers')     return (b.offer_price ? 1 : 0) - (a.offer_price ? 1 : 0)
    return 0  // default: preserve relevance order from smartSearch
  })

  // Sync tab from URL changes (e.g. navigating from Home category tiles)
  useEffect(() => {
    const t = searchParams.get('type')
    if (t && PRIMARY_TABS.find(tb => tb.key === t)) setActiveTab(t)
    // Legacy support: ?category=uuid → clear to 'all' (old URLs)
    if (searchParams.get('category')) {
      setSearchParams({})
    }
  }, [searchParams])  // eslint-disable-line react-hooks/exhaustive-deps

  const selectTab = (key) => {
    setActiveTab(key)
    setSearch('')
    if (key === 'all') setSearchParams({})
    else setSearchParams({ type: key })
  }

  const activeTabLabel = PRIMARY_TABS.find(t => t.key === activeTab)?.label || ''

  return (
    <div className="pb-nav page-enter" style={{ background: 'var(--bg-base)', minHeight: '100dvh' }}>
      {/* Mobile topbar */}
      <PageTopBar title="Shop" showBack={false} />

      {/* Desktop heading */}
      <div className="hidden lg:flex items-center justify-between px-8 pt-8 pb-5">
        <div>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 600,
            letterSpacing: '-.03em', color: 'var(--text-dark)', lineHeight: 1.1,
          }}>
            Fresh Produce
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', marginTop: 4, color: 'var(--text-muted)' }}>
            Farm-fresh · Daily · Delivered to your door
          </p>
        </div>
        {activeTab !== 'all' && (
          <button
            onClick={() => selectTab('all')}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
            style={{ background: 'var(--red-50)', color: 'var(--red-600)', border: '1.5px solid var(--red-100)' }}
          >
            <X size={13} /> Show all
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
              placeholder="Search vegetables, fruits, keerai…"
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

        {/* ── Primary tabs + Sort ── */}
        <div className="flex items-center gap-2 px-4 lg:px-8 pt-2.5 pb-0.5">
          {PRIMARY_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => selectTab(tab.key)}
              className="flex-shrink-0 flex items-center gap-1.5 transition-all"
              style={{
                height: 'auto',
                padding: '6px 14px',
                borderRadius: 99,
                fontFamily: 'var(--font-body)',
                cursor: 'pointer',
                border: activeTab === tab.key ? 'none' : '1.5px solid var(--border)',
                background: activeTab === tab.key ? 'var(--brand-800)' : 'var(--bg-card)',
                color: activeTab === tab.key ? '#fff' : 'var(--text-mid)',
                boxShadow: activeTab === tab.key ? '0 2px 8px rgba(22,101,52,.25)' : 'none',
              }}
            >
              <span style={{ fontSize: 14 }}>{tab.emoji}</span>
              {/* Bilingual: English bold + Tamil smaller below */}
              <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0 }}>
                <span style={{ fontSize: '12.5px', fontWeight: 700, lineHeight: 1.3 }}>{tab.label}</span>
                {tab.labelTa && (
                  <span style={{
                    fontSize: '9.5px', lineHeight: 1.2,
                    opacity: activeTab === tab.key ? 0.75 : 0.6,
                    fontWeight: 400,
                  }}>
                    {tab.labelTa}
                  </span>
                )}
              </span>
            </button>
          ))}

          {/* Sort — pushed right */}
          <div className="flex-1" />
          <button
            onClick={() => setShowSortSheet(true)}
            className="flex-shrink-0 flex items-center gap-1.5 transition-all"
            style={{
              height: 36, padding: '0 12px', borderRadius: 99,
              fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600,
              cursor: 'pointer',
              border: sort !== 'default' ? 'none' : '1.5px solid var(--border)',
              background: sort !== 'default' ? 'var(--brand-800)' : 'var(--bg-card)',
              color: sort !== 'default' ? '#fff' : 'var(--text-mid)',
            }}
          >
            <SlidersHorizontal size={12} />
            {sort !== 'default' ? SORT_OPTIONS.find(o => o.value === sort)?.label : 'Sort'}
          </button>
        </div>
      </div>

      {/* Results summary */}
      {!loading && (
        <div className="px-4 lg:px-8 pt-3 pb-1 flex items-center justify-between">
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-muted)' }}>
            <span style={{ fontWeight: 700, color: 'var(--text-dark)' }}>{sorted.length}</span>
            {' '}item{sorted.length !== 1 ? 's' : ''}
            {activeTab !== 'all' && !search && (
              <> in <span style={{ fontWeight: 600, color: 'var(--brand-600)' }}>{activeTabLabel}</span></>
            )}
            {search && (
              <> for "<span style={{ fontWeight: 600, color: 'var(--brand-600)' }}>{search}</span>"</>
            )}
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
            <div style={{ fontSize: 56 }}>
              {activeTab === 'vegetable' ? '🥬' : activeTab === 'fruit' ? '🍎' : activeTab === 'offers' ? '🏷️' : '🛒'}
            </div>
            <div className="text-center">
              <p style={{
                fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 600,
                color: 'var(--text-dark)', letterSpacing: '-.02em', marginBottom: 6,
              }}>
                No products found
              </p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-muted)', maxWidth: 280, margin: '0 auto' }}>
                {search
                  ? `No results for "${search}". Try another spelling or search in English.`
                  : activeTab === 'offers'
                    ? 'No offers available right now. Check back soon!'
                    : `No ${activeTabLabel.toLowerCase()} in stock right now.`}
              </p>
            </div>
            {(search || activeTab !== 'all') && (
              <button
                onClick={() => { setSearch(''); selectTab('all') }}
                style={{
                  padding: '10px 24px', borderRadius: 12, border: 'none', cursor: 'pointer',
                  background: 'var(--brand-800)', color: '#fff',
                  fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 700,
                }}
              >
                Show all products
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
              <h3 style={{
                fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 600,
                letterSpacing: '-.02em', color: 'var(--text-dark)',
              }}>
                Sort By
              </h3>
              <button
                onClick={() => setShowSortSheet(false)}
                style={{
                  width: 34, height: 34, borderRadius: '50%', background: 'var(--warm-100)',
                  border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
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
                      <span style={{
                        fontFamily: 'var(--font-body)', fontSize: '13.5px', fontWeight: 600,
                        color: sort === opt.value ? 'var(--brand-700)' : 'var(--text-dark)', display: 'block',
                      }}>
                        {opt.label}
                      </span>
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: '11.5px', color: 'var(--text-muted)' }}>
                        {opt.desc}
                      </span>
                    </div>
                  </div>
                  {sort === opt.value && (
                    <div style={{
                      width: 24, height: 24, borderRadius: '50%', background: 'var(--brand-700)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
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
