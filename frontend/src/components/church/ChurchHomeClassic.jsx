import ChurchHomeWelcome from './ChurchHomeWelcome';
import ChurchQuickLinks from './ChurchQuickLinks';
import SectionHeader from './SectionHeader';
import ChurchAnnouncementCard from './ChurchAnnouncementCard';
import ChurchEventCard from './ChurchEventCard';
import ChurchMediaCard from './ChurchMediaCard';
import GalleryAlbumCard from './GalleryAlbumCard';
import ChurchEmptyState from './ChurchEmptyState';
import SubscribeSection from './SubscribeSection';
import ScrollReveal from './ScrollReveal';
import { PastorsPreviewSection } from './PastorCard';
import { isSectionEnabled, getChurchTheme } from './churchUtils';

export default function ChurchHomeClassic({
  church, slug, events, media, pastors, announcements, galleryAlbums,
}) {
  const theme = getChurchTheme(church.theme_color);
  const nextEvent = events[0];
  const featuredAlbums = galleryAlbums.filter((a) => a.is_featured).slice(0, 3);

  return (
    <div className="py-8 md:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal variant="classic">
          <ChurchHomeWelcome church={church} slug={slug} />
        </ScrollReveal>

        <ScrollReveal variant="classic" delay={80}>
          <ChurchQuickLinks church={church} slug={slug} />
        </ScrollReveal>

        {isSectionEnabled(church.sections, 'announcements') && (
          <ScrollReveal variant="classic" delay={120} className="mb-16 block">
            <section>
              <SectionHeader title="Announcements" subtitle="Latest news from our church" themeColor={church.theme_color} />
              {announcements.length > 0 ? (
                <div className="space-y-5">
                  {announcements.slice(0, 3).map((item, index) => (
                    <ChurchAnnouncementCard key={item.id} item={item} themeColor={church.theme_color} featured={index === 0} />
                  ))}
                </div>
              ) : (
                <ChurchEmptyState icon="📣" title="No announcements yet" message="Check back soon for news and updates from our church community." themeColor={church.theme_color} />
              )}
            </section>
          </ScrollReveal>
        )}

        {isSectionEnabled(church.sections, 'events') && (
          <ScrollReveal variant="classic" delay={160} className="mb-16 block">
            <section>
              <SectionHeader
                title={nextEvent ? 'Next Event' : 'Events & Gatherings'}
                subtitle={nextEvent ? "Don't miss what's coming up" : 'Join us for worship and fellowship'}
                linkTo={`/church/${slug}/events`}
                linkLabel="All events"
                themeColor={church.theme_color}
              />
              {nextEvent ? (
                <>
                  <ChurchEventCard event={nextEvent} themeColor={church.theme_color} featured />
                  {events.length > 1 && (
                    <div className="mt-8 grid gap-5 md:grid-cols-2">
                      {events.slice(1, 5).map((event) => (
                        <ChurchEventCard key={event.id} event={event} themeColor={church.theme_color} />
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <ChurchEmptyState icon="📅" title="Events coming soon" message="We're planning upcoming gatherings." linkTo={`/church/${slug}/events`} linkLabel="View events page" themeColor={church.theme_color} />
              )}
            </section>
          </ScrollReveal>
        )}

        {isSectionEnabled(church.sections, 'media') && (
          <ScrollReveal variant="classic" delay={200} className="mb-16 block">
            <section>
              <SectionHeader title="Sermons & Media" subtitle="Watch, listen, and grow in faith" linkTo={`/church/${slug}/media`} linkLabel="Browse media" themeColor={church.theme_color} />
              {media.length > 0 ? (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {media.slice(0, 3).map((item) => (
                    <ChurchMediaCard key={item.id} item={item} themeColor={church.theme_color} slug={slug} compact />
                  ))}
                </div>
              ) : (
                <ChurchEmptyState icon="🎬" title="Media library coming soon" message="Sermons and resources will appear here." linkTo={`/church/${slug}/media`} linkLabel="Visit media page" themeColor={church.theme_color} />
              )}
            </section>
          </ScrollReveal>
        )}

        {isSectionEnabled(church.sections, 'gallery') && (
          <ScrollReveal variant="classic" delay={240} className="mb-16 block">
            <section>
              <SectionHeader title="Photo Gallery" subtitle="Moments from our church family" linkTo={`/church/${slug}/gallery`} linkLabel="View all albums" themeColor={church.theme_color} />
              {galleryAlbums.length > 0 ? (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {(featuredAlbums.length > 0 ? featuredAlbums : galleryAlbums.slice(0, 3)).map((album) => (
                    <GalleryAlbumCard key={album.id} album={album} slug={slug} themeColor={church.theme_color} />
                  ))}
                </div>
              ) : (
                <ChurchEmptyState icon="🖼️" title="Gallery coming soon" message="Photo albums will be shared here." linkTo={`/church/${slug}/gallery`} linkLabel="Visit gallery" themeColor={church.theme_color} />
              )}
            </section>
          </ScrollReveal>
        )}

        {pastors.length > 0 && (
          <ScrollReveal variant="classic" delay={280} className="mb-16 block">
            <PastorsPreviewSection pastors={pastors.slice(0, 4)} themeColor={church.theme_color} title="Meet Our Pastors" slug={slug} />
          </ScrollReveal>
        )}

        <ScrollReveal variant="classic" delay={320}>
          <section>
            <SectionHeader title="Stay in the Loop" subtitle="Never miss an event or announcement" themeColor={church.theme_color} />
            <SubscribeSection church={church} themeColor={theme} />
          </section>
        </ScrollReveal>
      </div>
    </div>
  );
}
