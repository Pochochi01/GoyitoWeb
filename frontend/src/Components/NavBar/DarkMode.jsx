import React, { useState, useEffect } from 'react'
import LightButton from '../../assets/DarkMode/light-mode-button.png'
import DarkButton  from '../../assets/DarkMode/dark-mode-button.png'

const DarkMode = () => {
  const [theme, setTheme] = useState(
    () => localStorage.getItem('theme') || 'light'
  )

  useEffect(() => {
    localStorage.setItem('theme', theme)
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  const toggle = () => setTheme(t => t === 'dark' ? 'light' : 'dark')

  return (
    <div className="relative w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 cursor-pointer" onClick={toggle}>
      <img
        src={LightButton} alt="Modo claro"
        className={`w-10 sm:w-12 cursor-pointer absolute right-0 z-10 transition-opacity duration-300
          ${theme === 'dark' ? 'opacity-0' : 'opacity-100'}`}
      />
      <img
        src={DarkButton} alt="Modo oscuro"
        className="w-10 sm:w-12 cursor-pointer"
      />
    </div>
  )
}

export default DarkMode
