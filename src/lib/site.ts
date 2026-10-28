/** Prefixes a site path with Astro's base, so links keep working if the site moves under a sub-path. */
export function url(path: string): string {
  return import.meta.env.BASE_URL.replace(/\/$/, '') + path;
}

export type PageId = 'posts' | 'projects' | 'about' | 'resume' | 'rss';

/** The site's pages: one list drives the header links and the terminal's files. */
export const pages: { id: PageId; label: string; path: string; file: string }[] = [
  { id: 'posts', label: 'Posts', path: '/', file: 'posts/' },
  { id: 'projects', label: 'Projects', path: '/projects/', file: 'projects/' },
  { id: 'about', label: 'About', path: '/about/', file: 'about.md' },
  { id: 'resume', label: 'Resume', path: '/resume/', file: 'resume.pdf' },
  { id: 'rss', label: 'RSS', path: '/rss/', file: 'feed.xml' },
];

export const author = {
  name: 'Jeff',
  subject: 'uncompiled thoughts',
  description: "Jeff's personal tech blog: thinking out loud about AI and software.",
};

export const elsewhere = [
  { label: 'GitHub', href: 'https://github.com/zlyxero' },
  { label: 'Email', href: 'mailto:jeffwambuah@gmail.com' },
  { label: 'LinkedIn', href: 'https://linkedin.com/in/jeff-mwangangi' },
];
