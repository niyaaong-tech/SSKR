const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

// Measure rendered content, not only its flex/grid container.
async function measureBox(locator, { textSelector } = {}) {
  for (let attempt = 0; attempt < 8; attempt++) {
    await locator.waitFor({ state: 'visible' });
    const metrics = await locator.evaluate(async (element, selector) => {
    await document.fonts.ready;
    if (!element.isConnected) return null;
    let previous, stable = 0;
    for (let frame = 0; frame < 30 && stable < 2; frame++) {
      await new Promise(resolve => requestAnimationFrame(resolve));
      const current = element.getBoundingClientRect();
      if (!element.isConnected || current.width <= 0 || current.height <= 0) return null;
      const values = [current.x, current.y, current.width, current.height];
      stable = previous && values.every((n, i) => Math.abs(n - previous[i]) < .01) ? stable + 1 : 0;
      previous = values;
    }
    if (stable < 2) throw Error('Geometry did not settle: ' + (element.getAttribute('aria-label') || element.className));
    const rect = r => ({ x: r.x, y: r.y, left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height });
    if (!element.isConnected) return null;
    const box = rect(element.getBoundingClientRect()), style = getComputedStyle(element);
    const target = selector ? element.querySelector(selector) : element;
    if (!target) throw Error('Geometry text selector not found: ' + selector);
    const walker = document.createTreeWalker(target, NodeFilter.SHOW_TEXT), textRects = [];
    while (walker.nextNode()) {
      const node = walker.currentNode, parent = node.parentElement;
      if (!node.textContent.trim() || parent.closest('svg,[aria-hidden="true"]') || getComputedStyle(parent).visibility === 'hidden') continue;
      const range = document.createRange();
      range.selectNodeContents(node);
      textRects.push(...[...range.getClientRects()].filter(r => r.width > 0 && r.height > 0));
    }
    const text = textRects.length ? (() => {
      const left = Math.min(...textRects.map(r => r.left)), top = Math.min(...textRects.map(r => r.top));
      const right = Math.max(...textRects.map(r => r.right)), bottom = Math.max(...textRects.map(r => r.bottom));
      return { x: left, y: top, left, top, right, bottom, width: right - left, height: bottom - top };
    })() : null;
    const sides = prefix => Object.fromEntries(['top', 'right', 'bottom', 'left'].map(side => [side, parseFloat(style.getPropertyValue(prefix === 'border' ? 'border-' + side + '-width' : prefix + '-' + side)) || 0]));
    return { box, text, textOffset: text ? { x: (text.left + text.right - box.left - box.right) / 2, y: (text.top + text.bottom - box.top - box.bottom) / 2 } : null,
      padding: sides('padding'), margin: sides('margin'), border: sides('border'), fontSize: parseFloat(style.fontSize), lineHeight: style.lineHeight, letterSpacing: style.letterSpacing,
      textContent: target.textContent.trim(), fontFamily: style.fontFamily, boxSizing: style.boxSizing };
    }, textSelector);
    if (metrics) return metrics;
  }
  throw Error('Geometry target kept being replaced or hidden during measurement');
}

function assertCenteredText(metrics, { xTolerance = .6, yTolerance = .6, label = 'text' } = {}) {
  assert.ok(metrics.textOffset, label + ': no visible text');
  assert.ok(Math.abs(metrics.textOffset.x) <= xTolerance && Math.abs(metrics.textOffset.y) <= yTolerance,
    label + ': text is off center ' + JSON.stringify(metrics));
}

function assertTextFits(metrics, { label = 'text', tolerance = .5 } = {}) {
  assert.ok(metrics.text, label + ': no visible text');
  const { box, text, border, padding } = metrics;
  assert.ok(text.left >= box.left + border.left + padding.left - tolerance && text.right <= box.right - border.right - padding.right + tolerance &&
    text.top >= box.top + border.top + padding.top - tolerance && text.bottom <= box.bottom - border.bottom - padding.bottom + tolerance,
    label + ': text clips or consumes its inset ' + JSON.stringify(metrics));
}

function assertSameSize(a, b, { tolerance = .1, label = 'paired badges' } = {}) {
  assert.ok(Math.abs(a.box.width - b.box.width) <= tolerance && Math.abs(a.box.height - b.box.height) <= tolerance,
    label + ': inconsistent dimensions ' + JSON.stringify({ a, b }));
}

async function recordGeometry(page, name, metrics) {
  if (!process.env.SSKR_QA_OUTPUT) return;
  const realOutput = require('./ui-evidence.cjs').output();
  const run = process.env.SSKR_QA_PHASE || process.env.SSKR_QA_RUN_ID || 'geometry';
  if (!/^[a-zA-Z0-9_-]+$/.test(run)) throw Error('Invalid geometry run identifier');
  const engine = process.env.BROWSER_ENGINE || 'chromium';
  if (!['chromium','webkit'].includes(engine)) throw Error('Unknown geometry browser engine');
  const dir = path.join(realOutput, run, 'geometry', engine);
  fs.mkdirSync(dir, { recursive: true });
  const safeName = name.replace(/[^a-zA-Z0-9_-]/g, '-');
  const file = path.join(dir, safeName + '.metrics.json');
  if (fs.existsSync(file)) throw Error('Geometry evidence already exists: ' + file);
  const context = await page.evaluate(() => ({ path: location.pathname + location.search, mapView: window.__map ? { center: [__map.getCenter().lat,__map.getCenter().lng].map(n=>Number(n.toFixed(6))), zoom: __map.getZoom() } : null, locale: navigator.language, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, deviceScaleFactor: devicePixelRatio, touch: navigator.maxTouchPoints > 0, pointer: matchMedia('(pointer: coarse)').matches ? 'coarse' : 'fine', hover: matchMedia('(hover: hover)').matches, reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches, userAgent: navigator.userAgent }));
  fs.writeFileSync(file, JSON.stringify({ name, viewport: page.viewportSize(), engine, browser: page.context().browser().version(), context, metrics }, null, 2) + String.fromCharCode(10));
}

module.exports = { measureBox, assertCenteredText, assertTextFits, assertSameSize, recordGeometry };
