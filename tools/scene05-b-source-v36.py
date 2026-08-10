#!/usr/bin/env python3
from pathlib import Path

ROOT = Path.cwd()
src = ROOT / 'output' / 'scene05-b-v35.js'
out = ROOT / 'output' / 'scene05-b-v36.js'
text = src.read_text('utf-8')


def patch(old, new, label, count=1):
    global text
    n = text.count(old)
    if n < count:
        raise SystemExit(f'{label}: expected >= {count}, found {n}')
    text = text.replace(old, new, count)


# ---------------------------------------------------------------------------
# 1) Full-peninsula material continuity.
# ---------------------------------------------------------------------------
patch('./assets/peninsula_surface_v33.png', './assets/peninsula_surface_v36.png', 'v36 peninsula texture')

# ---------------------------------------------------------------------------
# 2) One coastline authority. The South-Korea-only shallow-water mask is projected
# in a different bounds space than the full-peninsula SVG mesh and can read as a
# second shoreline. Keep the shader hook but remove the visible band for this pass.
# ---------------------------------------------------------------------------
patch(
    'base=mix(base,vec3(0.030,0.205,0.285),coast*0.40*coastDay);',
    'base=mix(base,vec3(0.030,0.205,0.285),coast*0.00*coastDay);',
    'disable misregistered coastal tint'
)

# ---------------------------------------------------------------------------
# 3) Dawn -> Day -> Sunset must follow the journey, not precede it.
# ---------------------------------------------------------------------------
patch('renderer.toneMappingExposure = 1.05;', 'renderer.toneMappingExposure = .88;', 'dawn base exposure')
patch("gsap.set(skyNight, { opacity: .18 });", "gsap.set(skyNight, { opacity: .31 });", 'darker predawn sky')
patch("gsap.set(skyDawn, { opacity: .45 });", "gsap.set(skyDawn, { opacity: .64 });", 'stronger dawn sky')
patch("gsap.set(lightWash, { opacity: .05 });", "gsap.set(lightWash, { opacity: .13 });", 'directional dawn wash')
patch("if (scene.background) scene.background.setRGB(.07, .13, .16);", "if (scene.background) scene.background.setRGB(.028, .060, .088);", 'predawn background')
patch("scene.fog.color.setRGB(.12, .19, .21);", "scene.fog.color.setRGB(.065, .105, .145);", 'predawn fog color')
patch("peninsulaSurface.material.color.setRGB(.72, .78, .76);", "peninsulaSurface.material.color.setRGB(.48, .58, .64);", 'cool dawn land grade')

patch(
"""  tl.to(scene.background, { r: .10, g: .18, b: .21, duration: 3.0, ease: 'sine.inOut' }, 0)
    .to(scene.fog, { density: .0055, duration: 3.0, ease: 'sine.inOut' }, 0)
    .to(scene.fog.color, { r: .15, g: .23, b: .24, duration: 3.0 }, 0);""",
"""  tl.to(scene.background, { r: .055, g: .105, b: .145, duration: 3.0, ease: 'sine.inOut' }, 0)
    .to(scene.fog, { density: .0060, duration: 3.0, ease: 'sine.inOut' }, 0)
    .to(scene.fog.color, { r: .09, g: .145, b: .185, duration: 3.0 }, 0)
    .to(renderer, { toneMappingExposure: .90, duration: 3.0, ease: 'sine.inOut' }, 0);""",
'opening dawn progression'
)

# The horizon glow is now composited above the WebGL stage in CSS, so use lower
# opacities than the old background-only values. It should read as dawn light, not UI glow.
patch(".to(eastGlow, { opacity: .54, duration: 2.5, ease: 'sine.out' }, 3.2)", ".to(eastGlow, { opacity: .36, duration: 2.5, ease: 'sine.out' }, 3.2)", 'east dawn glow')
patch(".to(skyDawn, { opacity: .68, duration: 2.7 }, 3.0)", ".to(skyDawn, { opacity: .92, duration: 2.7 }, 3.0)", 'dawn sky before starts')

