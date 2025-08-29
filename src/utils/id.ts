import { customAlphabet } from "nanoid";

export const id = () =>
  customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 32);
