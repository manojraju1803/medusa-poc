const ONES = [
  "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
  "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
  "Seventeen", "Eighteen", "Nineteen",
]
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"]

const belowHundred = (n: number) =>
  n < 20 ? ONES[n] : `${TENS[Math.floor(n / 10)]}${n % 10 ? ` ${ONES[n % 10]}` : ""}`

const belowThousand = (n: number) => {
  const hundreds = Math.floor(n / 100)
  const rest = n % 100
  return [hundreds ? `${ONES[hundreds]} Hundred` : "", rest ? belowHundred(rest) : ""]
    .filter(Boolean)
    .join(" and ")
}

// Whole rupees in the Indian numbering system (crore, lakh, thousand),
// e.g. 114402 -> "One Lakh Fourteen Thousand Four Hundred and Two only".
export const amountInWords = (amount: number) => {
  let n = Math.round(Math.abs(amount))
  if (n === 0) return "Zero only"

  const parts: string[] = []
  const crore = Math.floor(n / 1_00_00_000)
  n %= 1_00_00_000
  const lakh = Math.floor(n / 1_00_000)
  n %= 1_00_000
  const thousand = Math.floor(n / 1000)
  n %= 1000

  if (crore) parts.push(`${amountInWords(crore).replace(/ only$/, "")} Crore`)
  if (lakh) parts.push(`${belowHundred(lakh)} Lakh`)
  if (thousand) parts.push(`${belowHundred(thousand)} Thousand`)
  if (n) parts.push(belowThousand(n))

  return `${parts.join(" ")} only`
}
