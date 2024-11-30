import React from "react";
import earphone from "../../assets/Category/earphone.png";
import watch from "../../assets/Category/watch.png";
import speaker from "../../assets/Category/speaker.png";
import gaming from "../../assets/Category/gaming.png";
import macbook from "../../assets/Category/macbook.png";
import smartwatch2 from "../../assets/Category/smartwatch2.png";
import Button from "../../Components/Shared/button.jsx";

const category = () => {
  return (
    <div className="py-5 relative overflow-hidden min-h-[550px]">
      <div className="container">
        {/*header seccion*/}
        <div className="text-center mb-10 max-w-[600px] mx-auto">
          <p data-aos="fade-up" className="text-sm text-primary">
            Nuestra Seleccion de Productos para ti
          </p>
          <h1 data-aos="fade-up" className="text-3xl font-bold">
            Productos
          </h1>
          <p data-aos="fade-up" className="text-xs text-gray-400">
            Los productos mas adquiridos para usar en casa o al aire libre.{" "}
          </p>
        </div>
        <div
          className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4"
          data-aos="fade-up"
        >
          {/*first col*/}
          <div
            className="py-10 pl-2 sm:pl-0 bg-gradient-to-br from-black/90 to-white/50 text-white
                rounded-3xl relative h-[320px] flex items-end"
          >
            <div>
              <div className="mb-4 sm:pl-5">
                <p className="mb-[2px] text-gray-400">Disfruta </p>
                <p className="text-2xl font-semibold mb-[2px]">Con</p>
                <p className="text-3xl xl:text-4xl font-bold opacity-20 mb-4 relative z-80">
                  Auriculares
                </p>
                <Button
                  text="Ver"
                  bgColor={"bg-primary"}
                  textColor={"text-white"}
                />
              </div>
            </div>
            <img
              src={earphone}
              alt=""
              className="w-[150px] h-[200px] absolute top-0 left-14 rotate-180 sm:left-24 lg:h-[200px] lg:w-[200px] lg:left-40"
            />
          </div>
          {/*second col*/}
          <div
            className="py-10 pl-5 bg-gradient-to-br from-brandYellow to-brandYellow/70 text-white
                rounded-3xl relative h-[320px] flex items-end"
          >
            <div>
              <div className="mb-4">
                <p className="mb-[2px] text-gray-400">Disfruta </p>
                <p className="text-2xl font-semibold mb-[2px]">Con</p>
                <p className="text-3xl xl:text-4xl font-bold opacity-40 mb-4 relative z-80">
                  SmartWatch
                </p>
                <Button
                  text="Ver"
                  bgColor={"bg-white"}
                  textColor={"text-brandYellow"}
                />
              </div>
            </div>
            <img
              src={watch}
              alt=""
              className="w-[200px] h-[200px] absolute top-[0px] -right-8 lg:top-[4px] sm:top-[4px] lg:h-[210px] lg:w-[210px]"
            />
          </div>
          {/*third col*/}
          <div
            className="col-span-2 py-10 pl-5 bg-gradient-to-br from-primary to-primary/70 text-white
                rounded-3xl relative h-[320px] flex items-end"
          >
            <div>
              <div className=" mb-4">
                <p className="mb-[2px] text-white">Disfruta </p>
                <p className="text-2xl font-semibold mb-[2px]">Con</p>
                <p className="text-3xl xl:text-5xl font-bold opacity-40 mb-4 relative z-80">
                  Parlantes
                </p>
                <Button
                  text="Ver"
                  bgColor={"bg-white"}
                  textColor={"text-primary"}
                />
              </div>
            </div>
            <img
              src={speaker}
              alt=""
              className="w-[320px] absolute top-1/2 -translate-y-1/2 -right-0"
            />
          </div>
        </div>
        {/*Second File Grid*/}
        <div className="pt-8 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {/*first col*/}
          <div
            className="col-span-2 py-10 pl-5 bg-gradient-to-br from-gray-400 to-gray-200 text-white
                rounded-3xl relative h-[320px] flex items-end"
          >
            <div>
              <div className=" mb-4">
                <p className="mb-[2px] text-white">Disfruta </p>
                <p className="text-2xl font-semibold mb-[2px]">Con</p>
                <p className="text-3xl xl:text-5xl font-bold opacity-40 mb-4 relative z-80">
                  PlayStation
                </p>
                <Button
                  text="Ver"
                  bgColor={"bg-primary"}
                  textColor={"text-white"}
                />
              </div>
            </div>
            <img
              src={gaming}
              alt=""
              className="w-[220px] absolute top-1/2 -translate-y-1/2 right-2"
            />
          </div>
          {/*second col*/}
          <div
            className="py-10 pl-5 bg-gradient-to-br from-brandGreen to-brandGreen/70 text-white
                rounded-3xl relative h-[320px] flex items-end"
          >
            <div>
              <div className="mb-4">
                <p className="mb-[2px] text-gray-400">Disfruta </p>
                <p className="text-2xl font-semibold mb-[2px]">Con</p>
                <p className="text-3xl xl:text-4xl font-bold opacity-20 mb-4 relative z-80">
                  Laptop
                </p>
                <Button
                  text="Ver"
                  bgColor={"bg-white"}
                  textColor={"text-brandGreen"}
                />
              </div>
            </div>
            <img
              src={macbook}
              alt=""
              className="w-[170px] h-[170px] absolute top-[0px] -right-2 lg:top-[4px] sm:top-[4px] lg:h-[220px] lg:w-[220px]"
            />
          </div>
          {/*third col*/}
          <div
            className="py-10 pl-5 bg-gradient-to-br from-brandBlue to-brandBlue/50 text-white
                rounded-3xl relative h-[320px] flex items-end"
          >
            <div>
              <div className="mb-4">
                <p className="mb-[2px] text-gray-400">Disfruta </p>
                <p className="text-2xl font-semibold mb-[2px]">Con</p>
                <p className="text-3xl xl:text-4xl font-bold opacity-40 mb-4 relative z-80">
                  SmartWatch
                </p>
                <Button
                  text="Ver"
                  bgColor={"bg-white"}
                  textColor={"text-brandBlue"}
                />
              </div>
            </div>
            <img
              src={smartwatch2}
              alt=""
              className="w-[150px] h-[150px] absolute top-[0px] -right-2 lg:top-[4px] sm:top-[4px] lg:w-[200px] lg:h-[200px]"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default category;
