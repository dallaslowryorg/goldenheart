import { SEED_DOGS } from './seed-dogs.js';
import { SEED_STORIES } from './seed-stories.js';

const SCHEMA_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS dogs (id INTEGER PRIMARY KEY AUTOINCREMENT, slug TEXT NOT NULL UNIQUE, name TEXT NOT NULL, handler_name TEXT, breed TEXT, sex TEXT, age TEXT, location TEXT, status TEXT NOT NULL DEFAULT 'Available', progress TEXT, group_name TEXT NOT NULL DEFAULT 'available', image TEXT, image_filter TEXT, specialties TEXT NOT NULL DEFAULT '[]', blurb TEXT NOT NULL DEFAULT '', veteran_placement INTEGER NOT NULL DEFAULT 0, year TEXT, sort_order INTEGER NOT NULL DEFAULT 100, is_visible INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE INDEX IF NOT EXISTS idx_dogs_group ON dogs(group_name)`,
  `CREATE INDEX IF NOT EXISTS idx_dogs_sort ON dogs(sort_order, name)`,
  `CREATE TABLE IF NOT EXISTS stories (id INTEGER PRIMARY KEY AUTOINCREMENT, slug TEXT NOT NULL UNIQUE, title TEXT NOT NULL, tags TEXT NOT NULL DEFAULT '[]', quote TEXT NOT NULL DEFAULT '', body TEXT NOT NULL DEFAULT '', attribution TEXT NOT NULL DEFAULT '', image TEXT, image_alt TEXT, video TEXT, video_note TEXT, collapse_body INTEGER NOT NULL DEFAULT 1, sort_order INTEGER NOT NULL DEFAULT 100, is_visible INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE INDEX IF NOT EXISTS idx_stories_sort ON stories(sort_order, title)`
];

const JSON_HEADERS = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'no-store'
};

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), { status, headers: { ...JSON_HEADERS, ...headers } });
}

function slugify(value = '') {
  return String(value)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || `dog-${crypto.randomUUID().slice(0, 8)}`;
}

function nullable(value, max = 500) {
  if (value === undefined || value === null) return null;
  const s = String(value).trim().slice(0, max);
  return s || null;
}

function textValue(value, max = 5000) {
  return String(value ?? '').trim().slice(0, max);
}

function parseSpecialties(value) {
  if (Array.isArray(value)) return value.map(v => String(v).trim()).filter(Boolean).slice(0, 30);
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) return parsed.map(v => String(v).trim()).filter(Boolean).slice(0, 30);
      } catch {}
    }
    return value.split(/\n|,/).map(v => v.trim()).filter(Boolean).slice(0, 30);
  }
  return [];
}

function statusForGroup(group) {
  return ({
    available: 'Available',
    pending: 'Pending',
    matched: 'Matched / Transitioning',
    partner: 'Veteran Organization Placement',
    graduate: 'Graduate'
  })[group] || 'Available';
}

function buildDogBlurb(dog) {
  const location = dog.group === 'graduate' && dog.location ? ` in ${dog.location}` : '';
  const handler = dog.handlerName ? ` with ${dog.handlerName}` : '';
  let sentence;
  if (dog.group === 'graduate') {
    sentence = `${dog.name} is a ${dog.year ? `${dog.year} ` : ''}Golden Heart Service Dogs graduate${handler}${location}.`;
  } else if (dog.group === 'partner') {
    sentence = `${dog.name} has been placed with a veteran organization and is no longer available through Golden Heart.`;
  } else if (dog.group === 'matched') {
    sentence = `${dog.name} has been matched with a client${location} and is no longer available.`;
    if (dog.progress) sentence += ` Current program progress: ${dog.progress}.`;
  } else if (dog.group === 'pending') {
    sentence = `${dog.name}'s current status is pending${location}.`;
    if (dog.progress) sentence += ` Current program progress: ${dog.progress}.`;
  } else {
    sentence = `${dog.name} is currently available for pairing consideration through Golden Heart Service Dogs.`;
    if (dog.progress) sentence += ` Current program progress: ${dog.progress}.`;
  }
  if (dog.specialties?.length) sentence += ` Training focus includes ${dog.specialties.join(', ')}.`;
  if (dog.veteranPlacement) sentence += ` This is a veteran service-dog placement.`;
  return sentence.slice(0, 5000);
}

