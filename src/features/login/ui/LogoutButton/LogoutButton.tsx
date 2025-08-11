"use client";

import { signOut } from "@/entities/auth/api/auth";

function LogoutButton() {
  const handleLogout = async () => {
    await signOut();
  };

  // ! 임시 로그아웃 버튼
  return (
    <button
      type="button"
      className="text-primary text-base font-bold disabled:cursor-not-allowed disabled:opacity-50"
      onClick={handleLogout}
    >
      로그아웃
    </button>
  );
}

export default LogoutButton;
