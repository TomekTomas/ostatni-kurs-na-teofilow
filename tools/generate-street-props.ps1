Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$out = Join-Path $root "assets\sprites"
New-Item -ItemType Directory -Force -Path $out | Out-Null

function New-Bitmap($name, $w, $h, [scriptblock]$draw) {
  $bmp = New-Object Drawing.Bitmap $w, $h, ([Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $gfx = [Drawing.Graphics]::FromImage($bmp)
  $gfx.Clear([Drawing.Color]::Transparent)
  $gfx.SmoothingMode = [Drawing.Drawing2D.SmoothingMode]::None
  $gfx.InterpolationMode = [Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
  & $draw $gfx
  $path = Join-Path $out $name
  $bmp.Save($path, [Drawing.Imaging.ImageFormat]::Png)
  $gfx.Dispose()
  $bmp.Dispose()
}

function Brush($hex) { return New-Object Drawing.SolidBrush ([Drawing.ColorTranslator]::FromHtml($hex)) }
function Rect($g, $hex, $x, $y, $w, $h) { $b=Brush $hex; $g.FillRectangle($b,$x,$y,$w,$h); $b.Dispose() }
function Ellipse($g, $hex, $x, $y, $w, $h) { $b=Brush $hex; $g.FillEllipse($b,$x,$y,$w,$h); $b.Dispose() }
function Line($g, $hex, $width, $x1, $y1, $x2, $y2) { $p=New-Object Drawing.Pen ([Drawing.ColorTranslator]::FromHtml($hex)), $width; $g.DrawLine($p,$x1,$y1,$x2,$y2); $p.Dispose() }

New-Bitmap "prop-tree.png" 92 150 {
  param($g)
  Rect $g "#5d3924" 41 76 12 58
  Line $g "#3f281b" 5 47 84 30 116
  Line $g "#3f281b" 5 48 88 66 116
  Ellipse $g "#244f32" 14 18 52 58
  Ellipse $g "#2f6b40" 30 4 50 64
  Ellipse $g "#1f422c" 38 46 42 54
  Rect $g "#18251f" 28 134 38 5
}

New-Bitmap "prop-lamp.png" 52 156 {
  param($g)
  Rect $g "#1a2228" 23 42 7 96
  Rect $g "#111319" 18 136 18 8
  Line $g "#1a2228" 5 26 45 44 32
  Rect $g "#f4d35e" 42 27 9 8
  Rect $g "#7c6f43" 39 35 14 5
}

New-Bitmap "prop-pole.png" 34 134 {
  param($g)
  Rect $g "#202832" 14 10 6 112
  Rect $g "#111319" 10 122 14 6
  Line $g "#111319" 3 17 18 2 42
  Line $g "#111319" 3 17 18 32 42
}

New-Bitmap "prop-bin.png" 34 44 {
  param($g)
  Rect $g "#111319" 8 9 18 29
  Rect $g "#2f5e5a" 10 12 14 24
  Rect $g "#c9d0ce" 7 6 20 5
}

New-Bitmap "prop-bollard.png" 24 34 {
  param($g)
  Rect $g "#182028" 8 8 8 22
  Rect $g "#f4d35e" 7 6 10 5
  Rect $g "#111319" 5 29 14 4
}
