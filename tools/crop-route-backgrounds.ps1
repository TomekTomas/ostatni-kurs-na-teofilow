param(
  [Parameter(Mandatory = $true)]
  [string]$SheetPath
)

Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$out = Join-Path $root "assets\backgrounds"
New-Item -ItemType Directory -Force -Path $out | Out-Null

$sheet = [Drawing.Image]::FromFile((Resolve-Path -LiteralPath $SheetPath))
$names = @(
  "bg-zarzew.png",
  "bg-widzew.png",
  "bg-wima.png",
  "bg-centrum.png",
  "bg-piotrkowska.png",
  "bg-kaliska.png",
  "bg-wlokniarzy.png",
  "bg-teofilow.png"
)

$cols = 4
$rows = 2
$cellW = [Math]::Floor($sheet.Width / $cols)
$cellH = [Math]::Floor($sheet.Height / $rows)
$pad = [Math]::Max(8, [Math]::Floor([Math]::Min($cellW, $cellH) * 0.018))
$targetW = 1280
$targetH = 440

function Save-Crop($name, $x, $y, $w, $h) {
  $bmp = New-Object Drawing.Bitmap $targetW, $targetH, ([Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $gfx = [Drawing.Graphics]::FromImage($bmp)
  $gfx.Clear([Drawing.Color]::Transparent)
  $gfx.SmoothingMode = [Drawing.Drawing2D.SmoothingMode]::HighQuality
  $gfx.InterpolationMode = [Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $gfx.PixelOffsetMode = [Drawing.Drawing2D.PixelOffsetMode]::Half
  $src = New-Object Drawing.Rectangle $x, $y, $w, $h
  $scale = [Math]::Max($targetW / $w, $targetH / $h)
  $drawW = [Math]::Ceiling($w * $scale)
  $drawH = [Math]::Ceiling($h * $scale)
  $drawX = [Math]::Floor(($targetW - $drawW) / 2)
  $drawY = [Math]::Floor(($targetH - $drawH) / 2)
  $dst = New-Object Drawing.Rectangle $drawX, $drawY, $drawW, $drawH
  $gfx.DrawImage($sheet, $dst, $src, [Drawing.GraphicsUnit]::Pixel)
  $path = Join-Path $out $name
  $bmp.Save($path, [Drawing.Imaging.ImageFormat]::Png)
  $gfx.Dispose()
  $bmp.Dispose()
}

for ($i = 0; $i -lt $names.Length; $i++) {
  $col = $i % $cols
  $row = [Math]::Floor($i / $cols)
  $x = $col * $cellW + $pad
  $y = $row * $cellH + $pad
  $w = $cellW - ($pad * 2)
  $h = $cellH - ($pad * 2)
  Save-Crop $names[$i] $x $y $w $h
}

$sheet.Dispose()
