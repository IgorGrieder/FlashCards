"use client";
import { AxiosPromise } from "axios";
import React from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { api } from "../libs/axios";
import { LoginFormInputs, LoginResponse } from "../types/types";

export default function Login() {
  console.log(process.env.API_URL);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>();

  const loginUser = async (
    credentials: LoginFormInputs,
  ): AxiosPromise<LoginResponse> => {
    const { data } = await api.post("/users/login", {
      login: credentials.identifier,
      password: credentials.password,
    });
    return data;
  };

  const mutation = useMutation({
    mutationFn: loginUser,
  });

  const onSubmit = async (formData: LoginFormInputs) => {
    try {
      const data = await mutation.mutateAsync(formData);
      console.log(data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-green-300 text-black">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-6 rounded-xl shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-bold text-center mb-6">Entrar</h2>

        {/* Email Field */}
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium mb-2">
            Email/usuário
          </label>
          <input
            id="email"
            type="text"
            {...register("identifier", {
              required: "Email ou usuário são necessários.",
              validate: (value) => {
                if (value.includes("@")) {
                  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                  return emailRegex.test(value) || "Email inválido.";
                }
                return true;
              },
            })}
            className={`w-full px-3 py-2 border rounded ${
              errors.identifier ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.identifier && (
            <p className="text-red-500 text-sm mt-1">
              {errors.identifier.message}
            </p>
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
              required: "Senha é necessária",
              minLength: {
                value: 6,
                message: "Senha deve conter no mínimo 6 caractéres.",
              },
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

        {/* Submit Button */}
        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 mb-5 disabled:bg-blue-300"
        >
          {mutation.isPending ? "Entrando..." : "Entrar"}
        </button>

        {/* Create an account option*/}
        <a
          href="/create-account"
          className="text-blue-400 mt-2 hover:text-blue-800 underline"
        >
          Ainda não tem uma conta? Crie agora!
        </a>
      </form>
    </main>
  );
}
