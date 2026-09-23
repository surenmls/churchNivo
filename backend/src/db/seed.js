import bcrypt from 'bcryptjs';
import { pool } from '../config/db.js';

const SECTION_KEYS = ['about', 'events', 'media', 'contact', 'gallery', 'announcements', 'blog'];

async function seed() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Clear existing data (dev seed only)
    await client.query('TRUNCATE notification_log, event_reminder_log, push_subscriptions, church_subscribers, gallery_images, gallery_albums, announcements, promotions, media, events, pastors, church_sections, users, churches RESTART IDENTITY CASCADE');

    const churches = [
      {
        name: 'Grace Community Church',
        slug: 'grace-community',
        logo: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=200',
        banner: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=1200',
        tagline: 'Where faith meets community',
        description: 'A welcoming community of faith, hope, and love serving our neighborhood since 1985.',
        mission: 'To love God, love people, and serve our city with compassion and grace.',
        service_times: JSON.stringify([
          { day: 'Sunday', time: '9:00 AM', label: 'Morning Worship' },
          { day: 'Sunday', time: '11:00 AM', label: 'Family Service' },
          { day: 'Wednesday', time: '7:00 PM', label: 'Bible Study' },
        ]),
        website: 'https://gracecommunity.org',
        facebook_url: 'https://facebook.com',
        instagram_url: 'https://instagram.com',
        youtube_url: 'https://youtube.com',
        theme_color: '#4f46e5',
        city: 'Springfield',
        denomination: 'Non-denominational',
        donation_url: 'https://give.gracecommunity.org',
        address: '123 Faith Avenue, Springfield, IL 62701',
        contact_email: 'info@gracecommunity.org',
        phone: '(555) 123-4567',
      },
      {
        name: 'New Life Fellowship',
        slug: 'new-life-fellowship',
        logo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
        banner: 'https://images.unsplash.com/photo-1519491050289-c9cc445944e1?w=1200',
        tagline: 'Growing together in Christ',
        description: 'Growing together in Christ through worship, fellowship, and outreach.',
        mission: 'Building disciples who transform lives through the power of the Gospel.',
        service_times: JSON.stringify([
          { day: 'Sunday', time: '10:30 AM', label: 'Worship Service' },
          { day: 'Thursday', time: '6:30 PM', label: 'Prayer Meeting' },
        ]),
        website: 'https://newlifefellowship.org',
        theme_color: '#059669',
        city: 'Riverside',
        denomination: 'Baptist',
        donation_url: 'https://newlifefellowship.org/give',
        address: '456 Hope Street, Riverside, CA 92501',
        contact_email: 'hello@newlifefellowship.org',
        phone: '(555) 987-6543',
      },
      {
        name: 'St. Mark Cathedral',
        slug: 'st-mark-cathedral',
        logo: 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?w=200',
        banner: 'https://images.unsplash.com/photo-1544427920-c49ccbe1dec4?w=1200',
        tagline: 'Tradition, beauty, and worship',
        description: 'Historic cathedral offering traditional worship and community programs.',
        mission: 'Preserving sacred tradition while welcoming all who seek peace and purpose.',
        service_times: JSON.stringify([
          { day: 'Sunday', time: '8:00 AM', label: 'Early Mass' },
          { day: 'Sunday', time: '10:00 AM', label: 'Solemn Mass' },
          { day: 'Saturday', time: '5:00 PM', label: 'Vigil Mass' },
        ]),
        theme_color: '#7c3aed',
        city: 'Boston',
        denomination: 'Catholic',
        address: '789 Cathedral Road, Boston, MA 02108',
        contact_email: 'contact@stmarkcathedral.org',
        phone: '(555) 456-7890',
      },
    ];

    const churchIds = [];

    for (const church of churches) {
      const result = await client.query(
        `INSERT INTO churches (name, slug, logo, banner, tagline, description, mission, service_times,
          website, facebook_url, instagram_url, youtube_url, theme_color, donation_url, city, denomination,
          address, contact_email, phone, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, true) RETURNING id`,
        [church.name, church.slug, church.logo, church.banner, church.tagline, church.description,
          church.mission, church.service_times, church.website || null, church.facebook_url || null,
          church.instagram_url || null, church.youtube_url || null, church.theme_color,
          church.donation_url || null, church.city || null, church.denomination || null,
          church.address, church.contact_email, church.phone]
      );
      churchIds.push(result.rows[0].id);
    }

    for (const churchId of churchIds) {
      for (const key of SECTION_KEYS) {
        await client.query(
          'INSERT INTO church_sections (church_id, section_key, enabled) VALUES ($1, $2, true)',
          [churchId, key]
        );
      }
    }

    const passwordHash = await bcrypt.hash('password123', 12);

    await client.query(
      `INSERT INTO users (name, email, password, role, church_id) VALUES ($1, $2, $3, $4, $5)`,
      ['Super Admin', 'admin@churchplatform.com', passwordHash, 'super_admin', null]
    );

    await client.query(
      `INSERT INTO users (name, email, password, role, church_id) VALUES ($1, $2, $3, $4, $5)`,
      ['Grace Admin', 'admin@gracecommunity.org', passwordHash, 'church_admin', churchIds[0]]
    );

    await client.query(
      `INSERT INTO users (name, email, password, role, church_id) VALUES ($1, $2, $3, $4, $5)`,
      ['New Life Admin', 'admin@newlifefellowship.org', passwordHash, 'church_admin', churchIds[1]]
    );

    const events = [
      { church_id: churchIds[0], title: 'Sunday Worship Service', description: 'Join us for worship, prayer, and fellowship every Sunday.', date: '2026-07-13T10:00:00Z', is_approved: true },
      { church_id: churchIds[0], title: 'Youth Group Night', description: 'Games, music, and Bible study for teens ages 13-18.', date: '2026-07-18T18:00:00Z', is_approved: true },
      { church_id: churchIds[1], title: 'Community Outreach', description: 'Serve our local community with food and supplies distribution.', date: '2026-07-20T09:00:00Z', is_approved: true },
      { church_id: churchIds[2], title: 'Choir Rehearsal', description: 'Weekly choir practice for the upcoming service.', date: '2026-07-16T19:00:00Z', is_approved: false },
    ];

    for (const event of events) {
      await client.query(
        `INSERT INTO events (church_id, title, description, date, is_approved) VALUES ($1, $2, $3, $4, $5)`,
        [event.church_id, event.title, event.description, event.date, event.is_approved]
      );
    }

    const mediaItems = [
      { church_id: churchIds[0], title: 'Sunday Sermon - Faith & Hope', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', type: 'video', is_approved: true },
      { church_id: churchIds[0], title: 'Worship Playlist', url: 'https://open.spotify.com/playlist/example', type: 'audio', is_approved: true },
      { church_id: churchIds[1], title: 'Baptism Service Recording', url: 'https://www.youtube.com/watch?v=example2', type: 'video', is_approved: true },
    ];

    for (const item of mediaItems) {
      await client.query(
        `INSERT INTO media (church_id, title, url, type, is_approved) VALUES ($1, $2, $3, $4, $5)`,
        [item.church_id, item.title, item.url, item.type, item.is_approved]
      );
    }

    const promotions = [
      { church_id: churchIds[0], title: 'Summer Camp Registration Open', image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600', link: '/church/grace-community/events', is_approved: true },
      { church_id: churchIds[1], title: 'New Member Classes Starting', image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600', link: '/church/new-life-fellowship/about', is_approved: true },
      { church_id: churchIds[2], title: 'Cathedral Concert Series', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600', link: '/church/st-mark-cathedral/events', is_approved: true },
    ];

    for (const promo of promotions) {
      await client.query(
        `INSERT INTO promotions (church_id, title, image, link, is_approved) VALUES ($1, $2, $3, $4, $5)`,
        [promo.church_id, promo.title, promo.image, promo.link, promo.is_approved]
      );
    }

    const pastors = [
      {
        church_id: churchIds[0],
        name: 'Rev. David Thompson',
        title: 'Senior Pastor',
        photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400',
        bio: 'Pastor David has served Grace Community for over 15 years. He is passionate about building authentic community and helping people discover their purpose in Christ.',
        sort_order: 0,
      },
      {
        church_id: churchIds[0],
        name: 'Pastor Sarah Mitchell',
        title: 'Associate Pastor',
        photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400',
        bio: 'Sarah leads our youth and family ministries. She brings energy, warmth, and a heart for the next generation of believers.',
        sort_order: 1,
      },
      {
        church_id: churchIds[1],
        name: 'Pastor James Rivera',
        title: 'Lead Pastor',
        photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
        bio: 'James founded New Life Fellowship with a vision to reach the city with the Gospel. He teaches weekly and oversees all ministry areas.',
        sort_order: 0,
      },
      {
        church_id: churchIds[2],
        name: 'Fr. Michael O\'Brien',
        title: 'Dean & Rector',
        photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
        bio: 'Fr. Michael has guided St. Mark Cathedral for two decades, preserving its rich liturgical heritage while opening doors to new seekers of faith.',
        sort_order: 0,
      },
    ];

    for (const pastor of pastors) {
      await client.query(
        `INSERT INTO pastors (church_id, name, title, photo, bio, sort_order) VALUES ($1, $2, $3, $4, $5, $6)`,
        [pastor.church_id, pastor.name, pastor.title, pastor.photo, pastor.bio, pastor.sort_order]
      );
    }

    const announcements = [
      { church_id: churchIds[0], title: 'Summer VBS Registration Open', content: 'Vacation Bible School runs July 28–Aug 1. Register your kids today!', is_approved: true },
      { church_id: churchIds[0], title: 'Building Fund Update', content: 'Thank you for your generous giving toward our new community center.', is_approved: true },
      { church_id: churchIds[1], title: 'New Member Orientation', content: 'Join us this Sunday after service for a welcome lunch and orientation.', is_approved: true },
      { church_id: churchIds[2], title: 'Easter Concert Series', content: 'Tickets now available for our annual cathedral concert.', is_approved: false },
    ];

    for (const item of announcements) {
      await client.query(
        `INSERT INTO announcements (church_id, title, content, is_approved) VALUES ($1, $2, $3, $4)`,
        [item.church_id, item.title, item.content, item.is_approved]
      );
    }

    const galleryAlbums = [
      {
        church_id: churchIds[0],
        title: 'Sunday Worship 2026',
        slug: 'sunday-worship-2026',
        year: 2026,
        cover_image_url: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=800',
        is_featured: true,
        featured_order: 0,
        is_default_landing: true,
        is_approved: true,
      },
      {
        church_id: churchIds[0],
        title: 'Community Events 2025',
        slug: 'community-events-2025',
        year: 2025,
        cover_image_url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800',
        is_featured: true,
        featured_order: 1,
        is_approved: true,
      },
      {
        church_id: churchIds[0],
        title: 'Youth Camp 2025',
        slug: 'youth-camp-2025',
        year: 2025,
        cover_image_url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800',
        is_featured: true,
        featured_order: 2,
        is_approved: true,
      },
      {
        church_id: churchIds[0],
        title: 'Christmas Celebration 2025',
        slug: 'christmas-celebration-2025',
        year: 2025,
        cover_image_url: 'https://images.unsplash.com/photo-1482517967863-00e15c715b44?w=800',
        is_featured: true,
        featured_order: 3,
        is_approved: true,
      },
      {
        church_id: churchIds[0],
        title: 'Baptism Sunday',
        slug: 'baptism-sunday',
        year: 2025,
        cover_image_url: 'https://images.unsplash.com/photo-1519491050289-c9cc445944e1?w=800',
        is_featured: true,
        featured_order: 4,
        is_approved: true,
      },
      {
        church_id: churchIds[0],
        title: 'Outreach 2024',
        slug: 'outreach-2024',
        year: 2024,
        cover_image_url: 'https://images.unsplash.com/photo-1469571480202-5b8e554df9ef?w=800',
        is_featured: false,
        featured_order: 10,
        is_approved: true,
      },
      {
        church_id: churchIds[1],
        title: 'Baptism Day 2025',
        slug: 'baptism-day-2025',
        year: 2025,
        cover_image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
        is_featured: true,
        featured_order: 0,
        is_default_landing: true,
        is_approved: true,
      },
      {
        church_id: churchIds[2],
        title: 'Cathedral Concert Series',
        slug: 'cathedral-concert-series',
        year: 2025,
        cover_image_url: 'https://images.unsplash.com/photo-1544427920-c49ccbe1dec4?w=800',
        is_featured: true,
        featured_order: 0,
        is_approved: false,
      },
    ];

    const albumIds = [];

    for (const album of galleryAlbums) {
      const result = await client.query(
        `INSERT INTO gallery_albums (church_id, title, slug, year, cover_image_url, is_featured, featured_order, is_default_landing, is_approved)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
        [album.church_id, album.title, album.slug, album.year, album.cover_image_url,
          album.is_featured, album.featured_order, album.is_default_landing || false, album.is_approved]
      );
      albumIds.push({ id: result.rows[0].id, ...album });
    }

    const galleryImages = [
      { album_id: albumIds[0].id, church_id: churchIds[0], title: 'Worship Team', image_url: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=800', sort_order: 0, is_approved: true },
      { album_id: albumIds[0].id, church_id: churchIds[0], title: 'Congregation', image_url: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=800', sort_order: 1, is_approved: true },
      { album_id: albumIds[0].id, church_id: churchIds[0], title: 'Prayer Time', image_url: 'https://images.unsplash.com/photo-1519491050289-c9cc445944e1?w=800', sort_order: 2, is_approved: true },
      { album_id: albumIds[1].id, church_id: churchIds[0], title: 'Community Dinner', image_url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800', sort_order: 0, is_approved: true },
      { album_id: albumIds[1].id, church_id: churchIds[0], title: 'Volunteer Day', image_url: 'https://images.unsplash.com/photo-1559027615-cd4628903328?w=800', sort_order: 1, is_approved: true },
      { album_id: albumIds[2].id, church_id: churchIds[0], title: 'Camp Games', image_url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800', sort_order: 0, is_approved: true },
      { album_id: albumIds[2].id, church_id: churchIds[0], title: 'Camp Worship', image_url: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800', sort_order: 1, is_approved: true },
      { album_id: albumIds[3].id, church_id: churchIds[0], title: 'Christmas Eve', image_url: 'https://images.unsplash.com/photo-1482517967863-00e15c715b44?w=800', sort_order: 0, is_approved: true },
      { album_id: albumIds[4].id, church_id: churchIds[0], title: 'Baptism Pool', image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800', sort_order: 0, is_approved: true },
      { album_id: albumIds[5].id, church_id: churchIds[0], title: 'Food Drive', image_url: 'https://images.unsplash.com/photo-1469571480202-5b8e554df9ef?w=800', sort_order: 0, is_approved: true },
      { album_id: albumIds[6].id, church_id: churchIds[1], title: 'Baptism Ceremony', image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800', sort_order: 0, is_approved: true },
      { album_id: albumIds[7].id, church_id: churchIds[2], title: 'Cathedral Interior', image_url: 'https://images.unsplash.com/photo-1544427920-c49ccbe1dec4?w=800', sort_order: 0, is_approved: false },
    ];

    for (const img of galleryImages) {
      await client.query(
        `INSERT INTO gallery_images (church_id, album_id, title, image_url, sort_order, file_size_bytes, is_approved)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [img.church_id, img.album_id, img.title, img.image_url, img.sort_order, 450000, img.is_approved]
      );
    }

    for (const churchId of churchIds) {
      await client.query(
        `UPDATE churches SET
          photo_count = (SELECT COUNT(*)::int FROM gallery_images WHERE church_id = $1),
          storage_used_bytes = (SELECT COALESCE(SUM(file_size_bytes), 0)::bigint FROM gallery_images WHERE church_id = $1)
         WHERE id = $1`,
        [churchId]
      );
    }

    const { v4: uuidv4 } = await import('uuid');
    await client.query(
      `INSERT INTO church_subscribers (church_id, name, email, phone, status, source, email_opt_in, sms_opt_in,
        notify_events, notify_announcements, notify_media, notify_gallery, unsubscribe_token, sms_verified_at)
       VALUES ($1, 'Jane Member', 'jane.member@example.com', '(555) 111-2222', 'active', 'self', true, true,
        true, true, true, true, $2, NOW())`,
      [churchIds[0], uuidv4()]
    );
    await client.query(
      `INSERT INTO church_subscribers (church_id, name, email, status, source, email_opt_in, unsubscribe_token)
       VALUES ($1, 'Pending Invite', 'pending@example.com', 'pending', 'admin', false, $2)`,
      [churchIds[0], uuidv4()]
    );

    await client.query('COMMIT');
    console.log('Database seeded successfully.');
    console.log('');
    console.log('Test accounts (password: password123):');
    console.log('  Super Admin:  admin@churchplatform.com');
    console.log('  Church Admin: admin@gracecommunity.org');
    console.log('  Church Admin: admin@newlifefellowship.org');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Seed failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
