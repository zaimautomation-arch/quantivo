export default function AdsCancelPage() {
  return (
    <div className="p-6 space-y-3">
      <h1 className="text-2xl font-semibold">Payment cancelled</h1>
      <p className="text-sm text-slate-400">
        You cancelled the payment process. No money has been charged.
      </p>
      <p className="text-sm text-slate-400">
        You can go back to the ADS page and start the payment again whenever
        you&apos;re ready.
      </p>
    </div>
  );
}
