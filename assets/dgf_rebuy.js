function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  async function getCartData() {
    try {
      const response = await fetch('/cart.js');
      if (!response.ok) throw new Error('Failed to fetch cart data');
      const cartData = await response.json();
      return cartData;
    } catch(e) {
      console.warn('Could not fetch cart data:', e);
      return null;
    }
  }
  
  function removeSubscriptionFromBundles() {
    try {
      const bundleItems = document.querySelectorAll('.rebuy-cart__flyout-item.tag-bundles');
      
      bundleItems.forEach((bundleItem) => {
        try {
          const subscriptionDiv = bundleItem.querySelector('.rebuy-cart__flyout-item-subscription');
          const subscriptionButton = bundleItem.querySelector('.rebuy-cart__flyout-item-subscription button');
          
          if (subscriptionDiv) {
            subscriptionDiv.remove();
          }
          
          if (subscriptionButton && subscriptionButton.parentNode !== subscriptionDiv) {
            subscriptionButton.remove();
          }
          
          const subscriptionElements = bundleItem.querySelectorAll('[class*="subscription"], [data-subscription], [id*="subscription"]');
          subscriptionElements.forEach((element) => {
            try {
              element.remove();
            } catch(e) { null; }
          });
        } catch(e) { null; }
      });
    } catch(e) { null; }
  }
  
  async function removeBuyMoreSaveMoreFromSellingPlanItems() {
    try {
      const cartData = await getCartData();
      if (!cartData || !cartData.items) return;
      
      // Get items that have selling_plan_allocation
      const itemsWithSellingPlan = cartData.items
        .filter(item => item.selling_plan_allocation)
        .map(item => ({
          variant_id: item.variant_id,
          key: item.key,
          id: item.id,
          handle: item.handle,
          product_id: item.product_id
        }));
  
      
      if (itemsWithSellingPlan.length === 0) return;
      
      // Remove buy-more-save-more elements only from items that have subscription frequency selector
      itemsWithSellingPlan.forEach((item) => {
        try {
          const productHandle = item.handle;
          
          // Find rebuy items that contain subscription frequency selector
          const rebuyItems = document.querySelectorAll(`.rebuy-cart__flyout-item`);
          
          rebuyItems.forEach((rebuyItem) => {
            // Look for the specific subscription frequency selector
            const hasSubscriptionSelector = rebuyItem.querySelector('select[aria-label*="Subscription delivery frequency"], select.rebuy-select');
            
            // Check for subscription frequency options text
            const hasFrequencyOptions = rebuyItem.innerHTML.includes('One-time only') && 
                                      (rebuyItem.innerHTML.includes('30 Days') || 
                                       rebuyItem.innerHTML.includes('45 Days') || 
                                       rebuyItem.innerHTML.includes('60 Days'));
            
            // Check for "Subscribe and Save" optgroup
            const hasSubscribeAndSave = rebuyItem.innerHTML.includes('Subscribe and Save');
            
            // Check if this item is for the correct product
            const isCorrectProduct = rebuyItem.classList.contains(`product-${productHandle}`);
            
            // Decision: Only remove if this item has subscription frequency selector AND is the correct product
            const shouldRemove = (hasSubscriptionSelector || hasFrequencyOptions || hasSubscribeAndSave) && isCorrectProduct;
            
            if (shouldRemove) {
              // Remove buy-more-save-more div from this item
              const buyMoreSaveMoreDiv = rebuyItem.querySelector('.rebuy-cart__flyout-item-buy-more-save-more');
              if (buyMoreSaveMoreDiv) {
                buyMoreSaveMoreDiv.remove();
              }
              
              // Remove any other buy-more-save-more related elements
              const buyMoreSaveMoreElements = rebuyItem.querySelectorAll('[class*="buy-more-save-more"], [data-buy-more-save-more], [id*="buy-more-save-more"]');
              buyMoreSaveMoreElements.forEach((element) => {
                try {
                  element.remove();
                } catch(e) { null; }
              });
            }
          });
        } catch(e) { 
          console.warn('Error processing selling plan item:', e, item);
        }
      });
      
    } catch(e) {
      console.warn('Error in removeBuyMoreSaveMoreFromSellingPlanItems:', e);
    }
  }
  
  async function updateSubscriptionVisibility() {
    try {
      removeSubscriptionFromBundles();
      await removeBuyMoreSaveMoreFromSellingPlanItems();
    } catch(e) { null; }
  }
  
  document.addEventListener('rebuy:smartcart.init', async () => {
    try {
      await delay(400);
      await updateSubscriptionVisibility();
      
      document.addEventListener('rebuy:cart.change', async () => {
        try {
          await delay(300);
          await updateSubscriptionVisibility();
        } catch(e) { null; }
      });
  
      document.addEventListener('rebuy:smartcart.show', async () => {
        try {
          await delay(500);
          await updateSubscriptionVisibility();
        } catch(e) { null; }
      });
  
      document.addEventListener('rebuy:cart.item-added', async () => {
        try {
          await delay(600);
          await updateSubscriptionVisibility();
        } catch(e) { null; }
      });
  
      document.addEventListener('rebuy:cart.item-removed', async () => {
        try {
          await delay(400);
          await updateSubscriptionVisibility();
        } catch(e) { null; }
      });
    } catch(e) { null; }
  });
  
  async function setupDOMObserver() {
    try {
      const observer = new MutationObserver(async (mutations) => {
        try {
          let shouldUpdate = false;
          
          mutations.forEach((mutation) => {
            try {
              if (mutation.type === 'childList') {
                mutation.addedNodes.forEach((node) => {
                  try {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                      if (node.classList?.contains('rebuy-cart__flyout-item') || 
                          node.querySelector?.('.rebuy-cart__flyout-item')) {
                        shouldUpdate = true;
                      }
                    }
                  } catch(e) { null; }
                });
              }
              
              if (mutation.type === 'attributes' && 
                  mutation.target.classList?.contains('rebuy-cart__flyout-item')) {
                shouldUpdate = true;
              }
            } catch(e) { null; }
          });
  
          if (shouldUpdate) {
            await delay(200);
            await updateSubscriptionVisibility();
          }
        } catch(e) { null; }
      });
  
      await delay(1000);
      try {
        const smartCartContainer = document.querySelector('#rebuy-smartcart') || 
                                  document.querySelector('.rebuy-cart') ||
                                  document.body;
        
        if (smartCartContainer) {
          observer.observe(smartCartContainer, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class']
          });
        }
      } catch(e) { null; }
    } catch(e) { null; }
  }
  
  document.addEventListener('DOMContentLoaded', async () => {
    try {
      setupDOMObserver();
      
      // Usando Promise com polling
      const checkForItems = async () => {
        try {
          const hasSmartCartItems = document.querySelectorAll('.rebuy-cart__flyout-item').length > 0;
          
          if (hasSmartCartItems) {
            await updateSubscriptionVisibility();
            return true;
          }
          return false;
        } catch(e) { 
          return false; 
        }
      };
  
      // Polling com Promise e async/await
      const pollForItems = async (maxAttempts = 15) => {
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
          const found = await checkForItems();
          if (found) break;
          await delay(1000);
        }
      };
  
      await pollForItems();
    } catch(e) { null; }
  });
  