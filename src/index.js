import { SEED_DOGS } from './seed-dogs.js';

const SCHEMA_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS dogs (id INTEGER PRIMARY KEY AUTOINCREMENT, slug TEXT NOT NULL UNIQUE, name TEXT NOT NULL, breed TEXT, sex TEXT, age TEXT, location TEXT, status TEXT NOT NULL DEFAULT 'Available', progress TEXT, group_name TEXT NOT NULL DEFAULT 'available', image TEXT, image_filter TEXT, specialties TEXT NOT NULL DEFAULT '[]', blurb TEXT NOT NULL DEFAULT '', veteran_placement INTEGER NOT NULL DEFAULT 0, year TEXT, sort_order INTEGER NOT NULL DEFAULT 100, is_visible INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE INDEX IF NOT EXISTS idx_dogs_group ON dogs(group_name)`,
  `CREATE INDEX IF NOT EXISTS idx_dogs_sort ON dogs(sort_order, name)`
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
  if (typeof value === 'string') return value.split(/\n|,/).map(v => v.trim()).filter(Boolean).slice(0, 30);
  return [];
}

function rowToDog(row) {
  let specialties = [];
  try { specialties = JSON.parse(row.specialties || '[]'); } catch {}
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
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

async function ensureDatabase(env) {
  if (!env.DB) throw new Error('D1 binding DB is not configured.');
  // D1Database.exec() splits input on newlines. A multi-line CREATE TABLE would
  // therefore be treated as an incomplete first statement. Run each complete
  // schema statement separately through the prepared-statement API instead.
  for (const statement of SCHEMA_STATEMENTS) {
    await env.DB.prepare(statement).run();
  }
  const row = await env.DB.prepare('SELECT COUNT(*) AS count FROM dogs').first();
  if (Number(row?.count || 0) > 0) return;

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
  const sortOrder = Number.isFinite(Number(body.sortOrder)) ? Math.trunc(Number(body.sortOrder)) : Number(existing.sort_order || 100);
  return {
    name,
    slug: slugify(body.slug || name),
    breed: nullable(body.breed, 100),
    sex: nullable(body.sex, 60),
    age: nullable(body.age, 80),
    location: nullable(body.location, 120),
    status: textValue(body.status || existing.status || 'Available', 200),
    progress: nullable(body.progress, 200),
    group,
    image: nullable(body.image, 500),
    imageFilter: nullable(body.imageFilter, 200),
    specialties: parseSpecialties(body.specialties),
    blurb: textValue(body.blurb, 5000),
    veteranPlacement: body.veteranPlacement === true || body.veteranPlacement === 1 || body.veteranPlacement === 'true',
    year: nullable(body.year, 20),
    sortOrder,
    visible: body.visible === false || body.visible === 0 || body.visible === 'false' ? 0 : 1
  };
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
  const exists = await env.DB.prepare('SELECT id FROM dogs WHERE slug = ?').bind(dog.slug).first();
  if (exists) return json({ error: 'A dog with that name/slug already exists.' }, 409);
  const result = await env.DB.prepare(`
    INSERT INTO dogs (slug,name,breed,sex,age,location,status,progress,group_name,image,image_filter,specialties,blurb,veteran_placement,year,sort_order,is_visible,updated_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,CURRENT_TIMESTAMP)
  `).bind(
    dog.slug,dog.name,dog.breed,dog.sex,dog.age,dog.location,dog.status,dog.progress,dog.group,dog.image,dog.imageFilter,
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
    UPDATE dogs SET slug=?,name=?,breed=?,sex=?,age=?,location=?,status=?,progress=?,group_name=?,image=?,image_filter=?,specialties=?,blurb=?,veteran_placement=?,year=?,sort_order=?,is_visible=?,updated_at=CURRENT_TIMESTAMP
    WHERE id=?
  `).bind(
    dog.slug,dog.name,dog.breed,dog.sex,dog.age,dog.location,dog.status,dog.progress,dog.group,dog.image,dog.imageFilter,
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

async function uploadImage(request, env, identity) {
  if (!checkMutationOrigin(request)) return json({ error: 'Invalid request origin.' }, 403);
  if (!env.DOG_IMAGES) return json({ error: 'R2 binding DOG_IMAGES is not configured.' }, 503);
  const form = await request.formData();
  const file = form.get('file');
  if (!(file instanceof File)) return json({ error: 'Choose an image to upload.' }, 400);
  if (file.size > 10 * 1024 * 1024) return json({ error: 'Image must be 10 MB or smaller.' }, 413);
  const allowed = new Map([
    ['image/jpeg','jpg'],['image/png','png'],['image/webp','webp'],['image/gif','gif']
  ]);
  const ext = allowed.get(file.type);
  if (!ext) return json({ error: 'Use a JPG, PNG, WebP, or GIF image.' }, 415);
  const key = `dogs/${new Date().toISOString().slice(0,10)}/${crypto.randomUUID()}.${ext}`;
  await env.DOG_IMAGES.put(key, file.stream(), {
    httpMetadata: { contentType: file.type, cacheControl: 'public, max-age=31536000, immutable' },
    customMetadata: { uploadedBy: identity.email || 'unknown', originalName: file.name.slice(0, 180) }
  });
  return json({ image: `/media/${key}` }, 201);
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
        if (path === '/api/admin/upload' && request.method === 'POST') {
          return uploadImage(request, env, auth.identity);
        }
        const match = path.match(/^\/api\/admin\/dogs\/(\d+)$/);
        if (match && request.method === 'PUT') return updateDog(Number(match[1]), request, env);
        if (match && request.method === 'DELETE') return deleteDog(Number(match[1]), request, env);
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
