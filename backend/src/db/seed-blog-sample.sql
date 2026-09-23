-- Sample blog posts for churches with no existing articles (dev/demo content)

INSERT INTO blog_posts (
  church_id, title, slug, excerpt, content, cover_image, category,
  author_name, author_bio, read_time_minutes, published_at, is_approved, is_active
)
SELECT
  c.id,
  v.title,
  v.slug,
  v.excerpt,
  v.content,
  v.cover_image,
  v.category,
  v.author_name,
  v.author_bio,
  v.read_time_minutes,
  v.published_at::timestamptz,
  true,
  true
FROM churches c
CROSS JOIN (VALUES
  (
    'Finding Peace in the Midst of Chaos',
    'finding-peace-in-the-midst-of-chaos',
    'Life can feel overwhelming, but Scripture offers us a path to lasting peace. Here are three practices to anchor your heart this week.',
    '<p>In our busiest seasons, peace can feel like an impossible dream. Yet Jesus promised something different—a peace that the world cannot give, one that remains steady even when life feels chaotic.</p><p><strong>Three practices to anchor your heart this week:</strong></p><ol><li><strong>Begin with stillness.</strong> Before the noise of the day begins, sit quietly for five minutes. Breathe. Pray. Listen.</li><li><strong>Scripture before screens.</strong> Let God''s Word be the first voice you hear, not notifications and headlines.</li><li><strong>Community as anchor.</strong> You were never meant to walk alone. Reach out to a brother or sister this week.</li></ol><p>Peace isn''t the absence of trouble—it''s the presence of Christ in the midst of it. May you find that presence today.</p>',
    'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1200',
    'Devotional',
    'Pastor David Thompson',
    'Lead pastor passionate about helping families find rest in Christ.',
    5,
    '2026-09-10 09:00:00'
  ),
  (
    'Why Small Groups Matter More Than Ever',
    'why-small-groups-matter-more-than-ever',
    'In a world of increasing isolation, small groups offer the belonging and accountability we desperately need.',
    '<p>We were created for community—not just Sunday morning handshakes, but real, vulnerable fellowship where we know and are known.</p><p>Small groups provide space to study Scripture together, pray for one another, and walk through life''s joys and struggles side by side. When culture pulls us toward isolation, the church must pull us toward connection.</p><p>If you''ve been on the fence about joining a group, this is your invitation. There is a place for you at the table.</p>',
    'https://images.unsplash.com/photo-1529156069898-49953e759861?w=800',
    'Community',
    'Pastor Sarah Mitchell',
    'Community life director helping people connect in meaningful groups.',
    4,
    '2026-09-03 10:00:00'
  ),
  (
    'Raising Faithful Children in a Digital Age',
    'raising-faithful-children-in-a-digital-age',
    'Practical wisdom for parents navigating screens, social media, and spiritual formation at home.',
    '<p>Technology isn''t going away—and neither is our calling to disciple the next generation. The goal isn''t fear, but wisdom: teaching children to use tools without being used by them.</p><p>Start with your own habits. Set device-free zones at dinner and bedtime. Pray with your kids daily, even briefly. Let them see you reading Scripture.</p><p>Faithful parenting in a digital age is possible—with grace, boundaries, and a community that supports your family.</p>',
    'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800',
    'Family',
    'Pastor Sarah Mitchell',
    'Community life director and parent of three.',
    7,
    '2026-08-28 11:00:00'
  ),
  (
    'Sunday Worship: What to Expect',
    'sunday-worship-what-to-expect',
    'First time visiting? Here is a warm guide to our Sunday morning worship experience.',
    '<p>Whether you''ve been in church your whole life or this is your first visit, we want you to feel welcome from the moment you arrive.</p><p>Our service typically includes contemporary and traditional music, a message from Scripture, prayer, and time to connect with others. Come as you are—there is no dress code, only open hearts.</p><p>We can''t wait to worship with you this Sunday.</p>',
    'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=800',
    'Community',
    'Pastor David Thompson',
    'Lead pastor at Emmanuel Church.',
    3,
    '2026-09-01 08:00:00'
  ),
  (
    'Morning Prayers That Changed My Life',
    'morning-prayers-that-changed-my-life',
    'How a simple five-minute morning rhythm transformed one member''s walk with God.',
    '<p>I used to rush into every day already behind. Then a friend challenged me: five minutes with God before five minutes with my phone.</p><p>It sounded small. It changed everything. Those quiet moments—reading a psalm, naming three gratitudes, asking for guidance—became the anchor I didn''t know I needed.</p><p>You don''t need eloquent words. You need a willing heart and a few faithful minutes. Start tomorrow.</p>',
    'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=800',
    'Devotional',
    'Pastor David Thompson',
    'Lead pastor passionate about helping families find rest in Christ.',
    4,
    '2026-08-25 07:30:00'
  ),
  (
    'Family Dinner as Sacred Time',
    'family-dinner-as-sacred-time',
    'Reclaiming the dinner table as a place of connection, gratitude, and faith conversations.',
    '<p>Between schedules and screens, family dinner often disappears first. Yet research and Scripture agree: shared meals build belonging.</p><p>Try one simple habit: a brief prayer before eating, and one question everyone answers—"Where did you see God today?" No perfect answers required.</p><p>The table can become holy ground when we show up consistently, phones away, hearts open.</p>',
    'https://images.unsplash.com/photo-1544025162-d76694265947?w=800',
    'Family',
    'Pastor Sarah Mitchell',
    'Community life director helping families thrive together.',
    5,
    '2026-08-18 18:00:00'
  )
) AS v(title, slug, excerpt, content, cover_image, category, author_name, author_bio, read_time_minutes, published_at)
WHERE NOT EXISTS (
  SELECT 1 FROM blog_posts bp WHERE bp.church_id = c.id
);
