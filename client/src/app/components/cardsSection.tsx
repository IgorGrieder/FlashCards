"use client";
import { useState } from "react";
import { Collection } from "../types/types";

type CardsSectionProps = {
  collection: Collection | [];
};
export default function CardsSection({ collection }: CardsSectionProps) {
  const [currentCard, setCurrentCard] = useState(0);
  return (
    <section className="flex items-center justify-center bg-white mt-10">
      <div className="px-5 py-10">{}</div>
    </section>
  );
}
