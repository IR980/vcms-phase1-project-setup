import { Link, useNavigate } from "react-router-dom";

import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import toast from "react-hot-toast";

import {
  Mail,
  LogIn,
} from "lucide-react";

import Card, {
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../../components/common/Card";

import Input from "../../components/common/Input";

import PasswordInput from "../../components/common/PasswordInput";

import Button from "../../components/common/Button";

import useAuth from "../../hooks/useAuth";

import {
  loginSchema,
  type LoginFormData,
} from "../../validation/auth.validation";

const LoginPage = () => {
  const navigate = useNavigate();

  const {
    login,
    isLoading,
  } = useAuth();

  const {
    register,

    handleSubmit,

    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (
    data: LoginFormData
  ) => {
    try {
      await login(data);

      toast.success("Welcome back!");

      navigate("/dashboard");
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ??
          "Login failed."
      );
    }
  };

  return (
    <Card variant="elevated">
      <CardHeader>
        <CardTitle>
          Welcome Back
        </CardTitle>

        <CardDescription>
          Login to continue to your
          dashboard.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5"
        >
          <Input
            label="Email"

            placeholder="Enter your email"

            leftIcon={
              <Mail size={18} />
            }

            error={
              errors.email?.message
            }

            {...register("email")}
          />

          <PasswordInput
            label="Password"

            placeholder="Enter password"

            error={
              errors.password
                ?.message
            }

            {...register(
              "password"
            )}
          />

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
              />

              Remember me
            </label>

            <Link
              to="/forgot-password"
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Forgot Password?
            </Link>
          </div>

          <Button
            type="submit"
            fullWidth
            loading={isLoading}
            leftIcon={
              <LogIn size={18} />
            }
          >
            Sign In
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          Don't have an account?

          <Link
            to="/register"
            className="ml-1 font-semibold text-blue-600 hover:text-blue-700"
          >
            Register
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoginPage;