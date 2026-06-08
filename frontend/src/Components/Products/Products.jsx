import React from 'react'
import Heading from '../Shared/Heading.jsx'
import ProductCard from './ProductCard.jsx'
import img1 from '../../assets/Products/p-1.jpg'
import img2 from '../../assets/Products/p-3.jpg'
import img3 from '../../assets/Products/p-4.jpg'
import img4 from '../../assets/Products/p-5.jpg'

const ProductsData = [
    { id: 1, img: img1, title: "Auricular JBL",   price: "120", aosDelay: "0" },
    { id: 2, img: img2, title: "Auricular Sanyo", price: "420", aosDelay: "0" },
    { id: 3, img: img3, title: "Auricular Red",   price: "320", aosDelay: "0" },
    { id: 4, img: img4, title: "Auricular JS",    price: "220", aosDelay: "0" },
]

const Products = () => {
  return (
    <div>
        <div className="container">
            {/* header section*/}
            <Heading title="Nuestros Productos" subtitle={"Conozca Nuestros Productos"}/>
            {/* body section*/}
            <ProductCard data ={ProductsData}/>
        </div>
    </div>
  )
}

export default Products