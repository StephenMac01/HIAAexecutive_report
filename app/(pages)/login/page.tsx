import { Suspense } from "react";
import Loading from "@/app/loading";
import LoginClient from "./_components/LoginClient";

export const metadata = {
  title: "Sign in · CNS HIAA Dashboard",
};

export default function LoginPage() {
  return (
    <Suspense fallback={<Loading />}>
      <LoginClient />
    </Suspense>
  );
}
