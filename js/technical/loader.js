// Load files

for (file in modInfo.modFiles) {
    let script = document.createElement("script");
    // The version in the URL makes browsers fetch fresh layer files after every update, instead of mixing cached old ones with new ones
    script.setAttribute("src", "js/" + modInfo.modFiles[file] + "?v=" + VERSION.num);
    script.async = false; // Keep mod files running in order (setAttribute("async", "false") still loads them async)
    document.head.insertBefore(script, document.getElementById("temp"));
}

