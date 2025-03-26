"use client";
import { AxiosPromise } from "axios";
import { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { api } from "../libs/axios";
import { CreateAccountResponse } from "../types/types";
import { useRouter } from "next/navigation";
import { UserContext } from "../context/userContext";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateAccountSchemaType, createSchema } from "../schemas/createAccountSchema";

// Function to make the request to the backend about the account creation
const createUser = async (
  credentials: CreateAccountSchemaType,
): AxiosPromise<CreateAccountResponse> => {
  const result = await api.post("/users/create-account", {
    email: credentials.email,
    username: credentials.username,
    password: credentials.password,
  });
  return result;
};

export default function Login() {
  const router = useRouter();
  const userCtx = useContext(UserContext);
  const [createFailed, setCreateFailed] = useState<boolean>(false);

  // TanStack query instance for a mutation
  const mutation = useMutation({
    mutationFn: createUser,
  });

  // React hook form usage
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateAccountSchemaType>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      email: "",
      username: "",
      password: "",
    },
  });

  // onSubmit method
  const onSubmit = async (formData: CreateAccountSchemaType) => {
    try {
      // Making the post request to our api to create an user
      const request = await mutation.mutateAsync(formData);

      // If the user was created we will send back to the home page
      if (request.status === 201 && request.data.accountCreated) {
        if (request.data.username) {
          userCtx?.dispatch({
            type: "LOGIN",
            payload: {
              username: request.data.username,
              collections: [],
            },
          });
          router.push("/home");
        }
      }
    } catch (e) {
      setCreateFailed(true);
      console.log(e);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center text-black">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-6 rounded-xl shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl sm:text-4xl font-extrabold text-center mb-6">Entrar</h2>

        {/* Email Field */}
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm sm:text-xl font-semibold mb-2">
            Email
          </label>
          <input
            id="email"
            type="text"
            {...register("email", {
              onChange: () => setCreateFailed(false),
            })}
            className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:outline-none transition-all ${errors.email
              ? "border-red-300 focus:border-red-500 focus:ring-red-100"
              : "border-gray-200 focus:border-blue-500 focus:ring-blue-100"
              }`}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Username Field */}
        <div className="mb-4">
          <label htmlFor="username" className="block text-sm sm:text-xl font-semibold mb-2">
            Usuário
          </label>
          <input
            id="username"
            type="text"
            {...register("username", {
              onChange: () => setCreateFailed(false),
            })}
            className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:outline-none transition-all ${errors.username
              ? "border-red-300 focus:border-red-500 focus:ring-red-100"
              : "border-gray-200 focus:border-blue-500 focus:ring-blue-100"
              }`}
          />
          {errors.username && (
            <p className="text-red-500 text-sm mt-1">
              {errors.username.message}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div className="mb-6">
          <label htmlFor="password" className="block text-sm sm:text-2xl font-semibold mb-2">
            Senha
          </label>
          <input
            id="password"
            type="password"
            {...register("password", {
              onChange: () => setCreateFailed(false),
            })}
            className={`w-full px-3 py-2 border rounded ${errors.password ? "border-red-500" : "border-gray-300"
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
            className={`${createFailed ? "text-red-500" : "text-white"} text-sm mb-4`}
          >
            Preencha todos os campos corretamente
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={mutation.isPending}
          className="px-3 py-4 items-center text-sm transition-colors hover:text-white border-gray-300 border hover:bg-black sm:text-base 
          rounded-lg cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed w-full justify-center flex`}"
        >
          {mutation.isPending ? "Criando..." : "Criar conta"}
        </button>
      </form>
    </main>
  );
}
