import jwt from 'jsonwebtoken';
import { JWT_SECRET, ROLES } from '../utils/constants.js';
import { errorResponse } from '../utils/responseFormatter.js';
import * as guestService from '../services/guestService.js';

/**
 * Validates the JWT present in the Authorization header and attaches the
 * decoded user payload, plus role and guest identity, to req.user.
 */
export async function authenticateToken(request, response, next) {
  const authHeader = request.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null;

  if (!token) {
    return response.status(401).json(
      errorResponse('Authentication required. Please sign in.')
    );
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    request.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      guestId: decoded.guestId || null,
      staffId: decoded.staffId || null,
      firstName: decoded.firstName || null,
      lastName: decoded.lastName || null,
    };

    if (!request.user.guestId && decoded.userId) {
      try {
        const guest = await guestService.getGuestByUserId(decoded.userId);
        if (guest) {
          request.user.guestId = guest.guest_id || guest.id;
        }
      } catch (err) {
        // Proceed with token information
      }
    }

    return next();
  } catch (jwtError) {
    return response.status(401).json(
      errorResponse('Session expired or invalid. Please sign in again.')
    );
  }
}

/**
 * Restricts a route to one or more roles. Must be used after authenticateToken.
 */
export function authorizeRoles(...allowedRoles) {
  return (request, response, next) => {
    if (!request.user || !request.user.role) {
      return response.status(401).json(
        errorResponse('Authentication required.')
      );
    }

    const userRole = request.user.role.toUpperCase();
    const hasPermission = allowedRoles.some(r => r.toUpperCase() === userRole);

    if (!hasPermission) {
      return response.status(403).json(
        errorResponse(`Forbidden: Access denied. Required role(s): ${allowedRoles.join(', ')}.`)
      );
    }

    return next();
  };
}

/**
 * Guards that a guest may only access their own resources.
 */
export function requireGuestOwnership(resourceKey = 'guestId') {
  return (request, response, next) => {
    if (!request.user) {
      return response.status(401).json(errorResponse('Authentication required.'));
    }

    if (request.user.role !== (ROLES?.GUEST || 'GUEST')) {
      return next();
    }

    const ownedId = Number(request.params[resourceKey] ?? request.params.id);
    if (request.user.guestId && ownedId === request.user.guestId) {
      return next();
    }

    return response.status(403).json(
      errorResponse('Forbidden: You can only access your own reservations.')
    );
  };
}