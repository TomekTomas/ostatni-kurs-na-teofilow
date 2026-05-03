param(
  [string]$SheetPath = "assets\generated\traffic-sprite-sheet-v2.png"
)

Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$sheetFull = Join-Path $root $SheetPath
$out = Join-Path $root "assets\sprites"
New-Item -ItemType Directory -Force -Path $out | Out-Null

function Crop-Sprite($sheet, $name, $x, $y, $w, $h, $scale = 1.0) {
  $pad = 10
  $targetW = [math]::Round($w * $scale)
  $targetH = [math]::Round($h * $scale)
  $crop = New-Object Drawing.Bitmap $targetW, $targetH, ([Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $gfx = [Drawing.Graphics]::FromImage($crop)
  $gfx.InterpolationMode = [Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
  $gfx.SmoothingMode = [Drawing.Drawing2D.SmoothingMode]::None
  $gfx.Clear([Drawing.Color]::Transparent)
  $gfx.DrawImage($sheet, [Drawing.Rectangle]::new(0, 0, $targetW, $targetH), [Drawing.Rectangle]::new($x, $y, $w, $h), [Drawing.GraphicsUnit]::Pixel)
  $gfx.Dispose()

  Remove-EdgeBackground $crop
  $dest = New-Object Drawing.Bitmap ($targetW + $pad * 2), ($targetH + $pad * 2), ([Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $gfx = [Drawing.Graphics]::FromImage($dest)
  $gfx.InterpolationMode = [Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
  $gfx.SmoothingMode = [Drawing.Drawing2D.SmoothingMode]::None
  $gfx.Clear([Drawing.Color]::Transparent)
  $gfx.DrawImage($crop, $pad, $pad, $targetW, $targetH)
  $gfx.Dispose()
  $crop.Dispose()

  $path = Join-Path $out $name
  $dest.Save($path, [Drawing.Imaging.ImageFormat]::Png)
  $dest.Dispose()
}

function Similar($a, $b, $tol) {
  return ([math]::Abs($a.R - $b.R) -le $tol -and [math]::Abs($a.G - $b.G) -le $tol -and [math]::Abs($a.B - $b.B) -le $tol)
}

function Remove-EdgeBackground($bmp) {
  $w = $bmp.Width
  $h = $bmp.Height
  $seen = New-Object 'bool[,]' $w, $h
  $queue = New-Object System.Collections.Generic.Queue[string]
  $samples = @($bmp.GetPixel(0, 0), $bmp.GetPixel($w - 1, 0), $bmp.GetPixel(0, $h - 1), $bmp.GetPixel($w - 1, $h - 1))

  foreach ($p in @("0,0", "$($w - 1),0", "0,$($h - 1)", "$($w - 1),$($h - 1)")) {
    $queue.Enqueue($p)
  }

  while ($queue.Count -gt 0) {
    $parts = $queue.Dequeue().Split(",")
    $x = [int]$parts[0]
    $y = [int]$parts[1]
    if ($x -lt 0 -or $y -lt 0 -or $x -ge $w -or $y -ge $h -or $seen[$x,$y]) { continue }
    $c = $bmp.GetPixel($x, $y)
    $isBg = $false
    foreach ($s in $samples) {
      if (Similar $c $s 38) { $isBg = $true; break }
    }
    if (-not $isBg) { continue }
    $seen[$x,$y] = $true
    $bmp.SetPixel($x, $y, [Drawing.Color]::FromArgb(0, $c.R, $c.G, $c.B))
    $queue.Enqueue("$($x + 1),$y")
    $queue.Enqueue("$($x - 1),$y")
    $queue.Enqueue("$x,$($y + 1)")
    $queue.Enqueue("$x,$($y - 1)")
  }
}

$sheet = [Drawing.Bitmap]::FromFile($sheetFull)

Crop-Sprite $sheet "car-side-green.png" 80 70 285 135 0.55
Crop-Sprite $sheet "car-side-cyan.png" 400 70 315 135 0.55
Crop-Sprite $sheet "car-side-orange.png" 735 68 330 135 0.55
Crop-Sprite $sheet "van-side-white.png" 1120 52 390 165 0.52
Crop-Sprite $sheet "bus-side.png" 66 270 585 180 0.45
Crop-Sprite $sheet "bus-articulated-side.png" 690 260 910 190 0.43
Crop-Sprite $sheet "maintenance-van-side.png" 300 505 300 170 0.5
Crop-Sprite $sheet "roadworks-truck-side.png" 675 490 600 190 0.45
Crop-Sprite $sheet "cyclist-side.png" 165 690 190 190 0.5
Crop-Sprite $sheet "pedestrian-side-a.png" 440 690 135 190 0.42
Crop-Sprite $sheet "pedestrian-side-b.png" 620 690 135 190 0.42
Crop-Sprite $sheet "pedestrian-side-c.png" 800 690 135 190 0.42

$sheet.Dispose()
