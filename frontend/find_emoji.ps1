$files = Get-ChildItem -Path "src\pages" -Recurse -Filter *.jsx
foreach ($file in $files) {
    $content = Get-Content $file.FullName -Encoding UTF8
    if ($null -eq $content) { continue }
    for ($i = 0; $i -lt $content.Length; $i++) {
        $line = $content[$i]
        if ($line -match '[^\x00-\x7F]') {
            Write-Host "$($file.Name):$($i+1) $($line.Trim())"
        }
    }
}
