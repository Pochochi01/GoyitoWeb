import React from 'react'
import { FaCarSide, FaHeadphonesAlt, FaWallet, FaCheckCircle, } from 'react-icons/fa'

const ServiceData = [
  {
    id: 1,
    icon: <FaCarSide className='text-4xl md:text-5xl text-primary'/>,
    title: "Envios Gratis",
    description: "Para todo tipo de Pedidos en nuestra ciudad"
  },
  {
    id: 2,
    icon: <FaCheckCircle className='text-4xl md:text-5xl text-primary'/>,
    title: "Compra Segura",
    description: "Devolucion del producto hasta 30 dias"
  },
  {
    id: 3,
    icon: <FaWallet className='text-4xl md:text-5xl text-primary'/>,
    title: "Pagos Seguros",
    description: "Todos los metodos de pagos asegurados"
  },
  {
    id: 4,
    icon: <FaHeadphonesAlt className='text-4xl md:text-5xl text-primary'/>,
    title: "Soporte Online",
    description: "Ayuda Online 24/7"
  },

]

const OtherServices = () => {
  return (
    <div className='container my-14 md:my-20' >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 gap-y-8">
        {
          ServiceData.map((data) => (
        <div className='flex flex-col items-start sm:flex-row gap-4'>
          {data.icon}
        <div>
        <h1 className='lg:text-xl font-bold'>{data.title}</h1>
        <h1 className='text-gray-400 text-sm'>{data.description}</h1>
        </div>
        </div>
      ))}
      </div>
    </div>
  )
}

export default OtherServices