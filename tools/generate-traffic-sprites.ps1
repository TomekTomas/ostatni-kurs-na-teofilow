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

function Brush($hex) {
  return New-Object Drawing.SolidBrush ([Drawing.ColorTranslator]::FromHtml($hex))
}

function Rect($g, $hex, $x, $y, $w, $h) {
  $b = Brush $hex
  $g.FillRectangle($b, $x, $y, $w, $h)
  $b.Dispose()
}

function Ellipse($g, $hex, $x, $y, $w, $h) {
  $b = Brush $hex
  $g.FillEllipse($b, $x, $y, $w, $h)
  $b.Dispose()
}

function Car($file, $body, $roof) {
  New-Bitmap $file 96 42 {
    param($g)
    Rect $g "#111319" 14 31 68 5
    Rect $g $body 8 17 80 17
    Rect $g $roof 28 7 34 14
    Rect $g "#9ed6e8" 33 10 11 9
    Rect $g "#9ed6e8" 47 10 12 9
    Rect $g "#ffd15a" 84 22 4 5
    Rect $g "#ff5c5c" 8 23 4 5
    Ellipse $g "#111319" 20 27 18 18
    Ellipse $g "#111319" 60 27 18 18
    Ellipse $g "#c5c9c8" 25 32 8 8
    Ellipse $g "#c5c9c8" 65 32 8 8
  }
}

Car "car-side-green.png" "#23a239" "#11736e"
Car "car-side-cyan.png" "#16a2b8" "#0d6778"
Car "car-side-orange.png" "#d8732d" "#197e8a"

New-Bitmap "bus-side.png" 154 58 {
  param($g)
  Rect $g "#111319" 18 44 120 5
  Rect $g "#c83737" 6 15 142 30
  Rect $g "#30343a" 6 12 142 6
  Rect $g "#f2c230" 6 34 142 5
  for ($x = 18; $x -lt 118; $x += 24) {
    Rect $g "#9ed6e8" $x 19 16 12
  }
  Rect $g "#262a2f" 124 18 14 22
  Rect $g "#ffd15a" 144 25 4 6
  Ellipse $g "#111319" 30 38 20 20
  Ellipse $g "#111319" 102 38 20 20
  Ellipse $g "#c5c9c8" 36 44 8 8
  Ellipse $g "#c5c9c8" 108 44 8 8
}
