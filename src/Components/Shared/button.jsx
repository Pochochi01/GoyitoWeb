import React from 'react'

const buttom = ({text, bgColor, textColor, handler = ()=> {}}) => {
  return (
    <buttom className ={`${bgColor} ${textColor} cursor-pointer hover:scale-105 duration-300 py-2 px-8 rounded-full relative z-10`}>

        {text}
    </buttom>
  )
}

export default buttom