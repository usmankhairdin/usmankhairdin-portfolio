# Regenerates share images from existing, approved route captures. This does not
# alter any image used by the rendered website.
Add-Type -AssemblyName PresentationCore

$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$outputRoot = Join-Path $projectRoot 'public/assets/social'
New-Item -ItemType Directory -Force -Path $outputRoot | Out-Null

$captures = [ordered]@{
  about = 'case-studies/personal-portfolio-web/about-desktop.webp'
  services = 'case-studies/personal-portfolio-web/services-desktop.webp'
  work = 'case-studies/personal-portfolio-web/work-project-desktop.webp'
  agencies = 'case-studies/personal-portfolio-web/agencies-desktop.webp'
  contact = 'case-studies/personal-portfolio-web/contact-desktop.webp'
  'design-system' = 'case-studies/personal-portfolio-web/design-system-desktop.webp'
  prima = 'projects/prima/hero.webp'
  bizcare = 'projects/bizcare/hero.webp'
  bansar = 'projects/bansar/hero.webp'
  rantle = 'projects/rantle/hero.webp'
  'bum-life' = 'projects/bum-life/hero.webp'
  sanaira = 'projects/sanaira/hero.webp'
  'personal-portfolio-web' = 'case-studies/personal-portfolio-web/home-light-desktop.webp'
  'personal-portfolio-3d' = 'case-studies/personal-portfolio-3d/corridor-menu.webp'
}

foreach ($entry in $captures.GetEnumerator()) {
  $source = Join-Path (Join-Path $projectRoot 'public/assets') $entry.Value
  if (-not (Test-Path -LiteralPath $source)) { throw "Missing approved capture: $source" }
  $decoder = [System.Windows.Media.Imaging.BitmapDecoder]::Create(
    [Uri]::new($source),
    [System.Windows.Media.Imaging.BitmapCreateOptions]::None,
    [System.Windows.Media.Imaging.BitmapCacheOption]::OnLoad
  )
  $frame = $decoder.Frames[0]
  $width = 1200
  $height = 630
  $scale = [Math]::Min($width / $frame.PixelWidth, $height / $frame.PixelHeight)
  $imageWidth = $frame.PixelWidth * $scale
  $imageHeight = $frame.PixelHeight * $scale

  $visual = [System.Windows.Media.DrawingVisual]::new()
  $context = $visual.RenderOpen()
  $background = [System.Windows.Media.SolidColorBrush]::new([System.Windows.Media.Color]::FromRgb(240, 245, 252))
  $context.DrawRectangle($background, $null, [System.Windows.Rect]::new(0, 0, $width, $height))
  $context.DrawImage($frame, [System.Windows.Rect]::new(($width - $imageWidth) / 2, ($height - $imageHeight) / 2, $imageWidth, $imageHeight))
  $context.Close()

  $bitmap = [System.Windows.Media.Imaging.RenderTargetBitmap]::new($width, $height, 96, 96, [System.Windows.Media.PixelFormats]::Pbgra32)
  $bitmap.Render($visual)
  $encoder = [System.Windows.Media.Imaging.JpegBitmapEncoder]::new()
  $encoder.QualityLevel = 88
  $encoder.Frames.Add([System.Windows.Media.Imaging.BitmapFrame]::Create($bitmap))
  $output = Join-Path $outputRoot ($entry.Key + '.jpg')
  $stream = [System.IO.File]::Create($output)
  try { $encoder.Save($stream) } finally { $stream.Dispose() }
}
