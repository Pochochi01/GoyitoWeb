import React, { useState } from 'react'
import { FiBarChart2, FiShoppingCart, FiUsers, FiFileText } from 'react-icons/fi'
import ModuleTabNav from '../../../../Components/Admin/ModuleTabNav.jsx'
import CompDashboard  from './tabs/CompDashboard.jsx'
import CompGestion    from './tabs/CompGestion.jsx'
import CompProveedores from './tabs/CompProveedores.jsx'
import CompReportes   from './tabs/CompReportes.jsx'

const TABS = [
  { id:'dashboard',   label:'Dashboard',   icon:<FiBarChart2 size={13}/>    },
  { id:'gestion',     label:'Órdenes',     icon:<FiShoppingCart size={13}/> },
  { id:'proveedores', label:'Proveedores', icon:<FiUsers size={13}/>        },
  { id:'reportes',    label:'Reportes',    icon:<FiFileText size={13}/>     },
]

const ComprasModule = () => {
  const [tab, setTab] = useState('dashboard')
  return (
    <div>
      <ModuleTabNav tabs={TABS} active={tab} onChange={setTab}/>
      {tab==='dashboard'   && <CompDashboard/>}
      {tab==='gestion'     && <CompGestion/>}
      {tab==='proveedores' && <CompProveedores/>}
      {tab==='reportes'    && <CompReportes/>}
    </div>
  )
}

export default ComprasModule
