import {
  ITaxProvider,
  ItemTaxCalculationLine,
  ShippingTaxCalculationLine,
  TaxCalculationContext,
  ItemTaxLineDTO,
  ShippingTaxLineDTO,
} from "@medusajs/framework/types"
import { MedusaError } from "@medusajs/framework/utils"

// CGST+SGST for intra-state, IGST for inter-state. The GST rate itself comes
// from the TaxRate rows the tax module matches per product (`line.rates`).

type Options = {
  // lower-case ISO 3166-2 code of the seller's state, e.g. "in-ka"
  sellerProvinceCode: string
  shippingGstPercent: number
}

const PROVIDER_IDENTIFIER = "india-gst"

type TaxIdField = { line_item_id: string } | { shipping_line_id: string }

export default class IndiaGstTaxProviderService implements ITaxProvider {
  static identifier = PROVIDER_IDENTIFIER

  protected options_: Options

  constructor(_container: Record<string, unknown>, options: Options) {
    this.options_ = options
  }

  getIdentifier(): string {
    return PROVIDER_IDENTIFIER
  }

  async getTaxLines(
    itemLines: ItemTaxCalculationLine[],
    shippingLines: ShippingTaxCalculationLine[],
    context: TaxCalculationContext
  ): Promise<(ItemTaxLineDTO | ShippingTaxLineDTO)[]> {
    const isIntraState =
      context.address?.province_code?.toLowerCase() ===
      this.options_.sellerProvinceCode.toLowerCase()

    const taxLines: (ItemTaxLineDTO | ShippingTaxLineDTO)[] = []

    for (const { line_item, rates } of itemLines) {
      const matchedRate = rates.find((r) => r.is_default) ?? rates[0]
      if (!matchedRate || matchedRate.rate === null) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `Product ${line_item.product_id} has no GST rate configured for ` +
            `this tax region - refusing to guess a tax rate.`
        )
      }
      taxLines.push(
        ...this.buildTaxLines(matchedRate.rate, isIntraState, {
          line_item_id: line_item.id,
        })
      )
    }

    for (const { shipping_line } of shippingLines) {
      taxLines.push(
        ...this.buildTaxLines(this.options_.shippingGstPercent, isIntraState, {
          shipping_line_id: shipping_line.id,
        })
      )
    }

    return taxLines
  }

  private buildTaxLines(
    percent: number,
    isIntraState: boolean,
    idField: TaxIdField
  ): (ItemTaxLineDTO | ShippingTaxLineDTO)[] {
    if (isIntraState) {
      const half = percent / 2
      return [
        {
          ...idField,
          rate: half,
          code: "CGST",
          name: `${half}% CGST`,
          provider_id: this.getIdentifier(),
        } as ItemTaxLineDTO | ShippingTaxLineDTO,
        {
          ...idField,
          rate: half,
          code: "SGST",
          name: `${half}% SGST`,
          provider_id: this.getIdentifier(),
        } as ItemTaxLineDTO | ShippingTaxLineDTO,
      ]
    }

    return [
      {
        ...idField,
        rate: percent,
        code: "IGST",
        name: `${percent}% IGST`,
        provider_id: this.getIdentifier(),
      } as ItemTaxLineDTO | ShippingTaxLineDTO,
    ]
  }
}
