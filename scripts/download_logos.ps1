$dest = 'temp_logos'
if (!(Test-Path $dest)) { New-Item -ItemType Directory -Path $dest }

$partners = @(
    @{name='tcs'; url='https://logo.clearbit.com/tcs.com'},
    @{name='infosys'; url='https://logo.clearbit.com/infosys.com'},
    @{name='dr_reddy'; url='https://logo.clearbit.com/drreddys.com'},
    @{name='gmr_group'; url='https://logo.clearbit.com/gmrgroup.in'},
    @{name='cyient'; url='https://logo.clearbit.com/cyient.com'},
    @{name='bharat_biotech'; url='https://logo.clearbit.com/bharatbiotech.com'},
    @{name='aurobindo'; url='https://logo.clearbit.com/aurobindo.com'},
    @{name='my_home_group'; url='https://logo.clearbit.com/myhomegroup.com'},
    @{name='yashoda_hospitals'; url='https://logo.clearbit.com/yashodahospitals.com'},
    @{name='apollo_hospitals'; url='https://logo.clearbit.com/apollohospitals.com'},
    @{name='hetero_drugs'; url='https://logo.clearbit.com/hetero.com'},
    @{name='gvk'; url='https://logo.clearbit.com/gvk.com'}
)

foreach ($p in $partners) {
    $path = "$dest/$($p.name).png"
    Write-Host "Downloading $($p.name)..."
    try {
        Invoke-WebRequest -Uri $p.url -OutFile $path -UserAgent 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' -ErrorAction Stop
        Write-Host "Success: $($p.name)"
    } catch {
        Write-Host "Failed: $($p.name) - $($_.Exception.Message)"
    }
}
