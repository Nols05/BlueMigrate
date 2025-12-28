import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import bcrypt from "bcrypt"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function saltAndHashPassword(password: string) {
  const salt = bcrypt.genSaltSync(10)
  return bcrypt.hashSync(password, salt)
}
