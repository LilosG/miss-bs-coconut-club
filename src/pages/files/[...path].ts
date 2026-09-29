import type { APIRoute } from 'astro';

// Legacy Toast-era documents are retired. Their prices, hours and contact
// details can be obsolete, and there is no equivalent current document.
export const prerender = false;

export const GET: APIRoute = () =>
  new Response('This document is no longer available.', {
    status: 410,
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
