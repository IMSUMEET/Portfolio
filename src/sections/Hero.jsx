import { Button } from "@/components/ui/button";
import React from "react";

const Hero = () => {
  return (
    <section id="home" className="h-[calc(100vh_-_18rem)] grid grid-cols-2">
      <div className="w-full h-full flex justify-center items-center">
        <div className="w-2/3 h-2/3 p-4 flex flex-col gap-2">
          <h6 className="text-lg text-gray-400">Hi I'am</h6>
          <h5 className=" text-4xl text-gray-700 font-bold uppercase">
            Sumeet Suryawanshi
          </h5>
          <p className="uppercase text-lg text-gray-400">
            Creative web frontend developer
          </p>
          <Button className="w-fit mt-4">Download Button</Button>
        </div>
      </div>
      <div className="w-full h-full relative flex justify-center items-center">
        <div className="h-screen w-[120%] rounded-2xl bg-primary absolute -z-10 top-0 right-0 translate-x-1/3 -translate-y-[33%] rotate-[45deg]"></div>
        <div className="bg-background rounded-2xl shadow p-4 w-2/3 h-2/3"></div>
      </div>
    </section>
  );
};

export default Hero;
