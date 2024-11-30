import React from 'react'
import NavBar from './Components/NavBar/NavBar.jsx'
import Hero from './Components/Hero/Hero.jsx'
import Category from './Components/Category/category.jsx'
import Banner from './Components/Banner/Banner.jsx'
import AOS from 'aos';
import 'aos/dist/aos.css';
import OtherServices from './Components/OtherServices/OtherServices.jsx';
import headphone from './assets/Hero/headphone.png'
import Products from './Components/Products/Products.jsx'

const BannerData = {
  discount: "30% OFF",
  title: "Mejor Sonido",
  date: "Del 10 al  28 de Enero",
  image: headphone,
  title2: "Bajos Suaves",
  title3: "Oferta de Verano",
  title4: "Lorem ipsum dolor sit amet consectetur adipisicing elit, pariatur accusantium.",
  bgColor:"#f42c37",

}




const App = () => {

  React.useEffect(()=>{
    AOS.init({
      offset:100,
      duration:800,
      easing: "ease-in-sine",
      delay:100,
    });
    AOS.refresh();
  },[]);

  return (
    <div className='bg-white dark:bg-gray-900 dark:text-white duration-200 overflow-hidden'>
      <NavBar/>
      <Hero/>
      <Category/>
      <OtherServices/>
      <Banner data={BannerData}/>
      <Products/>
    </div>
  )
}

export default App