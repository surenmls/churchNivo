import PageMeta from '../../components/PageMeta';
import ContactForm from '../../components/ContactForm';

export default function ContactPage() {
  return (
    <>
      <PageMeta
        title="Contact Us"
        description="Get in touch with the ChurchNivo team for support, partnerships, or general inquiries."
      />
      <div className="py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h1 className="section-title">Contact Us</h1>
            <p className="mt-4 text-lg text-gray-600">Get in touch with the ChurchNivo team</p>
          </div>

          <div className="card">
            <ContactForm endpoint="/contact/platform" showSubject submitLabel="Send Message" />

            <div className="mt-10 border-t border-gray-100 pt-8">
              <h3 className="font-semibold text-gray-900">Platform Support</h3>
              <p className="mt-2 text-sm text-gray-600">Messages are emailed via Gmail SMTP when configured in the backend.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
