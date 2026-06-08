import React, { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import NavBar from '../Components/NavBar/NavBar.jsx'
import Footer from '../Components/Footer/Footer.jsx'
import Popup from '../Components/Popup/Popup.jsx'
import Heading from '../Components/Shared/Heading.jsx'
import ShopProductCard from '../Components/Store/ShopProductCard.jsx'
import { FiFilter, FiTag, FiChevronDown } from 'react-icons/fi'
import AOS from 'aos'
import productService from '../api/services/productService'
import categoryService from '../api/services/categoryService'
import WhatsAppButton from '../Components/WhatsAppButton.jsx'

const SORT_OPTIONS = [
  { value: 'default',    label: 'Relevancia' },
  { value: 'price_asc',  label: 'Precio: menor a mayor' },
  { value: 'price_desc', label: 'Precio: mayor a menor' },
]

const Tienda = ({ handleOrderPopup, orderPopup, setOrderPopup }) => {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialCat = searchParams.get('categoria') || 'Todos'

  const [products,        setProducts]        = useState([])
  const [categories,      setCategories]      = useState(['Todos'])
  const [activeCategory,  setActiveCategory]  = useState(initialCat)
  const [sortBy,          setSortBy]          = useState('default')
  const [onlyOffers,      setOnlyOffers]      = useState(false)
  const [sortOpen,        setSortOpen]        = useState(false)
  const [loading,         setLoading]         = useState(true)

  useEffect(() => {
    AOS.refresh()
    window.scrollTo({ top: 0 })
  }, [])

  useEffect(() => {
    Promise.all([
      productService.getAll({ limit: 100, activo: 1 }),
      categoryService.getAll(),
    ]).then(([prod, cats]) => {
      setProducts(prod.data)
      const nombres = cats.map((c) => c.nombre)
      setCategories(['Todos', ...nombres])
      // Si el query param trae una categoría que ya no existe → volver a "Todos"
      if (initialCat !== 'Todos' && !nombres.includes(initialCat)) {
        setActiveCategory('Todos')
      }
    }).catch(console.error).finally(() => setLoading(false))
  }, [])  // eslint-disable-line react-hooks/exhaustive-deps

  // Sincroniza el filtro activo con la URL (sin recargar la página).
  const handleSetCategory = (cat) => {
    setActiveCategory(cat)
    if (cat === 'Todos') {
      searchParams.delete('categoria')
    } else {
      searchParams.set('categoria', cat)
    }
    setSearchParams(searchParams, { replace: true })
  }

  const filteredProducts = useMemo(() => {
    let result = [...products]
    if (activeCategory !== 'Todos') result = result.filter(p => p.category === activeCategory)
    if (onlyOffers)                 result = result.filter(p => p.discount > 0)
    if (sortBy === 'price_asc') {
      result.sort((a, b) => {
        const pa = a.discount > 0 ? a.price * (1 - a.discount / 100) : a.price
        const pb = b.discount > 0 ? b.price * (1 - b.discount / 100) : b.price
        return pa - pb
      })
    } else if (sortBy === 'price_desc') {
      result.sort((a, b) => {
        const pa = a.discount > 0 ? a.price * (1 - a.discount / 100) : a.price
        const pb = b.discount > 0 ? b.price * (1 - b.discount / 100) : b.price
        return pb - pa
      })
    }
    return result
  }, [products, activeCategory, sortBy, onlyOffers])

  const offerProducts = useMemo(
    () => products.filter(p => p.discount > 0).slice(0, 4),
    [products]
  )

  const activeSortLabel = SORT_OPTIONS.find(o => o.value === sortBy)?.label

  return (
    <div className="bg-white dark:bg-gray-900 dark:text-white duration-200 min-h-screen flex flex-col">
      <NavBar handleOrderPopup={handleOrderPopup} />

      <main className="flex-1">
        {/* ── Hero ── */}
        <section className="bg-gradient-to-r from-primary/10 to-primary/5 dark:from-gray-800 dark:to-gray-900 py-10">
          <div className="container text-center">
            <h1 className="text-4xl lg:text-5xl font-bold mb-2">
              Nuestra <span className="text-primary">Tienda</span>
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Encontrá los mejores productos de tecnología al mejor precio
            </p>
          </div>
        </section>

        {/* ── Ofertas destacadas ── */}
        {offerProducts.length > 0 && (
          <section className="py-10 bg-gray-50 dark:bg-gray-800/40">
            <div className="container">
              <div className="flex items-center gap-3 mb-6">
                <FiTag className="text-primary text-2xl" />
                <Heading title="Ofertas Destacadas" subtitle="Solo por tiempo limitado — ¡no te las pierdas!" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
                {offerProducts.map(product => (
                  <ShopProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Catálogo completo ── */}
        <section className="py-10">
          <div className="container">
            <Heading title="Todos los Productos" subtitle="Explorá nuestro catálogo completo" />

            {/* Filtros */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-8">
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <button key={cat} onClick={() => handleSetCategory(cat)}
                    className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all duration-200
                      ${activeCategory === cat
                        ? 'bg-primary text-white border-primary shadow-md'
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-primary hover:text-primary'
                      }`}>
                    {cat}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                <button onClick={() => setOnlyOffers(v => !v)}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold border transition-all duration-200
                    ${onlyOffers
                      ? 'bg-brandGreen text-white border-brandGreen shadow-md'
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-brandGreen hover:text-brandGreen'
                    }`}>
                  <FiTag /> Solo Ofertas
                </button>

                <div className="relative">
                  <button onClick={() => setSortOpen(v => !v)}
                    className="flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold border
                               bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300
                               border-gray-200 dark:border-gray-600 hover:border-primary hover:text-primary
                               transition-all duration-200 min-w-[180px] justify-between">
                    <span className="flex items-center gap-2"><FiFilter />{activeSortLabel}</span>
                    <FiChevronDown className={`transition-transform duration-200 ${sortOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {sortOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 z-50 overflow-hidden">
                      {SORT_OPTIONS.map(opt => (
                        <button key={opt.value} onClick={() => { setSortBy(opt.value); setSortOpen(false) }}
                          className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors duration-150
                            ${sortBy === opt.value ? 'bg-primary/10 text-primary' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-20">
                <span className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-400 mb-5">
                  {filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
                </p>
                {filteredProducts.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredProducts.map(product => (
                      <ShopProductCard key={product.id} product={product} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20 text-gray-400">
                    <p className="text-5xl mb-4">🔍</p>
                    <p className="text-lg font-semibold">No hay productos con estos filtros</p>
                    <button onClick={() => { handleSetCategory('Todos'); setOnlyOffers(false) }}
                      className="mt-4 text-primary underline text-sm">
                      Limpiar filtros
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>

      <Footer />
      <Popup orderPopup={orderPopup} setOrderPopup={setOrderPopup} />
      <WhatsAppButton />
    </div>
  )
}

export default Tienda
