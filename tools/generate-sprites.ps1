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
  $gfx.PixelOffsetMode = [Drawing.Drawing2D.PixelOffsetMode]::Half
  & $draw $gfx
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

function Ellipse($g, $hex, $x, $y, $w, $h) {
  $b = Brush $hex
  $g.FillEllipse($b, $x, $y, $w, $h)
  $b.Dispose()
}

function Line($g, $hex, $width, $x1, $y1, $x2, $y2) {
  $p = New-Object Drawing.Pen ([Drawing.ColorTranslator]::FromHtml($hex)), $width
  $g.DrawLine($p, $x1, $y1, $x2, $y2)
  $p.Dispose()
}

function Tram($file, $body, $stripe, $modern) {
  New-Bitmap $file 270 124 {
    param($g)
    Rect $g "#2a2e35" 20 82 220 8
    Rect $g "#111319" 32 104 64 8
    Rect $g "#111319" 174 104 64 8
    Rect $g $body 8 24 252 70
    Rect $g "#8b2d2b" 8 82 252 14
    if ($modern) {
      Rect $g $stripe 20 76 228 7
      Rect $g "#e9f7ff" 28 34 34 24
      Rect $g "#e9f7ff" 70 34 34 24
      Rect $g "#e9f7ff" 112 34 34 24
      Rect $g "#e9f7ff" 154 34 34 24
      Rect $g "#e9f7ff" 208 38 32 22
      Rect $g "#1e5f88" 248 48 8 30
    } else {
      Rect $g $stripe 10 74 248 8
      Rect $g "#202a34" 24 36 30 26
      Rect $g "#202a34" 65 36 30 26
      Rect $g "#202a34" 106 36 30 26
      Rect $g "#202a34" 147 36 30 26
      Rect $g "#202a34" 206 38 32 24
      Rect $g "#f4efe4" 242 50 10 22
    }
    Line $g "#3b4148" 4 80 24 122 4
    Line $g "#3b4148" 4 122 4 170 24
    Ellipse $g "#111319" 44 92 34 34
    Ellipse $g "#111319" 192 92 34 34
    Ellipse $g "#8f9696" 55 103 12 12
    Ellipse $g "#8f9696" 203 103 12 12
  }
}

Tram "tram-konstal.png" "#d64b3f" "#f4d35e" $false
Tram "tram-pesa.png" "#2e8fcc" "#f4efe4" $true

New-Bitmap "track.png" 640 96 {
  param($g)
  Rect $g "#2c3139" 0 0 640 96
  Rect $g "#3a414d" 0 70 640 26
  Line $g "#9aa09d" 4 0 54 640 54
  Line $g "#9aa09d" 4 0 80 640 80
  for ($x = 0; $x -lt 640; $x += 34) {
    Line $g "#59616a" 2 $x 50 ($x + 18) 84
  }
}

New-Bitmap "pothole.png" 104 44 {
  param($g)
  Ellipse $g "#23272e" 0 2 104 38
  Ellipse $g "#111319" 20 11 66 19
  Ellipse $g "#3c4650" 26 13 42 10
}

New-Bitmap "car.png" 118 64 {
  param($g)
  Rect $g "#45505b" 0 22 118 28
  Rect $g "#6a7886" 16 14 70 18
  Rect $g "#7bdff2" 28 8 42 18
  Rect $g "#f4efe4" 88 25 20 11
  Ellipse $g "#111319" 14 43 22 22
  Ellipse $g "#111319" 82 43 22 22
}

New-Bitmap "powerline.png" 120 34 {
  param($g)
  Line $g "#f2f4f3" 6 0 6 120 6
  Line $g "#f4d35e" 5 12 26 44 6
  Line $g "#f4d35e" 5 78 6 108 26
}

New-Bitmap "passenger.png" 14 34 {
  param($g)
  Ellipse $g "#f4efe4" 0 0 14 14
  Rect $g "#263238" 3 14 8 18
}

function Passenger($file, $hair, $skin, $top, $pants) {
  New-Bitmap $file 12 28 {
    param($g)
    Rect $g "#15191f" 2 25 3 3
    Rect $g "#15191f" 7 25 3 3
    Rect $g $pants 3 17 2 8
    Rect $g $pants 7 17 2 8
    Rect $g $top 2 10 8 9
    Rect $g $skin 3 4 6 6
    Rect $g $hair 2 2 8 4
    Rect $g $hair 1 5 2 4
    Rect $g "#f4efe4" 3 11 1 5
    Rect $g "#f4efe4" 8 11 1 5
  }
}

Passenger "passenger-a.png" "#3a241a" "#f0c29a" "#b8464a" "#24364a"
Passenger "passenger-b.png" "#d6b15f" "#f1c8a1" "#516f42" "#2c2c38"
Passenger "passenger-c.png" "#1e1b1b" "#c98d6c" "#315d8c" "#1d2630"
Passenger "passenger-d.png" "#6b4938" "#e0a87d" "#c9a441" "#553c63"
Passenger "passenger-e.png" "#2b2d33" "#d7a37c" "#7b485c" "#33453d"

New-Bitmap "manufaktura.png" 320 190 {
  param($g)
  Rect $g "#5b3328" 0 0 320 190
  for ($y = 18; $y -lt 180; $y += 28) {
    $start = if ((($y / 28) % 2) -eq 0) { 0 } else { -28 }
    for ($x = $start; $x -lt 320; $x += 58) {
      Rect $g "#6c4031" $x $y 50 12
    }
  }
  for ($x = 28; $x -lt 310; $x += 68) {
    Rect $g "#272a30" $x 38 34 54
    Rect $g "#ffcf72" ($x + 4) 42 26 42
  }
}

New-Bitmap "unicorn.png" 260 168 {
  param($g)
  Rect $g "#22252d" 0 0 260 168
  Line $g "#f4d35e" 5 28 138 28 18
  Line $g "#f4d35e" 5 70 138 70 18
  Line $g "#ff5c8a" 5 78 138 78 18
  Line $g "#ff5c8a" 5 120 138 120 18
  Line $g "#50d2c2" 5 128 138 128 18
  Line $g "#50d2c2" 5 170 138 170 18
  Line $g "#f4efe4" 5 178 138 178 18
  Line $g "#f4efe4" 5 220 138 220 18
  Rect $g "#313642" 0 138 260 30
}

New-Bitmap "plac.png" 220 150 {
  param($g)
  Rect $g "#363b42" 0 0 220 150
  Rect $g "#c7a768" 86 10 48 108
  Ellipse $g "#e7dbc7" 76 8 68 68
  Rect $g "#272a30" 16 118 188 32
}
