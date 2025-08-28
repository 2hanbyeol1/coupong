interface InfoMessageProps {
  title: string;
  description: string;
}

function InfoMessage({ title, description }: InfoMessageProps) {
  return (
    <div className="flex flex-col items-center justify-center px-3 pt-6 pb-6">
      <div className="mb-1 text-sm font-medium">{title}</div>
      <div className="text-sm text-gray-500">{description}</div>
    </div>
  );
}

export default InfoMessage;
