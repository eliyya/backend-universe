import { Database } from "../../database.types.ts";

export type tuser = Omit<
  Database["public"]["Tables"]["users"]["Row"],
  "password"
>;

export interface iUser {
  get(id: number): Promise<tuser>;
  register(email: string, password: string): Promise<tuser>;
  login(
    email: string,
    password: string,
  ): Promise<{ token: string; expires: number }>;
}
