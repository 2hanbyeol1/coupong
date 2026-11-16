import { Header } from "@/widgets/header";
import { OrganizationMemberWidget } from "@/widgets/organization/ui/OrganizationMemberWidget";

async function OrganizationMemberPage({
  params,
}: {
  params: Promise<{ organizationId: string }>;
}) {
  const { organizationId } = await params;

  return (
    <div className="relative">
      <Header withBackButton />
      <OrganizationMemberWidget organizationId={organizationId} />
    </div>
  );
}

export default OrganizationMemberPage;
