import test from 'node:test';
import assert from 'node:assert/strict';
import { tryOnPose } from './tryOnPose.js';
const face = (depth = 0) => {
  const points = [];
  points[33] = { x: 0.3, y: 0.4, z: -depth / 2 };
  points[263] = { x: 0.7, y: 0.4, z: depth / 2 };
  points[10] = { x: 0.5, y: 0.2, z: 0 };
  points[152] = { x: 0.5, y: 0.8, z: 0 };
  return points;
};
test('front view has no rotation; eye depth drives turns in both directions', () => {
  assert.deepEqual(tryOnPose(face()), { yaw: 0, pitch: 0 });
  assert.ok(tryOnPose(face(0.3)).yaw > 0.6);
  assert.equal(tryOnPose(face(0.3)).yaw, -tryOnPose(face(-0.3)).yaw);
  const points = face(); points[1] = { x: 0.9, y: 0.5, z: -0.1 };
  assert.equal(tryOnPose(points).yaw, 0); // Nose position no longer flips the arms.
});
test('pitch uses face depth and the video aspect, with bounded rotations', () => {
  const points = face(100); points[152].z = 0.2;
  assert.equal(tryOnPose(points).yaw, 1.1);
  assert.ok(tryOnPose(points, 2).pitch > tryOnPose(points, 1).pitch);
  points[152].z = 100; assert.equal(tryOnPose(points).pitch, 0.65);
  assert.deepEqual(tryOnPose([]), { yaw: 0, pitch: 0 });
  points[33].z = NaN; assert.equal(tryOnPose(points).yaw, 0);
});

test('GLB sizing preserves the selected scale across head turns and follows distance', async () => {
  const { tryOnPlacement } = await import('./tryOnPlacement.js');
  const points = face();
  const original = tryOnPlacement(points, 640, 480, 2, 1, 0, true);
  const yaw = 0.9;
  points[33] = { x: 0.5 - 0.2 * Math.cos(yaw), y: 0.4, z: -0.2 * Math.sin(yaw) };
  points[263] = { x: 0.5 + 0.2 * Math.cos(yaw), y: 0.4, z: 0.2 * Math.sin(yaw) };
  const turned = tryOnPlacement(points, 640, 480, 2, 1, 0, true);
  assert.ok(Math.abs(turned.width - original.width) < 1e-8);
  const adjusted = tryOnPlacement(points, 640, 480, 2, 1.2, 0, true);
  assert.ok(Math.abs(adjusted.width / original.width - 1.2) < 1e-8);
  for (const index of [33, 263]) {
    points[index].x = 0.5 + (points[index].x - 0.5) * 0.8;
    points[index].z *= 0.8;
  }
  const farther = tryOnPlacement(points, 640, 480, 2, 1.2, 0, true);
  assert.ok(Math.abs(farther.width / adjusted.width - 0.8) < 1e-8);
  delete points[33].z;
  assert.ok(Number.isFinite(tryOnPlacement(points, 640, 480, 2, 1, 0, true).width));
});

test('auto width follows face sides while retaining product/user scale on turns', async () => {
  const { tryOnPlacement } = await import('./tryOnPlacement.js');
  const points = face();
  points[234] = { x: 0.2, y: 0.5, z: 0 };
  points[454] = { x: 0.8, y: 0.5, z: 0 };
  const original = tryOnPlacement(points, 640, 480, 2, 1, 0, true);
  points[234].x = 0.17; points[454].x = 0.83;
  const wider = tryOnPlacement(points, 640, 480, 2, 1, 0, true);
  assert.ok(Math.abs(wider.width / original.width - 1.1) < 1e-8);
  const adjusted = tryOnPlacement(points, 640, 480, 2, 0.85, 0, true);
  assert.ok(Math.abs(adjusted.width / wider.width - 0.85) < 1e-8);
  for (const index of [33, 263, 234, 454]) {
    const x = points[index].x - 0.5;
    points[index].x = 0.5 + x * Math.cos(0.7);
    points[index].z = x * Math.sin(0.7);
  }
  assert.ok(Math.abs(tryOnPlacement(points, 640, 480, 2, 1, 0, true).width - wider.width) < 1e-8);
  points[454].x = NaN;
  assert.ok(Number.isFinite(tryOnPlacement(points, 640, 480, 2, 1, 0, true).width));
});
