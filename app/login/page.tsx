import LoginForm from "@/components/LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
      <LoginForm error={error} message={message} />
    </main>
  );
}
