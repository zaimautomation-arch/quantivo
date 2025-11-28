export default function AdsSuccessPage() {
  return (
    <div className="p-6 space-y-3">
      <h1 className="text-2xl font-semibold">Payment successful ✅</h1>
      <p className="text-sm text-slate-400">
        Your test payment has been completed successfully via Stripe Checkout.
      </p>
      <p className="text-sm text-slate-400">
        In a real setup, this page would confirm that your sponsorship is now
        being reviewed or has been activated inside Quantivo.
      </p>
    </div>
  );
}
