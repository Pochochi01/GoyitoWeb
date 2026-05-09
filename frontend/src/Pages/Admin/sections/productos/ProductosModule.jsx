import React, { useState } from 'react'
import { FiBarChart2, FiList, FiBox, FiTag, FiFileText } from 'react-icons/fi'
import ModuleTabNav from '../../../../Components/Admin/ModuleTabNav.jsx'
import ProdDashboard from './tabs/ProdDashboard.jsx'
import ProdListados  from './tabs/ProdListados.jsx'
import ProdStock     from './tabs/ProdStock.jsx'
import ProdPrecios   from './tabs/ProdPrecios.jsx'
import ProdReportes  from './tabs/ProdReportes.jsx'

const TABS = [
  { id:'dashboard', label:'Dashboard',   icon:<FiBarChart2 size={13}/> },
  { id:'listados',  label:'Listados',    icon:<FiList size={13}/>      },
  { id:'stock',     label:'Stock',       icon:<FiBox size={13}/>       },
  { id:'precios',   label:'Precios & Ofertas', icon:<FiTag size={13}/> },
  { id:'reportes',  label:'Reportes',    icon:<FiFileText size={13}/>  },
]

const ProductosModule = () => {
  const [tab, setTab] = useState('dashboard')
  return (
    <div>
      <ModuleTabNav tabs={TABS} active={tab} onChange={setTab}/>
      {tab==='dashboard' && <ProdDashboard/>}
      {tab==='listados'  && <ProdListados/>}
      {tab==='stock'     && <ProdStock/>}
      {tab==='precios'   && <ProdPrecios/>}
      {tab==='reportes'  && <ProdReportes/>}
    </div>
  )
}

export default ProductosModule
