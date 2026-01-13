// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    #[cfg(target_os = "linux")]
    {
        // Fix WebKitGTK GPU rendering issues on Linux (especially NVIDIA/Wayland)
        // This disables DMA-BUF renderer which causes GBM buffer allocation failures
        if std::env::var("WEBKIT_DISABLE_DMABUF_RENDERER").is_err() {
            std::env::set_var("WEBKIT_DISABLE_DMABUF_RENDERER", "1");
        }

        // Prefer native Wayland if available, only if not explicitly set
        if std::env::var("GDK_BACKEND").is_err() && std::env::var("WAYLAND_DISPLAY").is_ok() {
            std::env::set_var("GDK_BACKEND", "wayland");
        }
    }

    bitwig_theme_manager_lib::run()
}
