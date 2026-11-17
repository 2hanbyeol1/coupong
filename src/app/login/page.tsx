import { LoginWidget } from "@/widgets/login";

import AuthErrorToast from "./AuthErrorToast";

interface LoginPageProps {
  searchParams: Promise<{ auth_error?: string }>;
}

const LoginPage = async ({ searchParams }: LoginPageProps) => {
  const { auth_error } = await searchParams;

  return (
    <>
      <LoginWidget />
      {auth_error && <AuthErrorToast reason={auth_error} />}
    </>
  );
};

export default LoginPage;
