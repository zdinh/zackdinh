$ErrorActionPreference = "Stop"

$PreferredPorts = @(3000, 3001, 8080, 5500)
$Root = $PSScriptRoot

function Get-ContentType([string]$Path) {
    switch ([System.IO.Path]::GetExtension($Path).ToLower()) {
        ".html" { return "text/html; charset=utf-8" }
        ".js" { return "application/javascript; charset=utf-8" }
        ".css" { return "text/css; charset=utf-8" }
        ".json" { return "application/json; charset=utf-8" }
        ".jpg" { return "image/jpeg" }
        ".jpeg" { return "image/jpeg" }
        ".png" { return "image/png" }
        ".gif" { return "image/gif" }
        ".svg" { return "image/svg+xml" }
        ".ico" { return "image/x-icon" }
        ".webp" { return "image/webp" }
        default { return "application/octet-stream" }
    }
}

$Listener = $null
$Port = $null

foreach ($tryPort in $PreferredPorts) {
    $candidate = [System.Net.HttpListener]::new()
    $candidate.Prefixes.Add("http://localhost:$tryPort/")
    try {
        $candidate.Start()
        $Listener = $candidate
        $Port = $tryPort
        break
    }
    catch {
        $candidate.Close()
    }
}

if (-not $Listener) {
    Write-Host ""
    Write-Host " Could not start a local server on ports: $($PreferredPorts -join ', ')" -ForegroundColor Red
    Write-Host " Another Places server may already be running."
    Write-Host " Run stop-places-local.bat, then try again."
    Write-Host ""
    exit 1
}

$PlacesUrl = "http://localhost:$Port/places.html"

Write-Host ""
Write-Host " Places local dev server"
Write-Host " $PlacesUrl" -ForegroundColor Cyan
if ($Port -ne 3000) {
    Write-Host " (port $Port - 3000 was already in use)" -ForegroundColor DarkYellow
    Write-Host " Add this URL to Supabase Redirect URLs if you have not already."
}
Write-Host ""
Write-Host " Press Ctrl+C to stop."
Write-Host ""

Start-Job -ArgumentList $PlacesUrl {
    param($Url)
    Start-Sleep -Seconds 2
    Start-Process $Url
} | Out-Null

try {
    while ($Listener.IsListening) {
        $Context = $Listener.GetContext()
        $Request = $Context.Request
        $Response = $Context.Response

        try {
            $RelativePath = [System.Uri]::UnescapeDataString($Request.Url.LocalPath.TrimStart("/"))
            if ([string]::IsNullOrWhiteSpace($RelativePath)) {
                $RelativePath = "index.html"
            }

            $FilePath = [System.IO.Path]::GetFullPath(
                [System.IO.Path]::Combine($Root, ($RelativePath -replace "/", [System.IO.Path]::DirectorySeparatorChar))
            )

            if (-not $FilePath.StartsWith($Root, [StringComparison]::OrdinalIgnoreCase)) {
                $Response.StatusCode = 403
                continue
            }

            if (Test-Path -LiteralPath $FilePath -PathType Leaf) {
                $Bytes = [System.IO.File]::ReadAllBytes($FilePath)
                $Response.StatusCode = 200
                $Response.ContentType = Get-ContentType $FilePath
                $Response.ContentLength64 = $Bytes.Length
                $Response.OutputStream.Write($Bytes, 0, $Bytes.Length)
            }
            else {
                $Response.StatusCode = 404
                $NotFound = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
                $Response.OutputStream.Write($NotFound, 0, $NotFound.Length)
            }
        }
        finally {
            $Response.Close()
        }
    }
}
finally {
    $Listener.Stop()
    $Listener.Close()
}
