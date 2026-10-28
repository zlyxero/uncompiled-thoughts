import { getCollection, type CollectionEntry } from 'astro:content';
import { url } from './site';

export type Post = CollectionEntry<'posts'>;

/** All posts, newest first. */
export async function getPosts(): Promise<Post[]> {
  const posts = await getCollection('posts');
  return posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export function postUrl(post: Post): string {
  return url(`/posts/${post.id}/`);
}

/** A date as YYYY-MM-DD, the format used everywhere on the site. */
export function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}
