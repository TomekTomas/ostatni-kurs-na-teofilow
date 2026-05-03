param(
  [string]$SheetPath = "assets\generated\station-shelter-sheet-v2.png"
)

Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$sheetFull = Join-Path $root $SheetPath
$out = Join-Path $root "assets\sprites"
New-Item -ItemType Directory -Force -Path $out | Out-Null

function Similar($a, $b, $tol) {
  return ([math]::Abs($a.R - $b.R) -le $tol -and [math]::Abs($a.G - $b.G) -le $tol -and [math]::Abs($a.B - $b.B) -le $tol)
}

function Remove-Key($bmp) {
  $key = [Drawing.Color]::FromArgb(255, 255, 0, 255)
  for ($y = 0; $y -lt $bmp.Height; $y++) {
    for ($x = 0; $x -lt $bmp.Width; $x++) {
      $c = $bmp.GetPixel($x, $y)
      if (Similar $c $key 70) {
        $bmp.SetPixel($x, $y, [Drawing.Color]::FromArgb(0, $c.R, $c.G, $c.B))
      }
    }
  }
}

function Crop-Sprite($sheet, $name, $x, $y, $w, $h, $scale = 1.0) {
  $targetW = [math]::Round($w * $scale)
  $targetH = [math]::Round($h * $scale)
  $dest = New-Object Drawing.Bitmap $targetW, $targetH, ([Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $gfx = [Drawing.Graphics]::FromImage($dest)
  $gfx.Clear([Drawing.Color]::Transparent)
  $gfx.InterpolationMode = [Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
  $gfx.SmoothingMode = [Drawing.Drawing2D.SmoothingMode]::None
  $gfx.DrawImage($sheet, [Drawing.Rectangle]::new(0, 0, $targetW, $targetH), [Drawing.Rectangle]::new($x, $y, $w, $h), [Drawing.GraphicsUnit]::Pixel)
  $gfx.Dispose()
  Remove-Key $dest
  $path = Join-Path $out $name
  $dest.Save($path, [Drawing.Imaging.ImageFormat]::Png)
  $dest.Dispose()
}

$sheet = [Drawing.Bitmap]::FromFile($sheetFull)
Crop-Sprite $sheet "station-shelter-modern.png" 45 210 370 370 0.55
Crop-Sprite $sheet "station-shelter-long.png" 460 190 600 390 0.48
Crop-Sprite $sheet "station-shelter-board.png" 1105 190 525 390 0.48
Crop-Sprite $sheet "station-pole-bench.png" 1660 180 285 420 0.48
$sheet.Dispose()
