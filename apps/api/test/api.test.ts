import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import { buildApp } from '../src/index';
import { FastifyInstance } from 'fastify';

describe('RailLine Phase 1 API Integration Tests', () => {
  let app: FastifyInstance;

  before(async () => {
    app = await buildApp();
    await app.ready();
  });

  after(async () => {
    await app.close();
  });

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
    assert.strictEqual(body.data[0].name, 'Mumbai Rajdhani Express');
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
    assert.strictEqual(body.data.source.name, 'Mumbai Central');
    assert.strictEqual(body.data.destination.name, 'New Delhi');
    assert.ok(body.data.route.length >= 6);
  });

  test('GET /api/v1/trains/:trainNumber/live returns live telemetry and progress', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/trains/12951/live',
    });

    assert.strictEqual(res.statusCode, 200);
    const body = JSON.parse(res.body);
    const status = body.data;

    assert.strictEqual(status.trainNumber, '12951');
    assert.ok(['ON TIME', 'DELAYED'].includes(status.status));
    assert.ok(typeof status.location.lat === 'number');
    assert.ok(typeof status.location.lng === 'number');
    assert.ok(typeof status.progressPercentage === 'number');
    assert.ok(status.progressPercentage > 0 && status.progressPercentage <= 100);
    assert.ok(typeof status.distanceCoveredKm === 'number');
    assert.ok(typeof status.distanceRemainingKm === 'number');
    assert.ok(status.currentStation);
    assert.ok(status.nextStation);
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

    // Verify completed and remaining line segments exist
    const completedSeg = geojson.features.find((f: any) => f.properties?.segment === 'completed');
    const remainingSeg = geojson.features.find((f: any) => f.properties?.segment === 'remaining');
    assert.ok(completedSeg, 'Completed route segment must exist');
    assert.ok(remainingSeg, 'Remaining route segment must exist');
  });

  test('GET /api/v1/trains/:trainNumber/timeline returns ordered station timeline', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/trains/12951/timeline',
    });

    assert.strictEqual(res.statusCode, 200);
    const body = JSON.parse(res.body);
    assert.ok(Array.isArray(body.data));
    assert.ok(body.data.length >= 6);

    // Verify presence of completed and upcoming stations
    const hasCompleted = body.data.some((s: any) => s.status === 'COMPLETED');
    const hasCurrent = body.data.some((s: any) => s.status === 'CURRENT');
    assert.ok(hasCompleted, 'Should have completed stations');
    assert.ok(hasCurrent, 'Should have current station');
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
    assert.ok(body.error.message.includes('99999'));
    assert.ok(body.error.requestId);
  });
});
