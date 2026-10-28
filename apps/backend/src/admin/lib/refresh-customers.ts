import { useQueryClient } from "@tanstack/react-query"
import { useCallback } from "react"

// Fired after approve / revoke or an account-type change, so the Customer
// types panel recounts without a page reload.
export const CUSTOMERS_CHANGED_EVENT = "ib:customers-changed"

// Clears the dashboard's cached customer and customer-group queries (the keys
// Medusa's admin uses) so its own lists and the customer's Groups section
// refetch, and tells our widgets to reload too.
export const useRefreshCustomers = () => {
  const queryClient = useQueryClient()
  return useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["customers"] })
    queryClient.invalidateQueries({ queryKey: ["customer_groups"] })
    window.dispatchEvent(new Event(CUSTOMERS_CHANGED_EVENT))
  }, [queryClient])
}
