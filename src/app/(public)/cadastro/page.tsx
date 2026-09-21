import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { RegisterForm } from "@/features/auth/components/RegisterForm";

export default function RegisterPage() {
  return (
    <AuthLayout
      title="Crie sua conta"
      subtitle="Cadastre-se e agende seu próximo momento de cuidado e autoestima."
    >
      <RegisterForm />
    </AuthLayout>
  );
}
