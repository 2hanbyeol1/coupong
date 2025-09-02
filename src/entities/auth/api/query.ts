import { mutationOptions } from "@tanstack/react-query";

import { signInWithKakao, signOut } from "./api";

export const signInWithKakaoOption = () =>
  mutationOptions({
    mutationFn: async () => await signInWithKakao(),
  });

export const signOutOption = () =>
  mutationOptions({
    mutationFn: async () => await signOut(),
  });
