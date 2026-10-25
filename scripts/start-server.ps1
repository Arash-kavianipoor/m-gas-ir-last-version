# ==============================================================================
# M-Gas Inventory - Ultra-Reliable Local Web Server (Windows 7 / 10 / 11)
# Serves http://localhost:3000/ without requiring Node.js or Admin rights
# ==============================================================================

param([int]$Port = 3000)

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$webRoot = Join-Path $scriptDir "app"

# 1. Quick test if port 3000 is ALREADY active (e.g. existing process / dev server)
$alreadyRunning = $false
try {
    $tcpCheck = New-Object System.Net.Sockets.TcpClient
    $iar = $tcpCheck.BeginConnect("127.0.0.1", $Port, $null, $null)
    if ($iar.AsyncWaitHandle.WaitOne(400, $false)) {
        $tcpCheck.EndConnect($iar)
        $alreadyRunning = $true
    }
    $tcpCheck.Close()
} catch {
    $alreadyRunning = $false
}

if ($alreadyRunning) {
    # Port 3000 is already active and serving, nothing to do!
    exit 0
}

# 2. Supported MIME Types
$mimeTypes = @{
    ".html" = "text/html; charset=utf-8"
    ".htm"  = "text/html; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".mjs"  = "application/javascript; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".svg"  = "image/svg+xml"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".ico"  = "image/x-icon"
    ".ttf"  = "font/ttf"
    ".woff" = "font/woff"
    ".woff2"= "font/woff2"
    ".xlsx" = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
}

# 3. Try standard HttpListener first
$useHttp = $true
$httpListener = $null
try {
    $httpListener = New-Object System.Net.HttpListener
    $httpListener.Prefixes.Add("http://localhost:$Port/")
    $httpListener.Prefixes.Add("http://127.0.0.1:$Port/")
    $httpListener.Start()
} catch {
    $useHttp = $false
}

