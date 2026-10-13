// Load files

for (file in modInfo.modFiles) {
    let script = document.createElement("script");
    script.setAttribute("src", "js/" + modInfo.modFiles[file]);
    script.async = false; // Keep mod files running in order (setAttribute("async", "false") still loads them async)
    document.head.insertBefore(script, document.getElementById("temp"));
}

