/**
 * Post bar: shows one post at a time at the bottom of every page.
 * Browse with j/k, the arrow keys, the ‹ › buttons or a swipe; Enter opens the post.
 */

interface PostLink {
  title: string;
  date: string;
  href: string;
}

const SWIPE_MIN_PX = 40;

/** True when a key press is meant for something else (a text field, a shortcut, a focused link). */
function isForSomethingElse(event: KeyboardEvent): boolean {
  const target = event.target as HTMLElement;
  return (
    event.metaKey ||
    event.ctrlKey ||
    event.altKey ||
    target.isContentEditable ||
    target.matches('input, textarea, select, a, button')
  );
}

function setUpPostBar(bar: HTMLElement, posts: PostLink[]): void {
  const title = bar.querySelector<HTMLAnchorElement>('[data-title]')!;
  const date = bar.querySelector<HTMLElement>('[data-date]')!;
  const position = bar.querySelector<HTMLElement>('[data-position]')!;
  let index = Number(bar.dataset.index ?? 0);

  function show(next: number): void {
    index = (next + posts.length) % posts.length;
    const post = posts[index];
    title.textContent = post.title;
    title.href = post.href;
    date.textContent = `[${post.date}]`;
    position.textContent = `${index + 1}/${posts.length}`;
  }

  bar.querySelector('[data-prev]')!.addEventListener('click', () => show(index - 1));
  bar.querySelector('[data-next]')!.addEventListener('click', () => show(index + 1));

  document.addEventListener('keydown', (event) => {
    if (isForSomethingElse(event)) return;
    if (event.key === 'k' || event.key === 'ArrowLeft') show(index - 1);
    else if (event.key === 'j' || event.key === 'ArrowRight') show(index + 1);
    else if (event.key === 'Enter') location.assign(posts[index].href);
  });

  let touchStartX: number | null = null;
  bar.addEventListener('touchstart', (event) => (touchStartX = event.touches[0].clientX), {
    passive: true,
  });
  bar.addEventListener('touchend', (event) => {
    if (touchStartX === null) return;
    const dx = event.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > SWIPE_MIN_PX) show(dx < 0 ? index + 1 : index - 1);
    touchStartX = null;
  });

  bar.dataset.ready = '';
}

const bar = document.querySelector<HTMLElement>('[data-post-bar]');
const data = bar?.querySelector('[data-posts]')?.textContent;
if (bar && data) setUpPostBar(bar, JSON.parse(data) as PostLink[]);