old_start_lighting = """  if (typeof peninsulaSurface !== 'undefined' && peninsulaSurface) {
    tl.to(peninsulaSurface.material.color, { r: 1.0, g: 1.0, b: 1.0, duration: 3.4, ease: 'sine.inOut' }, 5.6);
  }
  tl.to(scene.background, { r: .28, g: .43, b: .50, duration: 3.8, ease: 'sine.inOut' }, 5.2)
    .to(skyDay, { opacity: .78, duration: 3.5 }, 5.3)
    .to(skyNight, { opacity: .04, duration: 2.8 }, 5.5)
    .to(oceanUniforms.uPhase, { value: 1.0, duration: 3.4, ease: 'sine.inOut' }, 5.5)
    .to(scene.fog, { density: .0046, duration: 3.4 }, 5.5)
    .to(scene.fog.color, { r: .30, g: .40, b: .43, duration: 3.4 }, 5.5);"""
new_start_lighting = """  // Hold dawn through the Start cascade. The first riders leave under cool ambient
  // light with a warm East-Coast horizon; daylight begins only after the routes launch.
  if (typeof peninsulaSurface !== 'undefined' && peninsulaSurface) {
    tl.to(peninsulaSurface.material.color, { r: .50, g: .60, b: .65, duration: 3.2, ease: 'sine.inOut' }, 5.4);
  }
  tl.to(scene.background, { r: .075, g: .145, b: .185, duration: 3.2, ease: 'sine.inOut' }, 5.3)
    .to(skyDay, { opacity: .025, duration: 2.6 }, 6.0)
    .to(skyNight, { opacity: .14, duration: 2.8 }, 5.5)
    .to(skyDawn, { opacity: .94, duration: 2.4 }, 5.5)
    .to(eastGlow, { opacity: .38, duration: 2.0 }, 5.8)
    .to(oceanUniforms.uPhase, { value: .56, duration: 3.2, ease: 'sine.inOut' }, 5.5)
    .to(scene.fog, { density: .0058, duration: 3.2 }, 5.5)
    .to(scene.fog.color, { r: .13, g: .19, b: .23, duration: 3.2 }, 5.5)
    .to(lightWash, { opacity: .17, duration: 2.4, ease: 'sine.inOut' }, 5.6)
    .to(renderer, { toneMappingExposure: .89, duration: 3.2, ease: 'sine.inOut' }, 5.5);"""
patch(old_start_lighting, new_start_lighting, 'hold dawn through start cascade')

route_anchor = "  tweenCamera(tl, 9.0, 10.0, routeRevealPos, routeRevealTarget, 37.5, 'sine.inOut');"
route_lighting = """  // Journey light arc: morning grows into neutral day, then bends warm before Finish.
  if (typeof peninsulaSurface !== 'undefined' && peninsulaSurface) {
    tl.to(peninsulaSurface.material.color, { r: 1.0, g: 1.0, b: .98, duration: 4.8, ease: 'sine.inOut' }, 9.0)
      .to(peninsulaSurface.material.color, { r: 1.02, g: .93, b: .82, duration: 3.8, ease: 'sine.inOut' }, 15.0);
  }
  tl.to(scene.background, { r: .27, g: .42, b: .49, duration: 4.8, ease: 'sine.inOut' }, 9.0)
    .to(skyDay, { opacity: .82, duration: 4.6, ease: 'sine.inOut' }, 9.0)
    .to(skyDawn, { opacity: .08, duration: 4.2, ease: 'sine.inOut' }, 9.4)
    .to(eastGlow, { opacity: .06, duration: 4.0, ease: 'sine.inOut' }, 9.5)
    .to(oceanUniforms.uPhase, { value: 1.0, duration: 4.6, ease: 'sine.inOut' }, 9.0)
    .to(scene.fog, { density: .00445, duration: 4.5, ease: 'sine.inOut' }, 9.0)
    .to(scene.fog.color, { r: .29, g: .39, b: .42, duration: 4.5, ease: 'sine.inOut' }, 9.0)
    .to(renderer, { toneMappingExposure: 1.06, duration: 4.5, ease: 'sine.inOut' }, 9.0)
    .to(lightWash, { opacity: .055, duration: 3.8, ease: 'sine.inOut' }, 9.4)
    .to(scene.background, { r: .30, g: .34, b: .36, duration: 3.6, ease: 'sine.inOut' }, 15.1)
    .to(skySunset, { opacity: .20, duration: 3.5, ease: 'sine.inOut' }, 15.2)
    .to(skyDay, { opacity: .60, duration: 3.5, ease: 'sine.inOut' }, 15.2)
    .to(westGlow, { opacity: .12, duration: 3.4, ease: 'sine.inOut' }, 15.3)
    .to(renderer, { toneMappingExposure: 1.00, duration: 3.4, ease: 'sine.inOut' }, 15.3);

""" + route_anchor
patch(route_anchor, route_lighting, 'journey lighting arc')

