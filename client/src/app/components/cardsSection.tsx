"use client";
import { useRef, useState } from "react";
import { Card } from "../types/types";

type CardsSectionProps = {
  collection: [Card] | [];
};

export default function CardsSection({ collection }: CardsSectionProps) {
  const [currentCard, setCurrentCard] = useState(0);
  const [cardsAnswers, setCardsAnswers] = useState(() => {
    const emptyArray = new Array(collection.length).fill(() => {
      return null;
    });
    return emptyArray;
  });
  const [showAnswer, setShowAnswer] = useState(false);
  const answer = collection[currentCard].answer;
  const question = collection[currentCard].question;
  const img = collection[currentCard].img;
  const category = collection[currentCard].category;
  const progressBar = useRef<HTMLDivElement>(null);

  const handleNextQuestion = () => {
    if (currentCard + 1 <= collection.length - 1) {
      setCurrentCard(currentCard + 1);
      if (progressBar.current) {
        progressBar.current.style.width =
          (currentCard + 1) / (collection.length - 1) + "px";
      }
    }
  };

  // Handle click function
  const handleAnswer = (answer: boolean): void => {
    const answersArray = [...cardsAnswers];
    answersArray[currentCard] = answer;
    setCardsAnswers(answersArray);
    handleNextQuestion();
  };

  const handlePreviousQuestion = () => {
    if (currentCard > 0) {
      setCurrentCard(currentCard - 1);
      if (progressBar.current) {
        const newProgress =
          currentCard - 1 === 0
            ? 0
            : (currentCard - 1) / (collection.length - 1);
        progressBar.current.style.width = newProgress + "px";
      }
    }
  };

  const handleFeedback = () => {
    setShowAnswer(!showAnswer);
  };

  return (
    <section className="flex flex-col gap-5 justify-center mt-10 px-5 py-10 max-w-[800px] mx-auto">
      {/* General collection header */}
      <div className="border border-black rounded-lg px-2 py-5 bg-white">
        {/* Progress Bar */}
        <div className="flex justify-around items-center">
          <div className="w-4/5 relative rounded-xl h-[10px] bg-gray-200">
            <div
              ref={progressBar}
              className={`h-full bg-slate-800 transition-[width] rounded-xl duration-400 w-0`}
            ></div>
          </div>
          <div className="flex items-center gap-2">
            {/* Left arrow */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 -960 960 960"
              width="24px"
              fill="#000000"
              className={`${currentCard === 0 ? "opacity-60 cursor-auto" : "cursor-pointer opacity-100 hover:bg-black"}`}
              onClick={handlePreviousQuestion}
            >
              <path d="M560-240 320-480l240-240 56 56-184 184 184 184-56 56Z" />
            </svg>

            <span className="text-gray-700 text-center">
              {currentCard + 1} - {collection.length}
            </span>

            {/* Right arrow */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 -960 960 960"
              width="24px"
              fill="#000000"
              className={`${currentCard + 1 <= collection.length - 1 ? "cursor-pointer opacity-100 hover:bg-black" : "opacity-60 cursor-auto"}`}
              onClick={handleNextQuestion}
            >
              <path d="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Flash card body */}
      <div className="border border-black rounded-lg px-2 py-5 bg-white flex items-center justify-center relative h-[400px] text-center flex-col">
        <p className="font-semibold text-xl">{question}</p>
        <button
          className="cursor-pointer text-sm text-gray-500 underline underline-offset-4 transition-colors hover:text-black sm:text-base absolute bottom-[20px] z-10"
          onClick={handleFeedback}
        >
          {!showAnswer ? "Mostrar a resposta" : "Esconder a resposta"}
        </button>

        {/* Answer field*/}
        <div
          className={`
            w-full
            absolute left-0 bottom-0
            transition-[height] duration-300 ease-in-out
            ${showAnswer ? "h-full px-2 py-5" : "h-0"}
            bg-neutral-100 rounded-lg flex items-center justify-center
          `}
        >
          <p
            className={`${showAnswer ? "inline-block" : "hidden"} font-semibold text-xl`}
          >
            {answer}
          </p>
        </div>
      </div>
    </section>
  );
}