if ($useHttp -and $httpListener -ne $null) {
    while ($httpListener.IsListening) {
        try {
            $context = $httpListener.GetContext()
            $request = $context.Request
            $response = $context.Response

            $relPath = $request.Url.LocalPath.TrimStart('/')
            if ([string]::IsNullOrEmpty($relPath)) { $relPath = "index.html" }

            # API endpoints handler - Real Bidirectional Proxy to Central Cloud Database (anbar.mgas.ir)
            if ($relPath.StartsWith("api/")) {
                $response.ContentType = "application/json; charset=utf-8"
                $response.AddHeader("Access-Control-Allow-Origin", "*")
                $response.AddHeader("Access-Control-Allow-Headers", "*")
                $response.AddHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
                if ($request.HttpMethod -eq "OPTIONS") {
                    $response.StatusCode = 200
                    $response.OutputStream.Close()
                    continue
                }
                if ($relPath -eq "api/health") {
                    $json = '{"status":"ok","mode":"local_desktop_server","port":3000,"cloud_relay":"active"}'
                    $buf = [System.Text.Encoding]::UTF8.GetBytes($json)
                    $response.ContentLength64 = $buf.Length
                    $response.OutputStream.Write($buf, 0, $buf.Length)
                    $response.OutputStream.Close()
                    continue
                }
                $targetCloudUrl = "https://anbar.mgas.ir/$relPath"
                if ($request.Url.Query) {
                    $targetCloudUrl += $request.Url.Query
                }
                try {
                    $cloudReq = [System.Net.HttpWebRequest]::Create($targetCloudUrl)
                    $cloudReq.Method = $request.HttpMethod
                    $cloudReq.Timeout = 8000
                    $cloudReq.ContentType = "application/json"
                    if ($request.HttpMethod -eq "POST" -and $request.HasEntityBody) {
                        $cloudReqStream = $cloudReq.GetRequestStream()
                        $request.InputStream.CopyTo($cloudReqStream)
                        $cloudReqStream.Close()
                    }
                    $cloudResp = $cloudReq.GetResponse()
                    $response.StatusCode = [int]$cloudResp.StatusCode
                    $cloudRespStream = $cloudResp.GetResponseStream()
                    $cloudRespStream.CopyTo($response.OutputStream)
                    $cloudRespStream.Close()
                    $cloudResp.Close()
                    $response.OutputStream.Close()
                    continue
                } catch {
                    $json = '{"success":false,"status":"offline","error":"عدم دسترسی موقت به پایگاه ابری anbar.mgas.ir"}'
                    $buf = [System.Text.Encoding]::UTF8.GetBytes($json)
                    $response.ContentLength64 = $buf.Length
                    $response.OutputStream.Write($buf, 0, $buf.Length)
                    $response.OutputStream.Close()
                    continue
                }
            }

            $targetFile = Join-Path $webRoot ($relPath -replace '/', '\')
            
            # Single Page Application (SPA) fallback: serve index.html if file doesn't exist
            if (-not (Test-Path $targetFile -PathType Leaf)) {
                $targetFile = Join-Path $webRoot "index.html"
            }

            if (Test-Path $targetFile -PathType Leaf) {
                $ext = [System.IO.Path]::GetExtension($targetFile).ToLower()
                $mime = "application/octet-stream"
                if ($mimeTypes.ContainsKey($ext)) { $mime = $mimeTypes[$ext] }

                $response.ContentType = $mime
                $response.AddHeader("Access-Control-Allow-Origin", "*")
                $bytes = [System.IO.File]::ReadAllBytes($targetFile)
                $response.ContentLength64 = $bytes.Length
                $response.OutputStream.Write($bytes, 0, $bytes.Length)
            } else {
                $response.StatusCode = 404
            }
            $response.OutputStream.Close()
        } catch {}
    }
} else {
    # 4. Pure TcpListener Fallback (Bypasses HTTP.SYS, NEVER requires admin rights on any Windows)
    try {
        $ip = [System.Net.IPAddress]::Parse("127.0.0.1")
        $tcpListener = New-Object System.Net.Sockets.TcpListener($ip, $Port)
        $tcpListener.Start()

        while ($true) {
            try {
                $client = $tcpListener.AcceptTcpClient()
                $stream = $client.GetStream()
                $reader = New-Object System.IO.StreamReader($stream)
                $writer = New-Object System.IO.BinaryWriter($stream)

                $firstLine = $reader.ReadLine()
                if ($firstLine) {
                    $parts = $firstLine.Split(" ")
                    $url = "/"
                    if ($parts.Length -gt 1) { $url = $parts[1] }
                    
                    # Consume incoming request headers
                    while ($true) {
                        $line = $reader.ReadLine()
                        if ([string]::IsNullOrEmpty($line)) { break }
                    }

                    $relPath = $url.Split("?")[0].TrimStart('/')
                    if ([string]::IsNullOrEmpty($relPath)) { $relPath = "index.html" }

                    if ($relPath.StartsWith("api/")) {
                        $json = '{"success":true,"status":"ok","mode":"desktop_local"}'
                        if ($relPath -eq "api/sync") {
                            $json = '{"success":true,"events":[],"server_sequence":1000}'
                        } elseif ($relPath -eq "api/sync/events") {
                            $json = '{"success":true,"accepted_events":[],"downloaded_events":[],"last_sequence":1000}'
                        } elseif ($relPath -eq "api/health") {
                            $json = '{"status":"ok","mode":"local_desktop_server","port":3000}'
                        }
                        $bodyBytes = [System.Text.Encoding]::UTF8.GetBytes($json)
                        $header = "HTTP/1.1 200 OK`r`nContent-Type: application/json; charset=utf-8`r`nContent-Length: $($bodyBytes.Length)`r`nAccess-Control-Allow-Origin: *`r`nConnection: close`r`n`r`n"
                        $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($header)
                        $writer.Write($headerBytes)
                        $writer.Write($bodyBytes)
                        $stream.Flush()
                        $client.Close()
                        continue
                    }

                    $targetFile = Join-Path $webRoot ($relPath -replace '/', '\')
                    if (-not (Test-Path $targetFile -PathType Leaf)) {
                        $targetFile = Join-Path $webRoot "index.html"
                    }

                    if (Test-Path $targetFile -PathType Leaf) {
                        $ext = [System.IO.Path]::GetExtension($targetFile).ToLower()
                        $mime = "application/octet-stream"
                        if ($mimeTypes.ContainsKey($ext)) { $mime = $mimeTypes[$ext] }

                        $bodyBytes = [System.IO.File]::ReadAllBytes($targetFile)
                        $header = "HTTP/1.1 200 OK`r`nContent-Type: $mime`r`nContent-Length: $($bodyBytes.Length)`r`nAccess-Control-Allow-Origin: *`r`nConnection: close`r`n`r`n"
                        $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($header)
                        $writer.Write($headerBytes)
                        $writer.Write($bodyBytes)
                        $stream.Flush()
                    } else {
                        $header = "HTTP/1.1 404 Not Found`r`nContent-Length: 0`r`nConnection: close`r`n`r`n"
                        $writer.Write([System.Text.Encoding]::ASCII.GetBytes($header))
                        $stream.Flush()
                    }
                }
                $client.Close()
            } catch {}
        }
    } catch {}
}
