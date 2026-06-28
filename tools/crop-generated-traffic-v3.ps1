param(
  [string]$SheetPath = "assets\generated\traffic-sprite-sheet-v3.png"
)

Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$sheetFull = Join-Path $root $SheetPath
$out = Join-Path $root "assets\sprites"
New-Item -ItemType Directory -Force -Path $out | Out-Null

function Similar($a, $b, $tol) {
  return ([math]::Abs($a.R - $b.R) -le $tol -and [math]::Abs($a.G - $b.G) -le $tol -and [math]::Abs($a.B - $b.B) -le $tol)
}

function Remove-EdgeBackground($bmp) {
  $w = $bmp.Width
  $h = $bmp.Height
  $seen = New-Object 'bool[,]' $w, $h
  $queue = New-Object System.Collections.Generic.Queue[string]
  $samples = @(
    $bmp.GetPixel(0, 0),
    $bmp.GetPixel($w - 1, 0),
    $bmp.GetPixel(0, $h - 1),
    $bmp.GetPixel($w - 1, $h - 1)
  )

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
      if (Similar $c $s 68) { $isBg = $true; break }
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

function Remove-ChromaSpill($bmp) {
  for ($pass = 0; $pass -lt 2; $pass++) {
    $remove = New-Object System.Collections.Generic.List[string]
    for ($y = 0; $y -lt $bmp.Height; $y++) {
      for ($x = 0; $x -lt $bmp.Width; $x++) {
        $c = $bmp.GetPixel($x, $y)
        if ($c.A -eq 0) { continue }
        $dominance = $c.G - [math]::Max($c.R, $c.B)
        $isNeon = $c.G -gt 190 -and $c.R -lt 95 -and $c.B -lt 95 -and $dominance -gt 115
        $isEdgeSpill = $c.G -gt 115 -and $c.R -lt 105 -and $c.B -lt 105 -and $dominance -gt 70 -and (Has-TransparentNeighbor $bmp $x $y)
        if ($isNeon -or $isEdgeSpill) {
          $remove.Add("$x,$y")
        }
      }
    }
    foreach ($p in $remove) {
      $parts = $p.Split(",")
      $x = [int]$parts[0]
      $y = [int]$parts[1]
      $c = $bmp.GetPixel($x, $y)
      $bmp.SetPixel($x, $y, [Drawing.Color]::FromArgb(0, $c.R, $c.G, $c.B))
    }
  }
}

function Has-TransparentNeighbor($bmp, $x, $y) {
  for ($oy = -1; $oy -le 1; $oy++) {
    for ($ox = -1; $ox -le 1; $ox++) {
      if ($ox -eq 0 -and $oy -eq 0) { continue }
      $nx = $x + $ox
      $ny = $y + $oy
      if ($nx -lt 0 -or $ny -lt 0 -or $nx -ge $bmp.Width -or $ny -ge $bmp.Height) {
        return $true
      }
      if ($bmp.GetPixel($nx, $ny).A -eq 0) {
        return $true
      }
    }
  }
  return $false
}

function Get-ContentBounds($bmp) {
  $minX = $bmp.Width
  $minY = $bmp.Height
  $maxX = -1
  $maxY = -1

  for ($y = 0; $y -lt $bmp.Height; $y++) {
    for ($x = 0; $x -lt $bmp.Width; $x++) {
      if ($bmp.GetPixel($x, $y).A -gt 10) {
        if ($x -lt $minX) { $minX = $x }
        if ($y -lt $minY) { $minY = $y }
        if ($x -gt $maxX) { $maxX = $x }
        if ($y -gt $maxY) { $maxY = $y }
      }
    }
  }

  if ($maxX -lt 0) {
    return [Drawing.Rectangle]::new(0, 0, $bmp.Width, $bmp.Height)
  }

  return [Drawing.Rectangle]::new($minX, $minY, $maxX - $minX + 1, $maxY - $minY + 1)
}

function Save-RectSprite($sheet, $name, $x, $y, $w, $h, $targetW = 0, $targetH = 0, $pad = 10) {
  $cell = New-Object Drawing.Bitmap $w, $h, ([Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $gfx = [Drawing.Graphics]::FromImage($cell)
  $gfx.InterpolationMode = [Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
  $gfx.SmoothingMode = [Drawing.Drawing2D.SmoothingMode]::None
  $gfx.Clear([Drawing.Color]::Transparent)
  $gfx.DrawImage($sheet, [Drawing.Rectangle]::new(0, 0, $w, $h), [Drawing.Rectangle]::new($x, $y, $w, $h), [Drawing.GraphicsUnit]::Pixel)
  $gfx.Dispose()

  Remove-EdgeBackground $cell
  Remove-ChromaSpill $cell
  $bounds = Get-ContentBounds $cell
  $source = New-Object Drawing.Bitmap $bounds.Width, $bounds.Height, ([Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $gfx = [Drawing.Graphics]::FromImage($source)
  $gfx.InterpolationMode = [Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
  $gfx.SmoothingMode = [Drawing.Drawing2D.SmoothingMode]::None
  $gfx.Clear([Drawing.Color]::Transparent)
  $gfx.DrawImage($cell, [Drawing.Rectangle]::new(0, 0, $bounds.Width, $bounds.Height), $bounds, [Drawing.GraphicsUnit]::Pixel)
  $gfx.Dispose()
  $cell.Dispose()

  $scale = 1.0
  if ($targetW -gt 0) {
    $scale = $targetW / $source.Width
  } elseif ($targetH -gt 0) {
    $scale = $targetH / $source.Height
  }
  $scaledW = [math]::Max(1, [math]::Round($source.Width * $scale))
  $scaledH = [math]::Max(1, [math]::Round($source.Height * $scale))

  $dest = New-Object Drawing.Bitmap ($scaledW + $pad * 2), ($scaledH + $pad * 2), ([Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $gfx = [Drawing.Graphics]::FromImage($dest)
  $gfx.InterpolationMode = [Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
  $gfx.SmoothingMode = [Drawing.Drawing2D.SmoothingMode]::None
  $gfx.Clear([Drawing.Color]::Transparent)
  $gfx.DrawImage($source, [Drawing.Rectangle]::new($pad, $pad, $scaledW, $scaledH), [Drawing.Rectangle]::new(0, 0, $source.Width, $source.Height), [Drawing.GraphicsUnit]::Pixel)
  $gfx.Dispose()
  $source.Dispose()

  $path = Join-Path $out $name
  $dest.Save($path, [Drawing.Imaging.ImageFormat]::Png)
  $dest.Dispose()
  Write-Host "Wrote $name"
}

$sheet = [Drawing.Bitmap]::FromFile($sheetFull)
try {
  Save-RectSprite $sheet "car-side-red.png" 30 92 345 190 190
  Save-RectSprite $sheet "compact-side-silver.png" 408 96 345 190 190
  Save-RectSprite $sheet "taxi-side-yellow.png" 780 84 360 200 198
  Save-RectSprite $sheet "police-side-blue.png" 1190 92 335 190 198
  Save-RectSprite $sheet "delivery-van-blue.png" 34 360 350 230 230
  Save-RectSprite $sheet "scooter-side.png" 470 355 230 230 126
  Save-RectSprite $sheet "cargo-bike-side.png" 808 350 325 245 150
  Save-RectSprite $sheet "pedestrian-side-d.png" 1238 345 150 255 0 104
  Save-RectSprite $sheet "pedestrian-side-e.png" 132 632 145 260 0 104
  Save-RectSprite $sheet "prop-ticket-machine.png" 430 622 155 270 0 92
  Save-RectSprite $sheet "prop-news-kiosk.png" 708 622 330 270 138
  Save-RectSprite $sheet "prop-ad-column.png" 1198 592 170 305 0 112
} finally {
  $sheet.Dispose()
}
