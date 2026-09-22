import {
  addToCartWorkflow,
  refreshCartItemsWorkflow,
  updateLineItemInCartWorkflow,
} from "@medusajs/medusa/core-flows"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { StepResponse } from "@medusajs/framework/workflows-sdk"

// price lists match a flat customer_group_id, not customer.groups
function customerGroupIds(
  groups: ({ id: string } | null | undefined)[] | null | undefined,
): string[] {
  return (groups ?? [])
    .filter((g): g is { id: string } => !!g)
    .map((g) => g.id)
}

addToCartWorkflow.hooks.setPricingContext(async ({ cart }) => {
  return new StepResponse({
    customer_group_id: customerGroupIds(cart.customer?.groups),
  })
})

updateLineItemInCartWorkflow.hooks.setPricingContext(async ({ cart }) => {
  return new StepResponse({
    customer_group_id: customerGroupIds(cart.customer?.groups),
  })
})

refreshCartItemsWorkflow.hooks.setPricingContext(
  async ({ cart_id }, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    const { data: carts } = await query.graph({
      entity: "cart",
      fields: ["id", "customer.groups.id"],
      filters: { id: cart_id },
    })

    return new StepResponse({
      customer_group_id: customerGroupIds(carts[0]?.customer?.groups),
    })
  },
)
