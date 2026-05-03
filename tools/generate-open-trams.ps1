Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$out = Join-Path $root "assets\trams"

function Clone-OpenTram($sourceName, $targetName, $doors, $openingColor, $leafColor, $leafEdgeColor) {
  $srcPath = Join-Path $out $sourceName
  $src = [Drawing.Bitmap]::FromFile($srcPath)
  $bmp = New-Object Drawing.Bitmap $src.Width, $src.Height, ([Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $gfx = [Drawing.Graphics]::FromImage($bmp)
  $gfx.SmoothingMode = [Drawing.Drawing2D.SmoothingMode]::None
  $gfx.InterpolationMode = [Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
  $gfx.PixelOffsetMode = [Drawing.Drawing2D.PixelOffsetMode]::Half
  $gfx.DrawImage($src, 0, 0, $src.Width, $src.Height)

  $openingBrush = New-Object Drawing.SolidBrush ([Drawing.ColorTranslator]::FromHtml($openingColor))
  $shadowBrush = New-Object Drawing.SolidBrush ([Drawing.ColorTranslator]::FromHtml("#1e2730"))
  $leafBrush = New-Object Drawing.SolidBrush ([Drawing.ColorTranslator]::FromHtml($leafColor))
  $leafEdge = New-Object Drawing.Pen ([Drawing.ColorTranslator]::FromHtml($leafEdgeColor)), 1

  foreach ($door in $doors) {
    $x = [int]$door.x
    $y = [int]$door.y
    $w = [int]$door.w
    $h = [int]$door.h

    $openingX = [Math]::Round($x + $w * 0.38)
    $openingY = $y + 6
    $openingW = [Math]::Max(12, [Math]::Round($w * 0.24))
    $openingH = $h - 12

    $gfx.FillRectangle($openingBrush, $openingX, $openingY, $openingW, $openingH)
    $gfx.FillRectangle($shadowBrush, $openingX + 2, $openingY + 7, [Math]::Max(4, $openingW - 4), 8)

    $leafW = [Math]::Max(5, [Math]::Round($w * 0.12))
    $leafH = $openingH - 4
    $leftLeafX = [Math]::Max($x + 2, $openingX - $leafW - 3)
    $rightLeafX = [Math]::Min($x + $w - $leafW - 2, $openingX + $openingW + 3)
    $leafY = $openingY + 2

    $gfx.FillRectangle($leafBrush, $leftLeafX, $leafY, $leafW, $leafH)
    $gfx.FillRectangle($leafBrush, $rightLeafX, $leafY, $leafW, $leafH)
    $gfx.DrawRectangle($leafEdge, $leftLeafX, $leafY, $leafW, $leafH)
    $gfx.DrawRectangle($leafEdge, $rightLeafX, $leafY, $leafW, $leafH)
  }

  $targetPath = Join-Path $out $targetName
  $bmp.Save($targetPath, [Drawing.Imaging.ImageFormat]::Png)
  $leafEdge.Dispose()
  $leafBrush.Dispose()
  $shadowBrush.Dispose()
  $openingBrush.Dispose()
  $gfx.Dispose()
  $bmp.Dispose()
  $src.Dispose()
}

$konstalDoors = @(
  @{ x = 74; y = 70; w = 110; h = 122 },
  @{ x = 500; y = 70; w = 104; h = 122 },
  @{ x = 1098; y = 70; w = 110; h = 122 }
)

$pesaDoors = @(
  @{ x = 250; y = 76; w = 130; h = 116 },
  @{ x = 654; y = 76; w = 118; h = 116 },
  @{ x = 1048; y = 76; w = 128; h = 116 },
  @{ x = 1428; y = 76; w = 128; h = 116 }
)

Clone-OpenTram "tram-konstal.png" "tram-konstal-open.png" $konstalDoors "#0a0d11" "#e0bd1e" "#1a1d22"
Clone-OpenTram "tram-pesa.png" "tram-pesa-open.png" $pesaDoors "#090b0f" "#c82929" "#14171d"
