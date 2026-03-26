param(
  [string]$SourceDir = "C:\Users\Owner\AIgame\assets-source\bg",
  [string]$OutputDir = "C:\Users\Owner\AIgame\public\bg",
  [int]$Width = 1600,
  [int]$Height = 900,
  [int]$Quality = 65
)

Add-Type -AssemblyName System.Drawing

function Get-JpegEncoder {
  [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
    Where-Object { $_.MimeType -eq "image/jpeg" } |
    Select-Object -First 1
}

function Save-ResizedJpeg {
  param(
    [string]$InputPath,
    [string]$OutputPath,
    [int]$TargetWidth,
    [int]$TargetHeight,
    [long]$JpegQuality
  )

  $image = [System.Drawing.Image]::FromFile($InputPath)

  try {
    $bitmap = New-Object System.Drawing.Bitmap($TargetWidth, $TargetHeight)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)

    try {
      $graphics.Clear([System.Drawing.Color]::Black)
      $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
      $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
      $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

      $srcRatio = $image.Width / $image.Height
      $dstRatio = $TargetWidth / $TargetHeight

      if ($srcRatio -gt $dstRatio) {
        $cropHeight = $image.Height
        $cropWidth = [int]($image.Height * $dstRatio)
        $srcX = [int](($image.Width - $cropWidth) / 2)
        $srcY = 0
      } else {
        $cropWidth = $image.Width
        $cropHeight = [int]($image.Width / $dstRatio)
        $srcX = 0
        $srcY = [int](($image.Height - $cropHeight) / 2)
      }

      $destRect = New-Object System.Drawing.Rectangle(0, 0, $TargetWidth, $TargetHeight)
      $srcRect = New-Object System.Drawing.Rectangle($srcX, $srcY, $cropWidth, $cropHeight)
      $graphics.DrawImage($image, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)

      $encoder = Get-JpegEncoder
      $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
      $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter(
        [System.Drawing.Imaging.Encoder]::Quality,
        $JpegQuality
      )

      $bitmap.Save($OutputPath, $encoder, $encoderParams)
    } finally {
      $graphics.Dispose()
      $bitmap.Dispose()
    }
  } finally {
    $image.Dispose()
  }
}

if (!(Test-Path $SourceDir)) {
  Write-Error "Source directory not found: $SourceDir"
  exit 1
}

if (!(Test-Path $OutputDir)) {
  New-Item -ItemType Directory -Path $OutputDir | Out-Null
}

$files = Get-ChildItem -Path $SourceDir -File |
  Where-Object { $_.Extension -match '^\.(jpg|jpeg|png|webp)$' }

if (-not $files) {
  Write-Error "No image files found in: $SourceDir"
  exit 1
}

foreach ($file in $files) {
  $outputPath = Join-Path $OutputDir ($file.BaseName + ".jpg")
  Save-ResizedJpeg -InputPath $file.FullName -OutputPath $outputPath -TargetWidth $Width -TargetHeight $Height -JpegQuality $Quality
  $sizeKb = [math]::Round((Get-Item $outputPath).Length / 1KB, 1)
  Write-Output "$($file.Name) -> $outputPath (${sizeKb}KB)"
}
