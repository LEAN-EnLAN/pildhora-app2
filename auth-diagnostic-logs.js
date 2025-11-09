// Authentication Diagnostic Logging Script
// Adds detailed logging to track authentication flow timing and identify race conditions
// Copy and paste this into the browser console when the app is running on http://localhost:8085

function addAuthDiagnosticLogs() {
  console.log('=== AUTHENTICATION DIAGNOSTIC LOGGING ENABLED ===');
  
  // Store original functions
  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;
  
  // Create enhanced logging with timestamps
  const logWithTimestamp = (type, ...args) => {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [AUTH-DEBUG]`;
    
    if (type === 'log') {
      originalConsoleLog(prefix, ...args);
    } else if (type === 'error') {
      originalConsoleError(prefix, ...args);
    } else if (type === 'warn') {
      originalConsoleWarn(prefix, ...args);
    }
  };
  
  // Override console methods for auth-related logs
  console.log = function(...args) {
    if (args[0] && typeof args[0] === 'string' && 
        (args[0].includes('[Auth]') || args[0].includes('[Index]') || 
         args[0].includes('[Login]') || args[0].includes('[Signup]') ||
         args[0].includes('[Firebase]'))) {
      logWithTimestamp('log', ...args);
    } else {
      originalConsoleLog(...args);
    }
  };
  
  console.error = function(...args) {
    if (args[0] && typeof args[0] === 'string' && 
        (args[0].includes('[Auth]') || args[0].includes('[Firebase]'))) {
      logWithTimestamp('error', ...args);
    } else {
      originalConsoleError(...args);
    }
  };
  
  console.warn = function(...args) {
    if (args[0] && typeof args[0] === 'string' && 
        (args[0].includes('[Auth]') || args[0].includes('[Firebase]'))) {
      logWithTimestamp('warn', ...args);
    } else {
      originalConsoleWarn(...args);
    }
  };
  
  // Monitor Redux store changes
  if (window.__REDUX_STORE__) {
    const store = window.__REDUX_STORE__;
    let previousState = null;
    
    store.subscribe(() => {
      const currentState = store.getState();
      
      if (currentState.auth !== previousState?.auth) {
        const authState = currentState.auth;
        
        logWithTimestamp('log', 'Redux Auth State Changed:', {
          isAuthenticated: authState.isAuthenticated,
          initializing: authState.initializing,
          loading: authState.loading,
          hasUser: !!authState.user,
          userId: authState.user?.id,
          userRole: authState.user?.role,
          error: authState.error
        });
        
        // Detect potential race conditions
        if (authState.initializing && authState.isAuthenticated) {
          logWithTimestamp('warn', 'POTENTIAL RACE CONDITION: Both initializing and authenticated');
        }
        
        if (authState.loading && authState.initializing) {
          logWithTimestamp('warn', 'POTENTIAL RACE CONDITION: Both loading and initializing');
        }
        
        previousState = currentState;
      }
    });
    
    logWithTimestamp('log', 'Redux store monitoring enabled');
  } else {
    logWithTimestamp('warn', 'Redux store not found - monitoring not available');
  }
  
  // Monitor navigation events
  let currentPath = window.location.pathname;
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;
  
  history.pushState = function(...args) {
    const result = originalPushState.apply(this, args);
    const newPath = window.location.pathname;
    
    if (newPath !== currentPath) {
      logWithTimestamp('log', 'Navigation occurred:', {
        from: currentPath,
        to: newPath,
        method: 'pushState'
      });
      currentPath = newPath;
    }
    
    return result;
  };
  
  history.replaceState = function(...args) {
    const result = originalReplaceState.apply(this, args);
    const newPath = window.location.pathname;
    
    if (newPath !== currentPath) {
      logWithTimestamp('log', 'Navigation occurred:', {
        from: currentPath,
        to: newPath,
        method: 'replaceState'
      });
      currentPath = newPath;
    }
    
    return result;
  };
  
  // Monitor Firebase initialization (if accessible)
  const checkFirebaseState = () => {
    // Try to detect Firebase initialization state
    const appElement = document.getElementById('root');
    if (appElement) {
      const hasLoadingIndicator = appElement.querySelector('ActivityIndicator, [role="progressbar"]');
      if (hasLoadingIndicator) {
        logWithTimestamp('log', 'Loading indicator detected - app may be initializing');
      }
    }
    
    // Check for Firebase-related global variables
    if (window.firebase) {
      logWithTimestamp('log', 'Firebase global object found');
    }
    
    if (window.__FIREBASE__) {
      logWithTimestamp('log', 'Firebase instance found');
    }
  };
  
  // Check Firebase state every 2 seconds for the first 30 seconds
  let firebaseCheckCount = 0;
  const firebaseCheckInterval = setInterval(() => {
    checkFirebaseState();
    firebaseCheckCount++;
    
    if (firebaseCheckCount >= 15) { // 15 * 2 seconds = 30 seconds
      clearInterval(firebaseCheckInterval);
      logWithTimestamp('log', 'Firebase monitoring completed');
    }
  }, 2000);
  
  // Add timing measurement for key operations
  const timingMeasurements = {};
  
  window.measureAuthTiming = {
    start: (operation) => {
      timingMeasurements[operation] = { start: performance.now() };
      logWithTimestamp('log', `Started timing: ${operation}`);
    },
    
    end: (operation) => {
      if (timingMeasurements[operation]) {
        const duration = performance.now() - timingMeasurements[operation].start;
        logWithTimestamp('log', `Completed timing: ${operation} (${duration.toFixed(2)}ms)`);
        delete timingMeasurements[operation];
      }
    }
  };
  
  logWithTimestamp('log', 'Diagnostic logging fully enabled');
  logWithTimestamp('log', 'Use window.measureAuthTiming.start("operation") and window.measureAuthTiming.end("operation") to measure specific operations');
  
  return {
    disable: () => {
      console.log = originalConsoleLog;
      console.error = originalConsoleError;
      console.warn = originalConsoleWarn;
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
      clearInterval(firebaseCheckInterval);
      logWithTimestamp('log', 'Diagnostic logging disabled');
    }
  };
}

// Make the function available globally
window.addAuthDiagnosticLogs = addAuthDiagnosticLogs;

console.log('=== AUTHENTICATION DIAGNOSTIC SCRIPT LOADED ===');
console.log('Run addAuthDiagnosticLogs() to enable detailed authentication logging');