old_finish_lighting = """  if (typeof peninsulaSurface !== 'undefined' && peninsulaSurface) {
    tl.to(peninsulaSurface.material.color, { r: .93, g: .73, b: .59, duration: 5.2, ease: 'sine.inOut' }, 18.7);
  }
  tl.to(scene.background, { r: .32, g: .19, b: .20, duration: 5.2, ease: 'sine.inOut' }, 18.7)
    .to(skySunset, { opacity: .92, duration: 5.0, ease: 'sine.inOut' }, 18.8)
    .to(skyDay, { opacity: .22, duration: 5.0 }, 18.8)
    .to(westGlow, { opacity: .84, duration: 4.8, ease: 'sine.out' }, 18.9)
    .to(eastGlow, { opacity: .04, duration: 3.2 }, 18.8)
    .to(oceanUniforms.uPhase, { value: 2.0, duration: 5.0, ease: 'sine.inOut' }, 18.8)
    .to(scene.fog, { density: .0061, duration: 4.8 }, 18.8)
    .to(scene.fog.color, { r: .30, g: .20, b: .20, duration: 4.8 }, 18.8);"""
new_finish_lighting = """  // Sunset begins before the last route reaches Finish so arrival already feels like evening.
  if (typeof peninsulaSurface !== 'undefined' && peninsulaSurface) {
    tl.to(peninsulaSurface.material.color, { r: .93, g: .73, b: .59, duration: 5.0, ease: 'sine.inOut' }, 16.9);
  }
  tl.to(scene.background, { r: .32, g: .19, b: .20, duration: 5.0, ease: 'sine.inOut' }, 16.9)
    .to(skySunset, { opacity: .92, duration: 4.8, ease: 'sine.inOut' }, 17.0)
    .to(skyDay, { opacity: .22, duration: 4.8 }, 17.0)
    .to(westGlow, { opacity: .46, duration: 4.7, ease: 'sine.out' }, 17.1)
    .to(eastGlow, { opacity: .02, duration: 3.0 }, 17.0)
    .to(oceanUniforms.uPhase, { value: 2.0, duration: 4.8, ease: 'sine.inOut' }, 17.0)
    .to(scene.fog, { density: .0061, duration: 4.6 }, 17.0)
    .to(scene.fog.color, { r: .30, g: .20, b: .20, duration: 4.6 }, 17.0)
    .to(lightWash, { opacity: .12, duration: 4.0, ease: 'sine.inOut' }, 17.0)
    .to(renderer, { toneMappingExposure: .92, duration: 5.0, ease: 'sine.inOut' }, 17.2);"""
patch(old_finish_lighting, new_finish_lighting, 'finish arrives in sunset')

out.write_text('// Scene 05 B v3.6 — seamless peninsula material, single coastline authority, dawn-to-day-to-sunset journey lighting.\n' + text, encoding='utf-8')
print(out)
