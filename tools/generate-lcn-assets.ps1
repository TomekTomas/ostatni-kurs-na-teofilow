Add-Type -AssemblyName System.Drawing
$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$branding = Join-Path $root "assets\branding"
$fonts = Join-Path $root "assets\fonts"
New-Item -ItemType Directory -Force -Path $branding | Out-Null
New-Item -ItemType Directory -Force -Path $fonts | Out-Null

$sourceDir = "D:\" + [char]0x0141 + "CN"
$whiteLogo = Join-Path $sourceDir "lcn_logo-tlo_biale.png"
$gradientLogo = Join-Path $sourceDir "lcn_logo-tlo_gradient.png"

Copy-Item -LiteralPath $whiteLogo -Destination (Join-Path $branding "lcn_logo-tlo_biale.png") -Force
Copy-Item -LiteralPath $gradientLogo -Destination (Join-Path $branding "lcn_logo-tlo_gradient.png") -Force
Copy-Item -LiteralPath (Join-Path $sourceDir "lexend-deca-v25-latin-regular.woff2") -Destination (Join-Path $fonts "lexend-deca-regular.woff2") -Force
Copy-Item -LiteralPath (Join-Path $sourceDir "lexend-deca-v25-latin-900.woff2") -Destination (Join-Path $fonts "lexend-deca-900.woff2") -Force

function Get-ContentBounds($bmp, $sampleWhite) {
  $minX = $bmp.Width
  $minY = $bmp.Height
  $maxX = 0
  $maxY = 0
  for ($y = 0; $y -lt $bmp.Height; $y += 2) {
    for ($x = 0; $x -lt $bmp.Width; $x += 2) {
      $c = $bmp.GetPixel($x, $y)
      $isContent = $false
      if ($sampleWhite) {
        $isContent = !($c.R -gt 238 -and $c.G -gt 238 -and $c.B -gt 238)
      } else {
        $isContent = $c.A -gt 18
      }
      if ($isContent) {
        if ($x -lt $minX) { $minX = $x }
        if ($y -lt $minY) { $minY = $y }
        if ($x -gt $maxX) { $maxX = $x }
        if ($y -gt $maxY) { $maxY = $y }
      }
    }
  }
  return [Drawing.Rectangle]::FromLTRB(
    [Math]::Max(0, $minX - 18),
    [Math]::Max(0, $minY - 18),
    [Math]::Min($bmp.Width, $maxX + 22),
    [Math]::Min($bmp.Height, $maxY + 22)
  )
}

