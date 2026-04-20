document.addEventListener("DOMContentLoaded", function() {
  try {
    const currentUrl = window.location.href;
    
    if (window.location.pathname === "/pages/ashwagandha-gummies" || currentUrl.includes("collections?srsltid=")) {
        window.location.replace("/products/ashwagandha-ksm-66-gummies");
    }
  } catch (e) {
    null;
  }
});