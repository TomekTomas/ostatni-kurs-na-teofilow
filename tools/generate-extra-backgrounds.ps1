Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$out = Join-Path $root "assets\backgrounds"
New-Item -ItemType Directory -Force -Path $out | Out-Null

function New-Bitmap($name, [scriptblock]$draw) {
  $bmp = New-Object Drawing.Bitmap 1280, 440, ([Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $gfx = [Drawing.Graphics]::FromImage($bmp)
  $gfx.Clear([Drawing.Color]::FromArgb(111, 154, 184))
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

function Line($g, $hex, $width, $x1, $y1, $x2, $y2) {
  $p = New-Object Drawing.Pen ([Drawing.ColorTranslator]::FromHtml($hex)), $width
  $g.DrawLine($p, $x1, $y1, $x2, $y2)
  $p.Dispose()
}

function Sky($g) {
  for ($y = 0; $y -lt 260; $y += 4) {
    $tone = 145 + [math]::Floor($y / 10)
    Rect $g ([string]::Format("#{0:x2}{1:x2}{2:x2}", 93, [math]::Min(172, $tone), 205)) 0 $y 1280 4
  }
  Rect $g "#d7e4df" 80 62 140 18
  Rect $g "#e9f0ea" 130 46 190 24
  Rect $g "#c9dad8" 790 70 180 20
  Rect $g "#e9f0ea" 840 54 220 22
}

function RoadAndTrack($g) {
  Rect $g "#29333c" 0 310 1280 70
  Rect $g "#3d4e5d" 0 286 1280 24
  Rect $g "#23282d" 0 380 1280 60
  for ($x = 0; $x -lt 1280; $x += 62) {
    Rect $g "#cfd6d4" $x 398 38 3
    Line $g "#919999" 2 $x 418 ($x + 42) 438
  }
  Line $g "#c6c9c7" 4 0 382 1280 382
  Line $g "#6e7478" 3 0 414 1280 414
}

function Block($g, $x, $y, $w, $h, $body, $roof) {
  Rect $g $body $x $y $w $h
  Rect $g $roof ($x - 4) ($y - 8) ($w + 8) 10
  for ($wx = $x + 14; $wx -lt $x + $w - 16; $wx += 34) {
    for ($wy = $y + 18; $wy -lt $y + $h - 18; $wy += 28) {
      Rect $g "#27313a" $wx $wy 18 14
      Rect $g "#f0d27b" ($wx + 2) ($wy + 2) 5 10
    }
  }
  Rect $g "#59636a" ($x + 8) ($y + $h - 20) 26 20
}

function Lamps($g) {
  for ($x = 70; $x -lt 1280; $x += 165) {
    Rect $g "#1b2228" $x 210 7 100
    Line $g "#1b2228" 5 ($x + 2) 218 ($x + 58) 206
    Rect $g "#f4d35e" ($x + 56) 202 18 12
  }
}

New-Bitmap "bg-zarzew-bloki.png" {
  param($g)
  Sky $g
  Rect $g "#6f7b74" 0 260 1280 50
  Block $g 40 130 150 150 "#9b9b8f" "#686b6f"
  Block $g 218 108 190 172 "#b7b1a5" "#6d7378"
  Block $g 448 142 142 138 "#989f98" "#666b70"
  Block $g 642 118 210 162 "#b6aa98" "#626b70"
  Block $g 910 134 160 146 "#a49f91" "#5f676c"
  Block $g 1100 110 150 170 "#b9b4a5" "#656d72"
  Lamps $g
  RoadAndTrack $g
}

New-Bitmap "bg-widzew-wschod.png" {
  param($g)
  Sky $g
  Rect $g "#4b6f55" 0 246 1280 64
  for ($x = 20; $x -lt 1280; $x += 120) {
    Rect $g "#315037" $x 218 54 92
    Rect $g "#243b2a" ($x + 34) 194 42 116
  }
  Block $g 95 96 185 184 "#c0b6a3" "#62696e"
  Block $g 330 74 210 206 "#aeb4ab" "#5d656a"
  Block $g 590 112 150 168 "#c3baa6" "#687076"
  Block $g 805 86 220 194 "#b0aaa0" "#5c646b"
  Block $g 1080 118 150 162 "#c8b99e" "#616970"
  Lamps $g
  RoadAndTrack $g
}

New-Bitmap "bg-rokicinska.png" {
  param($g)
  Sky $g
  Rect $g "#5d696e" 0 244 1280 66
  Rect $g "#7c342c" 70 136 240 132
  Rect $g "#9a4a32" 360 118 210 150
  Rect $g "#6b3030" 662 148 170 120
  Rect $g "#b8a389" 902 126 230 142
  for ($x = 90; $x -lt 1130; $x += 62) {
    Rect $g "#202832" $x 158 28 32
    Rect $g "#202832" $x 208 28 32
  }
  Rect $g "#9ba2a6" 1160 78 62 190
  Rect $g "#f4d35e" 1180 100 22 58
  Lamps $g
  RoadAndTrack $g
}
