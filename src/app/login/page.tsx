import { CenteredView } from "@/shared/ui/CenteredView";
import { LoginWidget } from "@/widgets/login";

const LoginPage = () => {
  return (
    <CenteredView className="max-w-60">
      <LoginWidget />
    </CenteredView>
  );
};

export default LoginPage;
