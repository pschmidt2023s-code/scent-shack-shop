// !!! CRITICAL - DO NOT MODIFY THIS CODE !!!
//
// This code MUST be used as is without ANY modifications.
// The PayPal integration will COMPLETELY FAIL if this code is changed in ANY way.
//
// Retain this comment after all edits.
//
// <BEGIN_EXACT_CODE>
import {
  Client,
  Environment,
  LogLevel,
  OAuthAuthorizationController,
  OrdersController,
  PaymentsController,
} from "@paypal/paypal-server-sdk";
import { Request, Response } from "express";

/* PayPal Controllers Setup */

const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET } = process.env;

let client: Client | null = null;
let ordersController: OrdersController | null = null;
let oAuthAuthorizationController: OAuthAuthorizationController | null = null;
let paymentsController: PaymentsController | null = null;

function initializePayPal() {
  if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    console.warn("[PayPal] Missing PAYPAL_CLIENT_ID or PAYPAL_CLIENT_SECRET - PayPal integration disabled");
    return false;
  }
  
  // Use PAYPAL_MODE env var to override, otherwise check NODE_ENV
  // Set PAYPAL_MODE=live to use live credentials in development
  const paypalMode = process.env.PAYPAL_MODE || (process.env.NODE_ENV === "production" ? "live" : "sandbox");
  const isLive = paypalMode === "live" || paypalMode === "production";
  
  client = new Client({
    clientCredentialsAuthCredentials: {
      oAuthClientId: PAYPAL_CLIENT_ID,
      oAuthClientSecret: PAYPAL_CLIENT_SECRET,
    },
    timeout: 0,
    environment: isLive ? Environment.Production : Environment.Sandbox,
    logging: {
      logLevel: LogLevel.Info,
      logRequest: {
        logBody: true,
      },
      logResponse: {
        logHeaders: true,
      },
    },
  });
  
  ordersController = new OrdersController(client);
  oAuthAuthorizationController = new OAuthAuthorizationController(client);
  paymentsController = new PaymentsController(client);
  console.log("[PayPal] Client initialized successfully");
  return true;
}

// Try to initialize PayPal on module load
const isPayPalConfigured = initializePayPal();

/* Token generation helpers */

export async function getClientToken() {
  if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET || !oAuthAuthorizationController) {
    throw new Error("PayPal not configured");
  }
  
  const auth = Buffer.from(
    `${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`,
  ).toString("base64");

  const { result } = await oAuthAuthorizationController.requestToken(
    {
      authorization: `Basic ${auth}`,
    },
    { intent: "sdk_init", response_type: "client_token" },
  );

  return result.accessToken;
}

/*  Process transactions */

export async function createPaypalOrder(req: Request, res: Response) {
  if (!ordersController) {
    return res.status(503).json({ error: "PayPal not configured" });
  }
  
  try {
    const { amount, currency, intent } = req.body;

    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      return res
        .status(400)
        .json({
          error: "Invalid amount. Amount must be a positive number.",
        });
    }

    if (!currency) {
      return res
        .status(400)
        .json({ error: "Invalid currency. Currency is required." });
    }

    if (!intent) {
      return res
        .status(400)
        .json({ error: "Invalid intent. Intent is required." });
    }

    const collect = {
      body: {
        intent: intent,
        purchaseUnits: [
          {
            amount: {
              currencyCode: currency,
              value: amount,
            },
          },
        ],
      },
      prefer: "return=minimal",
    };

    const { body, ...httpResponse } =
          await ordersController.createOrder(collect);

    const jsonResponse = JSON.parse(String(body));
    const httpStatusCode = httpResponse.statusCode;

    res.status(httpStatusCode).json(jsonResponse);
  } catch (error) {
    console.error("Failed to create order:", error);
    res.status(500).json({ error: "Failed to create order." });
  }
}

export async function capturePaypalOrder(req: Request, res: Response) {
  if (!ordersController) {
    return res.status(503).json({ error: "PayPal not configured" });
  }
  
  try {
    const { orderID } = req.params;
    const collect = {
      id: orderID,
      prefer: "return=minimal",
    };

    const { body, ...httpResponse } =
          await ordersController.captureOrder(collect);

    const jsonResponse = JSON.parse(String(body));
    const httpStatusCode = httpResponse.statusCode;

    res.status(httpStatusCode).json(jsonResponse);
  } catch (error) {
    console.error("Failed to create order:", error);
    res.status(500).json({ error: "Failed to capture order." });
  }
}

