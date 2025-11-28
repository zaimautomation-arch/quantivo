// app/api/ads/checkout/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

// Leggo le env UNA volta sola
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const appUrl = process.env.NEXT_PUBLIC_APP_URL;

// Controlli di configurazione lato server
if (!stripeSecretKey) {
  throw new Error("STRIPE_SECRET_KEY is not set in environment variables");
}

if (!appUrl) {
  throw new Error("NEXT_PUBLIC_APP_URL is not set in environment variables");
}

// Inizializzo Stripe con la secret key
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2023-10-16" as any,
});

// prezzo fisso in centesimi: 15 € = 1500
const AD_PRICE_CENTS = 15_00;

export async function POST(req: NextRequest) {
  try {
    const { adId } = await req.json();

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: "Quantivo Sponsored Slot",
              description: "Sponsored placement inside the Quantivo app",
            },
            unit_amount: AD_PRICE_CENTS,
          },
          quantity: 1,
        },
      ],
      metadata: {
        ad_id: adId ?? "",
      },
      success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/checkout/cancel`,
    });

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (err: any) {
    console.error("Stripe error", err);
    return NextResponse.json(
      {
        error: err?.message ?? "Stripe error",
      },
      { status: 500 }
    );
  }
}
