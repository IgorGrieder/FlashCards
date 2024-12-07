"use client";
import { useState } from "react";
import Image from "next/image";
import Button from "./button";

type CardProps = {
  answer: string;
  category: string;
  question: string;
  img?: string;
};

export default function FlashCard({
  answer,
  category,
  question,
  img,
}: CardProps) {
  const [answered, setAnswered] = useState(false);

  // Handle click function
  const handleClick = (): void => {
    setAnswered(true);
  };

  return (
    <div className="flex gap-2 border rounded-md flex-col bg-white border-black">
      <h1>${category}</h1>
      {img && (
        <Image
          src={img}
          alt="Flash card image"
          width={250}
          height={250}
          priority
        />
      )}
      <h2>{question}</h2>

      {/* Show answer section */}
      {!answered && (
        <Button text="Mostrar resposta" onClick={handleClick}></Button>
      )}

      {/* If the question was answered we will give the proper answer*/}
      {answered && <span>${answer}</span>}

      {/* User interaction to consider right or wrong */}
      <div className="flex gap-2 items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="24px"
          viewBox="0 -960 960 960"
          width="24px"
          fill="#e8eaed"
        >
          <path d="m424-296 282-282-56-56-226 226-114-114-56 56 170 170Zm56 216q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24px"
            viewBox="0 -960 960 960"
            width="24px"
            fill="#e8eaed"
          >
            <path d="M330-120 120-330v-300l210-210h300l210 210v300L630-120H330Zm36-190 114-114 114 114 56-56-114-114 114-114-56-56-114 114-114-114-56 56 114 114-114 114 56 56Zm-2 110h232l164-164v-232L596-760H364L200-596v232l164 164Zm116-280Z" />
          </svg>
        </svg>
      </div>
    </div>
  );
}
