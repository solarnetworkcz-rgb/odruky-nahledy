$ErrorActionPreference='Stop'
Set-StrictMode -Version 2.0
$repo=(Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
$test=Join-Path $PSScriptRoot 'flagship-browser.cjs'
if(-not(Test-Path -LiteralPath $test -PathType Leaf)){throw 'Browser QA script missing.'}
$module=[string]$env:PLAYWRIGHT_MODULE
if([string]::IsNullOrWhiteSpace($module)){
  $candidate='C:\Projekty\Odruky-browser-qa\node_modules\playwright'
  if(Test-Path -LiteralPath $candidate -PathType Container){$module=$candidate}
}
if([string]::IsNullOrWhiteSpace($module)){throw 'Playwright unavailable: configure PLAYWRIGHT_MODULE or provision the existing Desktop browser QA toolchain.'}
if(-not(Test-Path -LiteralPath $module -PathType Container)){throw 'PLAYWRIGHT_MODULE does not exist.'}
$env:PLAYWRIGHT_MODULE=$module
if([string]::IsNullOrWhiteSpace([string]$env:PLAYWRIGHT_BROWSERS_PATH)){
  $candidate='C:\Projekty\Odruky-browser-qa\browsers'
  if(Test-Path -LiteralPath $candidate -PathType Container){$env:PLAYWRIGHT_BROWSERS_PATH=$candidate}
}
if([string]::IsNullOrWhiteSpace([string]$env:ODRUKY_QA_OUTPUT_DIR)){
  $env:ODRUKY_QA_OUTPUT_DIR=Join-Path $repo 'qa-artifacts'
}
Push-Location $repo
try{
  & node --test (Join-Path $PSScriptRoot 'preserved-pixels.test.cjs')
  if($LASTEXITCODE -ne 0){throw ('Media pixel QA failed: exit '+$LASTEXITCODE)}
  & node $test
  if($LASTEXITCODE -ne 0){throw ('Browser QA failed: exit '+$LASTEXITCODE)}
}finally{Pop-Location}
