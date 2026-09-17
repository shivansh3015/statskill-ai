Write-Host "Stopping StatSkill AI servers..." -ForegroundColor Yellow

$ports = @(8000, 4028)

foreach ($port in $ports) {

    $connections =
        Get-NetTCPConnection `
            -LocalPort $port `
            -ErrorAction SilentlyContinue

    foreach ($connection in $connections) {

        $processId =
            $connection.OwningProcess

        if ($processId) {

            Write-Host "Stopping process $processId on port $port"

            Stop-Process `
                -Id $processId `
                -Force `
                -ErrorAction SilentlyContinue
        }
    }
}

Write-Host "Servers stopped." -ForegroundColor Green