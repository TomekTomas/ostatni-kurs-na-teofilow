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

The game currently uses generated WebAudio cues. Real ride loops can be wired into
Phaser preload after the files are placed here.
