interface ProfileMenuTitleProps {
  title: string;
}

function ProfileMenuTitle({ title }: ProfileMenuTitleProps) {
  return <div className="text-dark px-2 pb-2 font-medium">{title}</div>;
}

export default ProfileMenuTitle;
