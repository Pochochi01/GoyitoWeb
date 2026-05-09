import React from 'react'
import NavBar from '../Components/NavBar/NavBar.jsx'
import Hero from '../Components/Hero/Hero.jsx'
import Category from '../Components/Category/category.jsx'
import Banner from '../Components/Banner/Banner.jsx'
import OtherServices from '../Components/OtherServices/OtherServices.jsx'
import Products from '../Components/Products/Products.jsx'
import Blogs from '../Components/Blogs/Blogs.jsx'
import Partners from '../Components/Partners/Partners.jsx'
import Footer from '../Components/Footer/Footer.jsx'
import Popup from '../Components/Popup/Popup.jsx'
import WhatsAppButton from '../Components/WhatsAppButton.jsx'
import headphone from '../assets/Hero/headphone.png'
import smartwatch2 from '../assets/Category/smartwatch2.png'

const BannerData = {
  discount: "30% OFF",
  title: "Mejor Sonido",
  date: "Del 10 al  28 de Enero",
  image: headphone,
  title2: "Bajos Suaves",
  title3: "Oferta de Verano",
  title4: "Lorem ipsum dolor sit amet consectetur adipisicing elit, pariatur accusantium.",
  bgColor: "#f42c37",
}

const BannerData2 = {
  discount: "40% OFF",
  title: "Coneccion Total",
  date: "Del 10 al  28 de Enero",
  image: smartwatch2,
  title2: "Relojes Inteligentes",
  title3: "Oferta de Verano",
  title4: "Lorem ipsum dolor sit amet consectetur adipisicing elit, pariatur accusantium.",
  bgColor: "#2dcc6f",
}

const Inicio = ({ handleOrderPopup, orderPopup, setOrderPopup }) => {
  return (
    <div className="bg-white dark:bg-gray-900 dark:text-white duration-200 overflow-hidden">
      <NavBar handleOrderPopup={handleOrderPopup} />
      <Hero handleOrderPopup={handleOrderPopup} />
      <Category />
      <OtherServices />
      <Banner data={BannerData} />
      <Products />
      <Banner data={BannerData2} />
      <Blogs />
      <Partners />
      <Footer />
      <Popup orderPopup={orderPopup} setOrderPopup={setOrderPopup} />
      <WhatsAppButton />
    </div>
  )
}

export default Inicio
