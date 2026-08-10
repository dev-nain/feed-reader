-- Frontpage — seed the 19 curated feeds (Core #11 "Try as Guest").
--
-- Generated from data/sample-feeds.json, which AGENTS.md §8 makes the fixed
-- corpus: no feed here was typed by hand, and no feed outside that file is
-- added. Titles and descriptions are placeholders until the first fetch
-- overwrites them from the feed itself.
--
-- next_fetch_at defaults to now(), so the cron worker collects these on its
-- first run and the guest dashboard has real content immediately.
-- Idempotent: url_key collapses http/https, www., and trailing slashes.

insert into public.feeds (feed_url, site_url, title, description, feed_format, curated_category)
values
  ('https://css-tricks.com/feed/', 'https://css-tricks.com/', 'CSS-Tricks', 'Tips, Tricks, and Techniques on using Cascading Style Sheets.', 'rss2', 'Frontend'),
  ('https://www.smashingmagazine.com/feed/', 'https://www.smashingmagazine.com/', 'Smashing Magazine', 'For web designers and developers.', 'rss2', 'Frontend'),
  ('https://www.joshwcomeau.com/rss.xml', 'https://www.joshwcomeau.com/', 'Josh W. Comeau', 'Friendly tutorials for developers.', 'rss2', 'Frontend'),
  ('https://kentcdodds.com/blog/rss.xml', 'https://kentcdodds.com/', 'Kent C. Dodds', 'Helping people make the world a better place through quality software.', 'rss2', 'Frontend'),
  ('https://web.dev/feed.xml', 'https://web.dev/', 'web.dev', 'Building a better web, together.', 'atom', 'Frontend'),
  ('https://developer.mozilla.org/en-US/blog/rss.xml', 'https://developer.mozilla.org/en-US/blog/', 'MDN Blog', 'The MDN Web Docs blog.', 'rss2', 'Frontend'),
  ('https://sidebar.io/feed.xml', 'https://sidebar.io/', 'Sidebar.io', 'The five best design links, every day.', 'atom', 'Design'),
  ('https://www.nngroup.com/feed/rss/', 'https://www.nngroup.com/', 'Nielsen Norman Group', 'Evidence-based user experience research, training, and consulting.', 'rss2', 'Design'),
  ('https://www.figma.com/blog/feed/', 'https://www.figma.com/blog/', 'Figma Blog', 'Stories about how products are designed at Figma and beyond.', 'rss2', 'Design'),
  ('https://alistapart.com/main/feed/', 'https://alistapart.com/', 'A List Apart', 'For people who make websites.', 'rss2', 'Design'),
  ('https://uxdesign.cc/feed', 'https://uxdesign.cc/', 'UX Collective', 'Curated stories on user experience, usability, and product design.', 'rss2', 'Design'),
  ('https://blog.cloudflare.com/rss/', 'https://blog.cloudflare.com/', 'Cloudflare Blog', 'The Cloudflare Blog.', 'rss2', 'Backend & DevOps'),
  ('https://vercel.com/atom', 'https://vercel.com/blog', 'Vercel Blog', 'Updates from Vercel.', 'atom', 'Backend & DevOps'),
  ('https://github.blog/feed/', 'https://github.blog/', 'The GitHub Blog', 'Updates, ideas, and inspiration from GitHub.', 'rss2', 'Backend & DevOps'),
  ('https://www.netlify.com/blog/index.xml', 'https://www.netlify.com/blog/', 'Netlify Blog', 'News and posts from Netlify.', 'rss2', 'Backend & DevOps'),
  ('https://blog.pragmaticengineer.com/rss/', 'https://blog.pragmaticengineer.com/', 'The Pragmatic Engineer', 'Observations across the software engineering industry.', 'rss2', 'General Tech'),
  ('https://hnrss.org/best', 'https://news.ycombinator.com/', 'Hacker News Best', 'Best stories on Hacker News.', 'rss2', 'General Tech'),
  ('https://simonwillison.net/atom/everything/', 'https://simonwillison.net/', 'Simon Willison''s Weblog', 'Simon Willison''s weblog, covering AI, Python, and web development.', 'atom', 'AI & ML'),
  ('https://huggingface.co/blog/feed.xml', 'https://huggingface.co/blog', 'Hugging Face Blog', 'The latest news from Hugging Face.', 'atom', 'AI & ML')
on conflict (url_key) do nothing;
