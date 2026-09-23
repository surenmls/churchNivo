import { Link } from 'react-router-dom';

export default function HomeCTA() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-800 px-8 py-16 text-center shadow-2xl sm:px-16">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-indigo-400/20 blur-3xl" />

          <div className="relative">
            <span className="inline-block rounded-full bg-white/15 px-4 py-1.5 text-sm font-semibold text-white backdrop-blur">
              Start Your Journey
            </span>
            <h2 className="mx-auto mt-6 max-w-2xl font-display text-3xl font-bold text-white sm:text-4xl md:text-5xl">
              Ready to find your church family?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-primary-100">
              Whether you're new to faith or looking for a new home, explore churches and events on ChurchNivo today.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link
                to="/churches"
                className="rounded-2xl bg-white px-8 py-4 text-sm font-bold text-primary-700 shadow-lg transition hover:scale-105"
              >
                Browse All Churches
              </Link>
              <Link
                to="/contact"
                className="rounded-2xl border-2 border-white/40 px-8 py-4 text-sm font-bold text-white transition hover:bg-white/10"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
