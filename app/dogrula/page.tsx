import { redirect } from "next/navigation";
import VerifyCodeForm from "@/components/VerifyCodeForm";

export default async function DogrulaPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

  if (!email) {
    redirect("/login");
  }

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
      <VerifyCodeForm email={email} />
    </main>
  );
}
