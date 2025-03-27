// middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
    console.error('Application error:', err);
    
    // Default error status
    const statusCode = err.statusCode || 500;
    
    // Check if this is an AJAX request
    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
      return res.status(statusCode).json({
        success: false,
        error: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred',
        details: process.env.NODE_ENV === 'development' ? err.stack : null
      });
    }
    
    // Render error page for normal requests
    res.status(statusCode).render('error', {
      title: 'Error',
      message: err.message || 'Something went wrong',
      error: process.env.NODE_ENV === 'development' ? err : {}
    });
  };
  
  module.exports = errorHandler;