import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getPosts, postUrl } from '../lib/posts';
import { author } from '../lib/site';

export async function GET(context: APIContext) {
  const posts = await getPosts();
  return rss({
    title: author.subject,
    description: author.description,
    site: context.site!,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      categories: post.data.tags,
      link: postUrl(post),
    })),
  });
}
