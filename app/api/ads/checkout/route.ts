// app/api/ads/checkout/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "";
const appUrl =
  process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || "";

// 15 € in centesimi
const AD_PRICE_CENTS = 15_00;

let stripe: Stripe | null = null;
if (stripeSecretKey) {
  stripe = new Stripe(stripeSecretKey, {
    apiVersion: "2023-10-16" as any,
  });
} else {
  console.error("STRIPE_SECRET_KEY is not set in environment variables");
}

export async function POST(req: Request) {
  try {
    if (!stripe) {
      return NextResponse.json(
        { error: "Stripe is not configured (missing STRIPE_SECRET_KEY)" },
        { status: 500 }
      );
    }

    if (!appUrl || !appUrl.startsWith("http")) {
      console.error("APP_URL / NEXT_PUBLIC_APP_URL non valida:", appUrl);
      return NextResponse.json(
        {
          error:
            "APP_URL / NEXT_PUBLIC_APP_URL non valida. Deve iniziare con http o https.",
        },
        { status: 500 }
      );
    }

    const { adId } = await req.json();

    if (!adId) {
      return NextResponse.json(
        { error: "Missing adId in request body" },
        { status: 400 }
      );
    }

    const successUrl = `${appUrl}/ads?status=success`;
    const cancelUrl = `${appUrl}/ads?status=cancel`;

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
        ad_id: adId,
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (err: any) {
    console.error("Stripe error", err);
    return NextResponse.json(
      {
        error:
          err?.message ??
          `Stripe error (type: ${typeof err})`,
      },
      { status: 500 }
    );
  }
}
