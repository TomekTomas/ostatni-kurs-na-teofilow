Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$out = Join-Path $root "assets\ui"
New-Item -ItemType Directory -Force -Path $out | Out-Null

function New-Bitmap($name, $w, $h, [scriptblock]$draw) {
  $bmp = New-Object Drawing.Bitmap $w, $h, ([Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $gfx = [Drawing.Graphics]::FromImage($bmp)
  $gfx.Clear([Drawing.Color]::Transparent)
  $gfx.SmoothingMode = [Drawing.Drawing2D.SmoothingMode]::None
  $gfx.InterpolationMode = [Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
  $gfx.PixelOffsetMode = [Drawing.Drawing2D.PixelOffsetMode]::Half
  & $draw $gfx $w $h
  $path = Join-Path $out $name
  $bmp.Save($path, [Drawing.Imaging.ImageFormat]::Png)
  $gfx.Dispose()
  $bmp.Dispose()
}

function Brush($hex) {
  return New-Object Drawing.SolidBrush ([Drawing.ColorTranslator]::FromHtml($hex))
}

function PenPx($hex, $width) {
  return New-Object Drawing.Pen ([Drawing.ColorTranslator]::FromHtml($hex)), $width
}

function Rect($g, $hex, $x, $y, $w, $h) {
  $b = Brush $hex
  $g.FillRectangle($b, $x, $y, $w, $h)
  $b.Dispose()
}

function StrokeRect($g, $hex, $x, $y, $w, $h, $thick) {
  $p = New-Object Drawing.Pen ([Drawing.ColorTranslator]::FromHtml($hex)), $thick
  $g.DrawRectangle($p, $x, $y, $w, $h)
  $p.Dispose()
}

function PixelButton($file, $fill, $edge, $shine) {
  New-Bitmap $file 260 74 {
    param($g, $w, $h)
    Rect $g "#0b0d10" 4 6 ($w - 8) ($h - 8)
    Rect $g $fill 8 8 ($w - 16) ($h - 18)
    Rect $g "#11161c" 8 ($h - 20) ($w - 16) 10
    Rect $g $shine 14 14 ($w - 28) 7
    StrokeRect $g $edge 8 8 ($w - 16) ($h - 18) 3
    Rect $g "#f4efe4" 18 24 8 8
    Rect $g "#f4efe4" ($w - 28) 24 8 8
  }
}

PixelButton "button-primary.png" "#d7a323" "#f4efe4" "#f4d35e"
PixelButton "button-secondary.png" "#2f3f48" "#8ea0a8" "#5d7480"
PixelButton "button-selected.png" "#4a3720" "#f4d35e" "#8a6832"
PixelButton "button-danger.png" "#833138" "#f4efe4" "#c75a5f"

New-Bitmap "button-small.png" 132 54 {
  param($g, $w, $h)
  Rect $g "#080a0c" 3 4 ($w - 6) ($h - 7)
  Rect $g "#2f3f48" 6 7 ($w - 12) ($h - 16)
  Rect $g "#11161c" 6 ($h - 15) ($w - 12) 7
  Rect $g "#5d7480" 11 12 ($w - 22) 5
  StrokeRect $g "#8ea0a8" 6 7 ($w - 12) ($h - 16) 2
}

New-Bitmap "panel-hud.png" 420 112 {
  param($g, $w, $h)
  Rect $g "#070808" 0 0 $w $h
  Rect $g "#111820" 4 4 ($w - 8) ($h - 8)
  Rect $g "#070808" 8 8 ($w - 16) ($h - 16)
  StrokeRect $g "#f4d35e" 4 4 ($w - 8) ($h - 8) 2
  StrokeRect $g "#3c4650" 10 10 ($w - 20) ($h - 20) 1
}

New-Bitmap "panel-dark.png" 360 96 {
  param($g, $w, $h)
  Rect $g "#070808" 0 0 $w $h
  Rect $g "#111820" 4 4 ($w - 8) ($h - 8)
  StrokeRect $g "#5e6870" 4 4 ($w - 8) ($h - 8) 2
  Rect $g "#1f2931" 10 10 ($w - 20) 6
}

New-Bitmap "route-pin.png" 22 34 {
  param($g, $w, $h)
  Rect $g "#111319" 8 16 6 16
  Rect $g "#f4d35e" 5 4 12 12
  StrokeRect $g "#111319" 4 3 14 14 2
}

New-Bitmap "warning-icon.png" 42 36 {
  param($g, $w, $h)
  $p = New-Object Drawing.Pen ([Drawing.ColorTranslator]::FromHtml("#111319")), 3
  $b = Brush "#f4d35e"
  $points = [Drawing.Point[]]@(
    [Drawing.Point]::new(21, 3),
    [Drawing.Point]::new(38, 32),
    [Drawing.Point]::new(4, 32)
  )
  $g.FillPolygon($b, $points)
  $g.DrawPolygon($p, $points)
  $b.Dispose()
  $p.Dispose()
  Rect $g "#111319" 19 12 4 12
  Rect $g "#111319" 19 27 4 3
}

New-Bitmap "logo-plaque.png" 580 120 {
  param($g, $w, $h)
  Rect $g "#070808" 0 0 $w $h
  Rect $g "#17110b" 8 8 ($w - 16) ($h - 16)
  StrokeRect $g "#f4d35e" 8 8 ($w - 16) ($h - 16) 4
  StrokeRect $g "#f4efe4" 16 16 ($w - 32) ($h - 32) 2
  Rect $g "#2f2110" 24 24 ($w - 48) 12
}

New-Bitmap "title-plaque.png" 760 132 {
  param($g, $w, $h)
  Rect $g "#050607" 0 0 $w $h
  Rect $g "#141a20" 8 8 ($w - 16) ($h - 16)
  Rect $g "#0a0d10" 18 18 ($w - 36) ($h - 36)
  StrokeRect $g "#f4d35e" 8 8 ($w - 16) ($h - 16) 4
  StrokeRect $g "#f4efe4" 20 20 ($w - 40) ($h - 40) 2
  Rect $g "#342510" 28 28 ($w - 56) 12
  Rect $g "#ffb22e" 42 42 8 8
  Rect $g "#ffb22e" ($w - 50) 42 8 8
}

New-Bitmap "stop-card.png" 310 70 {
  param($g, $w, $h)
  Rect $g "#080a0c" 0 0 $w $h
  Rect $g "#101820" 4 4 ($w - 8) ($h - 8)
  StrokeRect $g "#f4d35e" 4 4 ($w - 8) ($h - 8) 2
  Rect $g "#f4d35e" 14 ($h - 14) ($w - 28) 4
}

New-Bitmap "pause-panel.png" 520 260 {
  param($g, $w, $h)
  Rect $g "#050607" 0 0 $w $h
  Rect $g "#101820" 8 8 ($w - 16) ($h - 16)
  StrokeRect $g "#f4d35e" 8 8 ($w - 16) ($h - 16) 4
  StrokeRect $g "#3c4650" 20 20 ($w - 40) ($h - 40) 2
  Rect $g "#1f2931" 30 30 ($w - 60) 10
}

New-Bitmap "mini-map-panel.png" 920 56 {
  param($g, $w, $h)
  Rect $g "#080a0c" 0 0 $w $h
  Rect $g "#151b20" 4 4 ($w - 8) ($h - 8)
  StrokeRect $g "#5e6870" 4 4 ($w - 8) ($h - 8) 2
  Rect $g "#2b343a" 18 25 ($w - 36) 5
}
