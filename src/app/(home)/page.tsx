import Image from "next/image";

function HomePage() {
  return (
    <div>
      <div className="relative aspect-square w-20">
        <Image src="/pwa-icon/192.png" alt="로고" fill />
      </div>
    </div>
  );
}

export default HomePage;
