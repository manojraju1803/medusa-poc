import { Badge } from "@modules/common/components/ui"

const PaymentTest = ({ className }: { className?: string }) => {
  return (
    <Badge color="green" className={className}>
      <span className="font-semibold">Demo:</span> Instant Mock Approval
    </Badge>
  )
}

export default PaymentTest
