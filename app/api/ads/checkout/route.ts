// app/api/ads/checkout/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16" as any,
});

// prezzo fisso in centesimi: 99 € = 9900
const AD_PRICE_CENTS = 15_00; // o 99_00 se vuoi 99€


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
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/cancel`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe error", err);
    return NextResponse.json(
      { error: "Stripe error" },
      { status: 500 }
    );
  }
}
