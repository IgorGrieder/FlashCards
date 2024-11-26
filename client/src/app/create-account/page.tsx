"use client";
import { AxiosPromise } from "axios";
import { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { api } from "../libs/axios";
import { CreateAccountResponse } from "../types/types";
import { useRouter } from "next/navigation";
import { UserContext } from "../context/userContext";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const createSchema = z.object({
  email: z.string().email("Insira um email válido"),
  username: z
    .string()
    .min(3, "Usuário deve ter pelo menos 3 caracteres")
    .max(50, "Usuário não pode ter mais de 50 caracteres")
    .refine(
      (value) => {
        // Check if it's a valid username (alphanumeric and underscores)
        const usernameRegex = /^[a-zA-Z0-9_]+$/;

        return usernameRegex.test(value);
      },
      {
        message: "Insira um nome de usuário válido",
      },
    ),
  password: z
    .string()
    .min(6, "Senha deve ter pelo menos 6 caracteres")
    .max(50, "Senha não pode ter mais de 50 caracteres"),
});

type LoginSchemaType = z.infer<typeof createSchema>;

export default function Login() {
  const router = useRouter();
  const userCtx = useContext(UserContext);
  const [createFailed, setCreateFailed] = useState<boolean>(false);

  // Function to make the request to the backend about the account creation
  const createUser = async (
    credentials: LoginSchemaType,
  ): AxiosPromise<CreateAccountResponse> => {
    const result = await api.post("/users/create-account", {
      email: credentials.email,
      username: credentials.username,
      password: credentials.password,
    });
    return result;
  };

  // TanStack query instance for a mutation
  const mutation = useMutation({
    mutationFn: createUser,
  });

  // React hook form usage
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchemaType>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      email: "",
      username: "",
      password: "",
    },
  });

  // onSubmit method
  const onSubmit = async (formData: LoginSchemaType) => {
    try {
      // Making the post request to our api to create an user
      const request = await mutation.mutateAsync(formData);

      // If the user was created we will send back to the home page
      if (request.status === 201 && request.data.accountCreated) {
        if (request.data.username) {
          userCtx?.login(request.data.username);
          router.push("/home");
        }
      }
    } catch (e) {
      setCreateFailed(true);
      console.log(e);
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
            Email
          </label>
          <input
            id="email"
            type="text"
            {...register("email", {
              onChange: () => setCreateFailed(false),
            })}
            className={`w-full px-3 py-2 border rounded ${
              errors.email ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Username Field */}
        <div className="mb-4">
          <label htmlFor="username" className="block text-sm font-medium mb-2">
            Usuário
          </label>
          <input
            id="username"
            type="text"
            {...register("username", {
              onChange: () => setCreateFailed(false),
            })}
            className={`w-full px-3 py-2 border rounded ${
              errors.username ? "border-red-500" : "border-gray-300"
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
          <label htmlFor="password" className="block text-sm font-medium mb-2">
            Senha
          </label>
          <input
            id="password"
            type="password"
            {...register("password", {
              onChange: () => setCreateFailed(false),
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
            className={`${createFailed ? "text-red-500" : "text-white"} text-sm mb-4`}
          >
            Preencha todos os campos corretamente
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
      </form>
    </main>
  );
}
