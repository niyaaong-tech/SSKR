#!/usr/bin/env python3
from __future__ import annotations

import json
import math
from pathlib import Path

import numpy as np

ROOT = Path.cwd()
DATA = ROOT / 'output' / 'scene05_final_v1' / 'scene05_final_data_v1.json'


def resample(points, n=240):
    p = np.asarray(points, dtype=np.float64)
    if len(p) < 2:
        return p
    d = np.linalg.norm(np.diff(p[:, [0, 2]], axis=0), axis=1)
    s = np.concatenate([[0.0], np.cumsum(d)])
    if s[-1] <= 1e-8:
        return np.repeat(p[:1], n, axis=0)
    t = np.linspace(0.0, s[-1], n)
    out = np.empty((n, 3), dtype=np.float64)
    for k in range(3):
        out[:, k] = np.interp(t, s, p[:, k])
    return out


def smoothstep(a, b, x):
    t = np.clip((x-a)/max(b-a, 1e-9), 0.0, 1.0)
    return t*t*(3.0-2.0*t)


def choice_variant(a, b, strength, phase, n=240):
    pa = resample(a, n)
    pb = resample(b, n)
    t = np.linspace(0.0, 1.0, n)
    # Preserve exact Start and Finish corridors; freedom appears in the crossing itself.
    enter = smoothstep(.10, .28, t)
    exit_ = 1.0 - smoothstep(.72, .93, t)
    envelope = enter * exit_
    wav = 0.78 + 0.22*np.sin(t*math.pi*2.0 + phase)
    w = np.clip(strength*envelope*wav, 0.0, .42)
    out = pa*(1.0-w[:, None]) + pb*w[:, None]
    # Keep presentation graphics slightly above the land plane / relief.
    out[:, 1] = np.maximum(pa[:, 1], pb[:, 1]) + .018
    out[0] = pa[0]
    out[-1] = pa[-1]
    return out


def main():
    data = json.loads(DATA.read_text('utf-8'))
    routes = data.get('main_routes', [])
    if len(routes) < 3:
        raise SystemExit('not enough main routes to derive choice routes')

    choices = []
    # Each main route gets two alternative corridor variants toward neighboring
    # real-road-grounded routes. These are presentation choices, not navigation output.
    for i, r in enumerate(routes):
        neighbors = [routes[(i+1) % len(routes)], routes[(i-1) % len(routes)]]
        for j, nb in enumerate(neighbors):
            pts = choice_variant(r['points'], nb['points'], strength=.20 + .035*j, phase=.9*i + 1.4*j)
            choices.append({
                'id': f"choice_{r['start_id']}_{j+1}",
                'start_id': r['start_id'],
                'source_route_ids': [r['id'], nb['id']],
                'role': 'cinematic_rider_choice_not_navigation',
                'points': pts.round(6).tolist(),
            })

    data['schema_version'] = '1.5-v25-choice'
    data['choice_routes'] = choices
    data.setdefault('policy', []).extend([
        'Choice Routes are cinematic rider-choice visualizations derived between real-road-grounded Main Route corridors; they are not official courses or navigation recommendations.',
        'Road Hint remains the real major-road possibility layer and should stay visually subordinate to rider journeys.'
    ])
    DATA.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps({'main_routes': len(routes), 'choice_routes': len(choices), 'road_hints': len(data.get('road_hints', []))}, indent=2))


if __name__ == '__main__':
    main()
