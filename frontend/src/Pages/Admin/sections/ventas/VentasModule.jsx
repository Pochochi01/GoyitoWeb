import React, { useState } from 'react'
import { FiBarChart2, FiShoppingBag, FiUsers, FiFileText } from 'react-icons/fi'
import ModuleTabNav from '../../../../Components/Admin/ModuleTabNav.jsx'
import VentDashboard from './tabs/VentDashboard.jsx'
import VentOrdenes   from './tabs/VentOrdenes.jsx'
import VentClientes  from './tabs/VentClientes.jsx'
import VentReportes  from './tabs/VentReportes.jsx'

const TABS = [
  { id:'dashboard', label:'Dashboard', icon:<FiBarChart2 size={13}/>   },
  { id:'ordenes',   label:'Órdenes',   icon:<FiShoppingBag size={13}/> },
  { id:'clientes',  label:'Clientes',  icon:<FiUsers size={13}/>       },
  { id:'reportes',  label:'Reportes',  icon:<FiFileText size={13}/>    },
]

const VentasModule = () => {
  const [tab, setTab] = useState('dashboard')
  return (
    <div>
      <ModuleTabNav tabs={TABS} active={tab} onChange={setTab}/>
      {tab==='dashboard' && <VentDashboard/>}
      {tab==='ordenes'   && <VentOrdenes/>}
      {tab==='clientes'  && <VentClientes/>}
      {tab==='reportes'  && <VentReportes/>}
    </div>
  )
}

export default VentasModule
