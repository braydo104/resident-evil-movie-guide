<#
.SYNOPSIS
  Starter PowerShell script.

.DESCRIPTION
  A safe default template with strict mode, consistent error handling, and a simple main entry point.

.EXAMPLE
  ./script.ps1 -WhatIf
#>

[CmdletBinding(SupportsShouldProcess = $true)]
param(
  [Parameter(Mandatory = $false)]
  [string]$Message = "Hello from PowerShell",

  [switch]$VerboseOutput
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Write-Log {
  [CmdletBinding()]
  param(
    [Parameter(Mandatory = $true)]
    [string]$Text,

    [ValidateSet('INFO','WARN','ERROR')]
    [string]$Level = 'INFO'
  )

  $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
  Write-Host "[$timestamp][$Level] $Text"
}

function Main {
  [CmdletBinding()]
  param()

  if ($VerboseOutput) {
    $VerbosePreference = 'Continue'
  }

  Write-Verbose "Starting script..."

  if ($PSCmdlet.ShouldProcess("Console", "Print message")) {
    Write-Log -Text $Message -Level 'INFO'
  }

  Write-Verbose "Done."
}

Main
