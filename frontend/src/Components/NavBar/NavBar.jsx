import React, { useState } from "react";
import { Link } from "react-router-dom";
import { IoMdSearch, IoMdMenu, IoMdClose } from "react-icons/io";
import { FaCartShopping } from "react-icons/fa6";
import DarkMode from "./DarkMode";
import ResponsiveMenu from "./ResponsiveMenu";
import UserMenu from "./UserMenu.jsx";
import { useCart } from "../../context/CartContext.jsx";
import logo from "../../assets/logo/logo.png";

const MenuLinks = [
  { id: 1, link: "/",       name: "Inicio",        router: true },
  { id: 2, link: "/tienda", name: "Tienda",         router: true },
  { id: 3, link: "/about",  name: "Quienes Somos",  router: true },
];

const NavBar = ({ handleOrderPopup }) => {
  const [open, setOpen] = useState(false)
  const { cartCount } = useCart()

  return (
    <div className="bg-white dark:bg-gray-900 duration-200 relative z-40">
      <div className="py-4">
        {/* Tres columnas: logo | nav centrado | acciones
            En mobile el grid sigue siendo 3 cols pero el logo ocupa menos espacio
            porque el texto "ZolImportados" se oculta hasta sm. */}
        <div className="container grid grid-cols-3 items-center px-4 sm:px-6 lg:px-0 gap-2">

          {/* ── Columna izquierda: logo + nombre ── */}
          <div className="flex items-center gap-2 min-w-0">
            <Link to="/" aria-label="Inicio — ZolImportados" className="flex items-center gap-2 hover:opacity-80 transition-opacity duration-200 min-w-0">
              <img
                src={logo}
                alt="ZolImportados"
                className="h-12 sm:h-16 w-auto object-contain flex-shrink-0
                           mix-blend-multiply
                           dark:invert dark:mix-blend-normal"
              />
              <span className="text-primary font-semibold tracking-widest text-2xl uppercase sm:text-3xl hidden sm:block truncate">
                ZolImportados
              </span>
            </Link>
          </div>

          {/* ── Columna central: links de navegación (solo desktop) ── */}
          <nav className="hidden lg:flex justify-center">
            <ul className="flex items-center gap-1">
              {MenuLinks.map((item) => (
                <li key={item.id}>
                  <Link
                    to={item.link}
                    className="inline-block px-4 py-1.5 font-semibold text-gray-500
                               hover:text-black dark:hover:text-white duration-200
                               rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* ── Columna derecha: buscador, carrito, usuario, darkmode, burger ── */}
          <div className="flex items-center gap-3 justify-end">
            {/* Search */}
            <div className="relative group hidden sm:block">
              <input type="text" placeholder="Buscar" className="search-bar" />
              <IoMdSearch
                className="text-xl text-gray-600 group-hover:text-primary dark:text-gray-400
                           absolute top-1/2 -translate-y-1/2 right-3 duration-200"
              />
            </div>

            {/* Cart */}
            <Link to="/carrito" className="relative p-2" aria-label="Carrito de compras">
              <FaCartShopping className="text-xl text-gray-600 dark:text-gray-400" />
              {cartCount > 0 && (
                <div className="w-4 h-4 bg-red-500 text-white rounded-full absolute
                               top-0 right-0 flex items-center justify-center text-xs font-bold">
                  {cartCount > 9 ? '9+' : cartCount}
                </div>
              )}
            </Link>

            {/* User account */}
            <UserMenu />

            {/* Dark mode */}
            <DarkMode />

            {/* Burger — solo móvil */}
            <button
              className="lg:hidden p-1"
              onClick={() => setOpen(!open)}
              aria-label="Menú"
            >
              {open
                ? <IoMdClose className="text-3xl" />
                : <IoMdMenu  className="text-3xl" />
              }
            </button>
          </div>
        </div>
      </div>

      <ResponsiveMenu open={open} onClose={() => setOpen(false)} />
    </div>
  );
};

export default NavBar;
