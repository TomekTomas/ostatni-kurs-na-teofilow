# Audio assets

Recommended format for tram ride loops:

- `konstal_ride_loop.ogg`
- `pesa_ride_loop.ogg`
- optional fallback: `konstal_ride_loop.mp3`, `pesa_ride_loop.mp3`

Export settings:

- OGG Vorbis, 44.1 kHz, stereo or mono, quality 4-6.
- Loop length: 8-20 seconds.
- Trim cleanly so the beginning and end connect without a click.
- Normalize around -14 LUFS or keep peaks below -3 dB.

Use separate short one-shot sounds later if available:

- `bell.ogg`
- `doors_open.ogg`
- `doors_close.ogg`
- `brake_squeal.ogg`

Optional Widzew Stadion music:

- `taniec-eleny.ogg`
- optional fallback: `taniec-eleny.mp3`

Place a legally licensed local copy in this folder. The game fades it in shortly
before `Widzew Stadion`, keeps it under the normal ride loop volume, and fades it
out shortly after the stop.

The game currently uses generated WebAudio cues. Real ride loops can be wired into
Phaser preload after the files are placed here.
