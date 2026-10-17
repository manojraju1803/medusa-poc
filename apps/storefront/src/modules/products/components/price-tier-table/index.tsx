import { convertToLocale } from "@lib/util/money"
import { formatTierRange } from "@lib/util/price-tiers"
import { clx } from "@modules/common/components/ui"
import { PriceTier } from "types/global"

type PriceTierTableProps = {
  tiers: PriceTier[]
  currencyCode: string
  // `from` of the slab the selected quantity falls in
  activeFrom?: number
}

export default function PriceTierTable({
  tiers,
  currencyCode,
  activeFrom,
}: PriceTierTableProps) {
  return (
    <table className="w-full text-small-regular" data-testid="price-tier-table">
      <thead>
        <tr className="text-ui-fg-subtle">
          <th className="text-left font-normal px-2 pb-1">Quantity</th>
          <th className="text-right font-normal px-2 pb-1">Price per unit</th>
        </tr>
      </thead>
      <tbody>
        {tiers.map((tier) => {
          const isActive = tier.from === activeFrom

          return (
            <tr
              key={tier.from}
              className={clx("border-t border-ui-border-base", {
                "bg-ui-bg-subtle text-ui-fg-base font-semibold": isActive,
                "text-ui-fg-subtle": !isActive,
              })}
              data-active={isActive}
              data-testid="price-tier-row"
            >
              <td className="px-2 py-2">{formatTierRange(tier)}</td>
              <td className="px-2 py-2 text-right">
                {convertToLocale({
                  amount: tier.unit_amount,
                  currency_code: currencyCode,
                })}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
