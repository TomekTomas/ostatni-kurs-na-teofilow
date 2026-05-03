param(
  [Parameter(Mandatory = $true)]
  [string]$SheetPath
)

Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$out = Join-Path $root "assets\sprites-ai"
New-Item -ItemType Directory -Force -Path $out | Out-Null

$sheet = [Drawing.Image]::FromFile((Resolve-Path -LiteralPath $SheetPath))

function Save-Crop($name, $x, $y, $w, $h) {
  $bmp = New-Object Drawing.Bitmap $w, $h, ([Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $gfx = [Drawing.Graphics]::FromImage($bmp)
  $gfx.Clear([Drawing.Color]::Transparent)
  $gfx.InterpolationMode = [Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
  $gfx.PixelOffsetMode = [Drawing.Drawing2D.PixelOffsetMode]::Half
  $src = New-Object Drawing.Rectangle $x, $y, $w, $h
  $dst = New-Object Drawing.Rectangle 0, 0, $w, $h
  $gfx.DrawImage($sheet, $dst, $src, [Drawing.GraphicsUnit]::Pixel)
  $path = Join-Path $out $name
  $bmp.Save($path, [Drawing.Imaging.ImageFormat]::Png)
  $gfx.Dispose()
  $bmp.Dispose()
}

Save-Crop "tram-konstal.png" 32 30 652 190
Save-Crop "tram-pesa.png" 42 246 642 178
Save-Crop "car.png" 738 44 122 214
Save-Crop "car-green.png" 890 52 116 202
Save-Crop "track.png" 1028 386 128 128
Save-Crop "track-road.png" 1192 394 126 120
Save-Crop "track-crossing.png" 1357 394 140 120
Save-Crop "pothole.png" 722 610 88 90
Save-Crop "powerline.png" 1030 558 110 88
Save-Crop "passenger.png" 44 834 50 134
Save-Crop "passenger-2.png" 128 834 54 134
Save-Crop "passenger-3.png" 214 834 50 134
Save-Crop "unicorn.png" 1194 566 306 188
Save-Crop "plac.png" 488 610 192 126
Save-Crop "manufaktura.png" 834 728 180 74
Save-Crop "road-tile.png" 728 316 112 108
Save-Crop "sidewalk.png" 488 732 192 72
Save-Crop "arrow-left.png" 998 856 94 92
Save-Crop "arrow-right.png" 1110 856 94 92

$sheet.Dispose()
