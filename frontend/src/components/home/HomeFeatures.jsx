const features = [
  {
    icon: '⛪',
    title: 'Find Churches',
    description: 'Browse congregations by location, denomination, and community focus.',
    color: 'from-violet-500 to-purple-600',
  },
  {
    icon: '📅',
    title: 'Join Events',
    description: 'Discover worship services, outreach programs, and community gatherings.',
    color: 'from-blue-500 to-indigo-600',
  },
  {
    icon: '🎬',
    title: 'Watch & Listen',
    description: 'Access sermons, worship music, and media from churches you love.',
    color: 'from-rose-500 to-pink-600',
  },
  {
    icon: '🤝',
    title: 'Stay Connected',
    description: 'Follow your church, get updates, and grow in faith together.',
    color: 'from-emerald-500 to-teal-600',
  },
];

export default function HomeFeatures() {
  return (
    <section className="relative -mt-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-xl shadow-gray-200/40 transition hover:-translate-y-1 hover:shadow-2xl"
          >
            <div
              className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-2xl text-white shadow-lg ${feature.color}`}
            >
              {feature.icon}
            </div>
            <h3 className="mt-5 font-display text-lg font-bold text-gray-900">{feature.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
