// src-tauri/src/main.rs
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

#[tauri::command]
fn unlock_steam_achievement(id: String) -> Result<bool, String> {
    #[cfg(feature = "steam")]
    {
        if let Ok((client, _single)) = steamworks::Client::init() {
            let stats = client.user_stats();
            let ach = stats.achievement(&id);
            let _ = ach.set();
            let _ = stats.store_stats();
            return Ok(true);
        }
    }
    let _ = id;
    Ok(false)
}

#[tauri::command]
fn toggle_fullscreen(window: tauri::Window) -> Result<bool, String> {
    let current = window.is_fullscreen().map_err(|e| e.to_string())?;
    window
        .set_fullscreen(!current)
        .map_err(|e| e.to_string())?;
    Ok(!current)
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            unlock_steam_achievement,
            toggle_fullscreen
        ])
        .run(tauri::generate_context!())
        .expect("error while running GOMMAN Tauri application");
}
