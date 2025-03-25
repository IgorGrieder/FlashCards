"use client";
import Image from "next/image";
import Button from "./components/button";
import { useRouter } from "next/navigation";
import CreateAccountLink from "./components/createAccountLink";

export default function Home() {
  const router = useRouter();

  const onClickLogin = () => {
    router.push("/login");
  };

  return (
    <main className="h-screen text-xl px-10">
      <section className="flex flex-col h-full items-center justify-center">
        <h1 className="text-8xl font-extrabold mb-10 sm:mb-20">Flash Cards</h1>

        {/* Main text */}
        <div className="flex gap-5 sm:items-center">
          <div className="flex items-center">
            <p className="w-[300px]">
              &quot;O verdadeiro aprendizado não é sobre acumular conhecimento,
              mas lembrar dele quando for importante.&quot;
            </p>
            <div className="relative w-auto h-auto">
              <Image
                src="/Girl-using-laptop.png"
                alt="Girl using a computer"
                width={250}
                height={250}
                priority
              />
            </div>
          </div>

          {/* Login Intercation */}
          <div className="grid grid-cols-1 gap-4 font-semibold">
            <p>Venha fazer parte da melhor forma de estudar!</p>
            <div>
              <Button
                text="Entrar"
                onClick={onClickLogin}
                additionalClasses="mx-auto block justify-center w-full"
              ></Button>

              {/* Create an account option*/}
              <CreateAccountLink></CreateAccountLink>

            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
