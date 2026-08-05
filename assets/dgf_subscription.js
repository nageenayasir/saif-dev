/*
* Digiflow NYC - Subscription Limiter - Max 3 per product
* This script is used to limit the number of subscription products that can be added to the cart
*Author: Rodrigo Gesser
*Date: 2025-09-08
*Version: 1.0.1
*/

// Subscription Limiter - Max 3 per product
(function() {
  'use strict';
  
  const MAX_SUBSCRIPTION_PER_PRODUCT = 3;
  
  // Notification function
  function showNotification(message, type = 'warning') {
    try {
      // Remove existing notification
      const existingNotification = document.getElementById('subscription-notification');
      if (existingNotification) {
        existingNotification.remove();
      }
      
      // Find insertion point (progress bar or cart container)
      let container = document.querySelector('.rebuy-cart__progress-bar-container') || 
                     document.querySelector('.rebuy-cart') ||
                     document.querySelector('[data-rebuy-id="cart"]') ||
                     document.body;
      
      // Create notification
      const notification = document.createElement('div');
      notification.id = 'subscription-notification';
      notification.style.cssText = `
        background: rgba(255, 107, 107, 0.1);
        color: #d63031;
        margin: 12px;
        padding: 12px 16px;
        border-radius: 8px;
        border: 1px solid rgba(255, 107, 107, 0.3);
        font-size: 13px;
        font-weight: 500;
        position: relative;
        z-index: 9999;
      `;
      
      notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
          <span>⚠️</span>
          <span>${message}</span>
        </div>
      `;
      
      // Insert notification
      if (container === document.body) {
        notification.style.position = 'fixed';
        notification.style.top = '20px';
        notification.style.right = '20px';
      }
      
      container.appendChild(notification);
      
      // Auto remove after 4 seconds
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 4000);
      
    } catch (e) { null; }
  }
  
  // Intercept cart requests and add to cart requests
  function setupCartInterceptor() {
    try {
      const originalFetch = window.fetch;
      
      window.fetch = async function(...args) {
        try {
          const [url, options] = args;
          
          
          if (typeof url === 'string' && (url.includes('/cart') || url.includes('/cart/add')) && options?.body) {
            try {
              let parsedBody = {};
              let quantity = 1;
              let hasSellingPlan = null;
              let lineNumber = null;
              
              // Handle JSON body (for /cart/add.js)
              if (typeof options.body === 'string' && options.body.startsWith('{')) {
                try {
                  const jsonBody = JSON.parse(options.body);
                  
                  if (jsonBody.items && jsonBody.items.length > 0) {
                    const item = jsonBody.items[0];
                    quantity = parseInt(item.quantity || '1');
                    hasSellingPlan = item.selling_plan;
                    parsedBody = { quantity: item.quantity, selling_plan: item.selling_plan };
                  }
                } catch (e) { null; }
              }
              // Handle URLSearchParams body (for traditional form submissions)
              else if (typeof options.body === 'string') {
                try {
                  const urlParams = new URLSearchParams(options.body);
                  parsedBody = Object.fromEntries(urlParams.entries());
                  quantity = parseInt(parsedBody.quantity || '1');
                  hasSellingPlan = parsedBody.selling_plan;
                  lineNumber = parsedBody.line;
                } catch (e) { null; }
              }
              
              
              let isLineSubscription = false;
              
              // Handle add to cart requests (only for subscription products)
              if (url.includes('/cart/add') && hasSellingPlan) {
                
                // Get current cart to check existing quantities for THIS subscription product
                try {
                  const cartResponse = await originalFetch.call(this, '/cart.json');
                  const cartData = await cartResponse.json();
                  
                  let productId = null;
                  let sellingPlanId = hasSellingPlan;
                  
                  // Extract product ID from the request
                  if (typeof options.body === 'string' && options.body.startsWith('{')) {
                    const jsonBody = JSON.parse(options.body);
                    if (jsonBody.items && jsonBody.items.length > 0) {
                      productId = jsonBody.items[0].id;
                    }
                  }
                  
                  // Find existing quantity of the same subscription product
                  let existingQuantity = 0;
                  if (productId && sellingPlanId && cartData.items) {
                    for (const item of cartData.items) {
                      if (item.variant_id.toString() === productId.toString() && 
                          item.selling_plan_allocation && 
                          item.selling_plan_allocation.selling_plan.id.toString() === sellingPlanId.toString()) {
                        existingQuantity += item.quantity;
                      }
                    }
                  }
                  
                  const totalQuantity = existingQuantity + quantity;
                  
                  if (totalQuantity > MAX_SUBSCRIPTION_PER_PRODUCT) {
                    const allowedQuantity = Math.max(0, MAX_SUBSCRIPTION_PER_PRODUCT - existingQuantity);
                
                    // Handle JSON body modification
                    if (typeof options.body === 'string' && options.body.startsWith('{')) {
                      try {
                        const jsonBody = JSON.parse(options.body);
                        if (jsonBody.items && jsonBody.items.length > 0) {
                          jsonBody.items[0].quantity = allowedQuantity.toString();
                          options.body = JSON.stringify(jsonBody);
                        }
                      } catch (e) { null; }
                    }
                    // Handle URLSearchParams body modification
                    else if (typeof options.body === 'string') {
                      try {
                        const urlParams = new URLSearchParams(options.body);
                        urlParams.set('quantity', allowedQuantity.toString());
                        options.body = urlParams.toString();
                      } catch (e) { null; }
                    }
                    
                    setTimeout(() => {
                      try {
                        if (allowedQuantity === 0) {
                          showNotification(`You already have the maximum of ${MAX_SUBSCRIPTION_PER_PRODUCT} units for this subscription product.`, 'warning');
                        } else {
                          showNotification(`Only ${allowedQuantity} unit(s) added to maintain the ${MAX_SUBSCRIPTION_PER_PRODUCT} unit limit for subscription products.`, 'warning');
                        }
                      } catch (e) { null; }
                    }, 1000);
                  }
                } catch (e) { null; }
              }
              // Handle cart update requests (includes /cart/update.js, /cart/change.js, etc.)
              else if (url.includes('/cart') && !url.includes('/cart/add')) {
                // Check if this is a subscription update (either has selling_plan or line item is subscription)
                const itemId = parsedBody.id;
                if (!hasSellingPlan && (lineNumber || itemId)) {
                  try {
                    const cartResponse = await originalFetch.call(this, '/cart.json');
                    const cartData = await cartResponse.json();
                    
                    let targetItem = null;
                    if (lineNumber) {
                      // For line-based updates
                      const lineIndex = parseInt(lineNumber) - 1;
                      targetItem = cartData.items[lineIndex];
                    } else if (itemId) {
                      // For id-based updates (like /cart/change.js)
                      targetItem = cartData.items.find(item => {
                        const itemKey = `${item.variant_id}:${item.key.split(':')[1]}`;
                        return itemKey === itemId || item.key === itemId;
                      });
                    }
                    
                    if (targetItem && targetItem.selling_plan_allocation) {
                      isLineSubscription = true;
                    }
                  } catch (e) { null; }
                }
                
                // Handle subscription updates - check for existing quantities of same product
                if (hasSellingPlan || isLineSubscription) {
                  
                  try {
                    const cartResponse = await originalFetch.call(this, '/cart.json');
                    const cartData = await cartResponse.json();
                    
                    let currentLineItem = null;
                    let currentItemIndex = -1;
                    
                    // Find the current item being updated
                    if (lineNumber) {
                      currentItemIndex = parseInt(lineNumber) - 1;
                      currentLineItem = cartData.items[currentItemIndex];
                    } else if (itemId) {
                      for (let i = 0; i < cartData.items.length; i++) {
                        const item = cartData.items[i];
                        const itemKey = `${item.variant_id}:${item.key.split(':')[1]}`;
                        if (itemKey === itemId || item.key === itemId) {
                          currentLineItem = item;
                          currentItemIndex = i;
                          break;
                        }
                      }
                    }
                    
                    if (currentLineItem && currentItemIndex >= 0) {
                      const productId = currentLineItem.variant_id;
                      let targetSellingPlanId = hasSellingPlan;
                      
                      
                      // If converting to subscription (hasSellingPlan exists)
                      if (hasSellingPlan) {
                        let existingSubscriptionQuantity = 0;
                        let hasExistingSubscription = false;
                        
                        // Find other subscription items of the same product with same selling plan (excluding current item)
                        for (let i = 0; i < cartData.items.length; i++) {
                          if (i !== currentItemIndex) {
                            const item = cartData.items[i];
                            if (item.variant_id === productId && 
                                item.selling_plan_allocation && 
                                item.selling_plan_allocation.selling_plan.id.toString() === targetSellingPlanId.toString()) {
                              existingSubscriptionQuantity += item.quantity;
                              hasExistingSubscription = true;
                            }
                          }
                        }
                        
                        
                        if (hasExistingSubscription) {
                          // Case 1: Already exists subscription with same product+plan, check total sum
                          const totalQuantity = existingSubscriptionQuantity + quantity;
                          if (totalQuantity > MAX_SUBSCRIPTION_PER_PRODUCT) {
                            const allowedQuantity = Math.max(0, MAX_SUBSCRIPTION_PER_PRODUCT - existingSubscriptionQuantity);
                            quantity = allowedQuantity;
                            
                            setTimeout(() => {
                              try {
                                if (allowedQuantity === 0) {
                                  showNotification(`Cannot convert - you already have the maximum of ${MAX_SUBSCRIPTION_PER_PRODUCT} units for this subscription product.`, 'warning');
                                } else {
                                  showNotification(`Quantity limited to ${allowedQuantity} to maintain the ${MAX_SUBSCRIPTION_PER_PRODUCT} unit limit for subscription products.`, 'warning');
                                }
                              } catch (e) { null; }
                            }, 1000);
                          }
                        } else {
                          // Case 2: No existing subscription with same product+plan, just check if current quantity > 3
                          if (quantity > MAX_SUBSCRIPTION_PER_PRODUCT) {
                            quantity = MAX_SUBSCRIPTION_PER_PRODUCT;
                            
                            setTimeout(() => {
                              try {
                                showNotification(`Subscription quantity limited to ${MAX_SUBSCRIPTION_PER_PRODUCT} units per product.`, 'warning');
                              } catch (e) { null; }
                            }, 1000);
                          }
                        }
                      }
                      // If updating existing subscription quantity
                      else if (isLineSubscription && quantity > MAX_SUBSCRIPTION_PER_PRODUCT) {
                        quantity = MAX_SUBSCRIPTION_PER_PRODUCT;
                        
                        setTimeout(() => {
                          try {
                            showNotification(`Subscription limit of ${MAX_SUBSCRIPTION_PER_PRODUCT} items per product maintained.`, 'warning');
                          } catch (e) { null; }
                        }, 1000);
                      }
                    }
                  } catch (e) { null; }
                }
                
                // Apply the final quantity limit (if it was modified above)
                if (hasSellingPlan || isLineSubscription) {
                  // Handle JSON body modification
                  if (typeof options.body === 'string' && options.body.startsWith('{')) {
                    try {
                      const jsonBody = JSON.parse(options.body);
                      if (jsonBody.items && jsonBody.items.length > 0) {
                        jsonBody.items[0].quantity = quantity.toString();
                        options.body = JSON.stringify(jsonBody);
                      }
                    } catch (e) { null; }
                  }
                  // Handle URLSearchParams body modification
                  else if (typeof options.body === 'string') {
                    try {
                      const urlParams = new URLSearchParams(options.body);
                      urlParams.set('quantity', quantity.toString());
                      options.body = urlParams.toString();
                    } catch (e) { null; }
                  }
                }
              }
            } catch (e) { null; }
          }
          
          return await originalFetch.apply(this, args);
        } catch (e) {
          return originalFetch.apply(this, args);
        }
      };
    } catch (e) { null; }
  }
  
  // Initialize
  function init() {
    try {
      setupCartInterceptor();
    } catch (e) { null; }
  }
  
  // Initialize when DOM is ready
  try {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  } catch (e) { null; }
  
})();