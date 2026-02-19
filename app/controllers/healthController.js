import { sequelize } from '../database.js';
import { sendApiSuccess, sendApiError } from '../helpers/apiResponse.js';

const healthController = {
  liveness(req, res) {
    return sendApiSuccess(res, {
      ok: true,
      status: 'alive',
      timestamp: new Date().toISOString(),
      requestId: req.requestId || null,
    });
  },

  async readiness(req, res) {
    try {
      await sequelize.authenticate();
      return sendApiSuccess(res, {
        ok: true,
        status: 'ready',
        dependencies: {
          database: 'up',
        },
        timestamp: new Date().toISOString(),
        requestId: req.requestId || null,
      });
    } catch {
      return sendApiError(res, {
        status: 503,
        code: 'SERVICE_UNAVAILABLE',
        message: 'Service not ready.',
        details: { database: 'down' },
      });
    }
  },
};

export default healthController;
