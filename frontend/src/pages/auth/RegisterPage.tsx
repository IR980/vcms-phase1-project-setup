import { Link, useNavigate } from "react-router-dom";

import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import toast from "react-hot-toast";

import { Mail, Phone, User, UserPlus } from "lucide-react";

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
  registerSchema,
  type RegisterFormData,
} from "../../validation/auth.validation";

const RegisterPage = () => {
  const navigate = useNavigate();

  const { register: registerUser, isLoading } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser({
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
      });

      toast.success("Registration successful!");

      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? "Registration failed.");
    }
  };

  return (
    <Card variant="elevated">
      <CardHeader>
        <CardTitle>Create Account</CardTitle>

        <CardDescription>
          Register to access the Vehicle Compliance Management System.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input
            label="Full Name"
            required
            leftIcon={<User size={18} />}
            error={errors.name?.message}
            {...register("name")}
          />

          <Input
            label="Email"
            required
            leftIcon={<Mail size={18} />}
            error={errors.email?.message}
            {...register("email")}
          />

          <Input
            label="Mobile Number"
            required
            leftIcon={<Phone size={18} />}
            error={errors.phone?.message}
            {...register("phone")}
          />

          <PasswordInput
            label="Password"
            required
            error={errors.password?.message}
            {...register("password")}
          />

          <PasswordInput
            label="Confirm Password"
            required
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />

          <Button
            type="submit"
            fullWidth
            loading={isLoading}
            leftIcon={<UserPlus size={18} />}
          >
            Create Account
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          Already have an account?
          <Link
            to="/login"
            className="ml-1 font-semibold text-blue-600 hover:text-blue-700"
          >
            Login
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default RegisterPage;
