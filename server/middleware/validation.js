/**
 * Validation Middleware
 * Request data validation
 */

/**
 * Validate email format
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 */
function isValidPassword(password) {
  // Minimum 8 characters, at least one letter and one number
  return password.length >= 8 && /[a-zA-Z]/.test(password) && /[0-9]/.test(password);
}

/**
 * Validate date format (YYYY-MM-DD)
 */
function isValidDate(dateString) {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;

  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
}

/**
 * Validate registration data
 */
function validateRegistration(req, res, next) {
  const { email, password, name } = req.body;

  const errors = [];

  // Email validation
  if (!email) {
    errors.push('Email is required');
  } else if (!isValidEmail(email)) {
    errors.push('Invalid email format');
  }

  // Password validation
  if (!password) {
    errors.push('Password is required');
  } else if (!isValidPassword(password)) {
    errors.push('Password must be at least 8 characters with letters and numbers');
  }

  // Name validation (optional)
  if (name && name.length > 255) {
    errors.push('Name is too long (max 255 characters)');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      errors
    });
  }

  next();
}

/**
 * Validate login data
 */
function validateLogin(req, res, next) {
  const { email, password } = req.body;

  const errors = [];

  if (!email) {
    errors.push('Email is required');
  }

  if (!password) {
    errors.push('Password is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      errors
    });
  }

  next();
}

/**
 * Validate sermon data
 */
function validateSermon(req, res, next) {
  const { title, date } = req.body;

  const errors = [];

  // Title validation
  if (!title) {
    errors.push('Title is required');
  } else if (title.length > 500) {
    errors.push('Title is too long (max 500 characters)');
  }

  // Date validation
  if (!date) {
    errors.push('Date is required');
  } else if (!isValidDate(date)) {
    errors.push('Invalid date format (use YYYY-MM-DD)');
  }

  // Optional field validations
  if (req.body.speaker && req.body.speaker.length > 255) {
    errors.push('Speaker name is too long (max 255 characters)');
  }

  if (req.body.series && req.body.series.length > 255) {
    errors.push('Series name is too long (max 255 characters)');
  }

  if (req.body.verseReference && req.body.verseReference.length > 255) {
    errors.push('Verse reference is too long (max 255 characters)');
  }

  if (req.body.tags && !Array.isArray(req.body.tags)) {
    errors.push('Tags must be an array');
  }

  if (req.body.notes && req.body.notes.length > 1048576) {
    errors.push('Notes are too long (max 1MB)');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      errors
    });
  }

  next();
}

/**
 * Validate sermon update data (fields are optional)
 */
function validateSermonUpdate(req, res, next) {
  const errors = [];

  if (req.body.title !== undefined) {
    if (!req.body.title || req.body.title.length === 0) {
      errors.push('Title cannot be empty');
    } else if (req.body.title.length > 500) {
      errors.push('Title is too long (max 500 characters)');
    }
  }

  if (req.body.date !== undefined && !isValidDate(req.body.date)) {
    errors.push('Invalid date format (use YYYY-MM-DD)');
  }

  if (req.body.speaker !== undefined && req.body.speaker.length > 255) {
    errors.push('Speaker name is too long (max 255 characters)');
  }

  if (req.body.series !== undefined && req.body.series.length > 255) {
    errors.push('Series name is too long (max 255 characters)');
  }

  if (req.body.verseReference !== undefined && req.body.verseReference.length > 255) {
    errors.push('Verse reference is too long (max 255 characters)');
  }

  if (req.body.tags !== undefined && !Array.isArray(req.body.tags)) {
    errors.push('Tags must be an array');
  }

  if (req.body.notes !== undefined && req.body.notes.length > 1048576) {
    errors.push('Notes are too long (max 1MB)');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      errors
    });
  }

  next();
}

/**
 * Validate pagination parameters
 */
function validatePagination(req, res, next) {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;

  if (page < 1) {
    return res.status(400).json({
      success: false,
      error: 'Page must be >= 1'
    });
  }

  if (limit < 1 || limit > 100) {
    return res.status(400).json({
      success: false,
      error: 'Limit must be between 1 and 100'
    });
  }

  req.pagination = { page, limit };
  next();
}

module.exports = {
  validateRegistration,
  validateLogin,
  validateSermon,
  validateSermonUpdate,
  validatePagination,
  isValidEmail,
  isValidPassword,
  isValidDate
};
