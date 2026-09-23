import { useEffect, useState } from 'react';
import { Link, useParams, Outlet, useOutletContext, useSearchParams } from 'react-router-dom';
import { api } from '../../api/client';
import ChurchHero from '../../components/church/ChurchHero';
import ChurchModernHero from '../../components/church/ChurchModernHero';
import ChurchHomeClassic from '../../components/church/ChurchHomeClassic';
import ChurchHomeModern from '../../components/church/ChurchHomeModern';
import { isModernHomeTemplate } from '../../components/church/churchHomeTemplates';
import ChurchNav from '../../components/church/ChurchNav';
import ChurchQuickInfo from '../../components/church/ChurchQuickInfo';
import ChurchSocialBar from '../../components/church/ChurchSocialBar';
import ChurchFooter from '../../components/church/ChurchFooter';
import ChurchFontTheme from '../../components/church/ChurchFontTheme';
import SectionHeader from '../../components/church/SectionHeader';
import ChurchEventCard from '../../components/church/ChurchEventCard';
import ChurchMediaCard from '../../components/church/ChurchMediaCard';
import MediaEmbedPlayer from '../../components/church/MediaEmbedPlayer';
import { getMediaEmbed } from '../../utils/mediaEmbed';
import GalleryAlbumCard from '../../components/church/GalleryAlbumCard';
import SubscribeSection from '../../components/church/SubscribeSection';
import { PastorsAboutSection } from '../../components/church/PastorCard';
import ChurchEmptyState from '../../components/church/ChurchEmptyState';
import PageMeta from '../../components/PageMeta';
import ContactForm from '../../components/ContactForm';
import { isSectionEnabled, getChurchTheme } from '../../components/church/churchUtils';
import SafeHtml from '../../components/SafeHtml';
import { useImageLightbox } from '../../components/ImageLightbox';

export default function ChurchLayout() {
  const { slug } = useParams();
  const [church, setChurch] = useState(null);
  const [events, setEvents] = useState([]);
  const [media, setMedia] = useState([]);
  const [pastors, setPastors] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [galleryAlbums, setGalleryAlbums] = useState([]);
  const [blogPosts, setBlogPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError('');
      try {
        const churchData = await api.get(`/churches/${slug}`);
        setChurch(churchData);
        const [eventData, mediaData, pastorData, announcementData, albumData, blogData] = await Promise.all([
          api.get(`/events/church/${churchData.id}`),
          api.get(`/media/church/${churchData.id}`),
          api.get(`/pastors/church/${churchData.id}`),
          api.get(`/announcements/church/${churchData.id}`),
          api.get(`/gallery/albums/church/${churchData.id}`),
          api.get(`/blog/church/${churchData.id}`).catch(() => []),
        ]);
        setEvents(eventData);
        setMedia(mediaData);
        setPastors(pastorData);
        setAnnouncements(announcementData);
        setGalleryAlbums(albumData);
        setBlogPosts(blogData);
      } catch {
        setError('Church not found');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-church-page">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
          <p className="mt-4 text-sm text-gray-500">Loading church...</p>
        </div>
      </div>
    );
  }

  if (error || !church) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-church-page px-4">
        <div className="rounded-3xl bg-white p-12 text-center shadow-xl">
          <span className="text-5xl">⛪</span>
          <h1 className="mt-4 font-display text-2xl font-bold text-gray-900">Church Not Found</h1>
          <p className="mt-2 text-gray-500">This congregation may no longer be on the platform.</p>
          <Link to="/churches" className="btn-primary mt-6 inline-flex">Browse Churches</Link>
        </div>
      </div>
    );
  }

  const navItems = [
    { to: `/church/${slug}`, label: 'Home', end: true, key: null },
    { to: `/church/${slug}/about`, label: 'About', key: 'about' },
    { to: `/church/${slug}/events`, label: 'Events', key: 'events' },
    { to: `/church/${slug}/media`, label: 'Media', key: 'media' },
    { to: `/church/${slug}/gallery`, label: 'Gallery', key: 'gallery' },
    { to: `/church/${slug}/blog`, label: 'Blog', key: 'blog' },
    { to: `/church/${slug}/contact`, label: 'Contact', key: 'contact' },
  ].filter((item) => !item.key || isSectionEnabled(church.sections, item.key));

  const modern = isModernHomeTemplate(church);

  return (
    <ChurchFontTheme fontFamily={church.font_family}>
      <div className={`min-h-screen ${modern ? 'bg-white' : 'church-site-body bg-church-page'}`}>
        {church && (
          <PageMeta
            title={church.name}
            description={church.tagline || church.description || `Visit ${church.name} on ChurchNivo`}
            image={church.banner || church.logo}
          />
        )}
        {modern ? (
          <ChurchModernHero church={church} slug={slug} events={events} galleryAlbums={galleryAlbums} />
        ) : (
          <ChurchHero church={church} slug={slug} events={events} galleryAlbums={galleryAlbums} />
        )}
        <ChurchNav
          navItems={navItems}
          themeColor={church.theme_color}
          church={church}
          slug={slug}
        />
        {!modern && <ChurchQuickInfo church={church} />}
        <main className={modern ? 'bg-white' : 'bg-church-page'}>
          <Outlet context={{ church, events, media, pastors, announcements, galleryAlbums, blogPosts, slug }} />
        </main>
        <ChurchSocialBar church={church} />
        <ChurchFooter church={church} slug={slug} />
      </div>
    </ChurchFontTheme>
  );
}

