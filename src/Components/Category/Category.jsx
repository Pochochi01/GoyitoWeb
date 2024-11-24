import React from 'react'
import earphone from '../../assets/Category/earphone.png'
import watch from '../../assets/Category/watch.png'
import speaker from '../../assets/Category/speaker.png'
import gaming from '../../assets/Category/gaming.png'
import macbook from '../../assets/Category/macbook.png'
import smartwatch2 from '../../assets/Category/smartwatch2.png'
import Button from '../../Components/Shared/button.jsx'

const category = () => {
  return (
    <div className='py-8'>
        <div className='container'>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {/*first col*/}
                <div className='py-10 pl-5 sm:pl-2 bg-gradient-to-br from-black/90 to-black/70 text-white
                rounded-3xl relative h-[320px] flex items-end'>
                    <div>
                        <div className='mb-4'>
                            <p className='mb-[2px] text-gray-400'>Disfruta </p>
                            <p className='text-2xl font-semibold mb-[2px]'>Con</p>
                            <p className='text-3xl xl:text-5xl font-bold opacity-20 mb-4 relative z-80'>Auriculares</p>
                            <Button text="Ver" bgColor={"bg-primary"} textColor={"text-white"}/>
                        </div>
                    </div>
                    <img src={earphone} alt="" className='w-[320px] absolute top-0 left-36 rotate-180' />
                </div>
                {/*second col*/}
                <div className='py-10 pl-5 bg-gradient-to-br from-brandYellow to-brandYellow/70 text-white
                rounded-3xl relative h-[320px] flex items-end'>
                    <div>
                        <div className='mb-4'>
                            <p className='mb-[2px] text-gray-400'>Disfruta </p>
                            <p className='text-2xl font-semibold mb-[2px]'>Con</p>
                            <p className='text-3xl xl:text-5xl font-bold opacity-40 mb-4 relative z-80'>SmartWatch</p>
                            <Button text="Ver" bgColor={"bg-white"} textColor={"text-brandYellow"}/>
                        </div>
                    </div>
                    <img src={watch} alt="" className='w-[320px] absolute -right-8 lg:top-[42px]' />
                </div>
                {/*third col*/}
                <div className='col-span-2 py-10 pl-5 bg-gradient-to-br from-primary to-primary/70 text-white
                rounded-3xl relative h-[320px] flex items-end'>
                    <div>
                        <div className=' mb-4'>
                            <p className='mb-[2px] text-white'>Disfruta </p>
                            <p className='text-2xl font-semibold mb-[2px]'>Con</p>
                            <p className='text-3xl xl:text-5xl font-bold opacity-40 mb-4 relative z-80'>Parlantes</p>
                            <Button text="Ver" bgColor={"bg-white"} textColor={"text-primary"}/>
                        </div>
                    </div>
                    <img src={speaker} alt="" className='w-[320px] absolute top-1/2 -translate-y-1/2 -right-0' />
                </div>
            </div>
            {/*Second File Grid*/}
            <div className="pt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {/*first col*/}
                <div className='col-span-2 py-10 pl-5 bg-gradient-to-br from-gray-300 to-gray-100 text-white
                rounded-3xl relative h-[320px] flex items-end'>
                    <div>
                        <div className=' mb-4'>
                            <p className='mb-[2px] text-white'>Disfruta </p>
                            <p className='text-2xl font-semibold mb-[2px]'>Con</p>
                            <p className='text-3xl xl:text-5xl font-bold opacity-40 mb-4 relative z-80'>PlayStation</p>
                            <Button text="Ver" bgColor={"bg-primary"} textColor={"text-white"}/>
                        </div>
                    </div>
                    <img src={gaming} alt="" className='w-[320px] absolute top-1/2 -translate-y-1/2 -right-0' />
                </div>
                {/*second col*/}
                <div className='py-10 pl-5 bg-gradient-to-br from-brandGreen to-brandGreen/70 text-white
                rounded-3xl relative h-[320px] flex items-end'>
                    <div>
                        <div className='mb-4'>
                            <p className='mb-[2px] text-gray-400'>Disfruta </p>
                            <p className='text-2xl font-semibold mb-[2px]'>Con</p>
                            <p className='text-3xl xl:text-5xl font-bold opacity-20 mb-4 relative z-80'>Laptop</p>
                            <Button text="Ver" bgColor={"bg-white"} textColor={"text-brandGreen"}/>
                        </div>
                    </div>
                    <img src={macbook} alt="" className='w-[280px] absolute top-0 left-16 opacity-70' />
                </div>
                {/*third col*/}
                <div className='py-10 pl-5 bg-gradient-to-br from-brandBlue to-brandBlue/50 text-white
                rounded-3xl relative h-[320px] flex items-end'>
                    <div>
                        <div className='mb-4'>
                            <p className='mb-[2px] text-gray-400'>Disfruta </p>
                            <p className='text-2xl font-semibold mb-[2px]'>Con</p>
                            <p className='text-3xl xl:text-5xl font-bold opacity-40 mb-4 relative z-80'>SmartWatch</p>
                            <Button text="Ver" bgColor={"bg-white"} textColor={"text-brandBlue"}/>
                        </div>
                    </div>
                    <img src={smartwatch2} alt="" className='w-[220px] absolute -right-4 lg:top-[16px]' />
                </div>
                
            </div>

        </div>
    </div>
  )
}

export default category