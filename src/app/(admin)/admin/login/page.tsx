import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "Entrar" };

export default async function LoginPage() {
  if ((await auth())?.user) redirect("/admin");
  return (
    <div className="login-wrap">
      <LoginForm />
    </div>
  );
}
