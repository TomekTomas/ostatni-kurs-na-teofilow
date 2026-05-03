param(
  [string]$SheetPath = "assets\generated\lodz-route-background-sheet-v2.png"
)

Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$sheetFull = Join-Path $root $SheetPath
$out = Join-Path $root "assets\backgrounds"
New-Item -ItemType Directory -Force -Path $out | Out-Null

$names = @(
  "zarzew",
  "widzew-wschod",
  "rokicinska",
  "widzew",
  "wima",
  "centrum",
  "piotrkowska",
  "kaliska",
  "teofilow"
)

$sheet = [Drawing.Bitmap]::FromFile($sheetFull)
$cellW = [math]::Floor($sheet.Width / 3)
$cellH = [math]::Floor($sheet.Height / 3)

for ($i = 0; $i -lt $names.Count; $i++) {
  $col = $i % 3
  $row = [math]::Floor($i / 3)
  $srcX = $col * $cellW + 3
  $srcY = $row * $cellH + 3
  $srcW = [math]::Min($cellW - 6, $sheet.Width - $srcX)
  $srcH = [math]::Min($cellH - 6, $sheet.Height - $srcY)

  $dest = New-Object Drawing.Bitmap 1280, 440, ([Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $gfx = [Drawing.Graphics]::FromImage($dest)
  $gfx.InterpolationMode = [Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
  $gfx.SmoothingMode = [Drawing.Drawing2D.SmoothingMode]::None
  $gfx.PixelOffsetMode = [Drawing.Drawing2D.PixelOffsetMode]::Half
  $gfx.DrawImage($sheet, [Drawing.Rectangle]::new(0, 0, 1280, 440), [Drawing.Rectangle]::new($srcX, $srcY, $srcW, $srcH), [Drawing.GraphicsUnit]::Pixel)
  $path = Join-Path $out ("bg-" + $names[$i] + ".png")
  $dest.Save($path, [Drawing.Imaging.ImageFormat]::Png)
  $gfx.Dispose()
  $dest.Dispose()
}

$sheet.Dispose()
