# scripts/process-whispers.ps1
# Acoustic Post-Processing with FFmpeg for 8 Fish Audio Whisper Stems
param (
  [string]$audioDir = "public/audio"
)

Write-Host "Processing 8 raw whisper stems with FFmpeg..." -ForegroundColor Cyan

# 1. Muffled through wet jack-wood door (CF01 Roommate Knock)
if (Test-Path "$audioDir/raw_roommate.mp3") {
  ffmpeg -y -i "$audioDir/raw_roommate.mp3" -af "highpass=f=260,lowpass=f=920,volume=1.4" "$audioDir/whisper_roommate_knock.mp3"
}

# 2. Close-mic right ear sleep-paralysis whisper (CF01 Kalu Kumara Sleep Paralysis)
if (Test-Path "$audioDir/raw_kalu_ear.mp3") {
  ffmpeg -y -i "$audioDir/raw_kalu_ear.mp3" -af "highpass=f=180,pan=stereo|c0=0.12*c0|c1=0.95*c0,aecho=0.8:0.7:45:0.25" "$audioDir/whisper_kalu_ear.mp3"
}

# 3. Distant Kandy Lake fog echo (CF02 Mohini Three-Wheeler Wait)
if (Test-Path "$audioDir/raw_mohini_name.mp3") {
  ffmpeg -y -i "$audioDir/raw_mohini_name.mp3" -af "highpass=f=300,lowpass=f=2200,aecho=0.8:0.88:140:0.45" "$audioDir/whisper_mohini_name.mp3"
}

# 4. Close-mic left ear weeping plea (CF02 Mohini Saree Plea)
if (Test-Path "$audioDir/raw_mohini_baby.mp3") {
  ffmpeg -y -i "$audioDir/raw_mohini_baby.mp3" -af "pan=stereo|c0=0.95*c0|c1=0.12*c0,aecho=0.8:0.85:90:0.35" "$audioDir/whisper_mohini_baby.mp3"
}

# 5. Outdoor courtyard rain distance (CF03 Amma Courtyard Call)
if (Test-Path "$audioDir/raw_amma_courtyard.mp3") {
  ffmpeg -y -i "$audioDir/raw_amma_courtyard.mp3" -af "bandpass=f=1050:width_type=h:w=650,aecho=0.8:0.8:110:0.3" "$audioDir/whisper_amma_courtyard.mp3"
}

# 6. Overhead rafters + simian pitch-shift down (CF03 Riri Rafters)
if (Test-Path "$audioDir/raw_riri_rafters.mp3") {
  ffmpeg -y -i "$audioDir/raw_riri_rafters.mp3" -af "asetrate=44100*0.89,aresample=44100,highpass=f=220,pan=stereo|c0=0.8*c0|c1=0.8*c0" "$audioDir/whisper_riri_rafters.mp3"
}

# 7. Deep crossroads sub-harmonic voice (CF04 Pilgrim Boar Meat)
if (Test-Path "$audioDir/raw_pilgrim_boar.mp3") {
  ffmpeg -y -i "$audioDir/raw_pilgrim_boar.mp3" -af "asetrate=44100*0.84,aresample=44100,lowpass=f=2100,volume=1.5" "$audioDir/whisper_pilgrim_boar.mp3"
}

# 8. Hard rear-left shoulder threat (CF04 Mahasona Neck)
if (Test-Path "$audioDir/raw_mahasona_neck.mp3") {
  ffmpeg -y -i "$audioDir/raw_mahasona_neck.mp3" -af "asetrate=44100*0.82,aresample=44100,pan=stereo|c0=0.95*c0|c1=0.2*c0,lowpass=f=2000,volume=1.6" "$audioDir/whisper_mahasona_neck.mp3"
}

# Remove temporary raw stems
Remove-Item -Path "$audioDir/raw_*.mp3" -Force -ErrorAction SilentlyContinue

Write-Host "Post-processing complete. Raw files removed." -ForegroundColor Green
