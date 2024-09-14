import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTerminal } from "@fortawesome/free-solid-svg-icons";
import React from "react";

const Navbar = () => {
  return (
    <div className="px-4 py-3 flex gap-4 rounded-b-lg shadow sticky top-0 left-0 bg-background">
      <div className="text-primary">
        <FontAwesomeIcon icon={faTerminal} color="currentColor" />
      </div>
      <a className="text-primary hover:no-underline hover:text-secondary cursor-pointer ml-auto p-2" href="#home">home</a>
      <a className="text-primary hover:no-underline hover:text-secondary cursor-pointer p-2" href="#about">About</a>
      <a className="text-primary hover:no-underline hover:text-secondary cursor-pointer p-2" href="#projects">Projects</a>
      <a className="text-primary hover:no-underline hover:text-secondary cursor-pointer p-2" href="#contact">Contact</a>
    </div>
  );
};

export default Navbar;
