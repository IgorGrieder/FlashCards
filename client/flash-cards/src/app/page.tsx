"use client";
import Image from "next/image";
import Button from "./utils/button";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const onClickLogin = () => {
    router.push("/login");
  };

  return (
    <div className="bg-green-300 h-screen text-black text-xl">
      <section className="flex flex-col items-center justify-center h-full w-full">
        <h1 className="text-5xl mb-32">Flash Cards</h1>
        <div className="flex gap-5">
          <div className="flex">
            <p className="w-[200px]">
              &quot;O verdadeiro aprendizado não é sobre acumular conhecimento,
              mas lembrar dele quando for importante.&quot;
            </p>
            <div className="relative w-[250px] h-[250px]">
              <Image
                src="/Girl-using-laptop.png"
                alt="Girl using a computer"
                width={250}
                height={250}
                priority
              />
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <p>Venha fazer parte da melhor forma de estudar!</p>
            <div>
              <Button
                text="Entrar"
                onClick={onClickLogin}
                additionalClasses="mx-auto block hover:bg-sky-300"
              ></Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
