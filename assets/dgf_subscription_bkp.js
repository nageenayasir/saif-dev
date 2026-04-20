// Subscription products limiter - Per Product Limit (Max 3 per product)
(function() {
    'use strict';
    
    let MAX_SUBSCRIPTION_PER_PRODUCT = 3;
    let CHECK_INTERVAL = 2000;
    let DEBOUNCE_DELAY = 500;
    let CACHE_TTL = 1000;
    
    // Promise delay utility
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    
    // Optimized cache
    class CartCache {
      constructor(ttl = CACHE_TTL) {
        this.ttl = ttl;
        this.data = null;
        this.timestamp = 0;
      }
      
      set(data) {
        try {
          this.data = data;
          this.timestamp = Date.now();
        } catch (e) { null; }
      }
      
      get() {
        try {
          if (this.data && (Date.now() - this.timestamp) < this.ttl) {
            return this.data;
          }
          return null;
        } catch (e) { return null; }
      }
      
      clear() {
        try {
          this.data = null;
          this.timestamp = 0;
        } catch (e) { null; }
      }
    }
    
    // Async debouncer with Promises
    class AsyncDebouncer {
      constructor(delayMs) {
        this.delayMs = delayMs;
        this.currentExecution = null;
        this.abortController = null;
      }
      
      async execute(asyncFn) {
        try {
          // Cancel previous execution if exists
          if (this.abortController) {
            this.abortController.abort();
          }
          
          // Create new controller for this execution
          this.abortController = new AbortController();
          let signal = this.abortController.signal;
          
          try {
            // Wait for delay
            await delay(this.delayMs);
            
            // Check if not cancelled
            if (signal.aborted) {
              return null;
            }
            
            // Execute function
            this.currentExecution = asyncFn();
            let result = await this.currentExecution;
            
            return result;
          } catch (error) {
            if (error.name === 'AbortError') {
              return null;
            }
            throw error;
          } finally {
            this.currentExecution = null;
            this.abortController = null;
          }
        } catch (e) { return null; }
      }
      
      cancel() {
        try {
          if (this.abortController) {
            this.abortController.abort();
          }
        } catch (e) { null; }
      }
      
      get isExecuting() {
        try {
          return this.currentExecution !== null;
        } catch (e) { return false; }
      }
    }
    
    // Async interval manager
    class AsyncInterval {
      constructor(asyncFn, intervalMs) {
        this.asyncFn = asyncFn;
        this.intervalMs = intervalMs;
        this.isRunning = false;
        this.abortController = null;
      }
      
      async start() {
        try {
          if (this.isRunning) return;
          
          this.isRunning = true;
          this.abortController = new AbortController();
          
          try {
            await this._loop();
          } catch (error) {
            if (error.name !== 'AbortError') {
              // Silently ignore errors
            }
          }
        } catch (e) { null; }
      }
      
      async _loop() {
        try {
          while (this.isRunning && !this.abortController.signal.aborted) {
            try {
              await this.asyncFn();
            } catch (error) {
              // Silently ignore function errors
            }
            
            // Wait for next execution
            await delay(this.intervalMs);
          }
        } catch (e) { null; }
      }
      
      stop() {
        try {
          this.isRunning = false;
          if (this.abortController) {
            this.abortController.abort();
          }
        } catch (e) { null; }
      }
    }
    
    // Global state centralized
    let state = {
      cache: new CartCache(),
      debouncer: new AsyncDebouncer(DEBOUNCE_DELAY),
      monitorInterval: null,
      isAdjusting: false,
      requestInProgress: false
    };
    
    // Function to analyze subscription products by product ID
    function analyzeSubscriptionProducts(cart) {
      try {
        if (!cart?.items) return {};
        
        let productAnalysis = {};
        
        cart.items.forEach(item => {
          try {
            if (item.selling_plan_allocation) {
              let productId = item.product_id || item.id;
              let productTitle = item.product_title || item.title;
              
              if (!productAnalysis[productId]) {
                productAnalysis[productId] = {
                  title: productTitle,
                  totalQuantity: 0,
                  items: [],
                  exceedsLimit: false
                };
              }
              
              productAnalysis[productId].totalQuantity += item.quantity;
              productAnalysis[productId].items.push({
                ...item,
                cartIndex: cart.items.findIndex(cartItem => cartItem.key === item.key)
              });
              
              if (productAnalysis[productId].totalQuantity > MAX_SUBSCRIPTION_PER_PRODUCT) {
                productAnalysis[productId].exceedsLimit = true;
              }
            }
          } catch (e) { null; }
        });
        
        return productAnalysis;
      } catch (e) { return {}; }
    }
    
    // Function to check if any product exceeds the limit
    function hasProductsExceedingLimit(productAnalysis) {
      try {
        return Object.values(productAnalysis).some(product => product.exceedsLimit);
      } catch (e) { return false; }
    }
    
    // Optimized fetch with cache
    async function fetchCartData(forceRefresh = false) {
      try {
        if (state.requestInProgress && !forceRefresh) {
          return null;
        }
        
        if (!forceRefresh) {
          let cached = state.cache.get();
          if (cached) return cached;
        }
        
        state.requestInProgress = true;
        
        try {
          let response = await fetch('/cart.json', {
            method: 'GET',
            headers: {
              'Cache-Control': 'no-cache',
              'X-Requested-With': 'XMLHttpRequest'
            }
          });
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }
          
          let cartData = await response.json();
          state.cache.set(cartData);
          
          return cartData;
        } catch (error) {
          return null;
        } finally {
          state.requestInProgress = false;
        }
      } catch (e) { return null; }
    }
    
    // Button management
    let buttonManager = {
      selectors: [
        '.rebuy-button.rebuy-cart__checkout-button',
        '.rebuy-cart__checkout-button',
        '.rebuy-button[data-checkout]',
        '[data-rebuy-checkout]',
        '.checkout-button'
      ],
      
      disable() {
        try {
          let buttons = document.querySelectorAll(this.selectors.join(', '));
          buttons.forEach(button => {
            try {
              if (!button.hasAttribute('data-limiter-disabled')) {
                button.setAttribute('data-limiter-disabled', 'true');
                button.disabled = true;
                Object.assign(button.style, {
                  opacity: '0.6',
                  cursor: 'not-allowed'
                });
              }
            } catch (e) { null; }
          });
        } catch (e) { null; }
      },
      
      enable() {
        try {
          let buttons = document.querySelectorAll('[data-limiter-disabled]');
          buttons.forEach(button => {
            try {
              button.removeAttribute('data-limiter-disabled');
              button.disabled = false;
              Object.assign(button.style, {
                opacity: '',
                cursor: ''
              });
            } catch (e) { null; }
          });
        } catch (e) { null; }
      }
    };
    
    // In-cart notification - inserted below progress bar
    async function showNotification(message, type = 'warning') {
      try {
        // Remove existing notification
        let existingNotification = document.getElementById('subscription-notification');
        if (existingNotification) {
          try {
            existingNotification.remove();
          } catch (e) { null; }
        }
        
        // Find the target container (progress bar container)
        let progressContainer = document.querySelector('.rebuy-cart__progress-bar-container.above');
        if (!progressContainer) {
          // Fallback to any progress container
          progressContainer = document.querySelector('.rebuy-cart__progress-bar-container');
        }
        
        if (!progressContainer) {
          return; // Can't find insertion point
        }
        
        // Define notification styles based on type (more subtle/transparent)
        let styles = {
          warning: {
            background: 'rgba(255, 107, 107, 0.08)',
            borderColor: 'rgba(255, 107, 107, 0.2)',
            textColor: '#d63031',
            icon: '⚠️'
          },
          success: {
            background: 'rgba(78, 205, 196, 0.08)',
            borderColor: 'rgba(78, 205, 196, 0.2)',
            textColor: '#00b894',
            icon: '✓'
          },
          info: {
            background: 'rgba(79, 195, 247, 0.08)',
            borderColor: 'rgba(79, 195, 247, 0.2)',
            textColor: '#0984e3',
            icon: 'i'
          }
        };
        
        let currentStyle = styles[type] || styles.warning;
        
        // Create notification element
        let notification = document.createElement('div');
        notification.id = 'subscription-notification';
        notification.style.cssText = `
          background: ${currentStyle.background};
          color: ${currentStyle.textColor};
          margin: 12px 20px 0 20px;
          padding: 12px 16px;
          border-radius: 8px;
          border: 1px solid ${currentStyle.borderColor};
          font-size: 13px;
          font-weight: 500;
          line-height: 1.3;
          transition: all 0.3s ease;
          opacity: 0;
          transform: translateY(-8px);
        `;
        
        notification.innerHTML = `
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="
              font-size: 14px; 
              flex-shrink: 0;
              display: flex;
              align-items: center;
              justify-content: center;
              width: 16px;
              height: 16px;
            ">${currentStyle.icon}</span>
            <span style="
              flex: 1; 
              font-weight: 500;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            ">${message}</span>
          </div>
        `;
        
        try {
          // Insert after progress container
          progressContainer.parentNode.insertBefore(notification, progressContainer.nextSibling);
        } catch (e) { 
          // Fallback: append to progress container
          try {
            progressContainer.appendChild(notification);
          } catch (e2) { return; }
        }
        
        // Async entrance animation
        try {
          await delay(50);
          notification.style.opacity = '1';
          notification.style.transform = 'translateY(0)';
        } catch (e) { null; }
        
        // Async auto removal with smooth exit
        try {
          delay(4000).then(async () => {
            try {
              notification.style.opacity = '0';
              notification.style.transform = 'translateY(-8px)';
              await delay(300);
              if (notification.parentNode) {
                notification.remove();
              }
            } catch (e) { null; }
          });
        } catch (e) { null; }
      } catch (e) { null; }
    }
    
    // Main async function
    async function adjustCartToLimit() {
      try {
        if (state.isAdjusting) {
          return false;
        }
        
        state.isAdjusting = true;
        buttonManager.disable();
        
        try {
          let cart = await fetchCartData();
          if (!cart) {
            return false;
          }
          
          let productAnalysis = analyzeSubscriptionProducts(cart);
          
          if (!hasProductsExceedingLimit(productAnalysis)) {
            buttonManager.enable();
            return true;
          }
          
          // Removal logic for products exceeding limit
          try {
            let updates = {};
            let removedItems = [];
            
            for (let [productId, productData] of Object.entries(productAnalysis)) {
              try {
                if (!productData.exceedsLimit) continue;
                
                let totalToRemove = productData.totalQuantity - MAX_SUBSCRIPTION_PER_PRODUCT;
                
                // Sort items by cart index (maintain order)
                let sortedItems = productData.items.sort((a, b) => a.cartIndex - b.cartIndex);
                
                for (let item of sortedItems) {
                  try {
                    if (totalToRemove <= 0) break;
                    
                    let removeFromItem = Math.min(totalToRemove, item.quantity);
                    let newQuantity = item.quantity - removeFromItem;
                    
                    updates[item.key] = newQuantity;
                    totalToRemove -= removeFromItem;
                    
                    if (newQuantity === 0) {
                      removedItems.push(item.title);
                    }
                  } catch (e) { continue; }
                }
              } catch (e) { continue; }
            }
            
            // Cart update
            try {
              let updateResponse = await fetch('/cart/update.js', {
                method: 'POST',
                headers: { 
                  'Content-Type': 'application/json',
                  'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify({ updates })
              });
              
              if (!updateResponse.ok) {
                throw new Error(`Update failed: ${updateResponse.status}`);
              }
              
              let updatedCart = await updateResponse.json();
              state.cache.set(updatedCart);
              
              // Async notification with success type
              try {
                let message = `Subscription limit of ${MAX_SUBSCRIPTION_PER_PRODUCT} items per product maintained.`;
                if (removedItems.length > 0) {
                  message += ` Adjusted quantities for: ${removedItems.slice(0, 3).join(', ')}${removedItems.length > 3 ? '...' : ''}`;
                }
                await showNotification(message, 'warning');
              } catch (e) { null; }
              
              // Dispatch event after small async delay
              try {
                await delay(100);
                document.dispatchEvent(new CustomEvent('cart:updated', { 
                  detail: updatedCart,
                  bubbles: true 
                }));
              } catch (e) { null; }
              
              // Re-enable buttons after async delay
              try {
                await delay(500);
                buttonManager.enable();
              } catch (e) { null; }
              
              return true;
            } catch (e) { return false; }
          } catch (e) { return false; }
        } catch (error) {
          return false;
        } finally {
          state.isAdjusting = false;
          // Async fallback for re-enable
          try {
            delay(1000).then(() => buttonManager.enable());
          } catch (e) { null; }
        }
      } catch (e) { return false; }
    }
    
    // Async monitor
    async function monitorCart() {
      try {
        if (state.isAdjusting || state.requestInProgress) {
          return;
        }
        
        try {
          let cart = await fetchCartData();
          if (!cart) return;
          
          let productAnalysis = analyzeSubscriptionProducts(cart);
          
          if (hasProductsExceedingLimit(productAnalysis)) {
            // Execute adjust with async debounce
            try {
              await state.debouncer.execute(async () => {
                await adjustCartToLimit();
              });
            } catch (e) { null; }
          }
        } catch (error) {
          // Silently ignore errors
        }
      } catch (e) { null; }
    }
    
    // Interceptors with async delays
    function setupInterceptors() {
      try {
        let originalFetch = window.fetch;
        window.fetch = async function(...args) {
          try {
            let result = await originalFetch.apply(this, args);
            
            try {
              let [url] = args;
              if (typeof url === 'string' && url.includes('/cart/add')) {
                state.cache.clear();
                // Async delay before monitoring
                try {
                  delay(200).then(async () => {
                    try {
                      await state.debouncer.execute(async () => {
                        await monitorCart();
                      });
                    } catch (e) { null; }
                  });
                } catch (e) { null; }
              }
            } catch (e) { null; }
            
            return result;
          } catch (e) { return originalFetch.apply(this, args); }
        };
        
        // Event listeners with async delays
        try {
          let events = [
            'shopify:cart_item_added',
            'shopify:section:load',
            'cart:updated'
          ];
          
          events.forEach(eventName => {
            try {
              document.addEventListener(eventName, async () => {
                try {
                  state.cache.clear();
                  await state.debouncer.execute(async () => {
                    await monitorCart();
                  });
                } catch (e) { null; }
              });
            } catch (e) { null; }
          });
        } catch (e) { null; }
        
        // Form submit with async delay
        try {
          document.addEventListener('submit', async (event) => {
            try {
              let form = event.target;
              if (form.action?.includes('/cart/add')) {
                state.cache.clear();
                await delay(300);
                await state.debouncer.execute(async () => {
                  await monitorCart();
                });
              }
            } catch (e) { null; }
          });
        } catch (e) { null; }
      } catch (e) { null; }
    }
    
    // Async initialization
    async function init() {
      try {
        setupInterceptors();
        
        // Initial check
        try {
          let cart = await fetchCartData(true);
          if (cart) {
            let productAnalysis = analyzeSubscriptionProducts(cart);
            if (hasProductsExceedingLimit(productAnalysis)) {
              await adjustCartToLimit();
            }
          }
        } catch (e) { null; }
        
        // Start monitoring with AsyncInterval
        try {
          state.monitorInterval = new AsyncInterval(monitorCart, CHECK_INTERVAL);
          await state.monitorInterval.start();
        } catch (e) { null; }
      } catch (e) { null; }
    }
    
    // Debug API
    try {
      window.subscriptionLimiter = {
        async status() {
          try {
            let cart = await fetchCartData(true);
            let analysis = analyzeSubscriptionProducts(cart);
            let hasExceeded = hasProductsExceedingLimit(analysis);
            
            return { 
              productAnalysis: analysis,
              limitPerProduct: MAX_SUBSCRIPTION_PER_PRODUCT,
              hasExceededProducts: hasExceeded,
              isAdjusting: state.isAdjusting,
              isDebouncing: state.debouncer.isExecuting
            };
          } catch (e) { return null; }
        },
        
        adjust: async () => {
          try {
            return await adjustCartToLimit();
          } catch (e) { return null; }
        },
        
        clearCache: () => {
          try {
            state.cache.clear();
          } catch (e) { null; }
        },
        
        // For delay debugging
        testDelay: async (ms) => {
          try {
            console.time('delay-test');
            await delay(ms);
            console.timeEnd('delay-test');
          } catch (e) { null; }
        },
        
        // New method to check specific product
        async checkProduct(productId) {
          try {
            let cart = await fetchCartData(true);
            let analysis = analyzeSubscriptionProducts(cart);
            return analysis[productId] || null;
          } catch (e) { return null; }
        }
      };
    } catch (e) { null; }
    
    // Async cleanup
    try {
      window.addEventListener('beforeunload', async () => {
        try {
          if (state.monitorInterval) {
            state.monitorInterval.stop();
          }
          state.debouncer.cancel();
          buttonManager.enable();
        } catch (e) { null; }
      });
    } catch (e) { null; }
    
    // Conditional initialization
    try {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', async () => {
          try {
            await init();
          } catch (e) { null; }
        });
      } else {
        init().catch(e => null);
      }
    } catch (e) { null; }
    
})();
