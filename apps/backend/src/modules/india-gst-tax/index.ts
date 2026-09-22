import { ModuleProvider, Modules } from "@medusajs/framework/utils"
import IndiaGstTaxProviderService from "./service"

export default ModuleProvider(Modules.TAX, {
  services: [IndiaGstTaxProviderService],
})
