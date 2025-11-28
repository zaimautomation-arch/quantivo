// app/test-env/page.tsx
import { getAIInvestmentIdeas } from "@/lib/AiAdvisor";

export default async function TestEnvPage() {
  const data = await getAIInvestmentIdeas();

  return (
    <pre className="text-xs whitespace-pre-wrap p-4">
      {JSON.stringify(data.prices.slice(0, 5), null, 2)}
    </pre>
  );
}
