import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#F5F0E8] text-[#2C2C2C]">
      <Navbar />
      <main className="mx-auto max-w-3xl px-6 pb-20 pt-28 md:px-10" aria-labelledby="privacy-title">
        <p className="mb-3 font-body text-xs uppercase tracking-[0.16em] text-[#6B4F1D]">ManMandir Bridal Studio</p>
        <h1 id="privacy-title" className="font-display text-4xl md:text-5xl">Privacy Policy</h1>
        <div className="mt-8 space-y-6 font-body text-sm leading-7 text-[#514B46]">
          <section>
            <h2 className="mb-2 font-display text-2xl text-[#2C2C2C]">Customer reviews</h2>
            <p>If you submit a review, your name, optional city, rating, comment and any photo you choose to attach may be shown publicly after publication. Reviews are normally held for moderation first. Submissions that are flagged may remain under review even when immediate publishing is enabled.</p>
          </section>
          <section>
            <h2 className="mb-2 font-display text-2xl text-[#2C2C2C]">Information kept private</h2>
            <p>Your optional email address is not displayed with a review and is used only for review-related customer notifications. A privacy-preserving hash of technical request information is used to enforce review-submission and report limits; the raw address is not stored in the rate-limit history or returned by public review pages.</p>
          </section>
          <section>
            <h2 className="mb-2 font-display text-2xl text-[#2C2C2C]">Review removal requests</h2>
            <p>You may ask the studio to remove a review and its attached photo. Use the current contact channel published on this site. Review data is used to display customer feedback, administer moderation and protect the service from abuse.</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  )
}
