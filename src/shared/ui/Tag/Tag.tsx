interface TagProps {
  name: string;
}

function Tag({ name }: TagProps) {
  return (
    <div className="bg-primary/5 text-primary rounded-sm px-2.5 py-1 text-sm font-medium">
      {name}
    </div>
  );
}

export default Tag;
