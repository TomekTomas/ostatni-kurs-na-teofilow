param(
  [Parameter(Mandatory = $true)]
  [string]$SheetPath
)

Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$out = Join-Path $root "assets\trams"
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

Save-Crop "tram-pesa.png" 55 135 1685 270
Save-Crop "tram-konstal.png" 210 500 1305 300

$sheet.Dispose()
