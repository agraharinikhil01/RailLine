import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import { buildApp } from '../src/index';
import { FastifyInstance } from 'fastify';

describe('RailLine Complete API Integration Tests', () => {
  let app: FastifyInstance;

  before(async () => {
    app = await buildApp();
    await app.ready();
  });

  after(async () => {
    await app.close();
  });

  // --- Phase 1 Baseline ---

  test('GET /health returns healthy status', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/health',
    });

    assert.strictEqual(res.statusCode, 200);
    const body = JSON.parse(res.body);
    assert.strictEqual(body.status, 'healthy');
    assert.strictEqual(body.service, 'railline-api');
  });

  test('GET /api/v1/trains/search?q=12951 finds Mumbai Rajdhani', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/trains/search?q=12951',
    });

    assert.strictEqual(res.statusCode, 200);
    const body = JSON.parse(res.body);
    assert.ok(Array.isArray(body.data));
    assert.ok(body.data.length > 0);
    assert.strictEqual(body.data[0].trainNumber, '12951');
  });

  test('GET /api/v1/trains/search?q=Shatabdi finds Lucknow Shatabdi by partial name', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/trains/search?q=Shatabdi',
    });

    assert.strictEqual(res.statusCode, 200);
    const body = JSON.parse(res.body);
    assert.ok(body.data.length > 0);
    assert.strictEqual(body.data[0].trainNumber, '12004');
  });

  test('GET /api/v1/trains/search?q=1 returns 400 error for query < 2 chars', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/trains/search?q=1',
    });

    assert.strictEqual(res.statusCode, 400);
    const body = JSON.parse(res.body);
    assert.ok(body.error);
    assert.strictEqual(body.error.code, 'INVALID_REQUEST');
  });

  test('GET /api/v1/trains/:trainNumber returns train details with route', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/trains/12951',
    });

    assert.strictEqual(res.statusCode, 200);
    const body = JSON.parse(res.body);
    assert.strictEqual(body.data.trainNumber, '12951');
    assert.ok(body.data.route.length >= 6);
  });

  test('GET /api/v1/trains/:trainNumber/live returns live telemetry and progress', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/trains/12951/live',
    });

    assert.strictEqual(res.statusCode, 200);
    const body = JSON.parse(res.body);
    assert.strictEqual(body.data.trainNumber, '12951');
    assert.ok(body.data.progressPercentage > 0);
  });

  test('GET /api/v1/trains/:trainNumber/route returns valid GeoJSON FeatureCollection', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/trains/12951/route',
    });

    assert.strictEqual(res.statusCode, 200);
    const geojson = JSON.parse(res.body);
    assert.strictEqual(geojson.type, 'FeatureCollection');
    assert.ok(Array.isArray(geojson.features));
  });

  test('GET /api/v1/trains/:trainNumber/timeline returns ordered station timeline', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/trains/12951/timeline',
    });

    assert.strictEqual(res.statusCode, 200);
    const body = JSON.parse(res.body);
    assert.ok(Array.isArray(body.data));
  });

  // --- Phase 2 Analytics & Elevation ---

  test('GET /api/v1/trains/:trainNumber/elevation returns topography summary and points', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/trains/12951/elevation',
    });

    assert.strictEqual(res.statusCode, 200);
    const body = JSON.parse(res.body);
    assert.ok(body.data.profile.length > 0);
    assert.ok(typeof body.data.highestElevationMeters === 'number');
    assert.ok(typeof body.data.lowestElevationMeters === 'number');
    assert.ok(typeof body.data.elevationGainMeters === 'number');
    assert.ok(body.data.highestElevationMeters >= body.data.lowestElevationMeters);
  });

  test('GET /api/v1/trains/:trainNumber/delays returns station delay history', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/trains/12951/delays',
    });

    assert.strictEqual(res.statusCode, 200);
    const body = JSON.parse(res.body);
    assert.ok(Array.isArray(body.data));
    assert.ok(body.data.length > 0);
  });

  // --- Phase 2 Travel Companion: Weather & Places ---

  test('GET /api/v1/weather returns location weather', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/weather?lat=28.64&lng=77.21',
    });

    assert.strictEqual(res.statusCode, 200);
    const body = JSON.parse(res.body);
    assert.ok(typeof body.data.temperature === 'number');
    assert.ok(typeof body.data.humidity === 'number');
    assert.ok(body.data.condition);
  });

  test('GET /api/v1/trains/:trainNumber/weather returns multi-station weather strip', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/trains/12004/weather',
    });

    assert.strictEqual(res.statusCode, 200);
    const body = JSON.parse(res.body);
    assert.ok(body.data.currentStationWeather);
    assert.ok(body.data.nextStationWeather);
    assert.ok(body.data.destinationWeather);
    assert.ok(body.data.checkpoints.length >= 4);
  });

  test('GET /api/v1/trains/:trainNumber/places returns nearby geographic POIs', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/trains/12004/places',
    });

    assert.strictEqual(res.statusCode, 200);
    const body = JSON.parse(res.body);
    assert.ok(Array.isArray(body.data));
    assert.ok(body.data.length > 0);
    assert.ok(body.data.some((p: any) => p.type === 'RIVER' || p.type === 'BRIDGE'));
  });

  // --- Phase 2 Journey Sharing ---

  test('POST /api/v1/journeys/share creates share link and token', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/journeys/share',
      payload: { trainNumber: '12951' },
    });

    assert.strictEqual(res.statusCode, 201);
    const body = JSON.parse(res.body);
    assert.ok(body.data.shareToken);
    assert.ok(body.data.shareUrl.includes(body.data.shareToken));

    // Test retrieving public shared journey using the generated token
    const fetchRes = await app.inject({
      method: 'GET',
      url: `/api/v1/journeys/shared/${body.data.shareToken}`,
    });

    assert.strictEqual(fetchRes.statusCode, 200);
    const fetched = JSON.parse(fetchRes.body);
    assert.strictEqual(fetched.data.trainNumber, '12951');
    assert.ok(fetched.data.progressPercentage > 0);
  });

  // --- Phase 2 Favorites ---

  test('GET, POST, and DELETE /api/v1/favorites works seamlessly', async () => {
    // Add favorite
    const addRes = await app.inject({
      method: 'POST',
      url: '/api/v1/favorites',
      payload: { trainNumber: '22436' },
    });
    assert.strictEqual(addRes.statusCode, 201);

    // List favorites
    const listRes = await app.inject({
      method: 'GET',
      url: '/api/v1/favorites',
    });
    assert.strictEqual(listRes.statusCode, 200);
    const list = JSON.parse(listRes.body);
    assert.ok(list.data.some((t: any) => t.trainNumber === '22436'));

    // Remove favorite
    const delRes = await app.inject({
      method: 'DELETE',
      url: '/api/v1/favorites/22436',
    });
    assert.strictEqual(delRes.statusCode, 200);
  });

  // --- Phase 2 Observability ---

  test('GET /api/v1/admin/health returns operational metrics and cache hit stats', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/admin/health',
    });

    assert.strictEqual(res.statusCode, 200);
    const body = JSON.parse(res.body);
    assert.strictEqual(body.status, 'operational');
    assert.ok(body.cache);
    assert.ok(body.memory);
    assert.ok(body.providers);
  });

  test('GET /api/v1/trains/99999 returns 404 with standard ApiError', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/trains/99999',
    });

    assert.strictEqual(res.statusCode, 404);
    const body = JSON.parse(res.body);
    assert.ok(body.error);
    assert.strictEqual(body.error.code, 'TRAIN_NOT_FOUND');
  });
});
