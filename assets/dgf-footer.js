/**
 * DigiFlow Footer Scripts
 * Scripts to be loaded in the theme footer
 */

(function() {
  'use strict';

  /**
   * Generate descriptive alt text for images based on context
   */
  function generateDynamicAltText(img) {
    try {
      const context = [];

      // 1. Extract from filename
      try {
        const src = img.src || img.dataset.src || '';
        const filename = src.split('/').pop().split('?')[0].split('.')[0];
        if (filename) {
          const cleanFilename = filename
            .replace(/[-_]/g, ' ')
            .replace(/\d+x\d+/g, '') // remove dimensions like 600x600
            .replace(/\s+/g, ' ')
            .trim();
          if (cleanFilename) context.push(cleanFilename);
        }
      } catch (e) { /* silent */ }

      // 2. Check parent product/article context
      try {
        const productCard = img.closest('[class*="product"]');
        if (productCard) {
          const productTitle = productCard.querySelector('[class*="product-title"], [class*="product__title"], h2, h3, a[href*="/products/"]');
          if (productTitle && productTitle.textContent.trim()) {
            context.unshift(productTitle.textContent.trim());
          }
        }
      } catch (e) { /* silent */ }

      // 3. Check for article context
      try {
        const article = img.closest('article');
        if (article) {
          const articleTitle = article.querySelector('h1, h2, h3');
          if (articleTitle && articleTitle.textContent.trim()) {
            context.unshift(articleTitle.textContent.trim());
          }
        }
      } catch (e) { /* silent */ }

      // 4. Check figure caption
      try {
        const figure = img.closest('figure');
        if (figure) {
          const figcaption = figure.querySelector('figcaption');
          if (figcaption && figcaption.textContent.trim()) {
            context.push(figcaption.textContent.trim());
          }
        }
      } catch (e) { /* silent */ }

      // 5. Check aria-label or title
      try {
        if (img.title) {
          context.unshift(img.title);
        }
        if (img.getAttribute('aria-label')) {
          context.unshift(img.getAttribute('aria-label'));
        }
      } catch (e) { /* silent */ }

      // 6. Check parent link context
      try {
        const parentLink = img.closest('a');
        if (parentLink && parentLink.title) {
          context.push(parentLink.title);
        }
      } catch (e) { /* silent */ }

      // 7. Identify image type by class
      try {
        const classList = img.className || '';
        if (classList.includes('logo')) {
          context.push('logo');
        }
        if (classList.includes('icon')) {
          context.push('icon');
        }
        if (classList.includes('banner') || classList.includes('hero')) {
          context.push('banner image');
        }
      } catch (e) { /* silent */ }

      // 8. Build final alt text
      try {
        let altText = context.filter(Boolean).join(' - ');

        // Clean up and limit length
        altText = altText
          .replace(/\s+/g, ' ')
          .replace(/[^\w\s-]/g, '')
          .trim()
          .substring(0, 115); // Leave space for timestamp

        // Add timestamp
        const timestamp = Date.now();
        altText = altText ? `${altText} ${timestamp}` : `Image ${timestamp}`;

        return altText;
      } catch (e) {
        return `Image ${Date.now()}`;
      }

    } catch (e) {
      return 'Image';
    }
  }

  /**
   * Add alt text to images without alt attribute
   */
  function addMissingAltText() {
    try {
      let images = document.querySelectorAll('img');
      let count = 0;

      images.forEach(img => {
        try {
          // Skip if already has alt text
          if (img.hasAttribute('alt') && img.alt.trim() !== '') {
            return;
          }

          // Generate and set alt text
          let altText = generateDynamicAltText(img);
          img.setAttribute('alt', altText);
          count++;
        } catch (e) { /* silent */ }
      });

      if (count > 0) {
      }
    } catch (e) { /* silent */ }
  }

  /**
   * Add width and height attributes to images based on rendered dimensions
   */
  function addImageDimensions() {
    try {
      const images = document.querySelectorAll('img');
      let count = 0;

      images.forEach(img => {
        try {
          // Skip if already has width and height attributes
          if (img.hasAttribute('width') && img.hasAttribute('height')) {
            return;
          }

          // Wait for image to load if not already loaded
          if (img.complete && img.naturalWidth > 0) {
            setDimensions(img);
          } else {
            img.addEventListener('load', function() {
              setDimensions(img);
            }, { once: true });
          }

          function setDimensions(image) {
            try {
              const width = image.naturalWidth || image.width;
              const height = image.naturalHeight || image.height;

              if (width > 0 && height > 0) {
                if (!image.hasAttribute('width')) {
                  image.setAttribute('width', width);
                }
                if (!image.hasAttribute('height')) {
                  image.setAttribute('height', height);
                }
                count++;
              }
            } catch (e) { /* silent */ }
          }
        } catch (e) { /* silent */ }
      });

    } catch (e) { /* silent */ }
  }

  /**
   * Update z-index of repWebClientContainer
   */
  function updateRepWebClientZIndex() {
    try {
      const updateZIndex = function() {
        try {
          const repContainer = document.getElementById('repWebClientContainer');
          if (repContainer && repContainer.style.zIndex !== '9998') {
            repContainer.style.zIndex = '9998';
          }
        } catch (e) {
          console.error('[DGF Footer] Error updating repWebClientContainer z-index:', e);
        }
      };

      // Tentar atualizar elemento existente
      updateZIndex();

      // Criar MutationObserver para detectar quando o elemento aparece
      const observer = new MutationObserver(function(mutations) {
        try {
          for (const mutation of mutations) {
            if (mutation.addedNodes.length) {
              const repContainer = document.getElementById('repWebClientContainer');
              if (repContainer) {
                updateZIndex();
              }
            }
          }
        } catch (e) {
          console.error('[DGF Footer] Error in MutationObserver:', e);
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });


    } catch (error) {
      console.error('[DGF Footer] Error setting up repWebClientContainer z-index observer:', error);
    }
  }

  /**
   * Append custom div after checkout button in Rebuy cart
   */
  function appendDivToRebuyCart() {
    try {
      let isObserving = false;

      const insertDiv = function() {
        try {
          const actionsElement = document.querySelector('.rebuy-cart__flyout-actions');
          const checkoutButton = actionsElement?.querySelector('.rebuy-cart__checkout-button');

          if (actionsElement && checkoutButton && !actionsElement.querySelector('.dgf-cart-icn')) {
            const customDiv = document.createElement('div');
            customDiv.className = 'dgf-cart-icn';
            customDiv.style.display = 'flex';
            customDiv.style.gap = '3rem';
            customDiv.style.alignItems = 'center';
            customDiv.style.justifyContent = 'center';
            customDiv.style.marginTop = '1rem';

            customDiv.innerHTML = `
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <svg width="15" height="18" viewBox="0 0 15 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4.65039 8.6499L6.65039 10.6499L10.1504 6.1499M7.15039 0.649902C4.40749 1.94548 3.0984 2.43512 0.650391 3.42541V8.81317C0.650391 11.9152 3.85706 14.3642 7.15039 16.6499C10.4437 14.3642 13.6504 11.9152 13.6504 8.81317V3.42541C11.2024 2.43512 9.89329 1.94548 7.15039 0.649902Z" stroke="#586A67" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span style="color: #586A67; font-size: 12px;">Secure checkout</span>
              </div>
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3.88849 9.79276C4.49801 12.5356 7.31706 13.4118 8.65039 13.4118C9.98372 13.4118 12.6123 12.5356 13.2218 9.79276M5.98372 6.36419V7.12609M5.98372 7.12609V7.888M5.98372 7.12609H5.22182M5.98372 7.12609H6.74563M11.1266 6.36419V7.12609M11.1266 7.12609V7.888M11.1266 7.12609H11.8885M11.1266 7.12609H10.3647M16.6504 8.6499C16.6504 13.0682 13.0687 16.6499 8.65039 16.6499C4.23211 16.6499 0.650391 13.0682 0.650391 8.6499C0.650391 4.23162 4.23211 0.649902 8.65039 0.649902C13.0687 0.649902 16.6504 4.23162 16.6504 8.6499Z" stroke="#586A67" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span style="color: #586A67; font-size: 12px;">Money-Back Guarantee*</span>
              </div>
            `;

            checkoutButton.insertAdjacentElement('afterend', customDiv);
          }
        } catch (e) {
          console.error('[DGF Footer] Error inserting custom div:', e);
        }
      };

      // Tentar inserir se o elemento já existe
      insertDiv();

      // Evitar criar múltiplos observers
      if (isObserving) return;

      // Criar MutationObserver para detectar quando o elemento aparece
      const observer = new MutationObserver(function(mutations) {
        try {
          for (const mutation of mutations) {
            if (mutation.addedNodes.length) {
              const actionsElement = document.querySelector('.rebuy-cart__flyout-actions');
              if (actionsElement) {
                insertDiv();
              }
            }
          }
        } catch (e) {
          console.error('[DGF Footer] Error in MutationObserver:', e);
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      isObserving = true;

    } catch (error) {
      console.error('[DGF Footer] Error setting up Rebuy cart custom div:', error);
    }
  }

  /**
   * Update Rebuy Cart discount amount text
   */
  function updateRebuyDiscountText() {
    try {
      const TARGET_TEXT = 'Savings Applied In Checkout!';
      let isObserving = false;

      const updateText = function(span) {
        try {
          if (span && span.textContent !== TARGET_TEXT && !span.hasAttribute('data-dgf-updated')) {
            span.textContent = TARGET_TEXT;
            span.setAttribute('data-dgf-updated', 'true');
          }

          // Aplicar estilos no elemento pai .rebuy-cart__flyout-discount-amount
          const discountElement = span.closest('.rebuy-cart__flyout-discount-amount');
          if (discountElement && !discountElement.hasAttribute('data-dgf-styled')) {
            discountElement.style.backgroundColor = '#D5E4E1';
            discountElement.style.padding = '0.2rem 3rem';
            discountElement.setAttribute('data-dgf-styled', 'true');
          }
        } catch (e) {
          console.error('[DGF Footer] Error updating span text:', e);
        }
      };

      // Tentar atualizar elemento existente
      const existingSpan = document.querySelector('.rebuy-cart__flyout-discount-amount span');
      if (existingSpan) {
        updateText(existingSpan);
      }

      // Evitar criar múltiplos observers
      if (isObserving) return;

      // Criar MutationObserver para detectar quando o elemento aparece
      const observer = new MutationObserver(function(mutations) {
        try {
          for (const mutation of mutations) {
            // Verificar nós adicionados
            if (mutation.addedNodes.length) {
              const span = document.querySelector('.rebuy-cart__flyout-discount-amount span');
              if (span) {
                updateText(span);
              }
            }

            // Verificar mudanças de texto no próprio span
            if (mutation.type === 'characterData' || mutation.type === 'childList') {
              const target = mutation.target;
              if (target.nodeType === Node.TEXT_NODE) {
                const parentSpan = target.parentElement;
                if (parentSpan && parentSpan.closest('.rebuy-cart__flyout-discount-amount')) {
                  updateText(parentSpan);
                }
              } else if (target.classList && target.classList.contains('rebuy-cart__flyout-discount-amount')) {
                const span = target.querySelector('span');
                if (span) {
                  updateText(span);
                }
              }
            }
          }
        } catch (e) {
          console.error('[DGF Footer] Error in MutationObserver:', e);
        }
      });

      // Observar o documento inteiro para capturar quando o Rebuy cart for inserido
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true,
        characterDataOldValue: true
      });

      isObserving = true;

    } catch (error) {
      console.error('[DGF Footer] Error setting up Rebuy discount text observer:', error);
    }
  }

  /**
   * Add aria-label to links without discernible name
   */
  function addLinkAriaLabels() {
    try {
      const links = document.querySelectorAll('a');
      let count = 0;

      links.forEach(link => {
        try {
          // Skip if already has aria-label or aria-labelledby
          if (link.hasAttribute('aria-label') || link.hasAttribute('aria-labelledby')) {
            return;
          }

          // Get text content
          const textContent = link.textContent.trim();

          // Skip if link has visible text
          if (textContent.length > 0) {
            return;
          }

          // Generate aria-label based on context
          let ariaLabel = '';

          // 1. Check for title attribute
          if (link.title) {
            ariaLabel = link.title;
          }
          // 2. Check for image alt text
          else {
            const img = link.querySelector('img');
            if (img && img.alt) {
              ariaLabel = img.alt;
            }
          }
          // 3. Check for icon classes
          if (!ariaLabel) {
            const classList = link.className || '';
            if (classList.includes('facebook')) ariaLabel = 'Facebook';
            else if (classList.includes('instagram')) ariaLabel = 'Instagram';
            else if (classList.includes('twitter')) ariaLabel = 'Twitter';
            else if (classList.includes('youtube')) ariaLabel = 'YouTube';
            else if (classList.includes('linkedin')) ariaLabel = 'LinkedIn';
            else if (classList.includes('pinterest')) ariaLabel = 'Pinterest';
            else if (classList.includes('cart')) ariaLabel = 'Shopping cart';
            else if (classList.includes('search')) ariaLabel = 'Search';
            else if (classList.includes('menu')) ariaLabel = 'Menu';
            else if (classList.includes('close')) ariaLabel = 'Close';
          }
          // 4. Check href for context
          if (!ariaLabel) {
            const href = link.href || '';
            if (href.includes('facebook.com')) ariaLabel = 'Facebook';
            else if (href.includes('instagram.com')) ariaLabel = 'Instagram';
            else if (href.includes('twitter.com') || href.includes('x.com')) ariaLabel = 'Twitter';
            else if (href.includes('youtube.com')) ariaLabel = 'YouTube';
            else if (href.includes('linkedin.com')) ariaLabel = 'LinkedIn';
            else if (href.includes('pinterest.com')) ariaLabel = 'Pinterest';
            else if (href.includes('/cart')) ariaLabel = 'Shopping cart';
            else if (href.includes('/search')) ariaLabel = 'Search';
            else if (href.includes('/products/')) {
              const productHandle = href.split('/products/')[1]?.split('?')[0];
              if (productHandle) {
                ariaLabel = productHandle.replace(/-/g, ' ');
              }
            }
          }
          // 5. Fallback
          if (!ariaLabel) {
            ariaLabel = 'Link';
          }

          // Set aria-label
          link.setAttribute('aria-label', ariaLabel);
          count++;
        } catch (e) { /* silent */ }
      });
    } catch (e) { /* silent */ }
  }

  /**
   * Fix Superior Title Italic font-style for Safari
   */
  function fixSuperiorTitleItalic() {
    try {
      var allElements = document.querySelectorAll('*');
      allElements.forEach(function(el) {
        try {
          var fontFamily = window.getComputedStyle(el).fontFamily;
          if (fontFamily && fontFamily.indexOf('Superior Title Italic') !== -1) {
            el.style.fontStyle = 'italic';
          }
        } catch (e) { /* silent */ }
      });
    } catch (e) { /* silent */ }
  }

  // Initialize when DOM is ready
  document.addEventListener('DOMContentLoaded', function() {
    try {

      // Add alt text to images
      addMissingAltText();

      // Add width and height attributes to images
      //addImageDimensions();

      // Add aria-label to links without discernible name
      addLinkAriaLabels();

      // Update Rebuy cart discount text
      updateRebuyDiscountText();

      // Append custom div to Rebuy cart
      appendDivToRebuyCart();

      // Fix Superior Title Italic font-style
      fixSuperiorTitleItalic();

      // Re-run after dynamic content loads (for lazy-loaded images and dynamic links)
      setTimeout(function() {
        addMissingAltText();
       // addImageDimensions();
        addLinkAriaLabels();
        updateRebuyDiscountText();
        fixSuperiorTitleItalic();
      }, 2000);
    } catch (e) { /* silent */ }
  });

})();
