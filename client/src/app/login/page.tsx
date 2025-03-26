"use client";
import { AxiosPromise } from "axios";
import { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { api } from "../libs/axios";
import { LoginResponse } from "../types/types";
import { useRouter } from "next/navigation";
import { UserContext } from "../context/userContext";
import { zodResolver } from "@hookform/resolvers/zod";
import CreateAccountLink from "../components/createAccountLink";
import { loginSchema, LoginSchemaType } from "../schemas/loginSchema";

export default function Login() {
  const router = useRouter();
  const userCtx = useContext(UserContext);
  const [loginFailed, setLoginFailed] = useState<boolean>(false);

  // Function to make the request to the backend about the user login
  const loginUser = async (
    credentials: LoginSchemaType,
  ): AxiosPromise<LoginResponse> => {
    const result = await api.post("/users/login", {
      login: credentials.login,
      password: credentials.password,
    });
    return result;
  };

  // TanStack query instance for a mutation
  const mutation = useMutation({
    mutationFn: loginUser,
  });

  // React hook form usage
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchemaType>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      login: "",
      password: "",
    },
  });

  // onSubmit method
  const onSubmit = async (formData: LoginSchemaType) => {
    try {
      // Making the post request to our api to login the user
      const request = await mutation.mutateAsync(formData);

      // If the login was authorized we will change to the home page with the user logged on
      if (request.status === 200 && request.data.logged) {
        if (request.data.username) {
          userCtx?.dispatch({
            type: "LOGIN",
            payload: {
              username: request.data.username,
              collections: request.data.collections || [],
            },
          });
          router.push("/home");
        }
      }
    } catch (e) {
      setLoginFailed(true);
      console.log(e);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center text-black">
      {/*Login form*/}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-6 rounded-xl shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl sm:text-4xl font-extrabold text-center mb-6">Entrar</h2>

        {/* Email Field */}
        <div className="mb-4">
          <label htmlFor="login" className="block text-sm sm:text-xl font-semibold mb-2">
            Email/usuário
          </label>
          <input
            id="login"
            type="text"
            {...register("login", {
              onChange: () => setLoginFailed(false),
            })}
            className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:outline-none transition-all ${errors.password
              ? "border-red-300 focus:border-red-500 focus:ring-red-100"
              : "border-gray-200 focus:border-blue-500 focus:ring-blue-100"
              }`}
          />
          {errors.login && (
            <p className="text-red-500 text-sm mt-1">{errors.login.message}</p>
          )}
        </div>

        {/* Password Field */}
        <div className="mb-6">
          <label htmlFor="password" className="block text-sm sm:text-xl font-semibold mb-2">
            Senha
          </label>
          <input
            id="password"
            type="password"
            {...register("password", {
              onChange: () => setLoginFailed(false),
            })}
            className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:outline-none transition-all ${errors.password
              ? "border-red-300 focus:border-red-500 focus:ring-red-100"
              : "border-gray-200 focus:border-blue-500 focus:ring-blue-100"
              }`}
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Login failed message */}
        <div>
          <p
            className={`${loginFailed ? "text-red-500" : "text-white"} text-sm mb-4`}
          >
            Email/usuário ou senha estão errados
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={mutation.isPending}
          className="px-3 py-4 items-center text-sm transition-colors hover:text-white border-gray-300 border hover:bg-black sm:text-base rounded-lg cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed w-full justify-center flex`}"
        >
          {mutation.isPending ? "Entrando..." : "Entrar"}
        </button>

        {/* Create an account option*/}
        <CreateAccountLink></CreateAccountLink>
      </form>
    </main>
  );
}
