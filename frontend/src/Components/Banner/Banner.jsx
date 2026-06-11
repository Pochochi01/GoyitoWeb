import React from 'react'

const Banner = ({data}) => {
  return (
    <div className='min-h-[400px] md:min-h-[550px] flex justify-center items-center py-8 md:py-12 px-4'>
        <div  style={{ backgroundColor: data.bgColor}} className='container rounded-2xl md:rounded-3xl'>
            <div className=' grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 items-center text-white rounded-2xl md:rounded-3xl'>
                {/*first col*/}
                <div className='p-5 sm:p-8 text-center md:text-left'>
                    <p className='text-sm'>{data.discount}</p>
                    <h1 className='uppercase text-3xl sm:text-4xl lg:text-7xl font-bold leading-tight'>{" "}{data.title}</h1>
                    <p className='text-sm'>{data.date}</p>
                </div>
                {/*second col*/}
                <div className='h-full flex items-center justify-center'>
                    <img src={data.image} alt=""
                    className='scale-110 sm:scale-125 w-full max-w-[200px] sm:max-w-[250px] md:max-w-[340px] h-auto mx-auto drop-shadow-2xl object-contain'
                    />
                </div>
                {/*third col*/}
                <div className='flex flex-col justify-center gap-3 sm:gap-4 p-5 sm:p-8 text-center md:text-left'>
                    <p className='font-bold text-lg sm:text-xl'>{data.title2}</p>
                    <p className='text-2xl sm:text-3xl lg:text-5xl font-bold leading-tight'>{data.title3}</p>
                    <p className='text-sm tracking-wide leading-5'>{data.title4}</p>
                    <div>
                    <button style={{color: data.bgColor}}
                className='bg-white py-2 px-5 sm:px-4 rounded-full min-h-[44px] text-sm font-semibold'>Comprar Ahora</button>
                    </div>
                </div>

            </div>
        </div>
    </div>
  )
}

export default Banner