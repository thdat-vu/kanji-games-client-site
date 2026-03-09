import { createClient } from "@/lib/supabase/server";

export default async function InstrumentsPage() {
  const supabase = await createClient();

  const { data: instruments, error } = await supabase
    .from("instruments")
    .select();

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)] p-8">
        <h1 className="text-2xl font-bold mb-4">Instruments</h1>
        <p className="text-red-600">
          Error loading instruments: {error.message}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)] p-8">
      <h1 className="text-2xl font-bold mb-4">Instruments</h1>
      <pre className="bg-black/5 rounded-lg p-4 text-sm overflow-x-auto">
        {JSON.stringify(instruments, null, 2)}
      </pre>
    </div>
  );
}

