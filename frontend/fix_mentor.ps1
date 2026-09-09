$f = "src\pages\Dashboard\MentorDashboard.jsx"
$all = Get-Content $f
# Keep lines 1-1515 (0-indexed: 0..1514) and lines 1964 onward (0-indexed: 1963..)
$out = $all[0..1514] + $all[1963..($all.Length-1)]
Set-Content $f $out -Encoding UTF8
Write-Host "Done. New line count: $($out.Length)"
