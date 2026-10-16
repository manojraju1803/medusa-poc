import LocalizedClientLink from "@modules/common/components/localized-client-link"

const SignInPrompt = () => {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm px-5 py-4 flex items-center justify-between gap-4">
      <div>
        <h2 className="text-sm font-bold text-[#0f172a]">
          Already have an account?
        </h2>
        <p className="text-xs text-[#64748b] mt-1">
          Sign in to see your prices and checkout faster.
        </p>
      </div>
      <LocalizedClientLink
        href="/account"
        className="px-4 py-2 border border-[#006B4F]/40 text-[#006B4F] text-sm font-semibold rounded-xl hover:bg-[#f0fdf4] transition-colors"
        data-testid="sign-in-button"
      >
        Sign in
      </LocalizedClientLink>
    </div>
  )
}

export default SignInPrompt