function Save-CroppedLogo($source, $target, $targetW, $targetH, $whiteBackground) {
  $src = [Drawing.Bitmap]::FromFile($source)
  $bounds = Get-ContentBounds $src $whiteBackground
  $out = New-Object Drawing.Bitmap $targetW, $targetH, ([Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $gfx = [Drawing.Graphics]::FromImage($out)
  $gfx.SmoothingMode = [Drawing.Drawing2D.SmoothingMode]::HighQuality
  $gfx.InterpolationMode = [Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $gfx.Clear([Drawing.Color]::Transparent)

  $scale = [Math]::Min(($targetW - 20) / $bounds.Width, ($targetH - 20) / $bounds.Height)
  $drawW = [Math]::Round($bounds.Width * $scale)
  $drawH = [Math]::Round($bounds.Height * $scale)
  $dest = [Drawing.Rectangle]::new([Math]::Round(($targetW - $drawW) / 2), [Math]::Round(($targetH - $drawH) / 2), $drawW, $drawH)
  $gfx.DrawImage($src, $dest, $bounds, [Drawing.GraphicsUnit]::Pixel)

  $out.Save($target, [Drawing.Imaging.ImageFormat]::Png)
  $gfx.Dispose()
  $out.Dispose()
  $src.Dispose()
}

function PixelatedLogo($source, $target, $targetW, $targetH) {
  $src = [Drawing.Bitmap]::FromFile($source)
  $bounds = Get-ContentBounds $src $false
  $small = New-Object Drawing.Bitmap 96, 42, ([Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $sg = [Drawing.Graphics]::FromImage($small)
  $sg.Clear([Drawing.Color]::Transparent)
  $sg.InterpolationMode = [Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $scale = [Math]::Min(90 / $bounds.Width, 38 / $bounds.Height)
  $drawW = [Math]::Round($bounds.Width * $scale)
  $drawH = [Math]::Round($bounds.Height * $scale)
  $sg.DrawImage($src, [Drawing.Rectangle]::new([Math]::Round((96 - $drawW) / 2), [Math]::Round((42 - $drawH) / 2), $drawW, $drawH), $bounds, [Drawing.GraphicsUnit]::Pixel)

  $out = New-Object Drawing.Bitmap $targetW, $targetH, ([Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $gfx = [Drawing.Graphics]::FromImage($out)
  $gfx.SmoothingMode = [Drawing.Drawing2D.SmoothingMode]::None
  $gfx.InterpolationMode = [Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
  $gfx.PixelOffsetMode = [Drawing.Drawing2D.PixelOffsetMode]::Half
  $gfx.Clear([Drawing.Color]::Transparent)
  $gfx.DrawImage($small, 0, 0, $targetW, $targetH)
  $out.Save($target, [Drawing.Imaging.ImageFormat]::Png)

  $gfx.Dispose()
  $out.Dispose()
  $sg.Dispose()
  $small.Dispose()
  $src.Dispose()
}

function New-Billboard($target, $variant) {
  $w = 392
  $h = 190
  $bmp = New-Object Drawing.Bitmap $w, $h, ([Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $gfx = [Drawing.Graphics]::FromImage($bmp)
  $gfx.SmoothingMode = [Drawing.Drawing2D.SmoothingMode]::None
  $gfx.InterpolationMode = [Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
  $gfx.PixelOffsetMode = [Drawing.Drawing2D.PixelOffsetMode]::Half
  $gfx.Clear([Drawing.Color]::Transparent)

  $pole = New-Object Drawing.SolidBrush ([Drawing.ColorTranslator]::FromHtml("#263238"))
  $dark = New-Object Drawing.SolidBrush ([Drawing.ColorTranslator]::FromHtml("#11181d"))
  $green = New-Object Drawing.SolidBrush ([Drawing.ColorTranslator]::FromHtml("#23a455"))
  $blue = New-Object Drawing.SolidBrush ([Drawing.ColorTranslator]::FromHtml("#244c72"))
  $cream = New-Object Drawing.SolidBrush ([Drawing.ColorTranslator]::FromHtml("#f5f4ee"))
  $yellow = New-Object Drawing.SolidBrush ([Drawing.ColorTranslator]::FromHtml("#f0c94c"))
  $blackPen = New-Object Drawing.Pen ([Drawing.ColorTranslator]::FromHtml("#071015")), 4
  $lightPen = New-Object Drawing.Pen ([Drawing.ColorTranslator]::FromHtml("#dce9df")), 2

  $gfx.FillRectangle($pole, 78, 130, 10, 58)
  $gfx.FillRectangle($pole, 304, 130, 10, 58)
  $gfx.FillRectangle($dark, 24, 12, 344, 124)
  $gfx.DrawRectangle($blackPen, 24, 12, 344, 124)
  $gfx.DrawRectangle($lightPen, 34, 22, 324, 104)

  if ($variant -eq 1) {
    $gfx.FillRectangle($green, 38, 26, 154, 96)
    $gfx.FillRectangle($blue, 192, 26, 152, 96)
    $logo = [Drawing.Bitmap]::FromFile((Join-Path $branding "lcn-logo-pixel.png"))
    $gfx.DrawImage($logo, 48, 35, 118, 52)
    $logo.Dispose()
    $brush = $cream
  } elseif ($variant -eq 2) {
    $gfx.FillRectangle($cream, 38, 26, 306, 96)
    $logo = [Drawing.Bitmap]::FromFile((Join-Path $branding "lcn-logo-pixel-dark.png"))
    $gfx.DrawImage($logo, 54, 34, 112, 49)
    $logo.Dispose()
    $brush = $dark
  } else {
    $gfx.FillRectangle($blue, 38, 26, 306, 96)
    $gfx.FillRectangle($green, 38, 92, 306, 30)
    $logo = [Drawing.Bitmap]::FromFile((Join-Path $branding "lcn-logo-pixel.png"))
    $gfx.DrawImage($logo, 51, 36, 104, 46)
    $logo.Dispose()
    $brush = $cream
  }

  $fontFamily = New-Object Drawing.FontFamily "Arial"
  $font = [Drawing.Font]::new($fontFamily, 18, [Drawing.FontStyle]::Bold, [Drawing.GraphicsUnit]::Pixel)
  $smallFont = [Drawing.Font]::new($fontFamily, 10, [Drawing.FontStyle]::Bold, [Drawing.GraphicsUnit]::Pixel)
  $fmt = New-Object Drawing.StringFormat
  $fmt.Alignment = [Drawing.StringAlignment]::Near
  $gfx.DrawString("LODZ CALA", $font, $brush, [Drawing.RectangleF]::new(174, 42, 158, 26), $fmt)
  $gfx.DrawString("NAPRZOD!", $font, $brush, [Drawing.RectangleF]::new(174, 68, 158, 26), $fmt)
  $gfx.DrawString("easter egg na trasie linii 8", $smallFont, $yellow, [Drawing.RectangleF]::new(174, 101, 160, 16), $fmt)

  $bmp.Save($target, [Drawing.Imaging.ImageFormat]::Png)
  $fmt.Dispose()
  $font.Dispose()
  $smallFont.Dispose()
  $fontFamily.Dispose()
  $blackPen.Dispose()
  $lightPen.Dispose()
  $pole.Dispose()
  $dark.Dispose()
  $green.Dispose()
  $blue.Dispose()
  $cream.Dispose()
  $yellow.Dispose()
  $gfx.Dispose()
  $bmp.Dispose()
}

Save-CroppedLogo $gradientLogo (Join-Path $branding "lcn-logo-menu.png") 360 180 $false
Save-CroppedLogo $whiteLogo (Join-Path $branding "lcn-logo-menu-white.png") 360 180 $true
PixelatedLogo (Join-Path $branding "lcn_logo-tlo_gradient.png") (Join-Path $branding "lcn-logo-pixel.png") 144 63
PixelatedLogo (Join-Path $branding "lcn_logo-tlo_biale.png") (Join-Path $branding "lcn-logo-pixel-dark.png") 144 63
New-Billboard (Join-Path $branding "lcn-billboard-1.png") 1
New-Billboard (Join-Path $branding "lcn-billboard-2.png") 2
New-Billboard (Join-Path $branding "lcn-billboard-3.png") 3
