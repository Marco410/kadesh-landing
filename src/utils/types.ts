import { Author } from "kadesh/components/blog/types";

export type AuthenticatedItem = User;

export interface User {
  id: string;
  name: string;
  lastName: string;
  username: string;
  email: string;
  verified: boolean;
  phone?: string | null;
  profileImage?: {
    url: string;
  } | null;
  roles?: {
    name: string;
  } | null;
  createdAt: string;
}