Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$src = Join-Path $HOME ".codex\generated_images\019dc6c2-f2bc-7da3-8913-242ba6bc40f1\ig_07cb914a7db5242c0169f5b0f81a5081919536c36614713462.png"
$out = Join-Path $root "assets\branding\lcn-billboard-generated.png"

$source = [Drawing.Bitmap]::FromFile($src)
$minX = $source.Width
$minY = $source.Height
$maxX = 0
$maxY = 0

for ($y = 0; $y -lt $source.Height; $y++) {
  for ($x = 0; $x -lt $source.Width; $x++) {
    $c = $source.GetPixel($x, $y)
    $isChecker = $c.R -gt 228 -and $c.G -gt 228 -and $c.B -gt 228
    if (-not $isChecker) {
      if ($x -lt $minX) { $minX = $x }
      if ($y -lt $minY) { $minY = $y }
      if ($x -gt $maxX) { $maxX = $x }
      if ($y -gt $maxY) { $maxY = $y }
    }
  }
}

$pad = 8
$crop = [Drawing.Rectangle]::FromLTRB(
  [Math]::Max(0, $minX - $pad),
  [Math]::Max(0, $minY - $pad),
  [Math]::Min($source.Width, $maxX + $pad),
  [Math]::Min($source.Height, $maxY + $pad)
)

$targetW = 520
$targetH = 250
$tmp = New-Object Drawing.Bitmap $crop.Width, $crop.Height, ([Drawing.Imaging.PixelFormat]::Format32bppArgb)
for ($y = 0; $y -lt $crop.Height; $y++) {
  for ($x = 0; $x -lt $crop.Width; $x++) {
    $c = $source.GetPixel($crop.X + $x, $crop.Y + $y)
    if ($c.R -gt 228 -and $c.G -gt 228 -and $c.B -gt 228) {
      $tmp.SetPixel($x, $y, [Drawing.Color]::Transparent)
    } else {
      $tmp.SetPixel($x, $y, $c)
    }
  }
}

$final = New-Object Drawing.Bitmap $targetW, $targetH, ([Drawing.Imaging.PixelFormat]::Format32bppArgb)
$gfx = [Drawing.Graphics]::FromImage($final)
$gfx.SmoothingMode = [Drawing.Drawing2D.SmoothingMode]::None
$gfx.InterpolationMode = [Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
$gfx.PixelOffsetMode = [Drawing.Drawing2D.PixelOffsetMode]::Half
$gfx.Clear([Drawing.Color]::Transparent)

$scale = [Math]::Min(($targetW - 8) / $tmp.Width, ($targetH - 8) / $tmp.Height)
$drawW = [Math]::Round($tmp.Width * $scale)
$drawH = [Math]::Round($tmp.Height * $scale)
$gfx.DrawImage($tmp, [Math]::Round(($targetW - $drawW) / 2), [Math]::Round(($targetH - $drawH) / 2), $drawW, $drawH)
$final.Save($out, [Drawing.Imaging.ImageFormat]::Png)

$gfx.Dispose()
$final.Dispose()
$tmp.Dispose()
$source.Dispose()
