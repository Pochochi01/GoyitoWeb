import React from 'react'
import Heading from '../Shared/Heading.jsx'
import img1 from '../../assets/Blogs/blog-1.jpg'
import img2 from '../../assets/Blogs/blog-2.jpg'
import img3 from '../../assets/Blogs/blog-3.jpg'

const BlogData = [
    {
        title:"Como Elegir el SmartWatch Perfecto",
        subtitle: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Voluptatum non aut saepe tempora magnam illo repellendus iste",
        published:"Publicado el 23 de Nov de 2024",
        image:img1,
    },
    {
        title:"Como Elegir el Dispositivo Perfecto",
        subtitle: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Voluptatum non aut saepe tempora magnam illo repellendus iste",
        published:"Publicado el 23 de Nov de 2024",
        image:img2,
    },
    {
        title:"Como Elegir el Casco Virtual Perfecto",
        subtitle: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Voluptatum non aut saepe tempora magnam illo repellendus iste",
        published:"Publicado el 23 de Nov de 2024",
        image:img3,
    },
]

const Blogs = () => {
  return (
    <div className='my-12'>
        <div className="container">
            {/* header section*/}
            <Heading title="Noticias" subtitle={"Todo lo que necesitas saber sobre los productos que quieres adquirir"}/>
            {/*Blog section*/}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 gap-y-8 sm:gap-4 md:gap-7">
            {/*blog card*/}
            {
                BlogData.map((data)=> (
                <div key={data.title} className='bg-white dark:bg-gray-900'>
                    {/*image section*/}
                    <div className='overflow-hidden rounded-2xl mb-2'>
                        <img src={data.image} alt=""
                        className='w-full h-[220px] object-cover rounded-2xl hover:scale-105 duration-500'
                        />
                    </div>
                    {/* content section*/ }
                    <div className='space-y-2'>
                        <p className='text-xs text-gray-500'>{data.published}</p>
                        <p className='font-bold line-clamp-1'>{data.title}</p>
                        <p className='line-clamp-2 text-sm text-gray-600 dark:text-gray-400'>{data.subtitle}</p>
                    </div>
                </div>
                ))
            }
            </div>
        </div>
    </div>
  )
}

export default Blogs