function rowToDog(row) {
  let specialties = [];
  try { specialties = JSON.parse(row.specialties || '[]'); } catch {}
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    handlerName: row.handler_name || undefined,
    breed: row.breed || undefined,
    sex: row.sex || undefined,
    age: row.age || undefined,
    location: row.location || undefined,
    status: row.status,
    progress: row.progress || undefined,
    group: row.group_name,
    image: row.image || undefined,
    imageFilter: row.image_filter || undefined,
    specialties,
    blurb: row.blurb || '',
    veteranPlacement: Boolean(row.veteran_placement),
    year: row.year || undefined,
    sortOrder: row.sort_order,
    visible: Boolean(row.is_visible),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}


function parseTags(value) {
  if (Array.isArray(value)) return value.map(v => String(v).trim()).filter(Boolean).slice(0, 20);
  if (typeof value === 'string') return value.split(/\n|,/).map(v => v.trim()).filter(Boolean).slice(0, 20);
  return [];
}

function rowToStory(row) {
  let tags = [];
  try { tags = JSON.parse(row.tags || '[]'); } catch {}
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    tags,
    quote: row.quote || '',
    body: row.body || '',
    attribution: row.attribution || '',
    image: row.image || undefined,
    imageAlt: row.image_alt || '',
    video: row.video || undefined,
    videoNote: row.video_note || '',
    collapseBody: Boolean(row.collapse_body),
    sortOrder: row.sort_order,
    visible: Boolean(row.is_visible),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function storyPayload(body, existing = {}) {
  const title = textValue(body.title ?? existing.title, 160);
  if (!title) throw new Error('Story title is required.');
  const sortOrder = Number.isFinite(Number(body.sortOrder)) ? Math.trunc(Number(body.sortOrder)) : Number(existing.sort_order || 100);
  return {
    title,
    slug: slugify(body.slug || title),
    tags: parseTags(body.tags ?? existing.tags),
    quote: textValue(body.quote ?? existing.quote, 3000),
    body: textValue(body.body ?? existing.body, 20000),
    attribution: textValue(body.attribution ?? existing.attribution, 500),
    image: nullable(body.image ?? existing.image, 500),
    imageAlt: textValue(body.imageAlt ?? existing.image_alt, 500),
    video: nullable(body.video ?? existing.video, 500),
    videoNote: textValue(body.videoNote ?? existing.video_note, 500),
    collapseBody: body.collapseBody === false || body.collapseBody === 0 || body.collapseBody === 'false' ? 0 : 1,
    sortOrder,
    visible: body.visible === false || body.visible === 0 || body.visible === 'false' ? 0 : 1
  };
}

async function ensureDatabase(env) {
  if (!env.DB) throw new Error('D1 binding DB is not configured.');
  // D1Database.exec() splits input on newlines. A multi-line CREATE TABLE would
  // therefore be treated as an incomplete first statement. Run each complete
  // schema statement separately through the prepared-statement API instead.
  for (const statement of SCHEMA_STATEMENTS) {
    await env.DB.prepare(statement).run();
  }

  // Lightweight schema migrations for databases created by earlier revisions.
  // D1/SQLite does not support ADD COLUMN IF NOT EXISTS, so inspect the table
  // before applying each additive migration.
  const columns = await env.DB.prepare('PRAGMA table_info(dogs)').all();
  const columnNames = new Set((columns.results || []).map(column => column.name));
  if (!columnNames.has('handler_name')) {
    await env.DB.prepare('ALTER TABLE dogs ADD COLUMN handler_name TEXT').run();
  }

  const dogCount = await env.DB.prepare('SELECT COUNT(*) AS count FROM dogs').first();
  if (Number(dogCount?.count || 0) === 0) {
    const statements = SEED_DOGS.map((dog, index) => env.DB.prepare(`
      INSERT OR IGNORE INTO dogs (
        slug,name,breed,sex,age,location,status,progress,group_name,image,image_filter,
        specialties,blurb,veteran_placement,year,sort_order,is_visible
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,1)
    `).bind(
      slugify(dog.name), dog.name, dog.breed || null, dog.sex || null, dog.age || null,
      dog.location || null, dog.status || 'Available', dog.progress || null, dog.group || 'available',
      dog.image || null, dog.imageFilter || null, JSON.stringify(dog.specialties || []), dog.blurb || '',
      dog.veteranPlacement ? 1 : 0, dog.year || null, (index + 1) * 10
    ));
    if (statements.length) await env.DB.batch(statements);
  }

  const storyCount = await env.DB.prepare('SELECT COUNT(*) AS count FROM stories').first();
  if (Number(storyCount?.count || 0) === 0) {
    const statements = SEED_STORIES.map((story, index) => env.DB.prepare(`
      INSERT OR IGNORE INTO stories (
        slug,title,tags,quote,body,attribution,image,image_alt,video,video_note,collapse_body,sort_order,is_visible
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,1)
    `).bind(
      slugify(story.title), story.title, JSON.stringify(story.tags || []), story.quote || '', story.body || '',
      story.attribution || '', story.image || null, story.imageAlt || '', story.video || null, story.videoNote || '',
      story.collapseBody === false ? 0 : 1, (index + 1) * 10
    ));
    if (statements.length) await env.DB.batch(statements);
  }
}

function getCookieValue(cookieHeader, name) {
  const cookies = String(cookieHeader || '').split(';');
  for (const cookie of cookies) {
    const idx = cookie.indexOf('=');
    if (idx < 0) continue;
    const key = cookie.slice(0, idx).trim();
    if (key === name) return cookie.slice(idx + 1).trim();
  }
  return null;
}

async function getIdentity(request, ctx, env) {
  // Direct Worker Access integrations can expose identity through ctx.access.
  if (ctx.access) {
    try {
      const identity = await ctx.access.getIdentity();
      if (identity?.email) return identity;
    } catch {}
  }

  // Workers with Static Assets currently execute behind an internal assets router,
  // which does not pass ctx.access to the user Worker. In that case, validate the
  // browser's Cloudflare Access session against Cloudflare's get-identity endpoint.
  const accessCookie = getCookieValue(request.headers.get('cookie'), 'CF_Authorization');
  const teamDomain = String(env.ACCESS_TEAM_DOMAIN || '').replace(/\/$/, '');
  if (!accessCookie || !teamDomain) return null;

  try {
    const response = await fetch(`${teamDomain}/cdn-cgi/access/get-identity`, {
      method: 'GET',
      headers: {
        cookie: `CF_Authorization=${accessCookie}`,
        accept: 'application/json'
      },
      redirect: 'manual'
    });
    if (!response.ok) return null;
    const identity = await response.json();
    return identity?.email ? identity : null;
  } catch {
    return null;
  }
}

async function requireAdmin(request, ctx, env, html = false) {
  const identity = await getIdentity(request, ctx, env);
  if (!identity?.email) {
    if (html) {
      return new Response(`<!doctype html><meta charset="utf-8"><title>Golden Heart Admin</title><style>body{font:16px system-ui;margin:3rem;max-width:52rem}code{background:#f4f4f4;padding:.15rem .35rem;border-radius:.25rem}</style><h1>Golden Heart Admin is protected</h1><p>Cloudflare Access has not authenticated this request. Configure Access for <code>/admin*</code> and <code>/api/admin/*</code>, then sign in with an approved email address.</p>`, { status: 401, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } });
    }
    return json({ error: 'Admin authentication required. Configure Cloudflare Access for the admin paths.' }, 401);
  }

  const allowed = String(env.ADMIN_EMAILS || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
  if (allowed.length && !allowed.includes(identity.email.toLowerCase())) {
    return html
      ? new Response('Forbidden', { status: 403, headers: { 'cache-control': 'no-store' } })
      : json({ error: 'This authenticated account is not an approved Golden Heart administrator.' }, 403);
  }
  return { identity };
}

function checkMutationOrigin(request) {
  const origin = request.headers.get('origin');
  if (!origin) return true;
  const expected = new URL(request.url).origin;
  return origin === expected;
}

function dogPayload(body, existing = {}) {
  const groups = new Set(['available','pending','matched','partner','graduate']);
  const name = textValue(body.name ?? existing.name, 100);
  if (!name) throw new Error('Name is required.');
  const group = groups.has(body.group) ? body.group : (existing.group_name || 'available');
  const sameGroup = Boolean(existing.group_name) && group === existing.group_name;
  const dog = {
    name,
    slug: slugify(body.slug || name),
    handlerName: nullable(body.handlerName ?? existing.handler_name, 120),
    breed: nullable(existing.breed, 100),
    sex: nullable(body.sex ?? existing.sex, 60),
    age: nullable(body.age ?? existing.age, 80),
    location: nullable(body.location ?? existing.location, 120),
    status: body.status !== undefined ? textValue(body.status, 200) : (sameGroup && existing.status ? existing.status : statusForGroup(group)),
    progress: ['available','pending','matched'].includes(group) ? nullable(body.progress ?? existing.progress, 200) : null,
    group,
    image: nullable(body.image ?? existing.image, 500),
    imageFilter: nullable(body.imageFilter ?? existing.image_filter, 200),
    specialties: parseSpecialties(body.specialties ?? existing.specialties),
    blurb: textValue(body.blurb ?? existing.blurb, 5000),
    veteranPlacement: body.veteranPlacement === true || body.veteranPlacement === 1 || body.veteranPlacement === 'true',
    year: group === 'graduate' ? nullable(body.year ?? existing.year, 20) : null,
    sortOrder: Number(existing.sort_order || 100),
    visible: body.visible === false || body.visible === 0 || body.visible === 'false' ? 0 : 1
  };
  if (!dog.blurb) dog.blurb = buildDogBlurb(dog);
  return dog;
}

async function listDogs(env, includeHidden = false) {
  await ensureDatabase(env);
  const sql = `SELECT * FROM dogs ${includeHidden ? '' : 'WHERE is_visible = 1'} ORDER BY sort_order ASC, name COLLATE NOCASE ASC`;
  const result = await env.DB.prepare(sql).all();
  return (result.results || []).map(rowToDog);
}

async function createDog(request, env) {
  if (!checkMutationOrigin(request)) return json({ error: 'Invalid request origin.' }, 403);
  const body = await request.json();
  const dog = dogPayload(body);
  const maxSort = await env.DB.prepare('SELECT COALESCE(MAX(sort_order), 0) AS max_sort FROM dogs').first();
  dog.sortOrder = Number(maxSort?.max_sort || 0) + 10;
  const exists = await env.DB.prepare('SELECT id FROM dogs WHERE slug = ?').bind(dog.slug).first();
  if (exists) return json({ error: 'A dog with that name/slug already exists.' }, 409);
  const result = await env.DB.prepare(`
    INSERT INTO dogs (slug,name,handler_name,breed,sex,age,location,status,progress,group_name,image,image_filter,specialties,blurb,veteran_placement,year,sort_order,is_visible,updated_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,CURRENT_TIMESTAMP)
  `).bind(
    dog.slug,dog.name,dog.handlerName,dog.breed,dog.sex,dog.age,dog.location,dog.status,dog.progress,dog.group,dog.image,dog.imageFilter,
    JSON.stringify(dog.specialties),dog.blurb,dog.veteranPlacement?1:0,dog.year,dog.sortOrder,dog.visible
  ).run();
  const created = await env.DB.prepare('SELECT * FROM dogs WHERE id = ?').bind(result.meta.last_row_id).first();
  return json({ dog: rowToDog(created) }, 201);
}

async function updateDog(id, request, env) {
  if (!checkMutationOrigin(request)) return json({ error: 'Invalid request origin.' }, 403);
  const existing = await env.DB.prepare('SELECT * FROM dogs WHERE id = ?').bind(id).first();
  if (!existing) return json({ error: 'Dog not found.' }, 404);
  const body = await request.json();
  const dog = dogPayload(body, existing);
  const conflict = await env.DB.prepare('SELECT id FROM dogs WHERE slug = ? AND id <> ?').bind(dog.slug, id).first();
  if (conflict) return json({ error: 'Another dog already uses that name/slug.' }, 409);
  await env.DB.prepare(`
    UPDATE dogs SET slug=?,name=?,handler_name=?,breed=?,sex=?,age=?,location=?,status=?,progress=?,group_name=?,image=?,image_filter=?,specialties=?,blurb=?,veteran_placement=?,year=?,sort_order=?,is_visible=?,updated_at=CURRENT_TIMESTAMP
    WHERE id=?
  `).bind(
    dog.slug,dog.name,dog.handlerName,dog.breed,dog.sex,dog.age,dog.location,dog.status,dog.progress,dog.group,dog.image,dog.imageFilter,
    JSON.stringify(dog.specialties),dog.blurb,dog.veteranPlacement?1:0,dog.year,dog.sortOrder,dog.visible,id
  ).run();
  const updated = await env.DB.prepare('SELECT * FROM dogs WHERE id = ?').bind(id).first();
  return json({ dog: rowToDog(updated) });
}

async function deleteDog(id, request, env) {
  if (!checkMutationOrigin(request)) return json({ error: 'Invalid request origin.' }, 403);
  const existing = await env.DB.prepare('SELECT * FROM dogs WHERE id = ?').bind(id).first();
  if (!existing) return json({ error: 'Dog not found.' }, 404);
  await env.DB.prepare('DELETE FROM dogs WHERE id = ?').bind(id).run();
  if (existing.image?.startsWith('/media/') && env.DOG_IMAGES) {
    const key = decodeURIComponent(existing.image.replace(/^\/media\//, ''));
    try { await env.DOG_IMAGES.delete(key); } catch {}
  }
  return json({ ok: true, deleted: { id, name: existing.name } });
}


async function listStories(env, includeHidden = false) {
  await ensureDatabase(env);
  const sql = `SELECT * FROM stories ${includeHidden ? '' : 'WHERE is_visible = 1'} ORDER BY sort_order ASC, title COLLATE NOCASE ASC`;
  const result = await env.DB.prepare(sql).all();
  return (result.results || []).map(rowToStory);
}

async function createStory(request, env) {
  if (!checkMutationOrigin(request)) return json({ error: 'Invalid request origin.' }, 403);
  const body = await request.json();
  const story = storyPayload(body);
  const exists = await env.DB.prepare('SELECT id FROM stories WHERE slug = ?').bind(story.slug).first();
  if (exists) return json({ error: 'A story with that title/slug already exists.' }, 409);
  const result = await env.DB.prepare(`
    INSERT INTO stories (slug,title,tags,quote,body,attribution,image,image_alt,video,video_note,collapse_body,sort_order,is_visible,updated_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,CURRENT_TIMESTAMP)
  `).bind(
    story.slug,story.title,JSON.stringify(story.tags),story.quote,story.body,story.attribution,story.image,story.imageAlt,
    story.video,story.videoNote,story.collapseBody,story.sortOrder,story.visible
  ).run();
  const created = await env.DB.prepare('SELECT * FROM stories WHERE id = ?').bind(result.meta.last_row_id).first();
  return json({ story: rowToStory(created) }, 201);
}

async function updateStory(id, request, env) {
  if (!checkMutationOrigin(request)) return json({ error: 'Invalid request origin.' }, 403);
  const existing = await env.DB.prepare('SELECT * FROM stories WHERE id = ?').bind(id).first();
  if (!existing) return json({ error: 'Story not found.' }, 404);
  const body = await request.json();
  const story = storyPayload(body, existing);
  const conflict = await env.DB.prepare('SELECT id FROM stories WHERE slug = ? AND id <> ?').bind(story.slug, id).first();
  if (conflict) return json({ error: 'Another story already uses that title/slug.' }, 409);
  await env.DB.prepare(`
    UPDATE stories SET slug=?,title=?,tags=?,quote=?,body=?,attribution=?,image=?,image_alt=?,video=?,video_note=?,collapse_body=?,sort_order=?,is_visible=?,updated_at=CURRENT_TIMESTAMP
    WHERE id=?
  `).bind(
    story.slug,story.title,JSON.stringify(story.tags),story.quote,story.body,story.attribution,story.image,story.imageAlt,
    story.video,story.videoNote,story.collapseBody,story.sortOrder,story.visible,id
  ).run();
  const updated = await env.DB.prepare('SELECT * FROM stories WHERE id = ?').bind(id).first();
  return json({ story: rowToStory(updated) });
}

async function deleteStory(id, request, env) {
  if (!checkMutationOrigin(request)) return json({ error: 'Invalid request origin.' }, 403);
  const existing = await env.DB.prepare('SELECT * FROM stories WHERE id = ?').bind(id).first();
  if (!existing) return json({ error: 'Story not found.' }, 404);
  await env.DB.prepare('DELETE FROM stories WHERE id = ?').bind(id).run();
  for (const asset of [existing.image, existing.video]) {
    if (asset?.startsWith('/media/stories/') && env.DOG_IMAGES) {
      const key = decodeURIComponent(asset.replace(/^\/media\//, ''));
      try { await env.DOG_IMAGES.delete(key); } catch {}
    }
  }
  return json({ ok: true, deleted: { id, title: existing.title } });
}

async function uploadImage(request, env, identity) {
  if (!checkMutationOrigin(request)) return json({ error: 'Invalid request origin.' }, 403);
  if (!env.DOG_IMAGES) return json({ error: 'R2 binding DOG_IMAGES is not configured.' }, 503);
  const form = await request.formData();
  const file = form.get('file');
  const kind = form.get('kind') === 'stories' ? 'stories' : 'dogs';
  if (!(file instanceof File)) return json({ error: 'Choose a file to upload.' }, 400);
  const maxBytes = kind === 'stories' ? 80 * 1024 * 1024 : 10 * 1024 * 1024;
  if (file.size > maxBytes) return json({ error: `File must be ${kind === 'stories' ? '80' : '10'} MB or smaller.` }, 413);
  const allowed = new Map([
    ['image/jpeg','jpg'],['image/png','png'],['image/webp','webp'],['image/gif','gif'],
    ['video/mp4','mp4'],['video/webm','webm']
  ]);
  const ext = allowed.get(file.type);
  if (!ext || (kind === 'dogs' && file.type.startsWith('video/'))) {
    return json({ error: kind === 'stories' ? 'Use a JPG, PNG, WebP, GIF, MP4, or WebM file.' : 'Use a JPG, PNG, WebP, or GIF image.' }, 415);
  }
  const key = `${kind}/${new Date().toISOString().slice(0,10)}/${crypto.randomUUID()}.${ext}`;
  await env.DOG_IMAGES.put(key, file.stream(), {
    httpMetadata: { contentType: file.type, cacheControl: 'public, max-age=31536000, immutable' },
    customMetadata: { uploadedBy: identity.email || 'unknown', originalName: file.name.slice(0, 180) }
  });
  const asset = `/media/${key}`;
  return json({ asset, image: asset }, 201);
}

async function serveMedia(request, env, url) {
  if (!env.DOG_IMAGES) return new Response('Not found', { status: 404 });
  const key = decodeURIComponent(url.pathname.replace(/^\/media\//, ''));
  if (!key || key.includes('..')) return new Response('Bad request', { status: 400 });
  const object = await env.DOG_IMAGES.get(key);
  if (!object) return new Response('Not found', { status: 404 });
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);
  headers.set('cache-control', headers.get('cache-control') || 'public, max-age=31536000, immutable');
  return new Response(object.body, { headers });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    try {
      if (path === '/api/dogs' && request.method === 'GET') {
        const dogs = await listDogs(env, false);
        return json({ dogs }, 200, { 'cache-control': 'public, max-age=30, stale-while-revalidate=120' });
      }
      if (path === '/api/stories' && request.method === 'GET') {
        const stories = await listStories(env, false);
        return json({ stories }, 200, { 'cache-control': 'public, max-age=30, stale-while-revalidate=120' });
      }

      if (path.startsWith('/media/') && request.method === 'GET') {
        return serveMedia(request, env, url);
      }

      if (path === '/admin' || path.startsWith('/admin/')) {
        const auth = await requireAdmin(request, ctx, env, true);
        if (auth instanceof Response) return auth;
        return env.ASSETS.fetch(request);
      }

      if (path.startsWith('/api/admin/')) {
        const auth = await requireAdmin(request, ctx, env, false);
        if (auth instanceof Response) return auth;

        // /me does not require D1. Keeping it database-free prevents the admin
        // bootstrap request from racing the initial dog-directory seed.
        if (path === '/api/admin/me' && request.method === 'GET') {
          return json({ email: auth.identity.email || '', name: auth.identity.name || '' });
        }

        await ensureDatabase(env);

        if (path === '/api/admin/dogs' && request.method === 'GET') {
          return json({ dogs: await listDogs(env, true) });
        }
        if (path === '/api/admin/dogs' && request.method === 'POST') {
          return createDog(request, env);
        }
        if (path === '/api/admin/stories' && request.method === 'GET') {
          return json({ stories: await listStories(env, true) });
        }
        if (path === '/api/admin/stories' && request.method === 'POST') {
          return createStory(request, env);
        }
        if (path === '/api/admin/upload' && request.method === 'POST') {
          return uploadImage(request, env, auth.identity);
        }
        const dogMatch = path.match(/^\/api\/admin\/dogs\/(\d+)$/);
        if (dogMatch && request.method === 'PUT') return updateDog(Number(dogMatch[1]), request, env);
        if (dogMatch && request.method === 'DELETE') return deleteDog(Number(dogMatch[1]), request, env);
        const storyMatch = path.match(/^\/api\/admin\/stories\/(\d+)$/);
        if (storyMatch && request.method === 'PUT') return updateStory(Number(storyMatch[1]), request, env);
        if (storyMatch && request.method === 'DELETE') return deleteStory(Number(storyMatch[1]), request, env);
        return json({ error: 'Admin endpoint not found.' }, 404);
      }

      return env.ASSETS.fetch(request);
    } catch (error) {
      console.error(error);
      const isApi = path.startsWith('/api/');
      if (isApi) return json({ error: 'Server error', detail: String(error?.message || error) }, 500);
      return new Response('Server error', { status: 500 });
    }
  }
};
