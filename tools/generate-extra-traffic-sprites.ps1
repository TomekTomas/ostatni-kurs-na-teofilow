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

function Polygon($g, $hex, $points) {
  $b = Brush $hex
  $g.FillPolygon($b, $points)
  $b.Dispose()
}

function Draw-Wheel($g, $x, $y) {
  Ellipse $g "#10131a" ($x - 11) ($y - 11) 22 22
  Ellipse $g "#2f3840" ($x - 7) ($y - 7) 14 14
  Ellipse $g "#d6dde2" ($x - 3) ($y - 3) 6 6
}

function Draw-Car($name, $body, $roof, $accent, $label = "") {
  New-Bitmap $name 178 78 {
    param($g)
    Rect $g "#0c1116" 22 59 126 5
    Polygon $g $body ([Drawing.Point[]]@(
      [Drawing.Point]::new(14, 43),
      [Drawing.Point]::new(26, 29),
      [Drawing.Point]::new(62, 24),
      [Drawing.Point]::new(118, 26),
      [Drawing.Point]::new(152, 40),
      [Drawing.Point]::new(162, 52),
      [Drawing.Point]::new(154, 58),
      [Drawing.Point]::new(18, 58)
    ))
    Polygon $g $roof ([Drawing.Point[]]@(
      [Drawing.Point]::new(54, 25),
      [Drawing.Point]::new(78, 12),
      [Drawing.Point]::new(116, 15),
      [Drawing.Point]::new(130, 30),
      [Drawing.Point]::new(62, 30)
    ))
    Rect $g "#9ed6e8" 66 18 22 12
    Rect $g "#9ed6e8" 93 18 24 12
    Rect $g $accent 24 45 126 5
    Rect $g "#ffd15a" 156 45 5 5
    Rect $g "#ff5c5c" 14 46 5 5
    Draw-Wheel $g 46 58
    Draw-Wheel $g 128 58
    if ($label.Length -gt 0) {
      $font = New-Object Drawing.Font("Arial", 9, [Drawing.FontStyle]::Bold)
      $brush = Brush "#10131a"
      $g.DrawString($label, $font, $brush, 68, 38)
      $brush.Dispose()
      $font.Dispose()
    }
  }
}

Draw-Car "car-side-red.png" "#c7323b" "#7f1e2b" "#f4d35e"
Draw-Car "compact-side-silver.png" "#cbd2d8" "#59656f" "#50d2c2"
Draw-Car "taxi-side-yellow.png" "#f0b22a" "#9a5b18" "#10131a" "TAXI"
Draw-Car "police-side-blue.png" "#ffffff" "#235a9b" "#235a9b" "POLICJA"

New-Bitmap "delivery-van-blue.png" 218 88 {
  param($g)
  Rect $g "#0c1116" 28 68 152 6
  Rect $g "#2364a5" 22 30 118 36
  Rect $g "#1b4a78" 36 22 74 12
  Rect $g "#e8f5ff" 118 28 44 36
  Rect $g "#9ed6e8" 127 34 20 14
  Rect $g "#50d2c2" 42 42 62 7
  Rect $g "#f4d35e" 194 49 5 6
  Rect $g "#ff5c5c" 22 52 5 6
  Draw-Wheel $g 58 68
  Draw-Wheel $g 158 68
}

New-Bitmap "scooter-side.png" 108 70 {
  param($g)
  Ellipse $g "#10131a" 20 47 18 18
  Ellipse $g "#10131a" 70 47 18 18
  Rect $g "#d8732d" 35 42 44 8
  Rect $g "#f4d35e" 48 34 28 8
  Rect $g "#26323a" 72 24 4 20
  Rect $g "#111319" 55 25 10 14
  Rect $g "#2d3a42" 57 14 9 12
  Rect $g "#d9d3c4" 58 8 8 8
}

New-Bitmap "prop-ticket-machine.png" 42 74 {
  param($g)
  Rect $g "#10131a" 8 65 26 5
  Rect $g "#033968" 10 12 22 54
  Rect $g "#33b54b" 13 17 16 8
  Rect $g "#e8f5ff" 14 30 14 12
  Rect $g "#ffb22e" 14 48 14 5
}

New-Bitmap "prop-news-kiosk.png" 88 98 {
  param($g)
  Rect $g "#10131a" 7 86 74 7
  Rect $g "#26323a" 14 35 60 52
  Rect $g "#033968" 10 28 68 12
  Rect $g "#ffb22e" 17 46 18 24
  Rect $g "#ffffff" 41 46 24 16
  Rect $g "#33b54b" 42 66 20 8
  Polygon $g "#10131a" ([Drawing.Point[]]@(
    [Drawing.Point]::new(8, 28),
    [Drawing.Point]::new(44, 12),
    [Drawing.Point]::new(80, 28)
  ))
}

New-Bitmap "prop-ad-column.png" 56 112 {
  param($g)
  Ellipse $g "#10131a" 9 95 38 10
  Rect $g "#26323a" 16 24 24 72
  Ellipse $g "#4b5961" 16 18 24 10
  Ellipse $g "#10131a" 16 90 24 10
  Rect $g "#ffb22e" 19 34 18 10
  Rect $g "#033968" 19 50 18 13
  Rect $g "#33b54b" 19 69 18 9
}
