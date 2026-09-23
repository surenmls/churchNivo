import { Link } from 'react-router-dom';

export default function HomeHero({ stats }) {
  return (
    <section className="relative min-h-[92vh] overflow-hidden">
      <img
        src="/images/hero-bg.jpg"
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-primary-950/90 via-primary-900/80 to-indigo-950/85" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.15)_0%,_transparent_50%)]" />
      <div className="absolute -right-32 top-20 h-96 w-96 rounded-full bg-primary-400/20 blur-3xl" />
      <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-indigo-400/20 blur-3xl" />

      <div className="relative mx-auto flex min-h-[92vh] max-w-7xl flex-col justify-center px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-md">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Connecting faith communities worldwide
            </div>

            <h1 className="mt-8 font-display text-5xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-6xl lg:text-7xl">
              Find Your
              <span className="block bg-gradient-to-r from-white via-primary-100 to-primary-200 bg-clip-text text-transparent">
                Place of Worship
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-primary-100/90 sm:text-xl">
              Discover churches near you, explore upcoming events, watch sermons, and connect with congregations — all on ChurchNivo.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                to="/churches"
                className="group inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-4 text-sm font-bold text-primary-700 shadow-2xl shadow-black/20 transition hover:scale-[1.02] hover:shadow-white/20"
              >
                Explore Churches
                <span className="transition group-hover:translate-x-1">→</span>
              </Link>
              <Link
                to="/events"
                className="inline-flex items-center gap-2 rounded-2xl border-2 border-white/30 bg-white/10 px-8 py-4 text-sm font-bold text-white backdrop-blur-md transition hover:bg-white/20"
              >
                View Events
              </Link>
            </div>

            <div className="mt-12 flex flex-wrap gap-8 border-t border-white/10 pt-8">
              {[
                { value: stats.churches, label: 'Churches' },
                { value: stats.events, label: 'Events' },
                { value: stats.promotions, label: 'Highlights' },
              ].map((item) => (
                <div key={item.label}>
                  <p className="font-display text-3xl font-bold text-white">{item.value}+</p>
                  <p className="mt-1 text-sm text-primary-200">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="relative">
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-primary-400/30 to-indigo-400/30 blur-2xl" />
              <div className="relative overflow-hidden rounded-3xl border border-white/20 shadow-2xl">
                <img
                  src="/images/hero-community.jpg"
                  alt="Community worship"
                  className="aspect-[4/5] w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary-950/80 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-md">
                  <p className="text-sm font-medium text-white/80">Join thousands discovering</p>
                  <p className="mt-1 font-display text-xl font-bold text-white">Faith, Fellowship & Hope</p>
                </div>
              </div>
              <div className="absolute -right-6 top-12 rounded-2xl border border-white/20 bg-white p-4 shadow-xl">
                <p className="text-2xl">⛪</p>
                <p className="mt-1 text-xs font-semibold text-gray-900">500+ Services</p>
                <p className="text-xs text-gray-500">Every week</p>
              </div>
              <div className="absolute -left-6 bottom-24 rounded-2xl border border-white/20 bg-white p-4 shadow-xl">
                <p className="text-2xl">🎵</p>
                <p className="mt-1 text-xs font-semibold text-gray-900">Sermons & Media</p>
                <p className="text-xs text-gray-500">On demand</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-gray-50 to-transparent" />
    </section>
  );
}
