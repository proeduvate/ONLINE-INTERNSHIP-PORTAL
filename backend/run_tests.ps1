$ErrorActionPreference = "Stop"
Push-Location $PSScriptRoot
Write-Host "Starting backend server..."
$proc = Start-Process -FilePath "$PSScriptRoot\venv\Scripts\python.exe" -ArgumentList "-m uvicorn app:app --host 127.0.0.1 --port 8000" -NoNewWindow -PassThru
Start-Sleep -Seconds 3
try {
    Write-Host "Running integration_test.py..."
    & "$PSScriptRoot\venv\Scripts\python.exe" "$PSScriptRoot\integration_test.py"
} finally {
    Write-Host "Stopping backend server..."
    if ($proc -and !$proc.HasExited) {
        $proc.Kill()
        $proc.WaitForExit()
    }
}
Pop-Location
