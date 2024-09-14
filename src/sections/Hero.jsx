import React from "react";

const Hero = () => {
  return (
    <div className="min-w-full min-h-[500px] bg-yellow-500 flex">
      <div className="leftColumn grow place-self-center">
        <h1>Hi I'am Sumeet</h1>
        <button>Download Resume</button>
      </div>
      <div className="rightColumn grow place-self-center">
        model1 with rotating skills
      </div>
    </div>
  );
};

export default Hero;
