#!/usr/bin/env python3
from pathlib import Path

ROOT = Path.cwd()
path = ROOT / 'output/scene05-b-v36.js'
text = path.read_text('utf-8')


def patch(old, new, label):
    global text
    n = text.count(old)
    if n != 1:
        raise SystemExit(f'{label}: expected exactly 1 match, found {n}')
    text = text.replace(old, new, 1)


# Close the neutral daylight chapter quickly once the camera begins turning west.
patch("{ r: .30, g: .34, b: .36, duration: 3.6, ease: 'sine.inOut' }, 15.1",
      "{ r: .30, g: .34, b: .36, duration: .7, ease: 'sine.inOut' }, 15.1", 'late-day background cue')
patch("{ opacity: .20, duration: 3.5, ease: 'sine.inOut' }, 15.2",
      "{ opacity: .20, duration: .7, ease: 'sine.inOut' }, 15.2", 'late-day sunset cue')
patch("{ opacity: .60, duration: 3.5, ease: 'sine.inOut' }, 15.2",
      "{ opacity: .60, duration: .7, ease: 'sine.inOut' }, 15.2", 'late-day day fade cue')
patch("{ opacity: .12, duration: 3.4, ease: 'sine.inOut' }, 15.3",
      "{ opacity: .12, duration: .7, ease: 'sine.inOut' }, 15.3", 'late-day west cue')
patch("{ toneMappingExposure: 1.00, duration: 3.4, ease: 'sine.inOut' }, 15.3",
      "{ toneMappingExposure: .99, duration: .7, ease: 'sine.inOut' }, 15.3", 'late-day exposure cue')

# The Finish beat is 18.92s. Complete the evening transition *by* that beat instead
# of beginning it there. This keeps route travel readable in daylight while making
# arrival unmistakably sunset/evening.
patch("{ r: .93, g: .73, b: .59, duration: 5.0, ease: 'sine.inOut' }, 16.9",
      "{ r: .91, g: .68, b: .53, duration: 3.1, ease: 'sine.inOut' }, 15.8", 'finish land sunset')
patch("{ r: .32, g: .19, b: .20, duration: 5.0, ease: 'sine.inOut' }, 16.9",
      "{ r: .30, g: .17, b: .19, duration: 3.1, ease: 'sine.inOut' }, 15.8", 'finish background sunset')
patch("{ opacity: .92, duration: 4.8, ease: 'sine.inOut' }, 17.0",
      "{ opacity: .94, duration: 3.0, ease: 'sine.inOut' }, 15.9", 'finish sunset layer')
patch("{ opacity: .22, duration: 4.8 }, 17.0",
      "{ opacity: .16, duration: 3.0 }, 15.9", 'finish daylight fade')
patch("{ opacity: .46, duration: 4.7, ease: 'sine.out' }, 17.1",
      "{ opacity: .52, duration: 2.9, ease: 'sine.out' }, 16.0", 'finish west glow')
patch("{ opacity: .02, duration: 3.0 }, 17.0",
      "{ opacity: .015, duration: 2.0 }, 16.0", 'finish east fade')
patch("{ value: 2.0, duration: 4.8, ease: 'sine.inOut' }, 17.0",
      "{ value: 2.0, duration: 3.0, ease: 'sine.inOut' }, 15.9", 'finish ocean sunset')
patch("{ density: .0061, duration: 4.6 }, 17.0",
      "{ density: .0061, duration: 3.0 }, 15.9", 'finish haze')
patch("{ r: .30, g: .20, b: .20, duration: 4.6 }, 17.0",
      "{ r: .30, g: .18, b: .19, duration: 3.0 }, 15.9", 'finish haze color')
patch("{ opacity: .12, duration: 4.0, ease: 'sine.inOut' }, 17.0",
      "{ opacity: .16, duration: 3.0, ease: 'sine.inOut' }, 15.9", 'finish warm wash')
patch("{ toneMappingExposure: .92, duration: 5.0, ease: 'sine.inOut' }, 17.2",
      "{ toneMappingExposure: .90, duration: 3.1, ease: 'sine.inOut' }, 15.9", 'finish exposure')

path.write_text(text, encoding='utf-8')
print(path)
