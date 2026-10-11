import { useAuth } from "../../context/AuthContext";
import PageHeader from "../../components/common/PageHeader";
import MembersPanel from "./MembersPanel";

function Team() {
  const { user } = useAuth();
  const org = user.organization;

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="Team" description={`Manage the people at ${org?.organizationName || "your organization"} who handle disputes.`} />
      <div className="card p-5 sm:p-6">
        <MembersPanel organizationId={org?._id} canAddAdmins={false} currentUserId={user._id} />
      </div>
    </div>
  );
}

export default Team;
