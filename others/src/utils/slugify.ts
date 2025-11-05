// Slugify utility for creating URL-friendly strings

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

export function uniqueSlug(text: string, id: string): string {
  const slug = slugify(text);
  const shortId = id.slice(-8);
  return `${slug}-${shortId}`;
}
