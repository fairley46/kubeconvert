/** Collapse non [a-z0-9] runs into a single separator. Linear in input length. */
export function collapseAlnumRuns(input: string, separator: string): string {
  const lower = input.toLowerCase();
  const parts: string[] = [];
  let start = -1;
  for (let i = 0; i < lower.length; i++) {
    const code = lower.charCodeAt(i);
    const alnum = (code >= 48 && code <= 57) || (code >= 97 && code <= 122);
    if (alnum) {
      if (start < 0) start = i;
      continue;
    }
    if (start >= 0) {
      parts.push(lower.slice(start, i));
      start = -1;
    }
  }
  if (start >= 0) parts.push(lower.slice(start));
  return parts.join(separator);
}
