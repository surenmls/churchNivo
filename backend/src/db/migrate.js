import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from '../config/db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function migrate() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const fieldsPath = path.join(__dirname, 'add-church-fields.sql');
  const pastorsPath = path.join(__dirname, 'add-pastors.sql');
  const contactPath = path.join(__dirname, 'add-contact-messages.sql');
  const phase1Path = path.join(__dirname, 'add-phase1.sql');
  const phase2aPath = path.join(__dirname, 'add-phase2a.sql');
  const phase2bPath = path.join(__dirname, 'add-phase2b.sql');
  const notificationsPath = path.join(__dirname, 'add-notifications.sql');
  const optionBPath = path.join(__dirname, 'add-option-b.sql');
  const fontFamilyPath = path.join(__dirname, 'add-font-family.sql');
  const heroSlidesPath = path.join(__dirname, 'add-hero-slides.sql');
  const announcementDatesPath = path.join(__dirname, 'add-announcement-dates.sql');
  const homeTemplatePath = path.join(__dirname, 'add-home-template.sql');
  const mediaIsActivePath = path.join(__dirname, 'add-media-is-active.sql');
  const eventDatesActivePath = path.join(__dirname, 'add-event-dates-active.sql');
  const eventOccursAtPath = path.join(__dirname, 'add-event-occurs-at.sql');
  const blogPostsPath = path.join(__dirname, 'add-blog-posts.sql');
  const blogSamplePath = path.join(__dirname, 'seed-blog-sample.sql');
  const eventPlatformPath = path.join(__dirname, 'add-event-platform-listing.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');
  const fields = fs.readFileSync(fieldsPath, 'utf8');
  const pastors = fs.readFileSync(pastorsPath, 'utf8');
  const contact = fs.readFileSync(contactPath, 'utf8');
  const phase1 = fs.readFileSync(phase1Path, 'utf8');
  const phase2a = fs.readFileSync(phase2aPath, 'utf8');
  const phase2b = fs.readFileSync(phase2bPath, 'utf8');
  const notifications = fs.readFileSync(notificationsPath, 'utf8');
  const optionB = fs.readFileSync(optionBPath, 'utf8');
  const fontFamily = fs.readFileSync(fontFamilyPath, 'utf8');
  const heroSlides = fs.readFileSync(heroSlidesPath, 'utf8');
  const announcementDates = fs.readFileSync(announcementDatesPath, 'utf8');
  const homeTemplate = fs.readFileSync(homeTemplatePath, 'utf8');
  const mediaIsActive = fs.readFileSync(mediaIsActivePath, 'utf8');
  const eventDatesActive = fs.readFileSync(eventDatesActivePath, 'utf8');
  const eventOccursAt = fs.readFileSync(eventOccursAtPath, 'utf8');
  const blogPosts = fs.readFileSync(blogPostsPath, 'utf8');
  const blogSample = fs.readFileSync(blogSamplePath, 'utf8');
  const eventPlatform = fs.readFileSync(eventPlatformPath, 'utf8');

  try {
    await pool.query(schema);
    await pool.query(fields);
    await pool.query(pastors);
    await pool.query(contact);
    await pool.query(phase1);
    await pool.query(phase2a);
    await pool.query(phase2b);
    await pool.query(notifications);
    await pool.query(optionB);
    await pool.query(fontFamily);
    await pool.query(heroSlides);
    await pool.query(announcementDates);
    await pool.query(homeTemplate);
    await pool.query(mediaIsActive);
    await pool.query(eventDatesActive);
    await pool.query(eventOccursAt);
    await pool.query(blogPosts);
    await pool.query(blogSample);
    await pool.query(eventPlatform);
    console.log('Database migration completed successfully.');
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
