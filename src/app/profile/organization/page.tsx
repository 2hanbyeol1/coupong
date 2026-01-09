import { MyOrganizationList } from "@/features/select-organization/ui/MyOrganizationList";
import { Header } from "@/widgets/header";

function MyOrganizationPage() {
  return (
    <div className="relative">
      <Header withBackButton />
      <div className="flex flex-col gap-5 px-6 py-6">
        <div className="text-xl font-medium">내 그룹 관리</div>
        <MyOrganizationList />
      </div>
    </div>
  );
}

export default MyOrganizationPage;
