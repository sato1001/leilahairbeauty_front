import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { LoginForm } from "@/features/auth/components/LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ registered?: string }> | { registered?: string };
}) {
  const resolvedParams = await Promise.resolve(searchParams ?? {});
  const registered = resolvedParams.registered === "true";

  return (
    <AuthLayout
      title="Bem-vindo de volta"
      subtitle="Acesse sua conta para continuar sua jornada de beleza."
    >
      <LoginForm registered={registered} />
    </AuthLayout>
  );
}
