import React from "react";
import {IoMdSearch} from "react-icons/io"
import {FaCartShopping} from "react-icons/fa6"

const MenuLinks = [
  {
    id: 1,
    link: "/#Home",
    name: "Inicio",
  },
  {
    id: 2,
    link: "/#Products",
    name: "Tienda",
  },
  {
    id: 3,
    link: "/#About",
    name: "Quienes Somos",
  },
  {
    id: 4,
    link: "#/Contact",
    name: "Contactanos",
  },
];

const NavBar = () => {
  return (
    <div className="bg-white dark:bg-gray-900 dark:text- duration-200 relative z-40">
      <div className="py-4">
        <div className="container flex justify-between items-center">
          {/*Logo and Links section*/}
          <div className="flex items-center gap-4">
            <a
              href=""
              className="text-primary font-semibold tracking-widest text-2xl uppercase
                        sm:text-3xl"
            >
              Goyito's Digital
            </a>
            {/*menu items*/}
            <div className="hidden lg:block">
              <ul className="flex items-center gap-4">
                {MenuLinks.map((data, index) => (
                  <li key={index}>
                    <a href={data.link}
                    className="inline-block px-4 font-semibold
                    text-gray-500 hover:text-black dark:hover:text-white duration-200">
                       {" "} {data.name}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          {/*NavBar Right section*/}
          <div className="flex justify-between items-center gap-4">
            {/*search bar section*/}
            <div className="relative group hidden sm:block">
                <input type="text" placeholder="Buscar" className="search-bar"/>
                <IoMdSearch className="text-xl text-gray-600 group-hover:text-primary dark:text-gray-400
                absolute top-1/2 -translate-y-1/2 right-3 duration-200"/>
            </div>
            {/*order botton section*/}

            {/*dark mode section*/}
            <buttom className="relative p-3">
                <FaCartShopping className="text-xl text-gray-600 dark:text-gray-400"/>
                <div className="w-4 h-4 bg-red-500 text-white rounded-full absolute 
                top-0 right-0 flex items-center justify-center text-xs">
                    4
                </div>
            </buttom>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavBar;