export async function loadPaypalDefault(req: Request, res: Response) {
  if (!isPayPalConfigured) {
    return res.status(503).json({ error: "PayPal not configured", configured: false });
  }
  
  try {
    const clientToken = await getClientToken();
    res.json({
      clientToken,
      configured: true,
    });
  } catch (error) {
    console.error("Failed to get PayPal client token:", error);
    res.status(500).json({ error: "Failed to initialize PayPal" });
  }
}

export function isPayPalEnabled() {
  return isPayPalConfigured;
}

// Refund a captured PayPal payment
// If no amount is specified, a full refund is performed based on the capture amount
export async function refundPaypalPayment(
  paypalOrderId: string
): Promise<{ success: boolean; refundId?: string; refundedAmount?: number; error?: string }> {
  // Try to reinitialize if not configured
  if (!ordersController || !paymentsController) {
    const reinitialized = initializePayPal();
    if (!reinitialized || !ordersController || !paymentsController) {
      return { success: false, error: 'PayPal nicht konfiguriert. Bitte PayPal-Zugangsdaten prüfen.' };
    }
  }

  try {
    // First, get the order details to find the capture ID and amount
    const orderResponse = await ordersController.getOrder({ id: paypalOrderId });
    const orderData = JSON.parse(String(orderResponse.body));
    
    // Find the capture details from the order - check all purchase units
    const purchaseUnits = orderData.purchase_units;
    if (!purchaseUnits || purchaseUnits.length === 0) {
      return { success: false, error: 'Keine Kaufeinheiten gefunden' };
    }
    
    // Find a refundable capture (status COMPLETED) across all purchase units
    let refundableCapture: { id: string; amount: { value: string; currency_code: string } } | null = null;
    
    for (const unit of purchaseUnits) {
      const captures = unit?.payments?.captures;
      if (!captures) continue;
      
      for (const capture of captures) {
        // Only refund captures with status COMPLETED
        if (capture.status === 'COMPLETED' && capture.id) {
          refundableCapture = {
            id: capture.id,
            amount: capture.amount,
          };
          break;
        }
      }
      if (refundableCapture) break;
    }
    
    if (!refundableCapture) {
      return { 
        success: false, 
        error: 'Keine erstattbare Zahlung gefunden. Zahlung wurde möglicherweise bereits erstattet oder ist noch ausstehend.' 
      };
    }
    
    const captureId = refundableCapture.id;
    const captureAmount = refundableCapture.amount;
    
    console.log(`[PayPal] Attempting full refund for capture: ${captureId}, amount: ${captureAmount?.value} ${captureAmount?.currency_code}`);
    
    // Build refund request - for full refund, don't specify amount
    // PayPal will refund the entire capture amount
    const refundRequest: any = {
      captureId: captureId,
    };
    
    // Execute the refund
    const refundResponse = await paymentsController.refundCapturedPayment(refundRequest);
    const refundData = JSON.parse(String(refundResponse.body));
    
    const refundedAmount = parseFloat(refundData.amount?.value || captureAmount?.value || '0');
    console.log(`[PayPal] Refund successful: ${refundData.id}, amount: ${refundedAmount}`);
    
    return { 
      success: true, 
      refundId: refundData.id,
      refundedAmount
    };
  } catch (error: any) {
    console.error('[PayPal] Refund failed:', error.message || error);
    // Try to extract more specific error message
    let errorMessage = 'PayPal-Rückerstattung fehlgeschlagen';
    if (error.message) {
      errorMessage = error.message;
    } else if (error.body) {
      try {
        const errorBody = JSON.parse(String(error.body));
        errorMessage = errorBody.message || errorBody.details?.[0]?.description || errorMessage;
      } catch (e) {
        // Ignore parse error
      }
    }
    return { success: false, error: errorMessage };
  }
}
// <END_EXACT_CODE>