export function ChurchHomePage() {
  const ctx = useOutletContext();
  if (isModernHomeTemplate(ctx.church)) {
    return <ChurchHomeModern {...ctx} />;
  }
  return <ChurchHomeClassic {...ctx} />;
}

export function ChurchAboutPage() {
  const { church, pastors } = useOutletContext();
  const theme = getChurchTheme(church.theme_color);

  if (!isSectionEnabled(church.sections, 'about')) {
    return <EmptySection message="About section is not available." />;
  }

  return (
    <div className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader title={`About ${church.name}`} subtitle="Our story, mission, and leadership" themeColor={church.theme_color} />

        <div className="grid gap-10 lg:grid-cols-5">
          <div className="space-y-8 lg:col-span-3">
            {church.description && (
              <div className="rounded-3xl bg-white p-8 shadow-lg">
                <h3 className="font-display text-xl font-bold text-gray-900">Who We Are</h3>
                <SafeHtml html={church.description} className="mt-4 text-lg leading-relaxed text-gray-600" />
              </div>
            )}
            {church.mission && (
              <div
                className="rounded-3xl p-8 text-white"
                style={{ background: `linear-gradient(135deg, ${theme}, ${theme}bb)` }}
              >
                <h3 className="font-display text-xl font-bold">Our Mission</h3>
                <SafeHtml html={church.mission} className="mt-4 text-lg leading-relaxed text-white/90 rich-content-on-dark" />
              </div>
            )}
          </div>

          <div className="space-y-5 lg:col-span-2">
            {church.banner && (
              <img src={church.banner} alt="" className="w-full rounded-3xl object-cover shadow-lg" />
            )}
            <div className="rounded-3xl bg-white p-6 shadow-lg">
              <h3 className="font-semibold text-gray-900">At a Glance</h3>
              <dl className="mt-4 space-y-4 text-sm">
                {church.address && (
                  <div>
                    <dt className="font-medium text-gray-500">Address</dt>
                    <dd className="mt-1 text-gray-900">{church.address}</dd>
                  </div>
                )}
                {church.phone && (
                  <div>
                    <dt className="font-medium text-gray-500">Phone</dt>
                    <dd className="mt-1">
                      <a href={`tel:${church.phone}`} className="text-gray-900 hover:opacity-80">{church.phone}</a>
                    </dd>
                  </div>
                )}
                {church.contact_email && (
                  <div>
                    <dt className="font-medium text-gray-500">Email</dt>
                    <dd className="mt-1">
                      <a href={`mailto:${church.contact_email}`} style={{ color: theme }}>{church.contact_email}</a>
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>

        <PastorsAboutSection pastors={pastors} themeColor={church.theme_color} />
      </div>
    </div>
  );
}

export function ChurchEventsPage() {
  const { church, events } = useOutletContext();

  if (!isSectionEnabled(church.sections, 'events')) {
    return <EmptySection message="Events section is not available." />;
  }

  const now = new Date();
  const occurrence = (e) => new Date(e.event_at || e.date);
  const upcoming = events.filter((e) => occurrence(e) >= now);
  const past = events.filter((e) => occurrence(e) < now);

  return (
    <div className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Events & Gatherings"
          subtitle="Join us for worship, fellowship, and community"
          themeColor={church.theme_color}
        />

        {events.length === 0 ? (
          <div className="rounded-3xl bg-white py-16 text-center shadow-lg">
            <span className="text-4xl">📅</span>
            <p className="mt-4 text-gray-500">No events scheduled yet. Check back soon!</p>
          </div>
        ) : (
          <>
            {upcoming.length > 0 && (
              <div className="mb-12">
                <h3 className="mb-6 text-lg font-semibold text-gray-900">Upcoming</h3>
                <div className="grid gap-5 md:grid-cols-2">
                  {upcoming.map((event, i) => (
                    <ChurchEventCard
                      key={event.id}
                      event={event}
                      themeColor={church.theme_color}
                      featured={i === 0}
                    />
                  ))}
                </div>
              </div>
            )}
            {past.length > 0 && (
              <div>
                <h3 className="mb-6 text-lg font-semibold text-gray-400">Past Events</h3>
                <div className="grid gap-5 opacity-75 md:grid-cols-2">
                  {past.map((event) => (
                    <ChurchEventCard key={event.id} event={event} themeColor={church.theme_color} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export function ChurchMediaPage() {
  const { church, media, slug } = useOutletContext();
  const [searchParams, setSearchParams] = useSearchParams();

  if (!isSectionEnabled(church.sections, 'media')) {
    return <EmptySection message="Media section is not available." />;
  }

  const playable = media.filter((item) => getMediaEmbed(item.url));
  const playParam = searchParams.get('play');
  const selectedFromUrl = playParam ? media.find((m) => String(m.id) === playParam) : null;
  const defaultPlayable = playable[0] || null;
  const selected = selectedFromUrl && getMediaEmbed(selectedFromUrl.url)
    ? selectedFromUrl
    : defaultPlayable;

  const selectVideo = (item) => {
    setSearchParams({ play: String(item.id) }, { replace: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const grouped = media.reduce((acc, item) => {
    const type = item.type || 'link';
    if (!acc[type]) acc[type] = [];
    acc[type].push(item);
    return acc;
  }, {});

  const typeLabels = { video: 'Videos', audio: 'Audio', link: 'Links', document: 'Documents' };

  return (
    <div className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Media Library"
          subtitle="Watch sermons and messages right here — no need to leave the site"
          themeColor={church.theme_color}
        />

        {media.length === 0 ? (
          <div className="rounded-3xl bg-white py-16 text-center shadow-lg">
            <span className="text-4xl">🎬</span>
            <p className="mt-4 text-gray-500">No media available yet.</p>
          </div>
        ) : (
          <>
            {selected && (
              <div className="mb-10 overflow-hidden rounded-3xl bg-white p-4 shadow-lg ring-1 ring-gray-100 sm:p-6">
                <MediaEmbedPlayer url={selected.url} title={selected.title} />
                <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Now playing</p>
                    <h2 className="mt-1 font-display text-xl font-bold text-gray-900 sm:text-2xl">
                      {selected.title}
                    </h2>
                  </div>
                  <a
                    href={selected.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-gray-500 hover:text-gray-800"
                  >
                    Open on {getMediaEmbed(selected.url)?.provider || 'source'} ↗
                  </a>
                </div>
              </div>
            )}

            {Object.entries(grouped).map(([type, items]) => (
              <div key={type} className="mb-12">
                <h3 className="mb-5 font-display text-xl font-bold text-gray-900">
                  {typeLabels[type] || type}
                </h3>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((item) => (
                    <ChurchMediaCard
                      key={item.id}
                      item={item}
                      themeColor={church.theme_color}
                      active={selected?.id === item.id}
                      onSelect={getMediaEmbed(item.url) ? selectVideo : undefined}
                      slug={!getMediaEmbed(item.url) ? slug : undefined}
                      compact
                    />
                  ))}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

export function ChurchGalleryPage() {
  const { church, galleryAlbums, slug } = useOutletContext();
  const [albums, setAlbums] = useState(galleryAlbums);
  const [years, setYears] = useState([]);
  const [year, setYear] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const featuredCount = church.gallery_featured_count || 5;

  useEffect(() => {
    api.get(`/gallery/albums/church/${church.id}/meta/filters`).then((data) => setYears(data.years)).catch(console.error);
  }, [church.id]);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (year) params.set('year', year);
    if (search.trim()) params.set('q', search.trim());
    const qs = params.toString();
    api
      .get(`/gallery/albums/church/${church.id}${qs ? `?${qs}` : ''}`)
      .then(setAlbums)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [church.id, year, search]);

  if (!isSectionEnabled(church.sections, 'gallery')) {
    return <EmptySection message="Gallery section is not available." />;
  }

  const featured = albums.filter((a) => a.is_featured).slice(0, featuredCount);
  const defaultAlbum = albums.find((a) => a.is_default_landing);
  const showFeatured = !year && !search.trim() && featured.length > 0;
  const otherAlbums = showFeatured ? albums.filter((a) => !a.is_featured) : albums;

  return (
    <div className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Photo Gallery"
          subtitle="Browse photos by event and year"
          themeColor={church.theme_color}
        />

        <div className="mb-10 grid gap-4 rounded-2xl bg-white p-6 shadow-lg sm:grid-cols-2">
          <input
            type="search"
            className="input-field"
            placeholder="Search by album name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select className="input-field" value={year} onChange={(e) => setYear(e.target.value)}>
            <option value="">All Years</option>
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
          </div>
        ) : albums.length === 0 ? (
          <div className="rounded-3xl bg-white py-16 text-center shadow-lg">
            <span className="text-4xl">🖼️</span>
            <p className="mt-4 text-gray-500">No albums found.</p>
          </div>
        ) : (
          <>
            {showFeatured && (
              <section className="mb-14">
                <h2 className="mb-6 font-display text-2xl font-bold text-gray-900">
                  {defaultAlbum ? 'Featured Albums' : 'Featured'}
                </h2>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {featured.map((album) => (
                    <GalleryAlbumCard
                      key={album.id}
                      album={album}
                      slug={slug}
                      themeColor={church.theme_color}
                      large={album.id === defaultAlbum?.id}
                    />
                  ))}
                </div>
              </section>
            )}

            {otherAlbums.length > 0 && (
            <section>
              <h2 className="mb-6 font-display text-xl font-bold text-gray-900">
                {showFeatured ? 'More Albums' : 'Albums'}
                <span className="ml-2 text-base font-normal text-gray-400">({otherAlbums.length})</span>
              </h2>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {otherAlbums.map((album) => (
                  <GalleryAlbumCard
                    key={album.id}
                    album={album}
                    slug={slug}
                    themeColor={church.theme_color}
                  />
                ))}
              </div>
            </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export function ChurchGalleryAlbumPage() {
  const { church, slug } = useOutletContext();
  const { albumSlug } = useParams();
  const [album, setAlbum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    api
      .get(`/gallery/albums/church/${church.id}/${albumSlug}`)
      .then(setAlbum)
      .catch(() => setError('Album not found'))
      .finally(() => setLoading(false));
  }, [church.id, albumSlug]);

  if (!isSectionEnabled(church.sections, 'gallery')) {
    return <EmptySection message="Gallery section is not available." />;
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
      </div>
    );
  }

  if (error || !album) {
    return (
      <div className="py-20 text-center">
        <p className="text-gray-500">{error || 'Album not found'}</p>
        <Link to={`/church/${slug}/gallery`} className="btn-primary mt-4 inline-flex">Back to Gallery</Link>
      </div>
    );
  }

  return (
    <ChurchGalleryAlbumContent album={album} church={church} slug={slug} />
  );
}

function ChurchGalleryAlbumContent({ album, church, slug }) {
  const lightboxImages = (album.images || []).map((item) => ({
    src: item.image_url,
    alt: item.title || 'Gallery photo',
    caption: item.title || undefined,
  }));
  const { open, lightbox } = useImageLightbox(lightboxImages);

  return (
    <div className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Link to={`/church/${slug}/gallery`} className="mb-6 inline-flex text-sm font-medium text-gray-500 hover:text-gray-700">
          ← Back to all albums
        </Link>

        <SectionHeader
          title={album.title}
          subtitle={[album.year, `${album.photo_count || album.images?.length || 0} photos`].filter(Boolean).join(' · ')}
          themeColor={church.theme_color}
        />

        {!album.images?.length ? (
          <div className="rounded-3xl bg-white py-16 text-center shadow-lg">
            <p className="text-gray-500">No photos in this album yet.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {album.images.map((item, index) => (
              <figure key={item.id} className="group overflow-hidden rounded-2xl bg-white shadow-lg">
                <button
                  type="button"
                  onClick={() => open(index)}
                  className="relative block w-full cursor-zoom-in overflow-hidden text-left"
                  aria-label={`View photo${item.title ? `: ${item.title}` : ''}`}
                >
                  <img
                    src={item.image_url}
                    alt={item.title || 'Gallery photo'}
                    className="aspect-[4/3] w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                  <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/20">
                    <span className="rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white opacity-0 transition group-hover:opacity-100">
                      View
                    </span>
                  </span>
                </button>
                {item.title && (
                  <figcaption className="p-4 text-sm font-medium text-gray-900">{item.title}</figcaption>
                )}
              </figure>
            ))}
          </div>
        )}
      </div>
      {lightbox}
    </div>
  );
}

export function ChurchContactPage() {
  const { church } = useOutletContext();
  const theme = getChurchTheme(church.theme_color);

  if (!isSectionEnabled(church.sections, 'contact')) {
    return <EmptySection message="Contact section is not available." />;
  }

  return (
    <div className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Get in Touch"
          subtitle="We'd love to hear from you"
          themeColor={church.theme_color}
        />

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-5">
            {[
              { icon: '📧', label: 'Email', value: church.contact_email, href: church.contact_email ? `mailto:${church.contact_email}` : null },
              { icon: '📞', label: 'Phone', value: church.phone, href: church.phone ? `tel:${church.phone}` : null },
              { icon: '📍', label: 'Address', value: church.address, href: church.address ? `https://maps.google.com/?q=${encodeURIComponent(church.address)}` : null },
              { icon: '🌐', label: 'Website', value: church.website?.replace(/^https?:\/\//, ''), href: church.website },
            ].filter((c) => c.value).map((card) => (
              <a
                key={card.label}
                href={card.href}
                target={card.label === 'Address' || card.label === 'Website' ? '_blank' : undefined}
                rel="noopener noreferrer"
                className="flex items-center gap-5 rounded-2xl bg-white p-6 shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <span
                  className="flex h-14 w-14 items-center justify-center rounded-2xl text-2xl"
                  style={{ backgroundColor: `${theme}15` }}
                >
                  {card.icon}
                </span>
                <div>
                  <p className="text-sm font-medium text-gray-500">{card.label}</p>
                  <p className="mt-0.5 font-semibold text-gray-900">{card.value}</p>
                </div>
              </a>
            ))}
          </div>

          <div className="rounded-3xl bg-white p-8 shadow-lg">
            <h3 className="font-display text-xl font-bold text-gray-900">Send a Message</h3>
            <p className="mt-2 text-sm text-gray-500">We'll get back to you as soon as possible.</p>
            <div className="mt-6">
              <ContactForm
                endpoint={`/contact/church/${church.slug}`}
                submitLabel="Send Message"
                buttonClassName="w-full rounded-xl py-3 text-sm font-semibold text-white transition hover:opacity-90"
                buttonStyle={{ backgroundColor: theme }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptySection({ message }) {
  return (
    <div className="py-20 text-center">
      <p className="text-gray-500">{message}</p>
    </div>
  );
}
