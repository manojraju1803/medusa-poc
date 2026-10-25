import { Metadata } from "next"

import {
  Checklist,
  H2,
  InfoLayout,
  Mail,
  P,
} from "@modules/info-pages/components/info-layout"

export const metadata: Metadata = {
  title: "Privacy Policy | IngredientsBazar",
  description:
    "How SaiSukrithkar Supplements Private Limited collects, uses and protects information on Ingredientsbazar.com.",
}

export default function PrivacyPolicyPage() {
  return (
    <InfoLayout
      title="Privacy Policy"
      subtitle="How we collect, use and protect your information"
      current="/privacy-policy"
    >
      <P>
        <strong className="text-[#0f172a]">
          SaiSukrithkar Supplements Private Limited is committed to protecting the
          privacy of our customers, especially those who access and use our
          Ingredientsbazar.com website.
        </strong>
      </P>
      <P>
        This Privacy Policy is designed to inform you about the types of
        information we gather about you and your organisation, how we may use that
        information, whether we disclose it to anyone, and the choices you have
        regarding our use of that information.
      </P>

      <H2>Collection and use of your personal information</H2>
      <Checklist
        items={[
          "For all visitors to our website, the Company collects general data such as the visitor's IP address, operating system, browser type and version number, and the web pages viewed. This information is aggregated with all other visitor information.",
          "The Company collects personal information, meaning information by which specific individuals can be identified, including name, identification number, mailing address, e-mail address and other personal characteristics or attributes. The Company will process personal information collected from you fairly and lawfully and will not use it for purposes incompatible with those for which it was requested and received. For example, the Company will use your personal information to process orders; to improve our websites and your online experience; to provide information about our products and services; for ordering, customer support, payment, processing and service purposes; to transact business with us; for credit checks, collections and related billing or credit purposes; and as otherwise allowed by law.",
          "In addition to personal information you provide for ordering products, you may provide financial information to us for the purpose of online banking services.",
        ]}
      />

      <H2>Sharing your personal information</H2>
      <P>
        The Company may share your personal information within our organisation,
        or with authorised third parties (e.g. business partners, suppliers and
        financial institutions) as described in this policy. We may also disclose
        information in response to subpoenas, governmental requests or other legal
        process, or to otherwise protect our legal or contractual obligations. We
        will not sell or otherwise transfer your personal information to
        individuals or entities outside of us or our authorised partners without
        your approval.
      </P>

      <H2>Cookies</H2>
      <P>
        A cookie is a type of identifier sent from a website to your computer via
        your web browser to provide tailored features. The Company uses cookies to
        secure and confirm your information when you log in with your private
        login name and password. We do not use this information for any purpose
        other than granting you access to specific secured pages of the website.
      </P>

      <H2>E-mail communications</H2>
      <P>
        The Company sends customers promotional announcements about savings,
        rebates, trade shows and product launches. You can stop these at any time
        using the opt-out link at the bottom of the e-mail. We do not sell these
        e-mail lists to any of our business partners for any reason.
      </P>

      <H2>Third-party services: events and webinars</H2>
      <P>
        From time to time, the Company collects personal information for events
        and webinars. This information may be disclosed to our third-party
        partners for the limited purpose of developing business opportunities.
      </P>

      <H2>Communication preferences and reviewing your information</H2>
      <P>
        You can manage your communication preferences by e-mailing <Mail />.
        Please include your name, e-mail address and the details of your request.
        You can also access and update your personal information by e-mailing{" "}
        <Mail /> or writing to the address below, including your name, e-mail
        address, account ID and the purpose of the request.
      </P>

      <H2>Security of your personal information</H2>
      <P>
        The Company uses a combination of industry-standard security measures to
        protect your personal information from loss and misuse.
      </P>

      <H2>How to contact us</H2>
      <P>
        E-mail <Mail /> or write to the address below. Please include your contact
        information, the name of the Company website or service, and a detailed
        description of your request or privacy concern.
      </P>
      <address className="not-italic my-4 rounded-xl border border-gray-100 bg-[#f8fafc] px-4 py-3 text-sm leading-relaxed text-[#334155]">
        <strong className="text-[#0f172a]">SaiSukrithkar Supplements Private Limited</strong>
        <br />
        #716, 7th Cross, Weaver&apos;s Colony, Gottigere Post,
        <br />
        Bannerughatta Road, Bengaluru 560083, Karnataka, India
      </address>
      <P>
        The Company reserves the right to change its practices concerning
        information gathered from visitors to its websites. If such changes
        occur, this Privacy Policy will be updated; please check back periodically
        for the current terms. This Privacy Policy is not intended to and does not
        create any contractual or other legal rights in or on behalf of any party.
      </P>
    </InfoLayout>
  )
}
