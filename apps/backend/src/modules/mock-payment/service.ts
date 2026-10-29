import {
  AuthorizePaymentInput,
  AuthorizePaymentOutput,
  CancelPaymentInput,
  CancelPaymentOutput,
  CapturePaymentInput,
  CapturePaymentOutput,
  DeletePaymentInput,
  DeletePaymentOutput,
  GetPaymentStatusInput,
  GetPaymentStatusOutput,
  InitiatePaymentInput,
  InitiatePaymentOutput,
  ProviderWebhookPayload,
  RefundPaymentInput,
  RefundPaymentOutput,
  RetrievePaymentInput,
  RetrievePaymentOutput,
  UpdatePaymentInput,
  UpdatePaymentOutput,
  WebhookActionResult,
} from "@medusajs/framework/types"
import {
  AbstractPaymentProvider,
  MedusaError,
  PaymentActions,
  PaymentSessionStatus,
} from "@medusajs/framework/utils"
import crypto from "crypto"

// Demo-only gateway. The storefront picks the outcome by sending
// `data.mock_outcome` ("success" | "decline") when it creates the payment
// session; the payment module merges that into the session's data, which is
// what authorizePayment receives during cart completion. A decline throws, so
// completeCartWorkflow aborts and the cart stays open for a retry.

export const MOCK_OUTCOME_KEY = "mock_outcome"

export default class MockPaymentProviderService extends AbstractPaymentProvider {
  static identifier = "mock"

  constructor(container: Record<string, unknown>, options: Record<string, unknown>) {
    super(container, options)
  }

  async initiatePayment(
    _input: InitiatePaymentInput
  ): Promise<InitiatePaymentOutput> {
    return { id: `mock_${crypto.randomUUID()}`, data: {} }
  }

  async authorizePayment(
    input: AuthorizePaymentInput
  ): Promise<AuthorizePaymentOutput> {
    if (input.data?.[MOCK_OUTCOME_KEY] === "decline") {
      throw new MedusaError(
        MedusaError.Types.PAYMENT_AUTHORIZATION_ERROR,
        "Payment declined by the mock gateway (simulated failure). No order was placed - you can retry."
      )
    }

    return {
      status: PaymentSessionStatus.AUTHORIZED,
      data: { ...input.data, authorized_at: new Date().toISOString() },
    }
  }

  async getPaymentStatus(
    input: GetPaymentStatusInput
  ): Promise<GetPaymentStatusOutput> {
    return {
      status:
        input.data?.[MOCK_OUTCOME_KEY] === "decline"
          ? PaymentSessionStatus.ERROR
          : PaymentSessionStatus.AUTHORIZED,
    }
  }

  async capturePayment(
    input: CapturePaymentInput
  ): Promise<CapturePaymentOutput> {
    return { data: { ...input.data, captured_at: new Date().toISOString() } }
  }

  async cancelPayment(input: CancelPaymentInput): Promise<CancelPaymentOutput> {
    return { data: input.data }
  }

  async refundPayment(input: RefundPaymentInput): Promise<RefundPaymentOutput> {
    return { data: input.data }
  }

  async retrievePayment(
    input: RetrievePaymentInput
  ): Promise<RetrievePaymentOutput> {
    return { data: input.data }
  }

  async updatePayment(input: UpdatePaymentInput): Promise<UpdatePaymentOutput> {
    return { data: input.data }
  }

  async deletePayment(input: DeletePaymentInput): Promise<DeletePaymentOutput> {
    return { data: input.data }
  }

  async getWebhookActionAndData(
    _payload: ProviderWebhookPayload["payload"]
  ): Promise<WebhookActionResult> {
    return { action: PaymentActions.NOT_SUPPORTED }
  }
}
