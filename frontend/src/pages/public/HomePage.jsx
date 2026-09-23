import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import PageMeta from '../../components/PageMeta';
import HomeHero from '../../components/home/HomeHero';
import HomeFeatures from '../../components/home/HomeFeatures';
import HomeSectionHeader from '../../components/home/HomeSectionHeader';
import HomePromotionCard from '../../components/home/HomePromotionCard';
import HomeEventCard from '../../components/home/HomeEventCard';
import HomeChurchCard from '../../components/home/HomeChurchCard';
import HomeCTA from '../../components/home/HomeCTA';

export default function HomePage() {
  const [promotions, setPromotions] = useState([]);
  const [events, setEvents] = useState([]);
  const [churches, setChurches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [promoData, eventData, churchData] = await Promise.all([
          api.get('/promotions?approved=true'),
          api.get('/events/approved'),
          api.get('/churches'),
        ]);
        setPromotions(promoData);
        setEvents(eventData.slice(0, 4));
        setChurches(churchData.slice(0, 6));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-14 w-14 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
          <p className="mt-4 text-sm font-medium text-gray-500">Loading ChurchNivo...</p>
        </div>
      </div>
    );
  }

  const stats = {
    churches: churches.length,
    events: events.length,
    promotions: promotions.length,
  };

  const [featuredPromo, ...otherPromos] = promotions;

  return (
    <>
      <PageMeta
        title="Find Your Community of Faith"
        description="Discover churches, join events, watch sermons, and connect with congregations on ChurchNivo."
      />
      <HomeHero stats={stats} />
      <HomeFeatures />

      {promotions.length > 0 && (
        <section className="py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <HomeSectionHeader
              eyebrow="Highlights"
              title="Featured Promotions"
              subtitle="Special announcements and opportunities from churches on the platform"
              centered
            />
            <div className="grid gap-6 lg:grid-cols-2">
              {featuredPromo && (
                <div className="lg:row-span-2">
                  <HomePromotionCard promotion={featuredPromo} featured />
                </div>
              )}
              <div className="grid gap-6">
                {otherPromos.slice(0, 2).map((promo) => (
                  <HomePromotionCard key={promo.id} promotion={promo} />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="bg-gradient-to-b from-white to-gray-50 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <HomeSectionHeader
            eyebrow="Calendar"
            title="Upcoming Events"
            subtitle="Featured gatherings from churches across ChurchNivo"
            linkTo="/events"
            linkLabel="View all events"
          />

          {events.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-gray-200 bg-white py-16 text-center">
              <span className="text-4xl">📅</span>
              <p className="mt-4 text-gray-500">No upcoming events yet. Check back soon!</p>
              <Link to="/churches" className="btn-primary mt-6 inline-flex">Find a Church</Link>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {events.map((event) => (
                <HomeEventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <HomeSectionHeader
            eyebrow="Communities"
            title="Featured Churches"
            subtitle="Explore welcoming congregations ready to greet you"
            linkTo="/churches"
            linkLabel="View all churches"
          />
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {churches.map((church) => (
              <HomeChurchCard key={church.id} church={church} />
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-gray-100 bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 text-center sm:grid-cols-3">
            {[
              { icon: '🌍', title: 'Multi-Tenant Platform', desc: 'One home for many churches' },
              { icon: '✅', title: 'Verified Content', desc: 'Approved events & media' },
              { icon: '🔒', title: 'Secure & Private', desc: 'Safe admin for every church' },
            ].map((item) => (
              <div key={item.title} className="px-4">
                <span className="text-3xl">{item.icon}</span>
                <h3 className="mt-4 font-display text-lg font-bold text-gray-900">{item.title}</h3>
                <p className="mt-2 text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <HomeCTA />
    </>
  );
}
