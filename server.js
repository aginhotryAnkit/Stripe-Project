// This is a public sample test API key.
// Don’t submit any personally identifiable information in requests made with this key.
// Sign in to see your own test API key embedded in code samples.
const stripe = require("stripe")(
  "sk_test_51MYSrNBnnnfxV9h4FqcNFU75JG4OAmVQN5C6z6xqWSRrQTbwWZYkozd6o6QU69xxEy4mQyweLnhWyXgswc18Ltwa00i88MgjcE"
);
const express = require("express");
const app = express();
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
const path = require('path');

const YOUR_DOMAIN = "http://localhost:4242";

app.post("/create-checkout-session", async (req, res) => {
  const plans = [
    {
      productId: "product1Id",
      nickname: "Pro 1",
      amount: 1000, // Amount in cents, e.g., $10.00
      currency: "inr",
      interval: "day", // 'month' or 'year'
      interval_count: 1,
    },
    {
      productId: "product2Id",
      nickname: "Pro 2",
      amount: 1500, // Amount in cents, e.g., $15.00
      currency: "inr",
      interval: "day", // 'month' or 'year'
      interval_count: 1,
    },
    {
      productId: "product3Id",
      nickname: "Pro 3",
      amount: 2000, // Amount in cents, e.g., $20.00
      currency: "inr",
      interval: "day", // 'month' or 'year'
      interval_count: 1,
    },
    // Add more plans as needed
  ];

  let planIds = [];

  async function createPlans() {
    for (const plan of plans) {
      try {
        const createdPlan = await stripe.plans.create({
          amount: plan.amount,
          currency: plan.currency,
          interval: plan.interval,
          interval_count: plan.interval_count,
          product: {
            name: plan.nickname,
          },
        });
        planIds.push(createdPlan);
      } catch (error) {
        console.error(`Error creating plan: ${error.message}`);
      }
    }
  }

  await createPlans();

  // const planData = await stripe.plans.create({
  //   amount: 160000,
  //   currency: 'inr',
  //   interval: 'month',
  //   product: {
  //     name: 'Subscription Product 1'
  //   },
  // });

  const session = await stripe.checkout.sessions.create({
    billing_address_collection: "auto",
    line_items: [
      {
        price: planIds[0].id,
        // For metered billing, do not pass quantity
        quantity: 2,
      },
      {
        price: planIds[1].id,
        // For metered billing, do not pass quantity
        quantity: 1,
      },
      {
        price: planIds[2].id,
        // For metered billing, do not pass quantity
        quantity: 1,
      },
    ],
    mode: "subscription",
    success_url: `${YOUR_DOMAIN}/success.html?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${YOUR_DOMAIN}/cancel.html`,
  });

  res.redirect(303, session.url);
});

// app.post("/create-portal-session", async (req, res) => {
//   // For demonstration purposes, we're using the Checkout session to retrieve the customer ID.
//   // Typically this is stored alongside the authenticated user in your database.
//   const { session_id } = req.body;
//   const checkoutSession = await stripe.checkout.sessions.retrieve(session_id);

//   // This is the url to which the customer will be redirected when they are done
//   // managing their billing with the portal.
//   const returnUrl = YOUR_DOMAIN+ '/checkout.html';

//   const portalSession = await stripe.billingPortal.sessions.create({
//     customer: checkoutSession.customer,
//     return_url: returnUrl,
//   });

//   console.log(portalSession.url);

//   res.redirect(303, portalSession.url);
// });

app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  (request, response) => {
    let event = request.body;
    // Replace this endpoint secret with your endpoint's unique secret
    // If you are testing with the CLI, find the secret by running 'stripe listen'
    // If you are using an endpoint defined with the API or dashboard, look in your webhook settings
    // at https://dashboard.stripe.com/webhooks
    const endpointSecret = "we_1MzDPOSGLN4aZ98oeWU0mHLV";
    // Only verify the event if you have an endpoint secret defined.
    // Otherwise use the basic event deserialized with JSON.parse
    if (endpointSecret) {
      // Get the signature sent by Stripe
      const signature = request.headers["stripe-signature"];
      try {
        event = stripe.webhooks.constructEvent(
          request.body,
          signature,
          endpointSecret
        );
      } catch (err) {
        console.log(`⚠️  Webhook signature verification failed.`, err.message);
        return response.sendStatus(400);
      }
    }
    let subscription;
    let status;
    // Handle the event
    switch (event.type) {
      case "customer.subscription.trial_will_end":
        subscription = event.data.object;
        status = subscription.status;
        console.log(`Subscription status is ${status}.`);
        // Then define and call a method to handle the subscription trial ending.
        // handleSubscriptionTrialEnding(subscription);
        break;
      case "customer.subscription.deleted":
        subscription = event.data.object;
        status = subscription.status;
        console.log(`Subscription status is ${status}.`);
        // Then define and call a method to handle the subscription deleted.
        // handleSubscriptionDeleted(subscriptionDeleted);
        break;
      case "customer.subscription.created":
        subscription = event.data.object;
        status = subscription.status;
        console.log(`Subscription status is ${status}.`);
        // Then define and call a method to handle the subscription created.
        // handleSubscriptionCreated(subscription);
        break;
      case "customer.subscription.updated":
        subscription = event.data.object;
        status = subscription.status;
        console.log(`Subscription status is ${status}.`);
        // Then define and call a method to handle the subscription update.
        // handleSubscriptionUpdated(subscription);
        break;
      default:
        // Unexpected event type
        console.log(`Unhandled event type ${event.type}.`);
    }
    // Return a 200 response to acknowledge receipt of the event
    response.send();
  }
);
app.listen(4242, () => console.log("Running on port 4242"));
// app.use(express.static(path.join(__dirname, 'public/checkout.html')));
