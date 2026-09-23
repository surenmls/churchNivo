import { getChurchTheme } from './churchUtils';
import { SocialIconPills } from './SocialIcons';

export default function ChurchSocialBar({ church }) {
  const hasSocial =
    church.website || church.facebook_url || church.instagram_url || church.youtube_url;

  if (!hasSocial) return null;

  const theme = getChurchTheme(church.theme_color);

  return (
    <section className="py-10 md:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          className="rounded-2xl px-6 py-8 text-center text-white md:px-8 md:py-10"
          style={{ background: `linear-gradient(135deg, ${theme}, ${theme}cc)` }}
        >
          <h3 className="font-display text-xl font-bold md:text-2xl">Stay Connected</h3>
          <p className="mt-2 text-sm text-white/85 md:text-base">
            Follow us online for updates, sermons, and community news
          </p>
          <div className="mt-6">
            <SocialIconPills church={church} />
          </div>
        </div>
      </div>
    </section>
  );
}
