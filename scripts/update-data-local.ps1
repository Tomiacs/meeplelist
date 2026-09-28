param([string]$RankCsvPath)

$ErrorActionPreference = 'Stop'

$secretPath = Join-Path $env:LOCALAPPDATA 'CodexSecrets\bgg-api-token.dpapi'
if (-not (Test-Path -LiteralPath $secretPath)) {
    throw "A BGG API-kulcs fájlja nem található: $secretPath"
}

$secureKey = Get-Content -LiteralPath $secretPath -Raw | ConvertTo-SecureString
$credential = [pscredential]::new('bgg', $secureKey)

try {
    $env:BGG_API_TOKEN = $credential.GetNetworkCredential().Password
    $arguments = @((Join-Path $PSScriptRoot 'update-data.mjs'))
    if ($RankCsvPath) { $arguments += $RankCsvPath }
    node @arguments
    if ($LASTEXITCODE -ne 0) {
        throw 'A BGG adatfrissítés sikertelen.'
    }
}
finally {
    Remove-Item Env:BGG_API_TOKEN -ErrorAction SilentlyContinue
}
