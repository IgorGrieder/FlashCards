"use client";
import { useRef, useState } from "react";
import { Card } from "../types/types";
import Button from "./button";
import confetti from "canvas-confetti";
import { useRouter } from "next/navigation";

type CardsSectionProps = {
  collection: Card[] | [];
  collectionName: string;
};

export default function CardsSection({
  collection,
  collectionName,
}: CardsSectionProps) {
  const router = useRouter();
  const [currentCard, setCurrentCard] = useState(0);
  const [cardsAnswers, setCardsAnswers] = useState(() => {
    const emptyArray = new Array(collection.length).fill(null);
    return emptyArray;
  });
  const [rightAnswers, setRightAnswers] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [disableButtons, setDisableButtons] = useState(false);
  const answer = collection[currentCard].answer;
  const question = collection[currentCard].question;
  const img = collection[currentCard].img;
  const category = collection[currentCard].category;
  const progressBar = useRef<HTMLDivElement>(null);

  // Next question updates on the bar and the current card
  const handleNextQuestion = () => {
    if (currentCard + 1 <= collection.length - 1) {
      setCurrentCard(currentCard + 1);
      if (progressBar.current) {
        progressBar.current.style.width =
          ((currentCard + 1) / (collection.length - 1)) * 100 + "%";
      }
    }
  };

  // Handle click function
  const handleAnswer = (answer: boolean): void => {
    const answersArray = [...cardsAnswers];
    answersArray[currentCard] = answer;
    setCardsAnswers(answersArray);
    handleNextQuestion();

    // If we reach the end we will finish the session
    if (currentCard + 1 > cardsAnswers.length - 1) {
      setDisableButtons(true);
      showStars();
    }

    if (answer) {
      setRightAnswers(rightAnswers + 1);
    } else {
      setWrongAnswers(wrongAnswers + 1);
    }
  };

  // When going to a previous question we need to make sure we update the states correctly
  const handlePreviousQuestion = () => {
    if (currentCard > 0) {
      setCurrentCard(currentCard - 1);
      setDisableButtons(false);
      if (progressBar.current) {
        const newProgress =
          currentCard - 1 === 0
            ? 0
            : ((currentCard - 1) / (collection.length - 1)) * 100;
        progressBar.current.style.width = newProgress + "%";
      }

      // We need to check the feedback we gave to this flash card and remove it
      const state = cardsAnswers[currentCard - 1];
      if (state !== null) {
        const answersArray = [...cardsAnswers];
        answersArray[currentCard - 1] = null;
        setCardsAnswers(answersArray);

        // We need to adjust our counters
        if (state) {
          if (rightAnswers > 0) {
            setRightAnswers(rightAnswers - 1);
          }
        } else {
          if (wrongAnswers > 0) {
            setWrongAnswers(wrongAnswers - 1);
          }
        }
      }
    }
  };

  // Show answer
  const handleFeedback = () => {
    setShowAnswer(!showAnswer);
  };

  // Restart the state of the UI
  const handleRestartQuestions = () => {
    setCardsAnswers(new Array(collection.length).fill(null));
    setCurrentCard(0);
    setWrongAnswers(0);
    setRightAnswers(0);
    setShowAnswer(false);
    setDisableButtons(false);

    if (progressBar.current) {
      progressBar.current.style.width = "0px";
    }
  };

  // Show stars animation with canvas confetti
  const showStars = () => {
    const defaults = {
      spread: 360,
      ticks: 50,
      gravity: 0,
      decay: 0.94,
      startVelocity: 30,
      colors: ["FFE400", "FFBD00", "E89400", "FFCA6C", "FDFFB8"],
    };

    const shoot = () => {
      confetti({
        ...defaults,
        particleCount: 40,
        scalar: 1.2,
        shapes: ["star"],
      });

      confetti({
        ...defaults,
        particleCount: 10,
        scalar: 0.75,
        shapes: ["circle"],
      });
    };

    setTimeout(shoot, 0);
    setTimeout(shoot, 100);
    setTimeout(shoot, 200);
    setTimeout(shoot, 300);
    setTimeout(shoot, 400);
  };

  // Handle the end of the collection
  const handleQuit = () => {
    showStars();
    setTimeout(() => {
      router.push("/home");
    }, 2000);
  };

  return (
    <section className="flex flex-col gap-5 justify-center mt-5 px-5 py-10 max-w-[800px] mx-auto capitalize">
      {/* General collection header */}
      <div className="border border-gray-300 rounded-lg px-2 py-5 bg-white">
        {/* Progress Bar */}
        <div className="flex justify-around items-center mx-auto">
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
              fill="currentColor"
              className={`${currentCard > 0 && !disableButtons ? "cursor-pointer opacity-100 hover:text-black" : "opacity-60 cursor-auto"} text-gray-300`}
              onClick={() => {
                if (currentCard > 0 && !disableButtons) {
                  handlePreviousQuestion();
                }
              }}
            >
              <path d="M560-240 320-480l240-240 56 56-184 184 184 184-56 56Z" />
            </svg>

            <span className="text-gray-700 text-center">
              {currentCard + 1} / {collection.length}
            </span>

            {/* Right arrow */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 -960 960 960"
              width="24px"
              fill="currentColor"
              className={`${currentCard + 1 <= collection.length - 1 ? "cursor-pointer opacity-100 hover:text-black" : "opacity-60 cursor-auto"} text-gray-300`}
              onClick={handleNextQuestion}
            >
              <path d="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z" />
            </svg>
          </div>
        </div>

        {/* Questions feedback */}
        <div className="grid grid-cols-4 gap-5 mt-2 px-5">
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 -960 960 960"
              width="24px"
              fill="currentColor"
              className="text-black mr-2 group-hover:text-white"
            >
              <path d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q65 0 123 19t107 53l-58 59q-38-24-81-37.5T480-800q-133 0-226.5 93.5T160-480q0 133 93.5 226.5T480-160q133 0 226.5-93.5T800-480q0-18-2-36t-6-35l65-65q11 32 17 66t6 70q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm-56-216L254-466l56-56 114 114 400-401 56 56-456 457Z" />
            </svg>
            Sabia{" "}
            <span className="font-semibold inline-block ml-2">
              {rightAnswers}
            </span>
          </div>
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-sparkles mr-2 h-4"
            >
              <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"></path>
              <path d="M20 3v4"></path>
              <path d="M22 5h-4"></path>
              <path d="M4 17v2"></path>
              <path d="M5 18H3"></path>
            </svg>
            Não Sabia{" "}
            <span className="font-semibold inline-block ml-2">
              {" "}
              {wrongAnswers}{" "}
            </span>
          </div>
          <div
            className="flex items-center cursor-pointer group"
            onClick={handleRestartQuestions}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 -960 960 960"
              width="24px"
              fill="currentColor"
              className="mr-2 text-red-400 group-hover:text-red-300"
            >
              <path d="M440-122q-121-15-200.5-105.5T160-440q0-66 26-126.5T260-672l57 57q-38 34-57.5 79T240-440q0 88 56 155.5T440-202v80Zm80 0v-80q87-16 143.5-83T720-440q0-100-70-170t-170-70h-3l44 44-56 56-140-140 140-140 56 56-44 44h3q134 0 227 93t93 227q0 121-79.5 211.5T520-122Z" />
            </svg>
            Reiniciar{" "}
          </div>
        </div>
      </div>

      {/* Flash card body */}
      <div className="border border-gray-300 rounded-lg px-2 py-5 bg-white flex items-center justify-center relative h-[400px] text-center flex-col">
        <div className="text-gray-400 absolute top-[20px] text-center">
          <span>{category}</span>
          <span className="mx-2">·</span>
          <span>{collectionName}</span>
        </div>
        <p className="font-semibold text-xl">{question}</p>
        {img && (
          <div>
            <img src={img} alt="Question image" className="mt-5" />
          </div>
        )}
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

      {/* Feedback section */}
      <div className="grid grid-cols-3 gap-2">
        <Button
          text="Resposta correta"
          additionalClasses="group w-full"
          onClick={() => {
            handleAnswer(true);
          }}
          disable={disableButtons}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24px"
            viewBox="0 -960 960 960"
            width="24px"
            fill="currentColor"
            className="text-black mr-2 group-hover:text-white"
          >
            <path d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q65 0 123 19t107 53l-58 59q-38-24-81-37.5T480-800q-133 0-226.5 93.5T160-480q0 133 93.5 226.5T480-160q133 0 226.5-93.5T800-480q0-18-2-36t-6-35l65-65q11 32 17 66t6 70q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm-56-216L254-466l56-56 114 114 400-401 56 56-456 457Z" />
          </svg>
        </Button>
        <Button
          text="Não sabia a resposta"
          additionalClasses="group w-full"
          onClick={() => {
            handleAnswer(false);
          }}
          disable={disableButtons}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-sparkles mr-1 h-4"
          >
            <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"></path>
            <path d="M20 3v4"></path>
            <path d="M22 5h-4"></path>
            <path d="M4 17v2"></path>
            <path d="M5 18H3"></path>
          </svg>
        </Button>
        <Button
          text="Sair"
          additionalClasses="group w-full"
          onClick={handleQuit}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24px"
            viewBox="0 -960 960 960"
            width="24px"
            fill="currentColor"
            className="text-black group-hover:text-red-400 mr-2"
          >
            <path d="M873-88 609-352 495-238 269-464l56-58 170 170 56-56-414-414 56-58 736 736-56 56ZM269-238 43-464l56-56 170 170 56 56-56 56Zm452-226-56-56 196-196 58 54-198 198ZM607-578l-56-56 86-86 56 56-86 86Z" />
          </svg>
        </Button>
      </div>
    </section>
  );
}

