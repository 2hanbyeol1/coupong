"use client";
import z from "zod";

export const ORGANIZATION_INFO = {
  name: {
    label: "그룹 이름",
    name: "name",
    type: "text",
    placeholder: "그룹 이름",
    maxLength: 8,
    minLength: 0,
  },
};

export const ORGANIZATION_SCHEMA = {
  name: z
    .string()
    .max(
      ORGANIZATION_INFO.name.maxLength,
      `${ORGANIZATION_INFO.name.maxLength}자 이내로 입력해주세요`,
    ),
};
