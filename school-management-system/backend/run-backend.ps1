<#
  Dev launcher for the Spring Boot backend.

  Runs the packaged jar as a DETACHED process. Previously the backend was started
  as a child of a terminal/agent shell; when that shell was reaped the JVM went
  with it, which looked like "the backend stops on its own" even though the log
  showed a clean startup and no exception. Start-Process gives it an independent
  lifetime, and the PID file makes stop/restart deterministic.

  Usage:  .\run-backend.ps1 start | stop | restart | status
#>
param([ValidateSet('start','stop','restart','status')][string]$Action = 'start')

$ErrorActionPreference = 'Stop'
$Root    = Split-Path -Parent $MyInvocation.MyCommand.Path
$Jar     = Join-Path $Root 'target\school-management-backend-1.0.0.jar'
$PidFile = Join-Path $Root 'backend.pid'
$OutLog  = Join-Path $Root 'backend-run.log'
$ErrLog  = Join-Path $Root 'backend-err.log'
$JavaHome = $env:JAVA_HOME
if (-not $JavaHome) { $JavaHome = 'C:\Users\Jitesh\.jdks\graalvm-jdk-17.0.12' }
$Java = Join-Path $JavaHome 'bin\java.exe'

function Get-BackendProcess {
    # Trust the port over the PID file: the port is what actually matters.
    $conn = Get-NetTCPConnection -LocalPort 8080 -State Listen -ErrorAction SilentlyContinue
    if ($conn) { return Get-Process -Id ($conn | Select-Object -First 1).OwningProcess -ErrorAction SilentlyContinue }
    return $null
}

function Stop-Backend {
    $p = Get-BackendProcess
    if ($p) {
        Write-Host "Stopping backend (PID $($p.Id))..."
        Stop-Process -Id $p.Id -Force -ErrorAction SilentlyContinue
        $deadline = (Get-Date).AddSeconds(20)
        while ((Get-BackendProcess) -and (Get-Date) -lt $deadline) { Start-Sleep -Milliseconds 500 }
    } else {
        Write-Host 'Backend is not running.'
    }
    if (Test-Path $PidFile) { Remove-Item $PidFile -Force -ErrorAction SilentlyContinue }
}

function Start-Backend {
    if (Get-BackendProcess) { Write-Host 'Backend already running on port 8080.'; return }
    if (-not (Test-Path $Jar)) { throw "Jar not found: $Jar  (run: mvn -o package -DskipTests)" }
    # Paths contain spaces: each argument must be individually quoted or java
    # receives a truncated path ("Unable to access jarfile D:\School").
    $p = Start-Process -FilePath $Java `
        -ArgumentList '-Dspring.profiles.active=dev','-jar',"`"$Jar`"" `
        -WorkingDirectory $Root `
        -RedirectStandardOutput $OutLog -RedirectStandardError $ErrLog `
        -WindowStyle Hidden -PassThru
    $p.Id | Out-File $PidFile -Encoding ascii
    Write-Host "Started backend (PID $($p.Id)). Log: $OutLog"

    $deadline = (Get-Date).AddSeconds(120)
    while ((Get-Date) -lt $deadline) {
        if (Test-Path $OutLog) {
            $log = Get-Content $OutLog -Raw -ErrorAction SilentlyContinue
            if ($log -match 'Started SchoolManagementApplication') { Write-Host 'Backend is up.'; return }
            if ($log -match 'APPLICATION FAILED TO START') { throw 'Backend failed to start - see log.' }
        }
        if (-not (Get-Process -Id $p.Id -ErrorAction SilentlyContinue)) { throw 'Backend process exited during startup - see log.' }
        Start-Sleep -Seconds 2
    }
    throw 'Timed out waiting for backend startup.'
}

switch ($Action) {
    'start'   { Start-Backend }
    'stop'    { Stop-Backend }
    'restart' { Stop-Backend; Start-Backend }
    'status'  {
        $p = Get-BackendProcess
        if ($p) {
            $up = [math]::Round(((Get-Date) - $p.StartTime).TotalMinutes, 1)
            Write-Host "RUNNING  PID $($p.Id)  uptime ${up}m  mem $([math]::Round($p.WorkingSet64/1MB))MB"
        } else { Write-Host 'STOPPED' }
    }
}
