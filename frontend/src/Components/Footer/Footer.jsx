import React from 'react'
import { FaMobileAlt } from 'react-icons/fa'
import { FaFacebook, FaInstagram, FaLinkedin, FaLocationArrow } from 'react-icons/fa6'

const FooterLink = [
    {
        title:"Inicio",
        link:"/#,"
    },
    {
        title:"Quienes Somos",
        link:"/#,"
    },
    {
        title:"Contactanos",
        link:"/#,"
    },
    {
        title:"Noticias",
        link:"/#,"
    },
]

const Footer = () => {
  return (
    <div className='dark:bg-gray-950'>
        <div className="container">
            <div className="grid md:grid-cols-3 pb-20 pt-5">
                {/*company detail*/}
                <div className='py-8 px-4'>
                    <a href="#" className='text-primary font-semibold tracking-widest text-2xl
                    uppercase sm:text-3xl'>
                    Goyitos's Digital
                    </a>
                    <p className='text-gray-600 dark:text-white/70 lg:pr-24 pt-3'>
                        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ratione excepturi sint eaque cum odio vitae necessitatibus.
                    </p>
                    <p className='text-gray-500 mt-4'>Pagina realizada por Two Brother's Design Web</p>
                    <a href="https://www.youtube.com/watch?v=EfKqSnXfCzQ" target='_blank' className='inline-block bg-primary/90 text-white py-2 px-4 
                    mt-4 text-sm rounded-full'>Visita nuestro canal de Youtube</a>
                </div>
                {/*Footer Links*/}
                <div className='col-span-2 grid grid-cols-2 sm:grid-cols-3 md:pl-10'>
                    <div className='py-8 px-4'>
                        <h1 className='text-xl font-bold sm:text-left mb-3'>
                            Enlaces Importantes
                        </h1>
                        <ul className='space-y-3'>
                            {
                                FooterLink.map((data,index) => (
                                    <li key={index}>
                                        <a href={data.link}
                                        className='text-gray-600 dark:text-gray-400 hover:dark:text-white hover:text-black duration-300'
                                        >
                                            {data.title}
                                        </a>
                                    </li>
                                ))
                            }
                        </ul>
                    </div>
                    {/*Second Cols Links*/}
                    <div className='py-8 px-4'>
                        <h1 className='text-xl font-bold sm:text-left mb-3'>
                            Enlaces Importantes
                        </h1>
                        <ul className='space-y-3'>
                            {
                                FooterLink.map((data,index) => (
                                    <li key={index}>
                                        <a href={data.link}
                                        className='text-gray-600 dark:text-gray-400 hover:dark:text-white hover:text-black duration-300'
                                        >
                                            {data.title}
                                        </a>
                                    </li>
                                ))
                            }
                        </ul>
                    </div>
                {/*Company address*/}
                <div className='py-8 px-4 col-span-2 sm:col-auto justify-center'>
                    <h1 className='text-xl font-bold sm:text-left mb-3'>Direcciones</h1>
                    <div>
                        <div className="flex items-center  gap-3">
                            <FaLocationArrow/>
                            <p>San Martin 835, Aguilares</p>
                        </div>
                        <div className='flex items-center gap-3'>
                            <p>Tucuman - Argentina</p>
                        </div>  
                        
                        <div className="flex items-center gap-3 mt-6">
                            <FaMobileAlt/>
                            <p>+5493816290089</p>
                        </div>                 
                        {/*Social Link*/}
                        <div className='flex itemcç gap-3 mt-6'>
                            <a href="#">
                                <FaInstagram className='text-3xl hover:text-primary duration-300'/>
                            </a>
                            <a href="#">
                                <FaFacebook className='text-3xl hover:text-primary duration-300'/>
                            </a>
                            <a href="#">
                                <FaLinkedin className='text-3xl hover:text-primary duration-300'/>
                            </a>
                        </div>

                    </div>
                </div>
                </div>
            </div>
        </div>
    </div>
  )
}

export default Footer