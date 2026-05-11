import { CenteredView } from "@/shared/ui/CenteredView";
import { LoginWidget } from "@/widgets/login";

import AuthErrorToast from "./AuthErrorToast";

interface LoginPageProps {
  searchParams: Promise<{ auth_error?: string }>;
}

const LoginPage = async ({ searchParams }: LoginPageProps) => {
  const { auth_error } = await searchParams;

  return (
    <CenteredView className="max-w-60">
      <LoginWidget />
      {auth_error && <AuthErrorToast reason={auth_error} />}
    </CenteredView>
  );
};

export default LoginPage;
