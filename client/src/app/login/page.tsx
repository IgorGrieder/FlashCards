"use client";
import { AxiosPromise } from "axios";
import { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { api } from "../libs/axios";
import { LoginResponse } from "../types/types";
import { useRouter } from "next/navigation";
import { UserContext } from "../context/userContext";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const loginSchema = z.object({
  login: z
    .string()
    .min(3, "Login deve ter pelo menos 3 caracteres")
    .max(50, "Login não pode ter mais de 50 caracteres")
    .refine(
      (value) => {
        // Check if it's a valid email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        // Check if it's a valid username (alphanumeric and underscores)
        const usernameRegex = /^[a-zA-Z0-9_]+$/;

        return emailRegex.test(value) || usernameRegex.test(value);
      },
      {
        message: "Login deve ser um email válido ou um nome de usuário válido",
      },
    ),
  password: z
    .string()
    .min(6, "Senha deve ter pelo menos 6 caracteres")
    .max(50, "Senha não pode ter mais de 50 caracteres"),
});

type LoginSchemaType = z.infer<typeof loginSchema>;

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
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-6 rounded-xl shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-bold text-center mb-6">Entrar</h2>

        {/* Email Field */}
        <div className="mb-4">
          <label htmlFor="login" className="block text-sm font-medium mb-2">
            Email/usuário
          </label>
          <input
            id="login"
            type="text"
            {...register("login", {
              onChange: () => setLoginFailed(false),
            })}
            className={`w-full px-3 py-2 border rounded ${
              errors.login ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.login && (
            <p className="text-red-500 text-sm mt-1">{errors.login.message}</p>
          )}
        </div>

        {/* Password Field */}
        <div className="mb-6">
          <label htmlFor="password" className="block text-sm font-medium mb-2">
            Senha
          </label>
          <input
            id="password"
            type="password"
            {...register("password", {
              onChange: () => setLoginFailed(false),
            })}
            className={`w-full px-3 py-2 border rounded ${
              errors.password ? "border-red-500" : "border-gray-300"
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
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 mb-5 disabled:bg-blue-300"
        >
          {mutation.isPending ? "Entrando..." : "Entrar"}
        </button>

        {/* Create an account option*/}
        <div className="flex justify-center">
          <a
            href="/create-account"
            className="text-blue-400 mt-2 hover:text-blue-800 underline"
          >
            Ainda não tem uma conta? Crie agora!
          </a>
        </div>
      </form>
    </main>
  );
}
